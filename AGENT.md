# zero-to-agentic-workflows: LLM Training Program

Welcome! This repository is the workspace for a training program designed to demonstrate and teach different aspects of Large Language Model (LLM) usage, spanning from simple prompting to advanced agentic workflows.

## Training Program Overview

- **Purpose**: A hands-on playground to develop prompts, create examples, experiment with LLM capabilities, and prepare for live demo reproductions.
- **Audience**: Diverse backgrounds. Concepts, code, and examples should remain accessible, easy to follow, and clear.
- **Methodology**: The audience will use an AI assistant/agent to "vibe code" the examples. In this workspace, we develop and test the prompts, system prompts, and orchestrations to ensure they are robust and ready.

---

## Global Token & Environment Onboarding

To make the onboarding experience seamless, this repository features a global onboarding script:
- The user runs `./setup.sh` from the root directory.
- This script checks for Node.js and installs it if missing.
- It then starts a local wizard at `http://localhost:3500` which opens in their browser.
- The wizard allows users to obtain, paste, and **automatically validate** their OpenRouter API key.
- Once validated, the key is saved globally to `~/.openrouter_token` on their computer.
- All session apps built in this repository can read the token directly from `~/.openrouter_token` (avoiding local `.env` files or credentials management screens in the individual apps).

---

## Instruction for the Agent: Session Controls

This workspace utilizes dedicated agent skills to start, stop, and manage sessions automatically. When the user gives a command, locate and execute the corresponding skill:

* **Start Session**: Execute the [session-start](skills/session-start/SKILL.md) skill to boot the next unfinished module on the shared port `8282`.
* **Finish Session**: Execute the [session-finish](skills/session-finish/SKILL.md) skill to shut down active servers and mark the session completed.
* **Repeat Session**: Execute the [session-repeat](skills/session-repeat/SKILL.md) skill to restart the current active or a specific session.
* **Reset All Progress**: Execute the [session-reset](skills/session-reset/SKILL.md) skill to stop all servers and reset all module statuses.

The overall progress and completion status is tracked in [session_state.md](file:///Users/oner/Projects/zero-to-agentic-workflows/session_state.md).

---

## Course Curriculum & Sessions List

Below is the chronological list of course sessions. The training playground for each module is served on the shared port **`8282`**:

1. **[Session 02: System Prompts & Alignment](sessions/module_02/AGENT.md)** (Path: `sessions/module_02`)
   - *Goal*: Compare how system prompts shape LLM outputs. Contrast rigid constraints vs. behavior guidelines, and output structured JSON data.
2. **Session 03: The "Goldfish" (Persistent Memory)** (Future Module)
   - *Goal*: Manage context window arrays to simulate engineering memory.
3. **Session 04: Giving AI Hands (Tool Calling & SDK Pivot)** (Future Module)
   - *Goal*: Implement tool calling and pivot from raw HTTP requests to the Vercel AI SDK.
4. **Session 05: Advanced Tools & Structured Outputs** (Future Module)
   - *Goal*: Fetch dynamic external data and enforce JSON schemas on outputs.
5. **Session 06: Grounding the AI (RAG Basics)** (Future Module)
   - *Goal*: Eliminate hallucinations by grounding responses in external factual sources.
6. **Session 07: The Assembly Line (Workflows & Agent-to-Agent Comm)** (Future Module)
   - *Goal*: Chain multiple AI steps sequentially to form coordinated task pipelines.
7. **Session 08: The Supervised Worker (Agents + Human-in-the-Loop)** (Future Module)
   - *Goal*: Build agent loops with guardrails that ask for human approval before running critical code.
