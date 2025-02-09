// FILE: app/src/components/footer/Footer.jsx
import React from 'react'
import { LuTwitter, LuGithub } from 'react-icons/lu'

export default function Footer() {
    return (
        <footer className='mt-16 bg-brandGray-900 text-white relative'>
            {/* Pulse Accent Bar */}
            <div
                className='
          h-1 w-full
          bg-pulse-gradient
          animate-colorPulse
        '
            />

            {/* Footer Content */}
            <div className='py-4 px-4 flex flex-col items-center space-y-2'>
                <p className='text-sm'>Clark Company Limited</p>
                <p>© {new Date().getFullYear()}</p>

                {/* Social Icons with Mix-Blend */}
                <div className='flex space-x-6 mt-2'>
                    {/* Tailwind provides 'mix-blend-<mode>' out of the box */}
                    <a
                        href='https://twitter.com/your_profile'
                        target='_blank'
                        rel='noopener noreferrer'
                        aria-label='Twitter'
                    >
                        <LuTwitter className='h-6 w-6 text-white mix-blend-screen' />
                    </a>
                    <a
                        href='https://github.com/your_profile'
                        target='_blank'
                        rel='noopener noreferrer'
                        aria-label='GitHub'
                    >
                        <LuGithub className='h-6 w-6 text-white mix-blend-screen' />
                    </a>
                </div>
            </div>
        </footer>
    )
}
