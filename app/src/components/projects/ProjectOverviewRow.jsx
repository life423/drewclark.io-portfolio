import React from 'react'
import {
    LuBrain,
    LuCpu,
    LuGamepad2,
    LuGithub,
    LuGlobe,
    LuKeyRound,
    LuLock,
    LuMonitor,
    LuPlay,
    LuRadio,
    LuSmartphone,
    LuUsers,
} from 'react-icons/lu'
import { platformIcon, downloadTitle, downloadAriaLabel } from './platforms'

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

const ACTION =
    'relative z-10 inline-flex h-9 shrink-0 items-center justify-center rounded-full ' +
    'text-sm font-semibold transition-colors duration-200 motion-reduce:transition-none ' +
    'focus:outline-none focus-visible:ring-2 focus-visible:ring-brandGreen-300 ' +
    'focus-visible:ring-offset-2 focus-visible:ring-offset-brandGray-800'

// Primary action: dark text on the brand green reads at about 9:1 (white would be under 3:1)
const PLAY =
    ACTION + ' gap-2 px-4 bg-brandGreen-400 text-brandGray-900 shadow-md shadow-brandGreen-500/20 ' +
    'hover:bg-brandGreen-300 hover:shadow-lg hover:shadow-brandGreen-400/25 active:bg-brandGreen-500'

// Secondary action: outlined, in the gray that clears 3:1 against the card
const CODE =
    ACTION + ' w-9 border border-brandGray-500 text-brandGray-200 ' +
    'hover:border-brandGreen-400/70 hover:bg-brandGreen-900/20 hover:text-brandGreen-300'

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
    const files = Array.isArray(project.downloads) ? project.downloads : []
    const extraPills = project.stack.length - MAX_PILLS
    // Games get the play button; anything else says what the link does (e.g. "Visit the site")
    const liveLabel = project.liveLabel || 'Play'
    const isPlay = liveLabel.startsWith('Play')

    return (
        <article
            className='group relative flex h-full flex-col gap-4 rounded-xl border border-brandGray-700 bg-gradient-to-br from-brandGray-800 to-brandGray-800/90 p-3 transition-all duration-300 hover:border-brandGray-600 hover:shadow-[0_4px_12px_-2px_rgba(11,163,112,0.12)] focus-within:ring-2 focus-within:ring-brandGreen-400/60 sm:flex-row sm:p-4 lg:gap-6 lg:p-5'
        >
            {/* Thumbnail */}
            <div className='aspect-[16/10] w-full shrink-0 overflow-hidden rounded-lg border border-brandGray-700/60 bg-brandGray-900 sm:aspect-auto sm:w-44 sm:self-stretch lg:w-56'>
                <Thumbnail project={project} />
            </div>

            {/* Title, tagline, facts, stack */}
            <div className='min-w-0 flex-1'>
                <span className='inline-block rounded-md border border-brandOrange-800/30 bg-brandOrange-900/30 px-2 py-0.5 text-xs font-semibold text-brandOrange-400 shadow-sm'>
                    #{index + 1}
                </span>
                <h4 className='mt-2 text-lg font-semibold text-white lg:text-xl'>
                    <button type='button' onClick={onOpen} className={ROW_BUTTON}>
                        {project.title}
                    </button>
                </h4>
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
                    {/* Actions: under the text, where they can wrap instead of squeezing it */}
                {(project.liveUrl || project.repo || files.length > 0) && (
                    <div className='mt-4 flex flex-wrap items-center gap-2'>
                        {project.liveUrl && (
                            <a
                                href={project.liveUrl}
                                target='_blank'
                                rel='noopener noreferrer'
                                aria-label={liveLabel + ': ' + project.title + ' (opens in a new tab)'}
                                className={PLAY}
                            >
                                {isPlay ? <LuPlay className='h-4 w-4 fill-current' aria-hidden='true' /> : <LuGlobe className='h-4 w-4' aria-hidden='true' />}
                                {liveLabel}
                            </a>
                        )}
                        {files.map(file => {
                            const Icon = platformIcon(file.platform)
                            return (
                                <a
                                    key={file.url}
                                    href={file.url}
                                    title={downloadTitle(file)}
                                    aria-label={downloadAriaLabel(project.title, file)}
                                    className={PLAY}
                                >
                                    <Icon className='h-4 w-4' aria-hidden='true' />
                                    {file.label}
                                </a>
                            )
                        })}
                        {project.repo && (
                            <a
                                href={'https://github.com/' + project.repo}
                                target='_blank'
                                rel='noopener noreferrer'
                                title='Source code on GitHub'
                                aria-label={'View the ' + project.title + ' source code on GitHub (opens in a new tab)'}
                                className={CODE}
                            >
                                <LuGithub className='h-5 w-5' aria-hidden='true' />
                            </a>
                        )}
                    </div>
                )}
            </div>

        </article>
    )
}
