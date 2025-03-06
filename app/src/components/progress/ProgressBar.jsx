/**
 * Optimized scroll-based progress bar that indicates scroll position on the page
 * Uses React.memo and useMemo to minimize re-renders and improve performance
 * Updated to use enhanced scrollInfo from the useScrollPosition hook
 * 
 * @param {Object} props - Component props
 * @param {string} props.topOffset - Distance from top of screen (default: 4rem)
 * @param {boolean} props.visible - Whether the bar is visible (default: true)
 */
import React, { useMemo, useCallback } from 'react'
import PropTypes from 'prop-types'
import useScrollPosition from '../../hooks/useScrollPosition'
import { getInterpolatedColor } from '../utils/colorInterpolate'

const ProgressBar = React.memo(function ProgressBar({ topOffset = '4rem', visible = true }) {
    // Get enhanced scroll info that includes percent directly
    const scrollInfo = useScrollPosition()
    
    // Get progress directly from the hook - no need to recalculate
    const progress = scrollInfo.percent
    
    // Calculate color based on the progress
    const progressColor = useMemo(() => 
        getInterpolatedColor(progress), 
    [progress])
    
    // Memoize styles object to minimize object creation
    const styles = useMemo(() => ({
        width: `${progress}%`,
        top: topOffset,
        '--progress-color': progressColor
    }), [progress, topOffset, progressColor])
    
    // Only render when visible is true
    if (!visible) return null
    
    return (
        <div
            className="scroll-progress-bar progress-visible"
            style={styles}
            aria-hidden="true"
        />
    )
})

ProgressBar.propTypes = {
    topOffset: PropTypes.string,
    visible: PropTypes.bool
}

export default ProgressBar
