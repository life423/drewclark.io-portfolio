import React, { useRef, useState, useEffect } from 'react'
import { LuTwitter, LuGithub } from 'react-icons/lu'
import useIntersection from '../../hooks/useIntersection'
import clsx from 'clsx'
import './footer.css'

export default function Footer() {
    const containerRef = useRef(null)
    const inView = useIntersection(containerRef, { threshold: 0.1 })

    // Animation state
    const [animateTwitter, setAnimateTwitter] = useState(false)
    const [animateGithub, setAnimateGithub] = useState(false)

    // State to manage copy-to-clipboard feedback
    const [copySuccess, setCopySuccess] = useState(false)

    useEffect(() => {
        if (inView) {
            setAnimateTwitter(true)
            setTimeout(() => setAnimateGithub(true), 800)
        } else {
            setAnimateTwitter(false)
            setAnimateGithub(false)
        }
    }, [inView])

    const currentYear = new Date().getFullYear()
    const email = 'drew@drewclark.io'

    // Copy email to clipboard and show feedback briefly
    const handleCopyEmail = async () => {
        try {
            await navigator.clipboard.writeText(email)
            setCopySuccess(true)
            setTimeout(() => setCopySuccess(false), 2000) // Hide message after 2s
        } catch (err) {
            console.error('Failed to copy text:', err)
        }
    }

    return (
        <footer ref={containerRef} className='portfolio-footer'>
            <div className='portfolio-footer__inner'>
                {/* Single row layout on all screen sizes */}
                <div className='flex flex-row justify-between items-center'>
                    {/* Left side: icons with reduced spacing */}
                    <div className='flex gap-2'>
                        {/* Twitter Icon - same color/animation */}
                        <a
                            href='https://twitter.com/andrewgenai'
                            target='_blank'
                            rel='noopener noreferrer'
                            aria-label='Drew Clark on Twitter'
                            className='relative grid min-h-11 min-w-11 place-items-center'
                        >
                            <LuTwitter
                                aria-hidden='true'
                                className={clsx(
                                    'h-6 w-6 fill-current text-brandGreen-500',
                                    animateTwitter &&
                                        'animate-icon-gentle-pulse'
                                )}
                            />
                        </a>

                        {/* GitHub Icon - same color/animation */}
                        <a
                            href='https://github.com/life423'
                            target='_blank'
                            rel='noopener noreferrer'
                            aria-label='Drew Clark on GitHub'
                            className='relative grid min-h-11 min-w-11 place-items-center'
                        >
                            <LuGithub
                                aria-hidden='true'
                                className={clsx(
                                    'h-6 w-6 fill-current text-brandGreen-500',
                                    animateGithub && 'animate-icon-gentle-pulse'
                                )}
                            />
                        </a>
                    </div>

                    {/* Right side with consistent text sizing */}
                    <div className='flex flex-col items-end text-right'>
                        {/* 1) Clickable 'Copy Email' text */}
                        <button
                            onClick={handleCopyEmail}
                            className="text-sm font-semibold no-underline hover:no-underline active:no-underline focus:outline-none">

                            {email}
                        </button>

                        {/* 2) Feedback message that appears briefly */}
                        {copySuccess && (
                            <span className='text-xs font-semibold'>
                                Copied
                            </span>
                        )}

                        {/* 3) Copyright */}
                        <div className='text-sm'>
                            &copy; {currentYear} Drew Clark
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    )
}
