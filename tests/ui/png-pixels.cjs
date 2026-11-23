const { inflateSync } = require('node:zlib');

// Browser screenshots only: 8-bit, non-interlaced RGB or RGBA PNGs.
function decodePng(bytes) {
    const png = Buffer.from(bytes);
    if (!png.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))) throw new Error('Invalid PNG signature');
    let width, height, channels, ended = false;
    const chunks = [];
    for (let offset = 8; offset + 12 <= png.length;) {
        const length = png.readUInt32BE(offset);
        const type = png.toString('ascii', offset + 4, offset + 8);
        const end = offset + 8 + length;
        if (end + 4 > png.length) throw new Error('Truncated PNG chunk');
        if (type === 'IHDR') {
            if (length !== 13 || width !== undefined) throw new Error('Invalid PNG header');
            width = png.readUInt32BE(offset + 8);
            height = png.readUInt32BE(offset + 12);
            const bitDepth = png[offset + 16], colorType = png[offset + 17];
            if (!width || !height || bitDepth !== 8 || ![2, 6].includes(colorType)
                || png[offset + 18] !== 0 || png[offset + 19] !== 0 || png[offset + 20] !== 0) {
                throw new Error('Expected an 8-bit, non-interlaced RGB/RGBA browser PNG');
            }
            channels = colorType === 6 ? 4 : 3;
        } else if (type === 'IDAT') chunks.push(png.subarray(offset + 8, end));
        else if (type === 'IEND') { ended = true; break; }
        offset = end + 4;
    }
    if (!ended || !channels || !chunks.length) throw new Error('Incomplete PNG');
    const scan = inflateSync(Buffer.concat(chunks));
    const stride = width * channels;
    if (scan.length !== (stride + 1) * height) throw new Error('Unexpected PNG scanline length');
    const rgba = Buffer.alloc(width * height * 4);
    let previous = Buffer.alloc(stride), cursor = 0;
    const paeth = (left, up, corner) => {
        const prediction = left + up - corner;
        const a = Math.abs(prediction - left), b = Math.abs(prediction - up), c = Math.abs(prediction - corner);
        return a <= b && a <= c ? left : b <= c ? up : corner;
    };
    for (let y = 0; y < height; y++) {
        const filter = scan[cursor++];
        if (filter > 4) throw new Error('Invalid PNG scanline filter');
        const row = Buffer.alloc(stride);
        for (let x = 0; x < stride; x++) {
            const left = x >= channels ? row[x - channels] : 0;
            const up = previous[x], corner = x >= channels ? previous[x - channels] : 0;
            const prediction = filter === 0 ? 0 : filter === 1 ? left : filter === 2 ? up
                : filter === 3 ? Math.floor((left + up) / 2) : paeth(left, up, corner);
            row[x] = (scan[cursor++] + prediction) & 255;
        }
        for (let x = 0; x < width; x++) {
            const source = x * channels, target = (y * width + x) * 4;
            rgba[target] = row[source];
            rgba[target + 1] = row[source + 1];
            rgba[target + 2] = row[source + 2];
            rgba[target + 3] = channels === 4 ? row[source + 3] : 255;
        }
        previous = row;
    }
    return { width, height, data: rgba };
}

function greenTintStats(on, off) {
    if (on.width !== off.width || on.height !== off.height) throw new Error('PNG dimensions differ');
    let greenPixels = 0, maxGreen = 0, changedPixels = 0;
    for (let offset = 0; offset < on.data.length; offset += 4) {
        const red = on.data[offset] - off.data[offset];
        const green = on.data[offset + 1] - off.data[offset + 1];
        const blue = on.data[offset + 2] - off.data[offset + 2];
        if (red || green || blue || on.data[offset + 3] !== off.data[offset + 3]) changedPixels++;
        if (green >= 3 && green > red && green >= blue) greenPixels++;
        maxGreen = Math.max(maxGreen, green);
    }
    return { width: on.width, height: on.height, greenPixels, maxGreen, changedPixels };
}

module.exports = { decodePng, greenTintStats };
