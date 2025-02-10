// FILE: app/src/components/footer/Footer.jsx
import React, { useRef } from 'react'
import { LuTwitter, LuGithub } from 'react-icons/lu'
import useIntersection from '../../hooks/useIntersection'
import useStaggeredTwoIcons from '../../hooks/useStaggeredTwoIcons'
import clsx from 'clsx'

export default function Footer() {
    const containerRef = useRef(null)
    const inView = useIntersection(containerRef)

    // useStaggeredTwoIcons manages which icon should animate,
    // and stops the effect after 3 iterations or on user touch.
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
                            iconAnimationClass={leftClass} // provided by the hook
                            onAnimEnd={onLeftEnd}
                            onUserStop={stopNow}
                        />
                        <IconPair
                            Icon={LuGithub}
                            iconAnimationClass={rightClass} // provided by the hook
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
 * IconPair:
 * - When an icon is active, iconAnimationClass is a non-empty string (e.g. "animate-iconCombined").
 * - The active icon will receive the combined animation class (which makes it neon orange and pulses).
 * - When inactive, it falls back to .icon-default (which shows the icon in brand green).
 * - onAnimEnd and onUserStop allow the hook to know when to switch or stop the effect.
 */
function IconPair({ Icon, iconAnimationClass, onAnimEnd, onUserStop }) {
    return (
        <div className='relative inline-block'>
            {/* Animated icon layer */}
            <Icon
                // When animation is active, use the provided class; otherwise, use the default green.
                className={clsx(
                    'h-6 w-6 origin-center',
                    iconAnimationClass
                        ? iconAnimationClass
                        : 'animate-none icon-default'
                )}
                onAnimationEnd={onAnimEnd}
                onClick={onUserStop}
            />
        </div>
    )
}
