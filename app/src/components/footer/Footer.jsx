// FILE: app/src/components/footer/Footer.jsx
import React from 'react'
import { LuTwitter, LuGithub, LuCopyright } from 'react-icons/lu'

export default function Footer() {
    return (
        <footer className='mt-16 bg-brandGray-900 text-white relative'>
            {/* 1. Thin Pulse Accent Bar (unchanged) */}
            <div
                className='
          h-1 w-full
          bg-pulse-gradient
          animate-colorPulse
        '
            />

            {/*
        2. Light Overlay:
           Positioned just below the 1px bar, with partial opacity,
           using the same pulse gradient so it “shines” onto the icons.
      */}
            <div
                className='
          absolute
          top-1    /* starts right below the 1px bar */
          left-0
          w-full
          h-12     /* how far down the light extends */
          bg-pulse-gradient
          animate-colorPulse
          opacity-60    /* adjust to control brightness */
          pointer-events-none
          z-0           /* behind the content */
        '
            />

            {/* 3. Footer Content (icons, text) */}
            <div className='relative z-10 py-4 px-4'>
                <div className='flex flex-row items-center space-x-6'>
                    <a
                        href='https://twitter.com/your_profile'
                        target='_blank'
                        rel='noopener noreferrer'
                        aria-label='Twitter'
                        className='text-white/75'
                    >
                        <LuTwitter className='h-6 w-6' />
                    </a>

                    <a
                        href='https://github.com/your_profile'
                        target='_blank'
                        rel='noopener noreferrer'
                        aria-label='GitHub'
                        className='text-white/75'
                    >
                        <LuGithub className='h-6 w-6 ' />
                    </a>

                    {/* Company Name & Copyright */}
                    <span>Clark Company Limited</span>
                    <LuCopyright className='h-6 w-6' />
                    <span>{new Date().getFullYear()}</span>
                </div>
            </div>
        </footer>
    )
}
