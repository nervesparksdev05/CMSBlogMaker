import json
import logging
from datetime import datetime, timezone
from urllib.parse import urlparse, parse_qs
from youtube_transcript_api import YouTubeTranscriptApi
from fastapi import APIRouter, Depends, HTTPException, status

from app.models.schemas import (
    TopicIdeasIn, TitlesIn, ImagePromptsIn, IntrosIn, OutlinesIn, 
    ImageGenerateIn, ImageOut, GenerateBlogIn, OptionsOut, YoutubeBlogIn
)
from app.services.gemini_service import (
    gen_topic_ideas, gen_titles, gen_intros, gen_outlines, 
    gen_image_prompts, gen_final_blog_markdown, gen_youtube_blog_json
)
from app.services.image_service import generate_cover_image
from app.models.firestore_db import create_image
from core.deps import get_current_user

logger = logging.getLogger(__name__)

router = APIRouter(dependencies=[Depends(get_current_user)])


def _raise_ai_error(err: Exception):
    msg = str(err)
    lower = msg.lower()

    if "resource_exhausted" in lower or "quota" in lower:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="AI quota exhausted. Check billing configuration."
        )
    if "getaddrinfo failed" in lower or "name resolution" in lower:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Service unavailable. Network or DNS resolution failure."
        )
    if "response modalities" in lower and "image" in lower:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Image generation unsupported by the current model configuration."
        )
    if "not found" in lower and "models/" in lower:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Specified AI model not found."
        )
    if "api_key" in lower or "missing key inputs" in lower:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="API key configuration missing."
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
        return {"options": options}
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
async def image_generate(payload: ImageGenerateIn, user: dict = Depends(get_current_user)):
    try:
        data = payload.model_dump()
        save_to_gallery = data.pop("save_to_gallery", True)
        
        result = await generate_cover_image(data)
        
        if save_to_gallery:
            create_image(
                {
                    "owner_id": user.get("id"),
                    "owner_name": user.get("name", ""),
                    "image_url": result.get("image_url", ""),
                    "meta": result.get("meta", {}),
                    "source": data.get("source", "nano"),
                    "created_at": datetime.now(timezone.utc),
                }
            )
            
        return result
    except Exception as e:
        logger.error(f"Image generation failed: {str(e)}", exc_info=True)
        raise HTTPException(status_code=400, detail=str(e))


def _extract_youtube_transcript(url: str) -> str:
    """
    Extracts the video ID and parses the custom FetchedTranscriptSnippet objects 
    returned by your specific local installation of the transcript API.
    """
    if not url:
        return ""
        
    video_id = None
    
    if "youtu.be" in url:
        video_id = url.split("/")[-1].split("?")[0]
    elif "youtube.com" in url:
        parsed_url = urlparse(url)
        query_params = parse_qs(parsed_url.query)
        video_id = query_params.get("v", [None])[0]
        
    if not video_id:
        return ""
        
    try:
        # 1. Instantiate the API (Required by your specific version)
        api = YouTubeTranscriptApi()
        
        # 2. Call .list() (This worked perfectly in your first trace)
        transcript_list = api.list(video_id)
        
        # 3. Grab the very first available transcript (any language)
        first_available = next(iter(transcript_list))
        
        # 4. Fetch the data (Returns a list of FetchedTranscriptSnippet objects)
        transcript_data = first_available.fetch()
        
        full_text = []
        for item in transcript_data:
            # 5. Extract the text safely from the object instead of using ["text"]
            text = getattr(item, "text", "")
            
            # Fallback just in case it ever returns a dictionary
            if not text and isinstance(item, dict):
                text = item.get("text", "")
                
            if text:
                full_text.append(text.replace('\n', ' '))
                
        return " ".join(full_text)
        
    except Exception as e:
        logger.error(f"Failed to fetch YouTube transcript: {e}", exc_info=True)
        return ""

@router.post("/youtube-to-blog")
async def youtube_to_blog(payload: YoutubeBlogIn, user: dict = Depends(get_current_user)):
    """
    The 'God Route': Extracts YouTube transcript (any language), translates, 
    and generates a fully structured JSON blog post in one shot.
    """
    try:
        data = payload.model_dump()
        
        # 1. Extract Transcript (Any Language)
        transcript = _extract_youtube_transcript(data["youtube_url"])
        if not transcript:
            raise HTTPException(
                status_code=400, 
                detail="Could not extract transcript. The video might be private or have no captions available."
            )
        
        data["youtube_transcript"] = transcript

        # 2. Call Gemini to generate the JSON Lego Blocks and Translate to Target Language
        structured_blog = await gen_youtube_blog_json(data)
        
        # Ensure the structure exists
        if "meta" not in structured_blog or "final_blog" not in structured_blog:
            raise HTTPException(status_code=500, detail="AI failed to generate correct JSON structure.")

        # 3. Create the Database Record format (Temp ID used until you wire up your actual PostgreSQL save function here)
        blog_id = "temp-youtube-id" 

        return {
            "blog_id": blog_id,
            "meta": {
                **structured_blog["meta"],
                "language": data["language"],
                "tone": data["tone"],
                "youtube_url": data["youtube_url"],
                "image_count": data["image_count"],
            },
            "final_blog": structured_blog["final_blog"]
        }

    except Exception as e:
        logger.error(f"YouTube to Blog failed: {str(e)}", exc_info=True)
        _raise_ai_error(e)


@router.post("/blog-generate")
async def blog_generate(payload: GenerateBlogIn):
    try:
        payload_dict = payload.model_dump()

        if payload.youtube_url:
            transcript = _extract_youtube_transcript(payload.youtube_url)
            if transcript:
                payload_dict["youtube_transcript"] = transcript

        raw_json_string = await gen_final_blog_markdown(payload_dict)

        clean_string = raw_json_string.replace("```json", "").replace("```", "").strip()
        blocks = json.loads(clean_string)

        return {"blocks": blocks}

    except Exception as e:
        _raise_ai_error(e)