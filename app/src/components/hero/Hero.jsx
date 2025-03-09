import React, { useRef } from 'react'
import useScrollPosition from '../../hooks/useScrollPosition'
import sproutMobile from '../../assets/sprout-mobile.jpg'
import PrimaryButton from '../utils/PrimaryButton'

export default function Hero() {
  const heroRef = useRef(null)
  const { y: scrollY } = useScrollPosition()
  
  // Calculate transform based on scroll position
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
      className="relative h-[70vh] flex items-center justify-center px-4 py-16 text-white overflow-hidden"
      style={calculateTransform()}
    >
      {/* Enhanced background with parallax and gradient overlay */}
      <div className="absolute inset-0 z-0">
        {/* Base image with parallax effect */}
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url(${sproutMobile})`,
            filter: 'brightness(0.75)',
            transform: `translateY(${scrollY * 0.15}px)`,
            transition: 'transform 0.1s ease-out',
            transformOrigin: 'center bottom'
          }}
        />
        
        {/* Gradient overlay for better text contrast - lightened and brand-tinted */}
        <div className="absolute inset-0 bg-gradient-to-t 
                     from-brandGray-900/45 via-brandGreen-800/30 to-transparent"></div>
        
        {/* Subtle noise texture overlay */}
        <div className="absolute inset-0 opacity-5 mix-blend-overlay"
             style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.65\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%\' height=\'100%\' filter=\'url(%23noiseFilter)\'/%3E%3C/svg%3E")' }}></div>
      </div>
      
      {/* Content with enhanced typography and layout */}
      <div className="container mx-auto z-10 relative">
        {/* Name with backdrop for better contrast */}
        <div className="relative mb-2">
          <span className="absolute -inset-x-4 -inset-y-2 bg-gradient-to-r 
                       from-brandGray-900/80 to-brandGray-900/40 rounded-lg blur-xl"></span>
          <h1 className="relative text-4xl md:text-6xl font-bold">
            <span className="bg-clip-text text-transparent bg-gradient-to-r 
                         from-brandGreen-300 via-brandGreen-200 to-brandBlue-400
                         animate-fade-in">
              Drew Clark
            </span>
          </h1>
        </div>
        
        {/* Role with subtle reveal animation */}
        <h2 className="text-2xl md:text-3xl mb-3 font-light text-white 
                     opacity-0 animate-fade-in-1">
          Software Engineer
        </h2>
        
        {/* Description with glass effect background */}
        <p className="max-w-2xl mb-8 text-lg text-white/90 leading-relaxed
                    backdrop-blur-sm bg-brandGray-900/30 px-3 py-2 rounded-lg
                    border-l-2 border-brandGreen-500/30
                    opacity-0 animate-fade-in-2">
          Creating elegant solutions to complex problems with a focus on user experience and performance.
        </p>
        
        {/* Primary button using the shared component */}
        <div className="opacity-0 animate-fade-in-3">
          <PrimaryButton href="#projects">
            <span className="text-white font-medium">Featured Projects</span>
            <span className="text-white transition-transform duration-300
                          animate-bounce active:translate-y-1">↓</span>
          </PrimaryButton>
        </div>
      </div>
    </section>
  )
}
