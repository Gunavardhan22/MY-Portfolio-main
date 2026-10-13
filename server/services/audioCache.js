'use strict';

// Generated audio cache: memory first, then disk. The disk folder sits outside the
// public file allowlist, so cached audio is only reachable through the voice route.
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');

function createAudioCache({ dir, extension }) {
    const memory = new Map();
    fs.mkdirSync(dir, { recursive: true });

    const keyFor = (cacheId, text) =>
        crypto.createHash('sha256').update(`${cacheId}\n${text}`).digest('hex');

    const fileFor = (key) => path.join(dir, `${key}.${extension}`);

    return {
        keyFor,

        has(key) {
            return memory.has(key) || fs.existsSync(fileFor(key));
        },

        get(key) {
            if (memory.has(key)) return memory.get(key);
            try {
                const buf = fs.readFileSync(fileFor(key));
                memory.set(key, buf);
                return buf;
            } catch {
                return null;
            }
        },

        set(key, buf) {
            memory.set(key, buf);
            const file = fileFor(key);
            const tmp = `${file}.${process.pid}.tmp`;
            try {
                fs.writeFileSync(tmp, buf);
                fs.renameSync(tmp, file);
            } catch (err) {
                // Disk is optional (e.g. read-only hosts); memory still serves this process.
                console.warn('[voice] could not write audio cache:', err.code || err.message);
            }
        },
    };
}

module.exports = { createAudioCache };
