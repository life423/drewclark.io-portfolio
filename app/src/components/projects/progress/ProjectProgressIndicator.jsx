import React from 'react'
import PropTypes from 'prop-types'
import ProgressBar from './ProgressBar'
import clsx from 'clsx'

/**
 * ProjectProgressIndicator - Shows visual indication of progress through projects
 * Features:
 * - Dynamic shimmer gradient progress bar with smooth animation during transitions
 * - Clean, minimal design without interactive markers
 * - Consistent visual hierarchy with sophisticated animations
 */
const ProjectProgressIndicator = ({
    currentProject,
    totalProjects,
    isTransitioning = false,
}) => {
    // Calculate progress percentage
    const progress = (currentProject / totalProjects) * 100

    return (
        <div
            className='flex items-center gap-2 sm:gap-4 text-xs sm:text-sm px-3 sm:px-5'
            role='region'
            aria-label='Project progress indicator'
        >
            {/* Interactive Timeline with Animated Progress Bar */}
            <div className='relative flex-grow h-1.5 bg-brandGray-700 rounded-full overflow-hidden'>
                <ProgressBar 
                    progress={progress} 
                    isTransitioning={isTransitioning} 
                />
            </div>

            {/* Project Progress Counter */}
            <div className='flex items-center gap-2 text-brandGray-400 justify-end'>
                <span className='font-mono'>
                    {currentProject}/{totalProjects}
                </span>
            </div>
        </div>
    )
}

ProjectProgressIndicator.propTypes = {
    currentProject: PropTypes.number.isRequired,
    totalProjects: PropTypes.number.isRequired,
    isTransitioning: PropTypes.bool,
}

export default React.memo(ProjectProgressIndicator)
