# backend/routers/users.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional
from database import get_db
import db_models as models
import schemas
import auth
import logging

class DoctorNotes(BaseModel):
    doctor_notes: Optional[str] = ""

logger = logging.getLogger(__name__)

router = APIRouter(
    prefix="/api/v1/users",
    tags=["Authentication"]
)

# ── Register ──────────────────────────────
@router.post("/register", response_model=schemas.Token)
def register(
    user_data: schemas.UserRegister,
    db: Session = Depends(get_db)
):
    """Register a new user"""
    existing = db.query(models.User).filter(
        models.User.email == user_data.email
    ).first()

    if existing:
        raise HTTPException(
            status_code=400,
            detail="Yeh email pehle se registered hai! Login karo."
        )

    if user_data.role == "doctor" and not user_data.pmdc:
        raise HTTPException(
            status_code=400,
            detail="Doctor ke liye PMDC number zaroori hai!"
        )

    new_user = models.User(
        full_name = user_data.full_name,
        email     = user_data.email,
        password  = auth.hash_password(user_data.password),
        role      = user_data.role,
        pmdc      = user_data.pmdc,
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    token = auth.create_token({"sub": new_user.email})
    logger.info(f"New user registered: {new_user.email}")

    return {
        "access_token": token,
        "token_type"  : "bearer",
        "user"        : new_user
    }


# ── Login ─────────────────────────────────
@router.post("/login", response_model=schemas.Token)
def login(
    user_data: schemas.UserLogin,
    db: Session = Depends(get_db)
):
    """Login existing user"""
    db_user = db.query(models.User).filter(
        models.User.email == user_data.email
    ).first()

    if not db_user:
        raise HTTPException(
            status_code=401,
            detail="Email registered nahi hai!"
        )

    if not auth.verify_password(user_data.password, db_user.password):
        raise HTTPException(
            status_code=401,
            detail="Galat password! Dobara try karo."
        )

    token = auth.create_token({"sub": db_user.email})
    logger.info(f"User logged in: {db_user.email}")

    return {
        "access_token": token,
        "token_type"  : "bearer",
        "user"        : db_user
    }


# ── Get Profile ───────────────────────────
@router.get("/me", response_model=schemas.UserResponse)
def get_profile(
    current_user = Depends(auth.get_current_user)
):
    return current_user


# ── Get My Scans ──────────────────────────
@router.get("/scans", response_model=list[schemas.ScanResponse])
def get_my_scans(
    current_user = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    return db.query(models.Scan).filter(
        models.Scan.user_id == current_user.id
    ).all()


def _enrich_scans(scans, db):
    """Attach patient_name and patient_email to each scan."""
    result = []
    user_cache: dict = {}
    for scan in scans:
        if scan.user_id not in user_cache:
            u = db.query(models.User).filter(models.User.id == scan.user_id).first()
            user_cache[scan.user_id] = u
        u = user_cache.get(scan.user_id)
        result.append({
            "id"           : scan.id,
            "user_id"      : scan.user_id,
            "patient_name" : u.full_name if u else "Unknown",
            "patient_email": u.email     if u else "",
            "scan_type"    : scan.scan_type,
            "filename"     : scan.filename,
            "report"       : scan.report,
            "severity"     : scan.severity,
            "confidence"   : scan.confidence,
            "time_seconds" : scan.time_seconds,
            "status"       : scan.status,
            "doctor_notes" : scan.doctor_notes,
            "created_at"   : str(scan.created_at),
        })
    return result


# ── Doctor: Pending Scans ─────────────────
@router.get("/doctor/pending-scans")
def get_pending_scans(
    current_user = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.role != "doctor":
        raise HTTPException(status_code=403, detail="Doctors only")
    scans = db.query(models.Scan).filter(
        models.Scan.status == "pending"
    ).order_by(models.Scan.created_at.desc()).all()
    return _enrich_scans(scans, db)


# ── Doctor: All Scans ─────────────────────
@router.get("/doctor/all-scans")
def get_all_scans(
    current_user = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.role != "doctor":
        raise HTTPException(status_code=403, detail="Doctors only")
    scans = db.query(models.Scan).order_by(models.Scan.created_at.desc()).all()
    return _enrich_scans(scans, db)


# ── Doctor: Approve Scan ──────────────────
@router.put("/doctor/approve-scan/{scan_id}")
def approve_scan(
    scan_id: int,
    body: DoctorNotes = DoctorNotes(),
    current_user = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.role != "doctor":
        raise HTTPException(status_code=403, detail="Doctors only")

    scan = db.query(models.Scan).filter(models.Scan.id == scan_id).first()
    if not scan:
        raise HTTPException(status_code=404, detail="Scan not found")

    scan.status = "approved"
    if body.doctor_notes:
        scan.doctor_notes = body.doctor_notes
    db.commit()

    return {"message": "Scan approved ✅", "scan_id": scan_id}


# ── Doctor: Reject Scan ───────────────────
@router.put("/doctor/reject-scan/{scan_id}")
def reject_scan(
    scan_id: int,
    body: DoctorNotes = DoctorNotes(),
    current_user = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.role != "doctor":
        raise HTTPException(status_code=403, detail="Doctors only")

    scan = db.query(models.Scan).filter(models.Scan.id == scan_id).first()
    if not scan:
        raise HTTPException(status_code=404, detail="Scan not found")

    scan.status = "rejected"
    if body.doctor_notes:
        scan.doctor_notes = body.doctor_notes
    db.commit()

    return {"message": "Scan rejected ❌", "scan_id": scan_id}


# ── Doctor: Approve Scan (with notes) ─────────────────
@router.put("/doctor/approve/{scan_id}")
def approve_scan_with_notes(
    scan_id: int,
    notes: str = "",
    current_user = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.role != "doctor":
        raise HTTPException(status_code=403, detail="Sirf doctors access kar sakte hain!")
    scan = db.query(models.Scan).filter(models.Scan.id == scan_id).first()
    if not scan:
        raise HTTPException(status_code=404, detail="Scan nahi mila!")
    scan.status = "approved"
    scan.doctor_notes = notes
    db.commit()
    return {"message": "Scan approve ho gaya!"}


# ── Doctor: Reject Scan (with notes) ──────────────────
@router.put("/doctor/reject/{scan_id}")
def reject_scan_with_notes(
    scan_id: int,
    notes: str = "",
    current_user = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.role != "doctor":
        raise HTTPException(status_code=403, detail="Sirf doctors access kar sakte hain!")
    scan = db.query(models.Scan).filter(models.Scan.id == scan_id).first()
    if not scan:
        raise HTTPException(status_code=404, detail="Scan nahi mila!")
    scan.status = "rejected"
    scan.doctor_notes = notes
    db.commit()
    return {"message": "Scan flag ho gaya!"}