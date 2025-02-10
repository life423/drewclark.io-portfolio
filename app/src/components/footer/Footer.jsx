// FILE: app/src/components/footer/Footer.jsx
import React from 'react'
import { LuTwitter, LuGithub, LuCopyright } from 'react-icons/lu'

export default function Footer() {
    return (
        <footer className='mt-16 text-white'>
            {/* 1. Thin pulsing accent bar at the top */}
            <div className='h-1 w-full bg-pulse-gradient animate-colorPulse' />

            {/* 2. Main footer area */}
            <div className='bg-brandGray-900 py-4 px-4 text-center'>
                <div className='flex flex-col items-center space-y-3'>
                    {/* Icons Row (centered) */}
                    <div className='flex space-x-6'>
                        <a
                            href='https://twitter.com/your_profile'
                            target='_blank'
                            rel='noopener noreferrer'
                            aria-label='Twitter'
                        >
                            <LuTwitter className='h-6 w-6' />
                        </a>
                        <a
                            href='https://github.com/your_profile'
                            target='_blank'
                            rel='noopener noreferrer'
                            aria-label='GitHub'
                        >
                            <LuGithub className='h-6 w-6' />
                        </a>
                    </div>

                    {/* Company Info Row (centered) */}
                    <div className='flex items-center space-x-2'>
                        <span>Clark Company Limited</span>
                        <LuCopyright className='h-5 w-5' />
                        <span>{new Date().getFullYear()}</span>
                    </div>
                </div>
            </div>
        </footer>
    )
}
