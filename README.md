# 👁️ CivicEye AI

> **See. Report. Solve. – Empowering Communities Through AI**

[![Firebase Hosting](https://img.shields.io/badge/Hosted%20on-Firebase-orange?logo=firebase)](https://firebase.google.com)
[![Powered by Gemini](https://img.shields.io/badge/Powered%20by-Gemini%20AI-purple?logo=google)](https://ai.google.dev)
[![Google Maps](https://img.shields.io/badge/Maps-Google%20Maps-blue?logo=googlemaps)](https://maps.google.com)
[![Cloud Run](https://img.shields.io/badge/Backend-Cloud%20Run-blue?logo=googlecloud)](https://cloud.google.com/run)

---

## 🏆 Hackathon Track
**Community Hero – Hyperlocal Problem Solver** 🚀  
Google Technologies Hackathon 2026

---

## 🎯 Problem Statement
Citizens struggle to report and track local civic issues. Existing systems are fragmented, slow, and lack transparency.

## 💡 Solution
CivicEye AI is an **AI-powered hyperlocal civic intelligence platform** that enables citizens to identify, report, prioritize, and track community issues in real time using **Gemini AI, Google Maps, Firebase, and Google Cloud Run**.

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React + TypeScript + Vite |
| Styling | Tailwind CSS + Framer Motion |
| Components | Material UI |
| AI | **Gemini 1.5 Flash** (Image Analysis, Chatbot, Priority Scoring) |
| Maps | **Google Maps Platform** |
| Auth | **Firebase Authentication** (Google OAuth + Email) |
| Database | **Cloud Firestore** |
| Storage | **Firebase Storage** |
| Backend | **FastAPI** (Python) |
| Deployment | **Firebase Hosting** (Frontend) + **Google Cloud Run** (Backend) |

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Python 3.11+
- Firebase CLI (`npm install -g firebase-tools`)

### 1. Clone & Setup
```bash
git clone <your-repo>
cd CivicEye-AI
```

### 2. Firebase Setup
1. Go to [Firebase Console](https://console.firebase.google.com)
2. Create a new project: **civiceye-ai**
3. Enable **Authentication** → Google Sign-In + Email/Password
4. Enable **Firestore Database** (Start in production mode)
5. Enable **Storage**
6. Copy your Firebase config

### 3. Get API Keys
- **Gemini AI**: [Google AI Studio](https://aistudio.google.com) → Create API Key
- **Google Maps**: [Google Cloud Console](https://console.cloud.google.com) → APIs & Services → Enable Maps JavaScript API + Geocoding API

### 4. Configure Environment Variables
```bash
cp frontend/.env.local.example frontend/.env.local
```

Edit `frontend/.env.local`:
```env
VITE_FIREBASE_API_KEY=your_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_GEMINI_API_KEY=your_gemini_api_key
VITE_GOOGLE_MAPS_API_KEY=your_maps_key
```

### 5. Run Frontend
```bash
cd frontend
npm install
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) 🎉

### 6. Run Backend (Optional)
```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload
```
API docs at [http://localhost:8000/docs](http://localhost:8000/docs)

---

## 🗺️ Application Pages

| Page | Route | Description |
|------|-------|-------------|
| Landing | `/` | Hero, Features, SDG Impact, Testimonials |
| Login | `/login` | Google OAuth + Email sign-in |
| Register | `/register` | Citizen/Admin role selection |
| Dashboard | `/dashboard` | Issue feed, filters, search |
| Report Issue | `/report` | AI-powered issue reporting |
| Issue Details | `/issues/:id` | Status timeline, comments, voting |
| Analytics | `/analytics` | AI analytics with charts |
| Admin | `/admin` | Issue management, status updates |
| Emergency | `/emergency` | Live emergency alerts |
| AI Assistant | `/assistant` | Gemini chatbot |
| Profile | `/profile` | User stats, badges, history |

---

## 🧠 AI Features (Powered by Gemini)

### 1. Image Analysis
Upload a photo → Gemini Vision analyzes and returns:
- Issue category (8 types)
- Severity level (Low/Medium/High/Critical)
- Professional summary
- Action steps
- Priority Score (1-100)

### 2. Civic Priority Score
Unique scoring system (1-100) based on:
- Severity level
- Safety risk assessment
- Population impact
- Location importance
- Number of duplicate reports

### 3. Duplicate Detection
Gemini compares new reports with existing issues in the same area and:
- Detects duplicates
- Merges reports automatically
- Increases priority score

### 4. CivicEye Assistant (Chatbot)
Gemini-powered civic helpdesk that can:
- Guide issue reporting
- Provide emergency assistance
- Answer civic questions
- Suggest emergency services

---

## 📊 Firestore Schema

```
users/{uid}
  - name, email, photoURL, role
  - reportsCount, resolvedCount
  - upvotedIssues[]

issues/{issueId}
  - title, description, category, severity
  - status, priorityScore, location{}
  - aiSummary, actionSteps[], votes
  - voterIds[], commentCount, userId
  - createdAt, updatedAt, resolvedAt

comments/{commentId}
  - issueId, userId, userName, text
  - createdAt

emergencyAlerts/{alertId}
  - type, title, description, location{}
  - severity, reportedBy, active
  - createdAt, updatedAt

notifications/{notifId}
  - userId, message, type, read
  - createdAt
```

---

## 🚀 Deployment

### Frontend (Firebase Hosting)
```bash
cd frontend
npm run build
firebase login
firebase init hosting
firebase deploy --only hosting
```

### Backend (Google Cloud Run)
```bash
cd backend
gcloud builds submit --tag gcr.io/YOUR_PROJECT/civiceye-api
gcloud run deploy civiceye-api \
  --image gcr.io/YOUR_PROJECT/civiceye-api \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars GEMINI_API_KEY=your_key
```

---

## 🌍 SDG Impact
- **SDG 11** – Sustainable Cities & Communities
- **SDG 9** – Industry, Innovation & Infrastructure
- **SDG 3** – Good Health & Well-being

---

## 👥 Google Technologies Used

| Technology | Usage |
|-----------|-------|
| **Gemini 1.5 Flash** | Image analysis, severity prediction, chatbot, priority scoring, duplicate detection |
| **Google Maps JavaScript API** | Interactive maps, issue markers, geolocation |
| **Maps Geocoding API** | Reverse geocoding for address detection |
| **Firebase Authentication** | Google OAuth, Email/Password auth |
| **Cloud Firestore** | Real-time database for all data |
| **Firebase Storage** | Issue image uploads |
| **Firebase Hosting** | Frontend deployment |
| **Google Cloud Run** | Serverless backend deployment |

---

## 📝 License
Built with ❤️ for the Google Hackathon 2026  
Track: Community Hero – Hyperlocal Problem Solver 🚀
