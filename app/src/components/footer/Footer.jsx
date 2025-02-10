// FILE: app/src/components/footer/Footer.jsx
import React, { useRef } from 'react'
import { LuTwitter, LuGithub } from 'react-icons/lu'
import useIntersection from '../../hooks/useIntersection'
import useStaggeredTwoIcons from '../../hooks/useStaggeredTwoIcons'
import clsx from 'clsx'

export default function Footer() {
    const containerRef = useRef(null)
    const inView = useIntersection(containerRef)

    // The "staggered" logic from your hook.
    const { leftClass, rightClass, onLeftEnd, onRightEnd, stopNow } =
        useStaggeredTwoIcons({ inView, maxIterations: 3 })

    return (
        <footer className='mt-16 text-white' ref={containerRef}>
            {/* Thin accent bar on top */}
            <div className='h-1 w-full bg-pulse-gradient animate-colorPulse' />

            <div className='bg-brandGray-900 py-6 px-6'>
                <div className='flex justify-between items-center'>
                    {/* Left & Right icons */}
                    <div className='flex space-x-6'>
                        <IconPair
                            Icon={LuTwitter}
                            iconClass={leftClass} // from the hook
                            onAnimEnd={onLeftEnd}
                            onUserStop={stopNow}
                        />
                        <IconPair
                            Icon={LuGithub}
                            iconClass={rightClass} // from the hook
                            onAnimEnd={onRightEnd}
                            onUserStop={stopNow}
                        />
                    </div>

                    {/* Footer text */}
                    <div className='flex items-center space-x-2'>
                        <span>Clark Company Limited</span>
                        <span>{new Date().getFullYear()}</span>
                    </div>
                </div>
            </div>
        </footer>
    )
}

/**
 * IconPair
 * Renders two layers of the icon:
 * - The front (animated) layer will use the fontFlash animation, which now maintains neon orange.
 * - The back (static) layer remains brand green.
 */
function IconPair({ Icon, iconClass = '', onAnimEnd, onUserStop }) {
    // Remove any text color classes from iconClass to avoid conflicts.
    const sanitizedIconClass = iconClass.replace(/text-\S+/g, '')

    return (
        <div className='relative inline-block'>
            {/* Animated (front) icon: neon orange via the fontFlash animation */}
            <Icon
                className={clsx(
                    'h-6 w-6 origin-center animate-fontFlash',
                    // Set a neon orange base color explicitly:
                    'text-brandGreen-300',
                    sanitizedIconClass
                )}
                onAnimationEnd={onAnimEnd}
                onClick={onUserStop}
            />
            {/* Static (behind) icon: brand green */}
            <div className='absolute inset-0 flex items-center justify-center pointer-events-none'>
                <Icon className='h-6 w-6 text-brandGreen-300' />
            </div>
        </div>
    )
}
