# backend/models.py
from sqlalchemy import Column, Integer, String, DateTime, Float, Text, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base

class User(Base):
    __tablename__ = "users"

    id         = Column(Integer, primary_key=True, index=True)
    full_name  = Column(String, nullable=False)
    email      = Column(String, unique=True, index=True, nullable=False)
    password   = Column(String, nullable=False)
    role       = Column(String, default="patient")
    pmdc       = Column(String, nullable=True)
    is_active  = Column(Boolean, default=True)
    created_at = Column(DateTime, server_default=func.now())

    scans = relationship("Scan", back_populates="user")


class Scan(Base):
    __tablename__ = "scans"

    id           = Column(Integer, primary_key=True, index=True)
    user_id      = Column(Integer, ForeignKey("users.id"))
    scan_type    = Column(String, nullable=False)
    filename     = Column(String, nullable=False)
    image_path   = Column(String, nullable=True)
    report       = Column(Text, nullable=True)
    severity     = Column(String, nullable=True)
    confidence   = Column(Float, nullable=True)
    time_seconds = Column(Float, nullable=True)
    status       = Column(String, default="pending")
    doctor_notes = Column(Text, nullable=True)
    created_at   = Column(DateTime, server_default=func.now())

    user = relationship("User", back_populates="scans")