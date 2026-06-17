---
name: session-repeat
description: Restarts/repeats a specific session or the current active session on port 8282.
---

# session-repeat

This skill guides the agent to repeat or restart a specific session or the current active one.

## Instructions

When the user asks to "repeat", "restart", or "start over" a specific session (e.g. "repeat session 2" or "start over the current session"):

1. **Identify the Target Session**:
   - Read the [session_state.md](file:///Users/oner/Projects/zero-to-agentic-workflows/session_state.md) file.
   - If the user specified a session name or number (e.g. "Session 02"), target that session.
   - If no specific session was mentioned, look for the session currently marked `In Progress`. If none is in progress, target the last `Finished` session.

2. **Terminate Any Running Server**:
   - Clean up port `8282` before starting the server to avoid conflicts:
     ```bash
     PID=$(lsof -t -i:8282); if [ -n "$PID" ]; then kill -9 $PID; fi
     ```

3. **Update State to In Progress**:
   - Modify the target session's status in [session_state.md](file:///Users/oner/Projects/zero-to-agentic-workflows/session_state.md) to `In Progress` (if it was `Finished` or `Not Started`).

4. **Start the Session Server**:
   - Go to the session's folder (e.g. `sessions/module_02`).
   - Run:
     ```bash
     PORT=8282 npm start
     ```
     *(Set `WaitMsBeforeAsync` to `2000` to let it start up).*

5. **Confirm and Notify**:
   - Confirm that the server is listening by checking command outputs.
   - Notify the user that the session has been restarted and is available at `http://localhost:8282`.
