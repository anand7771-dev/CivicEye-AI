// Core Types for CivicEye AI

export type IssueCategory =
  | 'pothole'
  | 'garbage'
  | 'water_leakage'
  | 'broken_streetlight'
  | 'road_damage'
  | 'drainage'
  | 'public_safety'
  | 'emergency';

export type IssueSeverity = 'low' | 'medium' | 'high' | 'critical';

export type IssueStatus =
  | 'reported'
  | 'under_review'
  | 'in_progress'
  | 'resolved';

export type UserRole = 'citizen' | 'admin';

export type EmergencyType =
  | 'flood'
  | 'road_accident'
  | 'fire'
  | 'electrical'
  | 'water_contamination'
  | 'public_emergency';

export interface GeoLocation {
  lat: number;
  lng: number;
  address: string;
}

export interface User {
  uid: string;
  name: string;
  email: string;
  photoURL?: string;
  role: UserRole;
  createdAt: Date;
  reportsCount: number;
  resolvedCount: number;
  upvotedIssues: string[];
}

export interface AIAnalysis {
  category: IssueCategory;
  severity: IssueSeverity;
  summary: string;
  actionSteps: string[];
  priorityScore: number;
  safetyRisk: number;
  populationImpact: number;
  confidence: number;
}

export interface Issue {
  id: string;
  title: string;
  description: string;
  category: IssueCategory;
  severity: IssueSeverity;
  status: IssueStatus;
  priorityScore: number;
  location: GeoLocation;
  imageUrl?: string;
  aiSummary?: string;
  actionSteps?: string[];
  aiAnalysis?: AIAnalysis;
  userId: string;
  userName: string;
  userPhotoURL?: string;
  votes: number;
  voterIds: string[];
  commentCount: number;
  isDuplicate?: boolean;
  duplicateOf?: string;
  tags?: string[];
  createdAt: Date;
  updatedAt: Date;
  resolvedAt?: Date;
}

export interface Comment {
  id: string;
  issueId: string;
  userId: string;
  userName: string;
  userPhotoURL?: string;
  text: string;
  createdAt: Date;
}

export interface EmergencyAlert {
  id: string;
  type: EmergencyType;
  title: string;
  description: string;
  location: GeoLocation;
  severity: IssueSeverity;
  reportedBy: string;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Notification {
  id: string;
  userId: string;
  message: string;
  type: 'status_update' | 'comment' | 'upvote' | 'emergency' | 'system';
  issueId?: string;
  read: boolean;
  createdAt: Date;
}

export interface AnalyticsData {
  totalIssues: number;
  resolvedIssues: number;
  activeIssues: number;
  activeUsers: number;
  emergencyAlerts: number;
  avgResolutionDays: number;
  resolutionEfficiency: number;
  communityEngagementScore: number;
  issuesByCategory: { category: string; count: number }[];
  issuesByStatus: { status: string; count: number }[];
  issuesBySeverity: { severity: string; count: number }[];
  monthlyTrend: { month: string; reported: number; resolved: number }[];
  mostAffectedAreas: { area: string; count: number; lat: number; lng: number }[];
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface DuplicateDetectionResult {
  isDuplicate: boolean;
  similarIssueId?: string;
  similarIssueTitle?: string;
  similarity?: number;
  message: string;
}

// Category display helpers
export const CATEGORY_LABELS: Record<IssueCategory, string> = {
  pothole: 'Pothole',
  garbage: 'Garbage',
  water_leakage: 'Water Leakage',
  broken_streetlight: 'Broken Streetlight',
  road_damage: 'Road Damage',
  drainage: 'Drainage Issue',
  public_safety: 'Public Safety',
  emergency: 'Emergency',
};

export const CATEGORY_ICONS: Record<IssueCategory, string> = {
  pothole: '🕳️',
  garbage: '🗑️',
  water_leakage: '💧',
  broken_streetlight: '💡',
  road_damage: '🚧',
  drainage: '🌊',
  public_safety: '🚨',
  emergency: '🆘',
};

export const SEVERITY_COLORS: Record<IssueSeverity, string> = {
  low: '#10B981',
  medium: '#F59E0B',
  high: '#EF4444',
  critical: '#DC2626',
};

export const STATUS_LABELS: Record<IssueStatus, string> = {
  reported: 'Reported',
  under_review: 'Under Review',
  in_progress: 'In Progress',
  resolved: 'Resolved',
};

export const EMERGENCY_LABELS: Record<EmergencyType, string> = {
  flood: 'Flood',
  road_accident: 'Road Accident',
  fire: 'Fire Hazard',
  electrical: 'Electrical Hazard',
  water_contamination: 'Water Contamination',
  public_emergency: 'Public Emergency',
};
