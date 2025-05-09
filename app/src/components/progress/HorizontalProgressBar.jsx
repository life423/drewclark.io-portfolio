import PropTypes from 'prop-types'
import React, { useRef } from 'react'
import useResizeObserver from '../../hooks/useResizeObserver'

function HorizontalProgressBar({
    visible = true,
    progress,
    getInterpolatedColor,
}) {
    const containerRef = useRef(null)

    useResizeObserver(containerRef)

    if (!visible) return null

    return (
        <div
            className='absolute bottom-0 left-0 right-0 w-full overflow-hidden z-[51] pointer-events-none'
            ref={containerRef}
        >
            <div
                className='h-[3px] transition-all duration-200 ease-out'
                style={{
                    width: `${Math.min(progress, 100)}%`,
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
