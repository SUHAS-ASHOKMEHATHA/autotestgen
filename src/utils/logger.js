const stamp = () => new Date().toISOString().replace('T',' ').replace('Z','');
const log = (...args) => console.log(`[INFO  ${stamp()}]`, ...args);
const warn = (...args) => console.warn(`\x1b[33m[WARN  ${stamp()}]\x1b[0m`, ...args);
const error = (...args) => console.error(`\x1b[31m[ERROR ${stamp()}]\x1b[0m`, ...args);
const success = (...args) => console.log(`\x1b[32m[SUCCESS ${stamp()}]\x1b[0m`, ...args);
module.exports = { log, warn, error, success };
