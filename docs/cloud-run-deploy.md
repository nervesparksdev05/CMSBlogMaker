# Deploy Backend to Google Cloud Run

**Project ID:** `mindmatrix-deployment-28-10-25`  
**Region:** `us-central1`

---

## One-time setup

```powershell
gcloud config set project mindmatrix-deployment-28-10-25
gcloud services enable run.googleapis.com artifactregistry.googleapis.com cloudbuild.googleapis.com
gcloud artifacts repositories create cms-blog --repository-format=docker --location=us-central1
```

---

## CMS Blog Maker backend (this repo)

From repo root (`CMSBlogMaker`):

```powershell
gcloud builds submit --tag us-central1-docker.pkg.dev/mindmatrix-deployment-28-10-25/cms-blog/cms-backend .\backend; gcloud run deploy cms-backend --image us-central1-docker.pkg.dev/mindmatrix-deployment-28-10-25/cms-blog/cms-backend --region us-central1 --platform managed --allow-unauthenticated --port 8000 --env-vars-file backend\.env
```

- **Image:** `us-central1-docker.pkg.dev/mindmatrix-deployment-28-10-25/cms-blog/cms-backend`
- **Service:** `cms-backend`
- **Env:** `backend\.env`

---

## Other backends (template)

Use the same project and region; change **repository**, **service name**, and **context** as needed.

| Variable    | Example (CMS)   | For another backend        |
|------------|------------------|----------------------------|
| `PROJECT`  | `mindmatrix-deployment-28-10-25` | same or different project |
| `REGION`   | `us-central1`    | same or different region   |
| `REPO`     | `cms-blog`       | e.g. `my-app`, `api-images` |
| `SERVICE`  | `cms-backend`     | e.g. `api-v2`, `worker`   |
| `CONTEXT`  | `.\backend`      | path to Dockerfile (e.g. `.\api`) |
| `ENV_FILE` | `backend\.env`   | path to env file           |

**Build and push:**

```powershell
gcloud builds submit --tag us-central1-docker.pkg.dev/mindmatrix-deployment-28-10-25/REPO/SERVICE CONTEXT
```

**Deploy:**

```powershell
gcloud run deploy SERVICE --image us-central1-docker.pkg.dev/mindmatrix-deployment-28-10-25/REPO/SERVICE --region us-central1 --platform managed --allow-unauthenticated --port 8000 --env-vars-file ENV_FILE
```

**One-liner (replace `REPO`, `SERVICE`, `CONTEXT`, `ENV_FILE`):**

```powershell
gcloud builds submit --tag us-central1-docker.pkg.dev/mindmatrix-deployment-28-10-25/REPO/SERVICE CONTEXT; gcloud run deploy SERVICE --image us-central1-docker.pkg.dev/mindmatrix-deployment-28-10-25/REPO/SERVICE --region us-central1 --platform managed --allow-unauthenticated --port 8000 --env-vars-file ENV_FILE
```

**Example – second backend `api-v2` in repo `my-apis`:**

```powershell
gcloud builds submit --tag us-central1-docker.pkg.dev/mindmatrix-deployment-28-10-25/my-apis/api-v2 .\api-v2; gcloud run deploy api-v2 --image us-central1-docker.pkg.dev/mindmatrix-deployment-28-10-25/my-apis/api-v2 --region us-central1 --platform managed --allow-unauthenticated --port 8000 --env-vars-file api-v2\.env
```

Create the Artifact Registry repo once per `REPO`:

```powershell
gcloud artifacts repositories create REPO --repository-format=docker --location=us-central1
```

---

## Env vars and secrets

- **Env file:** Use `--env-vars-file path\to\.env` (format: `KEY=VALUE` per line).
- **Secrets:** Use Secret Manager and `--set-secrets "KEY=secret-name:latest"`.
- **Mount JSON (e.g. Firebase):** Create secret, then deploy with `--set-secrets "/app/creds.json=secret-name:latest"` and set `FIREBASE_CREDENTIALS_PATH=/app/creds.json` in env.

---

## URLs

- **Console – Cloud Run:** https://console.cloud.google.com/run?project=mindmatrix-deployment-28-10-25  
- **Console – Artifact Registry:** https://console.cloud.google.com/artifacts?project=mindmatrix-deployment-28-10-25
