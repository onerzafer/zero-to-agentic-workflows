---
name: session-update
description: Guides the agent on how to pull session updates, check onboarding status, and navigate to active training materials.
---

# session-update

This skill instructs the agent on how to manage and navigate the zero-to-agentic-workflows course materials for the user.

## Instructions

Whenever the user asks you to start, resume, or open a session, lesson, or course material:

1. **Pull Latest Modules**:
   - Run `git pull` to fetch any new bi-weekly training materials, scripts, or examples released by the instructor.

2. **Verify Environment Onboarding**:
   - Check if the global token file `~/.openrouter_token` exists (on Windows, check `C:\Users\<Username>\.openrouter_token`).
   - If the token file is missing, inform the user and execute the `./setup.sh` script (or guide the user to run it) to start the visual onboarding wizard and configure their token.

3. **Navigate to the Active Session**:
   - Scan the workspace for module folders inside `sessions/` (e.g., `sessions/system_prompt/`, `sessions/module_2/`).
   - Navigate to the current active folder and open the local `AGENT.md` file in that folder to read the specific lesson goals, vibe-coding instructions, and comparative exercises.
