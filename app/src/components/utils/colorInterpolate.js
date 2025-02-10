// FILE: app/src/utils/colorInterpolate.js

/**
 * Your interpolation helpers + color segments can live here.
 */

// 1. Helper: Interpolate (lerp) between two hex colors.
function lerpColor(hexA, hexB, t) {
    const rgbA = hexToRgb(hexA)
    const rgbB = hexToRgb(hexB)
    const r = Math.round(rgbA.r + (rgbB.r - rgbA.r) * t)
    const g = Math.round(rgbA.g + (rgbB.g - rgbA.g) * t)
    const b = Math.round(rgbA.b + (rgbB.b - rgbA.b) * t)
    return rgbToHex(r, g, b)
}

// 2. Convert hex color to RGB.
function hexToRgb(hex) {
    // Remove leading "#" if present.
    hex = hex.replace('#', '')
    const bigint = parseInt(hex, 16)
    return {
        r: (bigint >> 16) & 255,
        g: (bigint >> 8) & 255,
        b: bigint & 255,
    }
}

// 3. Convert RGB values back to hex.
function rgbToHex(r, g, b) {
    const toHex = v => v.toString(16).padStart(2, '0')
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`
}

// 4. Color segment definitions.
export const colorSegments = [
    {
        start: 0,
        end: 40,
        from: '#10B981', // brandGreen.500
        to: '#38BDF8', // brandBlue.400
    },
    {
        start: 40,
        end: 70,
        from: '#38BDF8', // brandBlue.400
        to: '#0EA5E9', // brandBlue.500
    },
    {
        start: 70,
        end: 90,
        from: '#0EA5E9', // brandBlue.500
        to: '#FF9B66', // neonOrange.300
    },
    {
        start: 90,
        end: 100,
        from: '#FF9B66', // neonOrange.300
        to: '#FF6B00', // neonOrange.500
    },
]

/**
 * Given a progress value (0..100), finds the correct color segment and
 * interpolates between its "from" and "to" colors.
 */
export function getInterpolatedColor(progress) {
    // Clamp progress between 0 and 100.
    const p = Math.max(0, Math.min(100, progress))

    // Loop through segments to find the matching range.
    for (let i = 0; i < colorSegments.length; i++) {
        const seg = colorSegments[i]
        if (p >= seg.start && p <= seg.end) {
            const range = seg.end - seg.start
            const t = range === 0 ? 0 : (p - seg.start) / range
            return lerpColor(seg.from, seg.to, t)
        }
    }

    // Fallback: if no segment matches, return the last segment's "to" color.
    return colorSegments[colorSegments.length - 1].to
}
