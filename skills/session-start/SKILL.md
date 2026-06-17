---
name: session-start
description: Locates the next unfinished session, updates its state to In Progress, and starts the server on port 8282.
---

# session-start

This skill guides the agent to automatically find, status-update, and start the next training session in the curriculum.

## Instructions

When the user asks to "start", "launch", or "begin" the next session/lesson:

1. **Find the Next Session**:
   - Read the [session_state.md](file:///Users/oner/Projects/zero-to-agentic-workflows/session_state.md) file.
   - Scan the table to find the first session that has status `Not Started` or `In Progress`.

2. **Verify Session Directory**:
   - Resolve the folder path relative to the repository root. For example, for Session 02, it is `sessions/system_prompt`.
   - Check if the folder exists in the workspace.
   - If the folder does not exist or is a future placeholder, stop and tell the user: 
     > *"Session X is not yet available or released in the repository workspace. Please wait for the instructor to release it."*

3. **Update State to In Progress**:
   - Modify [session_state.md](file:///Users/oner/Projects/zero-to-agentic-workflows/session_state.md) to update the session's status to `In Progress`.
   - Ensure the markdown table line is updated correctly.

4. **Start the Session Server**:
   - If `node_modules` does not exist in the session folder, run:
     ```bash
     npm install
     ```
   - Start the server using `run_command` in the session's folder. Run it on port `8282` as a background task.
     ```bash
     PORT=8282 npm start
     ```
     *(Set `WaitMsBeforeAsync` to `2000` to let it start up before the command moves to the background).*

5. **Confirm and Notify**:
   - Verify from the command's console output that the server successfully printed:
     `System Prompt Playground listening on http://localhost:8282`
   - Notify the user that the session is now active and provide the clickable URL:
     `http://localhost:8282`
   - Prompt the user to navigate to the session's local `AGENT.md` (e.g. [sessions/system_prompt/AGENT.md](file:///Users/oner/Projects/zero-to-agentic-workflows/sessions/system_prompt/AGENT.md)) for the lesson guide.
