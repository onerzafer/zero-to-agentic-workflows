const express = require('express');
const fs = require('fs');
const path = require('path');
const os = require('os');
const https = require('https');

const app = express();
const PORT = process.env.PORT || 8282;

const TOKEN_FILE_PATH = path.join(os.homedir(), '.openrouter_token');

// Parse JSON payloads
app.use(express.json());

// Serve static frontend assets
app.use(express.static(path.join(__dirname, 'public')));

// API endpoint to proxy the request to OpenRouter
app.post('/api/chat', (req, res) => {
    const { model, systemPrompt, userPrompt } = req.body;

    if (!model || !userPrompt) {
        return res.status(400).json({ error: 'Model and User Prompt are required.' });
    }

    // 1. Read token from the global shared location
    fs.readFile(TOKEN_FILE_PATH, 'utf8', (err, tokenData) => {
        if (err) {
            return res.status(400).json({
                error: 'Global OpenRouter token not found. Please run "./setup.sh" in the repository root first to set up and validate your token.'
            });
        }

        const token = tokenData.trim();
        if (!token) {
            return res.status(400).json({
                error: 'Global OpenRouter token is empty. Please run "./setup.sh" in the repository root to re-authenticate.'
            });
        }

        // 2. Build OpenRouter request payload
        const messages = [];
        if (systemPrompt && systemPrompt.trim()) {
            messages.push({ role: 'system', content: systemPrompt });
        }
        messages.push({ role: 'user', content: userPrompt });

        const postData = JSON.stringify({
            model: model,
            messages: messages,
            temperature: 0.7
        });

        const options = {
            hostname: 'openrouter.ai',
            port: 443,
            path: '/api/v1/chat/completions',
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
                'HTTP-Referer': 'https://github.com/oner/zero-to-agentic-workflows',
                'X-Title': 'Zero to Agentic Workflows Course',
                'Content-Length': Buffer.byteLength(postData)
            }
        };

        // 3. Make HTTP request to OpenRouter
        const apiReq = https.request(options, (apiRes) => {
            let responseBody = '';
            apiRes.on('data', (chunk) => {
                responseBody += chunk;
            });

            apiRes.on('end', () => {
                if (apiRes.statusCode === 200) {
                    try {
                        const parsed = JSON.parse(responseBody);
                        if (parsed.choices && parsed.choices[0] && parsed.choices[0].message) {
                            res.json({ response: parsed.choices[0].message.content });
                        } else {
                            res.status(500).json({ error: 'Unexpected API response structure from OpenRouter.' });
                        }
                    } catch (e) {
                        res.status(500).json({ error: 'Failed to parse API response.' });
                    }
                } else {
                    let errorMessage = `OpenRouter API returned error code ${apiRes.statusCode}`;
                    try {
                        const parsedError = JSON.parse(responseBody);
                        if (parsedError.error && parsedError.error.message) {
                            errorMessage += `: ${parsedError.error.message}`;
                        }
                    } catch (e) { }
                    res.status(apiRes.statusCode).json({ error: errorMessage });
                }
            });
        });

        apiReq.on('error', (reqErr) => {
            res.status(500).json({ error: `Connection to OpenRouter failed: ${reqErr.message}` });
        });

        apiReq.write(postData);
        apiReq.end();
    });
});

app.listen(PORT, () => {
    console.log(`\n=============================================`);
    console.log(`System Prompt Playground listening on http://localhost:${PORT}`);
    console.log(`Make sure your token is configured via ./setup.sh!`);
    console.log(`=============================================\n`);

    // Automatically open the default browser
    const url = `http://localhost:${PORT}`;
    const startCmd = process.platform === 'darwin' ? 'open' : process.platform === 'win32' ? 'start ""' : 'xdg-open';
    require('child_process').exec(`${startCmd} "${url}"`, (err) => {
        if (err) {
            console.error(`Failed to automatically open browser: ${err.message}`);
        }
    });
});
