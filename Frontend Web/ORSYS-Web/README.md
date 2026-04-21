# ORSYS Web (Vantage) – Super Admin Control Center

**ORSYS (Organizational Reward System)**, also known as **Vantage**, is a gamified merit and attendance ecosystem designed for the Computer Studies Organization (CSO). This web-based dashboard serves as the central hub for administrators to manage student participation, biometric synchronization, and organizational growth.

## 🚀 Project Overview

Vantage bridges the gap between hardware and software by integrating ESP32 biometric sensors with a modern React frontend and Firebase backend. It is designed to increase student engagement through a competitive merit-based reward system.

### Key Features
* **Biometric Management:** Real-time ID mapping for AS608 fingerprint sensors.
* **Gamified Merit System:** Automated XP distribution and digital badge management.
* **Urgent Communication:** Integrated SMS gateway for critical student announcements.
* **Organizational Analytics:** Comprehensive tracking of student attendance and activity levels.

## 🛠 Tech Stack

* **Frontend:** [React.js](https://react.dev/) (Vite + JavaScript)
* **Styling:** [Tailwind CSS v4](https://tailwindcss.com/)
* **Backend:** [Google Firebase](https://firebase.google.com/) (Firestore & Authentication)
* **Hardware Integration:** ESP32 + AS608 Biometric Sensor
* **Icons:** [Lucide React](https://lucide.dev/)

## 👥 Proponents

The Vantage project is a collaborative effort by student leaders of the Computer Studies Organization (CSO) at **ACLC College of Mandaue**.

| 👤 Proponent | 🏷️ Title | 🎓 Institution |
| :--- | :--- | :--- |
| **Kent Jay Otadoy** | **Chairman**, CSO | ACLC College of Mandaue |
| **Manuel Cando** | **Gaming Committee Leader**, CSO | ACLC College of Mandaue |

> **Year & Course:** 3rd Year Bachelor of Science in Computer Science  
> **Project Scope:** Technopreneurship Feasibility Study 2026

---

## ⚙️ Setup & Installation

### 1. Prerequisites
* Node.js (v18+)
* Firebase Project (Spark Plan)

### 2. Environment Configuration
Create a `.env` file in the root directory:
```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_id
VITE_FIREBASE_APP_ID=your_app_id

3. Installation & Local Development

# Install dependencies
npm install

# Start the development server
npm run dev


Deployment

# Build for production
npm run build

# Deploy to Firebase Hosting
firebase deploy --only hosting