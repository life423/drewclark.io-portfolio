 import React, { useState, useEffect, useRef, useCallback } from 'react'
import ProjectCard from './ProjectCard'
import ProjectLinks from './ProjectLinks'
import ProjectImage from './ProjectImage'
import ProjectNextButton from './ProjectNextButton'
import ProjectOverviewRow from './ProjectOverviewRow'
import UnifiedProjectChat from './UnifiedProjectChat'
import clsx from 'clsx'
// Also read by the API to build the chat prompt (api/services/ai/promptBuilder.js)
import PROJECTS from '../../data/projects.json'

export default function ProjectsContainer() {
    const [started, setStarted] = useState(false)
    const [activeProjectIndex, setActiveProjectIndex] = useState(0)
    const [featuredProjectIndex, setFeaturedProjectIndex] = useState(0) // For magazine-style desktop layout
    const [transitionDirection, setTransitionDirection] = useState(null)

    // Picking a project swaps the overview for the project view, so the card the visitor
    // asked for should end up at the top of the screen, not wherever the page happened to be
    const projectsTopRef = useRef(null)
    const scrollAfterRender = useRef(false)

    const scrollToProjects = useCallback(() => {
        const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
        projectsTopRef.current?.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' })
    }, [])

    // The project view only exists after the next render, so the scroll waits for it
    useEffect(() => {
        if (!scrollAfterRender.current) return
        scrollAfterRender.current = false
        scrollToProjects()
    }, [started, activeProjectIndex, featuredProjectIndex, scrollToProjects])

    const showProject = index => {
        scrollAfterRender.current = true
        setStarted(true)
        setActiveProjectIndex(index)
        setFeaturedProjectIndex(index)
    }

    // Going back is the same swap in reverse: land on the overview panel, not mid-page
    const showOverview = () => {
        scrollAfterRender.current = true
        setStarted(false)
    }

    const handleStart = () => {
        showProject(activeProjectIndex)
    }

    const navigateToProject = index => {
        if (index < 0 || index >= PROJECTS.length) return

        scrollAfterRender.current = true
        const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
        setTransitionDirection(reduceMotion ? null : index > activeProjectIndex ? 'next' : 'prev')
        setActiveProjectIndex(index)
        setFeaturedProjectIndex(index)
    }

    useEffect(() => {
        if (transitionDirection) {
            const timer = setTimeout(() => {
                setTransitionDirection(null)
            }, 500)

            return () => clearTimeout(timer)
        }
    }, [transitionDirection])

        if (!started) {
        return (
            <section className='relative py-16 px-4 bg-gradient-to-b from-brandGreen-950/90 via-brandGreen-900/95 to-brandGreen-900 overflow-x-hidden'>
                {}
                <div
                    className='absolute inset-0 opacity-[0.03] mix-blend-overlay pointer-events-none'
                    style={{
                        backgroundImage:
                            "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%' height='100%' filter='url(%23noiseFilter)'/%3E%3C/svg%3E\")",
                    }}
                ></div>
                <div className='max-w-3xl mx-auto'>
                    <div ref={projectsTopRef} className='scroll-mt-20 my-4 sm:my-6 md:my-8 overflow-hidden rounded-xl shadow-[0_0_20px_-5px_rgba(16,185,129,0.15)] bg-brandGray-800 border border-brandGray-700 transform transition-all duration-300 hover:shadow-xl hover:border-brandGray-600 flex flex-col min-h-[500px]'>
                        {}
                        <div className='p-3 sm:p-4 md:p-5 border-b border-brandGray-700 bg-gradient-to-r from-brandGray-800 via-brandGray-800 to-brandBlue-900/10'>
                            <div className='flex items-center justify-between mb-2'>
                                <span className='text-sm font-semibold text-white px-2 py-1 rounded-md bg-gradient-to-r from-brandOrange-700 to-brandOrange-600 shadow-sm'>
                                    Overview
                                </span>
                            </div>

                            <h2 className='text-xl sm:text-2xl font-bold text-brandGreen-300 mb-1'>
                                My Portfolio Projects
                            </h2>
                        </div>

                        <div className='p-3 sm:p-4 md:p-5 flex-1 flex flex-col'>
                            {/* Welcome text - shown on all screen sizes */}
                            <div className='prose prose-sm prose-invert max-w-none mb-3 sm:mb-4 md:mb-6 lg:mb-3'>
                                <p>
                                    Try an app, explore the code, or open a project to see how it works.
                                </p>
                            </div>

                            {/* Project list - consistent card style across all screen sizes */}
                            <div className='block lg:flex-grow'>
                                <h3 className='text-brandGray-400 uppercase text-xs tracking-wider mb-2 font-medium'>
                                    Projects Overview
                                </h3>
                                
                                <div className="grid grid-cols-1 auto-rows-fr gap-3 lg:gap-4 mb-4">
                                    {PROJECTS.map((project, index) => (
                                        <ProjectOverviewRow
                                            key={project.id}
                                            project={project}
                                            index={index}
                                            onOpen={() => showProject(index)}
                                        />
                                    ))}
                                </div>
                            </div>

                            <div className='mt-auto lg:mt-4'>
                                <button
                                    onClick={handleStart}
                                    className='w-full px-4 py-2 bg-brandGreen-600 hover:bg-brandGreen-500 text-white rounded-md font-medium transition-colors duration-200 will-change-transform'
                                    style={{
                                        backfaceVisibility: 'hidden',
                                        WebkitBackfaceVisibility: 'hidden',
                                        transform: 'translateZ(0)',
                                        WebkitFontSmoothing: 'antialiased',
                                        MozOsxFontSmoothing: 'grayscale'
                                    }}
                                >
                                    <span>View Projects</span>
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Add chat component to welcome screen - shown below the welcome card */}
                    <div className='mt-8 max-w-3xl mx-auto'>
                        <UnifiedProjectChat />
                    </div>
                </div>
            </section>
        )
    }

    return (
        <section className='relative py-16 px-4 bg-gradient-to-b from-brandGreen-950/90 via-brandGreen-900/95 to-brandGreen-900 overflow-x-hidden'>
            {/* Background texture */}
            <div
                className='absolute inset-0 opacity-[0.03] mix-blend-overlay pointer-events-none'
                style={{
                    backgroundImage:
                        "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%' height='100%' filter='url(%23noiseFilter)'/%3E%3C/svg%3E\")",
                }}
            ></div>
            
            <div className='max-w-7xl mx-auto'>
                <div className='flex flex-col'>
                    {/* Projects Grid */}
                    <div ref={projectsTopRef} className='w-full scroll-mt-20'>
                        {/* On mobile and tablet - show the active project with navigation */}
                        <div className='block lg:hidden'>
                            
                            {/* Mobile Project Card with Integrated Project Overview */}
                            <div
                                className={clsx(
                                    'transition-all duration-500',
                                    'container-type-inline-size', // Add container context for container queries
                                    transitionDirection === 'next' && 'translate-x-[-40px] opacity-0',
                                    transitionDirection === 'prev' && 'translate-x-[40px] opacity-0'
                                )}
                            >
                                <div className='overflow-hidden rounded-xl shadow-[0_0_20px_-5px_rgba(16,185,129,0.15)] bg-brandGray-800 border border-brandGray-700 transition-all duration-300'>
                                    {/* Card Header */}
                                    <div className='p-3 sm:p-4 md:p-5 border-b border-brandGray-700 bg-gradient-to-r from-brandGray-800 via-brandGray-800 to-brandBlue-900/10'>
                                        <div className='flex items-center justify-between mb-2'>
                                            <span className='text-sm font-semibold text-white px-2 py-1 rounded-md bg-gradient-to-r from-brandOrange-700 to-brandOrange-600 shadow-sm'>
                                                Project {activeProjectIndex + 1}/{PROJECTS.length}
                                            </span>
                                            <ProjectNextButton
                                                onClick={() => showProject((activeProjectIndex + 1) % PROJECTS.length)}
                                                nextTitle={PROJECTS[(activeProjectIndex + 1) % PROJECTS.length].title}
                                            />
                                        </div>
                                        <h2 className='text-xl font-bold mb-1 text-transparent bg-clip-text bg-gradient-to-r from-brandGreen-300 via-brandGreen-200 to-brandGreen-300'>
                                            {PROJECTS[activeProjectIndex].title}
                                        </h2>
                                    </div>
                                    
                                    
                                    {/* Project Content */}
                                    <div className='p-3 sm:p-4 md:p-5'>
                                        <ProjectImage
                                            image={PROJECTS[activeProjectIndex].image}
                                            imageAlt={PROJECTS[activeProjectIndex].imageAlt}
                                            imageWidth={PROJECTS[activeProjectIndex].imageWidth}
                                            imageHeight={PROJECTS[activeProjectIndex].imageHeight}
                                            title={PROJECTS[activeProjectIndex].title}
                                        />
                                        {/* Project Summary and Stack */}
                                        <div className='mb-4'>
                                            <h3 className='text-base sm:text-lg font-medium text-white mb-2'>Summary</h3>
                                            <p className='text-sm text-brandGray-300 mb-3'>{PROJECTS[activeProjectIndex].summary}</p>
                                            
                                            <div className='flex flex-wrap gap-2 mt-3'>
                                                {PROJECTS[activeProjectIndex].stack.map((tech, techIndex) => (
                                                    <span
                                                        key={techIndex}
                                                        className='text-xs font-medium text-brandGray-200 px-2 py-1 rounded-full bg-brandGray-700'
                                                    >
                                                        {tech}
                                                    </span>
                                                ))}
                                            </div>
                                            <ProjectLinks
                                                title={PROJECTS[activeProjectIndex].title}
                                                liveUrl={PROJECTS[activeProjectIndex].liveUrl}
                                                liveLabel={PROJECTS[activeProjectIndex].liveLabel}
                                                repo={PROJECTS[activeProjectIndex].repo}
                                                downloads={PROJECTS[activeProjectIndex].downloads}
                                            />
                                        </div>
                                        
                                        {/* Project Description */}
                                        <div className='mb-4'>
                                            <h3 className='text-base sm:text-lg font-medium text-white mb-2'>Description</h3>
                                            <div className='prose prose-sm prose-invert max-w-none'>
                                                <p>{PROJECTS[activeProjectIndex].initialDescription}</p>
                                            </div>
                                        </div>
                                        
                                        {/* Project Details */}
                                        <div className='mb-4'>
                                            <h3 className='text-base sm:text-lg font-medium text-white mb-2'>Details</h3>
                                            <div className='prose prose-sm prose-invert max-w-none'>
                                                <p>{PROJECTS[activeProjectIndex].detailedDescription}</p>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    {/* Back Button */}
                                    <div className='p-3 sm:p-4 md:p-5 border-t border-brandGray-700/30'>
                                        <button
                                            onClick={showOverview}
                                            className='w-full flex items-center justify-center gap-2 px-4 py-2 bg-brandGray-700 hover:bg-brandGray-600 text-white rounded-lg text-sm transition-colors duration-200'
                                        >
                                            <svg
                                                xmlns='http://www.w3.org/2000/svg'
                                                className='h-4 w-4'
                                                viewBox='0 0 20 20'
                                                fill='currentColor'
                                            >
                                                <path
                                                    fillRule='evenodd'
                                                    d='M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z'
                                                    clipRule='evenodd'
                                                />
                                            </svg>
                                            Back to Overview
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        {/* Keep project details, alternatives and chat in one vertical flow. */}
                        <div className='hidden lg:block relative mx-auto max-w-5xl'>
                            <div className='space-y-6'>
                                <div className='transition-all duration-300'>
                                    <ProjectCard
                                        projectNumber={featuredProjectIndex + 1}
                                        title={PROJECTS[featuredProjectIndex].title}
                                        image={PROJECTS[featuredProjectIndex].image}
                                        imageAlt={PROJECTS[featuredProjectIndex].imageAlt}
                                        imageWidth={PROJECTS[featuredProjectIndex].imageWidth}
                                        imageHeight={PROJECTS[featuredProjectIndex].imageHeight}
                                        summary={PROJECTS[featuredProjectIndex].summary}
                                        stack={PROJECTS[featuredProjectIndex].stack}
                                        initialDescription={PROJECTS[featuredProjectIndex].initialDescription}
                                        detailedDescription={PROJECTS[featuredProjectIndex].detailedDescription}
                                        technicalDetails={PROJECTS[featuredProjectIndex].technicalDetails}
                                        challenges={PROJECTS[featuredProjectIndex].challenges}
                                        readme={PROJECTS[featuredProjectIndex].readme}
                                        repo={PROJECTS[featuredProjectIndex].repo}
                                        liveUrl={PROJECTS[featuredProjectIndex].liveUrl}
                                        liveLabel={PROJECTS[featuredProjectIndex].liveLabel}
                                        downloads={PROJECTS[featuredProjectIndex].downloads}
                                        highlights={PROJECTS[featuredProjectIndex].highlights}
                                        totalProjects={PROJECTS.length}
                                        onNextProject={() => showProject((featuredProjectIndex + 1) % PROJECTS.length)}
                                        nextProjectTitle={PROJECTS[(featuredProjectIndex + 1) % PROJECTS.length].title}
                                        onNavigateToProject={(newIndex) => {
                                            if (newIndex === -1) {
                                                showOverview();
                                            } else if (newIndex >= 0) {
                                                showProject(newIndex);
                                            }
                                        }}
                                        hideToc={true}
                                        isActive={true}
                                        isExpanded={true}
                                    />
                                </div>
                                
                                {/* Short image cards keep the other projects together below the details. */}
                                <div className='grid grid-cols-3 items-stretch gap-4'>
                                    {PROJECTS.map((project, index) => 
                                        index !== featuredProjectIndex && (
                                            <div 
                                                key={project.id}
                                                role='button'
                                                tabIndex={0}
                                                aria-label={`View ${project.title} details`}
                                                className="h-full rounded-xl cursor-pointer focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brandGreen-300"
                                                onClick={() => showProject(index)}
                                                onKeyDown={event => {
                                                    if (event.key === 'Enter' || event.key === ' ') {
                                                        event.preventDefault()
                                                        showProject(index)
                                                    }
                                                }}
                                            >
                                                <ProjectCard
                                                    projectNumber={index + 1}
                                                    title={project.title}
                                                    image={project.cardImage?.src || project.image}
                                                    imageAlt={project.cardImage?.alt || project.imageAlt}
                                                    imageWidth={project.cardImage?.width || project.imageWidth}
                                                    imageHeight={project.cardImage?.height || project.imageHeight}
                                                    summary={project.summary}
                                                    tagline={project.tagline}
                                                    stack={project.stack}
                                                    hideToc={true}
                                                    isCompact={true}
                                                />
                                            </div>
                                        )
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Bottom navigation stays available alongside the header shortcut. */}
                        <div className='mx-auto mt-6 flex max-w-5xl justify-between'>
                            <button
                                onClick={() =>
                                    activeProjectIndex === 0
                                        ? showOverview()
                                        : navigateToProject(activeProjectIndex - 1)
                                }
                                className={clsx(
                                    'min-h-11 px-3 sm:px-4 py-2 rounded-lg font-medium text-xs sm:text-sm transition-all duration-200 flex items-center gap-1 motion-reduce:transition-none',
                                    'focus:outline-none focus:ring-2 focus:ring-brandGreen-500/50',
                                    'bg-brandGray-800 text-white hover:bg-brandGray-700 active:bg-brandGray-800 active:text-white'
                                )}
                            >
                                <svg
                                    xmlns='http://www.w3.org/2000/svg'
                                    className='h-4 w-4 sm:h-5 sm:w-5'
                                    viewBox='0 0 20 20'
                                    fill='currentColor'
                                >
                                    <path
                                        fillRule='evenodd'
                                        d='M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z'
                                        clipRule='evenodd'
                                    />
                                </svg>
                                {activeProjectIndex === 0
                                    ? 'Overview'
                                    : 'Previous Project'}
                            </button>

                            <button
                                onClick={() =>
                                    navigateToProject(activeProjectIndex + 1)
                                }
                                disabled={activeProjectIndex === PROJECTS.length - 1}
                                className={clsx(
                                    'min-h-11 px-3 sm:px-4 py-2 rounded-lg font-medium text-xs sm:text-sm transition-all duration-200 flex items-center gap-1 motion-reduce:transition-none',
                                    'focus:outline-none focus:ring-2 focus:ring-brandGreen-500/50',
                                    activeProjectIndex === PROJECTS.length - 1
                                        ? 'bg-brandGray-800 text-brandGray-600 cursor-not-allowed'
                                        : 'bg-brandGray-800 text-white hover:bg-brandGray-700 active:bg-brandGray-800 active:text-white'
                                )}
                            >
                                <span>Next Project</span>
                                <svg
                                    xmlns='http://www.w3.org/2000/svg'
                                    className='h-4 w-4 sm:h-5 sm:w-5'
                                    viewBox='0 0 20 20'
                                    fill='currentColor'
                                >
                                    <path
                                        fillRule='evenodd'
                                        d='M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z'
                                        clipRule='evenodd'
                                    />
                                </svg>
                            </button>
                        </div>
                        
                        {/* Unified Project Chat - shown on all screen sizes */}
                        <div className='mt-8 lg:mx-auto lg:max-w-5xl'>
                            <UnifiedProjectChat />
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}
