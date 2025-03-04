/**
 * Interpolates between colors based on a progress value (0-100)
 * @param {number} progress - Progress value between 0 and 100
 * @returns {string} - RGBA color string
 */
export const getInterpolatedColor = progress => {
    // Ensure progress is between 0 and 100
    const clampedProgress = Math.max(0, Math.min(100, progress))

    // Define color stops using Tailwind colors. These values come from tailwind.config.js
    const colors = [
        { r: 16, g: 185, b: 129, a: 0.8 }, // brandGreen-500 (#10B981)
        { r: 14, g: 165, b: 233, a: 0.8 }, // brandBlue-500 (#0EA5E9)
        { r: 255, g: 107, b: 0, a: 0.8 }, // neonOrange-500 (#FF6B00)
    ]

    // Determine which segment the progress falls into
    let startColor, endColor, segmentFactor

    if (clampedProgress <= 50) {
        // First segment: Green to Blue
        startColor = colors[0]
        endColor = colors[1]
        segmentFactor = clampedProgress / 50 // 0-1 within this segment
    } else {
        // Second segment: Blue to Orange
        startColor = colors[1]
        endColor = colors[2]
        segmentFactor = (clampedProgress - 50) / 50 // 0-1 within this segment
    }

    // Interpolate between the appropriate colors
    const r = Math.round(
        startColor.r + (endColor.r - startColor.r) * segmentFactor
    )
    const g = Math.round(
        startColor.g + (endColor.g - startColor.g) * segmentFactor
    )
    const b = Math.round(
        startColor.b + (endColor.b - startColor.b) * segmentFactor
    )
    const a = startColor.a + (endColor.a - startColor.a) * segmentFactor

    return `rgba(${r}, ${g}, ${b}, ${a})`
}
