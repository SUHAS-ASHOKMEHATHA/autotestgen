const fs = require('fs');
const path = require('path');
const { log } = require('./utils/logger');

function scanExports(filePath) {
  const code = fs.readFileSync(filePath, 'utf8');
  const names = new Set();

  const funcDecl = code.matchAll(/function\s+([A-Za-z0-9_\$]+)\s*\(/g);
  for (const m of funcDecl) names.add(m[1]);

  const objExport = code.match(/module\.exports\s*=\s*\{([\s\S]*?)\}/m);
  if (objExport) {
    const inside = objExport[1];
    const props = inside.split(',').map(s => s.trim()).filter(Boolean);
    props.forEach(p => {
      const name = p.split(':')[0].trim();
      if (name) names.add(name);
    });
  }

  const dotExports = code.matchAll(/exports\.([A-Za-z0-9_\$]+)\s*=/g);
  for (const m of dotExports) names.add(m[1]);

  return { code, exports: Array.from(names) };
}

module.exports = { scanExports };
