# Local Development Setup Guide

This guide will help you start the OfficeRest application locally.

## Prerequisites

- **Docker** and **Docker Compose** installed on your system
- OR **Node.js 18+** and **MongoDB** installed if running without Docker

## Option 1: Using Docker Compose (Recommended)

This is the easiest way to start the entire application stack.

### Step 1: Create Environment Files

Create the required environment files:

```bash
# Create backend environment file
cat > backend/.env << EOF
# MongoDB Connection (will be overridden by docker-compose)
MONGO_URI=mongodb://mongo:27017/REST

# Server Configuration
PORT=8000
NODE_ENV=development
BASE_URL=http://localhost:8000

# JWT Secrets (generate strong random strings)
JWT_SECRET=your-super-secret-jwt-key-change-this
ACCESS_TOKEN_SECRET=your-access-token-secret-change-this
REFRESH_TOKEN_SECRET=your-refresh-token-secret-change-this

# Token Expiry
ACCESS_TOKEN_EXPIRY=6h
REFRESH_TOKEN_EXPIRY=10d

# CORS Configuration
CORS_ORIGIN=http://localhost:5174
USER_CORS_ORIGIN=http://localhost:5173
CORS_ORIGINS=http://localhost:5173,http://localhost:5174

# Email Configuration (for password reset)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
EMAIL_FROM=noreply@officerest.com
EOF

# Create root environment file
cat > .env << EOF
# Backend API URL (used by frontends)
BACKEND_HOST=http://localhost:8000

# Mongo Express credentials
ME_UI_USER=admin
ME_UI_PASS=changeme
EOF
```

### Step 2: Start the Application

```bash
# Start all services
docker compose up --build
```

This will:
- Start MongoDB database
- Start Backend API server
- Start User Frontend (React)
- Start Admin Frontend (React)
- Start Mongo Express (database UI)

### Step 3: Access the Application

Once all services are running, you can access:

| Service | URL |
|---------|-----|
| **User Frontend** | http://localhost:5173 |
| **Admin Frontend** | http://localhost:5174 |
| **Backend API** | http://localhost:8000 |
| **Mongo Express** | http://localhost:8082 |

### Step 4: View Logs

```bash
# View all logs
docker compose logs -f

# View specific service logs
docker compose logs -f backend
docker compose logs -f frontend-user
docker compose logs -f frontend-admin
```

### Step 5: Stop the Application

```bash
# Stop all services
docker compose down

# Stop and remove volumes (clears database)
docker compose down -v
```

---

## Option 2: Manual Setup (Without Docker)

If you prefer to run services manually without Docker:

### Step 1: Install MongoDB

Install and start MongoDB locally:
```bash
# macOS (using Homebrew)
brew install mongodb-community
brew services start mongodb-community

# Or use MongoDB Atlas (cloud) and update MONGO_URI
```

### Step 2: Setup Backend

```bash
cd backend

# Install dependencies
npm install

# Create .env file
cat > .env << EOF
MONGO_URI=mongodb://localhost:27017/REST
PORT=8000
NODE_ENV=development
BASE_URL=http://localhost:8000
JWT_SECRET=your-super-secret-jwt-key-change-this
ACCESS_TOKEN_SECRET=your-access-token-secret-change-this
REFRESH_TOKEN_SECRET=your-refresh-token-secret-change-this
ACCESS_TOKEN_EXPIRY=6h
REFRESH_TOKEN_EXPIRY=10d
CORS_ORIGIN=http://localhost:5174
USER_CORS_ORIGIN=http://localhost:5173
CORS_ORIGINS=http://localhost:5173,http://localhost:5174
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
EMAIL_FROM=noreply@officerest.com
EOF

# Start backend server
npm run dev
```

Backend will run on: **http://localhost:8000**

### Step 3: Setup User Frontend

```bash
cd frontend/user

# Install dependencies
npm install

# Create .env file (if needed)
# Vite uses VITE_API_URL environment variable
export VITE_API_URL=http://localhost:8000

# Start development server
npm run dev
```

User frontend will run on: **http://localhost:5173**

### Step 4: Setup Admin Frontend

Open a new terminal:

```bash
cd frontend/admin

# Install dependencies
npm install

# Set API URL
export VITE_API_URL=http://localhost:8000

# Start development server
npm run dev
```

Admin frontend will run on: **http://localhost:5174**

---

## First Time Setup

### Register Admin User

After starting the backend, you may need to register an admin user. Check if there's a script:

```bash
cd backend
node registerAdmin.js
```

Or use the admin frontend to create an admin account.

---

## Troubleshooting

### Port Already in Use

If a port is already in use:

```bash
# Find process using port
lsof -i :8000  # Backend
lsof -i :5173  # User frontend
lsof -i :5174  # Admin frontend
lsof -i :27017 # MongoDB

# Kill the process
kill -9 <PID>
```

### Docker Issues

```bash
# Rebuild containers
docker compose up --build --force-recreate

# Remove all containers and volumes
docker compose down -v

# Check container status
docker compose ps
```

### MongoDB Connection Issues

- Ensure MongoDB is running: `docker compose ps mongo`
- Check MongoDB logs: `docker compose logs mongo`
- Verify MONGO_URI in `backend/.env`

### CORS Errors

- Ensure `CORS_ORIGIN` and `USER_CORS_ORIGIN` in `backend/.env` match your frontend URLs
- Check browser console for specific CORS errors
- Verify backend is running

---

## Development Tips

- **Hot Reload**: Both frontends and backend support hot reload in development mode
- **Database Access**: Use Mongo Express at http://localhost:8082 to view/edit database
- **API Testing**: Backend API is available at http://localhost:8000/api/v1/
- **Logs**: Use `docker compose logs -f` to monitor all services

---

## Environment Variables Reference

### Backend (.env)

| Variable | Description | Example |
|----------|-------------|---------|
| `MONGO_URI` | MongoDB connection string | `mongodb://localhost:27017/REST` |
| `PORT` | Backend server port | `8000` |
| `JWT_SECRET` | JWT signing secret | Random string |
| `ACCESS_TOKEN_SECRET` | Access token secret | Random string |
| `REFRESH_TOKEN_SECRET` | Refresh token secret | Random string |
| `CORS_ORIGIN` | Admin frontend origin | `http://localhost:5174` |
| `USER_CORS_ORIGIN` | User frontend origin | `http://localhost:5173` |
| `BASE_URL` | Base URL for file uploads | `http://localhost:8000` |
| `EMAIL_*` | SMTP email configuration | See email provider docs |

### Root (.env)

| Variable | Description | Example |
|----------|-------------|---------|
| `BACKEND_HOST` | Backend API URL | `http://localhost:8000` |
| `ME_UI_USER` | Mongo Express username | `admin` |
| `ME_UI_PASS` | Mongo Express password | `changeme` |

