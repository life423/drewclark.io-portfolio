/**
 * Split a file into overlapping chunks of lines for embedding
 *
 * Chunks are capped by line count and by size, and neighbouring chunks share a
 * few lines so code that spans a boundary still shows up whole in one of them.
 */
function chunkFile(text, { chunkLines, overlapLines, maxChunkChars }) {
    const lines = text.replace(/\r?\n$/, '').split(/\r?\n/);
    const chunks = [];
    let start = 0;

    while (start < lines.length) {
        let end = start;
        let size = 0;
        while (end < lines.length && end - start < chunkLines) {
            const lineSize = lines[end].length + 1;
            if (size + lineSize > maxChunkChars && end > start) break;
            size += lineSize;
            end += 1;
        }

        const body = lines.slice(start, end).join('\n').slice(0, maxChunkChars);
        if (body.trim()) {
            chunks.push({ startLine: start + 1, endLine: end, text: body });
        }
        if (end >= lines.length) break;

        // Short chunks (long lines) get less overlap so we always move forward
        const overlap = Math.min(overlapLines, Math.floor((end - start) / 4));
        start = end - overlap;
    }

    return chunks;
}

module.exports = { chunkFile };
