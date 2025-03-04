import React, { useRef, useState, useEffect } from 'react'
import { LuTwitter, LuGithub } from 'react-icons/lu'
import clsx from 'clsx'
import useIntersection from '../../hooks/useIntersection'
import { IconPair } from '../utils/IconPair'

export default function Footer() {
    const containerRef = useRef(null)
    // 'inView' is true whenever the containerRef enters the viewport
    const inView = useIntersection(containerRef, { threshold: 0.1 })

    // So the icons only change color once
    const [colorTriggered, setColorTriggered] = useState(false)

    // Once the container is in view, set colorTriggered = true and never revert
    useEffect(() => {
        if (inView && !colorTriggered) {
            setColorTriggered(true)
        }
    }, [inView, colorTriggered])

    // If colorTriggered is false, icons are green; if true, they are orange
    const iconColorClass = colorTriggered
        ? 'text-neonOrange-500'
        : 'text-brandGreen-500'

    return (
        <footer className='mt-16 text-white' ref={containerRef}>
            <div className='bg-brandGray-900 py-6 px-6'>
                <div className='flex justify-between items-center'>
                    {/* ICONS */}
                    <div className='flex space-x-6'>
                        <IconPair
                            Icon={LuTwitter}
                            // Tailwind's transition-colors + a short duration for smooth fade
                            iconAnimationClass={clsx(
                                'fill-current stroke-current',
                                'transition-colors duration-500 ease-in-out',
                                'animate-soft-glow', // Add back the soft glow animation
                                iconColorClass
                            )}
                            url='https://twitter.com/andrewgenai'
                        />

                        <IconPair
                            Icon={LuGithub}
                            iconAnimationClass={clsx(
                                'fill-current stroke-current',
                                'transition-colors duration-500 ease-in-out',
                                'animate-soft-glow', // Add back the soft glow animation
                                iconColorClass
                            )}
                            url='https://github.com/life423'
                        />
                    </div>

                    {/* COPYRIGHT */}
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
