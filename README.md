# Zero to Agentic Workflows: LLM Training Program

Welcome! This repository is the training workspace for the **Zero to Agentic Workflows** course. It contains interactive playgrounds, guides, and custom agent automation skills designed to take you from writing basic system prompts to building autonomous agent loops.

---

## 🚀 How to Get Started (For Students)

You do not need Git, GitHub CLI, or a GitHub account configured locally to get started. You will use your AI coding agent (e.g. Gemini, Claude Code, etc.) to setup and run the course materials for you.

Copy and paste the prompt below directly into your coding agent's chat window, and let the agent configure your environment:

```text
We are starting the "Zero to Agentic Workflows" LLM training program. I need you to act as my pair-programming companion. Please download the playground environment and guide me through the onboarding setup.

Follow these steps exactly:

1. Download the Course Repository:
   - Check if you have 'git' available. If yes, run:
     git clone https://github.com/onerzafer/zero-to-agentic-workflows.git
   - If 'git' is not installed or authenticated, download the repository source code as a ZIP archive directly from:
     https://github.com/onerzafer/zero-to-agentic-workflows/archive/refs/heads/main.zip
   - Extract/unzip the contents of the ZIP file into a folder named "zero-to-agentic-workflows" in our current workspace directory.

2. Initialize Onboarding & Token Config:
   - Navigate into the repository directory.
   - Run the root-level `./setup.sh` script (or `node scripts/setup-token.js` if executing on Windows) to start the onboarding wizard.
   - Inform me when the local setup wizard is running, and help me validate and configure my OpenRouter API token.

3. Read Curriculum & Control Skills:
   - Read the root-level AGENT.md file to familiarize yourself with the curriculum (Sessions 02 to 08).
   - Read session_state.md to see our current course progress.
   - Note the custom session control skills available in the 'skills/' folder:
     * session-start: Starts the next unfinished session on the shared port 8282.
     * session-finish: Shuts down the active server on port 8282 and marks it Finished.
     * session-repeat: Restarts the current session.
     * session-reset: Resets all sessions back to Not Started.

Once the files are ready and setup.sh is started, print the link to the local onboarding wizard and tell me which session is up next!
```

---

## 📚 Course Curriculum

All sessions are loaded in order and served on the shared port **`8282`**:

* **Session 02: System Prompts & Alignment** (`sessions/module_02`)
  * Compare rigid rules vs. behavior guidelines, and output structured JSON data to interface with backend APIs.
* **Session 03: The "Goldfish" (Persistent Memory)** (Future Module)
  * Simulate engineering memory by managing context window arrays.
* **Session 04: Giving AI Hands (Tool Calling & SDK Pivot)** (Future Module)
  * Move from raw API fetch requests to standard vercel/AI SDK tool calling.
* **Session 05: Advanced Tools & Structured Outputs** (Future Module)
  * Force strict JSON schemas and query dynamic live external datasets.
* **Session 06: Grounding the AI (RAG Basics)** (Future Module)
  * Ground responses in local documents/vector stores to eliminate hallucinations.
* **Session 07: The Assembly Line (Workflows & Agent-to-Agent Comm)** (Future Module)
  * Chain multiple agent pipelines to execute complex multi-step tasks.
* **Session 08: The Supervised Worker (Human-in-the-Loop)** (Future Module)
  * Orchestrate guardrails that block sensitive tool execution until you approve them.

---

## 🛠️ Repository Architecture

* `/sessions/`: Interactive training modules containing their own backends, public frontends, and specific instructions.
* `/skills/`: Specialized instructions for your agent to automate curriculum management (`session-start`, `session-finish`, etc.).
* `AGENT.md`: The central instructions directory specifically formatted for coding agents.
* `session_state.md`: A markdown table tracking completion statuses.
