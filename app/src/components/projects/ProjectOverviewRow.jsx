/* eslint react/jsx-uses-react: "error", react/jsx-uses-vars: "error" */
import React from 'react'
import {
    LuBrain,
    LuCpu,
    LuGamepad2,
    LuGlobe,
    LuKeyRound,
    LuLock,
    LuMonitor,
    LuRadio,
    LuSmartphone,
    LuUsers,
} from 'react-icons/lu'
import ProjectLinks from './ProjectLinks'

// Icons a project's facts can name in projects.json
const FACT_ICONS = {
    brain: LuBrain,
    cpu: LuCpu,
    gamepad: LuGamepad2,
    globe: LuGlobe,
    key: LuKeyRound,
    lock: LuLock,
    monitor: LuMonitor,
    radio: LuRadio,
    smartphone: LuSmartphone,
    users: LuUsers,
}

const MAX_PILLS = 3

// The row is one big target: this button's hit area stretches over the whole card (the card is
// position: relative), so the project opens from mouse, touch and keyboard. The links in the
// action column sit above it (z-10) as controls of their own, nothing nested inside anything.
const ROW_BUTTON = "block w-full text-left focus:outline-none after:absolute after:inset-0 after:rounded-xl after:content-['']"

function Thumbnail({ project }) {
    const image = project.cardImage?.src || project.image
    if (image) {
        return (
            <img
                src={image}
                alt={project.cardImage?.alt || project.imageAlt || ''}
                width={project.cardImage?.width || project.imageWidth || 560}
                height={project.cardImage?.height || project.imageHeight || 350}
                loading='lazy'
                decoding='async'
                className='h-full w-full object-cover'
                style={{ objectPosition: project.cardImage ? 'center' : project.imagePosition || 'center' }}
            />
        )
    }
    // Until a project has a screenshot: a quiet tile built from its first fact's icon
    const Icon = FACT_ICONS[project.facts?.[0]?.icon] || LuMonitor
    return (
        <div
            className='flex h-full w-full items-center justify-center bg-gradient-to-br from-brandGray-800 via-brandGray-900 to-brandGray-900'
            style={{
                backgroundImage:
                    'radial-gradient(rgba(16,185,129,0.14) 1px, transparent 1px), linear-gradient(135deg, #27272A 0%, #18181B 60%, #18181B 100%)',
                backgroundSize: '18px 18px, 100% 100%',
            }}
        >
            <Icon className='h-10 w-10 text-brandGreen-400/80' aria-hidden='true' />
        </div>
    )
}

export default function ProjectOverviewRow({ project, index, onOpen }) {
    const facts = Array.isArray(project.facts) ? project.facts : []
    const extraPills = project.stack.length - MAX_PILLS
    return (
        <article
            className='work-gallery-card group relative'
        >
            {/* Thumbnail */}
            <div className='work-gallery-art'>
                <Thumbnail project={project} />
            </div>

            {/* Title, tagline, facts, stack */}
            <div className='work-gallery-copy'>
                <span className='work-gallery-number'>
                    {'Project ' + String(index + 1).padStart(2, '0')}
                </span>
                <h3 className='mt-2 text-lg font-semibold leading-snug text-white sm:text-xl'>
                    <button type='button' onClick={onOpen} className={ROW_BUTTON}>
                        {project.title}
                    </button>
                </h3>
                {project.tagline && <p className='mt-1 text-sm text-brandGray-300'>{project.tagline}</p>}

                {facts.length > 0 && (
                    <ul className='mt-3 flex flex-wrap items-center gap-x-5 gap-y-1.5 text-sm text-brandGray-400'>
                        {facts.map(fact => {
                            const Icon = FACT_ICONS[fact.icon] || LuMonitor
                            return (
                                <li key={fact.label} className='inline-flex items-center gap-1.5'>
                                    <Icon className='h-4 w-4 shrink-0 text-brandGray-500' aria-hidden='true' />
                                    {fact.label}
                                </li>
                            )
                        })}
                    </ul>
                )}

                <div className='mt-3 flex flex-wrap gap-1.5'>
                    {project.stack.slice(0, MAX_PILLS).map(tech => (
                        <span
                            key={tech}
                            className='rounded-full border border-brandGray-700 bg-brandGray-700/70 px-2 py-0.5 text-[11px] font-medium text-brandGray-300'
                        >
                            {tech}
                        </span>
                    ))}
                    {extraPills > 0 && (
                        <span className='rounded-full border border-brandGray-700 bg-brandGray-700/70 px-2 py-0.5 text-[11px] font-medium text-brandGray-300'>
                            +{extraPills}
                        </span>
                    )}
                </div>
                <ProjectLinks
                    title={project.title}
                    liveUrl={project.liveUrl}
                    liveLabel={project.liveLabel || 'Play'}
                    repo={project.repo}
                    downloads={project.downloads}
                    compact
                />
            </div>

        </article>
    )
}
