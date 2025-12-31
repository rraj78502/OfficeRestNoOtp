#!/usr/bin/env bash
set -euo pipefail

show_help() {
  cat <<'EOF'
Usage: setup-nginx.sh --domain rest.ntc.net.np --cert /etc/letsencrypt/live/rest.ntc.net.np/fullchain.pem --key /etc/letsencrypt/live/rest.ntc.net.np/privkey.pem [--config-name rest.ntc.net.np]

Automates copying the repository's nginx.conf template into /etc/nginx/sites-available,
updates certificate paths/server_name, enables the site, validates the config, and reloads nginx.

Required arguments:
  --domain        Public domain that should serve the OfficeRest apps (used for server_name).
  --cert          Absolute path to the SSL certificate (fullchain).
  --key           Absolute path to the SSL private key.

Optional arguments:
  --config-name   Filename used under /etc/nginx/sites-available (defaults to the domain value).
  -h, --help      Show this message.
EOF
}

DOMAIN=""
CERT_PATH=""
KEY_PATH=""
CONFIG_NAME=""

while [[ $# -gt 0 ]]; do
  case "$1" in
    --domain)
      DOMAIN="$2"
      shift 2
      ;;
    --cert)
      CERT_PATH="$2"
      shift 2
      ;;
    --key)
      KEY_PATH="$2"
      shift 2
      ;;
    --config-name)
      CONFIG_NAME="$2"
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

if [[ -z "$DOMAIN" || -z "$CERT_PATH" || -z "$KEY_PATH" ]]; then
  echo "Error: --domain, --cert, and --key are required." >&2
  show_help
  exit 1
fi

if [[ -z "$CONFIG_NAME" ]]; then
  CONFIG_NAME="$DOMAIN"
fi

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
SOURCE_CONF="$REPO_ROOT/nginx.conf"

if [[ ! -f "$SOURCE_CONF" ]]; then
  echo "Error: $SOURCE_CONF not found." >&2
  exit 1
fi

TARGET_AVAILABLE="/etc/nginx/sites-available/$CONFIG_NAME"
TARGET_ENABLED="/etc/nginx/sites-enabled/$CONFIG_NAME"

if [[ "$EUID" -ne 0 ]]; then
  SUDO="sudo"
else
  SUDO=""
fi

echo "Copying nginx.conf to $TARGET_AVAILABLE"
$SUDO cp "$SOURCE_CONF" "$TARGET_AVAILABLE"

echo "Updating domain and certificate paths in $TARGET_AVAILABLE"
$SUDO python3 - "$TARGET_AVAILABLE" "$DOMAIN" "$CERT_PATH" "$KEY_PATH" <<'PY'
import pathlib
import sys

path = pathlib.Path(sys.argv[1])
domain, cert, key = sys.argv[2:5]
data = path.read_text()
replacements = {
    "server_name rest.ntc.net.np;": f"server_name {domain};",
    "ssl_certificate /path/to/your/certificate.crt;": f"ssl_certificate {cert};",
    "ssl_certificate_key /path/to/your/private.key;": f"ssl_certificate_key {key};",
}
for old, new in replacements.items():
    data = data.replace(old, new)
path.write_text(data)
PY

echo "Enabling nginx site $CONFIG_NAME"
if [[ -L "$TARGET_ENABLED" ]]; then
  $SUDO rm "$TARGET_ENABLED"
fi
$SUDO ln -s "$TARGET_AVAILABLE" "$TARGET_ENABLED"

echo "Testing nginx configuration"
$SUDO nginx -t

echo "Reloading nginx"
$SUDO systemctl reload nginx

echo "Nginx configuration for $DOMAIN deployed successfully."
