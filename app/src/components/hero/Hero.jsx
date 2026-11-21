import { useRef, useCallback } from 'react'
import useScrollPosition from '../../hooks/useScrollPosition'

// Import both WebP and JPG versions
import sproutMobile from '../../assets/sprout-mobile.jpg'
import largeSprout from '../../assets/large-sprout.jpg'
// The WebP versions are served from app/public under fixed names, so index.html can
// preload the exact URL the browser will request (an import would get a hashed name)
const sproutMobileWebp = '/assets/sprout-mobile.webp'
const largeSproutWebp = '/assets/large-sprout.webp'
import '../../styles/components/hero-actions.css'
import ProgressiveElement from '../utils/ProgressiveElement'
import NeuralNetworkCanvas from './NeuralNetworkCanvas'
import TypedTextEffect from './TypedTextEffect'

const HERO_TAGLINE_DELAY = 600

export default function Hero() {
    const heroRef = useRef(null)
    const spotlightRef = useRef(null)
    const { y: scrollY } = useScrollPosition()

    // The decorative spotlight follows the pointer independently of the copy.
    const handleMouseMove = useCallback(e => {
        if (!heroRef.current || !spotlightRef.current) return

        const rect = heroRef.current.getBoundingClientRect()
        const x = e.clientX - rect.left
        const y = e.clientY - rect.top

        // Update spotlight position
        spotlightRef.current.style.background = `radial-gradient(
            circle at ${x}px ${y}px,
            rgba(16, 185, 129, 0.15) 0%,
            rgba(16, 185, 129, 0.08) 25%,
            transparent 60%
        )`
    }, [])

    // Keep foreground text and actions at full contrast as the background fades.
    const maxScroll = window.innerHeight * 0.7
    const scrollRatio = Math.min(scrollY / maxScroll, 1)
    const heroTransform = {
        transform: `perspective(1000px) rotateX(${scrollRatio * 8}deg)`,
    }

    return (
        <section
            ref={heroRef}
            onMouseMove={handleMouseMove}
            className='portfolio-hero relative flex items-center justify-center pt-[calc(var(--site-nav-rest-height)+var(--hero-nav-clearance))] text-white overflow-hidden'
            style={heroTransform}
        >
            {/* Spotlight overlay - follows cursor */}
            <div
                ref={spotlightRef}
                className='absolute inset-0 z-0 pointer-events-none'
            />
            
            {/* Neural Network Visualization - desktop only */}
            <NeuralNetworkCanvas scrollPosition={scrollY} />

            {/* Enhanced background with parallax and improved effects */}
            <div className='absolute inset-0 z-0 bg-brandGray-800 transition-all duration-300 ease-in-out lg:p-[3%_8%]' 
                 style={{ contain: 'strict', contentVisibility: 'auto', opacity: 1 - scrollRatio * 0.4 }}>
                {/* Base image with parallax scrolling using picture element for responsive images */}
                <div className='absolute inset-0'>
                        <picture>
                            {/* WebP format for modern browsers - with optimized sizes and explicit dimensions */}
                            <source
                                media='(min-width: 1024px)'
                                type="image/webp"
                                srcSet={largeSproutWebp}
                                sizes="100vw"
                                width="1600"
                                height="1069"
                            />
                            <source
                                media='(max-width: 1023px)'
                                type="image/webp"
                                srcSet={sproutMobileWebp}
                                sizes="100vw"
                                width="900"
                                height="1601"
                            />
                            {/* Fallback formats with explicit dimensions */}
                            <source
                                media='(min-width: 1024px)'
                                type="image/jpeg"
                                srcSet={largeSprout}
                                sizes="100vw"
                                width="1600"
                                height="1069"
                            />
                            <img
                                src={sproutMobile}
                                alt='Portfolio background image'
                                className='w-full h-full object-cover object-center lg:object-[center_40%]'
                                width="900"
                                height="1601"
                                loading="eager"
                                decoding="async"
                                fetchpriority="high"
                                style={{
                                    filter: 'brightness(0.75)',
                                    transform: `translateY(${scrollY * 0.15}px)`,
                                    transition: 'transform 0.2s ease-out',
                                    aspectRatio: 'auto',
                                    contentVisibility: 'auto',
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
            <div className='portfolio-hero__content z-10 relative'>
                {/* Progressive name element - Stage 1 */}
                <ProgressiveElement
                    id='hero-name'
                    appearDelay={0}
                    focusStage={1}
                    className='relative mb-3 sm:mb-4'
                >
                    {/* Removed the gray background span element that was causing the horizontal bar */}
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
                    className='block'
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
                    appearDelay={HERO_TAGLINE_DELAY}
                    focusStage={3}
                    className='block my-5 sm:my-6'
                >
                    <div className='portfolio-hero__tagline relative'>
                        {/* Background layer - removed backdrop blur */}
                        <div className='absolute inset-0 bg-brandGray-900/40 rounded-lg border-l-2 border-brandGreen-500/40 pointer-events-none'></div>

                        {/* One entrance; CSS adapts the copy without resetting progress. */}
                        <p className='relative flex min-h-[3.25rem] items-center px-3 py-2 text-lg text-white font-medium leading-relaxed'>
                            <TypedTextEffect
                                text='Building elegant solutions to complex problems.'
                                compactText='Software that solves real problems.'
                                startDelay={HERO_TAGLINE_DELAY}
                            />
                        </p>
                    </div>
                </ProgressiveElement>

                {/* Progressive CTA - Stage 4 */}
                <ProgressiveElement
                    id='hero-cta'
                    appearDelay={900}
                    focusStage={4}
                >
                    <div className='hero-actions'>
                        <a href='#projects' className='hero-action hero-action--primary'>
                            <span>Featured Projects</span>
                        </a>
                        <a
                            href='https://ascendavoid.com'
                            target='_blank'
                            rel='noopener noreferrer'
                            aria-label='Play Ascend-Avoid (opens in a new tab)'
                            className='hero-action hero-action--outline'
                        >
                            <span>Play Ascend-Avoid</span>
                            <span className='hero-action__filled-label' aria-hidden='true'>Play Ascend-Avoid</span>
                        </a>
                    </div>
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
