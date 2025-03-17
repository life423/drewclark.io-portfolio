import React from 'react'
import PropTypes from 'prop-types'

/**
 * Horizontal progress indicator that visualizes page scroll position
 *
 * @param {Object} props - Component props
 * @param {boolean} props.visible - Whether the progress bar should be displayed
 * @param {number} props.progress - Current scroll percentage (0-100)
 * @param {function} props.getInterpolatedColor - Function that returns the color for a given progress
 * @returns {React.ReactElement|null} The progress bar component
 */
function HorizontalProgressBar({ visible, progress, getInterpolatedColor }) {
    if (!visible) return null

    return (
        <div className='absolute bottom-0 left-0 right-0 z-[51] pointer-events-none'>
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
    visible: PropTypes.bool
}

HorizontalProgressBar.defaultProps = {
    visible: true
}

export default HorizontalProgressBar
