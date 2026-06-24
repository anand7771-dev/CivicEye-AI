from fastapi import APIRouter

router = APIRouter()


@router.get("/")
async def get_analytics():
    """
    Get platform analytics summary.
    In production, aggregates from Firestore Admin SDK.
    """
    return {
        "message": "Analytics computed from Firestore via Firebase SDK on frontend",
        "metrics": [
            "totalIssues", "resolvedIssues", "activeUsers",
            "emergencyAlerts", "avgResolutionDays",
            "resolutionEfficiency", "communityEngagementScore"
        ]
    }
