from datetime import datetime, timedelta
from jose import jwt, JWTError
from argon2 import PasswordHasher
from argon2.exceptions import VerifyMismatchError, InvalidHash

ph = PasswordHasher()

def hash_password(password: str) -> str:
    return ph.hash(password)

def verify_password(password: str, hashed: str) -> bool:
    try:
        return ph.verify(hashed, password)
    except (VerifyMismatchError, InvalidHash):
        return False

def create_access_token(user_id: str, role: str, secret: str, minutes: int) -> str:
    exp = datetime.utcnow() + timedelta(minutes=minutes)
    payload = {"sub": user_id, "role": role, "exp": exp}
    return jwt.encode(payload, secret, algorithm="HS256")

def decode_token(token: str, secret: str):
    try:
        return jwt.decode(token, secret, algorithms=["HS256"])
    except JWTError:
        return None
