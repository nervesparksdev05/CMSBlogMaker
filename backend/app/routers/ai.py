from fastapi import APIRouter, HTTPException, status
from app.models.schemas import (
    TopicIdeasIn, TitlesIn, ImagePromptsIn, IntrosIn, OutlinesIn, ImageGenerateIn, ImageOut,
    GenerateBlogIn, OptionsOut, FinalBlog, BlogRender, BlogSection
)

from app.services.gemini_service import (
    gen_topic_ideas, gen_titles, gen_intros, gen_outlines, gen_image_prompts, gen_final_blog_markdown
)
from app.services.image_service import generate_cover_image
from app.services.markdown_service import markdown_to_html

router = APIRouter()

def _raise_ai_error(err: Exception):
    msg = str(err)
    lower = msg.lower()

    if "resource_exhausted" in msg or "quota" in lower:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="AI quota exhausted. Add billing to your Gemini project.",
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
async def image_generate(payload: ImageGenerateIn):
    try:
        return await generate_cover_image(payload.model_dump())
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
