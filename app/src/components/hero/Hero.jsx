import React, { useRef, useState, useEffect, useCallback } from 'react'
import useScrollPosition from '../../hooks/useScrollPosition'
<<<<<<< Updated upstream
import HeroBackground from './HeroBackground'
import HeroContent from './HeroContent'
=======
import useViewport from '../../hooks/useViewport'
import sproutMobile from '../../assets/sprout-mobile.jpg'
import largeSprout from '../../assets/large-sprout.jpg'
import PrimaryButton from '../utils/PrimaryButton'
import ProgressiveElement from '../utils/ProgressiveElement'
>>>>>>> Stashed changes

export default function Hero() {
    const heroRef = useRef(null)
    const spotlightRef = useRef(null)
    const { y: scrollY } = useScrollPosition()
    const [isLoaded, setIsLoaded] = useState(false)

    // Set loaded state after initial animations
    useEffect(() => {
        const timer = setTimeout(() => {
            setIsLoaded(true)
        }, 1500)
        return () => clearTimeout(timer)
    }, [])

    // Mouse-follow spotlight effect
    const handleMouseMove = useCallback(e => {
        if (!heroRef.current || !spotlightRef.current) return

        const rect = heroRef.current.getBoundingClientRect()
        const x = e.clientX - rect.left
        const y = e.clientY - rect.top

        // Update spotlight position - only highlight near current focus
        spotlightRef.current.style.background = `radial-gradient(
        circle at ${x}px ${y}px,
        rgba(16, 185, 129, 0.15) 0%,
        rgba(16, 185, 129, 0.08) 25%,
        transparent 60%
      )`
    }, [])

    // Calculate transform based on scroll position for parallax effect
    const calculateTransform = useCallback(() => {
        const maxScroll = window.innerHeight * 0.7
        const scrollRatio = Math.min(scrollY / maxScroll, 1)
        return {
            transform: `perspective(1000px) rotateX(${scrollRatio * 8}deg)`,
            opacity: 1 - scrollRatio * 0.4,
        }
    }, [scrollY])

    return (
        <section
            ref={heroRef}
            onMouseMove={handleMouseMove}
            className='relative h-[70vh] md:h-[85vh] lg:min-h-screen flex items-center justify-center px-4 py-16 text-white overflow-hidden'
            style={calculateTransform()}
        >
            {/* Spotlight overlay - follows cursor */}
            <div
                ref={spotlightRef}
                className='absolute inset-0 z-0 pointer-events-none'
            />

<<<<<<< Updated upstream
            {/* Background component with parallax effects */}
            <HeroBackground scrollY={scrollY} />
=======
            {/* Enhanced background with parallax and improved effects */}
            <div className='absolute inset-0 z-0 bg-brandGray-800 transition-padding duration-300 ease-in-out lg:p-[2.5%_5%]'>
                {/* Base image with parallax scrolling using picture element for responsive images */}
                <div className='absolute inset-0'>
                    <picture>
                        <source media="(min-width: 1024px)" srcSet={largeSprout} />
                        <img 
                            src={sproutMobile}
                            alt="Background"
                            className='w-full h-full object-cover'
                            style={{
                                filter: 'brightness(0.75)',
                                transform: `translateY(${scrollY * 0.15}px)`,
                                transition: 'transform 0.2s ease-out',
                            }}
                        />
                    </picture>
                </div>
>>>>>>> Stashed changes

            {/* Content component with progressive animations */}
            <HeroContent isLoaded={isLoaded} />
        </section>
    )
}
