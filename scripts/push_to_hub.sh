#!/bin/bash

# Check if username is provided
if [ -z "$1" ]; then
  echo "Usage: ./scripts/push_to_hub.sh <dockerhub_username>"
  exit 1
fi

HUB_USER=$1

echo "Building images..."
docker-compose -f docker-compose.prod.yml build

echo "Tagging and Pushing Backend..."
docker tag office_rest_backend:latest $HUB_USER/officerest-backend:latest
docker push $HUB_USER/officerest-backend:latest

echo "Tagging and Pushing Frontend User..."
docker tag office_rest_frontend_user:latest $HUB_USER/officerest-frontend-user:latest
docker push $HUB_USER/officerest-frontend-user:latest

echo "Tagging and Pushing Frontend Admin..."
docker tag office_rest_frontend_admin:latest $HUB_USER/officerest-frontend-admin:latest
docker push $HUB_USER/officerest-frontend-admin:latest

echo "Done! Images are now on Docker Hub."
