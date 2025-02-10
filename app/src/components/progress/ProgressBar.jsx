// FILE: app/src/components/progress/ProgressBar.jsx
import React, { useState, useEffect, useMemo } from 'react'
import useScrollPosition from '../../hooks/useScrollPosition'
import useEdgeSwipe from '../../hooks/useEdgeSwipe'

/**
 * Interpolates between two hex colors (like #FF6B00 -> #10B981) based on a 0..1 factor.
 * This “lerp” approach ensures a smooth transition between color stops.
 */
function lerpColor(hexA, hexB, t) {
    const rgbA = hexToRgb(hexA)
    const rgbB = hexToRgb(hexB)
    const r = Math.round(rgbA.r + (rgbB.r - rgbA.r) * t)
    const g = Math.round(rgbA.g + (rgbB.g - rgbA.g) * t)
    const b = Math.round(rgbA.b + (rgbB.b - rgbA.b) * t)
    return rgbToHex(r, g, b)
}

function hexToRgb(hex) {
    // Remove leading "#"
    hex = hex.replace('#', '')

    // Parse r, g, b
    const bigint = parseInt(hex, 16)
    return {
        r: (bigint >> 16) & 255,
        g: (bigint >> 8) & 255,
        b: bigint & 255,
    }
}

function rgbToHex(r, g, b) {
    const toHex = v => v.toString(16).padStart(2, '0')
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`
}

/**
 * We define color segments for progress in the range [0..100].
 * Each segment defines:
 *   - start:  starting progress
 *   - end:    ending progress
 *   - from:   start color (hex)
 *   - to:     end color (hex)
 *
 * The code will find which segment the progress is in,
 * then interpolate the color within that segment.
 *
 * Segments (example):
 *   0..40% : brandGreen.500 -> brandBlue.400
 *   40..70%: brandBlue.400 -> brandBlue.500
 *   70..90%: brandBlue.500 -> neonOrange.300
 *   90..100%: neonOrange.300 -> neonOrange.500
 */
const colorSegments = [
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

function getInterpolatedColor(progress) {
    // Clamp progress between 0 and 100
    const p = Math.max(0, Math.min(100, progress))

    // Find the segment containing 'p'
    for (let i = 0; i < colorSegments.length; i++) {
        const seg = colorSegments[i]
        if (p >= seg.start && p <= seg.end) {
            // Interpolate factor between segment range
            const range = seg.end - seg.start
            const t = range === 0 ? 0 : (p - seg.start) / range
            return lerpColor(seg.from, seg.to, t)
        }
    }
    // If no segment found (e.g. p > 100?), just return last color
    return colorSegments[colorSegments.length - 1].to
}

export default function ProgressBar() {
    // 1) Hook that tracks scroll
    const scrollY = useScrollPosition()

    // 2) Hook that listens for edge swipes
    useEdgeSwipe({
        edgeWidth: 20,
        onSwipeRight: () => {
            console.log(
                'Edge swipe detected! Possibly open a drawer or do something.'
            )
        },
    })

    // 3) State for measuring doc height vs. window height
    const [docHeight, setDocHeight] = useState(0)
    const [winHeight, setWinHeight] = useState(0)

    useEffect(() => {
        function measure() {
            setDocHeight(document.body.scrollHeight)
            setWinHeight(window.innerHeight)
        }
        measure()

        window.addEventListener('resize', measure)
        return () => window.removeEventListener('resize', measure)
    }, [])

    // 4) Calculate progress
    const scrollable = docHeight - winHeight
    const progress = scrollable > 0 ? (scrollY / scrollable) * 100 : 0

    // 5) Memoize the color to avoid re-calculating unnecessarily
    const barColor = useMemo(() => {
        return getInterpolatedColor(progress)
    }, [progress])

    return (
        <div
            className='fixed top-16 left-0 h-1 transition-all duration-200 z-51'
            style={{
                width: `${progress}%`,
                backgroundColor: barColor,
            }}
        />
    )
}
