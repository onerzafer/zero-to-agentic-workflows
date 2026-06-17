const http = require('http');
const fs = require('fs');
const path = require('path');
const os = require('os');
const { exec } = require('child_process');
const https = require('https');

const PORT = 3500;
const TOKEN_FILE_PATH = path.join(os.homedir(), '.openrouter_token');

// HTML with premium, sleek dark-mode design
const HTML_CONTENT = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>OpenRouter Onboarding Wizard</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600;800&display=swap" rel="stylesheet">
    <style>
        :root {
            --bg-color: #0b0f19;
            --card-bg: rgba(22, 28, 45, 0.4);
            --border-color: rgba(255, 255, 255, 0.08);
            --primary: #4f46e5;
            --primary-glow: rgba(79, 70, 229, 0.4);
            --secondary: #06b6d4;
            --text-main: #f3f4f6;
            --text-muted: #9ca3af;
            --success: #10b981;
            --error: #ef4444;
        }

        * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
            font-family: 'Outfit', sans-serif;
        }

        body {
            background-color: var(--bg-color);
            color: var(--text-main);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            overflow: hidden;
            position: relative;
        }

        /* Animated background blobs */
        .blob {
            position: absolute;
            border-radius: 50%;
            filter: blur(100px);
            z-index: 0;
            opacity: 0.15;
            animation: float 20s infinite alternate;
        }

        .blob-1 {
            width: 400px;
            height: 400px;
            background: var(--primary);
            top: -10%;
            left: -10%;
        }

        .blob-2 {
            width: 500px;
            height: 500px;
            background: var(--secondary);
            bottom: -15%;
            right: -10%;
            animation-delay: -5s;
        }

        @keyframes float {
            0% { transform: translate(0, 0) scale(1); }
            50% { transform: translate(50px, 20px) scale(1.1); }
            100% { transform: translate(-20px, -50px) scale(0.9); }
        }

        .container {
            width: 100%;
            max-width: 520px;
            padding: 24px;
            z-index: 10;
        }

        .card {
            background: var(--card-bg);
            border: 1px solid var(--border-color);
            border-radius: 24px;
            padding: 40px;
            backdrop-filter: blur(20px);
            -webkit-backdrop-filter: blur(20px);
            box-shadow: 0 20px 50px rgba(0, 0, 0, 0.3);
            text-align: center;
            transition: all 0.5s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .logo {
            font-size: 2.5rem;
            font-weight: 800;
            background: linear-gradient(135deg, var(--text-main) 30%, var(--text-muted) 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            margin-bottom: 8px;
            letter-spacing: -1px;
        }

        .subtitle {
            color: var(--text-muted);
            font-size: 1rem;
            margin-bottom: 32px;
            font-weight: 300;
            line-height: 1.5;
        }

        .input-group {
            text-align: left;
            margin-bottom: 24px;
        }

        label {
            display: block;
            font-size: 0.85rem;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 1px;
            margin-bottom: 8px;
            color: var(--text-muted);
        }

        .input-wrapper {
            position: relative;
        }

        input {
            width: 100%;
            padding: 16px;
            background: rgba(0, 0, 0, 0.2);
            border: 1px solid var(--border-color);
            border-radius: 12px;
            color: var(--text-main);
            font-size: 1rem;
            outline: none;
            transition: all 0.3s ease;
        }

        input:focus {
            border-color: var(--primary);
            box-shadow: 0 0 0 4px var(--primary-glow);
            background: rgba(0, 0, 0, 0.35);
        }

        .btn {
            width: 100%;
            padding: 16px;
            border: none;
            border-radius: 12px;
            font-size: 1rem;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
        }

        .btn-primary {
            background: linear-gradient(135deg, var(--primary) 0%, #3b82f6 100%);
            color: white;
            box-shadow: 0 4px 15px rgba(59, 130, 246, 0.3);
        }

        .btn-primary:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 25px rgba(59, 130, 246, 0.5);
        }

        .btn-primary:active {
            transform: translateY(0);
        }

        .btn-primary:disabled {
            background: var(--border-color);
            color: var(--text-muted);
            box-shadow: none;
            cursor: not-allowed;
            transform: none;
        }

        .link-section {
            margin-top: 24px;
            font-size: 0.9rem;
        }

        .link-section a {
            color: var(--secondary);
            text-decoration: none;
            font-weight: 600;
            transition: opacity 0.2s ease;
        }

        .link-section a:hover {
            opacity: 0.8;
            text-decoration: underline;
        }

        /* Success & Loading states */
        .status-container {
            display: none;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            margin-top: 20px;
            padding: 16px;
            border-radius: 12px;
            font-size: 0.95rem;
            animation: fadeIn 0.3s ease forwards;
        }

        .status-error {
            background: rgba(239, 68, 68, 0.1);
            border: 1px solid rgba(239, 68, 68, 0.2);
            color: #fca5a5;
        }

        .status-success {
            background: rgba(16, 185, 129, 0.1);
            border: 1px solid rgba(16, 185, 129, 0.2);
            color: #a7f3d0;
        }

        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
        }

        .spinner {
            width: 20px;
            height: 20px;
            border: 2px solid rgba(255, 255, 255, 0.3);
            border-radius: 50%;
            border-top-color: white;
            animation: spin 0.8s linear infinite;
            display: none;
        }

        @keyframes spin {
            to { transform: rotate(360deg); }
        }

        .hidden {
            display: none !important;
        }
    </style>
</head>
<body>
    <div class="blob blob-1"></div>
    <div class="blob blob-2"></div>

    <div class="container">
        <div class="card" id="setup-card">
            <h1 class="logo">zero-to-agentic</h1>
            <p class="subtitle">Onboarding Wizard: Let's configure your OpenRouter Token to activate your training sandbox.</p>

            <form id="token-form">
                <div class="input-group">
                    <label for="token">OpenRouter API Token</label>
                    <div class="input-wrapper">
                        <input type="password" id="token" placeholder="sk-or-v1-..." required autocomplete="off">
                    </div>
                </div>

                <button type="submit" class="btn btn-primary" id="submit-btn">
                    <span class="spinner" id="btn-spinner"></span>
                    <span id="btn-text">Validate & Save</span>
                </button>
            </form>

            <div class="link-section">
                Don't have a key? 
                <a href="https://openrouter.ai/keys" target="_blank" rel="noopener noreferrer">Get OpenRouter API Key ↗</a>
            </div>

            <div class="status-container" id="status-box"></div>
        </div>

        <div class="card hidden" id="success-card">
            <div style="font-size: 4rem; color: var(--success); margin-bottom: 20px;">✓</div>
            <h1 class="logo">Setup Completed!</h1>
            <p class="subtitle" style="margin-bottom: 0;">
                Your OpenRouter token has been validated and successfully saved to your global home profile: <br>
                <code style="display:inline-block; background:rgba(0,0,0,0.3); padding:4px 8px; border-radius:6px; margin-top:8px; font-family:monospace; font-size:0.9rem;">~/.openrouter_token</code>
            </p>
            <p class="subtitle" style="margin-top: 16px; font-size: 0.9rem;">
                You can now close this tab. Your vibe-coding agents can access this token globally for all lessons.
            </p>
        </div>
    </div>

    <script>
        const form = document.getElementById('token-form');
        const tokenInput = document.getElementById('token');
        const submitBtn = document.getElementById('submit-btn');
        const btnSpinner = document.getElementById('btn-spinner');
        const btnText = document.getElementById('btn-text');
        const statusBox = document.getElementById('status-box');
        const setupCard = document.getElementById('setup-card');
        const successCard = document.getElementById('success-card');

        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const token = tokenInput.value.trim();

            if (!token) return;

            // Set loading state
            submitBtn.disabled = true;
            btnSpinner.style.display = 'block';
            btnText.textContent = 'Validating Token...';
            statusBox.className = 'status-container';
            statusBox.style.display = 'none';

            try {
                const response = await fetch('/api/save', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ token })
                });

                const data = await response.json();

                if (data.success) {
                    // Transition to success state
                    setupCard.classList.add('hidden');
                    successCard.classList.remove('hidden');
                } else {
                    // Show error
                    statusBox.textContent = data.error || 'Token validation failed.';
                    statusBox.classList.add('status-error');
                    statusBox.style.display = 'flex';
                }
            } catch (err) {
                statusBox.textContent = 'Server connection error. Please try again.';
                statusBox.classList.add('status-error');
                statusBox.style.display = 'flex';
            } finally {
                // Reset loading state
                submitBtn.disabled = false;
                btnSpinner.style.display = 'none';
                btnText.textContent = 'Validate & Save';
            }
        });
    </script>
</body>
</html>
`;

// Helper to open the browser based on OS
function openBrowser(url) {
    const start = process.platform === 'darwin' ? 'open' : process.platform === 'win32' ? 'start' : 'xdg-open';
    exec(`${start} ${url}`, (err) => {
        if (err) {
            console.log(`\nPlease open your browser and navigate to: ${url}`);
        }
    });
}

// Helper to validate the token against OpenRouter
function validateToken(token, callback) {
    const options = {
        hostname: 'openrouter.ai',
        port: 443,
        path: '/api/v1/auth/key',
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`,
            'User-Agent': 'zero-to-agentic-onboarding/1.0'
        }
    };

    const req = https.request(options, (res) => {
        let body = '';
        res.on('data', (chunk) => body += chunk);
        res.on('end', () => {
            if (res.statusCode === 200) {
                try {
                    const data = JSON.parse(body);
                    if (data && data.data && data.data.is_valid !== false) {
                        callback(null, data.data);
                    } else {
                        callback(new Error('API key reports as invalid. Check limits or credits.'));
                    }
                } catch (e) {
                    callback(null, {}); // Standard success if JSON fails to parse but returns 200
                }
            } else {
                callback(new Error(`Validation failed. Status code: ${res.statusCode}. Please verify your key.`));
            }
        });
    });

    req.on('error', (err) => {
        callback(new Error(`Network connection error: ${err.message}`));
    });

    req.end();
}

// Ensure the scripts/ parent directory exists (already should be created)
const server = http.createServer((req, res) => {
    if (req.method === 'GET' && req.url === '/') {
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(HTML_CONTENT);
    } else if (req.method === 'POST' && req.url === '/api/save') {
        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', () => {
            try {
                const { token } = JSON.parse(body);
                if (!token) {
                    res.writeHead(400, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ success: false, error: 'Token is required' }));
                    return;
                }

                // Validate the token
                validateToken(token, (err, keyInfo) => {
                    if (err) {
                        res.writeHead(400, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({ success: false, error: err.message }));
                        return;
                    }

                    // Save token to ~/.openrouter_token
                    fs.writeFile(TOKEN_FILE_PATH, token.trim(), 'utf8', (writeErr) => {
                        if (writeErr) {
                            res.writeHead(500, { 'Content-Type': 'application/json' });
                            res.end(JSON.stringify({ success: false, error: 'Failed to write token file.' }));
                            return;
                        }

                        res.writeHead(200, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({ success: true, info: keyInfo }));

                        // Gracefully terminate the server in 2 seconds
                        setTimeout(() => {
                            console.log('\n✅ Onboarding complete! Token saved successfully.');
                            console.log('Shutting down setup wizard...');
                            process.exit(0);
                        }, 2000);
                    });
                });
            } catch (e) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: false, error: 'Invalid payload.' }));
            }
        });
    } else {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('Not Found');
    }
});

server.listen(PORT, () => {
    const url = `http://localhost:${PORT}`;
    console.log(`\n=============================================`);
    console.log(`Setup wizard server listening on ${url}`);
    console.log(`Opening your web browser to finish setup...`);
    console.log(`=============================================\n`);
    openBrowser(url);
});
