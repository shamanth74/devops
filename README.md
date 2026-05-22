# 🚀 CI/CD Deployment Approval System

A real CI/CD pipeline where code pushes to GitHub automatically create deployment requests on an admin dashboard. Admins approve or reject, and GitHub Actions succeeds or fails accordingly.

## 🔄 How It Works

```
Developer pushes code → GitHub Actions builds → Creates deployment request
                                                        ↓
                                            Admin Dashboard shows it
                                                        ↓
                                            Admin clicks Approve / Reject
                                                        ↓
                                            GitHub Actions ✅ succeeds or ❌ fails
```

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| Sample App | Node.js + Express |
| Approval Backend | Node.js + Express + JSON file storage |
| Approval Dashboard | React + Vite + TailwindCSS |
| CI/CD | GitHub Actions |
| Tunneling | ngrok (to expose local backend to GitHub Actions) |
| Containers | Docker + docker-compose |

## 📁 Project Structure

```
devops_aba/
├── sample-app/                  # The app developers work on
│   ├── index.js                 # Simple Express web server
│   ├── package.json
│   └── Dockerfile
├── backend/                     # Approval system API
│   ├── server.js                # Express API (6 endpoints)
│   ├── package.json
│   ├── Dockerfile
│   └── data/
│       └── deployments.json     # JSON storage (auto-created)
├── frontend/                    # Approval dashboard
│   ├── src/
│   │   ├── App.jsx
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx
│   │   │   ├── DeploymentDetails.jsx
│   │   │   └── History.jsx
│   │   └── components/
│   │       ├── Navbar.jsx
│   │       ├── DeploymentCard.jsx
│   │       └── StatusBadge.jsx
│   ├── package.json
│   ├── Dockerfile
│   └── nginx.conf
├── .github/workflows/
│   └── deploy.yml               # Real CI/CD pipeline
├── docker-compose.yml
└── README.md
```

## 🚀 Setup Guide (One-Time)

### Prerequisites

- Node.js 20+
- Docker & Docker Compose
- Git
- ngrok account (free at https://ngrok.com)

### Step 1: Clone and Install

```bash
git clone https://github.com/YOUR_USERNAME/devops_aba.git
cd devops_aba

# Install backend
cd backend && npm install && cd ..

# Install frontend
cd frontend && npm install && cd ..

# Install sample app
cd sample-app && npm install && cd ..
```

### Step 2: Start the Approval Service

Open **two terminals**:

```bash
# Terminal 1 — Backend API (port 5000)
cd backend
npm start
```

```bash
# Terminal 2 — Frontend Dashboard (port 3000)
cd frontend
npm run dev
```

Dashboard is now at: **http://localhost:3000**

### Step 3: Start ngrok

```bash
ngrok http 5000
```

Copy the public URL (e.g., `https://xxxx-xx-xx-xx-xx.ngrok-free.app`)

### Step 4: Set GitHub Repository Variable

1. Go to your GitHub repo → **Settings** → **Secrets and variables** → **Actions**
2. Click **Variables** tab → **New repository variable**
3. Name: `API_URL`
4. Value: paste your ngrok URL (e.g., `https://xxxx-xx-xx-xx-xx.ngrok-free.app`)
5. Click **Add variable**

## 🎬 Running the Real Demo

### 1. Make a Code Change

Edit `sample-app/index.js` — change the version or welcome message.

### 2. Push to GitHub

```bash
git add .
git commit -m "feat: update welcome message"
git push origin main
```

### 3. Watch GitHub Actions

Go to your repo → **Actions** tab. You'll see the pipeline running. It will pause at "⏳ Waiting for Admin Approval".

### 4. Approve on Dashboard

Open **http://localhost:3000** — the deployment request is there! Click **Approve**.

### 5. Watch GitHub Actions Succeed

The pipeline detects the approval, marks the deployment as deployed, and shows ✅ **SUCCESS**.

*If you click Reject instead, the pipeline shows ❌ **FAILURE**.*

## 📡 API Reference

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/deployments` | List all deployments (optional `?status=` filter) |
| GET | `/api/deployments/:id` | Get single deployment |
| POST | `/api/deployments` | Create deployment request |
| PUT | `/api/deployments/:id/approve` | Approve a pending deployment |
| PUT | `/api/deployments/:id/reject` | Reject a pending deployment |
| PUT | `/api/deployments/:id/deploy` | Mark as deployed |

## 🏷 Safety Labels

Automatically assigned based on changed files:

| Label | Condition | Color |
|-------|-----------|-------|
| Safe | Normal source files only | 🟢 Green |
| Needs Review | Config files changed (.env, Dockerfile, *.yml) | 🟡 Yellow |
| High Impact | More than 20 files changed | 🔴 Red |

## 🐳 Docker Compose

To run everything in Docker:

```bash
docker-compose up --build
```

| Service | Port | Description |
|---------|------|-------------|
| backend | 5000 | Approval API |
| frontend | 3000 | Admin Dashboard |
| sample-app | 8080 | Developer's App |

## 📝 License

MIT
