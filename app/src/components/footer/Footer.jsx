// FILE: app/src/components/footer/Footer.jsx
import React, { useRef } from 'react'
import { LuTwitter, LuGithub } from 'react-icons/lu'
import useIntersection from '../../hooks/useIntersection'
import clsx from 'clsx'
import useStaggeredTwoIcons from '../../hooks/useStaggeredTwoIcons'
import {IconPair} from '../utils/IconPair'

export default function Footer() {
    const containerRef = useRef(null)
    const inView = useIntersection(containerRef)

    // useStaggeredTwoIcons manages which icon should animate,
    // and stops the effect after 3 iterations or on user touch.
    const { leftClass, rightClass, onLeftEnd, onRightEnd, stopNow } =
        useStaggeredTwoIcons({ inView, maxIterations: 1 })

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
                            url='https://twitter.com/andrewgenai'
                        />
                        <IconPair
                            Icon={LuGithub}
                            iconAnimationClass={rightClass} // provided by the hook
                            onAnimEnd={onRightEnd}
                            onUserStop={stopNow}
                            url='https://github.com/life423'
                        />
                    </div>
                    {/* Footer text */}
                    <div className='flex items-center space-x-2'>
                        <span>Clark Company Limited</span>
                        <span>&copy;</span>
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
 * - The url prop determines the destination when the icon is clicked.
 */
// function IconPair({ Icon, iconAnimationClass, onAnimEnd, onUserStop, url }) {
//     return (
//         <a
//             href={url}
//             target='_blank'
//             rel='noopener noreferrer'
//             className='relative inline-block'
//         >
//             {/* Animated icon layer */}
//             <Icon
//                 className={clsx(
//                     'h-6 w-6 origin-center',
//                     iconAnimationClass
//                         ? iconAnimationClass
//                         : 'animate-none icon-default'
//                 )}
//                 onAnimationEnd={onAnimEnd}
//                 onClick={onUserStop}
//             />
//         </a>
//     )
// }
