// src/index.js
const fs = require('fs');
const path = require('path');
const { log, success, warn, error } = require('./utils/logger');
const { scanExports } = require('./scanner');
const { generateTests } = require('./generator');
const { repairIfNeeded } = require('./repair');
const { runTestsCapture } = require('./runner');

const TARGET_FILE = process.argv[2] || path.join(__dirname, '..', 'examples', 'math.js');
const OUT_DIR = path.join(__dirname, '..', 'tests');
const OUT_FILE = path.join(OUT_DIR, 'auto.test.js');

/** Replace any placeholder imports like './path_to_your_module' with the correct relative path */
function fixModulePlaceholders(code, targetAbsPath, outDirAbsPath) {
  const targetRel = path.relative(outDirAbsPath, targetAbsPath).replace(/\\/g, '/'); // Windows-safe
  // Fix CommonJS require placeholders
  let fixed = code.replace(
    /(require\(['"])([^'"]*path_to_your_module[^'"]*)(['"]\))/g,
    (_m, p1, _p, p3) => `${p1}${targetRel}${p3}`
  );
  // Also fix ESM-style placeholders if LLM ever outputs them
  fixed = fixed.replace(
    /(from\s+['"])([^'"]*path_to_your_module[^'"]*)(['"])/g,
    (_m, p1, _p, p3) => `${p1}${targetRel}${p3}`
  );
  return fixed;
}

async function main() {
  log('Reading target file:', TARGET_FILE);
  const { code, exports: names } = scanExports(TARGET_FILE);
  log('Discovered exports:', names.join(', ') || '(none)');

  log('Generating initial tests...');
  const testCode = await generateTests({ code, exportNames: names });
  if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

  // Auto-correct placeholder paths before writing
  const initialFixed = fixModulePlaceholders(testCode, TARGET_FILE, OUT_DIR);
  fs.writeFileSync(OUT_FILE, initialFixed, 'utf8');
  success('Wrote tests to', OUT_FILE);

  let run = await runTestsCapture();
  process.stdout.write(run.stdout);
  process.stderr.write(run.stderr);

  if (run.code !== 0) {
    warn('Initial test run failed. Attempting one repair pass...');
    const repaired = await repairIfNeeded({
      failingOutput: run.stdout + '\n' + run.stderr,
      currentTestCode: fs.readFileSync(OUT_FILE, 'utf8'),
      code,
      exportNames: names
    });

    if (repaired) {
      // Auto-correct placeholders in repaired output too
      const repairedFixed = fixModulePlaceholders(repaired, TARGET_FILE, OUT_DIR);
      fs.writeFileSync(OUT_FILE, repairedFixed, 'utf8');
      success('Applied repaired tests. Re-running...');

      run = await runTestsCapture();
      process.stdout.write(run.stdout);
      process.stderr.write(run.stderr);

      if (run.code !== 0) error('After repair, tests still failing.');
    } else {
      warn('Repair produced no changes.');
    }
  }

  if (run.code === 0) {
    success('All done. Coverage summary printed above.');
  } else {
    error('Completed with failures. See output above.');
    process.exitCode = 1;
  }
}

main().catch((e) => { error(e?.stack || e); process.exit(1); });
