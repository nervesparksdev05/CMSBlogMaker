import os
import uuid
from textwrap import dedent
from io import BytesIO
from PIL import Image
from google import genai
from google.genai import types

from core.config import settings

_client = None

def _use_mock() -> bool:
    return settings.AI_MODE == "mock"

def _normalize_model(name: str) -> str:
    if not name:
        return name
    return name if name.startswith("models/") else f"models/{name}"

def _get_client() -> genai.Client:
    if _use_mock():
        raise RuntimeError("AI_MODE=mock is enabled.")
    if not settings.GEMINI_API_KEY:
        raise RuntimeError("GEMINI_API_KEY is not set.")
    global _client
    if _client is None:
        _client = genai.Client(api_key=settings.GEMINI_API_KEY)
    return _client

def _hex_to_rgb(value: str):
    s = (value or "").strip().lstrip("#")
    if len(s) == 3:
        s = "".join(ch * 2 for ch in s)
    if len(s) != 6:
        return (68, 67, 228)
    try:
        return (int(s[0:2], 16), int(s[2:4], 16), int(s[4:6], 16))
    except ValueError:
        return (68, 67, 228)

async def generate_cover_image(payload: dict) -> dict:
    os.makedirs("uploads", exist_ok=True)

    if _use_mock():
        img = Image.new("RGB", (1024, 768), _hex_to_rgb(payload.get("primary_color", "")))
        filename = f"{uuid.uuid4().hex}.png"
        path = os.path.join("uploads", filename)
        img.save(path)
        return {
            "image_url": f"{settings.PUBLIC_BASE_URL}/uploads/{filename}",
            "meta": {
                "aspect_ratio": payload["aspect_ratio"],
                "quality": payload["quality"],
                "primary_color": payload["primary_color"],
                "model": "mock",
                "prompt": payload["prompt"],
            },
        }

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

    client = _get_client()
    model_name = _normalize_model(settings.GEMINI_IMAGE_MODEL)

    if "imagen" in model_name:
        resp = client.models.generate_images(
            model=model_name,
            prompt=final_prompt,
            config=types.GenerateImagesConfig(
                number_of_images=1,
                aspect_ratio=payload["aspect_ratio"],
            ),
        )

        if not resp.generated_images:
            raise RuntimeError("Image model did not return an image.")

        img_obj = resp.generated_images[0].image
        if not img_obj or not img_obj.image_bytes:
            raise RuntimeError("Image model returned no image bytes.")

        img = Image.open(BytesIO(img_obj.image_bytes))
        filename = f"{uuid.uuid4().hex}.png"
        path = os.path.join("uploads", filename)
        img.save(path)

        return {
            "image_url": f"{settings.PUBLIC_BASE_URL}/uploads/{filename}",
            "meta": {
                "aspect_ratio": payload["aspect_ratio"],
                "quality": payload["quality"],
                "primary_color": payload["primary_color"],
                "model": model_name,
                "prompt": payload["prompt"],
            },
        }

    cfg = types.GenerateContentConfig(
        response_modalities=["Image"],
        image_config=types.ImageConfig(aspect_ratio=payload["aspect_ratio"]),
    )

    resp = client.models.generate_content(
        model=model_name,
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
                    "model": model_name,
                    "prompt": payload["prompt"],
                },
            }

    raise RuntimeError("Image model did not return an image.")
