# backend/schemas.py
from pydantic import BaseModel, EmailStr, field_validator
from typing import Optional
from datetime import datetime

# ── User Schemas ──────────────────────────

class UserRegister(BaseModel):
    full_name : str
    email     : EmailStr
    password  : str
    role      : str = "patient"
    pmdc      : Optional[str] = None

    @field_validator('full_name')
    def name_valid(cls, v):
        if len(v.strip()) < 2:
            raise ValueError('Name 2+ characters hona chahiye!')
        return v.strip()

    @field_validator('password')
    def password_valid(cls, v):
        if len(v) < 6:
            raise ValueError('Password 6+ characters hona chahiye!')
        return v

    @field_validator('role')
    def role_valid(cls, v):
        if v not in ['patient', 'doctor']:
            raise ValueError('Role patient ya doctor hona chahiye!')
        return v

class UserLogin(BaseModel):
    email    : EmailStr
    password : str

class UserResponse(BaseModel):
    id        : int
    full_name : str
    email     : str
    role      : str
    created_at: datetime

    class Config:
        from_attributes = True

# ── Token Schemas ─────────────────────────

class Token(BaseModel):
    access_token : str
    token_type   : str
    user         : UserResponse

# ── Scan Schemas ──────────────────────────

class ScanResponse(BaseModel):
    id           : int
    user_id      : Optional[int] = None
    scan_type    : str
    filename     : Optional[str] = None
    report       : Optional[str] = None
    severity     : Optional[str] = None
    confidence   : Optional[float] = None
    time_seconds : Optional[float] = None
    status       : str
    doctor_notes : Optional[str] = None
    created_at   : datetime

    class Config:
        from_attributes = True