// src/components/ProgressBar.jsx
// import React from 'react'
import { useState, useEffect } from 'react'
import useScrollPosition from '../../hooks/useScrollPosition'

export default function ProgressBar() {
    const scrollY = useScrollPosition()
    const [docHeight, setDocHeight] = useState(0)
    const [winHeight, setWinHeight] = useState(0)

    useEffect(() => {
        // total doc height minus window height = total scrollable area
        function measure() {
            setDocHeight(document.body.scrollHeight)
            setWinHeight(window.innerHeight)
        }
        measure()

        // re-measure if window resizes
        window.addEventListener('resize', measure)
        return () => window.removeEventListener('resize', measure)
    }, [])

    const scrollable = docHeight - winHeight
    // compute percentage scrolled
    const progress = scrollable > 0 ? (scrollY / scrollable) * 100 : 0

    return (
        <div
            className='fixed top-16 left-0 h-1 bg-brandGreen-500 transition-all duration-200 z-50'
            style={{ width: `${progress}%` }}
        />
    )
}
