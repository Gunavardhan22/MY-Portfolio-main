'use strict';

// Minimal .env loader (KEY=value per line, # comments, optional quotes).
// Existing environment variables win, so hosting dashboards override the file.
const fs = require('node:fs');

function loadEnv(filePath) {
    let raw;
    try {
        raw = fs.readFileSync(filePath, 'utf8');
    } catch {
        return; // no .env file: rely on the real environment
    }

    for (const line of raw.split(/\r?\n/)) {
        const match = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/);
        if (!match) continue;
        const [, key, rawValue] = match;
        let value = rawValue.trim();
        if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
            value = value.slice(1, -1);
        } else {
            value = value.replace(/\s+#.*$/, '');
        }
        if (process.env[key] === undefined) process.env[key] = value;
    }
}

module.exports = { loadEnv };
