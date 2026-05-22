# 🚀 CI/CD Deployment Approval System

A simple full-stack DevOps project that demonstrates a CI/CD deployment approval workflow. When a developer pushes code, a deployment request automatically appears on an admin dashboard. After admin approval, Docker deployment happens.

## 📋 Architecture

```
Developer Push → GitHub Actions → Build & Create Request → Admin Dashboard → Approve/Reject → Docker Deploy
```

## 🛠 Tech Stack

| Layer      | Technology                 |
| ---------- | -------------------------- |
| Frontend   | React + Vite + TailwindCSS |
| Backend    | Node.js + Express          |
| CI/CD      | GitHub Actions             |
| Deployment | Docker + docker-compose    |
| Storage    | Local JSON file            |

## 📁 Project Structure

```
devops_aba/
├── .github/
│   └── workflows/
│       └── deploy.yml          # GitHub Actions CI/CD pipeline
├── backend/
│   ├── data/
│   │   └── deployments.json    # Local JSON storage for deployment records
│   ├── Dockerfile              # Backend Docker image
│   ├── package.json            # Backend dependencies
│   └── server.js               # Express API server
├── frontend/
│   ├── public/                 # Static assets
│   ├── src/
│   │   ├── components/         # React UI components
│   │   ├── App.jsx             # Main application component
│   │   ├── index.css           # TailwindCSS styles
│   │   └── main.jsx            # React entry point
│   ├── Dockerfile              # Frontend Docker image (nginx)
│   ├── package.json            # Frontend dependencies
│   └── vite.config.js          # Vite configuration
├── docker-compose.yml          # Multi-container orchestration
└── README.md                   # Project documentation (this file)
```

## 🚀 Quick Start

### Prerequisites

- Node.js 20+
- Docker & Docker Compose
- Git

### Local Development (without Docker)

1. **Clone the repo:**

   ```bash
   git clone https://github.com/your-username/devops_aba.git
   cd devops_aba
   ```

2. **Start the backend:**

   ```bash
   cd backend
   npm install
   npm run dev
   ```

3. **Start the frontend (new terminal):**

   ```bash
   cd frontend
   npm install
   npm run dev
   ```

4. **Open the dashboard:** Visit [http://localhost:3000](http://localhost:3000)

### Using Docker Compose

```bash
docker-compose up --build
```

| Service  | URL                                              |
| -------- | ------------------------------------------------ |
| Frontend | [http://localhost:3000](http://localhost:3000)     |
| Backend  | [http://localhost:5000](http://localhost:5000)     |

To stop the containers:

```bash
docker-compose down
```

## 📡 API Reference

All endpoints are prefixed with `/api`.

### 1. List All Deployments

| Detail       | Value                                |
| ------------ | ------------------------------------ |
| **Method**   | `GET`                                |
| **Path**     | `/api/deployments`                   |
| **Description** | Retrieve all deployment requests  |

**Response:**

```json
[
  {
    "id": "dep_1716000000000",
    "branch": "main",
    "commitMessage": "feat: add login page",
    "commitSha": "abc123",
    "changedFiles": ["src/App.jsx", "src/Login.jsx"],
    "buildId": "build-42",
    "status": "pending",
    "safetyLabel": "safe",
    "createdAt": "2026-05-18T12:00:00.000Z"
  }
]
```

### 2. Get Single Deployment

| Detail       | Value                                      |
| ------------ | ------------------------------------------ |
| **Method**   | `GET`                                      |
| **Path**     | `/api/deployments/:id`                     |
| **Description** | Retrieve a specific deployment by ID    |

**Response:** A single deployment object (same shape as above).

### 3. Create Deployment Request

| Detail       | Value                                            |
| ------------ | ------------------------------------------------ |
| **Method**   | `POST`                                           |
| **Path**     | `/api/deployments`                               |
| **Description** | Create a new deployment request from CI/CD    |

**Request Body:**

```json
{
  "branch": "main",
  "commitMessage": "feat: add login page",
  "commitSha": "abc123def456",
  "changedFiles": ["src/App.jsx", "src/Login.jsx"],
  "buildId": "build-42"
}
```

**Response:** The newly created deployment object with `id`, `status: "pending"`, `safetyLabel`, and `createdAt` fields added.

### 4. Approve a Deployment

| Detail       | Value                                         |
| ------------ | --------------------------------------------- |
| **Method**   | `PUT`                                         |
| **Path**     | `/api/deployments/:id/approve`                |
| **Description** | Approve a pending deployment request       |

**Response:** The updated deployment object with `status: "approved"` and `approvedAt` timestamp.

### 5. Reject a Deployment

| Detail       | Value                                         |
| ------------ | --------------------------------------------- |
| **Method**   | `PUT`                                         |
| **Path**     | `/api/deployments/:id/reject`                 |
| **Description** | Reject a pending deployment request        |

**Response:** The updated deployment object with `status: "rejected"` and `rejectedAt` timestamp.

### 6. Deploy (Mark as Deployed)

| Detail       | Value                                          |
| ------------ | ---------------------------------------------- |
| **Method**   | `PUT`                                          |
| **Path**     | `/api/deployments/:id/deploy`                  |
| **Description** | Mark an approved deployment as deployed     |

**Response:** The updated deployment object with `status: "deployed"` and `deployedAt` timestamp.

## 🔄 CI/CD Workflow

```
┌──────────────┐     ┌─────────────────┐     ┌──────────────────┐
│  Developer   │────▶│  GitHub Actions  │────▶│  Build & Test    │
│  pushes code │     │  triggers        │     │  (npm + Docker)  │
└──────────────┘     └─────────────────┘     └────────┬─────────┘
                                                       │
                                                       ▼
┌──────────────┐     ┌─────────────────┐     ┌──────────────────┐
│  Docker      │◀────│  Admin clicks   │◀────│  Create deploy   │
│  deploys     │     │  Approve ✅      │     │  request via API │
└──────────────┘     └─────────────────┘     └──────────────────┘
```

1. Developer pushes code to the `main` branch
2. GitHub Actions pipeline triggers automatically
3. Pipeline installs dependencies and builds the project
4. Pipeline builds Docker images via `docker-compose build`
5. Pipeline creates a deployment request via the backend API
6. Pipeline polls for approval (checks every 10 seconds, timeout 10 minutes)
7. Admin opens the dashboard and clicks **Approve** or **Reject**
8. If approved, the pipeline deploys the Docker containers with `docker-compose up -d`

### GitHub Actions Setup

Set the `API_URL` repository variable to point to your running backend:

1. Go to your GitHub repository
2. Navigate to **Settings → Secrets and variables → Actions → Variables**
3. Click **New repository variable**
4. Set the following:
   - **Name:** `API_URL`
   - **Value:** `http://your-server:5000`

> **Note:** If `API_URL` is not set, the pipeline defaults to `http://localhost:5000`.

## 🏷 Safety Labels

Deployments are automatically labeled based on the files changed in the commit:

| Label             | Badge | Condition                                                          |
| ----------------- | ----- | ------------------------------------------------------------------ |
| **Safe**          | 🟢    | No sensitive files changed                                         |
| **Needs Review**  | 🟡    | Config files changed (`.env`, `Dockerfile`, `*.yml`, `*.yaml`, etc.) |
| **High Impact**   | 🔴    | More than 20 files changed                                         |

These labels help admins quickly assess the risk level of each deployment before approving.

## 🧪 Testing the Workflow Locally

You can simulate the full CI/CD flow locally without GitHub Actions:

1. **Start the backend:**

   ```bash
   cd backend
   npm run dev
   ```

2. **Create a test deployment request:**

   ```bash
   curl -X POST http://localhost:5000/api/deployments \
     -H "Content-Type: application/json" \
     -d '{
       "branch": "main",
       "commitMessage": "feat: add login page",
       "commitSha": "abc123",
       "changedFiles": ["src/App.jsx", "src/Login.jsx"],
       "buildId": "build-42"
     }'
   ```

3. **Start the frontend (new terminal):**

   ```bash
   cd frontend
   npm run dev
   ```

4. **Open the dashboard:** Visit [http://localhost:3000](http://localhost:3000) to see the deployment request

5. **Approve and deploy:** Click **Approve**, then click **Deploy**

6. **Verify via API:**

   ```bash
   curl http://localhost:5000/api/deployments
   ```

## 📝 License

MIT
