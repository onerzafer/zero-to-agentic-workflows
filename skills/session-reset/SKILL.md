---
name: session-reset
description: Resets all session statuses in session_state.md back to Not Started and kills any processes on port 8282.
---

# session-reset

This skill guides the agent to clear all course progress and shut down all active session servers.

## Instructions

When the user asks to "reset all", "reset progress", or "clear all sessions":

1. **Terminate Active Servers**:
   - Shutdown any running process on port `8282`:
     ```bash
     PID=$(lsof -t -i:8282); if [ -n "$PID" ]; then kill -9 $PID; fi
     ```

2. **Reset All States in session_state.md**:
   - Read [session_state.md](file:///Users/oner/Projects/zero-to-agentic-workflows/session_state.md).
   - Modify the file to set the `Status` column for all sessions to `Not Started`.

3. **Confirm and Notify**:
   - Confirm to the user that all session progress has been reset to `Not Started`, and all running playground servers have been shut down.
   - Point them to the first module in [AGENT.md](file:///Users/oner/Projects/zero-to-agentic-workflows/AGENT.md) to start fresh.
