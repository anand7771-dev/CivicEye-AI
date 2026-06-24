from pydantic import BaseModel, Field
from typing import Optional, List
from enum import Enum
from datetime import datetime


class IssueCategory(str, Enum):
    pothole = "pothole"
    garbage = "garbage"
    water_leakage = "water_leakage"
    broken_streetlight = "broken_streetlight"
    road_damage = "road_damage"
    drainage = "drainage"
    public_safety = "public_safety"
    emergency = "emergency"


class IssueSeverity(str, Enum):
    low = "low"
    medium = "medium"
    high = "high"
    critical = "critical"


class IssueStatus(str, Enum):
    reported = "reported"
    under_review = "under_review"
    in_progress = "in_progress"
    resolved = "resolved"


class GeoLocation(BaseModel):
    lat: float
    lng: float
    address: str


class IssueCreate(BaseModel):
    title: str
    description: str
    category: IssueCategory
    severity: IssueSeverity
    location: GeoLocation
    imageUrl: Optional[str] = None
    userId: str
    userName: str


class IssueUpdate(BaseModel):
    status: IssueStatus
    adminNote: Optional[str] = None


class AnalyzeImageRequest(BaseModel):
    description: Optional[str] = ""
    # image sent as base64 in body
    image_base64: str
    mime_type: str = "image/jpeg"


class AnalyzeImageResponse(BaseModel):
    category: str
    severity: str
    title: str
    summary: str
    actionSteps: List[str]
    priorityScore: int
    safetyRisk: int
    populationImpact: int
    confidence: float


class ChatRequest(BaseModel):
    message: str
    history: Optional[List[dict]] = []


class ChatResponse(BaseModel):
    response: str


class PriorityScoreRequest(BaseModel):
    title: str
    description: str
    category: str
    severity: str
    location: str
    duplicate_count: int = 0


class PriorityScoreResponse(BaseModel):
    priorityScore: int
    reasoning: str


class DuplicateDetectRequest(BaseModel):
    title: str
    description: str
    category: str
    location: str
    existing_issues: List[dict] = []


class EmergencyAlertCreate(BaseModel):
    type: str
    title: str
    description: str
    location: GeoLocation
    severity: str = "critical"
    reportedBy: str
