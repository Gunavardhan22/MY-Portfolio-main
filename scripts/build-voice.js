'use strict';

/*
   Pre-generates the AI narration so visitors never wait on (or spend) the provider.

     npm run voice:build            generate every segment that isn't cached yet
     npm run voice:build -- --dry   show the segments without calling the provider

   Progress is saved after every segment, so it can be stopped and re-run safely.
   Only segments whose text changed are regenerated after editing content/about-me.js.
*/
const path = require('node:path');
const { loadEnv } = require('../server/lib/env');

const ROOT = path.resolve(__dirname, '..');
loadEnv(path.join(ROOT, '.env'));

const { createVoiceService } = require('../server/services/voiceService');

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const LONG_WAIT_SECONDS = 180; // beyond this, assume a daily limit and stop

async function main() {
    const dry = process.argv.includes('--dry');
    const service = createVoiceService({ env: process.env, rootDir: ROOT });
    const { provider, segments } = service;
    const totalChars = segments.reduce((sum, s) => sum + s.text.length, 0);

    console.log(`Narration: ${segments.length} segments, ${totalChars} characters (max ${provider.maxChars} per segment).`);
    console.log(`Cached already: ${service.cachedCount()}/${segments.length}.`);

    if (dry) {
        segments.forEach((s) => console.log(`  [${String(s.index).padStart(2)}] part ${s.part}  ${String(s.text.length).padStart(3)} chars  ${s.text}`));
        return;
    }

    if (!provider.configured) {
        console.error('VOICE_API_KEY is not set. Copy .env.example to .env and add your key.');
        process.exitCode = 1;
        return;
    }

    for (const segment of segments) {
        if (service.getCached(segment.index)) continue;

        for (let attempt = 1; ; attempt++) {
            try {
                await service.getSegment(segment.index);
                console.log(`  ✓ segment ${segment.index + 1}/${segments.length} (${segment.text.length} chars)`);
                break;
            } catch (err) {
                if (err.code === 'rate_limited' && attempt <= 5) {
                    const wait = err.retryAfter || 30;
                    if (wait > LONG_WAIT_SECONDS) {
                        console.error(`Provider limit reached (retry in ~${Math.round(wait / 60)} min). Progress is saved: run this again later.`);
                        process.exitCode = 2;
                        return;
                    }
                    console.log(`  … rate limited, waiting ${wait}s`);
                    await sleep(wait * 1000);
                    continue;
                }
                const hint = err.hint
                    || (err.code === 'auth'
                        ? 'The provider rejected VOICE_API_KEY. Check or rotate the key.'
                        : `Provider error: ${err.code || err.message}${err.status ? ` (HTTP ${err.status})` : ''}.`);
                console.error(hint);
                process.exitCode = 1;
                return;
            }
        }
    }

    console.log(`Done. ${service.cachedCount()}/${segments.length} segments cached.`);
}

main();
