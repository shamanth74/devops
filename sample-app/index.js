// ============================================
// Sample App — This is the developer's application
// ============================================
// Developers make changes to this file and push to GitHub.
// The CI/CD pipeline will then build, request approval,
// and deploy this app.
// ============================================

const express = require('express');
const app = express();
const PORT = process.env.PORT || 9090;

// --- Main route ---
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Sample App</title>
      <style>
        body { font-family: Arial, sans-serif; background: #0f172a; color: #e2e8f0; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; }
        .card { background: #1e293b; padding: 40px; border-radius: 12px; text-align: center; border: 1px solid #334155; }
        h1 { color: #38bdf8; }
        p { color: #94a3b8; }
        .version { background: #334155; padding: 4px 12px; border-radius: 20px; font-size: 14px; color: #67e8f9; }
      </style>
    </head>
    <body>
      <div class="card">
        <h1>🚀 Sample App-1</h1>
        <p>This is sample deployment</p>
        <span class="version">v1.1.2</span>
      </div>
    </body>
    </html>
  `);
});

// --- Health check ---
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`Sample App running on http://localhost:${PORT}`);
});
