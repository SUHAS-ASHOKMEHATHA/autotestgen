# ⚙️ AutoTestGen — AI-Powered Unit Test Generator

AutoTestGen is an **AI-assisted testing tool** that automatically **generates, runs, and repairs** Mocha + Chai unit tests for JavaScript files.  
It scans your code, uses GPT-4 (or a built-in mock mode) to create test cases, runs them with NYC for coverage, and automatically repairs failing tests.  
This version is fully **Windows-safe**, designed to run smoothly inside **VS Code** using **PowerShell**.

---

## ✨ Features
- 🔍 Scans JavaScript files and finds exported functions  
- 🤖 Generates Mocha + Chai tests using **GPT-4** or mock mode  
- 🧪 Runs tests automatically and reports coverage  
- 🔧 Repairs failing tests through one-pass AI correction  
- 🪟 100% **Windows compatible** (no `npx` dependency)  
- 🧹 Sanitizes AI output (always valid JavaScript)

---

## 🚀 Quick Start

```bash
# Clone the repository
git clone https://github.com/yourusername/AutoTestGen.git
cd AutoTestGen

# Install dependencies
npm install

# (Optional) Enable real AI test generation
setx OPENAI_API_KEY "sk-your-real-key"

# Run the demo (tests examples/math.js)
npm start

---
## 💻 Quick Commands (PowerShell)

```powershell
# 1️⃣ Clone the repository
git clone https://github.com/yourusername/AutoTestGen.git
cd AutoTestGen

# 2️⃣ Initialize npm (if starting fresh)
npm init -y

# 3️⃣ Install all required packages
npm install --save-dev mocha chai nyc
npm install openai

# 4️⃣ (Optional) Set your OpenAI API key
# For current session only:
$env:OPENAI_API_KEY="sk-your-real-key"

# Or make it permanent (then restart PowerShell):
setx OPENAI_API_KEY "sk-your-real-key"

# 5️⃣ Run the default demo (examples/math.js)
npm start

# 6️⃣ Run with your own JS file
node src/index.js C:\path\to\your\file.js

# 7️⃣ Re-run coverage manually (optional)
npx nyc --reporter=text-summary mocha "tests/**/*.test.js"

# 8️⃣ Verify installed packages
npm list --depth=0



-----

Mocha tests generated, executed, and a coverage summary like:
8 passing (8ms)
Statements : 100%
Branches   : 100%
Functions  : 100%
Lines      : 100%

----
Project Folder Structure

autotestgen/
├─ src/
│  ├─ index.js         # Main orchestrator (scan → generate → run → repair)
│  ├─ generator.js     # AI or mock test generator
│  ├─ repair.js        # AI repair pass for failing tests
│  ├─ runner.js        # Runs Mocha & NYC (Windows-safe)
│  ├─ scanner.js       # Scans JS file for exported functions
│  └─ utils/logger.js  # Colored logs for console output
├─ examples/
│  └─ math.js          # Demo file to test (sum, clamp)
├─ tests/
│  └─ auto.test.js     # Generated test file (overwritten each run)
├─ package.json
└─ README.md
