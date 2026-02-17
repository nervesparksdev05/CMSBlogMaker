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

# Cloud Run sets PORT; use it so the container listens on the expected port
ENV PORT=8000
CMD ["sh", "-c", "uvicorn main:app --host 0.0.0.0 --port ${PORT}"]
