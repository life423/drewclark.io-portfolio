/* eslint react/jsx-uses-react: "error", react/jsx-uses-vars: "error" */
import React from 'react'
import { LuChevronLeft } from 'react-icons/lu'
import ProjectImage from './ProjectImage'
import ProjectLinks from './ProjectLinks'
import ProjectNextButton from './ProjectNextButton'
import CaseStudyExplorer from './CaseStudyExplorer'

const STACK_TONES = [
    'border-brandGreen-700/60 bg-brandGreen-900/25 text-brandGreen-200',
    'border-brandBlue-700/60 bg-brandBlue-900/25 text-brandBlue-200',
    'border-brandOrange-700/60 bg-brandOrange-900/25 text-brandOrange-200',
]

export default function ProjectCaseStudy({ project, projectNumber, totalProjects, nextTitle, onNext, onOverview }) {
    const { title, summary, image, imageAlt, imageWidth, imageHeight, imageFraming, liveUrl, liveLabel, repo, downloads,
        stack, initialDescription, detailedDescription, challenges, technicalDetails, highlights } = project
    return (
        <article aria-labelledby='case-study-title' className='work-studio-grid work-studio-case' data-project-id={project.id}>
            <nav aria-label='Case study navigation' className='work-studio-nav flex flex-wrap items-center justify-between gap-2'>
                <button
                    type='button'
                    onClick={onOverview}
                    className='case-study-nav-action case-study-nav-action--overview'
                >
                    <LuChevronLeft className='case-study-nav-icon' aria-hidden='true' />
                    <span>All projects</span>
                </button>
                <ProjectNextButton onClick={onNext} nextTitle={nextTitle} />
            </nav>
            <header data-testid='case-study-summary' className='work-studio-intro'>
                <p className='work-studio-kicker'>Case study {projectNumber} of {totalProjects}</p>
                <h2 id='case-study-title' tabIndex={-1} className='work-studio-title'><span data-project-title className='work-studio-title-color inline-block'>{title}</span></h2>
                <p className='work-studio-summary'>{summary}</p>
                <ProjectLinks title={title} liveUrl={liveUrl} liveLabel={liveLabel} repo={repo} downloads={downloads} />
            </header>
            <CaseStudyExplorer project={project} />
            <div data-project-art className={`work-studio-media${imageFraming === 'cipher' ? ' work-studio-media--cipher' : ''}`}>
                <ProjectImage image={image} imageAlt={imageAlt} imageWidth={imageWidth} imageHeight={imageHeight} title={title} plain />
            </div>
            <section aria-labelledby='case-study-details' className='work-studio-depth'>
                <h3 id='case-study-details' className='text-xl font-semibold text-brandBlue-200'>Project details</h3>
                <ul aria-label='Technology stack' className='mt-3 flex flex-wrap gap-2 text-xs text-brandGray-200'>
                    {stack.map((tech, index) => <li key={tech} className={'rounded-full border px-2.5 py-1 ' + STACK_TONES[index % STACK_TONES.length]}>{tech}</li>)}
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
