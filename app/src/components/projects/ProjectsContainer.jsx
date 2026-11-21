/* eslint react/jsx-uses-react: "error", react/jsx-uses-vars: "error" */
import React, { useState, useEffect, useRef, useCallback } from 'react'
import ProjectCard from './ProjectCard'
import ProjectCaseStudy from './ProjectCaseStudy'
import ProjectOverviewRow from './ProjectOverviewRow'
import UnifiedProjectChat from './UnifiedProjectChat'
// Also read by the API to build the chat prompt (api/services/ai/promptBuilder.js)
import PROJECTS from '../../data/projects.json'

export default function ProjectsContainer() {
    const [started, setStarted] = useState(false)
    const [activeProjectIndex, setActiveProjectIndex] = useState(0)

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
    }, [started, activeProjectIndex, scrollToProjects])

    const showProject = index => {
        scrollAfterRender.current = true
        setStarted(true)
        setActiveProjectIndex(index)
    }

    // Going back is the same swap in reverse: land on the overview panel, not mid-page
    const showOverview = () => {
        scrollAfterRender.current = true
        setStarted(false)
    }

    const handleStart = () => {
        showProject(activeProjectIndex)
    }

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

                            <div className='mb-4'>
                                <UnifiedProjectChat />
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

                </div>
            </section>
        )
    }

    const currentProject = PROJECTS[activeProjectIndex]
    const nextIndex = (activeProjectIndex + 1) % PROJECTS.length

    return (
        <section className='relative bg-gradient-to-b from-brandGreen-950/90 via-brandGreen-900/95 to-brandGreen-900 px-4 py-10 sm:py-16'>
            <div ref={projectsTopRef} className='mx-auto w-full max-w-6xl scroll-mt-20'>
                <ProjectCaseStudy
                    project={currentProject}
                    projectNumber={activeProjectIndex + 1}
                    totalProjects={PROJECTS.length}
                    onOverview={showOverview}
                    onNext={() => showProject(nextIndex)}
                    nextTitle={PROJECTS[nextIndex].title}
                />
                <section aria-labelledby='related-projects-title' className='mt-8'>
                    <h2 id='related-projects-title' className='mb-3 text-lg font-semibold text-brandGreen-300'>Related projects</h2>
                    <div className='grid gap-3 sm:grid-cols-2 lg:grid-cols-3'>
                        {PROJECTS.map((project, index) => index !== activeProjectIndex && (
                            <button
                                key={project.id}
                                type='button'
                                aria-label={'View ' + project.title + ' details'}
                                className='h-full rounded-xl text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brandGreen-300'
                                onClick={() => showProject(index)}
                            >
                                <ProjectCard
                                    projectNumber={index + 1}
                                    title={project.title}
                                    image={project.cardImage?.src || project.image}
                                    imageAlt={project.cardImage?.alt || project.imageAlt}
                                    imageWidth={project.cardImage?.width || project.imageWidth}
                                    imageHeight={project.cardImage?.height || project.imageHeight}
                                    tagline={project.tagline}
                                    summary={project.summary}
                                    isCompact
                                />
                            </button>
                        ))}
                    </div>
                </section>
            </div>
        </section>
    )
}
