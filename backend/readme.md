
# 🚀 CMS Blog Backend (FastAPI + MongoDB + Gemini + Image Generation)

Production-ready backend for a multi-step **AI Blog Generator CMS**.

It supports:
- ✅ **JWT Authentication** (Signup/Login)
- ✅ **Role-based access** (Admin vs User)
- ✅ **AI generation flow** (always **5 options** per step)
- ✅ **Cover image generation** (single image) + upload
- ✅ **Blog publish workflow** (Saved → Pending → Published / Rejected)
- ✅ Stores only **Users + Final Blogs** in MongoDB

---

## ✨ Features

### 🔐 Authentication
- Signup/Login using JWT
- Admin role is assigned automatically based on `ADMIN_EMAIL`

### 🧠 AI Pipeline (Gemini)
Each step generates **exactly 5 options**, user selects one or manually types:
1. **Topic Ideas** (5)
2. **Titles** (5)
3. **Intro Paragraphs** (5)
4. **Outline Variants** (5)
5. **Image Prompts** (5)
6. **Final Blog Generation** (1 final blog)

### 🖼️ Cover Image
- Generate **1** image from selected prompt + aspect ratio + quality + color  
  **OR**
- Upload from device

### 📝 Preview (Side-by-side)
On preview:
- **HTML (left)**
- **Markdown (right)**

### ✅ Publish Workflow
- Blog saved as `saved`
- User requests publish → `pending`
- Admin approves → `published`
- Admin rejects → `rejected` with feedback

---

## 🧰 Tech Stack

| Layer | Tech |
|------|------|
| API | FastAPI |
| DB | MongoDB (motor) |
| Auth | JWT (`python-jose`) |
| Password Hashing | Argon2 (`argon2-cffi`) |
| AI | Gemini (`google-genai`) |
| Markdown to HTML | `markdown` |
| Server | Uvicorn |

---

## 📁 Project Structure

```text
backend/
  main.py
  requirements.txt
  README.md
  .env.example
  .env                 # local only (DO NOT COMMIT)
  uploads/             # generated/uploaded images
  app/
    __init__.py
    config.py
    db.py
    deps.py
    schemas.py
    security.py
    routers/
      __init__.py
      auth.py
      ai.py
      blogs.py
      admin.py
    services/
      __init__.py
      gemini_service.py
      image_service.py
      markdown_service.py
🗂️ File-by-File Explanation
Root Files
main.py
Creates FastAPI app

Adds CORS middleware

Mounts uploads/ at /uploads

Includes all routers (/auth, /ai, /blogs, /admin)

Runs init_indexes() on startup

requirements.txt
Pinned dependencies for consistent setup

.env.example
Template env file to copy into .env

uploads/
Stores generated and uploaded images

Served as: GET /uploads/<filename>

app/ Core
app/config.py
Reads environment variables using pydantic-settings

Exposes settings used across the app

app/db.py
MongoDB connection using motor

Exposes:

users_col

blogs_col

Creates indexes via init_indexes()

app/deps.py
Auth dependencies:

Extract & validate JWT from Authorization header

Fetch current user

Admin-only guard

app/schemas.py
All request/response models:

Auth schemas

AI inputs

Blog meta + final blog schemas

app/security.py
Argon2 password hashing

JWT token creation + decoding

app/routers/
routers/auth.py
Endpoints:

POST /auth/signup

POST /auth/login

Assigns admin role if email matches ADMIN_EMAIL.

routers/ai.py
AI endpoints:

POST /ai/ideas

POST /ai/titles

POST /ai/intros

POST /ai/outlines

POST /ai/image-prompts

POST /ai/image-generate

POST /ai/blog-generate

routers/blogs.py
Blog endpoints:

Save final blog

List saved blogs (table)

Request publish

Dashboard counts

Upload image

routers/admin.py
Admin moderation endpoints:

List blogs by status

Approve

Reject with feedback

app/services/
services/gemini_service.py
All Gemini text generation functions:

topic ideas, titles, intros, outlines, prompts, final blog

services/image_service.py
Cover image generation + save into uploads/

Returns public image URL

services/markdown_service.py
Converts markdown into HTML for preview

✅ Requirements
Python
Use:

✅ Python 3.11 (recommended)

✅ Python 3.10 also works

MongoDB
Local MongoDB or MongoDB Atlas

Default local URI: mongodb://localhost:27017

⚙️ Setup
1) Create Virtual Environment
powershell
Copy code
cd backend
