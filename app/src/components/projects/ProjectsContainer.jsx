/* eslint react/jsx-uses-react: "error", react/jsx-uses-vars: "error" */
import React, { Fragment, useState, useRef } from 'react'
import ProjectCard from './ProjectCard'
import ProjectCaseStudy from './ProjectCaseStudy'
import ProjectOverviewRow from './ProjectOverviewRow'
import UnifiedProjectChat from './UnifiedProjectChat'
import useProjectViewTransition from '../../hooks/useProjectViewTransition'
import './work-studio.css'
// Also read by the API to build the chat prompt (api/services/ai/promptBuilder.js)
import PROJECTS from '../../data/projects.json'

export default function ProjectsContainer() {
    const [started, setStarted] = useState(false)
    const [chatFocusRequest, setChatFocusRequest] = useState(0)
    const [activeProjectIndex, setActiveProjectIndex] = useState(0)

    const projectsTopRef = useRef(null)
    const galleryPosition = useRef(null)
    const changeView = useProjectViewTransition()
    const galleryCard = index => projectsTopRef.current?.querySelector(`.work-gallery-card[data-project-id="${PROJECTS[index].id}"]`)

    const showProject = (index, event) => {
        const from = !started ? galleryCard(index) : null
        if (from) galleryPosition.current = { y: window.scrollY, width: window.innerWidth, height: window.innerHeight }
        // Keep Next focused while cycling; cards whose controls unmount move
        // focus to the new title so keyboard readers keep their place.
        const keepNextFocus = started && document.activeElement?.matches('[data-project-next]')
        const keyboardFocus = event ? event.detail === 0 : document.activeElement?.matches(':focus-visible')
        changeView({
            from,
            update: () => { setStarted(true); setActiveProjectIndex(index) },
            place: () => {
                projectsTopRef.current?.scrollIntoView({ behavior: 'instant', block: 'start' })
                if (!keepNextFocus) {
                    const heading = projectsTopRef.current?.querySelector('#case-study-title')
                    heading?.setAttribute('data-navigation-focus', keyboardFocus ? 'keyboard' : 'pointer')
                    heading?.focus({ preventScroll: true })
                }
            },
            destination: () => projectsTopRef.current?.querySelector('.work-studio-case'),
        })
    }

    const showOverview = () => {
        changeView({
            from: projectsTopRef.current?.querySelector('.work-studio-case'),
            update: () => setStarted(false),
            place: () => {
                const card = galleryCard(activeProjectIndex)
                const saved = galleryPosition.current
                if (saved && saved.width === window.innerWidth && saved.height === window.innerHeight) {
                    window.scrollTo({ top: saved.y, behavior: 'instant' })
                } else {
                    card?.scrollIntoView({ behavior: 'instant', block: 'center' })
                }
                const button = card?.querySelector('button')
                button?.focus({ preventScroll: true })
                // After cycling projects or rotating, the current card may be
                // elsewhere in the gallery. Keep its keyboard action in view.
                button?.scrollIntoView({ behavior: 'instant', block: 'nearest' })
            },
            destination: () => galleryCard(activeProjectIndex),
        })
    }

    if (!started) {
        return (
            <section className='work-studio-section'>
                <div ref={projectsTopRef} className='work-studio-shell work-studio-grid work-studio-overview'>
                    <header className='work-studio-intro' data-testid='work-gallery-intro'>
                        <h2 className='work-studio-title'>My Portfolio Projects</h2>
                        <p className='work-studio-summary'>Try an app, explore the code, or open a project to see how it works.</p>
                    </header>
                    <aside className='work-studio-inline' aria-label='Ask about the portfolio code'>
                        <UnifiedProjectChat embedded collapseBelow={900} focusRequest={chatFocusRequest} />
                    </aside>
                    <div className='work-studio-after-chat'>
                        <div className='work-studio-gallery' aria-label='Project gallery'>
                            {PROJECTS.map((project, index) => (
                                <Fragment key={project.id}>
                                    <ProjectOverviewRow
                                        project={project}
                                        index={index}
                                        onOpen={event => showProject(index, event)}
                                    />
                                    {index === 1 && <div aria-hidden='true' className='work-gallery-divider' />}
                                </Fragment>
                            ))}
                        </div>
                        <div className='work-studio-shortcut'>
                            <button
                                type='button'
                                className='work-studio-return inline-flex min-h-11 items-center gap-3 rounded-full border border-brandGreen-700/70 bg-brandGreen-900/25 py-1.5 pl-4 pr-2 text-sm font-semibold text-brandGreen-200 transition-colors hover:border-brandGreen-400 hover:bg-brandGreen-900/55 hover:text-brandGreen-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brandGreen-300 motion-reduce:transition-none'
                                aria-controls='project-chat'
                                onClick={() => setChatFocusRequest(previous => previous + 1)}
                            >
                                Back to Code Explorer
                                <span aria-hidden='true' className='grid h-7 w-7 place-items-center rounded-full bg-brandGreen-400/15'>
                                    <svg viewBox='0 0 16 16' width='16' height='16' fill='none' focusable='false'>
                                        <path d='M8 13V3m0 0L4 7m4-4 4 4' stroke='currentColor' strokeWidth='1.5' strokeLinecap='round' strokeLinejoin='round' />
                                    </svg>
                                </span>
                            </button>
                        </div>
                    </div>
                </div>
            </section>
        )
    }

    const currentProject = PROJECTS[activeProjectIndex]
    const nextIndex = (activeProjectIndex + 1) % PROJECTS.length

    return (
        <section className='work-studio-section'>
            <div ref={projectsTopRef} className='work-studio-shell'>
                <ProjectCaseStudy
                    project={currentProject}
                    projectNumber={activeProjectIndex + 1}
                    totalProjects={PROJECTS.length}
                    onOverview={showOverview}
                    onNext={event => showProject(nextIndex, event)}
                    nextTitle={PROJECTS[nextIndex].title}
                />
                <section aria-labelledby='related-projects-title' className='mt-10 border-t border-emerald-400/15 pt-7 sm:mt-14'>
                    <h2 id='related-projects-title' className='mb-3 text-lg font-semibold text-brandGreen-300'>Related projects</h2>
                    <div className='grid gap-3 sm:grid-cols-2 lg:grid-cols-3'>
                        {PROJECTS.map((project, index) => index !== activeProjectIndex && (
                            <button
                                key={project.id}
                                type='button'
                                aria-label={'View ' + project.title + ' details'}
                                className='h-full rounded-xl text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brandGreen-300'
                                onClick={event => showProject(index, event)}
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
