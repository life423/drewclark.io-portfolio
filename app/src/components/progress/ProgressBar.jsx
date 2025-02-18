import React, { useState, useEffect, useMemo } from 'react'
import PropTypes from 'prop-types'
import useScrollPosition from '../../hooks/useScrollPosition'
import { getInterpolatedColor } from '../../components/utils/colorInterpolate'

export default function ProgressBar({ topOffset = '4rem' }) {
    const scrollY = useScrollPosition()
    const [docHeight, setDocHeight] = useState(0)
    const [winHeight, setWinHeight] = useState(0)

    useEffect(() => {
        function measure() {
            setDocHeight(document.documentElement.scrollHeight)
            setWinHeight(window.innerHeight)
        }
        measure()
        window.addEventListener('resize', measure)
        return () => window.removeEventListener('resize', measure)
    }, [])

    // Calculate scroll progress
    const scrollable = docHeight - winHeight
    const progress = scrollable > 0 ? (scrollY / scrollable) * 100 : 0

    // Get interpolated color based on scroll progress
    const barColor = useMemo(() => getInterpolatedColor(progress), [progress])

    return (
        <div
            className="fixed left-0 h-1 transition-all duration-200 z-[60]"
            style={{
                width: `${progress}%`,
                backgroundColor: barColor,
                top: topOffset
            }}
        />
    )
}

ProgressBar.propTypes = {
    topOffset: PropTypes.string
}
