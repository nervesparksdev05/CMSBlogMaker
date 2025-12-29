import os
import uuid
from textwrap import dedent
from PIL import Image
from google import genai
from google.genai import types

from core.config import settings

client = genai.Client(api_key=settings.GEMINI_API_KEY)

async def generate_cover_image(payload: dict) -> dict:
    os.makedirs("uploads", exist_ok=True)

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
