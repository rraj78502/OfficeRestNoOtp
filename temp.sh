#!/usr/bin/env bash
set -euo pipefail

show_help() {
  cat <<'EOF'
Usage: ./temp.sh --base-url https://rest.ntc.net.np [--mongo-patch] [--docker-compose docker-compose.prod.yml]

Updates backend/.env with the provided BASE_URL, restarts the backend service via docker compose,
and optionally rewrites existing carousel image URLs in MongoDB to match the new BASE_URL.

Options:
  --base-url URL        Required. Public origin that should prefix uploaded file URLs.
  --mongo-patch         Optional. Run an in-place Mongo query to replace old BASE_URL values
                        inside the REST database's carousels collection.
  --docker-compose FILE Optional. Compose file to use when restarting backend
                        (defaults to docker-compose.prod.yml).
  -h, --help            Show this help text.

Environment overrides:
  MONGO_URI    Mongo connection string (defaults to mongodb://localhost:27017/REST).
  MONGO_BIN    mongo client command (defaults to 'mongo').
EOF
}

BASE_URL=""
PATCH_MONGO=false
COMPOSE_FILE="docker-compose.prod.yml"

while [[ $# -gt 0 ]]; do
  case "$1" in
    --base-url)
      BASE_URL="$2"
      shift 2
      ;;
    --mongo-patch)
      PATCH_MONGO=true
      shift
      ;;
    --docker-compose)
      COMPOSE_FILE="$2"
      shift 2
      ;;
    -h|--help)
      show_help
      exit 0
      ;;
    *)
      echo "Unknown argument: $1" >&2
      show_help
      exit 1
      ;;
  esac
done

if [[ -z "$BASE_URL" ]]; then
  echo "Error: --base-url is required." >&2
  show_help
  exit 1
fi

ENV_FILE="backend/.env"
if [[ ! -f "$ENV_FILE" ]]; then
  echo "Error: $ENV_FILE not found. Run this from the repo root." >&2
  exit 1
fi

echo "Updating BASE_URL in $ENV_FILE"
if grep -q '^BASE_URL=' "$ENV_FILE"; then
  # Use tmp file to avoid sed -i differences
  tmp_file="$(mktemp)"
  awk -v new_val="$BASE_URL" '
    BEGIN{updated=0}
    /^BASE_URL=/{
      print "BASE_URL=" new_val
      updated=1
      next
    }
    {print}
    END{
      if(!updated){
        print "BASE_URL=" new_val
      }
    }' "$ENV_FILE" > "$tmp_file"
  mv "$tmp_file" "$ENV_FILE"
else
  echo "BASE_URL=$BASE_URL" >> "$ENV_FILE"
fi

echo "Restarting backend container using $COMPOSE_FILE"
docker compose -f "$COMPOSE_FILE" restart backend

if $PATCH_MONGO; then
  MONGO_URI_DEFAULT="mongodb://localhost:27017/REST"
  MONGO_URI="${MONGO_URI:-$MONGO_URI_DEFAULT}"
  MONGO_BIN="${MONGO_BIN:-mongo}"
  echo "Patching carousel image URLs in MongoDB ($MONGO_URI)"
  tmp_js="$(mktemp)"
  cat > "$tmp_js" <<'MONGO'
const newBase = (typeof NEW_BASE !== 'undefined' && NEW_BASE) ? NEW_BASE : '';
if (!newBase) {
  print('NEW_BASE not provided to mongo shell; set NEW_BASE when invoking.');
  quit(1);
}
const findOldBase = /^http:\/\/localhost:8000/;
const cursor = db.carousels.find({ "images.url": findOldBase });
let updated = 0;
cursor.forEach(doc => {
  let changed = false;
  const newImages = doc.images.map(img => {
    if (findOldBase.test(img.url)) {
      changed = true;
      return { ...img, url: img.url.replace(findOldBase, newBase) };
    }
    return img;
  });
  if (changed) {
    db.carousels.updateOne({ _id: doc._id }, { $set: { images: newImages } });
    updated += 1;
  }
});
print(`Patched ${updated} carousel document(s).`);
MONGO
  NEW_BASE="$BASE_URL" "$MONGO_BIN" "$MONGO_URI" --quiet "$tmp_js"
  rm -f "$tmp_js"
fi

echo "Done. Verify carousel images now use $BASE_URL/uploads/..."
