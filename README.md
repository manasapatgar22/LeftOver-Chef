# Leftover Chef: AI Smart Recipe Generator for Food Waste Reduction

Leftover Chef is an interactive, full-stack AI web application engineered to eliminate kitchen food waste. Users track, scan, and input leftover ingredients from their fridge or pantry; Google Gemini AI analyzes the inventory and crafts zero-waste recipes tailored to user cuisine preferences, dietary requirements, and strict food allergy constraints.

---

## Architecture Overview

- **Frontend**: React 18, TypeScript, Tailwind CSS, Lucide Icons, Canvas Confetti.
- **Backend**: Node.js & Express API proxy server (`server.ts`) hosting secure endpoints:
  - `POST /api/recipes/generate`: Gemini AI recipe formulation with resilient model fallback ladder (`gemini-3.6-flash` → `gemini-3.1-flash-lite` → `gemini-flash-latest` → `gemini-3.7-flash`).
  - `POST /api/ingredients/scan`: Multimodal Gemini Vision food ingredient recognition from uploaded images.
- **Data & Security**:
  - **Firebase Authentication**: Email/Password and Google OAuth federated sign-in.
  - **Cloud Firestore**: Real-time user inventory, saved recipes, generation history, and food waste reduction impact metrics.
  - **Owner-Bound Security Rules**: Strict path isolation ensuring zero cross-tenant data leaks.

---

## 1. Environment & Prerequisites

1. **Google Cloud Project**: An active GCP project with billing enabled.
2. **Google Cloud SDK (`gcloud` CLI)**: Installed and authenticated (`gcloud auth login`).
3. **Enable Required Google Cloud APIs**:
   ```bash
   gcloud services enable \
     run.googleapis.com \
     secretmanager.googleapis.com \
     firestore.googleapis.com \
     cloudbuild.googleapis.com \
     artifactregistry.googleapis.com
   ```

---

## 2. Secret Management & Zero-Hardcoding Setup

Store your Gemini API key in Google Cloud Secret Manager to prevent client-side credential exposure:

```bash
# 1. Create the secret in Secret Manager
gcloud secrets create GEMINI_API_KEY --replication-policy="automatic"

# 2. Add your Gemini API Key as the secret payload
echo -n "YOUR_GEMINI_API_KEY" | gcloud secrets versions add GEMINI_API_KEY --data-file=-

# 3. Grant the Cloud Run compute service account access to read the secret
PROJECT_NUMBER=$(gcloud projects describe $(gcloud config get-value project) --format="value(projectNumber)")

gcloud secrets add-iam-policy-binding GEMINI_API_KEY \
  --member="serviceAccount:${PROJECT_NUMBER}-compute@developer.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor"
```

---

## 3. Database Security Configuration (Cloud Firestore)

Deploy the owner-bound security rules to ensure user data isolation:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Isolated User Profile & Sub-collections
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;

      match /leftovers/{leftoverId} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }

      match /savedRecipes/{recipeId} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }

      match /recipeHistory/{historyId} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }

      match /stats/{statId} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }
    }

    // Default deny all other paths
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

Deploy rules using Firebase CLI:
```bash
firebase deploy --only firestore:rules
```

---

## 4. Local Development

```bash
# Install dependencies
npm install

# Start development full-stack server (binds Express API + Vite on port 3000)
npm run dev
```

Visit `http://localhost:3000` to interact with Leftover Chef.

---

## 5. Google Cloud Run Deployment Flow

Build and deploy Leftover Chef as a fully containerized service to Google Cloud Run:

```bash
# Deploy to Cloud Run mounting Secret Manager
gcloud run deploy leftover-chef \
  --source . \
  --region us-central1 \
  --platform managed \
  --allow-unauthenticated \
  --port 3000 \
  --set-secrets="GEMINI_API_KEY=GEMINI_API_KEY:latest"
```

### Required Campaign Labeling

Apply the mandatory challenge verification label to your Cloud Run deployment:

```bash
gcloud run services update leftover-chef \
  --update-labels=dev-tutorial=cloud-run-ai-challenge \
  --region=us-central1
```

---

## 6. Threat Model Summary Table

| Threat Zone | Identified Vector | Countermeasure Implemented |
| :--- | :--- | :--- |
| **Input Surfaces** | Malicious input payloads, oversized base64 images | Schema sanitation in Express routes, strict image data URL verification, null-safe payload destructuring. |
| **Planning & Reasoning** | Prompt injection via food ingredient names | Input sanitization to strip non-food text, forced JSON-only schema formatting in Gemini prompts. |
| **Tool Execution** | API endpoint abuse / DoS | Model fallback ladder with error recovery matrix (`503`, `429`, `404`) and rate-safe error boundaries. |
| **Memory & State** | Cross-user data snooping in Firestore | Strict owner-bound rules (`request.auth.uid == userId`) prohibiting unauthorized read/write access. |
| **Inter-System Comm** | API key leaks in client browser bundles | Strict full-stack Express proxy keeping `GEMINI_API_KEY` exclusively on the backend server. |
