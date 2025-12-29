# 🚀 CMS Blog Backend (FastAPI + MongoDB + Gemini + Image Generation)

A **production-ready FastAPI backend** for a multi-step **AI Blog Generator CMS**.

---

## 📌 Highlights

- ✅ **JWT Authentication** (Signup/Login)
- ✅ **Role-based access** (**Admin** vs **User**)
- ✅ **AI generation flow** with **exactly 5 options** at every step
- ✅ **Cover image generation** (1 final image) + device upload
- ✅ **Preview output**: **HTML + Markdown side-by-side**
- ✅ **Publishing workflow**: `saved → pending → published/rejected`
- ✅ MongoDB stores only:
  - `users`
  - `blogs` (final blog + final metadata)

---

## 🧰 Tech Stack

| Layer | Technology |
|------|------------|
| API | FastAPI |
| Database | MongoDB (Motor async driver) |
| Authentication | JWT (`python-jose`) |
| Password Hashing | Argon2 (`argon2-cffi`) |
| AI | Gemini (`google-genai`) |
| Markdown → HTML | `markdown` |
| Server | Uvicorn |

---

## ✅ Requirements

### Python
- ✅ Python **3.11** (recommended)
- ✅ Python 3.10 also supported

### MongoDB
- Local MongoDB or MongoDB Atlas
- Default local URI: `mongodb://localhost:27017`
- Database name: `cms_blog`

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

      ---

### 📌 Root

#### `main.py`
**Application entrypoint**
- Creates the FastAPI instance  
- Adds CORS middleware  
- Mounts `uploads/` folder at `/uploads`  
- Includes routers:
  - `/auth`
  - `/ai`
  - `/blogs`
  - `/admin`
- Runs `init_indexes()` at startup for MongoDB indexes  

#### `requirements.txt`
- Pinned dependencies for stable installs across machines.

#### `.env.example`
- Template for local environment variables.

#### `.env` *(local only)*
Contains secrets like:
- MongoDB URI  
- JWT secret  
- Gemini API key  

> ⚠️ Do not commit this file to GitHub.

#### `uploads/`
Stores:
- Generated cover images  
- Uploaded cover images  

Served via:
- `GET /uploads/<filename>`

---

## 🧠 `app/` (Core)

#### `app/config.py`
Loads env config using `pydantic-settings` and exposes `settings`:
- `MONGODB_URI`, `MONGODB_DB`
- `JWT_SECRET`, `JWT_EXPIRES_MINUTES`
- `ADMIN_EMAIL`
- `GEMINI_*`
- `CORS_ORIGINS`, `PUBLIC_BASE_URL`

#### `app/db.py`
MongoDB connection via Motor:
- Creates client and database reference
- Exposes collections:
  - `users_col`
  - `blogs_col`

`init_indexes()` creates:
- Unique email index for users
- Common blog indexes (`status`, `owner`, `created_at`)

#### `app/deps.py`
Authentication dependencies:
- Extract token from `Authorization: Bearer ...`
- Decode JWT and load user
- Guards:
  - `require_user`
  - `require_admin`

#### `app/schemas.py`
Pydantic schemas:
- **Auth schemas**: `SignupIn`, `LoginIn`, `TokenOut`
- **AI request schemas**: `TopicIdeasIn`, `TitlesIn`, `IntrosIn`, `OutlinesIn`, `ImagePromptsIn`, etc.
- **Blog schemas**:
  - `BlogMeta` (final selections only)
  - `FinalBlog` (markdown + html + render)
  - `BlogCreateIn` (store final)
  - `BlogOut`, `BlogListItem`

#### `app/security.py`
Security utilities:
- Argon2 hashing:
  - `hash_password`
  - `verify_password`
- JWT helpers:
  - `create_access_token`
  - `decode_token`

---

## 🌐 `app/routers/` (API Routes)

#### `routers/auth.py`
Auth endpoints:
- `POST /auth/signup`
- `POST /auth/login`

Role assignment:
- if `signup_email == ADMIN_EMAIL` → role = `admin`
- else → role = `user`

#### `routers/ai.py`
AI endpoints (Gemini):
- `POST /ai/ideas` → **5** topic ideas
- `POST /ai/titles` → **5** titles
- `POST /ai/intros` → **5** intros
- `POST /ai/outlines` → **5** outline variants
- `POST /ai/image-prompts` → **5** image prompts
- `POST /ai/image-generate` → **1** cover image
- `POST /ai/blog-generate` → final blog (**markdown + html**)

#### `routers/blogs.py`
Blog storage/workflow:
- `POST /blogs` → save final blog to DB
- `GET /blogs/mine` → list blogs for table
- `GET /blogs/{id}` → fetch one blog
- `POST /blogs/{id}/request-publish` → set status `pending`
- `GET /blogs/dashboard/stats` → dashboard card counts
- `POST /blogs/upload/image` → upload cover image

#### `routers/admin.py`
Admin-only moderation:
- `GET /admin/blogs?status=...`
- `POST /admin/blogs/{id}/approve`
- `POST /admin/blogs/{id}/reject?feedback=...`

---

## 🧩 `app/services/` (Business Logic)

#### `services/gemini_service.py`
All Gemini generation functions:
- topic ideas, titles, intros, outlines, image prompts, final blog markdown  
Responsible for consistent **“5 options”** behavior.

#### `services/image_service.py`
Cover image generation:
- Generates **1** image
- Stores in `uploads/`
- Returns accessible URL using `PUBLIC_BASE_URL`

#### `services/markdown_service.py`
Markdown conversion:
- Converts markdown → HTML
- Used for preview side-by-side output

---

# ⚙️ Setup (Windows PowerShell)

#  1) Go to backend folder
```powershell
cd backend

# Create and activate venv
```python -m venv venv
.\venv\Scripts\Activate.ps1
python -m pip install -U pip

# ENV

```APP_NAME=CMS Blog API
ENV=dev

MONGODB_URI=mongodb://localhost:27017
MONGODB_DB=cms_blog

JWT_SECRET=change-me
JWT_EXPIRES_MINUTES=10080

ADMIN_EMAIL=admin@company.com

CORS_ORIGINS=http://localhost:5173,http://127.0.0.1:5173
PUBLIC_BASE_URL=http://127.0.0.1:8000

GEMINI_API_KEY=your_key
GEMINI_TEXT_MODEL=gemini-2.5-flash
GEMINI_IMAGE_MODEL=gemini-2.5-flash-image

📌 Root
main.py — Application Entrypoint

Creates the FastAPI instance

Adds CORS middleware

Mounts uploads/ folder at /uploads

Includes routers:

/auth

/ai

/blogs

/admin

Runs init_indexes() at startup for MongoDB indexes

requirements.txt

Pinned dependencies for stable installs across machines.

.env.example

Template for local environment variables.

.env (local only)

Contains secrets like:

MongoDB URI

JWT secret

Gemini API key

⚠️ Do not commit this file to GitHub.

uploads/

Stores:

Generated cover images

Uploaded cover images

Served via:

GET /uploads/<filename>

🧠 app/ (Core)
app/config.py

Loads env config using pydantic-settings and exposes settings:

MONGODB_URI, MONGODB_DB

JWT_SECRET, JWT_EXPIRES_MINUTES

ADMIN_EMAIL

GEMINI_*

CORS_ORIGINS, PUBLIC_BASE_URL

app/db.py
