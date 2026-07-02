/**
 * zero-to-agentic-workflows: Session 03 (Memory) CLI Chat Solved Reference
 * 
 * Run this script using: node cli-chat-solved.js
 */

const fs = require('fs');
const path = require('path');
const os = require('os');
const https = require('https');
const readline = require('readline');

// File paths
const TOKEN_FILE_PATH = path.join(os.homedir(), '.openrouter_token');
const MEMORY_FILE_PATH = path.join(__dirname, 'memories.md');

// Read OpenRouter Token
if (!fs.existsSync(TOKEN_FILE_PATH)) {
    console.error('\n❌ OpenRouter token not found!');
    console.error('Please run "./setup.sh" in the repository root directory to validate and save your token first.\n');
    process.exit(1);
}
const token = fs.readFileSync(TOKEN_FILE_PATH, 'utf8').trim();

// Setup Readline Interface
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

// Configure Fallback Models (if dynamic load fails)
const FALLBACK_MODELS = [
    { id: 'openrouter/free', name: 'Auto Free Model (OpenRouter)', supportsTools: true },
    { id: 'meta-llama/llama-3.3-70b-instruct:free', name: 'Llama 3.3 70B Instruct (Free)', supportsTools: true },
    { id: 'meta-llama/llama-3.2-3b-instruct:free', name: 'Llama 3.2 3B Instruct (Free)', supportsTools: true }
];

let MODELS = [];
let selectedModel = 'openrouter/free';
let memoryMode = '1'; // Default: Stateless
let chatHistory = []; // Array of message objects
let toolHistory = []; // Local history for tool calling to avoid crossover

// Setup memories.md if it doesn't exist
if (!fs.existsSync(MEMORY_FILE_PATH)) {
    fs.writeFileSync(MEMORY_FILE_PATH, '# Saved Memories\n\n', 'utf8');
}

// Fetch and filter all free models dynamically from OpenRouter
function fetchFreeModels() {
    return new Promise((resolve) => {
        console.log('🔄 Fetching latest free models from OpenRouter...');
        const options = {
            hostname: 'openrouter.ai',
            port: 443,
            path: '/api/v1/models',
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        };

        const req = https.request(options, (res) => {
            let body = '';
            res.on('data', (chunk) => body += chunk);
            res.on('end', () => {
                if (res.statusCode !== 200) {
                    console.log('⚠️ Failed to fetch models. Using local fallback models.');
                    return resolve(FALLBACK_MODELS);
                }
                try {
                    const parsed = JSON.parse(body);
                    if (parsed && parsed.data) {
                        // Filter for free models
                        const free = parsed.data.filter(m => {
                            const pPrompt = parseFloat(m.pricing?.prompt || 0);
                            const pCompletion = parseFloat(m.pricing?.completion || 0);
                            return pPrompt === 0 && pCompletion === 0;
                        });

                        // Map models to check for tool capability
                        const mapped = free.map(m => {
                            const supportsTools = m.supported_parameters && m.supported_parameters.includes('tools');
                            return {
                                id: m.id,
                                name: m.name || m.id,
                                supportsTools: supportsTools
                            };
                        });

                        // Sort tool-capable first
                        mapped.sort((a, b) => {
                            if (a.supportsTools && !b.supportsTools) return -1;
                            if (!a.supportsTools && b.supportsTools) return 1;
                            return a.name.localeCompare(b.name);
                        });

                        // Ensure openrouter/free is at the top
                        const autoFreeIdx = mapped.findIndex(m => m.id === 'openrouter/free');
                        if (autoFreeIdx > -1) {
                            const [autoFree] = mapped.splice(autoFreeIdx, 1);
                            mapped.unshift(autoFree);
                        }

                        resolve(mapped.length > 0 ? mapped : FALLBACK_MODELS);
                    } else {
                        resolve(FALLBACK_MODELS);
                    }
                } catch (e) {
                    resolve(FALLBACK_MODELS);
                }
            });
        });

        req.on('error', () => resolve(FALLBACK_MODELS));
        req.end();
    });
}

// Helper: Make API Request to OpenRouter
function makeOpenRouterCall(payload) {
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
                'X-Title': 'Zero to Agentic Workflows CLI Solved',
                'Content-Length': Buffer.byteLength(postData)
            }
        };

        const req = https.request(options, (res) => {
            let body = '';
            res.on('data', (chunk) => body += chunk);
            res.on('end', () => {
                if (res.statusCode !== 200) {
                    let errMessage = `Error ${res.statusCode}`;
                    try {
                        const parsed = JSON.parse(body);
                        if (parsed.error && parsed.error.message) errMessage += `: ${parsed.error.message}`;
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

        req.on('error', (err) => reject(err));
        req.write(postData);
        req.end();
    });
}

// ----------------------------------------------------
// EXERCISE SOLUTIONS
// ----------------------------------------------------

function handleSessionMemory(messages, userMessage, assistantMessage = null) {
    if (assistantMessage === null) {
        messages.push({ role: 'user', content: userMessage });
        return messages;
    } else {
        messages.push({ role: 'assistant', content: assistantMessage });
        return messages;
    }
}

function handlePersistentLog(userMessage, assistantMessage = null) {
    if (assistantMessage === null) {
        let memories = "";
        if (fs.existsSync(MEMORY_FILE_PATH)) {
            memories = fs.readFileSync(MEMORY_FILE_PATH, 'utf8');
        }
        return `You are a helpful customer support assistant. You have access to the following historical conversation logs and memories from disk:\n\n${memories}\n\nMaintain conversation continuity based on these logs.`;
    } else {
        const logEntry = `\n--- Chat Log ---\nUser: ${userMessage}\nAssistant: ${assistantMessage}\n`;
        fs.appendFileSync(MEMORY_FILE_PATH, logEntry, 'utf8');
    }
}

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

function executeLocalTool(name, args) {
    if (name === 'save_memory') {
        const fact = args.fact;
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
        if (matches.length === 0) return `No matches found for query "${query}".`;
        return `Found matching memories:\n${matches.join('\n')}`;
    }
    
    return `Error: Unknown tool ${name}`;
}

async function handleToolCallingMemory(userMessage) {
    toolHistory.push({ role: 'user', content: userMessage });
    
    const systemInstruction = 'You are an assistant with long-term memory. You must selectively save key user facts (like name, favorite programming language) using the save_memory tool. When asked about things from past sessions, search for them using the search_memory tool before saying you do not know.';

    const payload = {
        model: selectedModel,
        messages: [
            { role: 'system', content: systemInstruction },
            ...toolHistory
        ],
        tools: MEMORY_TOOLS
    };
    
    let data = await makeOpenRouterCall(payload);
    let message = data.choices[0].message;
    
    while (message.tool_calls && message.tool_calls.length > 0) {
        console.log(`\n⚙️ [AI Tool Call]: Detected ${message.tool_calls.length} tool calls...`);
        toolHistory.push(message);
        
        for (const toolCall of message.tool_calls) {
            const name = toolCall.function.name;
            const args = JSON.parse(toolCall.function.arguments);
            console.log(`   Running tool ${name} with args:`, args);
            
            const result = executeLocalTool(name, args);
            console.log(`   Tool response: ${result}`);
            
            toolHistory.push({
                role: 'tool',
                tool_call_id: toolCall.id,
                name: name,
                content: result
            });
        }
        
        const followUpPayload = {
            model: selectedModel,
            messages: [
                { role: 'system', content: systemInstruction },
                ...toolHistory
            ],
            tools: MEMORY_TOOLS
        };
        
        data = await makeOpenRouterCall(followUpPayload);
        message = data.choices[0].message;
    }
    
    toolHistory.push(message);
    return message.content;
}

// ----------------------------------------------------
// CLI ORCHESTRATION & CHAT LOOP
// ----------------------------------------------------

async function processUserPrompt(input) {
    const cmd = input.trim().toLowerCase();

    if (cmd === 'exit') {
        console.log('\nGoodbye! 👋\n');
        process.exit(0);
    }
    if (cmd === 'clear') {
        chatHistory = [];
        toolHistory = [];
        console.log('\n🧹 Chat history cleared (New Session started).\n');
        promptUser();
        return;
    }
    if (cmd === 'reset') {
        chatHistory = [];
        toolHistory = [];
        fs.writeFileSync(MEMORY_FILE_PATH, '# Saved Memories\n\n', 'utf8');
        console.log('\n💾 Long-term memory memories.md erased & active chat cleared.\n');
        promptUser();
        return;
    }
    if (cmd === 'model') {
        promptModelSelection();
        return;
    }
    if (cmd === 'menu') {
        displayMenu();
        return;
    }
    if (cmd === 'help') {
        printHelp();
        promptUser();
        return;
    }

    console.log('\n🤖 Assistant is thinking...');

    try {
        let responseText = '';

        if (memoryMode === '1') {
            const payload = {
                model: selectedModel,
                messages: [{ role: 'user', content: input }]
            };
            const data = await makeOpenRouterCall(payload);
            responseText = data.choices[0].message.content;

        } else if (memoryMode === '2') {
            chatHistory = handleSessionMemory(chatHistory, input);
            const payload = {
                model: selectedModel,
                messages: chatHistory
            };
            const data = await makeOpenRouterCall(payload);
            responseText = data.choices[0].message.content;
            handleSessionMemory(chatHistory, input, responseText);

        } else if (memoryMode === '3') {
            const sysPrompt = handlePersistentLog(input);
            chatHistory = handleSessionMemory(chatHistory, input);
            
            const messagesPayload = [
                { role: 'system', content: sysPrompt },
                ...chatHistory
            ];
            
            const payload = {
                model: selectedModel,
                messages: messagesPayload
            };
            const data = await makeOpenRouterCall(payload);
            responseText = data.choices[0].message.content;
            
            handleSessionMemory(chatHistory, input, responseText);
            handlePersistentLog(input, responseText);

        } else if (memoryMode === '4') {
            responseText = await handleToolCallingMemory(input);
        }

        console.log(`\n🤖: ${responseText}\n`);
    } catch (err) {
        console.log(`\n❌ Error: ${err.message}\n`);
    }

    promptUser();
}

function promptUser() {
    rl.question('You: ', (input) => {
        processUserPrompt(input);
    });
}

function printHelp() {
    console.log('\nCommands during chat:');
    console.log('  - Type "clear" to start a new chat session (wipes short-term memory)');
    console.log('  - Type "reset" to erase the long-term memories.md file on disk');
    console.log('  - Type "model" to switch active model during the conversation');
    console.log('  - Type "menu" to return to the main selection screen');
    console.log('  - Type "help" to see these commands');
    console.log('  - Type "exit" to close the application\n');
}

function promptModelSelection() {
    console.log('\nAvailable Models:');
    MODELS.forEach((m, idx) => {
        const tag = m.supportsTools ? ' [🛠️ Tool-Capable]' : ' [Text-Only]';
        console.log(`  [${idx + 1}] ${m.name}${tag}`);
    });
    rl.question(`\nSelect model (1-${MODELS.length}): `, (choice) => {
        const idx = parseInt(choice) - 1;
        if (idx >= 0 && idx < MODELS.length) {
            selectedModel = MODELS[idx].id;
            console.log(`\nActive Model set to: ${selectedModel}\n`);
        } else {
            console.log('\nInvalid choice. Model remains unchanged.');
        }
        promptUser();
    });
}

function displayMenu() {
    console.clear();
    console.log('=============================================');
    console.log('  Zero to Agentic Workflows: CLI Memory Chat');
    console.log('=============================================');
    console.log(`Token Loaded: ...${token.substring(Math.max(0, token.length - 10))}`);
    console.log(`Active Model: ${selectedModel}\n`);
    console.log('Select Memory Mode:');
    console.log('  [1] Stateless Mode (Goldfish - forgets everything)');
    console.log('  [2] Session Memory (Remembers within active chat)');
    console.log('  [3] Persistent Log (Appends everything to memories.md)');
    console.log('  [4] Tool-Calling Memory (AI writes/reads memories.md selectively)');
    printHelp();
    console.log('=============================================\n');

    rl.question('Enter choice (1-4): ', (choice) => {
        if (['1', '2', '3', '4'].includes(choice)) {
            memoryMode = choice;
            console.log(`\nMode set to: Option ${choice}`);
            
            console.log('\nAvailable Models:');
            MODELS.forEach((m, idx) => {
                const tag = m.supportsTools ? ' [🛠️ Tool-Capable]' : ' [Text-Only]';
                console.log(`  [${idx + 1}] ${m.name}${tag}`);
            });
            rl.question(`\nChoose Model (1-${MODELS.length}): `, (modelIdx) => {
                const idx = parseInt(modelIdx) - 1;
                if (idx >= 0 && idx < MODELS.length) {
                    selectedModel = MODELS[idx].id;
                } else {
                    console.log(`\nInvalid choice. Defaulting to: ${selectedModel}`);
                }
                console.log(`\nActive Model set to: ${selectedModel}\n`);
                console.log('--- Start Chatting! ---');
                promptUser();
            });
        } else {
            console.log('\nInvalid choice. Defaulting to Stateless Mode (1).');
            promptUser();
        }
    });
}

// Startup Flow
async function start() {
    MODELS = await fetchFreeModels();
    selectedModel = MODELS[0].id;
    displayMenu();
}

start();
