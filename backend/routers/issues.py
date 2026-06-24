from fastapi import APIRouter, HTTPException, Query
from typing import Optional
from models.schemas import IssueCreate, IssueUpdate

router = APIRouter()

# Note: In production, these operations are handled directly by the frontend via Firebase SDK.
# This backend layer provides additional AI processing and admin operations.


@router.get("/")
async def list_issues(
    category: Optional[str] = Query(None),
    severity: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    limit: int = Query(50, le=100),
):
    """
    List issues with optional filters.
    In production, fetches from Firestore Admin SDK.
    """
    return {
        "message": "Use Firebase SDK on frontend for real-time issue data",
        "filters": {"category": category, "severity": severity, "status": status},
        "limit": limit,
    }


@router.post("/")
async def create_issue(issue: IssueCreate):
    """
    Create a new issue.
    In production, creates in Firestore via Admin SDK after AI analysis.
    """
    return {
        "message": "Issue creation is handled via Firebase SDK. Use /api/ai/analyze-image first.",
        "issue": issue.dict(),
    }


@router.put("/{issue_id}/status")
async def update_status(issue_id: str, update: IssueUpdate):
    """Update issue status (Admin only)."""
    return {
        "issueId": issue_id,
        "newStatus": update.status,
        "message": "Status update would apply here with Firebase Admin SDK",
    }


@router.post("/{issue_id}/vote")
async def vote_issue(issue_id: str, user_id: str = Query(...)):
    """Upvote an issue."""
    return {"issueId": issue_id, "userId": user_id, "action": "voted"}


@router.get("/{issue_id}")
async def get_issue(issue_id: str):
    """Get a single issue by ID."""
    return {"issueId": issue_id, "message": "Fetch from Firestore using issue ID"}
