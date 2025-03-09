import { brandGreen, brandBlue, neonOrange } from '../../styles/colors.js'

/**
 * Convert hex color string to RGB array
 * @param {string} hex - Hex color (e.g., '#10B981' or '10B981')
 * @returns {[number, number, number]} - [r, g, b] values (0-255)
 */
function hexToRgb(hex) {
    // Remove # if present
    hex = hex.replace(/^#/, '')
    
    // Parse the hex values
    const bigint = parseInt(hex, 16)
    const r = (bigint >> 16) & 255
    const g = (bigint >> 8) & 255
    const b = bigint & 255
    
    return [r, g, b]
}

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
 * Smoothly interpolate between two HSL colors with proper hue handling.
 * @param {[number, number, number]} hsl1 - [h,s,l] color
 * @param {[number, number, number]} hsl2 - [h,s,l] color
 * @param {number} t - fraction in [0,1]
 * @returns {[number, number, number]} - interpolated [h,s,l]
 */
function interpolateHsl(hsl1, hsl2, t) {
    const [h1, s1, l1] = hsl1
    const [h2, s2, l2] = hsl2

    // Handle hue interpolation with proper wrapping
    // This ensures the transition takes the shortest path around the color wheel
    let h
    const hueDiff = h2 - h1
    
    if (Math.abs(hueDiff) <= 180) {
        // Regular interpolation if the difference is less than 180 degrees
        h = h1 + hueDiff * t
    } else {
        // Take the shortest path around the color wheel
        if (h2 > h1) {
            h = h1 + (hueDiff - 360) * t
        } else {
            h = h1 + (hueDiff + 360) * t
        }
    }
    
    // Normalize h to [0, 360) range
    h = (h + 360) % 360
    
    // Interpolate saturation and lightness linearly
    const s = s1 + (s2 - s1) * t
    
    // Use cubic easing for lightness to prevent washed-out midpoints
    // This gives more vibrant colors in the middle of transitions
    const tEased = t < 0.5 
        ? 4 * Math.pow(t, 3) 
        : 1 - Math.pow(-2 * t + 2, 3) / 2
        
    const l = l1 + (l2 - l1) * tEased

    return [h, s, l]
}

/**
 * Advanced interpolation between Green → Blue → Orange as progress goes 0→100,
 * with carefully crafted color transitions based on color theory to ensure vibrant,
 * visually pleasant transitions that maintain perceptual uniformity.
 *
 * @param {number} progress - progress in [0, 100]
 * @param {Object} options - Optional configuration
 * @param {number} [options.opacity=1] - Opacity value between 0-1
 * @param {boolean} [options.enhancedVibrance=true] - If true, applies additional color theory techniques to enhance vibrancy
 * @param {number} [options.saturationBoost=0] - Additional saturation percentage (-100 to 100) to apply to result
 * @returns {string} - e.g. "rgba(156, 129, 255, 1)"
 */
export const getInterpolatedColor = (progress, options = {}) => {
    // Set defaults and extract options
    const {
        opacity = 1,
        enhancedVibrance = true,
        saturationBoost = 0
    } = options;

    // Clamp to [0,100]
    const clamped = Math.max(0, Math.min(100, progress))

    // Get RGB values from our brand colors in colors.js
    const greenRgb = hexToRgb(brandGreen[500].substring(1))
    const green350Rgb = hexToRgb(brandGreen[350].substring(1))
    const blueRgb = hexToRgb(brandBlue[500].substring(1))
    const orangeRgb = hexToRgb(neonOrange[500].substring(1))

    // Define comprehensive color stops based on our brand palette
    // Each stop carefully selected for optimal perceptual transitioning
    const colorStops = [
        // Green segment (0-33%)
        { pos: 0, color: rgbToHsl(...greenRgb) },     // brandGreen-500 (base anchor)
        { pos: 4, color: rgbToHsl(20, 190, 133) },    // Slight hue shift
        { pos: 8, color: rgbToHsl(25, 195, 138) },    // Increasing brightness
        { pos: 12, color: rgbToHsl(30, 200, 143) },   // Toward brandGreen-400
        { pos: 16, color: rgbToHsl(38, 207, 150) },   // Higher saturation green
        { pos: 20, color: rgbToHsl(46, 214, 158) },   // Near brandGreen-350
        { pos: 24, color: rgbToHsl(...green350Rgb) }, // brandGreen-350 (anchor)
        { pos: 28, color: rgbToHsl(56, 218, 176) },   // Beginning shift to cyan
        { pos: 33, color: rgbToHsl(62, 214, 185) },   // Teal transition point
        
        // Cyan transition zone (33-40%)
        { pos: 36, color: rgbToHsl(70, 210, 195) },   // Transitional aqua/cyan
        { pos: 40, color: rgbToHsl(75, 205, 205) },   // True cyan balance point
        
        // Blue segment (40-65%)
        { pos: 44, color: rgbToHsl(65, 195, 215) },   // Light sky blue entry
        { pos: 48, color: rgbToHsl(50, 185, 225) },   // Sky blue
        { pos: 52, color: rgbToHsl(30, 175, 232) },   // Approaching brandBlue
        { pos: 56, color: rgbToHsl(...blueRgb) },     // brandBlue-500 (anchor)
        { pos: 60, color: rgbToHsl(20, 155, 214) },   // Slightly deeper blue
        { pos: 64, color: rgbToHsl(28, 145, 195) },   // Blue exit point
        
        // Transition from blue to gold (65-80%)
        { pos: 68, color: rgbToHsl(40, 142, 180) },   // Duller blue
        { pos: 72, color: rgbToHsl(60, 140, 140) },   // Neutral transition
        { pos: 76, color: rgbToHsl(95, 138, 100) },   // Green-gold transition
        { pos: 80, color: rgbToHsl(135, 136, 51) },   // Gold transition (anchor)
        
        // Orange segment (80-100%)
        { pos: 84, color: rgbToHsl(150, 132, 45) },   // Golden
        { pos: 88, color: rgbToHsl(180, 125, 36) },   // Golden-orange
        { pos: 92, color: rgbToHsl(205, 118, 24) },   // Orange
        { pos: 96, color: rgbToHsl(230, 112, 12) },   // Deep orange
        { pos: 100, color: rgbToHsl(...orangeRgb) },  // neonOrange-500 (final anchor)
    ]

    // Find the two color stops we're between
    let startStop, endStop
    for (let i = 0; i < colorStops.length - 1; i++) {
        if (clamped >= colorStops[i].pos && clamped <= colorStops[i + 1].pos) {
            startStop = colorStops[i]
            endStop = colorStops[i + 1]
            break
        }
    }

    // Calculate the interpolation factor between these two stops
    const range = endStop.pos - startStop.pos
    const t = range === 0 ? 0 : (clamped - startStop.pos) / range

    // Interpolate in HSL
    let [h, s, l] = interpolateHsl(startStop.color, endStop.color, t)
    
    // Apply optional saturation boost (within reasonable limits)
    if (saturationBoost !== 0) {
        s = Math.max(0, Math.min(100, s + saturationBoost))
    }
    
    // Apply enhanced vibrance if enabled
    if (enhancedVibrance) {
        // Boost saturation slightly in mid-ranges to counteract washed-out appearance
        // This is based on human perceptual analysis of color transitions
        if (clamped > 25 && clamped < 75) {
            const boost = 10 * Math.sin(Math.PI * (clamped - 25) / 50) // creates a subtle bell curve
            s = Math.min(100, s + boost)
            
            // Subtle lightness adjustment for better perceived vibrance
            l = Math.max(30, Math.min(70, l - boost * 0.2))
        }
    }

    // Convert back to RGB
    const [r, g, b] = hslToRgb(h, s, l)

    // Return as RGBA with specified opacity
    return `rgba(${r}, ${g}, ${b}, ${opacity})`
}

/**
 * Generate a palette of interpolated colors.
 * 
 * @param {number} steps - Number of color steps to generate
 * @param {Object} options - Configuration options
 * @param {number} [options.start=0] - Starting progress value
 * @param {number} [options.end=100] - Ending progress value
 * @param {number} [options.opacity=1] - Opacity for all colors
 * @param {boolean} [options.enhancedVibrance=true] - Apply vibrance enhancement
 * @param {number} [options.saturationBoost=0] - Saturation adjustment
 * @returns {string[]} - Array of RGBA color strings
 */
export const generateColorPalette = (steps, options = {}) => {
    const {
        start = 0,
        end = 100,
        opacity = 1,
        enhancedVibrance = true,
        saturationBoost = 0
    } = options;
    
    const palette = [];
    const range = end - start;
    
    for (let i = 0; i < steps; i++) {
        const progress = start + (range * i) / (steps - 1);
        palette.push(getInterpolatedColor(progress, { 
            opacity, 
            enhancedVibrance, 
            saturationBoost 
        }));
    }
    
    return palette;
}

/**
 * Convert HSL values to a CSS-compatible hsl() string
 * 
 * @param {number} h - Hue (0-360)
 * @param {number} s - Saturation (0-100)
 * @param {number} l - Lightness (0-100)
 * @param {number} [a=1] - Alpha (0-1)
 * @returns {string} - CSS hsl() or hsla() string
 */
export const hslToCssString = (h, s, l, a = 1) => {
    if (a < 1) {
        return `hsla(${Math.round(h)}, ${Math.round(s)}%, ${Math.round(l)}%, ${a})`;
    }
    return `hsl(${Math.round(h)}, ${Math.round(s)}%, ${Math.round(l)}%)`;
}

/**
 * Adjusts the lightness of an HSL color
 * 
 * @param {[number, number, number]} hslColor - HSL color array
 * @param {number} amount - Amount to adjust lightness by (-100 to 100)
 * @returns {[number, number, number]} - Adjusted HSL color
 */
export const adjustLightness = (hslColor, amount) => {
    const [h, s, l] = hslColor;
    return [h, s, Math.max(0, Math.min(100, l + amount))];
}
