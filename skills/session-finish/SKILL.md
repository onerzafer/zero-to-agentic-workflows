---
name: session-finish
description: Stops the active session server by killing port 8282 and updates the state to Finished.
---

# session-finish

This skill guides the agent to stop the active session server and mark it as completed.

## Instructions

When the user asks to "finish", "end", "stop", or "complete" the active session:

1. **Find the Active Session**:
   - Read the [session_state.md](file:///Users/oner/Projects/zero-to-agentic-workflows/session_state.md) file.
   - Find the session that has status `In Progress`. If none is in progress, inform the user that no session is currently active.

2. **Terminate the Server**:
   - Run a command to find and terminate any process listening on the shared port `8282`:
     ```bash
     PID=$(lsof -t -i:8282); if [ -n "$PID" ]; then kill -9 $PID; fi
     ```
   - Print a message confirming that the server on port `8282` was stopped.

3. **Update State to Finished**:
   - Modify [session_state.md](file:///Users/oner/Projects/zero-to-agentic-workflows/session_state.md) to update the status of the active session to `Finished`.
   - Update the markdown table line correctly.

4. **Confirm and Notify**:
   - Tell the user that the session has been successfully shut down and marked as `Finished`.
   - Point them to the next session in the curriculum listed in the root [AGENT.md](file:///Users/oner/Projects/zero-to-agentic-workflows/AGENT.md).
