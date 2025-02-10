// FILE: app/src/components/hero/Hero.jsx
import React from 'react'
import sprout from '../../assets/sprout-mobile.jpg'

export default function Hero() {
    return (
        <section
            className='relative flex items-center justify-center h-screen bg-cover bg-center'
            style={{
                // The background image with a gradient overlay. Here the gradient goes from a darker green to a brighter green.
                backgroundImage: `linear-gradient(to bottom right, rgba(4,120,87,0.7), rgba(52,211,153,0.7)), url(${sprout})`,
            }}
        >
            {/* Content container */}
            <div className='relative z-10 max-w-4xl text-center px-4'>
                <h1 className='text-4xl sm:text-5xl md:text-6xl font-bold text-white'>
                    Welcome to My Enterprise Portfolio
                </h1>
                <p className='mt-4 text-lg sm:text-xl md:text-2xl text-white opacity-90'>
                    We deliver innovative solutions for next-generation digital
                    experiences.
                </p>
                <div className='mt-8'>
                    <a
                        href='#contact'
                        className='inline-block px-8 py-4 bg-brandGreen-500 text-white font-semibold rounded-md shadow-lg hover:bg-brandGreen-600 transition-colors duration-300'
                    >
                        Get in Touch
                    </a>
                </div>
            </div>

            {/* Optional decorative overlay (if needed) */}
            <div className='absolute inset-0 z-0'></div>
        </section>
    )
}
