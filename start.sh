#!/bin/bash

# OfficeRest Application Startup Script
# This script helps you set up and run the OfficeRest application locally

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="$SCRIPT_DIR/backend"
ROOT_ENV="$SCRIPT_DIR/.env"
BACKEND_ENV="$BACKEND_DIR/.env"
FRONTEND_USER_DIR="$SCRIPT_DIR/frontend/user"
DUAL_CALENDAR_DOC="$SCRIPT_DIR/DATE_CALENDAR_IMPLEMENTATION.md"

# Function to print colored messages
print_info() {
    echo -e "${BLUE}ℹ${NC} $1"
}

print_success() {
    echo -e "${GREEN}✓${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to check prerequisites
check_prerequisites() {
    print_info "Checking prerequisites..."
    
    if ! command_exists docker; then
        print_error "Docker is not installed. Please install Docker first."
        exit 1
    fi
    
    if ! command_exists docker-compose && ! docker compose version >/dev/null 2>&1; then
        print_error "Docker Compose is not installed. Please install Docker Compose first."
        exit 1
    fi
    
    print_success "All prerequisites are installed"
}

# Function to generate random string
generate_secret() {
    openssl rand -hex 32 2>/dev/null || cat /dev/urandom | tr -dc 'a-zA-Z0-9' | fold -w 32 | head -n 1
}

# Function to create backend .env file
create_backend_env() {
    if [ -f "$BACKEND_ENV" ]; then
        print_warning "Backend .env file already exists at $BACKEND_ENV"
        read -p "Do you want to overwrite it? (y/N): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            print_info "Keeping existing backend .env file"
            return
        fi
    fi
    
    print_info "Creating backend .env file..."
    
    # Generate secrets
    JWT_SECRET=$(generate_secret)
    ACCESS_TOKEN_SECRET=$(generate_secret)
    REFRESH_TOKEN_SECRET=$(generate_secret)
    
    cat > "$BACKEND_ENV" << EOF
# MongoDB Connection (overridden by docker-compose in development)
MONGO_URI=mongodb://mongo:27017/REST

# Server Configuration
PORT=8000
NODE_ENV=development
BASE_URL=http://localhost:8000

# JWT Secrets (auto-generated)
JWT_SECRET=$JWT_SECRET
ACCESS_TOKEN_SECRET=$ACCESS_TOKEN_SECRET
REFRESH_TOKEN_SECRET=$REFRESH_TOKEN_SECRET

# Token Expiry
ACCESS_TOKEN_EXPIRY=6h
REFRESH_TOKEN_EXPIRY=10d

# CORS Configuration
CORS_ORIGIN=http://localhost:5174
USER_CORS_ORIGIN=http://localhost:5173
CORS_ORIGINS=http://localhost:5173,http://localhost:5174

# Email Configuration (for password reset)
# Update these with your SMTP credentials
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
EMAIL_FROM=noreply@officerest.com
EMAIL_FROM_NAME=OfficeRest
EOF
    
    print_success "Backend .env file created at $BACKEND_ENV"
    print_warning "Please update EMAIL_* variables in $BACKEND_ENV with your SMTP credentials"
}

# Function to create root .env file
create_root_env() {
    if [ -f "$ROOT_ENV" ]; then
        print_warning "Root .env file already exists at $ROOT_ENV"
        read -p "Do you want to overwrite it? (y/N): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            print_info "Keeping existing root .env file"
            return
        fi
    fi
    
    print_info "Creating root .env file..."
    
    cat > "$ROOT_ENV" << EOF
# Backend API URL (used by frontends)
BACKEND_HOST=http://localhost:8000

# Mongo Express credentials
ME_UI_USER=admin
ME_UI_PASS=changeme
EOF
    
    print_success "Root .env file created at $ROOT_ENV"
}

# Function to setup environment files
setup_env() {
    print_info "Setting up environment files..."
    create_backend_env
    create_root_env
    print_success "Environment files are ready!"
}

# Function to start the application
start_app() {
    print_info "Starting OfficeRest application..."
    
    # Check if .env files exist
    if [ ! -f "$BACKEND_ENV" ]; then
        print_warning "Backend .env file not found. Creating it..."
        create_backend_env
    fi
    
    if [ ! -f "$ROOT_ENV" ]; then
        print_warning "Root .env file not found. Creating it..."
        create_root_env
    fi
    
    # Start docker compose
    cd "$SCRIPT_DIR"
    print_info "Building and starting containers..."
    docker compose up --build -d
    
    print_success "Application is starting!"
    echo
    
    # Wait a moment for containers to initialize
    sleep 3
    
    # Register admin user automatically
    register_admin
    
    echo
    print_info "Services will be available at:"
    echo "  • User Frontend:    http://localhost:5173"
    echo "  • Admin Frontend:   http://localhost:5174"
    echo "  • Backend API:      http://localhost:8000"
    echo "  • Mongo Express:    http://localhost:8082"
    echo
    print_info "To view logs, run: $0 logs"
    print_info "To stop the app, run: $0 stop"
    show_dual_calendar_next_steps
}

# Function to stop the application
stop_app() {
    print_info "Stopping OfficeRest application..."
    cd "$SCRIPT_DIR"
    docker compose down
    print_success "Application stopped"
}

# Function to restart the application
restart_app() {
    print_info "Restarting OfficeRest application..."
    stop_app
    sleep 2
    start_app
}

# Function to show logs
show_logs() {
    cd "$SCRIPT_DIR"
    if [ -n "$1" ]; then
        docker compose logs -f "$1"
    else
        docker compose logs -f
    fi
}

# Function to wait for service to be ready
wait_for_service() {
    local service_name=$1
    local max_attempts=30
    local attempt=1
    
    print_info "Waiting for $service_name to be ready..."
    
    while [ $attempt -le $max_attempts ]; do
        if docker compose ps "$service_name" 2>/dev/null | grep -q "Up"; then
            # Additional check: wait a bit more for the service to actually be ready
            sleep 3
            print_success "$service_name is ready"
            return 0
        fi
        echo -n "."
        sleep 2
        attempt=$((attempt + 1))
    done
    
    print_warning "$service_name might not be fully ready yet"
    return 1
}

# Function to register admin user
register_admin() {
    print_info "Registering admin user..."
    
    cd "$SCRIPT_DIR"
    
    # Wait for backend and mongo to be ready
    wait_for_service "backend"
    wait_for_service "mongo"
    
    # Wait a bit more for MongoDB to be fully initialized
    sleep 5
    
    # Get the backend container name (from docker-compose.yml)
    BACKEND_CONTAINER="office_rest_backend"
    
    # Check if container is running
    if ! docker ps --format '{{.Names}}' | grep -q "^${BACKEND_CONTAINER}$"; then
        print_error "Backend container '$BACKEND_CONTAINER' is not running."
        print_info "Waiting a bit longer for container to start..."
        sleep 5
        if ! docker ps --format '{{.Names}}' | grep -q "^${BACKEND_CONTAINER}$"; then
            print_error "Backend container is still not running. Please check logs: $0 logs backend"
            return 1
        fi
    fi
    
    # Run the registerAdmin script
    print_info "Running admin registration script..."
    REGISTER_OUTPUT=$(docker exec "$BACKEND_CONTAINER" node registerAdmin.js 2>&1)
    REGISTER_EXIT_CODE=$?
    
    if [ $REGISTER_EXIT_CODE -eq 0 ]; then
        echo "$REGISTER_OUTPUT"
        print_success "Admin user registration completed"
        echo
        print_info "Admin credentials:"
        echo "  • Email:    restntcadmi@gmail.com"
        echo "  • Password: admin123"
        echo
        print_warning "Please change the admin password after first login!"
        return 0
    else
        # Check if admin already exists (this is actually fine)
        if echo "$REGISTER_OUTPUT" | grep -q "already exists"; then
            print_info "Admin user already exists (this is fine)"
        else
            echo "$REGISTER_OUTPUT"
            print_warning "Admin registration script encountered an issue"
        fi
        print_info "You can log in with:"
        echo "  • Email:    restntcadmi@gmail.com"
        echo "  • Password: admin123"
        return 0
    fi
}

# Function to remind about dual calendar setup
show_dual_calendar_next_steps() {
    if [ ! -f "$DUAL_CALENDAR_DOC" ]; then
        return
    fi

    echo
    print_info "Dual calendar support is ready to configure."
    echo "  • Install updated frontend dependencies: (cd \"$FRONTEND_USER_DIR\" && npm install)."
    echo "  • Review DATE_CALENDAR_IMPLEMENTATION.md for usage locations and examples."
    echo "  • Use the new date utilities (formatDualDate, parseDate, etc.) across forms and displays."
}

# Function to show status
show_status() {
    print_info "Checking application status..."
    cd "$SCRIPT_DIR"
    docker compose ps
}

# Function to show help
show_help() {
    cat << EOF
OfficeRest Application Management Script

Usage: $0 [COMMAND]

Commands:
  start       Start the application (default) - automatically registers admin user
  stop        Stop the application
  restart     Restart the application
  logs        Show logs (optionally specify service: backend, frontend-user, frontend-admin, mongo)
  status      Show container status
  setup       Setup environment files only
  register    Register admin user manually
  help        Show this help message

Examples:
  $0                    # Start the application
  $0 start              # Start the application
  $0 stop               # Stop the application
  $0 restart            # Restart the application
  $0 logs               # Show all logs
  $0 logs backend       # Show backend logs only
  $0 status             # Show container status
  $0 setup              # Setup environment files
  $0 register           # Register admin user manually

EOF
}

# Main script logic
main() {
    # Check prerequisites
    check_prerequisites
    
    # Parse command
    COMMAND=${1:-start}
    
    case "$COMMAND" in
        start)
            start_app
            ;;
        stop)
            stop_app
            ;;
        restart)
            restart_app
            ;;
        logs)
            show_logs "$2"
            ;;
        status)
            show_status
            ;;
        setup)
            setup_env
            ;;
        register)
            register_admin
            ;;
        help|--help|-h)
            show_help
            ;;
        *)
            print_error "Unknown command: $COMMAND"
            echo
            show_help
            exit 1
            ;;
    esac
}

# Run main function
main "$@"
