import React, { useRef } from 'react'
import useScrollPosition from '../../hooks/useScrollPosition'
import sproutMobile from '../../assets/sprout-mobile.jpg'

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
      {/* Background image with overlay */}
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center"
        style={{
          backgroundImage: `url(${sproutMobile})`,
          filter: 'brightness(0.6)', // Darken for text readability
          transformOrigin: 'center bottom' // Makes the perspective shift more natural
        }}
      />
      
      {/* Content */}
      <div className="container mx-auto z-10 relative">
        <h1 className="text-4xl md:text-6xl font-bold mb-4">
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-brandGreen-300 to-brandBlue-400">
            Drew Clark
          </span>
        </h1>
        <h2 className="text-2xl md:text-3xl mb-4 text-brandGray-100">
          Software Engineer
        </h2>
        <p className="max-w-2xl mb-8 text-lg">
          Creating elegant solutions to complex problems with a focus on user experience and performance.
        </p>
        
        {/* Mobile-friendly project teaser */}
        <div className="inline-flex items-center space-x-2 px-4 py-2 bg-brandGray-500/30 rounded-full backdrop-blur-sm text-brandGray-100">
          <span className="text-brandGreen-300">Featured Projects</span>
          <span className="text-xs">→</span>
        </div>
      </div>
    </section>
  )
}
