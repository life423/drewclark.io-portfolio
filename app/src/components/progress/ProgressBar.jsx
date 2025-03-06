// FILE: app\src\components\progress\ProgressBar.jsx

import React, { useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import useScrollPosition from '../../hooks/useScrollPosition'
import { getInterpolatedColor } from '../utils/colorInterpolate'

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

    return (
        <div
            className="progress-bar-base progress-bar-interpolated"
            style={{
                width: `${progress}%`,
                top: topOffset,
                '--progress-color': getInterpolatedColor(progress)
            }}
        />
    )
}

ProgressBar.propTypes = {
    topOffset: PropTypes.string,
}
