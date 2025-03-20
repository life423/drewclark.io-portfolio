import React, { useRef, useState, useEffect } from 'react'
import { LuTwitter, LuGithub } from 'react-icons/lu'
import useIntersection from '../../hooks/useIntersection'
import clsx from 'clsx'

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
        <footer ref={containerRef} className='bg-brandGray-900 text-white'>
            <div className='py-8 px-6'>
                {/* Single row layout on all screen sizes */}
                <div className='flex flex-row justify-between items-center'>
                    {/* Left side: icons with reduced spacing */}
                    <div className='flex space-x-6'>
                        {/* Twitter Icon - same color/animation */}
                        <a
                            href='https://twitter.com/andrewgenai'
                            target='_blank'
                            rel='noopener noreferrer'
                            className='relative inline-block'
                        >
                            <LuTwitter
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
                            className='relative inline-block'
                        >
                            <LuGithub
                                className={clsx(
                                    'h-6 w-6 fill-current text-brandGreen-500',
                                    animateGithub && 'animate-icon-gentle-pulse'
                                )}
                            />
                        </a>
                    </div>

                    {/* Right side with consistent text sizing */}
                    <div className='flex flex-col items-end text-right space-y-1'>
                        {/* 1) Clickable 'Copy Email' text */}
                        <button
                            onClick={handleCopyEmail}
                            className="text-sm text-brandGreen-500 no-underline hover:no-underline active:no-underline focus:outline-none">

                            {email}
                        </button>

                        {/* 2) Feedback message that appears briefly */}
                        {copySuccess && (
                            <span className='text-xs text-neonOrange-500'>
                                Copied
                            </span>
                        )}

                        {/* 3) Copyright */}
                        <div className='text-sm text-brandGray-200'>
                            Clark Company Limited &copy; {currentYear}
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    )
}
