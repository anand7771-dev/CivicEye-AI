from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import uvicorn

from routers import issues, ai, analytics, emergency

app = FastAPI(
    title="CivicEye AI API",
    description="Backend API for CivicEye AI – AI-powered civic intelligence platform",
    version="1.0.0",
)

# CORS – Allow frontend and Cloud Run
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(issues.router, prefix="/api/issues", tags=["Issues"])
app.include_router(ai.router, prefix="/api/ai", tags=["Gemini AI"])
app.include_router(analytics.router, prefix="/api/analytics", tags=["Analytics"])
app.include_router(emergency.router, prefix="/api/emergency", tags=["Emergency"])


@app.get("/")
async def root():
    return {
        "name": "CivicEye AI API",
        "version": "1.0.0",
        "status": "operational",
        "tagline": "See. Report. Solve.",
        "tech": ["FastAPI", "Gemini AI", "Firestore", "Cloud Run"],
    }


@app.get("/health")
async def health():
    return {"status": "healthy", "service": "civiceye-api"}


if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
