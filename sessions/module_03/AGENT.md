# Module 03: The "Goldfish" (Persistent Memory)

Welcome to the **Persistent Memory Playground**! This module is designed to teach how Large Language Models (LLMs) manage conversation state, why context window limits are a challenge, and how to build persistent memory using native tool calling.

---

## 🎯 Session Goals

1.  **Deconstruct Statelessness**: Understand that LLMs do not inherently remember user interaction details across different API requests.
2.  **Short-Term vs. Long-Term Memory**: Contrast short-term memory (appending conversation history arrays) with long-term memory (storing facts persistently on disk).
3.  **Naïve vs. Intelligent Logging**: Compare the drawbacks of recording every single transcript line (causing token bloat) with selective tool-based memory retrieval (`save_memory` & `search_memory`).

---

## 🚀 Dual-Track Selection

This session is designed to accommodate both developers and non-technical students simultaneously.

*   **Non-Techie Track (Observe & Use)**:
    *   You will use the Web UI Playground.
    *   No coding is required. You will chat with the bot and witness how statelessness, logging, and tool-calling change the chatbot's ability to remember you.
*   **Techie Track (Code & Build)**:
    *   You will write Node.js code inside the CLI script: [cli-chat.js](file:///Users/oner/Projects/zero-to-agentic-workflows/sessions/module_03/cli-chat.js).
    *   Your task is to implement the three memory-handling exercises in JavaScript, running and testing your work using `node cli-chat.js` in your terminal.

---

## 🏃 Starting the Module

Run the root-level start command and select your preferred track:
```bash
# Ask your agent to run the start skill
# "Start the next session"
```
*   If running the **Web UI Track (Non-Techie)**, the server will launch on `http://localhost:8282` and open in your default browser automatically.
*   If running the **CLI Track (Techie)**, open [cli-chat.js](file:///Users/oner/Projects/zero-to-agentic-workflows/sessions/module_03/cli-chat.js) and run:
    ```bash
    node cli-chat.js
    ```

---

## 📚 Curriculum Exercises

### 🐠 Introduction: The Stateless Goldfish

LLMs have no memory between API requests. Let's see this in action.

*   **Non-Techies (UI)**:
    1. Select **Option 1: Stateless** in the Web UI.
    2. Type: *"My name is Alice and I like JavaScript."*
    3. Type: *"What is my name?"*
    4. Observe the bot's failure. It will say it doesn't know.
*   **Techies (CLI)**:
    1. Select Option `1` in `node cli-chat.js`.
    2. Input the same questions and verify that the LLM fails to recognize you.
    3. Inspect the **Payload JSON** tab (UI) or logs to see that only the single latest prompt is sent to the LLM.

---

### 🧠 Exercise 1: Session Memory (Short-Term)

To make a bot remember, we must collect previous messages and send them back to the API on every single turn.

*   **Non-Techies (UI)**:
    1. Select **Option 2: Session**.
    2. Type: *"My name is Alice."*
    3. Type: *"What is my name?"*
    4. Notice the bot remembers!
    5. Click the **"New Session"** button. Wiping the screen simulates starting a new browser session.
    6. Type: *"What is my name?"* $\rightarrow$ The bot forgets you again.
*   **Techies (CLI)**:
    1. Open [cli-chat.js](file:///Users/oner/Projects/zero-to-agentic-workflows/sessions/module_03/cli-chat.js).
    2. Locate `handleSessionMemory(messages, userMessage, assistantMessage)`.
    3. **Implement Exercise 1**: Add the logic to append the user message (when preparing request) and the assistant response (after API returns) to the `messages` array:
       ```javascript
       if (assistantMessage === null) {
           messages.push({ role: 'user', content: userMessage });
           return messages;
       } else {
           messages.push({ role: 'assistant', content: assistantMessage });
           return messages;
       }
       ```
    4. Run `node cli-chat.js`, select Mode `2`, and verify that the conversation history persists until you type `clear` (which wipes the history).

---

### 💾 Exercise 2: Persistent Log (Log All)

We want to remember facts even when the session restarts. The simplest way is to save everything to a file (`memories.md`) and load it as background context.

*   **Non-Techies (UI)**:
    1. Select **Option 3: Log All**.
    2. Type: *"My name is Alice."*
    3. Click **"New Session"** (simulating starting a new chat days later).
    4. Click the **memories.md** tab on the right to see the chat logs written to disk.
    5. Type: *"What is my name?"* $\rightarrow$ The bot remembers!
*   **Techies (CLI)**:
    1. Open [cli-chat.js](file:///Users/oner/Projects/zero-to-agentic-workflows/sessions/module_03/cli-chat.js).
    2. Locate `handlePersistentLog(userMessage, assistantMessage)`.
    3. **Implement Exercise 2**:
       * Read `memories.md` at startup and return a system prompt injecting the log file content.
       * When `assistantMessage` is passed, append the exchange to `memories.md`:
         ```javascript
         if (assistantMessage === null) {
             let memories = "";
             if (fs.existsSync(MEMORY_FILE_PATH)) {
                 memories = fs.readFileSync(MEMORY_FILE_PATH, 'utf8');
             }
             return `You have access to the following historical conversation logs:\n\n${memories}\n\nMaintain conversation continuity.`;
         } else {
             const logEntry = `\n--- Chat Log ---\nUser: ${userMessage}\nAssistant: ${assistantMessage}\n`;
             fs.appendFileSync(MEMORY_FILE_PATH, logEntry, 'utf8');
         }
         ```

#### ❓ Socratic Question 1
> [!IMPORTANT]
> **Discussion**: If we record every chat turn to `memories.md` and load it all into the context window, what happens to our token usage as the user keeps talking? What happens if the user tells us their favorite color is blue, and later says it is red—how does the LLM resolve conflicting history?

---

### ⚙️ Exercise 3: Tool-Calling Memory (Intelligent)

Instead of dumping everything into context, we give the LLM tools (`save_memory` and `search_memory`) so it only writes important facts to disk, and only searches when requested.

*   **Non-Techies (UI)**:
    1. Select **Option 4: Tool-Call**.
    2. Type: *"Remember that my favorite programming language is JavaScript."*
    3. Look at the **Tool Logs** tab on the right. You will see the LLM intercepting the chat and executing the `save_memory` tool!
    4. Click **"New Session"** to wipe the local conversation arrays.
    5. Click the **memories.md** tab. You'll see only the fact was written: `* User prefers JavaScript for coding` (instead of raw chat transcripts).
    6. Type: *"What language do I like?"*
    7. Look at the **Tool Logs** tab. You will see the LLM executing `search_memory` for "language", getting the result from `memories.md`, and answering you correctly!
*   **Techies (CLI)**:
    1. Open [cli-chat.js](file:///Users/oner/Projects/zero-to-agentic-workflows/sessions/module_03/cli-chat.js).
    2. **Part A (Schema)**: Define `save_memory` and `search_memory` schemas inside the `MEMORY_TOOLS` array using OpenAI-style definitions.
    3. **Part B (Execution)**: Implement writing bullet points in `executeLocalTool` for `save_memory` and reading/filtering lines in `search_memory`.
    4. **Part C (Interception Loop)**: Write the loop inside `handleToolCallingMemory` that sends the payload, checks for `tool_calls` in the response, runs the local execution, feeds the result back to the model, and recursively calls until the model responds with text.
       *(Reference the [cli-chat-solved.js](file:///Users/oner/Projects/zero-to-agentic-workflows/sessions/module_03/cli-chat-solved.js) file if you get stuck on the tool-calling array recursion!).*

#### ❓ Socratic Question 2
> [!IMPORTANT]
> **Discussion**: If the AI uses text search (`search_memory`) for "ice cream", but the saved memory was "User likes gelato", will the search find it? How does semantic search (vector embeddings) solve this keyword mismatch? How do we prevent the AI from calling tools on trivial statements?
