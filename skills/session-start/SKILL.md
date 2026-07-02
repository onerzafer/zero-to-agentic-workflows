---
name: session-start
description: Locates the next unfinished session, updates its state to In Progress, and starts the server on port 8282.
---

# session-start

This skill guides the agent to automatically find, status-update, and start the next training session in the curriculum.

## Instructions

When the user asks to "start", "launch", or "begin" the next session/lesson:

1. **Stop Previous Session (If Running)**:
   - Read the [session_state.md](file:///Users/oner/Projects/zero-to-agentic-workflows/session_state.md) file.
   - Check if any session is currently marked as `In Progress`.
   - If a session is active:
     - Terminate the server process listening on the shared port `8282`:
       ```bash
       PID=$(lsof -t -i:8282); if [ -n "$PID" ]; then kill -9 $PID; fi
       ```
     - Update its status to `Finished` in [session_state.md](file:///Users/oner/Projects/zero-to-agentic-workflows/session_state.md).

2. **Find the Next Session**:
   - Re-read/parse the updated [session_state.md](file:///Users/oner/Projects/zero-to-agentic-workflows/session_state.md) file.
   - Scan the table to find the first session that has status `Not Started`. (If the previous step stopped a session and marked it `Finished`, the next session will be the one directly after it).

3. **Verify Session Directory**:
   - Resolve the folder path relative to the repository root. For example, for Session 02, it is `sessions/module_02`.
   - Check if the folder exists in the workspace.
   - If the folder does not exist or is a future placeholder, stop and tell the user: 
     > *"Session X is not yet available or released in the repository workspace. Please wait for the instructor to release it."*

4. **Update State to In Progress**:
   - Modify [session_state.md](file:///Users/oner/Projects/zero-to-agentic-workflows/session_state.md) to update the new session's status to `In Progress`.
   - Ensure the markdown table line is updated correctly.

5. **Prompt for Track Selection**:
   - Ask the user if they want to run the **Non-Techie Track (Web UI)** or the **Techie Track (CLI Coding Challenge)**.

6. **Start the Session Server / Environment**:
   - If `node_modules` does not exist in the session folder, run:
     ```bash
     npm install
     ```
   - **If the user chooses the Non-Techie Track (Web UI)**:
     - Start the Express server using `run_command` in the session's folder on port `8282` as a background task.
       ```bash
       PORT=8282 npm start
       ```
       *(Set `WaitMsBeforeAsync` to `2000` to let it start up before the command moves to the background).*
     - Confirm from the command's console output that the server successfully printed:
       `System Prompt Playground listening on http://localhost:8282` (or similar start notification).
     - Notify the user that the session is active and provide the clickable URL:
       `http://localhost:8282`
   - **If the user chooses the Techie Track (CLI Coding Challenge)**:
     - Inform the user that the environment is ready.
     - Guide them to open [cli-chat.js](file:///sessions/module_03/cli-chat.js) (adjust path to absolute workspace path) to see the code challenges, and tell them to run it in their terminal:
       ```bash
       node cli-chat.js
       ```

7. **Confirm and Notify**:
   - Prompt the user to navigate to the session's local `AGENT.md` (e.g. [sessions/module_03/AGENT.md](file:///Users/oner/Projects/zero-to-agentic-workflows/sessions/module_03/AGENT.md)) for the lesson guide.

