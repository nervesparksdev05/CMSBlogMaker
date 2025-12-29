
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
=======
🚀 CMS Blog Backend (FastAPI + MongoDB + Gemini + Image Generation)

A production-ready backend for a multi-step AI Blog Generator workflow:

✅ Role-based Auth (User/Admin)
✅ AI generates 5 options per step (ideas, titles, intros, outlines, image prompts)
✅ Generates final Markdown + HTML preview
✅ Image generation (AI) + Upload support
✅ Blog publish approval workflow (Admin approval / rejection with feedback)
✅ Stores only users + blogs in MongoDB

✨ Features
🔐 Authentication & Roles

Signup / Login using JWT

Admin role auto-assigned if signup email matches ADMIN_EMAIL

🧠 AI Blog Creation Flow (Gemini)

Each step returns exactly 5 options and user selects 1 (or types manually):

Topic Ideas (5)

Titles (5)

Intro Paragraphs (5)

Outlines (5 variants)

Image Prompts (5)

Final Blog Generate → Markdown + HTML

🖼️ Image Flow

Generate 1 cover image using AI (Gemini Image / Nano Banana style integration)

Or upload image from device

Images are saved to uploads/ and served via /uploads/...

✅ Blog Workflow

Save final blog → saved

Request publish → pending

Admin:

✅ Approve → published

❌ Reject → rejected + feedback

🧰 Tech Stack

FastAPI

MongoDB via motor

JWT via python-jose

Password hashing: Argon2 (argon2-cffi) — supports long passwords

Gemini SDK: google-genai

Markdown → HTML: markdown

📦 Project Structure
backend/
│── main.py
│── requirements.txt
│── README.md
│── .env.example
│── .env                # local only (do not commit)
│
├── uploads/             # generated/uploaded images
│
└── app/
    │── __init__.py
    │── config.py
    │── db.py
    │── deps.py
    │── schemas.py
    │── security.py
    │
    ├── routers/
    │   │── __init__.py
    │   │── auth.py
    │   │── ai.py
    │   │── blogs.py
    │   └── admin.py
    │
    └── services/
        │── __init__.py
        │── gemini_service.py
        │── image_service.py
        └── markdown_service.py


🗂️ File Guide (What each file does)
File	Purpose
main.py	Creates app, mounts /uploads, adds CORS, registers routers, runs DB index init
requirements.txt	Dependency list for backend
.env.example	Template environment config
uploads/	Stores generated/uploaded cover images
app/config.py	Loads env settings (Mongo URI, JWT secret, Gemini keys etc.)
app/db.py	Mongo client + collections + init_indexes()
app/deps.py	Auth dependencies (get_current_user, require_admin)
app/schemas.py	All Pydantic models (Auth, AI Inputs, Blog Models, Responses)
app/security.py	Argon2 hashing + JWT helpers
routers/auth.py	Signup/Login + role assignment
routers/ai.py	AI endpoints (ideas/titles/intros/outlines/image prompts/final blog)
routers/blogs.py	Save blog, list, stats, request publish, upload image
routers/admin.py	Admin approval/reject endpoints
services/gemini_service.py	Calls Gemini and returns 5 options/final markdown
services/image_service.py	Generates and saves image to /uploads
services/markdown_service.py	Converts markdown → HTML
✅ Requirements
🐍 Python

Recommended: Python 3.11

Also works: 3.10

🍃 MongoDB

Local MongoDB OR MongoDB Atlas

Default local URI: mongodb://localhost:27017

DB name: cms_blog

⚙️ Setup (Windows / PowerShell)
1) Create virtual environment
>>>>>>> 7cc760b586db7fdc36dcd65ea605eee543a77005
python -m venv venv
.\venv\Scripts\Activate.ps1
python -m pip install -U pip
2) Install Dependencies
powershell
Copy code
pip install -r requirements.txt
3) Create .env
<<<<<<< HEAD
powershell
Copy code
Copy-Item .env.example .env
🔑 Environment Variables
=======
Copy-Item .env.example .env

🔑 Environment Variables

>>>>>>> 7cc760b586db7fdc36dcd65ea605eee543a77005
Example .env:

env
Copy code
APP_NAME=CMS Blog API
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
👑 Admin Role Rule
If email == ADMIN_EMAIL, the user becomes admin.

<<<<<<< HEAD
▶️ Run Server
powershell
Copy code
=======
👑 Admin Role Rule

If user signs up with email == ADMIN_EMAIL, they become admin.

▶️ Run the Server
>>>>>>> 7cc760b586db7fdc36dcd65ea605eee543a77005
python -m uvicorn main:app --reload --port 8000
API: http://127.0.0.1:8000

Swagger: http://127.0.0.1:8000/docs

<<<<<<< HEAD
🗄️ MongoDB Setup
Option A: Local MongoDB
Start (Windows Service):

powershell
Copy code
=======
Server: http://127.0.0.1:8000
Swagger UI: http://127.0.0.1:8000/docs

🍃 MongoDB Setup
✅ Option A: Local MongoDB (Windows service)
>>>>>>> 7cc760b586db7fdc36dcd65ea605eee543a77005
Get-Service MongoDB
Start-Service MongoDB
Verify:

<<<<<<< HEAD
powershell
Copy code
Test-NetConnection localhost -Port 27017
Option B: MongoDB Atlas
Update .env:

env
Copy code
=======

Verify:

Test-NetConnection localhost -Port 27017

✅ Option B: MongoDB Atlas
>>>>>>> 7cc760b586db7fdc36dcd65ea605eee543a77005
MONGODB_URI=mongodb+srv://<user>:<pass>@cluster.../cms_blog?retryWrites=true&w=majority
MONGODB_DB=cms_blog
🔐 Authentication (JWT)
Protected endpoints require:

<<<<<<< HEAD
text
Copy code
Authorization: Bearer <token>
Token is returned by:

POST /auth/signup

POST /auth/login
=======
🔐 Authentication (JWT)

For protected endpoints:

Authorization: Bearer <token>


Token comes from:

POST /auth/signup

POST /auth/login
>>>>>>> 7cc760b586db7fdc36dcd65ea605eee543a77005
