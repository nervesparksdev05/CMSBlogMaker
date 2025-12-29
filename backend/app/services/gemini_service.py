from typing import List
from google import genai
from google.genai import types
from pydantic import BaseModel, Field

from app.config import settings
from app.schemas import AI_OPTIONS_COUNT

client = genai.Client(api_key=settings.GEMINI_API_KEY)

# ---------- schemas for structured outputs ----------
class _StringOptions(BaseModel):
    options: List[str] = Field(min_length=AI_OPTIONS_COUNT, max_length=AI_OPTIONS_COUNT)

def _sys(tone: str, creativity: str) -> str:
    return (
        "You are a senior blog writer.\n"
        "Language must be English.\n"
        f"Tone: {tone}\n"
        f"Creativity: {creativity}\n"
        "Return ONLY valid JSON according to the schema.\n"
    )

async def gen_topic_ideas(payload: dict) -> List[str]:
    prompt = (
        f"{_sys(payload['tone'], payload['creativity'])}\n"
        f"Focus/Niche: {payload['focus_or_niche']}\n"
        f"Targeted keyword: {payload.get('targeted_keyword','')}\n"
        f"Targeted audience: {payload.get('targeted_audience','')}\n"
        f"Reference links: {payload.get('reference_links','')}\n\n"
        f"Generate exactly {AI_OPTIONS_COUNT} blog topic ideas.\n"
        "Each idea must be a single sentence, clear and specific.\n"
    )
    resp = client.models.generate_content(
        model=settings.GEMINI_TEXT_MODEL,
        contents=[prompt],
        config={"response_mime_type": "application/json", "response_schema": _StringOptions},
    )
    return resp.parsed.options

async def gen_titles(payload: dict) -> List[str]:
    prompt = (
        f"{_sys(payload['tone'], payload['creativity'])}\n"
        f"Focus/Niche: {payload['focus_or_niche']}\n"
        f"Keyword: {payload.get('targeted_keyword','')}\n"
        f"Audience: {payload.get('targeted_audience','')}\n"
        f"Selected idea: {payload['selected_idea']}\n\n"
        f"Generate exactly {AI_OPTIONS_COUNT} SEO-friendly blog titles.\n"
        "No quotes, no emojis.\n"
    )
    resp = client.models.generate_content(
        model=settings.GEMINI_TEXT_MODEL,
        contents=[prompt],
        config={"response_mime_type": "application/json", "response_schema": _StringOptions},
    )
    return resp.parsed.options

async def gen_intros(payload: dict) -> List[str]:
    prompt = (
        f"{_sys(payload['tone'], payload['creativity'])}\n"
        f"Focus/Niche: {payload['focus_or_niche']}\n"
        f"Keyword: {payload.get('targeted_keyword','')}\n"
        f"Audience: {payload.get('targeted_audience','')}\n"
        f"Selected idea: {payload['selected_idea']}\n"
        f"Title: {payload['title']}\n\n"
        f"Generate exactly {AI_OPTIONS_COUNT} intro paragraphs in Markdown.\n"
        "Each intro: 80-140 words.\n"
    )
    resp = client.models.generate_content(
        model=settings.GEMINI_TEXT_MODEL,
        contents=[prompt],
        config={"response_mime_type": "application/json", "response_schema": _StringOptions},
    )
    return resp.parsed.options

class _OutlineVariant(BaseModel):
    outline: List[str] = Field(min_length=6, max_length=12)

class _OutlineOptions(BaseModel):
    options: List[_OutlineVariant] = Field(min_length=AI_OPTIONS_COUNT, max_length=AI_OPTIONS_COUNT)

async def gen_outlines(payload: dict):
    prompt = (
        f"{_sys(payload['tone'], payload['creativity'])}\n"
        f"Focus/Niche: {payload['focus_or_niche']}\n"
        f"Keyword: {payload.get('targeted_keyword','')}\n"
        f"Audience: {payload.get('targeted_audience','')}\n"
        f"Selected idea: {payload['selected_idea']}\n"
        f"Title: {payload['title']}\n"
        f"Intro: {payload['intro_md']}\n\n"
        f"Generate exactly {AI_OPTIONS_COUNT} outline variants.\n"
        "Each outline should be 6-10 headings.\n"
        "Headings must be short and not numbered.\n"
    )
    resp = client.models.generate_content(
        model=settings.GEMINI_TEXT_MODEL,
        contents=[prompt],
        config={"response_mime_type": "application/json", "response_schema": _OutlineOptions},
    )
    return [o.model_dump() for o in resp.parsed.options]

async def gen_image_prompts(payload: dict) -> List[str]:
    prompt = (
        f"{_sys(payload['tone'], payload['creativity'])}\n"
        f"Focus/Niche: {payload['focus_or_niche']}\n"
        f"Keyword: {payload.get('targeted_keyword','')}\n"
        f"Selected idea: {payload['selected_idea']}\n"
        f"Title: {payload['title']}\n\n"
        f"Generate exactly {AI_OPTIONS_COUNT} blog cover image prompts.\n"
        "Avoid text/logos/watermarks.\n"
    )
    resp = client.models.generate_content(
        model=settings.GEMINI_TEXT_MODEL,
        contents=[prompt],
        config={"response_mime_type": "application/json", "response_schema": _StringOptions},
    )
    return resp.parsed.options

# Final blog generation returns ONE markdown (not 5)
async def gen_final_blog_markdown(payload: dict) -> str:
    refs = payload.get("reference_links", "")
    prompt = (
        f"{_sys(payload['tone'], payload['creativity'])}\n"
        f"Focus/Niche: {payload['focus_or_niche']}\n"
        f"Keyword: {payload.get('targeted_keyword','')}\n"
        f"Audience: {payload.get('targeted_audience','')}\n"
        f"Reference links: {refs}\n\n"
        f"Selected idea: {payload['selected_idea']}\n"
        f"Title: {payload['title']}\n"
        f"Intro (markdown): {payload['intro_md']}\n"
        f"Outline headings: {payload['outline']}\n"
        f"Cover image url: {payload.get('cover_image_url','')}\n\n"
        "Write a complete blog post in Markdown.\n"
        "Rules:\n"
        "- Start with '# {Title}'\n"
        "- If cover_image_url is not empty, include: ![Cover](cover_image_url)\n"
        "- Use '##' headings based on the outline\n"
        "- Include a '## Conclusion' section\n"
        "- If reference links exist, include '## References' with bullet links.\n"
        "Return ONLY the Markdown text.\n"
    )
    resp = client.models.generate_content(
        model=settings.GEMINI_TEXT_MODEL,
        contents=[prompt],
        config=types.GenerateContentConfig(temperature=0.7),
    )
    # plain text response
    text = (resp.text or "").strip()
    return text
