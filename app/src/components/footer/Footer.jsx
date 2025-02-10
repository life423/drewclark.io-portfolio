// FILE: app/src/components/footer/Footer.jsx

import React from 'react'
import { LuTwitter, LuGithub, LuCopyright } from 'react-icons/lu'

export default function Footer() {
    return (
        <footer className='mt-16 text-white'>
            {/* 1. Thin pulsing accent bar across the top */}
            <div className='h-1 w-full bg-pulse-gradient animate-colorPulse' />

            {/* 2. Main footer area */}
            <div className='bg-brandGray-900 py-6 px-6'>
                <div className='flex justify-between items-center'>
                    {/* Icons on the left */}
                    <div className='flex space-x-6'>
                        <a
                            href='https://x.com/andrewgenai'
                            target='_blank'
                            rel='noopener noreferrer'
                            aria-label='Twitter'
                        >
                            <LuTwitter className='h-6 w-6' />
                        </a>
                        <a
                            href='https://github.com/life423'
                            target='_blank'
                            rel='noopener noreferrer'
                            aria-label='GitHub'
                        >
                            <LuGithub className='h-6 w-6' />
                        </a>
                    </div>

                    {/* Company info on the right */}
                    <div className='flex items-center space-x-2'>
                        <span>Clark Company Limited</span>
                        <span><LuCopyright className='h-3 w-3' /></span>
                        <span>{new Date().getFullYear()}</span>
                    </div>
                </div>
            </div>
        </footer>
    )
}
