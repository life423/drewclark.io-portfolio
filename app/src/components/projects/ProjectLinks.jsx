import React from 'react'
import { LuPlay, LuGithub } from 'react-icons/lu'
import { platformIcon, downloadTitle, downloadAriaLabel } from './platforms'

/**
 * A project's actions: try it live (when it has a public URL) and view the
 * source on GitHub. They sit in the card header so they stay in view while the
 * long description scrolls underneath.
 *
 * These use viewport breakpoints (sm:) rather than the card's @sm: container
 * queries, because @tailwindcss/container-queries isn't installed.
 */
const base =
    'inline-flex flex-1 sm:flex-none items-center justify-center gap-2 whitespace-nowrap ' +
    'rounded-full px-3 sm:px-4 min-h-[2.75rem] sm:min-h-[2.5rem] text-sm font-semibold ' +
    'transition-colors duration-200 motion-reduce:transition-none touch-manipulation ' +
    'focus:outline-none focus-visible:ring-2 focus-visible:ring-brandGreen-300 ' +
    'focus-visible:ring-offset-2 focus-visible:ring-offset-brandGray-800'

// Primary: the brand green is a light value, so dark text on it reads at about 9:1
// (white on the same green is under 3:1 and fails AA at this size)
const primary =
    'bg-brandGreen-400 text-brandGray-900 shadow-md shadow-brandGreen-500/20 ' +
    'hover:bg-brandGreen-300 hover:shadow-lg hover:shadow-brandGreen-400/25 active:bg-brandGreen-500'

// Secondary: outlined and low-chroma so it reads as the quieter option.
// brandGray-500 is the lightest border that still clears 3:1 against the card.
const secondary =
    'border border-brandGray-500 text-brandGray-200 bg-transparent ' +
    'hover:border-brandGreen-400/70 hover:text-brandGreen-300 hover:bg-brandGreen-900/20 ' +
    'active:bg-brandGreen-900/30'

// The card can be clickable; following a link should not also count as a card click
const stopCardClick = event => event.stopPropagation()

export default function ProjectLinks({ title, liveUrl, liveLabel = 'Try it live', repo, downloads = [] }) {
    const files = Array.isArray(downloads) ? downloads : []
    if (!liveUrl && !repo && files.length === 0) return null

    return (
        <div className='flex flex-wrap items-center gap-2 sm:gap-3 mt-3 sm:mt-4'>
            {liveUrl && (
                <a
                    href={liveUrl}
                    target='_blank'
                    rel='noopener noreferrer'
                    onClick={stopCardClick}
                    aria-label={`${liveLabel}: ${title} (opens in a new tab)`}
                    className={`${base} ${primary}`}
                >
                    <LuPlay className='h-4 w-4 shrink-0' aria-hidden='true' />
                    <span>{liveLabel}</span>
                </a>
            )}
            {files.length > 0 && (
                <div className='flex items-center gap-2 sm:gap-3'>
                    <span className='text-sm text-brandGray-400'>Download</span>
                    {files.map(file => {
                        const Icon = platformIcon(file.platform)
                        return (
                            <a
                                key={file.url}
                                href={file.url}
                                onClick={stopCardClick}
                                title={downloadTitle(file)}
                                aria-label={downloadAriaLabel(title, file)}
                                className={base + ' ' + primary}
                            >
                                <Icon className='h-4 w-4 shrink-0' aria-hidden='true' />
                                <span>{file.label}</span>
                            </a>
                        )
                    })}
                </div>
            )}
            {repo && (
                <a
                    href={`https://github.com/${repo}`}
                    target='_blank'
                    rel='noopener noreferrer'
                    onClick={stopCardClick}
                    aria-label={`View the ${title} source code on GitHub (opens in a new tab)`}
                    className={`${base} ${secondary}`}
                >
                    <LuGithub className='h-4 w-4 shrink-0' aria-hidden='true' />
                    <span>View code</span>
                </a>
            )}
        </div>
    )
}
