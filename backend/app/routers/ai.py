from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, status
from app.models.schemas import (
    TopicIdeasIn, TitlesIn, ImagePromptsIn, IntrosIn, OutlinesIn, ImageGenerateIn, ImageOut,
    GenerateBlogIn, OptionsOut, FinalBlog, BlogRender, BlogSection
)

from app.services.gemini_service import (
    gen_topic_ideas, gen_titles, gen_intros, gen_outlines, gen_image_prompts, gen_final_blog_markdown
)
from app.services.image_service import generate_cover_image
from app.services.markdown_service import markdown_to_html, normalize_markdown
from app.models.db import images_col
from core.deps import get_current_user

router = APIRouter()

def _raise_ai_error(err: Exception):
    msg = str(err)
    lower = msg.lower()

    if "resource_exhausted" in msg or "quota" in lower:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="AI quota exhausted. Add billing to your Gemini project.",
        )
    if "getaddrinfo failed" in lower or "name resolution" in lower:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Unable to reach the Gemini API (DNS/network). Check internet, VPN, or firewall.",
        )
    if "response modalities" in lower and "image" in lower:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Image generation is not supported for this Gemini model/API key. Enable a supported image model or billing.",
        )
    if "not found" in lower and "models/" in lower:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="AI model not found. Check GEMINI_TEXT_MODEL or GEMINI_IMAGE_MODEL.",
        )
    if "api_key" in lower or "missing key inputs" in lower:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="AI API key missing. Set GEMINI_API_KEY in backend/.env.",
        )

    raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=msg)

@router.post("/ideas", response_model=OptionsOut)
async def topic_ideas(payload: TopicIdeasIn):
    print("idea playload",payload)
    try:
        
        options = await gen_topic_ideas(payload.model_dump())
        return {"options": options}
    except Exception as e:
        _raise_ai_error(e)

@router.post("/titles", response_model=OptionsOut)
async def titles(payload: TitlesIn):
    try:
        options = await gen_titles(payload.model_dump())
        return {"options": options}
    except Exception as e:
        _raise_ai_error(e)

@router.post("/intros", response_model=OptionsOut)
async def intros(payload: IntrosIn):
    try:
        options = await gen_intros(payload.model_dump())
        return {"options": options}
    except Exception as e:
        _raise_ai_error(e)

@router.post("/outlines", response_model=dict)
async def outlines(payload: OutlinesIn):
    try:
        options = await gen_outlines(payload.model_dump())
        return {"options": options}  # 5 variants, each {outline:[...]}
    except Exception as e:
        _raise_ai_error(e)

@router.post("/image-prompts", response_model=OptionsOut)
async def image_prompts(payload: ImagePromptsIn):
    try:
        options = await gen_image_prompts(payload.model_dump())
        return {"options": options}
    except Exception as e:
        _raise_ai_error(e)


@router.post("/image-generate", response_model=ImageOut)
async def image_generate(payload: ImageGenerateIn, user=Depends(get_current_user)):
    try:
        data = payload.model_dump()
        save_to_gallery = data.pop("save_to_gallery", True)
        result = await generate_cover_image(data)
        if save_to_gallery:
            await images_col.insert_one(
                {
                    "owner_id": user["id"],
                    "owner_name": user.get("name", ""),
                    "image_url": result.get("image_url", ""),
                    "meta": result.get("meta", {}),
                    "source": data.get("source", "nano"),
                    "created_at": datetime.utcnow(),
                }
            )
        return result
    except Exception as e:
        _raise_ai_error(e)

@router.post("/blog-generate", response_model=FinalBlog)
async def blog_generate(payload: GenerateBlogIn):
    """
    Called on 'Generate Blog' button from review page.
    Returns ONE final blog:
      - markdown (right)
      - html (left)
      - render (structured, optional for UI)
    """
    try:
        markdown = await gen_final_blog_markdown(payload.model_dump())
        markdown = normalize_markdown(markdown)
        html = markdown_to_html(markdown)

        # Minimal structured render for convenience (frontend can just render markdown too)
        refs = [r.strip() for r in (payload.reference_links or "").split(",") if r.strip()]
        render = BlogRender(
            title=payload.title,
            cover_image_url=payload.cover_image_url or "",
            intro_md=payload.intro_md,
            sections=[BlogSection(heading=h, body_md="") for h in payload.outline],
            conclusion_md="",
            references=refs,
        )

        return {"render": render, "markdown": markdown, "html": html}
    except Exception as e:
        _raise_ai_error(e)
