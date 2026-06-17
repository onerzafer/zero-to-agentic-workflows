---
name: show-guides
description: Opens the interactive guides and copy-paste prompt helper page (infographics.html) in the user's default web browser when they ask for prompts or guides.
---

# show-guides

This skill instructs the agent on how to automatically open the interactive mind-map onboarding and vibe-coding guide in the default web browser when the user or audience asks to view the prompts, guides, or roadmaps.

## Trigger Conditions

Activate this skill when the user asks:
- "Show me the prompts"
- "Open the infographics"
- "How do I get the onboarding prompt?"
- "Where is the vibe coding prompt?"
- "Open the guides"
- "Launch infographics"
- Any variation asking to view or copy the course guide prompts.

## Action Steps

1. **Locate the Guide File**:
   - The file is located at the root of the repository: `infographics.html`.

2. **Open in the Default Web Browser**:
   - Run the platform-specific command to launch the file in the default browser:
     - **macOS**: `open infographics.html`
     - **Windows (Command Prompt)**: `start infographics.html`
     - **Windows (PowerShell)**: `Start-Process infographics.html`
     - **Linux**: `xdg-open infographics.html`

3. **Confirm Actions**:
   - Let the user know you have opened the interactive guides page in their browser. Tell them they can click the copy buttons next to the prompts to copy them with a single click.
