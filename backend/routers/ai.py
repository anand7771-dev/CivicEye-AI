from fastapi import APIRouter, HTTPException
from models.schemas import AnalyzeImageRequest, ChatRequest, PriorityScoreRequest, DuplicateDetectRequest
from services import gemini_service

router = APIRouter()


@router.post("/analyze-image")
async def analyze_image(request: AnalyzeImageRequest):
    """Analyze a civic issue image using Gemini Vision AI."""
    try:
        result = await gemini_service.analyze_issue_image(
            request.image_base64,
            request.mime_type,
            request.description or "",
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Gemini analysis failed: {str(e)}")


@router.post("/generate-priority-score")
async def generate_priority_score(request: PriorityScoreRequest):
    """Generate a Civic Priority Score (1-100) for an issue."""
    try:
        result = await gemini_service.generate_priority_score(
            request.title,
            request.description,
            request.category,
            request.severity,
            request.location,
            request.duplicate_count,
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Priority score generation failed: {str(e)}")


@router.post("/detect-duplicates")
async def detect_duplicates(request: DuplicateDetectRequest):
    """Detect if a new issue is a duplicate of existing issues."""
    try:
        result = await gemini_service.detect_duplicates(
            {
                "title": request.title,
                "description": request.description,
                "category": request.category,
                "location": request.location,
            },
            request.existing_issues,
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Duplicate detection failed: {str(e)}")


@router.post("/chat")
async def chat(request: ChatRequest):
    """Chat with CivicEye AI Assistant powered by Gemini."""
    try:
        response = await gemini_service.chat(request.message, request.history or [])
        return {"response": response}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Chat failed: {str(e)}")
