import React, { useRef, useState } from 'react'
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
        
    // Track whether each icon has been clicked
    const [twitterClicked, setTwitterClicked] = useState(false)
    const [githubClicked, setGithubClicked] = useState(false)
    
    // Choose one of the five micro-animations for each icon
    const twitterAnimation = 'animate-soft-glow'
    const githubAnimation = 'animate-soft-glow'

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
                            iconAnimationClass={clsx(
                                leftClass,
                                'text-neonOrange-500 fill-current stroke-current',
                                !twitterClicked ? twitterAnimation : ''
                            )}
                            onAnimEnd={onLeftEnd}
                            onUserStop={stopNow}
                            url='https://twitter.com/andrewgenai'
                            onClick={() => setTwitterClicked(true)}
                        />
                        <IconPair
                            Icon={LuGithub}
                            iconAnimationClass={clsx(
                                rightClass,
                                'text-neonOrange-500 fill-current stroke-current',
                                !githubClicked ? githubAnimation : ''
                            )}
                            onAnimEnd={onRightEnd}
                            onUserStop={stopNow}
                            url='https://github.com/life423'
                            onClick={() => setGithubClicked(true)}
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
