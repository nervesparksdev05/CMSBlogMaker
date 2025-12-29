Backend (FastAPI + MongoDB + Gemini + Image Generation)

This backend powers the CMS blog generator flow:

Auth: Signup/Login (JWT)

Role-based access: Admin vs User

AI steps (Gemini):

Generate 5 topic ideas

Generate 5 titles

Generate 5 intros

Generate 5 outline variants

Generate 5 image prompts

Generate final blog (Markdown + HTML)

Image generation:

Generate 1 cover image (Gemini Image / “Nano Banana style” integration)

Or upload from device

Blog workflow:

Save final blog to MongoDB (saved)

Request publish (pending)

Admin approves → published OR rejects → rejected with feedback

MongoDB stores only:

users

blogs (final blog + metadata)

Tech Stack

FastAPI

MongoDB via motor

JWT via python-jose

Password hashing: Argon2 (argon2-cffi) (supports long passwords)

Gemini (text + image) via google-genai

Markdown → HTML via markdown

Folder Structure
backend/
  main.py
  requirements.txt
  .env                # create locally (not committed)
  .env.example
  uploads/            # stored generated/uploaded images
  app/
    config.py         # env settings
    db.py             # mongo connection + collections + indexes
    deps.py           # auth dependencies (current user + admin guard)
    schemas.py        # pydantic schemas
    security.py       # password hashing + jwt helpers
    routers/
      auth.py         # signup/login
      ai.py           # all ai endpoints
      blogs.py        # save/list/get/request-publish + dashboard stats + upload image
      admin.py        # admin approvals/rejections
    services/
      gemini_service.py     # all gemini text generation
      image_service.py      # image generation + local save to uploads
      markdown_service.py   # markdown->html

Requirements
Python

Use Python 3.11 (recommended) or 3.10.

MongoDB

You need MongoDB running locally OR Atlas.

Local default: mongodb://localhost:27017

Database name: cms_blog

Setup
1) Create virtual environment

From backend/:

PowerShell

python -m venv venv
.\venv\Scripts\Activate.ps1
python -m pip install -U pip

2) Install dependencies
pip install -r requirements.txt

3) Create .env

Copy example:

Copy-Item .env.example .env


Edit .env and set values.

Environment Variables

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

Admin role rule

If a user signs up with email equal to ADMIN_EMAIL, they get role admin. Otherwise role is user.

Run the Server

From backend/ (venv activated):

python -m uvicorn main:app --reload --port 8000


Server URL:

http://127.0.0.1:8000

Docs:

Swagger UI: http://127.0.0.1:8000/docs

MongoDB Setup
Option A: Local MongoDB

Start MongoDB (one of these ways):

If running as Windows service:

Get-Service MongoDB
Start-Service MongoDB


Verify port open:

Test-NetConnection localhost -Port 27017

Option B: MongoDB Atlas

Set .env:

MONGODB_URI=mongodb+srv://<user>:<pass>@cluster.../cms_blog?retryWrites=true&w=majority
MONGODB_DB=cms_blog

Authentication (JWT)

All protected endpoints require header:

Authorization: Bearer <token>


Token is returned from:

POST /auth/signup

POST /auth/login

API Overview
Health

GET /health

Auth

POST /auth/signup

POST /auth/login

AI (always returns 5 options where applicable)

POST /ai/ideas

POST /ai/titles

POST /ai/intros

POST /ai/outlines (5 variants; each contains an outline array)

POST /ai/image-prompts

POST /ai/image-generate (returns 1 image url)

POST /ai/blog-generate (returns final markdown + html)

Blogs

POST /blogs (save final blog to MongoDB)

GET /blogs/mine (saved blogs list)

GET /blogs/{id} (single blog with final blog + meta)

POST /blogs/{id}/request-publish (sets status pending)

GET /blogs/dashboard/stats (counts for dashboard cards)

POST /blogs/upload/image (upload local image file)

Admin (admin token only)

GET /admin/blogs?status=pending|saved|published|rejected

POST /admin/blogs/{id}/approve

POST /admin/blogs/{id}/reject?feedback=...

Postman Testing (Direct, no environment variables)

Base URL: http://127.0.0.1:8000

1) Signup (User)

POST /auth/signup

{
  "name": "Test User",
  "email": "user1@gmail.com",
  "password": "very-very-long-password-is-ok-now"
}


Copy access_token.

2) Dashboard Stats

GET /blogs/dashboard/stats
Header:
Authorization: Bearer <USER_TOKEN>

3) AI Ideas (5)

POST /ai/ideas

{
  "focus_or_niche": "AI for healthcare beginners",
  "targeted_keyword": "AI in healthcare",
  "targeted_audience": "Students",
  "reference_links": "https://www.who.int, https://www.nih.gov",
  "tone": "Informative",
  "creativity": "High"
}


Pick one from options[].

4) AI Titles (5)

POST /ai/titles

{
  "tone": "Informative",
  "creativity": "High",
  "focus_or_niche": "AI for healthcare beginners",
  "targeted_keyword": "AI in healthcare",
  "targeted_audience": "Students",
  "reference_links": "https://www.who.int, https://www.nih.gov",
  "selected_idea": "PASTE_ONE_IDEA"
}


Pick one title.

5) AI Intros (5)

POST /ai/intros

{
  "tone": "Informative",
  "creativity": "High",
  "focus_or_niche": "AI for healthcare beginners",
  "targeted_keyword": "AI in healthcare",
  "targeted_audience": "Students",
  "reference_links": "https://www.who.int, https://www.nih.gov",
  "selected_idea": "PASTE_SELECTED_IDEA",
  "title": "PASTE_SELECTED_TITLE"
}


Pick one intro (markdown).

6) AI Outlines (5 variants)

POST /ai/outlines

{
  "tone": "Informative",
  "creativity": "High",
  "focus_or_niche": "AI for healthcare beginners",
  "targeted_keyword": "AI in healthcare",
  "targeted_audience": "Students",
  "reference_links": "https://www.who.int, https://www.nih.gov",
  "selected_idea": "PASTE_SELECTED_IDEA",
  "title": "PASTE_SELECTED_TITLE",
  "intro_md": "PASTE_SELECTED_INTRO_MD"
}


Pick one outline array.

7) AI Image Prompts (5)

POST /ai/image-prompts

{
  "tone": "Informative",
  "creativity": "High",
  "focus_or_niche": "AI for healthcare beginners",
  "targeted_keyword": "AI in healthcare",
  "targeted_audience": "Students",
  "reference_links": "https://www.who.int, https://www.nih.gov",
  "selected_idea": "PASTE_SELECTED_IDEA",
  "title": "PASTE_SELECTED_TITLE"
}


Pick one image prompt.

8) Generate Image (1)

POST /ai/image-generate

{
  "tone": "Informative",
  "creativity": "High",
  "focus_or_niche": "AI for healthcare beginners",
  "targeted_keyword": "AI in healthcare",
  "selected_idea": "PASTE_SELECTED_IDEA",
  "title": "PASTE_SELECTED_TITLE",
  "prompt": "PASTE_SELECTED_IMAGE_PROMPT",
  "aspect_ratio": "4:3",
  "quality": "high",
  "primary_color": "#4443E4"
}


Copy image_url.

9) Generate Final Blog (preview HTML + Markdown)

POST /ai/blog-generate

{
  "tone": "Informative",
  "creativity": "High",
  "focus_or_niche": "AI for healthcare beginners",
  "targeted_keyword": "AI in healthcare",
  "targeted_audience": "Students",
  "reference_links": "https://www.who.int, https://www.nih.gov",
  "selected_idea": "PASTE_SELECTED_IDEA",
  "title": "PASTE_SELECTED_TITLE",
  "intro_md": "PASTE_SELECTED_INTRO_MD",
  "outline": ["PASTE", "OUTLINE", "ARRAY"],
  "cover_image_url": "PASTE_IMAGE_URL"
}


Response contains:

markdown

html

10) Save Blog to DB

POST /blogs
Header:
Authorization: Bearer <USER_TOKEN>

Body:

{
  "meta": {
    "language": "English",
    "tone": "Informative",
    "creativity": "High",
    "focus_or_niche": "AI for healthcare beginners",
    "targeted_keyword": "AI in healthcare",
    "targeted_audience": "Students",
    "reference_links": "https://www.who.int, https://www.nih.gov",
    "selected_idea": "PASTE_SELECTED_IDEA",
    "title": "PASTE_SELECTED_TITLE",
    "intro_md": "PASTE_SELECTED_INTRO_MD",
    "outline": ["PASTE", "OUTLINE", "ARRAY"],
    "image_prompt": "PASTE_SELECTED_IMAGE_PROMPT",
    "cover_image_url": "PASTE_IMAGE_URL"
  },
  "final_blog": {
    "render": {
      "title": "PASTE_SELECTED_TITLE",
      "cover_image_url": "PASTE_IMAGE_URL",
      "intro_md": "PASTE_SELECTED_INTRO_MD",
      "sections": [],
      "conclusion_md": "",
      "references": []
    },
    "markdown": "PASTE_MARKDOWN",
    "html": "PASTE_HTML"
  }
}


Copy returned blog_id.

11) Request Publish

POST /blogs/<BLOG_ID>/request-publish
Header:
Authorization: Bearer <USER_TOKEN>

12) Admin Approve/Reject

Signup/login with admin email (ADMIN_EMAIL).

GET /admin/blogs?status=pending

POST /admin/blogs/<BLOG_ID>/approve

POST /admin/blogs/<BLOG_ID>/reject?feedback=...

Admin requests require:
Authorization: Bearer <ADMIN_TOKEN>