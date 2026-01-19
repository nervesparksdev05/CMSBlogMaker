import os
import uuid
from textwrap import dedent
import logging
import requests
from pathlib import Path
from PIL import Image
from io import BytesIO
from google import genai
from google.genai import types
from openai import OpenAI

from core.config import settings

logger = logging.getLogger(__name__)

# Get absolute path to uploads directory
BASE_DIR = Path(__file__).parent.parent.parent
UPLOADS_DIR = BASE_DIR / "uploads"
UPLOADS_DIR.mkdir(exist_ok=True)

try:
    client = genai.Client(api_key=settings.GEMINI_API_KEY)
except Exception as e:
    logger.warning(f"Failed to initialize Gemini client: {e}")
    client = None

openai_client = OpenAI(api_key=settings.OPENAI_API_KEY) if settings.OPENAI_API_KEY else None

async def generate_cover_image(payload: dict) -> dict:

    final_prompt = dedent(f"""
    Create a high-quality blog cover image.
    Language context: English blog.
    Tone: {payload['tone']}
    Creativity: {payload['creativity']}
    Focus/Niche: {payload['focus_or_niche']}
    Keyword: {payload.get('targeted_keyword','')}
    Title: {payload.get('title','')}

    Aspect ratio: {payload['aspect_ratio']}
    Quality: {payload['quality']}
    Primary color: {payload['primary_color']}
    User prompt: {payload['prompt']}
    No watermark, no logos, no text.
    """).lstrip("\n")

    # Try Gemini first
    try:
        if client is None:
            raise Exception("Gemini client not initialized")
        
        cfg = types.GenerateContentConfig(
            response_modalities=["Image"],
            image_config=types.ImageConfig(aspect_ratio=payload["aspect_ratio"]),
        )

        resp = client.models.generate_content(
            model=settings.GEMINI_IMAGE_MODEL,
            contents=[final_prompt],
            config=cfg,
        )

        # Check if response and parts exist
        if resp is None:
            raise RuntimeError("Gemini API returned None response")
        
        if not hasattr(resp, 'parts') or resp.parts is None:
            raise RuntimeError("Gemini API response has no parts")
        
        # Iterate through parts to find image
        for part in resp.parts:
            if part is not None and hasattr(part, 'inline_data') and part.inline_data is not None:
                img: Image.Image = part.as_image()
                filename = f"{uuid.uuid4().hex}.png"
                path = UPLOADS_DIR / filename
                img.save(str(path))

                return {
                    "image_url": f"{settings.PUBLIC_BASE_URL}/uploads/{filename}",
                    "meta": {
                        "aspect_ratio": payload["aspect_ratio"],
                        "quality": payload["quality"],
                        "primary_color": payload["primary_color"],
                        "model": settings.GEMINI_IMAGE_MODEL,
                        "prompt": payload["prompt"],
                    },
                }

        raise RuntimeError("Image model did not return an image in the response parts.")
    
    except Exception as e:
        logger.warning(f"Gemini image generation failed: {e}. Falling back to OpenAI DALL-E.")
        
        # Fallback to OpenAI DALL-E
        if openai_client is None:
            raise RuntimeError(
                f"Both Gemini and OpenAI clients are unavailable. "
                f"Gemini error: {e}. "
                f"OpenAI API key not configured."
            )
        
        if not settings.OPENAI_API_KEY:
            raise RuntimeError(
                f"Both Gemini and OpenAI image generation failed. "
                f"Gemini error: {e}. "
                f"OpenAI API key is missing in configuration."
            )
        
        # Map aspect ratios to DALL-E format
        aspect_ratio_map = {
            "1:1": "1024x1024",
            "4:3": "1024x768",
            "3:4": "768x1024",
            "16:9": "1792x1024",
            "9:16": "1024x1792",
        }
        size = aspect_ratio_map.get(payload["aspect_ratio"], "1024x1024")
        
        # Map quality to DALL-E quality
        quality_map = {
            "low": "standard",
            "medium": "standard",
            "high": "hd",
        }
        dall_e_quality = quality_map.get(payload["quality"], "hd")
        
        try:
            logger.info(f"Attempting OpenAI DALL-E image generation with size: {size}, quality: {dall_e_quality}")
            response = openai_client.images.generate(
                model=settings.OPENAI_IMAGE_MODEL,
                prompt=final_prompt,
                size=size,
                quality=dall_e_quality,
                n=1,
            )
            
            if not response or not response.data or len(response.data) == 0:
                raise RuntimeError("OpenAI API returned empty response")
            
            # Download the image
            image_url = response.data[0].url
            if not image_url:
                raise RuntimeError("OpenAI API returned image without URL")
            
            logger.info(f"Downloading image from OpenAI URL: {image_url}")
            img_response = requests.get(image_url, stream=True, timeout=30)
            img_response.raise_for_status()
            
            img = Image.open(BytesIO(img_response.content))
            filename = f"{uuid.uuid4().hex}.png"
            path = UPLOADS_DIR / filename
            img.save(str(path))
            
            logger.info(f"Successfully generated image using OpenAI DALL-E: {filename}")
            return {
                "image_url": f"{settings.PUBLIC_BASE_URL}/uploads/{filename}",
                "meta": {
                    "aspect_ratio": payload["aspect_ratio"],
                    "quality": payload["quality"],
                    "primary_color": payload["primary_color"],
                    "model": settings.OPENAI_IMAGE_MODEL,
                    "prompt": payload["prompt"],
                },
            }
        except Exception as openai_error:
            error_msg = (
                f"Both Gemini and OpenAI image generation failed. "
                f"Gemini error: {e}. "
                f"OpenAI error: {str(openai_error)}"
            )
            logger.error(error_msg)
            raise RuntimeError(error_msg)
