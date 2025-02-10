// FILE: app/src/components/progress/ProgressBar.jsx
import React, { useState, useEffect, useMemo } from 'react'
import useScrollPosition from '../../hooks/useScrollPosition'
import { getInterpolatedColor } from '../utils/colorInterpolate'

export default function ProgressBar() {
    // A) Existing logic
    const scrollY = useScrollPosition()

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

    // B) Calculate scroll progress
    const scrollable = docHeight - winHeight
    const progress = scrollable > 0 ? (scrollY / scrollable) * 100 : 0

    // C) Get the color from your new utility
    const barColor = useMemo(() => getInterpolatedColor(progress), [progress])

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
