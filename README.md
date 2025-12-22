# Web Programming Final Project

This project is a web application built with a React frontend and a FastAPI backend, deployed using Docker and Google Cloud Run.

## Deploy Link

https://wp1141-finals.web.app/

## Project Structure

- `frontend/`: React + TypeScript + Vite application
- `backend/`: FastAPI application with Python 3.12
- `deploy.sh`: Script for deploying to Google Cloud Run (production)

## Local Development & Deployment

**Note:** We strongly recommend testing the live deployed version rather than running locally, as the application requires significant environment configuration (Google OAuth, GitHub OAuth, Firebase credentials, LLM keys, etc.).

However, if you need to run the application locally, please follow these steps.

### Prerequisites

- Node.js (v18+)
- Python 3.12+
- Docker (optional, but recommended for backend)
- Google Cloud Service Account JSON (for Firebase/Firestore access)

### 1. Environment Configuration

You must configure environment variables for both frontend and backend.

**Backend:**
1. Navigate to `backend/` directory.
2. Copy `.env.example` to `.env`.
3. Fill in **ALL** required fields in `.env`.
   - You will need a valid Firebase Service Account JSON file path for `FIREBASE_CREDENTIALS_FILE`.
   - OAuth keys (Google/GitHub) are required for login to work.

**Frontend:**
1. Navigate to `frontend/` directory.
2. Copy `.env.example` to `.env`.
3. Set `VITE_API_URL` to point to your local backend (usually `http://localhost:8080/api/v1`).

### 2. Start the Backend

You can run the backend directly with Python or via Docker.

**Option A: Using Python (Direct)**
```bash
cd backend
pip install -r requirements.txt
python scripts/run_app.py
# Server runs at http://localhost:8080
```

**Option B: Using Docker (Recommended)**
```bash
cd backend
docker build -t wp-backend .
docker run -p 8080:8080 --env-file .env -v /path/to/your/firebase-credentials.json:/app/credentials.json wp-backend
```
*Note: You may need to adjust the volume mount `-v` to correctly map your local service account JSON into the container if your `.env` points to a file path.*

### 3. Start the Frontend

```bash
cd frontend
npm install
npm run dev
# App runs at http://localhost:5173
```

## Production Deployment

We use Cloud Run for the backend and Firebase Hosting for the frontend.

The `deploy.sh` script handles the full production deployment process:
1. Builds the frontend (Vite).
2. Copies static assets to the backend's public folder.
3. Builds and pushes the backend Docker image to Google Artifact Registry.
4. Deploys the container to Cloud Run.
5. Deploys Firebase Hosting rules.

```bash
./deploy.sh
```

*Note: You must have `gcloud` and `firebase` CLI tools installed and authenticated before running the deploy script.*
