/**
 * Interpolates between colors based on a progress value (0-100)
 * @param {number} progress - Progress value between 0 and 100
 * @returns {string} - RGB color string
 */
export const getInterpolatedColor = (progress) => {
    // Ensure progress is between 0 and 100
    const clampedProgress = Math.max(0, Math.min(100, progress))
    
    // Define color stops
    const colors = [
        { r: 59, g: 130, b: 246 }, // Blue (tailwind blue-500)
        { r: 16, g: 185, b: 129 }, // Green (tailwind green-500)
    ]
    
    // Calculate interpolation factor
    const factor = clampedProgress / 100
    
    // Interpolate between colors
    const r = Math.round(colors[0].r + (colors[1].r - colors[0].r) * factor)
    const g = Math.round(colors[0].g + (colors[1].g - colors[0].g) * factor)
    const b = Math.round(colors[0].b + (colors[1].b - colors[0].b) * factor)
    
    return `rgb(${r}, ${g}, ${b})`
}
