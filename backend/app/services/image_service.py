import os
import uuid
from PIL import Image
from google import genai
from google.genai import types

from app.config import settings

client = genai.Client(api_key=settings.GEMINI_API_KEY)

async def generate_cover_image(payload: dict) -> dict:
    os.makedirs("uploads", exist_ok=True)

    final_prompt = (
        "Create a high-quality blog cover image.\n"
        "Language context: English blog.\n"
        f"Tone: {payload['tone']}\n"
        f"Creativity: {payload['creativity']}\n"
        f"Focus/Niche: {payload['focus_or_niche']}\n"
        f"Keyword: {payload.get('targeted_keyword','')}\n"
        f"Title: {payload.get('title','')}\n\n"
        f"Aspect ratio: {payload['aspect_ratio']}\n"
        f"Quality: {payload['quality']}\n"
        f"Primary color: {payload['primary_color']}\n"
        f"User prompt: {payload['prompt']}\n"
        "No watermark, no logos, no text.\n"
    )

    cfg = types.GenerateContentConfig(
        response_modalities=["Image"],
        image_config=types.ImageConfig(aspect_ratio=payload["aspect_ratio"]),
    )

    resp = client.models.generate_content(
        model=settings.GEMINI_IMAGE_MODEL,
        contents=[final_prompt],
        config=cfg,
    )

    for part in resp.parts:
        if part.inline_data is not None:
            img: Image.Image = part.as_image()
            filename = f"{uuid.uuid4().hex}.png"
            path = os.path.join("uploads", filename)
            img.save(path)

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

    raise RuntimeError("Image model did not return an image.")
