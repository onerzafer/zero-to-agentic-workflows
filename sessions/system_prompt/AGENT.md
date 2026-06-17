# Module 1: System Prompts & Alignment

Welcome to the **System Prompt Playground**! This folder contains a pre-built web application designed to help you interactively understand how system prompts shape LLM behavior.

## Session Goals

1. **Demonstrate System Prompt Power**: Observe how changing the system prompt changes the model's tone, formatting, and overall behavior.
2. **The Intelligence Trap (Strict Constraints)**: See how defining too many strict, rigid rules or formatting schemas (e.g. forcing strict JSON formats under all circumstances) limits the LLM's natural reasoning capabilities and causes it to fail on edge cases.
3. **Optimized Rule-Based Alignment**: See how guiding principles, guardrails, and behavioral guidelines allow the LLM to stay helpful, creative, and safe while adhering to design requirements.

---

## Running the Playground

Follow these steps to launch the playground web interface:

1. **Step 1: Ensure Onboarding is Complete**
   - Make sure you have run the root-level `./setup.sh` script to configure and validate your OpenRouter token. 
   - This app reads your key automatically from `~/.openrouter_token`.

2. **Step 2: Start the Server**
   - Navigate to the current directory (`sessions/system_prompt/`) in your terminal.
   - Run the startup command:
     ```bash
     npm start
     ```
   - You should see a message: *System Prompt Playground listening on http://localhost:8282*.

3. **Step 3: Open the Web UI**
   - Open your browser and navigate to:
     ```text
     http://localhost:8282
     ```

---

## How to Use the Tabbed Interface

The application features a modern tabbed layout:

### Tab 1: How It Works
Acts as a training guide, presenting a visual, animated diagram of how LLMs process inputs:
* **System Prompt** (instructions/rules) + **User Prompt** (your query) are merged by the architecture.
* This **Combined Prompt Context** is fed into the **LLM Brain / Neural Net**.
* The network processes the combined string and outputs the **Final AI Response**.

### Tab 2: Playground (Comparison Dashboard)
An interactive comparison board that scrolls horizontally:
* **Default Columns**: Starts with three columns (Prompt A, Prompt B, Prompt C) pre-filled with our lesson presets:
  1. *Rigid Rules* (Canned triggers checking for specific keywords)
  2. *Flexible Rules* (Concise, polar, bulleted guidelines)
  3. *Structured Output* (Strict JSON matching a classification schema)
* **Independent Input & Execution**: Each column is completely self-contained, having its own System Prompt, User Prompt, and a dedicated **Send** button to trigger the call.
* **Add Custom Columns**: Click the **`+`** card at the far right of the scroll row to dynamically add a new column (with cycling neon theme colors) to test your own custom prompt combinations. Added columns can be deleted at any time.

---

## The Comparative Exercises

Use the pre-filled columns in the **Playground** tab to test the following queries.

### The Support Request Comparison
In each of the three columns, check that the User Prompt is:
> *"Hi, I saw a charge error on my bank statement and got billed twice. I don't want to cancel my account, but I definitely need a refund for this duplicate charge. Can you help me?"*

Click **Send** on Column A, B, and C to compare the responses side-by-side:

* **Column A (Rigid Rules)**:
  - **Behavior**: Notice how giving rigid, rule-like instructions like *"if the user says this, respond exactly like that"* or *"if you see these words, reply with this"* severely limits the usefulness of the AI. 
  - **Issue**: The user's message contains multiple keyword triggers ("billed twice", "cancel", "refund"). The model gets confused or outputs a rigid response like "To cancel your account, go to account settings." (completely ignoring that the user said they *don't* want to cancel) or it outputs multiple disjointed canned statements. It is incapable of semantic reasoning or general helpfulness.
  
* **Column B (Flexible Rules)**:
  - **Behavior**: Observe the concise, bulleted support message. Because we provided flexible guidelines (e.g. "be concise," "be polar," "use bullet points"), the AI uses its semantic understanding of context.
  - **Advantage**: It acknowledges the duplicate billing issue, notes the user does *not* want to cancel, takes a polar stance on what can be done immediately (refunding the charge) vs. what takes bank processing time (3-5 days), and simplifies the response using bullet points.

* **Column C (Structured Output)**:
  - **Behavior**: Observe that it outputs a clean, valid JSON object detailing:
    - `"billing_issue_detected": true`
    - `"refund_requested": true`
    - `"account_cancellation_intent": false`
    - `"urgency_level": "high"`
    - `"summary_sentence": "..."`
  - **Advantage**: This demonstrates how LLMs can adhere to strict formatting instructions to interface directly with backends, database APIs, or custom workflows without any human-in-the-loop filtering.
