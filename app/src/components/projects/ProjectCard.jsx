import React, { useRef } from 'react'
import clsx from 'clsx'
import { ProjectProgressIndicator } from './progress'
import useScrollPosition from '../../hooks/useScrollPosition'

export default function ProjectCard({
    projectNumber,
    title,
    summary,
    stack,
    initialDescription,
    detailedDescription,
    technicalDetails,
    challenges,
    readme,
    onNavigateToProject,
    totalProjects = 3,
    hideToc = false, // Prop to hide the table of contents in the card
    isActive = false, // Whether this card is the active one
    isExpanded = false, // Whether this card should show expanded content (for magazine layout)
    isCompact = false, // Whether this card should show compact content (for magazine layout)
    onClick = null, // Click handler for the card
}) {
    // Re-measured when the content's transition ends (see onTransitionEnd below)
    const { forceRecalculation } = useScrollPosition()

    // References for DOM elements
    const cardRef = useRef(null)
    const contentRef = useRef(null)

    return (
        <div
            ref={cardRef}
            className={clsx(
                'my-4 @container overflow-hidden rounded-xl shadow-[0_0_20px_-5px_rgba(16,185,129,0.15)] bg-brandGray-800 border border-brandGray-700 transition-all duration-300 flex flex-col',
                // Adjust height based on mode
                isCompact ? 'h-full' : isExpanded ? 'h-[700px]' : 'h-[700px]',
                // Card styles based on state
                isActive 
                    ? 'ring-2 ring-brandGreen-500/50 shadow-xl border-brandGreen-600/30 bg-gradient-to-b from-brandGray-800 to-brandGray-850' 
                    : 'hover:shadow-lg hover:border-brandGray-600 hover:translate-y-[-2px]',
                // Cursor if clickable
                onClick && 'cursor-pointer'
            )}
            onClick={() => onClick && onClick()}
        >
            {/* Project Header */}
            <div className='p-3 @sm:p-4 @md:p-5 border-b border-brandGray-700 bg-gradient-to-r from-brandGray-800 via-brandGray-800 to-brandBlue-900/10'>
                <div className='flex items-center justify-between mb-2'>
                    <span className='text-sm font-semibold text-white px-2 py-1 rounded-md bg-gradient-to-r from-brandOrange-700 to-brandOrange-600 shadow-sm'>
                        Project {projectNumber}
                    </span>
                    {/* Overview button - only visible on mobile/tablet */}
                    <button
                        onClick={() => onNavigateToProject?.(-1)}
                        className='lg:hidden group flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm text-brandGray-400 hover:text-brandGreen-400 transition-all duration-300'
                    >
                        <svg
                            xmlns='http://www.w3.org/2000/svg'
                            className='h-4 w-4'
                            viewBox='0 0 20 20'
                            fill='currentColor'
                        >
                            <path
                                fillRule='evenodd'
                                d='M10 18a8 8 0 100-16 8 8 0 000 16zm.707-10.293a1 1 0 00-1.414-1.414l-3 3a1 1 0 000 1.414l3 3a1 1 0 001.414-1.414L9.414 11H13a1 1 0 100-2H9.414l1.293-1.293z'
                                clipRule='evenodd'
                            />
                        </svg>
                        <span>Overview</span>
                    </button>
                </div>

                <h2
                    className='text-xl @sm:text-2xl font-bold mb-1 min-h-[1.75rem] @sm:min-h-[2rem]'
                >
                    <span className='bg-clip-text text-transparent bg-gradient-to-r from-brandGreen-300 via-brandGreen-200 to-brandGreen-300'>
                        {title}
                    </span>
                </h2>
                <div className='flex flex-wrap gap-1 @sm:gap-2 mt-2 @sm:mt-3'>
                    {stack.map((tech, index) => (
                        <span
                            key={index}
                            className='text-xs font-medium text-brandGray-300 px-1.5 @sm:px-2 py-0.5 @sm:py-1 rounded-full bg-brandGray-700'
                        >
                            {tech}
                        </span>
                    ))}
                </div>
            </div>

            {/* Project Content - conditionally render based on mode */}
            <div
                ref={contentRef}
                className='p-3 @sm:p-4 @md:p-5 flex-1 flex flex-col overflow-y-auto'
            >
                <div
                    className={clsx(
                        'prose prose-sm prose-invert max-w-none',
                        'prose-headings:text-brandGreen-300 prose-strong:text-brandGreen-400'
                    )}
                    onTransitionEnd={() => {
                        // Force recalculation when the transition completes
                        forceRecalculation()
                        // Fallback: if onTransitionEnd fires slightly early, force again after a brief delay
                        setTimeout(() => forceRecalculation(), 200)
                    }}
                >
                    {/* Compact mode just shows summary */}
                    {isCompact ? (
                        <div>
                            <p className="text-sm">{summary}</p>
                            <div className="mt-4 text-xs text-brandGreen-400">
                                Click to view detailed project information
                            </div>
                        </div>
                    ) : (
                        /* Normal/expanded mode shows full content */
                        <>
                            <p>{initialDescription}</p>

                            {/* Full project details for expanded/normal cards */}
                            {(isExpanded || !isCompact) && (
                                <>
                                    <h3>The Challenge</h3>
                                    <p>{challenges || "This project presented numerous technical and design challenges that pushed our team to innovate."}</p>

                                    <h3>Technical Details</h3>
                                    <p>{technicalDetails || "This project showcases a variety of technical skills and innovative approaches."}</p>

                                    <h3>Key Innovations</h3>
                                    <ul>
                                        <li>
                                            Implemented real-time data processing pipelines
                                        </li>
                                        <li>
                                            Designed an intuitive interface for complex
                                            information
                                        </li>
                                        <li>Optimized performance for mobile devices</li>
                                    </ul>
                                </>
                            )}
                        </>
                    )}
                </div>
            </div>

            {/* Interactive Chat Section Removed - Using unified chat below all projects instead */}

            {/* Footer with project progress indicator - only shown if hideToc is false */}
            {!hideToc && (
                <div className='border-t border-brandGray-700 bg-brandGray-850 py-3'>
                    <ProjectProgressIndicator
                        currentProject={projectNumber}
                        totalProjects={totalProjects}
                        onProjectClick={index =>
                            onNavigateToProject?.(index + 1)
                        }
                    />
                </div>
            )}
        </div>
    )
}
