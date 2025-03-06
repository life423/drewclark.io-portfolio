// FILE: app\src\components\progress\ProgressBar.jsx

import React, { useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import useScrollPosition from '../../hooks/useScrollPosition'
import { getInterpolatedColor } from '../utils/colorInterpolate'

/**
 * Scroll-based progress bar that indicates scroll position on the page
 * Uses consistent color interpolation for visual appeal
 * 
 * @param {Object} props - Component props
 * @param {string} props.topOffset - Distance from top of screen (default: 4rem)
 * @param {boolean} props.visible - Whether the bar is visible (default: true)
 */
export default function ProgressBar({ topOffset = '4rem', visible = true }) {
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
    
    // Styling with direct color interpolation
    const styles = {
        width: `${progress}%`,
        top: topOffset,
        '--progress-color': getInterpolatedColor(progress),
        opacity: visible ? 1 : 0,
        transition: 'opacity 0.3s ease-in-out, width 0.3s ease-out'
    }

    return (
        <div
            className="progress-bar-base progress-bar-interpolated"
            style={styles}
        />
    )
}

ProgressBar.propTypes = {
    topOffset: PropTypes.string,
    visible: PropTypes.bool
}
