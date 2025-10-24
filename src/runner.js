const path = require('path');
const { spawn } = require('child_process');
const { log } = require('./utils/logger');

function runTestsCapture() {
  return new Promise((resolve) => {
    const node = process.execPath;
    const nycJS = path.join(__dirname, '..', 'node_modules', 'nyc', 'bin', 'nyc.js');
    const mochaBin = path.join(__dirname, '..', 'node_modules', 'mocha', 'bin', 'mocha.js');
    const mochaArgs = ['tests/**/*.test.js'];

    log('Running coverage via:', nycJS);
    const args = [nycJS, '--reporter=text-summary', mochaBin, ...mochaArgs];
    const child = spawn(node, args, { stdio: ['ignore', 'pipe', 'pipe'] });

    let stdout = '', stderr = '';
    child.stdout.on('data', d => stdout += d.toString());
    child.stderr.on('data', d => stderr += d.toString());

    child.on('close', (code) => {
      resolve({ code, stdout, stderr });
    });
  });
}

module.exports = { runTestsCapture };
