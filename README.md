# 🛡️ CYBERSHIELD AI — Browser Security Guardian & Threat Intelligence Platform

[![TypeScript](https://img.shields.io/badge/TypeScript-5.4-blue.svg)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-19-cyan.svg)](https://react.dev/)
[![Manifest V3](https://img.shields.io/badge/Chrome%20Extension-Manifest%20V3-orange.svg)](https://developer.chrome.com/docs/extensions/mv3/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

> **Next-Generation Autonomous Browser Security Guardian with Heuristic Inspection, Machine Learning Risk Probability (Logistic Regression + Random Forest), Gemini Security Copilot, Real-time WebSocket Telemetry, and Chrome Manifest V3 Interceptor.**

---

## 🌟 Key Highlights & Architecture

CyberShield is an enterprise-grade web security platform that intercepts malicious web traffic at navigation time, calculates probabilistic threat scores across 18 heuristic signals, and provides an explainable AI analysis for security teams and everyday browser users.

### 🧩 System Components

| Component | Path | Description | Port / Gateway |
| :--- | :--- | :--- | :--- |
| **Unified Backend Engine** | `apps/backend` | Node.js Express API, Mongoose, Socket.IO, ML Classifier, Threat Feeds, SSRF Defense | `http://localhost:5000` |
| **Security Dashboard** | `apps/dashboard` | 13-Page React 19 Frontend with Tailwind CSS, Recharts, Real-time Feeds & Copilot Drawer | `http://localhost:3001` |
| **Browser Extension** | `apps/extension` | Chrome Manifest V3 Service Worker, Badging, Offline Resilient Heuristic Engine | `chrome://extensions` |
| **Shared Packages** | `packages/shared` | Common threat types, schemas, and scoring models | Shared Monorepo |

---

## 🚀 Features

- **⚡ Dual Gateway Architecture**: The Manifest V3 extension switches between `http://localhost:5000/api/v1` and Cloud deployed endpoints in 1 click.
- **🛡️ 18-Feature ML Risk Model**: Evaluates entropy, punycode/homoglyphs, abusive TLDs, keyword spoofing, non-standard ports, and direct IP vectors.
- **🤖 Grounded AI Security Copilot**: Explains intercepted indicators with defensive mitigation recommendations powered by Gemini and rule fallbacks.
- **📡 Real-Time Telemetry Stream**: Socket.IO broadcasts security events instantly across connected clients.
- **📊 13 Production Dashboard Views**:
  1. `Overview`: KPI metrics, live socket stream, telemetry area charts, AI incident rollup.
  2. `AI Scanner`: Real-time URL inspector with interactive test vectors and indicator breakdowns.
  3. `Browser Protection`: Extension policy control, module toggles, and domain whitelist rules.
  4. `Threat Intel`: Upstream intelligence feeds (Google Safe Browsing, VirusTotal, live DNS).
  5. `Risk Analysis`: Explainable risk methodology, weights formulation, and live simulator.
  6. `Security Events`: Real-time event log, severity filter, and manual acknowledgement.
  7. `Scan History`: Full search, score filtering, and detailed inspection modal.
  8. `Domain Intel`: Apex reconnaissance, recursive DNS A/MX resolution, and history.
  9. `Analytics`: MongoDB aggregations, traffic distributions, and longitudinal charts.
  10. `Notifications`: Security notifications center with read/unread triage.
  11. `Integrations`: API key generation, webhooks, and curl snippets.
  12. `Settings`: Sensitivity thresholds, theme preferences, and sync toggles.
  13. `Account Security`: Password management, session monitoring, and audit log.

---

## 📦 Getting Started Locally

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher)
- [MongoDB](https://www.mongodb.com/) (Optional: runs in resilient offline mode if not connected)

### 1. Installation
Clone the repository and install all dependencies:
```bash
git clone https://github.com/sriinathh/CYBERSHIELD-AI-Browser-Security-Guardian.git
cd CYBERSHIELD
npm install
```

### 2. Start the Backend Server
```bash
npm run dev --workspace=apps/backend
# Serves Unified REST API & Socket.IO at http://localhost:5000
```

### 3. Start the Live Security Dashboard
```bash
npm run dev --workspace=apps/dashboard
# Open in browser: http://localhost:3001
```

### 4. Build & Install the Chrome Extension
```bash
npm run build --workspace=apps/extension
```
To load the extension into your browser:
1. Open Chrome/Edge and go to `chrome://extensions/`
2. Turn **ON** `Developer mode` (top right toggle)
3. Click `Load unpacked`
4. Select the directory:
   ```
   apps/extension/dist
   ```
5. Pin the **CyberShield** icon in your browser toolbar!

---

## ☁️ Deployment Instructions

### Backend (Railway / Render / AWS / Docker)
Set environment variables:
```env
PORT=5000
MONGO_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/cybershield
JWT_SECRET=your-secure-jwt-secret
GEMINI_API_KEY=your-gemini-key
NODE_ENV=production
```
Build and run:
```bash
npm run build --workspace=apps/backend
npm run start --workspace=apps/backend
```

### Dashboard (Vercel / Netlify / Cloudflare Pages)
Set environment variable:
```env
VITE_API_BASE=https://your-backend-api.com/api/v1
```
Build command:
```bash
npm run build --workspace=apps/dashboard
# Output Directory: apps/dashboard/dist
```

---

## 🧪 Testing & Validation

Run comprehensive verification audits:
```bash
# E2E Telemetry & Analyzer Pipeline
npx tsx scripts/test_e2e_pipeline.ts

# ML Classifier Accuracy & Feature Verification
npx tsx scripts/train_ml_model.ts
```

---

## 📄 License
Distributed under the MIT License.
