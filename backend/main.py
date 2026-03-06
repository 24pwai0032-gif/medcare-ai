# backend/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import engine
import db_models as models
from routers import imaging
from routers.users import router as users_router
import logging

# Logging setup
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s %(levelname)s %(message)s"
)
logger = logging.getLogger(__name__)

# DB tables create
models.Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="MedCare AI API",
    description="Pakistan's First AI Medical Platform",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(imaging.router)
app.include_router(users_router)

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
def health():
    return {
        "status"  : "healthy ✅",
        "database": "connected ✅",
        "ai_model": "Colab/ngrok"
    }

@app.on_event("startup")
async def startup():
    logger.info("🏥 MedCare AI Backend Started!")
    logger.info("📦 Database: PostgreSQL — medcare_db")
    logger.info("📖 Docs: http://localhost:8000/docs")