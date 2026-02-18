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

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
