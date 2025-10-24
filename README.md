# AutoTestGen Pro (Demo)

Features:
- Export scanner (regex-based) to find functions
- GPT-4o-mini test generation (falls back to mock if no API key)
- Windows-safe runner (node -> nyc -> mocha)
- One-pass repair loop using OpenAI

## Setup
```bash
npm install
# Optional for real AI:
setx OPENAI_API_KEY "sk-...your key..."   # Windows PowerShell, restart terminal
# or: $env:OPENAI_API_KEY="sk-..." for current session
```

## Run
```bash
npm start
# or:
node src/index.js path\to\yourFile.js
```
