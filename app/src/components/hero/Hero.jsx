import React, { useRef, useState, useEffect, useCallback } from 'react'
import useScrollPosition from '../../hooks/useScrollPosition'
import useIsInViewport from '../../hooks/useIsInViewport'
import { generateHeroText } from '../../services/aiGenerationService'

import sproutMobile from '../../assets/sprout-mobile.jpg'
import largeSprout from '../../assets/large-sprout.jpg'
import PrimaryButton from '../utils/PrimaryButton'
import ProgressiveElement from '../utils/ProgressiveElement'
import NeuralNetworkCanvas from './NeuralNetworkCanvas'
import TypedTextEffect from './TypedTextEffect'

export default function Hero() {
    const heroRef = useRef(null)
    const spotlightRef = useRef(null)
    const { y: scrollY, direction: scrollDirection, percent: scrollPercent } = useScrollPosition()
    const [isLoaded, setIsLoaded] = useState(false)
    
    // Track if hero is visible in viewport
    const [heroIsInView, setHeroIsInView] = useState(true)
    
    // Track mouse position and zone (3x3 grid)
    const [mousePosition, setMousePosition] = useState({ 
        x: 0, 
        y: 0, 
        zone: 'center-middle'
    })
    
    // Track AI-generated text
    const [heroText, setHeroText] = useState("Building elegant solutions to complex problems")
    const [isGenerating, setIsGenerating] = useState(false)

    // Using useIsInViewport hook to detect when hero is visible
    const [viewportRef, isInViewport] = useIsInViewport({ threshold: 0.3 })
    
    // Set refs
    useEffect(() => {
        if (heroRef.current) {
            viewportRef.current = heroRef.current
        }
    }, [viewportRef])
    
    // Update heroIsInView when isInViewport changes
    useEffect(() => {
        setHeroIsInView(isInViewport)
    }, [isInViewport])

    // Set loaded state after initial animations
    useEffect(() => {
        const timer = setTimeout(() => {
            setIsLoaded(true)
        }, 1500)
        return () => clearTimeout(timer)
    }, [])

    // Mouse-follow spotlight effect with zone tracking
    const handleMouseMove = useCallback(e => {
        if (!heroRef.current || !spotlightRef.current) return

        const rect = heroRef.current.getBoundingClientRect()
        const x = e.clientX - rect.left
        const y = e.clientY - rect.top

        // Calculate position as percentage of hero area
        const xPercent = (x / rect.width) * 100
        const yPercent = (y / rect.height) * 100
        
        // Determine zone (3x3 grid)
        const horizontalZone = xPercent < 33 ? 'left' : xPercent < 66 ? 'center' : 'right'
        const verticalZone = yPercent < 33 ? 'top' : yPercent < 66 ? 'middle' : 'bottom'
        const zone = `${horizontalZone}-${verticalZone}`
        
        // Update mouse position state, but only if zone changed
        // This prevents unnecessary re-renders and AI calls
        setMousePosition(prev => 
            prev.zone !== zone ? { x, y, zone } : prev
        )

        // Update spotlight position
        spotlightRef.current.style.background = `radial-gradient(
            circle at ${x}px ${y}px,
            rgba(16, 185, 129, 0.15) 0%,
            rgba(16, 185, 129, 0.08) 25%,
            transparent 60%
        )`
    }, [])

    // Cached text options to reduce unnecessary API calls
    const staticHeroTexts = {
        'left-top': "Architecting scalable solutions with clean, maintainable code",
        'center-top': "Transforming complex ideas into elegant implementations",
        'right-top': "Pushing the boundaries of what's possible with modern tech",
        'left-middle': "Building software that solves real-world challenges",
        'center-middle': "Creating innovative solutions through thoughtful engineering",
        'right-middle': "Engineering systems that scale with precision and reliability",
        'left-bottom': "Turning ideas into production-ready applications",
        'center-bottom': "Crafting digital experiences that make a difference",
        'right-bottom': "Bringing technical vision to life through code and creativity",
        'default': "Building elegant solutions to complex problems"
    };
    
    // Use cache tracker to avoid too many API calls
    const [lastUpdateTime, setLastUpdateTime] = useState(0);
    const MIN_UPDATE_INTERVAL = 10000; // 10 seconds between text updates
    
    // Generate new hero text when context changes AND hero is in viewport
    useEffect(() => {
        // Skip if hero is not in viewport or if already generating
        if (!heroIsInView || isGenerating) return
        
        const now = Date.now();
        const timeSinceLastUpdate = now - lastUpdateTime;
        
        // Check if we should use cache instead of making API call
        if (timeSinceLastUpdate < MIN_UPDATE_INTERVAL) {
            // Use static text based on mouse position zone
            const zoneText = staticHeroTexts[mousePosition.zone] || staticHeroTexts.default;
            if (heroText !== zoneText) {
                setHeroText(zoneText);
            }
            return;
        }
        
        // Debounce to avoid too many API calls
        const timerId = setTimeout(async () => {
            setIsGenerating(true);
            
            try {
                // Prepare context data for AI
                const contextData = {
                    mousePosition,
                    scrollInfo: {
                        position: scrollY,
                        direction: scrollDirection,
                        percent: scrollPercent
                    },
                    viewportInfo: {
                        isVisible: heroIsInView
                    }
                };
                
                // Use the useMock option to avoid actual API calls during development
                // or when API is not responding well
                const useMockImplementation = process.env.NODE_ENV !== 'production';
                
                // Get new text from AI service
                const text = await generateHeroText(contextData, { useMock: useMockImplementation });
                setHeroText(text);
                setLastUpdateTime(Date.now());
            } catch (error) {
                console.error('Error generating hero text:', error);
                // Use the static text as fallback
                const fallbackText = staticHeroTexts[mousePosition.zone] || staticHeroTexts.default;
                setHeroText(fallbackText);
            } finally {
                setIsGenerating(false);
            }
        }, 2000) // Increased debounce delay to 2 seconds
        
        return () => clearTimeout(timerId);
    }, [
        heroIsInView,
        // Only care about zone changes, not exact position
        mousePosition.zone,
        // Only re-trigger on significant scroll direction changes
        scrollDirection,
        // Only re-trigger when scroll percent changes by at least 20% (reduced sensitivity)
        Math.floor(scrollPercent / 20),
        isGenerating,
        // Remove scrollY from dependencies as it changes too frequently
        lastUpdateTime,
        heroText
    ]);
    
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
            className='relative h-[70vh] md:h-[85vh] lg:h-[95vh] flex items-center justify-center px-4 py-16 text-white overflow-hidden'
            style={calculateTransform()}
        >
            {/* Spotlight overlay - follows cursor */}
            <div
                ref={spotlightRef}
                className='absolute inset-0 z-0 pointer-events-none'
            />
            
            {/* Neural Network Visualization - desktop only */}
            <NeuralNetworkCanvas scrollPosition={scrollY} />

            {/* Enhanced background with parallax and improved effects */}
            <div className='absolute inset-0 z-0 bg-brandGray-800 transition-all duration-300 ease-in-out lg:p-[3%_8%]'>
                {/* Base image with parallax scrolling using picture element for responsive images */}
                <div className='absolute inset-0'>
                    <picture>
                        <source
                            media='(min-width: 1024px)'
                            srcSet={largeSprout}
                        />
                        <img
                            src={sproutMobile}
                            alt='Background'
                            className='w-full h-full object-cover object-center lg:object-[center_40%]'
                            style={{
                                filter: 'brightness(0.75)',
                                transform: `translateY(${scrollY * 0.15}px)`,
                                transition: 'transform 0.2s ease-out',
                            }}
                        />
                    </picture>
                </div>

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
                        {/* Orange line removed as requested */}
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
                </ProgressiveElement>

                {/* Specialty tags moved outside ProgressiveElement to remove transform effects */}
                <div className='flex gap-2 mb-3'>
                    <span className='px-2 py-0.5 bg-brandGreen-800/70 rounded text-xs font-medium text-brandGreen-100 border border-brandGreen-500/40 whitespace-nowrap'>
                        Full-Stack
                    </span>
                    <span className='px-2 py-0.5 bg-brandBlue-800/70 rounded text-xs font-medium text-brandBlue-100 border border-brandBlue-500/40 whitespace-nowrap'>
                        Cloud
                    </span>
                    <span className='px-2 py-0.5 bg-brandOrange-900/70 rounded text-xs font-medium text-brandOrange-100 border border-brandOrange-600/40 whitespace-nowrap'>
                        AI
                    </span>
                </div>

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

                        {/* AI-Powered Text layer with dynamic typing effect based on user interaction */}
                        <p className='relative px-3 py-2 text-lg text-white font-medium leading-relaxed'>
                            {isGenerating ? (
                                <span className="flex items-center">
                                    <span className="mr-2">Crafting a response</span>
                                    <span className="flex space-x-1">
                                        <span className="w-2 h-2 bg-brandGreen-500 rounded-full animate-pulse"></span>
                                        <span className="w-2 h-2 bg-brandGreen-500 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></span>
                                        <span className="w-2 h-2 bg-brandGreen-500 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></span>
                                    </span>
                                </span>
                            ) : (
                                <TypedTextEffect 
                                    phrases={[heroText]}
                                    typingSpeed={40}
                                    deletingSpeed={30}
                                    pauseTime={5000}
                                    active={heroIsInView && !isGenerating}
                                    className="transition-opacity duration-300"
                                    stableViewingPeriod={10000} // 10 seconds of stable viewing before changing
                                    scrollIdlePeriod={3000} // 3 seconds of scroll inactivity before change
                                />
                            )}
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
                    </PrimaryButton>
                </ProgressiveElement>
            </div>

            {/* Diagonal slice indicator */}
            <div className="absolute bottom-0 left-0 right-0 w-full overflow-hidden z-10">
                <div
                    className="absolute w-[120%] h-20 bg-gradient-to-r
                    from-brandGray-900 to-brandGray-800
                    transform -rotate-3 translate-y-1/2 origin-bottom-left"
                />
            </div>
        </section>
    )
}
