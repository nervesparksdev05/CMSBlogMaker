# CMS Blog Maker – Backend
# Python FastAPI + Uvicorn; env via .env or runtime env.

FROM python:3.12-slim

WORKDIR /app

# Install deps (no cache to keep image smaller)
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# App code
COPY . .

# Static uploads dir (main.py also makedirs at runtime)
RUN mkdir -p uploads

EXPOSE 8000

# Env: use --env-file .env when running, or pass -e / compose env_file
# Required: JWT_SECRET, ADMIN_EMAIL; GEMINI_API_KEY or OPENAI_API_KEY for AI
# Optional: FIREBASE_CREDENTIALS_PATH, GOOGLE_APPLICATION_CREDENTIALS (mount JSON in run)
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
