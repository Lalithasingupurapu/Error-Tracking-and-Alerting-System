# 🚀 Error Tracking and Alerting System (ETS)

A centralized full-stack application that captures, tracks, and manages real-time error logs from multiple applications. It helps developers quickly identify, group, and resolve issues through a smart dashboard with automated alerting.

## ✨ Features
- 🌐 **Global Error Tracking API** – Accepts error logs from any application via REST endpoint (`POST /api/errors`)
- 🧠 **Smart Deduplication** – Automatically groups identical errors and increases occurrence count
- 🔍 **Search & Filters** – Filter errors by app name, severity, or message
- 🚨 **Critical Alert System** – Sends alerts for high-severity errors (e.g., system crashes)
- 📊 **Live Dashboard** – Real-time UI to monitor and manage errors
- ✅ **Mark as Resolved** – Helps developers track fixed issues
- 🎨 **Modern UI** – Responsive React dashboard with clean design

## 🛠 Tech Stack
- **Frontend**: React.js, Vite, CSS
- **Backend**: Node.js, Express.js
- **Database**: MongoDB (Mongoose)
  - Supports in-memory DB fallback for local testing
- **Tools**: REST APIs, Git, Postman

## 📂 Project Structure
```text
Error Tracking and Alerting System
├── backend
│   ├── models
│   ├── services
│   ├── server.js
│   └── test_crash.js
│
├── frontend
│   ├── src
│   │   ├── App.jsx
│   │   └── index.css
│   └── vite.config.js
│
└── test_website.html
```

## 🚀 Getting Started

### 1️⃣ Clone the repository
```bash
git clone https://github.com/Lalithasingupurapu/Error-Tracking-and-Alerting-System.git
cd Error-Tracking-and-Alerting-System
```

### 2️⃣ Run Backend
```bash
cd backend
npm install
node server.js
```
Backend runs on: `http://localhost:5000`

### 3️⃣ Run Frontend
Open new terminal:
```bash
cd frontend
npm install
npm run dev
```
Frontend runs on: `http://localhost:5173`

### 4️⃣ Test the System
Run test script:
```bash
node backend/test_crash.js
```
OR open:
`test_website.html`

Click buttons to generate errors → see live updates on dashboard

## 🔌 Integration into Other Projects

Add this snippet to any web application to send errors to ETS:

```javascript
window.onerror = function (message, source, lineno, colno, error) {
    fetch("http://localhost:5000/api/errors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            appName: "My-App",
            message: message,
            stackTrace: error ? error.stack : `Line: ${lineno}`,
            severity: "high"
        })
    });
};
```

## 🎯 Purpose

This project helps developers monitor production-level errors in real time, reduce debugging time, and improve application reliability through centralized error management.
