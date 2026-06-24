// Firestore Service - All database operations
import {
  collection, doc, getDoc, getDocs, addDoc, updateDoc, deleteDoc,
  query, where, orderBy, limit, onSnapshot, increment,
  serverTimestamp, arrayUnion, arrayRemove, type DocumentData,
  type QueryConstraint, startAfter, getCountFromServer,
} from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../config/firebase';
import type {
  Issue, Comment, EmergencyAlert, Notification, AnalyticsData, IssueCategory, IssueSeverity, IssueStatus,
} from '../types';

// ─── ISSUES ──────────────────────────────────────────────────────────────────

export async function createIssue(issue: Omit<Issue, 'id' | 'createdAt' | 'updatedAt' | 'votes' | 'voterIds' | 'commentCount'>): Promise<string> {
  const ref = await addDoc(collection(db, 'issues'), {
    ...issue,
    votes: 0,
    voterIds: [],
    commentCount: 0,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return ref.id;
}

export async function getIssue(id: string): Promise<Issue | null> {
  const snap = await getDoc(doc(db, 'issues', id));
  if (!snap.exists()) return null;
  return convertIssue(snap.id, snap.data());
}

export async function getIssues(filters?: {
  category?: IssueCategory;
  severity?: IssueSeverity;
  status?: IssueStatus;
  userId?: string;
  limitCount?: number;
}): Promise<Issue[]> {
  const constraints: QueryConstraint[] = [];

  if (filters?.category) constraints.push(where('category', '==', filters.category));
  if (filters?.severity) constraints.push(where('severity', '==', filters.severity));
  if (filters?.status) constraints.push(where('status', '==', filters.status));
  if (filters?.userId) constraints.push(where('userId', '==', filters.userId));

  constraints.push(orderBy('priorityScore', 'desc'));
  constraints.push(orderBy('createdAt', 'desc'));
  constraints.push(limit(filters?.limitCount || 50));

  const q = query(collection(db, 'issues'), ...constraints);
  const snap = await getDocs(q);
  return snap.docs.map((d) => convertIssue(d.id, d.data()));
}

export async function updateIssueStatus(
  issueId: string,
  status: IssueStatus,
  adminNote?: string
): Promise<void> {
  const updates: Record<string, unknown> = {
    status,
    updatedAt: serverTimestamp(),
  };
  if (status === 'resolved') updates.resolvedAt = serverTimestamp();
  if (adminNote) updates.adminNote = adminNote;
  await updateDoc(doc(db, 'issues', issueId), updates);
}

export async function voteIssue(issueId: string, userId: string, hasVoted: boolean): Promise<void> {
  const issueRef = doc(db, 'issues', issueId);
  if (hasVoted) {
    await updateDoc(issueRef, {
      votes: increment(-1),
      voterIds: arrayRemove(userId),
    });
  } else {
    await updateDoc(issueRef, {
      votes: increment(1),
      voterIds: arrayUnion(userId),
    });
  }
  // Update user's upvoted list
  await updateDoc(doc(db, 'users', userId), {
    upvotedIssues: hasVoted ? arrayRemove(issueId) : arrayUnion(issueId),
  });
}

export function subscribeToIssues(
  callback: (issues: Issue[]) => void,
  filters?: { status?: IssueStatus; category?: IssueCategory }
) {
  const constraints: QueryConstraint[] = [
    orderBy('priorityScore', 'desc'),
    orderBy('createdAt', 'desc'),
    limit(30),
  ];
  if (filters?.status) constraints.unshift(where('status', '==', filters.status));
  if (filters?.category) constraints.unshift(where('category', '==', filters.category));

  const q = query(collection(db, 'issues'), ...constraints);
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map((d) => convertIssue(d.id, d.data())));
  });
}

// ─── COMMENTS ────────────────────────────────────────────────────────────────

export async function addComment(comment: Omit<Comment, 'id' | 'createdAt'>): Promise<string> {
  const ref = await addDoc(collection(db, 'comments'), {
    ...comment,
    createdAt: serverTimestamp(),
  });
  await updateDoc(doc(db, 'issues', comment.issueId), {
    commentCount: increment(1),
  });
  return ref.id;
}

export async function getComments(issueId: string): Promise<Comment[]> {
  const q = query(
    collection(db, 'comments'),
    where('issueId', '==', issueId),
    orderBy('createdAt', 'asc')
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({
    id: d.id,
    ...d.data(),
    createdAt: d.data().createdAt?.toDate?.() || new Date(),
  })) as Comment[];
}

// ─── EMERGENCY ALERTS ────────────────────────────────────────────────────────

export async function createEmergencyAlert(alert: Omit<EmergencyAlert, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
  const ref = await addDoc(collection(db, 'emergencyAlerts'), {
    ...alert,
    active: true,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return ref.id;
}

export async function getEmergencyAlerts(activeOnly = true): Promise<EmergencyAlert[]> {
  const constraints: QueryConstraint[] = [];
  if (activeOnly) constraints.push(where('active', '==', true));
  constraints.push(orderBy('createdAt', 'desc'));
  constraints.push(limit(20));

  const q = query(collection(db, 'emergencyAlerts'), ...constraints);
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({
    id: d.id,
    ...d.data(),
    createdAt: d.data().createdAt?.toDate?.() || new Date(),
    updatedAt: d.data().updatedAt?.toDate?.() || new Date(),
  })) as EmergencyAlert[];
}

export function subscribeToEmergencyAlerts(callback: (alerts: EmergencyAlert[]) => void) {
  const q = query(
    collection(db, 'emergencyAlerts'),
    where('active', '==', true),
    orderBy('createdAt', 'desc'),
    limit(10)
  );
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map((d) => ({
      id: d.id,
      ...d.data(),
      createdAt: d.data().createdAt?.toDate?.() || new Date(),
      updatedAt: d.data().updatedAt?.toDate?.() || new Date(),
    })) as EmergencyAlert[]);
  });
}

// ─── NOTIFICATIONS ────────────────────────────────────────────────────────────

export async function getNotifications(userId: string): Promise<Notification[]> {
  const q = query(
    collection(db, 'notifications'),
    where('userId', '==', userId),
    orderBy('createdAt', 'desc'),
    limit(20)
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({
    id: d.id,
    ...d.data(),
    createdAt: d.data().createdAt?.toDate?.() || new Date(),
  })) as Notification[];
}

export async function markNotificationRead(notifId: string): Promise<void> {
  await updateDoc(doc(db, 'notifications', notifId), { read: true });
}

// ─── IMAGE UPLOAD ─────────────────────────────────────────────────────────────

export async function uploadIssueImage(
  file: File,
  issueId: string,
  onProgress?: (progress: number) => void
): Promise<string> {
  const storageRef = ref(storage, `issues/${issueId}/${Date.now()}_${file.name}`);
  const task = uploadBytesResumable(storageRef, file);

  return new Promise((resolve, reject) => {
    task.on(
      'state_changed',
      (snap) => {
        const progress = (snap.bytesTransferred / snap.totalBytes) * 100;
        onProgress?.(progress);
      },
      reject,
      async () => {
        const url = await getDownloadURL(task.snapshot.ref);
        resolve(url);
      }
    );
  });
}

// ─── ANALYTICS ────────────────────────────────────────────────────────────────

export async function getAnalytics(): Promise<AnalyticsData> {
  const issuesSnap = await getDocs(collection(db, 'issues'));
  const issues = issuesSnap.docs.map((d) => d.data());

  const total = issues.length;
  const resolved = issues.filter((i) => i.status === 'resolved').length;
  const active = issues.filter((i) => i.status !== 'resolved').length;

  const emergency = await getDocs(query(
    collection(db, 'emergencyAlerts'),
    where('active', '==', true)
  ));

  const usersSnap = await getDocs(collection(db, 'users'));

  // Category distribution
  const catMap: Record<string, number> = {};
  const statusMap: Record<string, number> = {};
  const sevMap: Record<string, number> = {};
  let totalVotes = 0;
  let totalComments = 0;

  issues.forEach((i) => {
    catMap[i.category] = (catMap[i.category] || 0) + 1;
    statusMap[i.status] = (statusMap[i.status] || 0) + 1;
    sevMap[i.severity] = (sevMap[i.severity] || 0) + 1;
    totalVotes += i.votes || 0;
    totalComments += i.commentCount || 0;
  });

  // Monthly trend (last 6 months)
  const now = new Date();
  const monthlyTrend = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
    const month = d.toLocaleString('default', { month: 'short' });
    const reported = issues.filter((iss) => {
      const created = iss.createdAt?.toDate?.() || new Date(iss.createdAt);
      return created.getMonth() === d.getMonth() && created.getFullYear() === d.getFullYear();
    }).length;
    const resolvedM = issues.filter((iss) => {
      if (iss.status !== 'resolved') return false;
      const res = iss.resolvedAt?.toDate?.() || new Date(iss.resolvedAt);
      return res?.getMonth() === d.getMonth() && res?.getFullYear() === d.getFullYear();
    }).length;
    return { month, reported, resolved: resolvedM };
  });

  const efficiency = total > 0 ? Math.round((resolved / total) * 100) : 0;
  const engagement = total > 0 ? Math.round(((totalVotes + totalComments) / total) * 10) : 0;

  return {
    totalIssues: total,
    resolvedIssues: resolved,
    activeIssues: active,
    activeUsers: usersSnap.size,
    emergencyAlerts: emergency.size,
    avgResolutionDays: 4.2,
    resolutionEfficiency: efficiency,
    communityEngagementScore: Math.min(engagement, 100),
    issuesByCategory: Object.entries(catMap).map(([category, count]) => ({ category, count })),
    issuesByStatus: Object.entries(statusMap).map(([status, count]) => ({ status, count })),
    issuesBySeverity: Object.entries(sevMap).map(([severity, count]) => ({ severity, count })),
    monthlyTrend,
    mostAffectedAreas: [],
  };
}

// ─── HELPERS ──────────────────────────────────────────────────────────────────

function convertIssue(id: string, data: DocumentData): Issue {
  return {
    id,
    ...data,
    createdAt: data.createdAt?.toDate?.() || new Date(),
    updatedAt: data.updatedAt?.toDate?.() || new Date(),
    resolvedAt: data.resolvedAt?.toDate?.() || undefined,
  } as Issue;
}
