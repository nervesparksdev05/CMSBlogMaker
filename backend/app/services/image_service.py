import base64
import os
import uuid
from textwrap import dedent
from google import genai
from google.genai import types

from core.config import settings

_client = None

def _normalize_model(name: str) -> str:
    if not name:
        return name
    return name if name.startswith("models/") else f"models/{name}"

def _get_client() -> genai.Client:
    if not settings.GEMINI_API_KEY:
        raise RuntimeError("GEMINI_API_KEY is not set.")
    global _client
    if _client is None:
        _client = genai.Client(api_key=settings.GEMINI_API_KEY)
    return _client

_BASE64_CHARS = set(b"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=\n\r")

def _detect_image_kind(data: bytes) -> str | None:
    if not data:
        return None
    if data.startswith(b"\x89PNG\r\n\x1a\n"):
        return "png"
    if data[:3] == b"\xff\xd8\xff":
        return "jpeg"
    if data[:6] in (b"GIF87a", b"GIF89a"):
        return "gif"
    if data[:4] == b"RIFF" and data[8:12] == b"WEBP":
        return "webp"
    if data[:2] == b"BM":
        return "bmp"
    return None

def _looks_like_base64(data: bytes) -> bool:
    if not data:
        return False
    sample = data[:256]
    return all(b in _BASE64_CHARS for b in sample)

def _normalize_image_bytes(data: bytes) -> bytes:
    if not data:
        return data
    if data.startswith(b"data:"):
        _, _, b64_data = data.partition(b",")
        try:
            decoded = base64.b64decode(b64_data, validate=False)
        except Exception:
            return data
        return decoded
    if _detect_image_kind(data):
        return data
    if _looks_like_base64(data):
        try:
            decoded = base64.b64decode(data, validate=False)
        except Exception:
            return data
        if _detect_image_kind(decoded):
            return decoded
    return data

def _extension_from_bytes(data: bytes, mime_type: str | None) -> str:
    if mime_type:
        mime = mime_type.lower()
        if "png" in mime:
            return "png"
        if "jpeg" in mime or "jpg" in mime:
            return "jpg"
        if "webp" in mime:
            return "webp"
        if "gif" in mime:
            return "gif"
        if "bmp" in mime:
            return "bmp"
    kind = _detect_image_kind(data)
    if kind == "jpeg":
        return "jpg"
    if kind:
        return kind
    return "png"

def _prepare_image(data: bytes, mime_type: str | None) -> tuple[bytes, str]:
    normalized = _normalize_image_bytes(data)
    ext = _extension_from_bytes(normalized, mime_type)
    return normalized, ext

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

        img_bytes, ext = _prepare_image(img_obj.image_bytes, img_obj.mime_type)
        filename = f"{uuid.uuid4().hex}.{ext}"
        path = os.path.join("uploads", filename)
        with open(path, "wb") as handle:
            handle.write(img_bytes)

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

    parts = resp.parts or []
    if not parts and resp.candidates:
        for cand in resp.candidates:
            if cand.content and cand.content.parts:
                parts.extend(cand.content.parts)

    for part in parts:
        if part.inline_data is not None and part.inline_data.data:
            img_bytes, ext = _prepare_image(part.inline_data.data, part.inline_data.mime_type)
            filename = f"{uuid.uuid4().hex}.{ext}"
            path = os.path.join("uploads", filename)
            with open(path, "wb") as handle:
                handle.write(img_bytes)

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
