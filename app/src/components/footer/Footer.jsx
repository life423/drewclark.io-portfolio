// FILE: app/src/components/footer/Footer.jsx

import React from 'react'
import { LuTwitter, LuGithub, LuCopyright } from 'react-icons/lu'

export default function Footer() {
    return (
        <footer className='mt-16 text-white'>
            {/* Pulsing accent bar on top (unchanged) */}
            <div className='h-1 w-full bg-pulse-gradient animate-colorPulse' />

            <div className='bg-brandGray-900 py-6 px-6'>
                <div className='flex justify-between items-center'>
                    {/* Left icons */}
                    <div className='flex space-x-6'>
                        <a
                            href='https://x.com/andrewgenai'
                            target='_blank'
                            rel='noopener noreferrer'
                        >
                            <IconWithShapePulse>
                                <LuTwitter
                                    className='
                    h-6 w-6
                    text-brandGreen-500
                    animate-fontFlash
                  '
                                />
                            </IconWithShapePulse>
                        </a>
                        <a
                            href='https://github.com/life423'
                            target='_blank'
                            rel='noopener noreferrer'
                        >
                            <IconWithShapePulse>
                                <LuGithub
                                    className='
                    h-6 w-6
                    text-brandGreen-500
                    animate-fontFlash
                  '
                                />
                            </IconWithShapePulse>
                        </a>
                    </div>

                    {/* Right: company info */}
                    <div className='flex items-center space-x-2'>
                        <span>Clark Company Limited</span>
                        <LuCopyright className='h-3 w-3' />
                        <span>{new Date().getFullYear()}</span>
                    </div>
                </div>
            </div>
        </footer>
    )
}

/**
 * IconWithShapePulse
 * - Renders a second icon behind the main one, scaling out with 'iconPulse'.
 * - The front icon uses 'frontFlash' to color-shift green->orange->green at cycle start.
 */
function IconWithShapePulse({ children }) {
    return (
        <div className='relative inline-block'>
            {/* The behind icon, always neon orange, scaling up */}
            <div className='absolute inset-0 flex items-center justify-center pointer-events-none z-0'>
                <ShapePulseIcon>{children}</ShapePulseIcon>
            </div>

            {/* The front icon, w/ a color flash at cycle start */}
            <div className='relative z-10'>{children}</div>
        </div>
    )
}

// The cloned “pulse” version behind
function ShapePulseIcon({ children }) {
    return (
        <>
            {React.cloneElement(children, {
                className: `
          h-6 w-6
          text-neonOrange-500
          animate-iconPulse
          origin-center
        `,
            })}
        </>
    )
}
