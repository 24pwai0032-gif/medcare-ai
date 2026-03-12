# backend/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from database import engine
import db_models as models
from routers import imaging
from routers.users import router as users_router
import logging
import os

# Logging setup
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s %(levelname)s %(message)s"
)
logger = logging.getLogger(__name__)

# DB tables create
try:
    models.Base.metadata.create_all(bind=engine)
    logger.info("✅ Database connected!")

    # ── Safe migration: add missing columns to existing tables ──
    from sqlalchemy import inspect, text
    inspector = inspect(engine)
    if "scans" in inspector.get_table_names():
        existing_columns = {col["name"] for col in inspector.get_columns("scans")}
        if "image_path" not in existing_columns:
            with engine.begin() as conn:
                conn.execute(text("ALTER TABLE scans ADD COLUMN image_path TEXT"))
            logger.info("✅ Migration: added 'image_path' column to scans table")

except Exception as e:
    logger.error(f"DB Error: {e}")
    logger.info("⚠️ Starting without DB...")

app = FastAPI(
    title="MedCare AI API",
    description="Pakistan's First AI Medical Platform",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(imaging.router)
app.include_router(users_router)

# Serve uploaded scan images
scans_dir = os.path.join(os.path.dirname(__file__), "data", "scans")
os.makedirs(scans_dir, exist_ok=True)
app.mount("/scans", StaticFiles(directory=scans_dir), name="scans")

@app.get("/")
def root():
    return {
        "app"      : "MedCare AI 🏥",
        "version"  : "1.0.0",
        "status"   : "running ✅",
        "docs"     : "/docs",
        "developer": "Syed Hassan Tayyab",
        "cohort"   : "Atomcamp 15"
    }

@app.get("/health")
async def health():
    from models.llava_model import check_gemini_health
    ai_status = await check_gemini_health()
    return {
        "status"  : "healthy ✅",
        "database": "connected ✅",
        "ai_model": ai_status,
    }

@app.on_event("startup")
async def startup():
    import os
    logger.info("🏥 MedCare AI Backend Started!")
    logger.info("📦 Database: PostgreSQL — medcare_db")
    logger.info("📖 Docs: http://localhost:8000/docs")
    if not os.getenv("GEMINI_API_KEY"):
        logger.warning("⚠️ GEMINI_API_KEY not set — AI analysis will fail!")
    else:
        logger.info("✅ Google Gemini API key configured")