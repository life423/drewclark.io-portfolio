import React, { useRef, useState, useEffect } from 'react'
import useScrollPosition from '../../hooks/useScrollPosition'
import sproutMobile from '../../assets/sprout-mobile.jpg'
import PrimaryButton from '../utils/PrimaryButton'
import ProgressiveElement from '../utils/ProgressiveElement'

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
    const handleMouseMove = e => {
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
    }

    // Calculate transform based on scroll position for parallax effect
    const calculateTransform = () => {
        const maxScroll = window.innerHeight * 0.7
        const scrollRatio = Math.min(scrollY / maxScroll, 1)
        return {
            transform: `perspective(1000px) rotateX(${scrollRatio * 8}deg)`,
            opacity: 1 - scrollRatio * 0.4,
        }
    }

    return (
        <section
            ref={heroRef}
            onMouseMove={handleMouseMove}
            className='relative h-[70vh] flex items-center justify-center px-4 py-16 text-white overflow-hidden'
            style={calculateTransform()}
        >
            {/* Spotlight overlay - follows cursor */}
            <div
                ref={spotlightRef}
                className='absolute inset-0 z-0 pointer-events-none'
            />

            {/* Enhanced background with parallax and improved effects */}
            <div className='absolute inset-0 z-0'>
                {/* Base image with parallax scrolling */}
                <div
                    className='absolute inset-0 bg-cover bg-center'
                    style={{
                        backgroundImage: `url(${sproutMobile})`,
                        filter: 'brightness(0.75)',
                        transform: `translateY(${scrollY * 0.15}px)`,
                        transition: 'transform 0.1s ease-out',
                        transformOrigin: 'center bottom',
                    }}
                />

                {/* Improved gradient overlay for better text contrast */}
                <div
                    className='absolute inset-0 bg-gradient-to-t 
                         from-brandGray-900/60 via-brandGreen-900/30 to-transparent'
                ></div>

                {/* Enhanced noise texture for depth */}
                <div
                    className='absolute inset-0 opacity-5 mix-blend-overlay pointer-events-none'
                    style={{
                        backgroundImage:
                            "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%' height='100%' filter='url(%23noiseFilter)'/%3E%3C/svg%3E\")",
                    }}
                ></div>

                {/* Subtle light beams effect */}
                <div className='absolute inset-0 opacity-10 pointer-events-none overflow-hidden'>
                    <div className='absolute -inset-x-full top-0 h-screen rotate-12 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-light-sweep'></div>
                </div>

                {/* Animated plant silhouette with parallax */}
                <div
                    className='absolute right-0 bottom-0 w-1/3 md:w-1/4 h-3/4 pointer-events-none opacity-20 mix-blend-soft-light'
                    style={{
                        transform: `translateY(${scrollY * -0.05}px)`,
                        transition: 'transform 0.1s ease-out',
                    }}
                >
                    {/* This would be an SVG silhouette of a plant - omitted for brevity */}
                </div>
            </div>

            {/* Content container */}
            <div className='container mx-auto z-10 relative'>
                {/* Progressive name element - Stage 1 */}
                <ProgressiveElement
                    id='hero-name'
                    appearDelay={0}
                    focusStage={1}
                    className='relative mb-8' /* Increased spacing from mb-2 to mb-8 (32px) */
                >
                    <span
                        className='absolute -inset-x-4 -inset-y-2 bg-gradient-to-r 
                           from-brandGray-900/85 to-brandGray-900/40 rounded-lg blur-xl'
                    ></span>
                    <h1 className='relative text-4xl md:text-6xl font-bold'>
                        <span
                            className='inline-block bg-clip-text text-transparent bg-gradient-to-r 
                             from-brandGreen-300 via-brandGreen-200 to-brandBlue-400'
                        >
                            Drew Clark
                        </span>
                        
                        {/* Orange accent line - positioned below text with correct length */}
                        <svg
                            className='absolute opacity-0 animate-fade-in-1'
                            style={{ 
                                animationDelay: '400ms',
                                width: '65%',
                                left: '-5%',
                                bottom: '-12px' // More space below text
                            }}
                            viewBox='0 0 200 20'
                            preserveAspectRatio='none'
                            xmlns='http://www.w3.org/2000/svg'
                        >
                            {/* Glow layer */}
                            <path
                                d='M10,10 Q50,8 100,10 Q150,12 190,15'
                                stroke='url(#orangeGlowGradient)'
                                strokeWidth='2'
                                strokeLinecap='round'
                                fill='none'
                                opacity='0.6'
                                className='animate-pulse-subtle'
                            />
                            {/* Create multiple paths with decreasing stroke width for tapering effect */}
                            <path
                                d='M10,10 Q50,8 90,10'
                                stroke='url(#orangeGradient)'
                                strokeWidth='5'
                                strokeLinecap='round'
                                fill='none'
                            />
                            <path
                                d='M90,10 Q130,12 150,13'
                                stroke='url(#orangeGradient)'
                                strokeWidth='4'
                                strokeLinecap='round'
                                fill='none'
                            />
                            <path
                                d='M150,13 Q170,14 190,15'
                                stroke='url(#orangeGradient)'
                                strokeWidth='2.5'
                                strokeLinecap='round'
                                fill='none'
                                opacity='0.8'
                            />
                            
                            <defs>
                                {/* Color gradient for fading effect */}
                                <linearGradient id='orangeGradient' x1='0%' y1='0%' x2='100%' y2='0%'>
                                    <stop offset='0%' stopColor='#FF6B00' />
                                    <stop offset='70%' stopColor='#FF8E00' />
                                    <stop offset='100%' stopColor='rgba(255, 107, 0, 0.3)' />
                                </linearGradient>
                                <linearGradient id='orangeGlowGradient' x1='0%' y1='0%' x2='100%' y2='0%'>
                                    <stop offset='0%' stopColor='rgba(255, 107, 0, 0.8)' />
                                    <stop offset='80%' stopColor='rgba(255, 142, 0, 0.1)' />
                                    <stop offset='100%' stopColor='rgba(255, 142, 0, 0)' />
                                </linearGradient>
                            </defs>
                        </svg>
                    </h1>
                </ProgressiveElement>

                {/* Progressive role element - Stage 2 */}
                <ProgressiveElement
                    id='hero-role'
                    appearDelay={300}
                    focusStage={2}
                    className='block mt-4' /* Added mt-4 (16px) for additional separation */
                >
                    <h2 className='text-2xl md:text-3xl mb-2 font-light text-white'>
                        Software Engineer
                    </h2>

                    {/* Specialty tags with improved contrast - left-aligned with consistent spacing */}
                    <div
                        className='flex gap-2 mb-3 animate-fade-in-1'
                        style={{ animationDelay: '150ms' }}
                    >
                        <span className='px-2 py-0.5 bg-brandGreen-800/70 rounded text-xs font-medium text-brandGreen-100 border border-brandGreen-500/40 whitespace-nowrap'>
                            Full-Stack
                        </span>
                        <span className='px-2 py-0.5 bg-brandBlue-800/70 rounded text-xs font-medium text-brandBlue-100 border border-brandBlue-500/40 whitespace-nowrap'>
                            Cloud
                        </span>
                        <span className='px-2 py-0.5 bg-neonOrange-900/70 rounded text-xs font-medium text-neonOrange-100 border border-neonOrange-600/40 whitespace-nowrap'>
                            AI
                        </span>
                    </div>
                </ProgressiveElement>

                {/* Progressive description - Stage 3 */}
                <ProgressiveElement
                    id='hero-description'
                    appearDelay={600}
                    focusStage={3}
                    className='block mt-8 mb-10' /* Added mt-8 and increased mb-8 to mb-10 for clearer section breaks */
                >
                    <div className='relative max-w-2xl'>
                        {/* Background layer - removed backdrop blur */}
                        <div className='absolute inset-0 bg-brandGray-900/40 rounded-lg border-l-2 border-brandGreen-500/40 pointer-events-none'></div>

                        {/* Text layer with full opacity */}
                        <p className='relative px-3 py-2 text-lg text-white font-medium leading-relaxed'>
                            Creating elegant solutions to complex problems with
                            a focus on user experience and performance.
                        </p>
                    </div>
                </ProgressiveElement>

                {/* Progressive CTA - Stage 4 */}
                <ProgressiveElement
                    id='hero-cta'
                    appearDelay={900}
                    focusStage={4}
                >
                    <PrimaryButton href='#projects'>
                        <span className='text-white font-medium'>
                            Featured Projects
                        </span>
                        <span
                            className='text-white ml-1 transition-transform duration-300
                            animate-pulse-gentle'
                        >
                            ↓
                        </span>
                    </PrimaryButton>
                </ProgressiveElement>
            </div>

            {/* Removed interactive particles */}
        </section>
    )
}
