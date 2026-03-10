# backend/auth.py
from datetime import datetime, timedelta 

from typing import Optional
from jose import JWTError, jwt
from passlib.context import CryptContext
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from database import get_db
import db_models as models 

# Config
SECRET_KEY   = "medcare-ai-secret-key-hassan-2026"
ALGORITHM    = "HS256"
EXPIRE_HOURS = 24 * 7  # 7 days

pwd_context   = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/v1/users/login")

# ── Password ──────────────────────────────

def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain: str, hashed: str) -> bool:
    return pwd_context.verify(plain, hashed)

# ── JWT Token ─────────────────────────────

def create_token(data: dict) -> str:
    to_encode = data.copy()
    expire    = datetime.utcnow() + timedelta(hours=EXPIRE_HOURS)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

def verify_token(token: str) -> Optional[dict]:
    try:
        return jwt.decode(
            token, SECRET_KEY, algorithms=[ALGORITHM]
        )
    except JWTError:
        return None

# ── Current User ──────────────────────────

def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Invalid or expired token",
        headers={"WWW-Authenticate": "Bearer"},
    )
    payload = verify_token(token)
    if not payload:
        raise credentials_exception

    email = payload.get("sub")
    if not email:
        raise credentials_exception

    user = db.query(models.User).filter(
        models.User.email == email
    ).first()

    if not user:
        raise credentials_exception

    return user