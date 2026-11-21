/* eslint react/jsx-uses-react: "error", react/jsx-uses-vars: "error" */
import React from 'react'
import ProjectImage from './ProjectImage'
import ProjectLinks from './ProjectLinks'
import ProjectNextButton from './ProjectNextButton'
import UnifiedProjectChat from './UnifiedProjectChat'

export default function ProjectCaseStudy({ project, projectNumber, totalProjects, nextTitle, onNext, onOverview }) {
    const { title, summary, image, imageAlt, imageWidth, imageHeight, liveUrl, liveLabel, repo, downloads,
        stack, initialDescription, detailedDescription, challenges, technicalDetails, highlights } = project
    return (
        <article aria-labelledby='case-study-title' className='rounded-2xl border border-brandGray-700 bg-brandGray-800 p-4 sm:p-6 lg:p-8'>
            <nav aria-label='Case study navigation' className='mb-4 flex flex-wrap items-center justify-between gap-2'>
                <button type='button' onClick={onOverview} className='min-h-11 rounded-lg px-2 text-sm font-semibold text-brandGray-300 hover:text-brandGreen-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-brandGreen-300'>
                    ← All projects
                </button>
                <ProjectNextButton onClick={onNext} nextTitle={nextTitle} />
            </nav>
            <div className='grid items-start gap-5 lg:grid-cols-[minmax(0,1.28fr)_minmax(0,1fr)] lg:gap-x-7'>
                <header data-testid='case-study-summary' className='min-w-0 lg:col-start-1 lg:row-start-1'>
                    <p className='mb-2 text-xs font-semibold uppercase tracking-wider text-brandGray-400'>Case study {projectNumber} of {totalProjects}</p>
                    <h2 id='case-study-title' className='text-2xl font-semibold text-brandGreen-300 sm:text-3xl'>{title}</h2>
                    <p className='mt-2 leading-relaxed text-brandGray-200'>{summary}</p>
                    <ProjectLinks title={title} liveUrl={liveUrl} liveLabel={liveLabel} repo={repo} downloads={downloads} />
                </header>
                <aside aria-label='Ask about this case study' className='min-w-0 lg:col-start-2 lg:row-span-2 lg:row-start-1'>
                    <UnifiedProjectChat project={project} embedded />
                </aside>
                <div className='min-w-0 lg:col-start-1 lg:row-start-2'>
                    <ProjectImage image={image} imageAlt={imageAlt} imageWidth={imageWidth} imageHeight={imageHeight} title={title} />
                </div>
            </div>
            <section aria-labelledby='case-study-details' className='mt-4 border-t border-brandGray-700 pt-5 sm:mt-6 sm:pt-6'>
                <h3 id='case-study-details' className='text-lg font-semibold text-brandGreen-300'>Project details</h3>
                <ul aria-label='Technology stack' className='mt-3 flex flex-wrap gap-2 text-xs text-brandGray-200'>
                    {stack.map(tech => <li key={tech} className='rounded-full bg-brandGray-700 px-2.5 py-1'>{tech}</li>)}
                </ul>
                <div className='prose prose-sm prose-invert mt-4 max-w-none prose-headings:text-brandGreen-300'>
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
