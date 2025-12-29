##CMS Blog Backend (FastAPI + MongoDB + Gemini + Image Generation)

#This backend powers the CMS blog generator flow:

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

Password hashing: Argon2 (argon2-cffi) — supports long passwords

Gemini (text + image) via google-genai

Markdown → HTML via markdown

Folder Structure
backend/
  main.py
  requirements.txt
  README.md
  .env.example
  .env                 # local only (do not commit)
  uploads/             # generated/uploaded images stored here
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

What Each File Does (Detailed)
Root
main.py

Creates the FastAPI app

Adds CORS middleware

Mounts /uploads as static file serving

Registers routers: /auth, /ai, /blogs, /admin

Runs startup lifespan() to initialize MongoDB indexes via init_indexes()

requirements.txt

All Python dependencies pinned for reproducible installs

README.md

This documentation

.env.example

Template for required environment variables

.env (local only)

Actual secrets/keys. Should be in .gitignore.

uploads/

Stores generated cover images and uploaded images

Served via: GET /uploads/<filename>

app/
app/config.py

Loads environment variables using pydantic-settings

Provides a settings object used everywhere

Central place for config like Mongo URI, JWT secret, Gemini keys, CORS origins

app/db.py

Creates MongoDB client using motor

Exposes:

db

users_col

blogs_col

init_indexes() creates required indexes (email unique, blog indexes)

app/deps.py

Auth dependency helpers:

Extract JWT from Authorization: Bearer <token>

Decode token and fetch user from DB

require_user / require_admin guards (admin-only access)

app/schemas.py

All Pydantic request/response models:

Auth models: SignupIn, LoginIn, TokenOut, etc.

Blog models: BlogMeta, FinalBlog, BlogCreateIn, BlogOut, BlogListItem

AI request models: TopicIdeasIn, TitlesIn, IntrosIn, OutlinesIn, ImagePromptsIn, ImageGenerateIn, GenerateBlogIn

Shared output model: OptionsOut (always 5 strings)

app/security.py

Password hashing using Argon2

JWT creation/verification:

create_access_token()

decode_token()

This is where you plug future security improvements (refresh tokens, rotation, etc.)

app/routers/
app/routers/auth.py

POST /auth/signup

POST /auth/login

Assigns admin role if email matches ADMIN_EMAIL

Returns JWT token and user info

app/routers/ai.py

AI generation endpoints (Gemini + image generation):

POST /ai/ideas → 5 topic ideas

POST /ai/titles → 5 title options

POST /ai/intros → 5 intro options

POST /ai/outlines → 5 outline variants

POST /ai/image-prompts → 5 image prompt options

POST /ai/image-generate → 1 image output (image_url)

POST /ai/blog-generate → final blog markdown + html

app/routers/blogs.py

Blog storage + user blog workflow:

POST /blogs → save final blog to MongoDB

GET /blogs/mine → list saved blogs (for “Saved Blogs” table)

GET /blogs/{id} → fetch a single blog (final blog + markdown + html)

POST /blogs/{id}/request-publish → set blog status to pending

GET /blogs/dashboard/stats → counts for dashboard cards

POST /blogs/upload/image → upload cover image (multipart form-data)

app/routers/admin.py

Admin-only blog moderation:

GET /admin/blogs?status=pending|saved|published|rejected

POST /admin/blogs/{id}/approve

POST /admin/blogs/{id}/reject?feedback=...

app/services/
app/services/gemini_service.py

Gemini integration for text generation:

gen_topic_ideas()

gen_titles()

gen_intros()

gen_outlines()

gen_image_prompts()

gen_final_blog_markdown()

Enforces “return 5 options” behavior

Central place to modify prompts & model selection

app/services/image_service.py

Image generation integration

Saves the generated image to uploads/

Returns public URL (based on PUBLIC_BASE_URL)

app/services/markdown_service.py

Converts Markdown → HTML safely for preview

Used by /ai/blog-generate

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

python -m venv venv
.\venv\Scripts\Activate.ps1
python -m pip install -U pip

2) Install dependencies
pip install -r requirements.txt

3) Create .env
Copy-Item .env.example .env


Update .env with your keys and settings.

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

Admin Role Rule

If a user signs up with email equal to ADMIN_EMAIL, they get role admin. Otherwise role is user.

Run the Server

From backend/:

python -m uvicorn main:app --reload --port 8000


Server: http://127.0.0.1:8000

Swagger docs: http://127.0.0.1:8000/docs

MongoDB Setup
Option A: Local MongoDB

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

All protected endpoints require:

Authorization: Bearer <token>


Token comes from:

POST /auth/signup

POST /auth/login

API Overview
Health

GET /health

Auth

POST /auth/signup

POST /auth/login

AI (returns 5 options where applicable)

POST /ai/ideas

POST /ai/titles

POST /ai/intros

POST /ai/outlines

POST /ai/image-prompts

POST /ai/image-generate

POST /ai/blog-generate

Blogs

POST /blogs

GET /blogs/mine

GET /blogs/{id}

POST /blogs/{id}/request-publish

GET /blogs/dashboard/stats

POST /blogs/upload/image

Admin (Admin token required)

GET /admin/blogs?status=...

POST /admin/blogs/{id}/approve

POST /admin/blogs/{id}/reject?feedback=...

Postman Testing (Direct, No Environment)

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


Pick one intro markdown.

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


Copy blog_id.

11) Request Publish

POST /blogs/<BLOG_ID>/request-publish
Header:
Authorization: Bearer <USER_TOKEN>

12) Admin Approve/Reject

Signup/login with admin email (matches ADMIN_EMAIL).

Admin endpoints:

GET /admin/blogs?status=pending

POST /admin/blogs/<BLOG_ID>/approve

POST /admin/blogs/<BLOG_ID>/reject?feedback=...

Header:
Authorization: Bearer <ADMIN_TOKEN>
