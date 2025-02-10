// FILE: app/src/components/footer/Footer.jsx

import React from 'react'
import { LuTwitter, LuGithub, LuCopyright } from 'react-icons/lu'

// 1) The main Footer
export default function Footer() {
    return (
        <footer className='mt-16 text-white'>
            {/* Pulsing accent bar on top */}
            <div className='h-1 w-full bg-pulse-gradient animate-colorPulse' />

            {/* Footer content */}
            <div className='bg-brandGray-900 py-6 px-6'>
                <div className='flex justify-between items-center'>
                    {/* Left: icons */}
                    <div className='flex space-x-6'>
                        <a
                            href='https://x.com/andrewgenai'
                            target='_blank'
                            rel='noopener noreferrer'
                        >
                            <IconWithShapePulse>
                                <LuTwitter className='h-6 w-6 text-brandGreen-300' />
                            </IconWithShapePulse>
                        </a>
                        <a
                            href='https://github.com/life423'
                            target='_blank'
                            rel='noopener noreferrer'
                        >
                            <IconWithShapePulse>
                                <LuGithub className='h-6 w-6 text-brandGreen-300' />
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

// 2) The shape-based pulse wrapper
function IconWithShapePulse({ children }) {
    // 'children' is your main icon, e.g. <LuTwitter ... >
    return (
        <div className='relative inline-block'>
            {/* This is the second icon behind, which expands/fades out */}
            <div className='absolute inset-0 flex items-center justify-center pointer-events-none z-0'>
                {/* We clone the shape: same icon, neon orange, animates behind */}
                <ShapePulseIcon>{children}</ShapePulseIcon>
            </div>

            {/* The main icon, in front */}
            <div className='relative z-10'>{children}</div>
        </div>
    )
}

// 3) The “pulse” version of the same icon
//    We re-render the exact same icon as neon orange, then animate it.
function ShapePulseIcon({ children }) {
    // We assume 'children' is an icon component—like <LuTwitter className="..." />
    // We'll clone it with new props.
    return (
        <>
            {React.cloneElement(children, {
                className: `
          h-6 w-6 
          text-neonOrange-300
          animate-iconPulse 
          origin-center 
        `,
            })}
        </>
    )
}
