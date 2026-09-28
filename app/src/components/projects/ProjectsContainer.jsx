 import React, { useState, useEffect } from 'react'
import ProjectCard from './ProjectCard'
import UnifiedProjectChat from './UnifiedProjectChat'
import clsx from 'clsx'
import PrimaryButton from '../utils/PrimaryButton'
// Also read by the API to build the chat prompt (api/services/ai/promptBuilder.js)
import PROJECTS from '../../data/projects.json'


export default function ProjectsContainer() {
    const [started, setStarted] = useState(false)
    const [activeProjectIndex, setActiveProjectIndex] = useState(0)
    const [featuredProjectIndex, setFeaturedProjectIndex] = useState(0) // For magazine-style desktop layout
    const [transitionDirection, setTransitionDirection] = useState(null)

    const handleStart = () => {
        setStarted(true)
    }

    const navigateToProject = index => {
        if (index < 0 || index >= PROJECTS.length) return

        setTransitionDirection(index > activeProjectIndex ? 'next' : 'prev')
        setActiveProjectIndex(index)
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
                    <div className='my-4 sm:my-6 md:my-8 overflow-hidden rounded-xl shadow-[0_0_20px_-5px_rgba(16,185,129,0.15)] bg-brandGray-800 border border-brandGray-700 transform transition-all duration-300 hover:shadow-xl hover:border-brandGray-600 flex flex-col min-h-[500px] lg:h-[700px]'>
                        {}
                        <div className='p-3 sm:p-4 md:p-5 border-b border-brandGray-700 bg-gradient-to-r from-brandGray-800 via-brandGray-800 to-brandBlue-900/10'>
                            <div className='flex items-center justify-between mb-2'>
                                <span className='text-sm font-semibold text-white px-2 py-1 rounded-md bg-gradient-to-r from-brandOrange-700 to-brandOrange-600 shadow-sm'>
                                    Overview
                                </span>
                            </div>

                            <h1 className='text-xl sm:text-2xl font-bold text-brandGreen-300 mb-1'>
                                My Portfolio Projects
                            </h1>
                        </div>

                        <div className='p-3 sm:p-4 md:p-5 flex-1 flex flex-col'>
                            {/* Welcome text - shown on all screen sizes */}
                            <div className='prose prose-sm prose-invert max-w-none mb-3 sm:mb-4 md:mb-6 lg:mb-3'>
                                <p>
                                    Welcome to an interactive journey through my
                                    portfolio projects. Rather than a simple
                                    list, I've created an experience that guides
                                    you through each of my key projects.
                                </p>
                                <p>
                                    Each project reveals the challenges,
                                    solutions, and technologies behind my work.
                                    And you can ask questions along the way to
                                    dive deeper into any aspect that interests
                                    you.
                                </p>
                            </div>

                            {/* Project list - consistent card style across all screen sizes */}
                            <div className='block lg:flex-grow'>
                                <h3 className='text-brandGray-400 uppercase text-xs tracking-wider mb-2 font-medium'>
                                    Projects Overview
                                </h3>
                                
                                {/* Show grid of cards on all screen sizes except small mobile */}
                                <div className='hidden sm:grid sm:grid-cols-3 lg:grid-cols-1 gap-3 lg:gap-2 mb-4 lg:mb-1'>
                                    {PROJECTS.map((project, index) => (
                                        <div 
                                            key={index}
                                            onClick={() => {
                                                setStarted(true);
                                                setActiveProjectIndex(index);
                                                setFeaturedProjectIndex(index);
                                            }}
                                            className='transition-all duration-300 cursor-pointer p-3 lg:p-2.5 rounded-lg border bg-gradient-to-br from-brandGray-800 to-brandGray-800/90 border-brandGray-700 hover:border-brandGray-600 hover:shadow-[0_4px_12px_-2px_rgba(11,163,112,0.12)] hover:translate-y-[-1px]'
                                        >
                                            <div className='flex items-center justify-between'>
                                                <span className='text-xs font-semibold text-brandOrange-400 px-2 py-0.5 rounded-md bg-brandOrange-900/30 border border-brandOrange-800/30 shadow-sm'>
                                                    #{index + 1}
                                                </span>
                                                <div className='w-2 h-2 rounded-full bg-gradient-to-r from-brandGreen-500 to-brandGreen-400 opacity-60'></div>
                                            </div>
                                            <h4 className='font-medium text-white mt-2 text-sm truncate'>
                                                {project.title}
                                            </h4>
                                            <div className='flex flex-wrap gap-1 mt-2'>
                                                {project.stack.slice(0, 2).map((tech, techIndex) => (
                                                    <span
                                                        key={techIndex}
                                                        className='text-[10px] font-medium text-brandGray-300 px-1.5 py-0.5 rounded-full bg-brandGray-700/70 border border-brandGray-700'
                                                    >
                                                        {tech}
                                                    </span>
                                                ))}
                                                {project.stack.length > 2 && (
                                                    <span className='text-[10px] font-medium text-brandGray-300 px-1.5 py-0.5 rounded-full bg-brandGray-700/70 border border-brandGray-700'>
                                                        +{project.stack.length - 2}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                
                                {/* On mobile - show more compact horizontal cards */}
                                <div className='sm:hidden grid grid-cols-1 gap-2 mb-4'>
                                    {PROJECTS.map((project, index) => (
                                        <div 
                                            key={index}
                                            onClick={() => {
                                                setStarted(true);
                                                setActiveProjectIndex(index);
                                                setFeaturedProjectIndex(index);
                                            }}
                                            className='transition-all duration-300 cursor-pointer p-2 rounded-lg border bg-gradient-to-r from-brandGray-800 to-brandGray-800/90 border-brandGray-700 hover:border-brandGray-600'
                                        >
                                            <div className='flex items-center justify-between'>
                                                <div className='flex items-center gap-2'>
                                                    <span className='text-xs font-semibold text-brandOrange-400 px-2 py-0.5 rounded-md bg-brandOrange-900/30 border border-brandOrange-800/30 shadow-sm'>
                                                        #{index + 1}
                                                    </span>
                                                    <h4 className='font-medium text-white text-sm'>
                                                        {project.title}
                                                    </h4>
                                                </div>
                                                <div className='w-2 h-2 rounded-full bg-gradient-to-r from-brandGreen-500 to-brandGreen-400 opacity-60 flex-shrink-0'></div>
                                            </div>
                                            <div className='flex flex-wrap gap-1 mt-2 ml-7'>
                                                {project.stack.slice(0, 2).map((tech, techIndex) => (
                                                    <span
                                                        key={techIndex}
                                                        className='text-[10px] font-medium text-brandGray-300 px-1.5 py-0.5 rounded-full bg-brandGray-700/70 border border-brandGray-700'
                                                    >
                                                        {tech}
                                                    </span>
                                                ))}
                                                {project.stack.length > 2 && (
                                                    <span className='text-[10px] font-medium text-brandGray-300 px-1.5 py-0.5 rounded-full bg-brandGray-700/70 border border-brandGray-700'>
                                                        +{project.stack.length - 2}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
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
                        <UnifiedProjectChat projectsData={PROJECTS} />
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
                    <div className='w-full'>
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
                                        </div>
                                        <h2 className='text-xl font-bold mb-1 text-transparent bg-clip-text bg-gradient-to-r from-brandGreen-300 via-brandGreen-200 to-brandGreen-300'>
                                            {PROJECTS[activeProjectIndex].title}
                                        </h2>
                                    </div>
                                    
                                    
                                    {/* Project Content */}
                                    <div className='p-3 sm:p-4 md:p-5'>
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
                                            onClick={() => setStarted(false)}
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
                        
                        {/* On desktop - implement magazine-style layout with 2/3 + 1/3 split */}
                        <div className='hidden lg:block relative'>
                            {/* Magazine-style layout with featured project (2/3) and stacked projects (1/3) */}
                            <div className='grid grid-cols-3 gap-6'>
                                {/* Featured project (2/3 width) */}
                                <div className='col-span-2 transition-all duration-300'>
                                    <ProjectCard
                                        projectNumber={featuredProjectIndex + 1}
                                        title={PROJECTS[featuredProjectIndex].title}
                                        summary={PROJECTS[featuredProjectIndex].summary}
                                        stack={PROJECTS[featuredProjectIndex].stack}
                                        initialDescription={PROJECTS[featuredProjectIndex].initialDescription}
                                        detailedDescription={PROJECTS[featuredProjectIndex].detailedDescription}
                                        technicalDetails={PROJECTS[featuredProjectIndex].technicalDetails}
                                        challenges={PROJECTS[featuredProjectIndex].challenges}
                                        readme={PROJECTS[featuredProjectIndex].readme}
                                        totalProjects={PROJECTS.length}
                                        onNavigateToProject={(newIndex) => {
                                            if (newIndex === -1) {
                                                setStarted(false);
                                            } else if (newIndex >= 0) {
                                                setFeaturedProjectIndex(newIndex);
                                            }
                                        }}
                                        hideToc={true}
                                        isActive={true}
                                        isExpanded={true}
                                    />
                                </div>
                                
                                {/* Stacked projects (1/3 width) */}
                                <div className='flex flex-col gap-6'>
                                    {/* Stacked Project Cards - show only projects that aren't featured */}
                                    {PROJECTS.map((project, index) => 
                                        index !== featuredProjectIndex && (
                                            <div 
                                                key={project.id}
                                                className="transition-all duration-300 cursor-pointer h-[320px]"
                                                onClick={() => setFeaturedProjectIndex(index)}
                                            >
                                                <ProjectCard
                                                    projectNumber={index + 1}
                                                    title={project.title}
                                                    summary={project.summary}
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

                        {/* No desktop navigation buttons as per requirements */}

                        {/* Mobile/Tablet Navigation Controls */}
                        <div className='flex lg:hidden justify-between mt-6'>
                            <button
                                onClick={() =>
                                    activeProjectIndex === 0
                                        ? setStarted(false)
                                        : navigateToProject(activeProjectIndex - 1)
                                }
                                className={clsx(
                                    'px-2 sm:px-4 py-1.5 sm:py-2 rounded-lg font-medium text-xs sm:text-sm transition-all duration-200 flex items-center gap-1',
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
                                    'px-2 sm:px-4 py-1.5 sm:py-2 rounded-lg font-medium text-xs sm:text-sm transition-all duration-200 flex items-center gap-1',
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
                        <div className='mt-8 lg:mt-12'>
                            <UnifiedProjectChat projectsData={PROJECTS} />
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}
