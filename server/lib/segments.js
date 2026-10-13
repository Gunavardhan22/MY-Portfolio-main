'use strict';

// Turns the narration into provider-sized segments.
// Each part's sentences are packed into segments of at most `maxChars`,
// never crossing a part boundary, so the frontend can highlight the part being read.

function splitLong(sentence, maxChars) {
    if (sentence.length <= maxChars) return [sentence];
    const pieces = [];
    let rest = sentence;
    while (rest.length > maxChars) {
        const window = rest.slice(0, maxChars);
        let cut = Math.max(window.lastIndexOf(', '), window.lastIndexOf('; '));
        cut = cut > maxChars * 0.4 ? cut + 1 : window.lastIndexOf(' ');
        if (cut <= 0) cut = maxChars;
        pieces.push(rest.slice(0, cut).trim());
        rest = rest.slice(cut).trim();
    }
    if (rest) pieces.push(rest);
    return pieces;
}

function buildSegments(content, maxChars) {
    const segments = [];
    content.parts.forEach((part, partIndex) => {
        let current = '';
        const flush = () => {
            if (current) segments.push({ part: partIndex, text: current });
            current = '';
        };
        for (const sentence of part.text) {
            for (const piece of splitLong(sentence.trim(), maxChars)) {
                const joined = current ? `${current} ${piece}` : piece;
                if (joined.length > maxChars) {
                    flush();
                    current = piece;
                } else {
                    current = joined;
                }
            }
        }
        flush();
    });
    return segments;
}

module.exports = { buildSegments };
