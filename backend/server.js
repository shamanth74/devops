// ============================================================
// CI/CD Deployment Approval System — Backend Server
// ============================================================
// A single-file Express server that manages deployment requests.
// Deployments are stored in a local JSON file (no database needed).
// ============================================================

const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const { execFile } = require('child_process');

// ------------------------------------------------------------
// 1. App & Middleware Setup
// ------------------------------------------------------------
const app = express();
const PORT = process.env.PORT || 5000;

// Enable Cross-Origin Resource Sharing so the frontend can talk to us
app.use(cors());

// Parse incoming JSON request bodies automatically
app.use(express.json());

// ------------------------------------------------------------
// 2. Data Storage — JSON File
// ------------------------------------------------------------
// We store all deployments in a simple JSON file on disk.
// This keeps things easy to inspect and beginner-friendly.
const DATA_DIR = path.join(__dirname, 'data');
const DATA_FILE = path.join(DATA_DIR, 'deployments.json');

/**
 * Ensure the data directory and JSON file exist.
 * Called once at startup so we never hit "file not found" errors.
 */
function ensureDataFile() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
    console.log('📁 Created data directory:', DATA_DIR);
  }
  if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, JSON.stringify([], null, 2));
    console.log('📄 Created empty deployments file:', DATA_FILE);
  }
}

/**
 * Read all deployments from the JSON file.
 * @returns {Array} Array of deployment objects.
 */
function loadDeployments() {
  try {
    const raw = fs.readFileSync(DATA_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    console.error('⚠️  Error reading deployments file:', err.message);
    return []; // Return empty array as a safe fallback
  }
}

/**
 * Write the full deployments array back to the JSON file.
 * @param {Array} data - The deployments array to persist.
 */
function saveDeployments(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

// ------------------------------------------------------------
// 3. Safety Label Logic
// ------------------------------------------------------------
// Patterns that indicate a file is a "config" or sensitive file.
// If any changed file matches one of these, the deployment gets
// a higher-risk safety label.
const CONFIG_PATTERNS = [
  '.env',
  'docker-compose.yml',
  'Dockerfile',
  'package.json',
];

// These are checked as file-ending patterns (like globs).
const CONFIG_GLOB_ENDINGS = [
  '.config.js',
  '.yml',
  '.yaml',
];

// These are checked as file-name-starting patterns (like config.*).
const CONFIG_NAME_STARTS = ['config.'];

/**
 * Determine whether a single file name matches our "config" patterns.
 * @param {string} fileName - The name / path of the changed file.
 * @returns {boolean} True if the file looks like a config file.
 */
function isConfigFile(fileName) {
  const lower = fileName.toLowerCase();
  const baseName = path.basename(lower);

  // Exact-name matches (e.g. ".env", "Dockerfile")
  if (CONFIG_PATTERNS.includes(baseName)) return true;

  // Ends-with matches (e.g. "*.config.js", "*.yml")
  if (CONFIG_GLOB_ENDINGS.some((ending) => lower.endsWith(ending))) return true;

  // Starts-with matches (e.g. "config.*")
  if (CONFIG_NAME_STARTS.some((start) => baseName.startsWith(start))) return true;

  return false;
}

/**
 * Compute a human-readable safety label for a deployment based on
 * which files were changed.
 *
 * Rules (evaluated in order):
 *   1. > 3 changed files            → "High Impact"
 *   2. Any config/sensitive file    → "Needs Review"
 *   3. Otherwise                    → "Safe"
 *
 * @param {string[]} changedFiles - List of changed file paths.
 * @returns {string} One of "High Impact", "Needs Review", or "Safe".
 */
function computeSafetyLabel(changedFiles) {
  // Rule 1 — lots of files changed
  if (changedFiles.length > 3) {
    return 'High Impact';
  }

  // Rule 2 — sensitive / config file touched
  if (changedFiles.some((f) => isConfigFile(f))) {
    return 'Needs Review';
  }

  // Rule 3 — everything looks normal
  return 'Safe';
}

// ------------------------------------------------------------
// 4. API Routes
// ------------------------------------------------------------

// ---------- Health Check ----------
app.get('/', (_req, res) => {
  res.json({ message: 'CI/CD Deployment Approval API is running 🚀' });
});

// ---------- GET /api/deployments ----------
// Fetch all deployments, optionally filtered by status.
// Example: GET /api/deployments?status=pending
app.get('/api/deployments', (req, res) => {
  let deployments = loadDeployments();

  // Optional status filter
  const { status } = req.query;
  if (status) {
    const validStatuses = ['pending', 'approved', 'rejected', 'deployed'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        error: `Invalid status filter. Must be one of: ${validStatuses.join(', ')}`,
      });
    }
    deployments = deployments.filter((d) => d.status === status);
  }

  // Sort by newest first
  deployments.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  res.json(deployments);
});

// ---------- GET /api/deployments/:id ----------
// Fetch a single deployment by its unique ID.
app.get('/api/deployments/:id', (req, res) => {
  const deployments = loadDeployments();
  const deployment = deployments.find((d) => d.id === req.params.id);

  if (!deployment) {
    return res.status(404).json({ error: 'Deployment not found' });
  }

  res.json(deployment);
});

// ---------- POST /api/deployments ----------
// Create a new deployment request.
// Required body fields: branch, commitMessage, commitSha, changedFiles, buildId
app.post('/api/deployments', (req, res) => {
  const { branch, commitMessage, commitSha, changedFiles, buildId } = req.body;

  // --- Basic validation ---
  if (!branch || !commitMessage || !commitSha || !changedFiles || !buildId) {
    return res.status(400).json({
      error: 'Missing required fields: branch, commitMessage, commitSha, changedFiles, buildId',
    });
  }

  if (!Array.isArray(changedFiles)) {
    return res.status(400).json({ error: 'changedFiles must be an array of file paths' });
  }

  // --- Build the new deployment object ---
  const now = new Date().toISOString();

  const newDeployment = {
    id: uuidv4(),                                         // Unique identifier
    branch,                                                // Git branch name
    commitMessage,                                         // Latest commit message
    commitSha,                                             // Commit hash
    changedFiles,                                          // List of changed file paths
    changedFilesCount: changedFiles.length,                 // Handy count
    buildId,                                               // CI build identifier
    status: 'pending',                                     // Starts as pending
    safetyLabel: computeSafetyLabel(changedFiles),         // Computed risk label
    dockerfileChanged: changedFiles.some(                  // Did the Dockerfile change?
      (f) => path.basename(f).toLowerCase() === 'dockerfile'
    ),
    configFilesChanged: changedFiles.some((f) => isConfigFile(f)), // Any config changes?
    createdAt: now,
    updatedAt: now,
  };

  // --- Persist ---
  const deployments = loadDeployments();
  deployments.push(newDeployment);
  saveDeployments(deployments);

  console.log(`✅ New deployment created: ${newDeployment.id} (${branch})`);
  res.status(201).json(newDeployment);
});

// ---------- PUT /api/deployments/:id/approve ----------
// Approve a pending deployment.
app.put('/api/deployments/:id/approve', (req, res) => {
  const deployments = loadDeployments();
  const deployment = deployments.find((d) => d.id === req.params.id);

  if (!deployment) {
    return res.status(404).json({ error: 'Deployment not found' });
  }

  if (deployment.status !== 'pending') {
    return res.status(400).json({
      error: `Cannot approve a deployment that is currently "${deployment.status}". Only pending deployments can be approved.`,
    });
  }

  // Update status
  deployment.status = 'approved';
  deployment.updatedAt = new Date().toISOString();
  saveDeployments(deployments);

  console.log(`👍 Deployment approved: ${deployment.id}`);
  res.json(deployment);
});

// ---------- PUT /api/deployments/:id/reject ----------
// Reject a pending deployment.
app.put('/api/deployments/:id/reject', (req, res) => {
  const deployments = loadDeployments();
  const deployment = deployments.find((d) => d.id === req.params.id);

  if (!deployment) {
    return res.status(404).json({ error: 'Deployment not found' });
  }

  if (deployment.status !== 'pending') {
    return res.status(400).json({
      error: `Cannot reject a deployment that is currently "${deployment.status}". Only pending deployments can be rejected.`,
    });
  }

  // Update status
  deployment.status = 'rejected';
  deployment.updatedAt = new Date().toISOString();
  saveDeployments(deployments);

  console.log(`❌ Deployment rejected: ${deployment.id}`);
  res.json(deployment);
});

// ---------- PUT /api/deployments/:id/deploy ----------
// Deploy an approved deployment (simulated).
app.put('/api/deployments/:id/deploy', (req, res) => {
  const deployments = loadDeployments();
  const deployment = deployments.find((d) => d.id === req.params.id);

  if (!deployment) {
    return res.status(404).json({ error: 'Deployment not found' });
  }

  if (deployment.status !== 'approved') {
    return res.status(400).json({
      error: `Cannot deploy a deployment that is currently "${deployment.status}". Only approved deployments can be deployed.`,
    });
  }

  console.log('🐳 Starting local Docker deployment...');
  console.log(`   Branch : ${deployment.branch}`);
  console.log(`   Build  : ${deployment.buildId}`);
  console.log(`   Commit : ${deployment.commitSha}`);

  // Run docker-compose directly from the project root (works on Windows + Linux)
  const projectRoot = path.join(__dirname, '..');
  const cmd = 'docker-compose stop sample-app && docker-compose up -d --build sample-app';

  const { exec } = require('child_process');
  exec(cmd, { cwd: projectRoot }, (error, stdout, stderr) => {
    const logs = stdout + (stderr ? '\n' + stderr : '');
    console.log(logs);

    if (error) {
      console.error('❌ Deployment failed:', error.message);
      return res.status(500).json({
        error: 'Deployment failed',
        logs: logs,
      });
    }

    // Update status on success
    const now = new Date().toISOString();
    deployment.status = 'deployed';
    deployment.deployedAt = now;
    deployment.updatedAt = now;
    saveDeployments(deployments);

    console.log(`🚀 Deployment deployed: ${deployment.id}`);
    res.json({
      message: 'Deployment successful',
      logs: logs,
      deployment: deployment,
    });
  });
});

// ------------------------------------------------------------
// 5. Start the Server
// ------------------------------------------------------------
ensureDataFile(); // Make sure data dir + file exist before we listen

app.listen(PORT, () => {
  console.log('============================================');
  console.log(`  CI/CD Approval API listening on port ${PORT}`);
  console.log(`  http://localhost:${PORT}`);
  console.log('============================================');
});
