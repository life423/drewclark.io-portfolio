/* eslint react/jsx-uses-react: "error", react/jsx-uses-vars: "error" */
import React from 'react'
import { LuChevronLeft } from 'react-icons/lu'
import ProjectImage from './ProjectImage'
import ProjectLinks from './ProjectLinks'
import ProjectNextButton from './ProjectNextButton'
import UnifiedProjectChat from './UnifiedProjectChat'

export default function ProjectCaseStudy({ project, projectNumber, totalProjects, nextTitle, onNext, onOverview }) {
    const { title, summary, image, imageAlt, imageWidth, imageHeight, liveUrl, liveLabel, repo, downloads,
        stack, initialDescription, detailedDescription, challenges, technicalDetails, highlights } = project
    return (
        <article aria-labelledby='case-study-title' className='work-studio-grid work-studio-case'>
            <nav aria-label='Case study navigation' className='work-studio-nav flex flex-wrap items-center justify-between gap-2'>
                <button
                    type='button'
                    onClick={onOverview}
                    className='inline-flex min-h-12 shrink-0 items-center gap-1 rounded-full border border-brandGreen-700/70 px-3 text-sm font-semibold text-brandGreen-200 hover:border-brandGreen-400 hover:bg-brandGreen-900/40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brandGreen-300'
                >
                    <LuChevronLeft className='h-5 w-5' aria-hidden='true' />
                    All projects
                </button>
                <ProjectNextButton onClick={onNext} nextTitle={nextTitle} />
            </nav>
            <header data-testid='case-study-summary' className='work-studio-intro'>
                <p className='work-studio-kicker'>Case study {projectNumber} of {totalProjects}</p>
                <h2 id='case-study-title' className='work-studio-title'><span className='work-studio-title-color'>{title}</span></h2>
                <p className='work-studio-summary'>{summary}</p>
                <ProjectLinks title={title} liveUrl={liveUrl} liveLabel={liveLabel} repo={repo} downloads={downloads} />
            </header>
            <aside aria-label='Ask about this case study' className='work-studio-rail'>
                <UnifiedProjectChat project={project} embedded />
            </aside>
            <div className='work-studio-media'>
                <ProjectImage image={image} imageAlt={imageAlt} imageWidth={imageWidth} imageHeight={imageHeight} title={title} plain />
            </div>
            <section aria-labelledby='case-study-details' className='work-studio-depth'>
                <h3 id='case-study-details' className='text-xl font-semibold text-brandBlue-200'>Project details</h3>
                <ul aria-label='Technology stack' className='mt-3 flex flex-wrap gap-2 text-xs text-brandGray-200'>
                    {stack.map(tech => <li key={tech} className='rounded-full border border-brandBlue-700/50 bg-brandBlue-900/20 px-2.5 py-1 text-brandBlue-200'>{tech}</li>)}
                </ul>
                <div className='prose prose-sm prose-invert mt-4 max-w-none prose-headings:text-brandBlue-200'>
                    {initialDescription && <p>{initialDescription}</p>}
                    {detailedDescription && detailedDescription !== initialDescription && <p>{detailedDescription}</p>}
                    {challenges && <><h4>The challenge</h4><p>{challenges}</p></>}
                    {technicalDetails && <><h4>Technical details</h4><p>{technicalDetails}</p></>}
                    {highlights?.length > 0 && (
                        <><h4>Key innovations</h4><ul>{highlights.map(item => <li key={item}>{item}</li>)}</ul></>
                    )}
                </div>
            </section>
        </article>
    )
}
