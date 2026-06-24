from fastapi import APIRouter
from models.schemas import EmergencyAlertCreate

router = APIRouter()


@router.get("/")
async def get_alerts():
    """Get active emergency alerts."""
    return {"message": "Emergency alerts fetched from Firestore via Firebase SDK"}


@router.post("/")
async def create_alert(alert: EmergencyAlertCreate):
    """Create emergency alert."""
    return {
        "message": "Emergency alert would be created in Firestore",
        "alert": alert.dict()
    }
