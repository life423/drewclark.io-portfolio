import React, { useRef } from 'react'
import clsx from 'clsx'
import { ProjectProgressIndicator } from './progress'
import useScrollPosition from '../../hooks/useScrollPosition'
import ProjectLinks from './ProjectLinks'
import ProjectImage from './ProjectImage'
import ProjectNextButton from './ProjectNextButton'

export default function ProjectCard({
    projectNumber,
    title,
    image,
    imageAlt,
    imageWidth,
    imageHeight,
    summary,
    tagline,
    stack,
    initialDescription,
    detailedDescription,
    technicalDetails,
    challenges,
    readme,
    repo, // owner/name on GitHub, for the source link
    liveUrl, // where to try the project, when it has a public URL
    liveLabel, // text for that link, e.g. Play the game
    highlights, // short bullets for Key Innovations; the section is left out without them
    downloads, // downloadable builds: [{ platform, label, url, version }]
    onNavigateToProject,
    onNextProject,
    nextProjectTitle,
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

    if (isCompact) {
        return (
            <div className='flex h-full items-start gap-3 rounded-xl border border-brandGray-700 bg-brandGray-800 p-3 transition-colors duration-200 hover:border-brandGreen-600 motion-reduce:transition-none'>
                <div className='w-20 shrink-0'>
                    <ProjectImage image={image} imageAlt={imageAlt} imageWidth={imageWidth} imageHeight={imageHeight} title={title} preview />
                </div>
                <div className='min-w-0 flex-1'>
                    <span className='text-xs text-brandGray-400'>Project {projectNumber}</span>
                    <h3 className='mt-1 text-base font-semibold leading-snug text-brandGreen-300'>{title}</h3>
                    <p className='mt-1 line-clamp-2 text-sm leading-relaxed text-brandGray-300'>{tagline || summary}</p>
                    <span className='mt-2 block text-xs font-medium text-brandGreen-400'>View project →</span>
                </div>
            </div>
        )
    }

    return (
        <div
            ref={cardRef}
            className={clsx(
                '@container overflow-hidden rounded-xl shadow-[0_0_20px_-5px_rgba(16,185,129,0.15)] bg-brandGray-800 border border-brandGray-700 transition-all duration-300 flex flex-col',
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
                    {onNextProject && <ProjectNextButton onClick={onNextProject} nextTitle={nextProjectTitle} />}
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
                {!isCompact && (
                    <ProjectLinks title={title} liveUrl={liveUrl} liveLabel={liveLabel} repo={repo} downloads={downloads} />
                )}
            </div>

            {/* Project Content - conditionally render based on mode */}
            <div
                ref={contentRef}
                className='p-3 @sm:p-4 @md:p-5 flex-1 flex flex-col'
            >
                <ProjectImage image={image} imageAlt={imageAlt} imageWidth={imageWidth} imageHeight={imageHeight} title={title} preview={isCompact} />
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
                    {/* Compact mode keeps the preview image and a short summary. */}
                    {isCompact ? (
                        <div>
                            <p className="text-sm">{summary}</p>
                            <div className="mt-4 text-xs text-brandGreen-400">
                                View project →
                            </div>
                        </div>
                    ) : (
                        /* Normal/expanded mode shows full content */
                        <>
                            <p>{initialDescription}</p>

                            {/* Full project details for expanded/normal cards */}
                            {(isExpanded || !isCompact) && (
                                <>
                                    {challenges && (
                                        <>
                                            <h3>The Challenge</h3>
                                            <p>{challenges}</p>
                                        </>
                                    )}

                                    {technicalDetails && (
                                        <>
                                            <h3>Technical Details</h3>
                                            <p>{technicalDetails}</p>
                                        </>
                                    )}

                                    {Array.isArray(highlights) && highlights.length > 0 && (
                                        <>
                                            <h3>Key Innovations</h3>
                                            <ul>
                                                {highlights.map((item, index) => (
                                                    <li key={index}>{item}</li>
                                                ))}
                                            </ul>
                                        </>
                                    )}
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
