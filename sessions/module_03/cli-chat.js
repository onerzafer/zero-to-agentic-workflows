/**
 * zero-to-agentic-workflows: Session 03 (Memory) CLI Chat Skeleton
 * 
 * Run this script using: node cli-chat.js
 * 
 * Techie Exercises:
 * - Exercise 1: Implement short-term session memory (maintaining history in the messages array).
 * - Exercise 2: Implement persistent logging (writing and reading memories.md).
 * - Exercise 3: Implement native tool calling (defining and executing save_memory & search_memory).
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
let chatHistory = []; // Array of message objects { role: 'user'|'assistant', content: '...' }
let toolHistory = []; // Local history for tool calling to avoid crossover

// Setup memories.md if it doesn't exist
if (!fs.existsSync(MEMORY_FILE_PATH)) {
    fs.writeFileSync(MEMORY_FILE_PATH, '# Session Memories\n\n', 'utf8');
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
                'X-Title': 'Zero to Agentic Workflows CLI',
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
// TECHIE EXERCISES CODE BASES
// ----------------------------------------------------

/**
 * Exercise 1: Session Memory
 * TODO: Techie Exercise 1
 * Maintain conversation context. Update the `messages` array by appending
 * the user input and the assistant response.
 * 
 * @param {Array} messages - Current API messages array
 * @param {string} userMessage - User's latest input
 * @param {string} assistantMessage - Assistant's response (or null when building request)
 */
function handleSessionMemory(messages, userMessage, assistantMessage = null) {
    // ---- START TODO: EXERCISE 1 ----
    // Hint: If assistantMessage is null, we are preparing the messages array to send to the API.
    // We should push the user's message: { role: 'user', content: userMessage }.
    // If assistantMessage is NOT null, we are saving the assistant's response.
    // We should push the assistant's message: { role: 'assistant', content: assistantMessage }.
    
    // For now, this is stateless and only returns the latest user message
    if (assistantMessage === null) {
        return [{ role: 'user', content: userMessage }];
    }
    return [];
    // ---- END TODO: EXERCISE 1 ----
}

/**
 * Exercise 2: Persistent Log (Log All)
 * TODO: Techie Exercise 2
 * Read the memories.md file at startup and inject its contents into the system prompt.
 * Also, write/append new conversation exchanges to memories.md.
 * 
 * @param {string} userMessage - User's latest input
 * @param {string} assistantMessage - Assistant's response
 */
function handlePersistentLog(userMessage, assistantMessage = null) {
    // ---- START TODO: EXERCISE 2 ----
    // 1. Read existing contents of memories.md.
    // 2. Return a system prompt containing these memories, so the LLM is aware of them.
    // 3. When assistantMessage is provided, append the user-assistant exchange to memories.md.
    
    // Placeholder returning default system instruction
    return "You are a helpful assistant.";
    // ---- END TODO: EXERCISE 2 ----
}

/**
 * Exercise 3: Tool-Calling Memory
 * TODO: Techie Exercise 3
 * Define native tool schemas for save_memory and search_memory,
 * execute them locally when the model requests it, and return the result.
 */

// Define the tool schemas in JSON format
const MEMORY_TOOLS = [
    // ---- START TODO: EXERCISE 3 (Part A - Schema) ----
    // Define save_memory and search_memory tools using OpenAI's tool format.
    // Example: { type: "function", function: { name: "...", description: "...", parameters: {...} } }
    // ---- END TODO: EXERCISE 3 (Part A - Schema) ----
];

// Tool Implementation Logic
function executeLocalTool(name, args) {
    // ---- START TODO: EXERCISE 3 (Part B - Execution) ----
    // Implement the physical action on memories.md.
    // - save_memory(fact): Appends the fact as a bullet point under a "# Saved Memories" section.
    // - search_memory(query): Reads memories.md, searches for lines containing the query, and returns them.
    
    if (name === 'save_memory') {
        const fact = args.fact;
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
    // ---- END TODO: EXERCISE 3 (Part B - Execution) ----
}

// Main logic for processing chat in Exercise 3
async function handleToolCallingMemory(userMessage) {
    // ---- START TODO: EXERCISE 3 (Part C - Tool-Calling Loop) ----
    // 
    // Step-by-Step Implementation Guide:
    // 
    // 1. Push the user's message to the global `toolHistory` array.
    //    Format: { role: 'user', content: userMessage }
    //
    // 2. Define a system instruction telling the model to selectively use the 'save_memory'
    //    tool to record user details, and 'search_memory' to look up past facts.
    //
    // 3. Make the first API call using: const data = await makeOpenRouterCall(payload);
    //    The payload must include:
    //    {
    //        model: selectedModel,
    //        messages: [ { role: 'system', content: systemInstruction }, ...toolHistory ],
    //        tools: MEMORY_TOOLS
    //    }
    //
    // 4. Extract the response message object: let message = data.choices[0].message;
    //
    // 5. Build an Interception Loop: while (message.tool_calls && message.tool_calls.length > 0)
    //    a. Push the assistant's message (which contains the tool_calls request) into `toolHistory`.
    //    b. Loop through each toolCall in `message.tool_calls`:
    //       - Parse the arguments: const args = JSON.parse(toolCall.function.arguments);
    //       - Run the local tool: const result = executeLocalTool(toolCall.function.name, args);
    //       - Push the tool's result to `toolHistory` with role 'tool':
    //         { role: 'tool', tool_call_id: toolCall.id, name: toolCall.function.name, content: result }
    //    c. Re-query OpenRouter with the updated history (containing the tool responses) and the tools definitions.
    //    d. Update `message` with the new choice: message = data.choices[0].message;
    //
    // 6. Push the final text response (non-tool message) to `toolHistory` and return its content string.
    
    // Default fallback to stateless response (replace this with your implementation!)
    const payload = {
        model: selectedModel,
        messages: [{ role: 'user', content: userMessage }]
    };
    const res = await makeOpenRouterCall(payload);
    return res.choices[0].message.content;
    // ---- END TODO: EXERCISE 3 (Part C - Tool-Calling Loop) ----
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
