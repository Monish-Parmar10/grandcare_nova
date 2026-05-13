<div align="center">
  <h1>🫶 GrandCare</h1>
  <p><strong>Technology that feels like a grandchild.</strong></p>
  <p>A healthcare web app designed for elderly users (60+) 
  connecting them with medicine support, daily wellness routines, 
  community helpers, and emergency safety — all in one place.</p>

  ![Made with React](https://img.shields.io/badge/React-Vite-blue)
  ![Node.js](https://img.shields.io/badge/Backend-Node.js-green)
  ![MongoDB](https://img.shields.io/badge/Database-MongoDB-brightgreen)
  ![Hackathon](https://img.shields.io/badge/Blueprint_2026-Healthcare-purple)
</div>

---

## 🌟 The Problem

Over 150 million elderly Indians live with limited family 
support, complex medicine schedules, loneliness, and no fast 
way to get help in an emergency. Most apps are built for the 
young — GrandCare is built for them.

---

## ✨ Features

### 💊 Smart Medicine Companion
- Auto-fills medicine info from OpenFDA 
- 7-day dose streak tracker
- Refill counter with low stock alerts
- Missed dose WhatsApp alert to family

### 📋 AI-Personalized Daily Routine
- Health onboarding questionnaire (7 steps)
- AI generates custom tasks based on their diseases, 
  mobility, habits and goals
- GrandPoints gamification with leaderboard
- Adaptive difficulty — tasks get easier or harder weekly
- Daily mood check-in with family alerts

### 📰 Daily News Quiz
- AI-generated current affairs questions daily 
- Earn GrandPoints for correct answers
- Community leaderboard for friendly competition

### 🤝 Community Help Connect
- Elder posts a help request with GPS location
- Nearby helpers (within 5km) get notified instantly
- Real-time chat via Socket.io
- Category-based requests: Medical, Fall, Daily Care

### 🆘 One-Tap SOS Emergency
- Captures live GPS location
- Instantly sends WhatsApp alert to emergency contacts
- Direct CALL 911 button always visible

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React (Vite) + Tailwind CSS |
| Backend | Node.js + Express 5 |
| Database | MongoDB Atlas + Mongoose |
| Real-time | Socket.io |
| Auth | JWT + Bcrypt |
| AI | API (xAI) |
| Location | HTML5 Geolocation + MongoDB $near |
| Alerts | WhatsApp Deep Links + Browser Notifications |

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- MongoDB Atlas account

### Backend Setup
```bash
cd backend
npm install
cp .env.example .env
# Fill in your values in .env
node seed.js
node src/server.js
```

### Frontend Setup
```bash
cd frontend
npm install
cp .env.example .env
# Fill in your values in .env
npm run dev
```

---

## 👥 Who Uses GrandCare

**Grandparents (60+)** — manage health, follow routines, 
get help, stay safe

**Community Helpers (18-35)** — volunteer nearby, chat with 
elders, earn reputation

**Family Members** — receive passive alerts, stay connected 
without daily calls

---

## 🔮 Future Roadmap

- GrandChat — anonymous video/voice community rooms for elderly
- WhatsApp Bot for feature-phone users
- PWA with offline SOS support
- Pharmacy refill integration
- Verified helper badge system

---

## 🏆 Built For

**Blueprint 2026 Hackathon — Healthcare Domain**

> *"Fewer taps, bigger purpose."*

---

<div align="center">
  Made with 💙 for every grandparent who deserves better technology
</div>