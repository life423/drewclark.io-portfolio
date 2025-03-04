// FILE: app\src\components\progress\ProgressBar.jsx

import React, { useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import useScrollPosition from '../../hooks/useScrollPosition'

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
            className='
        fixed
        left-0
        h-1
        z-[60]
        bg-pulse-gradient     /* from backgrounds plugin (the gradient) */
        animate-color-pulse   /* from animations plugin (the keyframe) */
        transition-all
        duration-200
      '
            style={{
                width: `${progress}%`,
                top: topOffset,
            }}
        />
    )
}

ProgressBar.propTypes = {
    topOffset: PropTypes.string,
}
