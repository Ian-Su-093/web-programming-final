#!/usr/bin/env bash

# Load variables from backend/.env if it exists
if [ -f backend/.env ]; then
  export $(grep -v '^#' backend/.env | xargs)
fi

# Generate new AUTH_SECRET_KEY
GENERATED_AUTH_SECRET_KEY=$(openssl rand -hex 32)
echo "Generated new AUTH_SECRET_KEY: $GENERATED_AUTH_SECRET_KEY"

# build the frontend
cd frontend
rm -rf node_modules
rm -rf dist
npm install
npm run build
cd ..

rm -rf backend/public/*
cp -r frontend/dist/* backend/public/

cd backend

# Submit build
gcloud builds submit --tag asia-east1-docker.pkg.dev/wp1141-finals/wpfinal/backend-fastapi:v1

# Deploy to Cloud Run with env vars
gcloud run deploy backend-service \
  --image asia-east1-docker.pkg.dev/wp1141-finals/wpfinal/backend-fastapi:v1 \
  --region asia-east1 \
  --update-env-vars LLM_API_KEY="$LLM_API_KEY" \
  --update-env-vars FIREBASE_PROJECT_ID="$FIREBASE_PROJECT_ID" \
  --update-env-vars FIRESTORE_HEALTH_COLLECTION="$FIRESTORE_HEALTH_COLLECTION" \
  --update-env-vars AUTH_SECRET_KEY="$GENERATED_AUTH_SECRET_KEY" \
  --update-env-vars GITHUB_CLIENT_ID="$GITHUB_CLIENT_ID" \
  --update-env-vars GITHUB_CLIENT_SECRET="$GITHUB_CLIENT_SECRET" \
  --update-env-vars GOOGLE_CLIENT_ID="$GOOGLE_CLIENT_ID" \
  --update-env-vars GOOGLE_CLIENT_SECRET="$GOOGLE_CLIENT_SECRET" \
  --update-env-vars GOOGLE_SERVER_METADATA_URL="$GOOGLE_SERVER_METADATA_URL" \
  --update-env-vars GITHUB_ACCESS_TOKEN_URL="$GITHUB_ACCESS_TOKEN_URL" \
  --update-env-vars GITHUB_AUTHORIZE_URL="$GITHUB_AUTHORIZE_URL" \
  --update-env-vars GITHUB_API_BASE_URL="$GITHUB_API_BASE_URL" \
  --update-env-vars GCS_BUCKET_NAME="$GCS_BUCKET_NAME" \
  --update-env-vars AGENT_BACKEND_URL="$AGENT_BACKEND_URL" \
  --update-env-vars FRONTEND_URL="$FRONTEND_URL" \
  --update-env-vars APP_ENV="$APP_ENV"


# Deploy hosting
firebase deploy --only hosting
