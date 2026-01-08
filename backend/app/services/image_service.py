import base64
import uuid
from textwrap import dedent
from google import genai
from google.genai import types
from google.cloud import storage

from core.config import settings

_client = None
_storage_client = None

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

def _get_storage_client() -> storage.Client:
    """
    Get Google Cloud Storage client.
    Uses GOOGLE_APPLICATION_CREDENTIALS for GCS bucket access.
    This is separate from FIREBASE_CREDENTIALS_PATH used for Firestore.
    """
    global _storage_client
    if _storage_client is None:
        import os
        import logging
        from google.oauth2 import service_account
        
        logger = logging.getLogger(__name__)
        
        # Use GOOGLE_APPLICATION_CREDENTIALS for GCS bucket (separate from Firestore credentials)
        creds_path = None
        
        # Priority: GOOGLE_APPLICATION_CREDENTIALS environment variable
        if os.getenv("GOOGLE_APPLICATION_CREDENTIALS"):
            creds_path = os.getenv("GOOGLE_APPLICATION_CREDENTIALS")
        # Fallback: settings.GOOGLE_APPLICATION_CREDENTIALS
        elif settings.GOOGLE_APPLICATION_CREDENTIALS and os.path.exists(settings.GOOGLE_APPLICATION_CREDENTIALS):
            creds_path = settings.GOOGLE_APPLICATION_CREDENTIALS
        
        if creds_path and os.path.exists(creds_path):
            credentials = service_account.Credentials.from_service_account_file(creds_path)
            _storage_client = storage.Client(credentials=credentials, project=settings.FIREBASE_PROJECT_ID)
            logger.info(f"GCS Storage client initialized with credentials from: {creds_path}")
        else:
            # Fallback: Use default credentials (for Google Cloud environments)
            # This will use GOOGLE_APPLICATION_CREDENTIALS environment variable if set
            _storage_client = storage.Client(project=settings.FIREBASE_PROJECT_ID)
            logger.info("GCS Storage client initialized with default credentials")
    return _storage_client

def _require_bucket() -> str:
    bucket = settings.GCS_BUCKET
    if not bucket:
        raise RuntimeError("GCS_BUCKET is not set.")
    return bucket

def _gcs_object_name(filename: str) -> str:
    prefix = (settings.GCS_FOLDER or "").strip("/")
    return f"{prefix}/{filename}" if prefix else filename

def _gcs_public_url(object_name: str) -> str:
    base = (settings.GCS_PUBLIC_BASE or "https://storage.googleapis.com").rstrip("/")
    return f"{base}/{_require_bucket()}/{object_name}"

def _content_type_from_ext(ext: str) -> str:
    ext = (ext or "").lower().lstrip(".")
    if ext in ("jpg", "jpeg"):
        return "image/jpeg"
    if ext == "png":
        return "image/png"
    if ext == "webp":
        return "image/webp"
    if ext == "gif":
        return "image/gif"
    if ext == "bmp":
        return "image/bmp"
    return "application/octet-stream"

def upload_bytes_to_gcs(data: bytes, filename: str, content_type: str | None = None) -> str:
    bucket_name = _require_bucket()
    bucket = _get_storage_client().bucket(bucket_name)
    object_name = _gcs_object_name(filename)
    blob = bucket.blob(object_name)
    blob.upload_from_string(data, content_type=content_type or "application/octet-stream")
    return _gcs_public_url(object_name)

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
        content_type = img_obj.mime_type or _content_type_from_ext(ext)
        image_url = upload_bytes_to_gcs(img_bytes, filename, content_type)

        return {
            "image_url": image_url,
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
            content_type = part.inline_data.mime_type or _content_type_from_ext(ext)
            image_url = upload_bytes_to_gcs(img_bytes, filename, content_type)

            return {
                "image_url": image_url,
                "meta": {
                    "aspect_ratio": payload["aspect_ratio"],
                    "quality": payload["quality"],
                    "primary_color": payload["primary_color"],
                    "model": model_name,
                    "prompt": payload["prompt"],
                },
            }

    raise RuntimeError("Image model did not return an image.")
