'use strict';

// Keeps provider calls under a per-minute request and character budget.
// Calls are serialised; a caller that would wait longer than maxWaitMs is refused
// instead of queued, so a busy server answers quickly and the browser can fall back.

const WINDOW_MS = 60_000;
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

class PacerBusyError extends Error {
    constructor(waitMs) {
        super('provider budget exhausted for now');
        this.name = 'PacerBusyError';
        this.retryAfter = Math.ceil(waitMs / 1000);
    }
}

function createPacer({ requestsPerMinute, charsPerMinute }) {
    const log = []; // { at, chars }, oldest first
    let blockedUntil = 0;
    let chain = Promise.resolve();

    const waitFor = (chars) => {
        const now = Date.now();
        while (log.length && now - log[0].at >= WINDOW_MS) log.shift();

        let wait = Math.max(0, blockedUntil - now);
        if (log.length >= requestsPerMinute) {
            wait = Math.max(wait, log[log.length - requestsPerMinute].at + WINDOW_MS - now);
        }
        let used = log.reduce((sum, e) => sum + e.chars, 0);
        for (let i = 0; used + chars > charsPerMinute && i < log.length; i++) {
            used -= log[i].chars;
            wait = Math.max(wait, log[i].at + WINDOW_MS - now);
        }
        return wait;
    };

    return {
        /** Resolves when a call of `chars` characters may start. */
        reserve(chars, { maxWaitMs = Infinity } = {}) {
            const run = chain.then(async () => {
                const wait = waitFor(chars);
                if (wait > maxWaitMs) throw new PacerBusyError(wait);
                if (wait > 0) await sleep(wait);
                log.push({ at: Date.now(), chars });
            });
            chain = run.catch(() => {});
            return run;
        },

        /** Push the window forward after the provider itself said "slow down". */
        penalise(seconds) {
            blockedUntil = Math.max(blockedUntil, Date.now() + seconds * 1000);
        },
    };
}

module.exports = { createPacer, PacerBusyError };
