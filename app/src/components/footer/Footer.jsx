// FILE: app/src/components/footer/Footer.jsx
import React from 'react'
import { LuTwitter, LuGithub, LuCopyright } from 'react-icons/lu'

export default function Footer() {
    return (
        <footer className='mt-16 text-white'>
            {/* 1. Thin, pulsing accent bar across the top */}
            <div className='h-1 w-full bg-pulse-gradient animate-colorPulse' />

            {/* 2. Main footer area: solid color, so the bottom remains stable */}
            <div className='bg-brandGray-900 py-4 px-4'>
                {/* 
          3. A relative container for the icons, with an 
             absolute, pulsing gradient behind them only.
        */}
                <div className='flex flex-row items-center space-x-6 relative mb-2'>
                    {/* Pulsing overlay behind icons, using mix-blend-mode to colorize them */}
                    <div
                        className='
              pointer-events-none
              absolute inset-0
              bg-pulse-gradient
              animate-colorPulse
              mix-blend-screen
              opacity-100
              z-0
            '
                    />
                    {/* Icons on top, receiving the gradient effect */}
                    <a
                        href='https://twitter.com/your_profile'
                        target='_blank'
                        rel='noopener noreferrer'
                        aria-label='Twitter'
                        className='text-white z-10'
                    >
                        <LuTwitter className='h-6 w-6' />
                    </a>
                    <a
                        href='https://github.com/your_profile'
                        target='_blank'
                        rel='noopener noreferrer'
                        aria-label='GitHub'
                        className='text-white z-10'
                    >
                        <LuGithub className='h-6 w-6' />
                    </a>
                </div>

                {/* 4. Company info below the icon row */}
                <div className='flex items-center space-x-2'>
                    <span>Clark Company Limited</span>
                    <LuCopyright className='h-5 w-5' />
                    <span>{new Date().getFullYear()}</span>
                </div>
            </div>
        </footer>
    )
}
