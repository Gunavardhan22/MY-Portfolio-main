'use strict';

// Syntax-checks every first-party JavaScript file (there is no build step or bundler).
// Usage: npm run check
const { execFileSync } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');
const DIRS = ['js', 'content', 'server', 'scripts'];
const files = ['script.js'];

for (const dir of DIRS) {
    const walk = (d) => fs.readdirSync(d, { withFileTypes: true }).forEach((entry) => {
        const full = path.join(d, entry.name);
        if (entry.isDirectory()) walk(full);
        else if (entry.name.endsWith('.js')) files.push(path.relative(ROOT, full));
    });
    walk(path.join(ROOT, dir));
}

let failed = 0;
for (const file of files) {
    try {
        execFileSync(process.execPath, ['--check', path.join(ROOT, file)], { stdio: 'pipe' });
    } catch (err) {
        failed += 1;
        console.error(`✗ ${file}\n${err.stderr.toString()}`);
    }
}
console.log(failed ? `${failed} of ${files.length} files have syntax errors.` : `✓ ${files.length} files OK`);
process.exit(failed ? 1 : 0);
