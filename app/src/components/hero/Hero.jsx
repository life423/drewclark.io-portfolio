import React, { useRef } from 'react'
import useScrollPosition from '../../hooks/useScrollPosition'
import sproutMobile from '../../assets/sprout-mobile.jpg'
import PrimaryButton from '../utils/PrimaryButton'
import ProgressiveElement from '../utils/ProgressiveElement'

export default function Hero() {
  const heroRef = useRef(null)
  const spotlightRef = useRef(null)
  const { y: scrollY } = useScrollPosition()
  
  // Mouse-follow spotlight effect
  const handleMouseMove = (e) => {
    if (!heroRef.current || !spotlightRef.current) return
    
    const rect = heroRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    
    // Update spotlight position - only highlight near current focus
    spotlightRef.current.style.background = 
      `radial-gradient(
        circle at ${x}px ${y}px,
        rgba(16, 185, 129, 0.1) 0%,
        rgba(16, 185, 129, 0.05) 20%,
        transparent 50%
      )`
  }
  
  // Calculate transform based on scroll position for parallax effect
  const calculateTransform = () => {
    const maxScroll = window.innerHeight * 0.7
    const scrollRatio = Math.min(scrollY / maxScroll, 1)
    return {
      transform: `perspective(1000px) rotateX(${scrollRatio * 8}deg)`,
      opacity: 1 - (scrollRatio * 0.4)
    }
  }
  
  return (
      <section 
        ref={heroRef}
        onMouseMove={handleMouseMove}
        className="relative h-[70vh] flex items-center justify-center px-4 py-16 text-white overflow-hidden"
        style={calculateTransform()}
      >
        {/* Spotlight overlay - follows cursor */}
        <div 
          ref={spotlightRef} 
          className="absolute inset-0 z-0 pointer-events-none"
        />
        
        {/* Background with parallax effect and gradient overlay */}
        <div className="absolute inset-0 z-0">
          {/* Base image with parallax scrolling */}
          <div 
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage: `url(${sproutMobile})`,
              filter: 'brightness(0.75)',
              transform: `translateY(${scrollY * 0.15}px)`,
              transition: 'transform 0.1s ease-out',
            }}
          />
          
          {/* Gradient overlay for better text contrast - improved contrast */}
          <div className="absolute inset-0 bg-gradient-to-t 
                         from-brandGray-900/60 via-brandGreen-800/20 to-transparent"></div>
          
          {/* Subtle noise texture for depth */}
          <div className="absolute inset-0 opacity-5 mix-blend-overlay"
               style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.65\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%\' height=\'100%\' filter=\'url(%23noiseFilter)\'/%3E%3C/svg%3E")' }}></div>
        </div>
        
        {/* Content container */}
        <div className="container mx-auto z-10 relative">
          {/* Progressive name element - Stage 1 */}
          <ProgressiveElement 
            id="hero-name"
            appearDelay={0}
            focusStage={1}
            className="relative mb-2"
          >
            <span className="absolute -inset-x-4 -inset-y-2 bg-gradient-to-r 
                           from-brandGray-900/85 to-brandGray-900/40 rounded-lg blur-xl"></span>
            <h1 className="relative text-4xl md:text-6xl font-bold">
              <span className="inline-block bg-clip-text text-transparent bg-gradient-to-r 
                             from-brandGreen-300 via-brandGreen-200 to-brandBlue-400">
                Drew Clark
              </span>
            </h1>
          </ProgressiveElement>
          
          {/* Progressive role element - Stage 2 */}
          <ProgressiveElement 
            id="hero-role"
            appearDelay={300}
            focusStage={2}
            className="block"
          >
            <h2 className="text-2xl md:text-3xl mb-3 font-light text-white">
              Software Engineer
            </h2>
          </ProgressiveElement>
          
          {/* Progressive description - Stage 3 */}
          <ProgressiveElement 
            id="hero-description"
            appearDelay={600}
            focusStage={3}
            className="block mb-8"
          >
            <p className="max-w-2xl text-lg text-white/90 leading-relaxed
                        backdrop-blur-sm bg-brandGray-900/30 px-3 py-2 rounded-lg
                        border-l-2 border-brandGreen-500/40">
              Creating elegant solutions to complex problems with a focus on user experience and performance.
            </p>
          </ProgressiveElement>
          
          {/* Progressive CTA - Stage 4 */}
          <ProgressiveElement 
            id="hero-cta"
            appearDelay={900}
            focusStage={4}
          >
            <PrimaryButton href="#projects">
              <span className="text-white font-medium">Featured Projects</span>
              <span className="text-white ml-1 transition-transform duration-300
                            animate-pulse-gentle">↓</span>
            </PrimaryButton>
          </ProgressiveElement>
        </div>
      </section>
  )
}
