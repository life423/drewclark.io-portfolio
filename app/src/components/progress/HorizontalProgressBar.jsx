import React from 'react'
import { getInterpolatedColor } from '../../components/utils/colorInterpolate'

/**
 * Horizontal progress indicator that visualizes page scroll position
 *
 * @param {Object} props - Component props
 * @param {boolean} props.visible - Whether the progress bar should be displayed
 * @param {number} props.percent - Current scroll percentage (0-100)
 * @returns {React.ReactElement|null} The progress bar component
 */
export default function HorizontalProgressBar({ visible, percent }) {
    if (!visible) return null

    return (
        <div className='absolute bottom-0 left-0 right-0 z-[51]'>
            <div
                className='h-[3px] transition-all duration-200 ease-out'
                style={{
                    width: `${percent}%`,
                    backgroundColor: getInterpolatedColor(percent),
                }}
                aria-hidden='true'
            />
        </div>
    )
}
