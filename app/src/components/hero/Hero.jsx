// FILE: app/src/components/hero/Hero.jsx
import React from 'react'
import sproutMobile from '../../assets/sprout-mobile.jpg'
import sproutOriginal from '../../assets/sprout-original.jpg'

export default function Hero() {
  return (
    <section className="relative w-full h-[calc(100vh-4rem)] overflow-hidden">
      {/* Mobile background image - visible only on mobile */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat md:hidden"
        style={{ backgroundImage: `url(${sproutMobile})` }}
      />
      
      {/* Desktop background image - hidden on mobile, visible on md screens and up */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat hidden md:block"
        style={{ backgroundImage: `url(${sproutOriginal})` }}
      />
      
      {/* Overlay with subtle blur */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-xs" />

      <div className="relative z-10 flex flex-col items-center justify-center h-full px-4 text-center">
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white drop-shadow-md">
          Welcome to My Enterprise Portfolio
        </h1>
        
        <p className="mt-4 text-lg sm:text-xl md:text-2xl text-white/90 max-w-xl mx-auto">
          We deliver innovative solutions for next-generation digital experiences.
        </p>
        
        <div className="mt-8">
          <a
            href="#contact"
            className="
              px-8 py-3 rounded-md shadow-lg
              bg-brandGreen-600 text-white font-semibold 
              hover:bg-brandGreen-700 transition-colors duration-300
              focus:outline-none focus:ring-2 focus:ring-brandGreen-500 focus:ring-offset-2 focus:ring-offset-black
            "
          >
            Get in Touch
          </a>
        </div>
      </div>
    </section>
  )
}
