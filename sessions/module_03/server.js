const express = require('express');
const fs = require('fs');
const path = require('path');
const os = require('os');
const https = require('https');

const app = express();
const PORT = process.env.PORT || 8282;

const TOKEN_FILE_PATH = path.join(os.homedir(), '.openrouter_token');
const MEMORY_FILE_PATH = path.join(__dirname, 'memories.md');

// Parse JSON payloads
app.use(express.json());

// Serve static frontend assets
app.use(express.static(path.join(__dirname, 'public')));

// Ensure memories.md exists
if (!fs.existsSync(MEMORY_FILE_PATH)) {
    fs.writeFileSync(MEMORY_FILE_PATH, '# Saved Memories\n\n', 'utf8');
}

// Helper: Read Token
function getOpenRouterToken() {
    if (!fs.existsSync(TOKEN_FILE_PATH)) {
        throw new Error('Global OpenRouter token not found. Please run "./setup.sh" in the repository root directory to validate and configure your token.');
    }
    const token = fs.readFileSync(TOKEN_FILE_PATH, 'utf8').trim();
    if (!token) {
        throw new Error('Global OpenRouter token is empty. Please run "./setup.sh" to authenticate.');
    }
    return token;
}

// Helper: Make API Request to OpenRouter
function makeOpenRouterCall(token, payload) {
    return new Promise((resolve, reject) => {
        const postData = JSON.stringify(payload);
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

        const req = https.request(options, (res) => {
            let body = '';
            res.on('data', (chunk) => body += chunk);
            res.on('end', () => {
                if (res.statusCode !== 200) {
                    let errMessage = `OpenRouter API returned error code ${res.statusCode}`;
                    try {
                        const parsed = JSON.parse(body);
                        if (parsed.error && parsed.error.message) {
                            errMessage += `: ${parsed.error.message}`;
                        }
                    } catch (e) {}
                    return reject(new Error(errMessage));
                }
                try {
                    resolve(JSON.parse(body));
                } catch (e) {
                    reject(new Error('Failed to parse API response.'));
                }
            });
        });

        req.on('error', (err) => reject(new Error(`Connection to OpenRouter failed: ${err.message}`)));
        req.write(postData);
        req.end();
    });
}

// Tool definitions for persistent memory
const MEMORY_TOOLS = [
    {
        type: "function",
        function: {
            name: "save_memory",
            description: "Saves a specific fact, preference, or detail about the user to memories.md for retrieval in future sessions. Only save important details like names, preferences, or explicit facts.",
            parameters: {
                type: "object",
                properties: {
                    fact: {
                        type: "string",
                        description: "The fact, preference, or detail to remember (e.g. 'User name is Alice', 'User prefers JavaScript')."
                    }
                },
                required: ["fact"]
            }
        }
    },
    {
        type: "function",
        function: {
            name: "search_memory",
            description: "Searches the memories.md file for past facts, preferences, or details using a text query.",
            parameters: {
                type: "object",
                properties: {
                    query: {
                        type: "string",
                        description: "The term or phrase to search for (e.g. 'name', 'language')."
                    }
                },
                required: ["query"]
            }
        }
    }
];

// Tool Execution Logic
function executeLocalTool(name, args) {
    if (name === 'save_memory') {
        const fact = args.fact;
        // Verify file headers
        if (!fs.existsSync(MEMORY_FILE_PATH) || fs.readFileSync(MEMORY_FILE_PATH, 'utf8').trim() === '') {
            fs.writeFileSync(MEMORY_FILE_PATH, '# Saved Memories\n\n', 'utf8');
        }
        fs.appendFileSync(MEMORY_FILE_PATH, `* ${fact}\n`, 'utf8');
        return `Successfully saved fact: "${fact}" to memories.md`;
    }
    
    if (name === 'search_memory') {
        const query = args.query.toLowerCase();
        if (!fs.existsSync(MEMORY_FILE_PATH)) return "No memories found.";
        const content = fs.readFileSync(MEMORY_FILE_PATH, 'utf8');
        const lines = content.split('\n');
        const matches = lines.filter(line => line.toLowerCase().includes(query) && line.startsWith('*'));
        if (matches.length === 0) return `No matches found in memories.md for query "${query}".`;
        return `Matching memories found in memories.md:\n${matches.join('\n')}`;
    }
    
    return `Error: Unknown tool ${name}`;
}

// GET Endpoint to fetch and filter OpenRouter free models
app.get('/api/models', async (req, res) => {
    try {
        const token = getOpenRouterToken();
        const options = {
            hostname: 'openrouter.ai',
            port: 443,
            path: '/api/v1/models',
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        };

        const apiReq = https.request(options, (apiRes) => {
            let body = '';
            apiRes.on('data', (chunk) => body += chunk);
            apiRes.on('end', () => {
                if (apiRes.statusCode !== 200) {
                    let errText = `OpenRouter API returned error ${apiRes.statusCode}`;
                    return res.status(apiRes.statusCode).json({ error: errText });
                }
                try {
                    const parsed = JSON.parse(body);
                    if (parsed && parsed.data) {
                        const freeModels = parsed.data.filter(model => {
                            const pricePrompt = parseFloat(model.pricing?.prompt || 0);
                            const priceCompletion = parseFloat(model.pricing?.completion || 0);
                            return pricePrompt === 0 && priceCompletion === 0;
                        });
                        res.json({ models: freeModels });
                    } else {
                        res.status(500).json({ error: 'Unexpected response structure from OpenRouter' });
                    }
                } catch (e) {
                    res.status(500).json({ error: 'Failed to parse models response' });
                }
            });
        });

        apiReq.on('error', (err) => {
            res.status(500).json({ error: `Connection to OpenRouter failed: ${err.message}` });
        });

        apiReq.end();
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET Endpoint to read current memories
app.get('/api/memory', (req, res) => {
    fs.readFile(MEMORY_FILE_PATH, 'utf8', (err, data) => {
        if (err) {
            return res.status(500).json({ error: 'Failed to read memories.md' });
        }
        res.json({ content: data });
    });
});

// POST Endpoint to manually update memories
app.post('/api/memory', (req, res) => {
    const { content } = req.body;
    fs.writeFile(MEMORY_FILE_PATH, content || '# Saved Memories\n\n', 'utf8', (err) => {
        if (err) {
            return res.status(500).json({ error: 'Failed to write memories.md' });
        }
        res.json({ success: true });
    });
});

// POST Endpoint to wipe memories.md
app.post('/api/reset', (req, res) => {
    fs.writeFile(MEMORY_FILE_PATH, '# Saved Memories\n\n', 'utf8', (err) => {
        if (err) {
            return res.status(500).json({ error: 'Failed to reset memories.md' });
        }
        res.json({ success: true });
    });
});

// Main Chat Gateway
app.post('/api/chat', async (req, res) => {
    const { model, mode, messages, userMessage } = req.body;

    if (!model || !userMessage) {
        return res.status(400).json({ error: 'Model and User Message are required.' });
    }

    try {
        const token = getOpenRouterToken();
        let finalResponse = '';
        let payloadMessages = [];
        let executedTools = [];

        // ----------------------------------------------------
        // MODE 1: Stateless Mode (Goldfish)
        // ----------------------------------------------------
        if (mode === 'stateless') {
            payloadMessages = [{ role: 'user', content: userMessage }];
            
            const payload = {
                model: model,
                messages: payloadMessages
            };
            const data = await makeOpenRouterCall(token, payload);
            finalResponse = data.choices[0].message.content;
        }

        // ----------------------------------------------------
        // MODE 2: Session Memory (Short-Term Memory)
        // ----------------------------------------------------
        else if (mode === 'session') {
            // Frontend passes the active chat history array
            payloadMessages = [...messages];
            payloadMessages.push({ role: 'user', content: userMessage });

            const payload = {
                model: model,
                messages: payloadMessages
            };
            const data = await makeOpenRouterCall(token, payload);
            finalResponse = data.choices[0].message.content;
        }

        // ----------------------------------------------------
        // MODE 3: Persistent Log (Log All)
        // ----------------------------------------------------
        else if (mode === 'persist-all') {
            // 1. Read existing memories.md to inject as grounding context
            let existingMemories = '';
            if (fs.existsSync(MEMORY_FILE_PATH)) {
                existingMemories = fs.readFileSync(MEMORY_FILE_PATH, 'utf8');
            }

            const systemPrompt = `You are a helpful customer support assistant. You have access to the following historical conversation logs and memories from disk:\n\n${existingMemories}\n\nMaintain conversation continuity based on these logs.`;

            // 2. Assemble context window payload
            payloadMessages = [
                { role: 'system', content: systemPrompt },
                ...messages,
                { role: 'user', content: userMessage }
            ];

            const payload = {
                model: model,
                messages: payloadMessages
            };
            const data = await makeOpenRouterCall(token, payload);
            finalResponse = data.choices[0].message.content;

            // 3. Append this turn to memories.md (Record Everything)
            const logEntry = `\n--- Chat Log ---\nUser: ${userMessage}\nAssistant: ${finalResponse}\n`;
            fs.appendFileSync(MEMORY_FILE_PATH, logEntry, 'utf8');
        }

        // ----------------------------------------------------
        // MODE 4: Tool-Calling Memory
        // ----------------------------------------------------
        else if (mode === 'persist-tool') {
            // Frontend passes history (tool history is preserved client-side or backend-side,
            // we will feed the incoming message array directly).
            payloadMessages = [...messages];
            payloadMessages.push({ role: 'user', content: userMessage });

            const systemPrompt = 'You are an assistant with long-term memory. You must selectively save key user facts (like name, favorite programming language) using the save_memory tool. When asked about things from past sessions, search for them using the search_memory tool before saying you do not know.';

            let payload = {
                model: model,
                messages: [
                    { role: 'system', content: systemPrompt },
                    ...payloadMessages
                ],
                tools: MEMORY_TOOLS
            };

            let data = await makeOpenRouterCall(token, payload);
            let responseMessage = data.choices[0].message;

            // Interception Loop (while model returns tool_calls)
            while (responseMessage.tool_calls && responseMessage.tool_calls.length > 0) {
                // Save tool calls to our list
                payloadMessages.push(responseMessage);

                for (const toolCall of responseMessage.tool_calls) {
                    const name = toolCall.function.name;
                    const args = JSON.parse(toolCall.function.arguments);
                    
                    // Run execution
                    const result = executeLocalTool(name, args);
                    
                    executedTools.push({
                        id: toolCall.id,
                        name: name,
                        arguments: args,
                        result: result
                    });

                    // Append tool response
                    payloadMessages.push({
                        role: 'tool',
                        tool_call_id: toolCall.id,
                        name: name,
                        content: result
                    });
                }

                // Re-query the model
                payload = {
                    model: model,
                    messages: [
                        { role: 'system', content: systemPrompt },
                        ...payloadMessages
                    ],
                    tools: MEMORY_TOOLS
                };

                data = await makeOpenRouterCall(token, payload);
                responseMessage = data.choices[0].message;
            }

            finalResponse = responseMessage.content;
            // Clean up system instructions from response messages array before returning it
            payloadMessages = payloadMessages.filter(msg => msg.role !== 'system');
        }

        // Return the final text response, the updated active payload, and logs of tools run
        res.json({
            response: finalResponse,
            messagesPayload: payloadMessages,
            executedTools: executedTools
        });

    } catch (err) {
        console.error('API Error:', err.message);
        res.status(500).json({ error: err.message });
    }
});

app.listen(PORT, () => {
    console.log(`\n=============================================`);
    console.log(`Persistent Memory Playground listening on http://localhost:${PORT}`);
    console.log(`Make sure your token is configured via ./setup.sh!`);
    console.log(`=============================================\n`);

    // Automatically open the default browser (UI track)
    const url = `http://localhost:${PORT}`;
    const startCmd = process.platform === 'darwin' ? 'open' : process.platform === 'win32' ? 'start ""' : 'xdg-open';
    require('child_process').exec(`${startCmd} "${url}"`, (err) => {
        if (err) {
            console.error(`Failed to automatically open browser: ${err.message}`);
        }
    });
});
