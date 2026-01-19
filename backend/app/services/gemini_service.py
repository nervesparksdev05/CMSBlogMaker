from typing import List
from textwrap import dedent
import logging

from google import genai
from google.genai import types
from pydantic import BaseModel, Field

from core.config import settings
from app.models.schemas import AI_OPTIONS_COUNT

# Import OpenAI fallback functions
from app.services.openai_service import (
    gen_topic_ideas as openai_gen_topic_ideas,
    gen_titles as openai_gen_titles,
    gen_intros as openai_gen_intros,
    gen_outlines as openai_gen_outlines,
    gen_image_prompts as openai_gen_image_prompts,
    gen_final_blog_markdown as openai_gen_final_blog_markdown,
)

logger = logging.getLogger(__name__)

try:
    client = genai.Client(api_key=settings.GEMINI_API_KEY)
except Exception as e:
    logger.warning(f"Failed to initialize Gemini client: {e}")
    client = None

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
    try:
        if client is None:
            raise Exception("Gemini client not initialized")
        
        prompt = dedent(f"""
        {_sys(payload['tone'], payload['creativity'])}
        Focus/Niche: {payload['focus_or_niche']}
        Targeted keyword: {payload.get('targeted_keyword','')}
        Targeted audience: {payload.get('targeted_audience','')}
        Reference links: {payload.get('reference_links','')}

        Generate exactly {AI_OPTIONS_COUNT} blog topic ideas.
        Each idea must be a single sentence, clear and specific.
        """).lstrip("\n")

        resp = client.models.generate_content(
            model=settings.GEMINI_TEXT_MODEL,
            contents=[prompt],
            config={"response_mime_type": "application/json", "response_schema": _StringOptions},
        )
        return resp.parsed.options
    except Exception as e:
        logger.warning(f"Gemini API call failed for gen_topic_ideas: {e}. Falling back to OpenAI.")
        return await openai_gen_topic_ideas(payload)

async def gen_titles(payload: dict) -> List[str]:
    try:
        if client is None:
            raise Exception("Gemini client not initialized")
        
        prompt = dedent(f"""
        {_sys(payload['tone'], payload['creativity'])}
        Focus/Niche: {payload['focus_or_niche']}
        Keyword: {payload.get('targeted_keyword','')}
        Audience: {payload.get('targeted_audience','')}
        Selected idea: {payload['selected_idea']}

        Generate exactly {AI_OPTIONS_COUNT} SEO-friendly blog titles.
        No quotes, no emojis.
        """).lstrip("\n")

        resp = client.models.generate_content(
            model=settings.GEMINI_TEXT_MODEL,
            contents=[prompt],
            config={"response_mime_type": "application/json", "response_schema": _StringOptions},
        )
        return resp.parsed.options
    except Exception as e:
        logger.warning(f"Gemini API call failed for gen_titles: {e}. Falling back to OpenAI.")
        return await openai_gen_titles(payload)

async def gen_intros(payload: dict) -> List[str]:
    try:
        if client is None:
            raise Exception("Gemini client not initialized")
        
        prompt = dedent(f"""
        {_sys(payload['tone'], payload['creativity'])}
        Focus/Niche: {payload['focus_or_niche']}
        Keyword: {payload.get('targeted_keyword','')}
        Audience: {payload.get('targeted_audience','')}
        Selected idea: {payload['selected_idea']}
        Title: {payload['title']}

        Generate exactly {AI_OPTIONS_COUNT} intro paragraphs in Markdown.
        Each intro: 80-140 words.
        """).lstrip("\n")

        resp = client.models.generate_content(
            model=settings.GEMINI_TEXT_MODEL,
            contents=[prompt],
            config={"response_mime_type": "application/json", "response_schema": _StringOptions},
        )
        return resp.parsed.options
    except Exception as e:
        logger.warning(f"Gemini API call failed for gen_intros: {e}. Falling back to OpenAI.")
        return await openai_gen_intros(payload)

class _OutlineVariant(BaseModel):
    outline: List[str] = Field(min_length=6, max_length=12)

class _OutlineOptions(BaseModel):
    options: List[_OutlineVariant] = Field(min_length=AI_OPTIONS_COUNT, max_length=AI_OPTIONS_COUNT)

async def gen_outlines(payload: dict):
    try:
        if client is None:
            raise Exception("Gemini client not initialized")
        
        prompt = dedent(f"""
        {_sys(payload['tone'], payload['creativity'])}
        Focus/Niche: {payload['focus_or_niche']}
        Keyword: {payload.get('targeted_keyword','')}
        Audience: {payload.get('targeted_audience','')}
        Selected idea: {payload['selected_idea']}
        Title: {payload['title']}
        Intro: {payload['intro_md']}

        Generate exactly {AI_OPTIONS_COUNT} outline variants.
        Each outline should be 6-10 headings.
        Headings must be short and not numbered.
        """).lstrip("\n")

        resp = client.models.generate_content(
            model=settings.GEMINI_TEXT_MODEL,
            contents=[prompt],
            config={"response_mime_type": "application/json", "response_schema": _OutlineOptions},
        )
        return [o.model_dump() for o in resp.parsed.options]
    except Exception as e:
        logger.warning(f"Gemini API call failed for gen_outlines: {e}. Falling back to OpenAI.")
        return await openai_gen_outlines(payload)

async def gen_image_prompts(payload: dict) -> List[str]:
    try:
        if client is None:
            raise Exception("Gemini client not initialized")
        
        prompt = dedent(f"""
        {_sys(payload['tone'], payload['creativity'])}
        Focus/Niche: {payload['focus_or_niche']}
        Keyword: {payload.get('targeted_keyword','')}
        Selected idea: {payload['selected_idea']}
        Title: {payload['title']}

        Generate exactly {AI_OPTIONS_COUNT} blog cover image prompts.
        Avoid text/logos/watermarks.
        """).lstrip("\n")

        resp = client.models.generate_content(
            model=settings.GEMINI_TEXT_MODEL,
            contents=[prompt],
            config={"response_mime_type": "application/json", "response_schema": _StringOptions},
        )
        return resp.parsed.options
    except Exception as e:
        logger.warning(f"Gemini API call failed for gen_image_prompts: {e}. Falling back to OpenAI.")
        return await openai_gen_image_prompts(payload)

# Final blog generation returns ONE markdown (not 5)
async def gen_final_blog_markdown(payload: dict) -> str:
    try:
        if client is None:
            raise Exception("Gemini client not initialized")
        
        refs = payload.get("reference_links", "")
        prompt = dedent(f"""
        {_sys(payload['tone'], payload['creativity'])}
        Focus/Niche: {payload['focus_or_niche']}
        Keyword: {payload.get('targeted_keyword','')}
        Audience: {payload.get('targeted_audience','')}
        Reference links: {refs}

        Selected idea: {payload['selected_idea']}
        Title: {payload['title']}
        Intro (markdown): {payload['intro_md']}
        Outline headings: {payload['outline']}
        Cover image url: {payload.get('cover_image_url','')}

        Write a complete blog post in Markdown.
        Rules:
        - Start with '# {{Title}}'
        - If cover_image_url is not empty, include: ![Cover](cover_image_url)
        - Use '##' headings based on the outline
        - Include a '## Conclusion' section
        - If reference links exist, include '## References' with bullet links.
        Return ONLY the Markdown text.
        """).lstrip("\n")

        resp = client.models.generate_content(
            model=settings.GEMINI_TEXT_MODEL,
            contents=[prompt],
            config=types.GenerateContentConfig(temperature=0.7),
        )
        return (resp.text or "").strip()
    except Exception as e:
        logger.warning(f"Gemini API call failed for gen_final_blog_markdown: {e}. Falling back to OpenAI.")
        return await openai_gen_final_blog_markdown(payload)
