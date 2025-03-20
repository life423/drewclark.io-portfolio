import React, { useRef, useState, useEffect } from 'react'
import PropTypes from 'prop-types'

/**
 * Horizontal progress indicator that visualizes page scroll position.
 * This version uses a ResizeObserver to force re-rendering when the container's width changes.
 *
 * @param {Object} props - Component props
 * @param {boolean} props.visible - Whether the progress bar should be displayed
 * @param {number} props.progress - Current scroll percentage (0-100)
 * @param {function} props.getInterpolatedColor - Function that returns the color for a given progress
 * @returns {React.ReactElement|null} The progress bar component
 */
function HorizontalProgressBar({
    visible = true,
    progress,
    getInterpolatedColor,
}) {
    const containerRef = useRef(null)
    const [containerWidth, setContainerWidth] = useState(0)

    useEffect(() => {
        if (!containerRef.current) return

        // Set the initial width
        setContainerWidth(containerRef.current.clientWidth)

        // Create a ResizeObserver to update width on container resize
        const resizeObserver = new ResizeObserver(entries => {
            for (let entry of entries) {
                setContainerWidth(entry.contentRect.width)
            }
        })
        resizeObserver.observe(containerRef.current)

        // Cleanup the observer on unmount
        return () => resizeObserver.disconnect()
    }, [])

    if (!visible) return null

    return (
        <div
            className='absolute bottom-0 left-0 right-0 z-[51] pointer-events-none'
            ref={containerRef}
        >
            <div
                className='h-[3px] transition-all duration-200 ease-out'
                style={{
                    width: `${progress}%`,
                    backgroundColor: getInterpolatedColor(progress),
                }}
                aria-hidden='true'
            />
        </div>
    )
}

HorizontalProgressBar.propTypes = {
    progress: PropTypes.number.isRequired,
    getInterpolatedColor: PropTypes.func.isRequired,
    visible: PropTypes.bool,
}

export default HorizontalProgressBar
