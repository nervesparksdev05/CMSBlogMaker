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
python -m venv venv
.\venv\Scripts\Activate.ps1
python -m pip install -U pip

2) Install dependencies
pip install -r requirements.txt

3) Create .env
Copy-Item .env.example .env

🔑 Environment Variables

Example .env:

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

If user signs up with email == ADMIN_EMAIL, they become admin.

▶️ Run the Server
python -m uvicorn main:app --reload --port 8000


Server: http://127.0.0.1:8000
Swagger UI: http://127.0.0.1:8000/docs

🍃 MongoDB Setup
✅ Option A: Local MongoDB (Windows service)
Get-Service MongoDB
Start-Service MongoDB


Verify:

Test-NetConnection localhost -Port 27017

✅ Option B: MongoDB Atlas
MONGODB_URI=mongodb+srv://<user>:<pass>@cluster.../cms_blog?retryWrites=true&w=majority
MONGODB_DB=cms_blog

🔐 Authentication (JWT)

For protected endpoints:

Authorization: Bearer <token>


Token comes from:

POST /auth/signup

POST /auth/login
