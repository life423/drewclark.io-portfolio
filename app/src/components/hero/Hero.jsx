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
                        transformOrigin: 'center bottom'
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
                <div className="absolute inset-0 opacity-10 pointer-events-none overflow-hidden">
                    <div className="absolute -inset-x-full top-0 h-screen rotate-12 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-light-sweep"></div>
                </div>
                
                {/* Animated plant silhouette with parallax */}
                <div 
                    className="absolute right-0 bottom-0 w-1/3 md:w-1/4 h-3/4 pointer-events-none opacity-20 mix-blend-soft-light" 
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
                    className='relative mb-2'
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
                    </h1>
                </ProgressiveElement>

                {/* Progressive role element - Stage 2 */}
                <ProgressiveElement
                    id='hero-role'
                    appearDelay={300}
                    focusStage={2}
                    className='block'
                >
                    <h2 className='text-2xl md:text-3xl mb-2 font-light text-white'>
                        Software Engineer
                    </h2>
                    
                    {/* Specialty tags */}
                    <div className="flex flex-wrap gap-2 mb-3 animate-fade-in-1" 
                        style={{animationDelay: '150ms'}}>
                        <span className="px-2 py-0.5 bg-brandGreen-800/40 rounded text-xs text-brandGreen-300 border border-brandGreen-500/20">
                            Full-Stack Development
                        </span>
                        <span className="px-2 py-0.5 bg-brandBlue-800/40 rounded text-xs text-brandBlue-300 border border-brandBlue-500/20">
                            Cloud Architecture
                        </span>
                        <span className="px-2 py-0.5 bg-neonOrange-900/40 rounded text-xs text-neonOrange-300 border border-neonOrange-600/20">
                            AI Integration
                        </span>
                    </div>
                </ProgressiveElement>

                {/* Progressive description - Stage 3 */}
                <ProgressiveElement
                    id='hero-description'
                    appearDelay={600}
                    focusStage={3}
                    className='block mb-8'
                >
                    <div className="relative max-w-2xl">
                        {/* Blurred background layer */}
                        <div className="absolute inset-0 backdrop-blur-sm bg-brandGray-900/40 rounded-lg border-l-2 border-brandGreen-500/40"></div>
                        
                        {/* Text layer with full opacity */}
                        <p className="relative px-3 py-2 text-lg text-white font-medium leading-relaxed">
                            Creating elegant solutions to complex problems with a
                            focus on user experience and performance.
                        </p>
                    </div>
                </ProgressiveElement>

                {/* Progressive CTA - Stage 4 */}
                <ProgressiveElement
                    id='hero-cta'
                    appearDelay={900}
                    focusStage={4}
                >
                    <PrimaryButton href='#projects' className="group">
                        <span className='text-white font-medium'>
                            Featured Projects
                        </span>
                        <svg 
                            className="w-5 h-5 ml-2 group-hover:translate-y-1 transition-transform duration-300" 
                            fill="none" 
                            viewBox="0 0 24 24" 
                            stroke="currentColor"
                            aria-hidden="true"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                        </svg>
                        
                        {/* Corner highlight effect */}
                        <div className="absolute top-0 right-0 w-[20px] h-[20px] opacity-0 animate-corner-highlight">
                            <div className="absolute top-0 right-0 w-[2px] h-[6px] bg-neonOrange-500/70 rounded-sm"></div>
                            <div className="absolute top-0 right-0 w-[6px] h-[2px] bg-neonOrange-500/70 rounded-sm"></div>
                        </div>
                    </PrimaryButton>
                    
                    {/* Scroll indicator */}
                    <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 opacity-0 animate-fade-in-3"
                        style={{animationDelay: '2000ms'}}>
                        <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center">
                            <span className="block w-1 h-2 bg-white/70 rounded-full mt-2 animate-scroll-indicator"></span>
                        </div>
                    </div>
                </ProgressiveElement>
            </div>
            
            {/* Interactive overlay elements - only show when loaded */}
            {isLoaded && (
                <div className="absolute inset-0 pointer-events-none">
                    {/* Decorative particles */}
                    <div className="absolute left-1/4 top-1/4 w-1 h-1 bg-brandGreen-400 rounded-full animate-float"></div>
                    <div className="absolute left-3/4 top-1/3 w-1 h-1 bg-brandBlue-400 rounded-full animate-float-delayed"></div>
                    <div className="absolute left-1/5 bottom-1/3 w-1 h-1 bg-neonOrange-400 rounded-full animate-float-slow"></div>
                </div>
            )}
        </section>
    )
}
