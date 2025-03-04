/**
 * Convert [r,g,b] (0–255) → [h,s,l] where:
 *   h in [0,360], s,l in [0,100].
 */
function rgbToHsl(r, g, b) {
    r /= 255
    g /= 255
    b /= 255
    const max = Math.max(r, g, b)
    const min = Math.min(r, g, b)
    let h, s
    const l = (max + min) / 2

    if (max === min) {
        h = 0
        s = 0
    } else {
        const d = max - min
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
        switch (max) {
            case r:
                h = (g - b) / d + (g < b ? 6 : 0)
                break
            case g:
                h = (b - r) / d + 2
                break
            case b:
                h = (r - g) / d + 4
                break
        }
        h *= 60
    }

    return [h, s * 100, l * 100]
}

/**
 * Convert [h,s,l] → [r,g,b],
 *   h in [0,360], s,l in [0,100] → r,g,b in [0,255].
 */
function hslToRgb(h, s, l) {
    s /= 100
    l /= 100

    const c = (1 - Math.abs(2 * l - 1)) * s
    const x = c * (1 - Math.abs(((h / 60) % 2) - 1))
    const m = l - c / 2

    let rPrime, gPrime, bPrime

    if (0 <= h && h < 60) {
        rPrime = c
        gPrime = x
        bPrime = 0
    } else if (60 <= h && h < 120) {
        rPrime = x
        gPrime = c
        bPrime = 0
    } else if (120 <= h && h < 180) {
        rPrime = 0
        gPrime = c
        bPrime = x
    } else if (180 <= h && h < 240) {
        rPrime = 0
        gPrime = x
        bPrime = c
    } else if (240 <= h && h < 300) {
        rPrime = x
        gPrime = 0
        bPrime = c
    } else {
        rPrime = c
        gPrime = 0
        bPrime = x
    }

    return [
        Math.round((rPrime + m) * 255),
        Math.round((gPrime + m) * 255),
        Math.round((bPrime + m) * 255),
    ]
}

/**
 * Linearly interpolate between two HSL colors.
 * @param {[number, number, number]} hsl1 - [h,s,l] color
 * @param {[number, number, number]} hsl2 - [h,s,l] color
 * @param {number} t - fraction in [0,1]
 * @returns {[number, number, number]} - interpolated [h,s,l]
 */
function interpolateHsl(hsl1, hsl2, t) {
    const [h1, s1, l1] = hsl1
    const [h2, s2, l2] = hsl2

    // Note: If you need to handle hue wrapping (e.g. 359 → 0),
    // you can add a "shortest path" check here. But for these colors
    // (green → blue → orange) it’s usually straightforward.
    const h = h1 + (h2 - h1) * t
    const s = s1 + (s2 - s1) * t
    const l = l1 + (l2 - l1) * t

    return [h, s, l]
}

/**
 * Interpolates between Green → Blue → Orange as progress goes 0→100,
 * without looking "washed out" mid-segment (HSL-based).
 *
 * @param {number} progress - progress in [0, 100]
 * @returns {string} - e.g. "rgba(156, 129, 255, 1)"
 */
export const getInterpolatedColor = progress => {
    // Clamp to [0,100]
    const clamped = Math.max(0, Math.min(100, progress))

    // Convert your three Tailwind colors from RGB to HSL:
    // brandGreen-500 = #10B981 → (16,185,129)
    // brandBlue-500  = #0EA5E9 → (14,165,233)
    // neonOrange-500 = #FF6B00 → (255,107,0)
    const greenHSL = rgbToHsl(16, 185, 129)
    const blueHSL = rgbToHsl(14, 165, 233)
    const orangeHSL = rgbToHsl(255, 107, 0)

    let startHSL, endHSL, t

    if (clamped <= 50) {
        // 0→50%: green → blue
        startHSL = greenHSL
        endHSL = blueHSL
        t = clamped / 50
    } else {
        // 50→100%: blue → orange
        startHSL = blueHSL
        endHSL = orangeHSL
        t = (clamped - 50) / 50
    }

    // Interpolate in HSL
    const [h, s, l] = interpolateHsl(startHSL, endHSL, t)
    // Convert back to RGB
    const [r, g, b] = hslToRgb(h, s, l)

    // Return as RGBA with full opacity
    return `rgba(${r}, ${g}, ${b}, 1)`
}
