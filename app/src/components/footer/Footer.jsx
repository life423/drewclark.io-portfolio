import React, { useRef } from 'react'
import { LuTwitter, LuGithub } from 'react-icons/lu'
import useIntersection from '../../hooks/useIntersection'
import useStaggeredTwoIcons from '../../hooks/useStaggeredTwoIcons'
import clsx from 'clsx'

export default function Footer() {
    const containerRef = useRef(null)
    const inView = useIntersection(containerRef)

    const { leftClass, rightClass, onLeftEnd, onRightEnd, stopNow } =
        useStaggeredTwoIcons({ inView, maxIterations: 3 })

    return (
        <footer className='mt-16 text-white' ref={containerRef}>
            {}
            <div className='h-1 w-full bg-pulse-gradient animate-colorPulse' />

            <div className='bg-brandGray-900 py-6 px-6'>
                <div className='flex justify-between items-center'>
                    {}
                    <div className='flex space-x-6'>
                        <IconPair
                            Icon={LuTwitter}
                            iconClass={leftClass}
                            onAnimEnd={onLeftEnd}
                            onUserStop={stopNow}
                        />
                        <IconPair
                            Icon={LuGithub}
                            iconClass={rightClass}
                            onAnimEnd={onRightEnd}
                            onUserStop={stopNow}
                        />
                    </div>

                    {}
                    <div className='flex items-center space-x-2'>
                        <span>Clark Company Limited</span>
                        <span>{new Date().getFullYear()}</span>
                    </div>
                </div>
            </div>
        </footer>
    )
}

function IconPair({ Icon, iconClass = '', onAnimEnd, onUserStop }) {
    const sanitizedIconClass = iconClass.replace(/text-\S+/g, '')

    return (
        <div className='relative inline-block'>
            {}
            <Icon
                className={clsx(
                    'h-6 w-6 origin-center animate-fontFlash',
                    'text-brandGreen-300',
                    sanitizedIconClass
                )}
                onAnimationEnd={onAnimEnd}
                onClick={onUserStop}
            />
            {}
            <div className='absolute inset-0 flex items-center justify-center pointer-events-none'>
                <Icon className='h-6 w-6 text-brandGreen-300' />
            </div>
        </div>
    )
}
