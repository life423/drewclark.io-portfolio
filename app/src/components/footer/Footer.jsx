import React, { useRef } from 'react'
import { LuTwitter, LuGithub } from 'react-icons/lu'
import useIntersection from '../../hooks/useIntersection'
import clsx from 'clsx'
import useStaggeredTwoIcons from '../../hooks/useStaggeredTwoIcons'
import { IconPair } from '../utils/IconPair'

export default function Footer() {
    const containerRef = useRef(null)
    const inView = useIntersection(containerRef)

    const { leftClass, rightClass, onLeftEnd, onRightEnd, stopNow } =
        useStaggeredTwoIcons({ inView, maxIterations: 1 })

    return (
        <footer className='mt-16 text-white' ref={containerRef}>
            {}
            {/* <div className='h-1 w-full bg-pulse-gradient animate-colorPulse' /> */}

            <div className='bg-brandGray-900 py-6 px-6'>
                <div className='flex justify-between items-center'>
                    {}
                    <div className='flex space-x-6'>
                        <IconPair
                            Icon={LuTwitter}
                            iconAnimationClass={leftClass}
                            onAnimEnd={onLeftEnd}
                            onUserStop={stopNow}
                            url='https://twitter.com/andrewgenai'
                        />
                        <IconPair
                            Icon={LuGithub}
                            iconAnimationClass={rightClass}
                            onAnimEnd={onRightEnd}
                            onUserStop={stopNow}
                            url='https://github.com/life423'
                        />
                    </div>
                    {}
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
