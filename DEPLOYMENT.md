# OfficeRest Deployment Guide

The repository now ships with two Compose targets:

- `docker-compose.yml` – **local development** with hot-reload for backend + both frontends.
- `docker-compose.prod.yml` – **production-style build** identical to the previous stack.

Pick the scenario that matches what you're doing.

## Local Development (Hot Reload)

1. **Copy both environment templates:**
   ```bash
   cp backend/.env.example backend/.env
   cp .env.example .env
   ```

2. **Fill in secrets & local overrides:**
   ```bash
   # Backend/API secrets, SMTP, BASE_URL for uploads, etc.
   nano backend/.env

   # Optional overrides for BACKEND_HOST/ME_* that flow into dev containers
   nano .env
   ```

3. **Start the dev stack (installs dependencies on first run):**
   ```bash
   docker compose up --build
   ```

4. **Tail logs (optional):**
   ```bash
   docker compose logs -f
   ```

5. **Access the apps:**

| Service | URL (dev) |
|---------|-----------|
| User frontend (Vite) | http://localhost:5173 |
| Admin frontend (Vite) | http://localhost:5174 |
| Backend API | http://localhost:8000 |
| MongoDB | localhost:27017 |
| Mongo Express | http://localhost:8082 (basic auth from `.env`) |

Code changes on your machine are bind-mounted into each container, so hot reload works automatically. The first `docker compose up` downloads npm packages inside each container and caches them in named volumes.

## Production / Server Deployment

For a build-and-serve deployment (Nginx frontends, PM2-style backend), use the dedicated file:

```bash
cp backend/.env.example backend/.env
cp .env.example .env   # set BACKEND_HOST to the public URL

docker compose -f docker-compose.prod.yml up --build -d
docker compose -f docker-compose.prod.yml logs -f   # optional
```

All environment variables described below still apply.

## Server-Specific Configuration

### Local Development
```bash
BACKEND_HOST=http://localhost:8000
```

### Local Network (WiFi/LAN)
```bash
# Replace with your computer's IP address
BACKEND_HOST=http://192.168.1.100:8000
# or
BACKEND_HOST=http://172.16.49.163:8000
```

### VPS/Cloud Server
```bash
# Replace with your server's public IP or domain
BACKEND_HOST=http://your-server-ip:8000
```

### Production with Domain
```bash
BACKEND_HOST=https://api.yourcompany.com
```

## Environment Files

### Root `.env`

| Variable | Description | Example |
|----------|-------------|---------|
| `BACKEND_HOST` | API endpoint that gets baked into both frontends during the Docker build | `http://192.168.1.100:8000` |
| `ME_UI_USER` | Mongo Express basic-auth username | `admin` |
| `ME_UI_PASS` | Mongo Express basic-auth password | `changeme` |

### `backend/.env`

| Variable | Description |
|----------|-------------|
| `MONGO_URI` | API connection string (overridden to `mongodb://mongo:27017/REST` inside compose) |
| `PORT` | API listen port (exposed as `8000`) |
| `JWT_SECRET`, `ACCESS_TOKEN_SECRET`, `REFRESH_TOKEN_SECRET` | Token signing secrets |
| `ACCESS_TOKEN_EXPIRY`, `REFRESH_TOKEN_EXPIRY` | Lifetimes such as `6h` / `10d` |
| `CORS_*` | Comma-separated origins allowed to hit the API |
| `BASE_URL` | Absolute origin (e.g., `http://localhost:8000`) used to build upload URLs |
| `EMAIL_*` | SMTP settings for password reset emails |

### File Storage (Uploads)

- All user uploads (profile pictures, gallery images, etc.) are saved under `backend/uploads` inside the backend container. In **local development**, this folder is bind-mounted from your workstation, so files persist automatically.
- In **production Docker Compose**, the backend service mounts the named volume `backend_uploads` to `/app/uploads`, keeping files on the host even after redeploys. If you need to inspect or back up uploads, use `docker volume inspect backend_uploads` to find the host path.

## Services & Ports

| Service | Dev Port | Prod Port | Description |
|---------|----------|-----------|-------------|
| Frontend Admin | 5174 | 8081 | Admin panel |
| Frontend User | 5173 | 8080 | User interface |
| Backend API | 8000 | 8000 | REST API server |
| MongoDB | 27017 | 27017 | Database |
| Mongo Express | 8082 | 8082 | Simple UI for MongoDB (protected by basic auth) |

## Deployment Examples

### Example 1: Office Network (172.16.x.x)
```bash
echo "BACKEND_HOST=http://172.16.49.163:8000" > .env
echo "ME_UI_USER=admin" >> .env
echo "ME_UI_PASS=changeme" >> .env
docker compose up --build -d
```

### Example 2: Home Network (192.168.x.x)
```bash
echo "BACKEND_HOST=http://192.168.1.50:8000" > .env
echo "ME_UI_USER=admin" >> .env
echo "ME_UI_PASS=changeme" >> .env
docker compose up --build -d
```

### Example 3: Cloud Server
```bash
echo "BACKEND_HOST=https://api.example.com" > .env
docker compose up --build -d
```

## Accessing the Application

After deployment:
- **Local dev:** `http://localhost:5173` (user) and `http://localhost:5174` (admin)
- **Production:** `http://your-server-ip:8080` (user) and `http://your-server-ip:8081` (admin)
- **API:** `http://host-or-domain:8000`

## Troubleshooting

### CORS / Mixed Content
- Make sure `BACKEND_HOST` matches the URL you use in the browser (scheme, host, port).
- Include every frontend origin in `CORS_ORIGIN` and `USER_CORS_ORIGIN` inside `backend/.env`.

### Password Reset Emails
- Resets are now token-based and rely on SMTP. Verify the `EMAIL_*` values and that your provider allows SMTP access from the server.
- Check backend logs for `sendEmail` errors if messages are not delivered.

### Database Connection Issues
Ensure MongoDB (and Mongo Express if used) are running: `docker compose ps mongo mongo-express`

## Backup & Restore

### Backup Database
```bash
docker exec office_rest_mongo mongodump --db REST --out /backup
```

### Restore Database
```bash
docker exec office_rest_mongo mongorestore /backup/REST
```

## Notes
- OTP-based login has been removed. Users now authenticate directly with email + password, and password resets use short-lived email tokens.
- Rebuild `frontend-user` and `frontend-admin` (`docker compose build frontend-user frontend-admin`) whenever you change `BACKEND_HOST`.
