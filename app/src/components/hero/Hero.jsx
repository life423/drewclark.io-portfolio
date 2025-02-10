// FILE: app/src/components/hero/Hero.jsx

import React from 'react'
import sprout from '../../assets/sprout-mobile.jpg'

export default function Hero() {
    return (
        <section className='relative h-screen'>
            <div
                className='relative bg-center bg-cover bg-no-repeat h-full'
                style={{ backgroundImage: `url(${sprout})` }}
            >
                {/* Gradient overlay via custom plugin utility */}
                <div className='absolute inset-0 gradient-overlay' />

                {/* Content container */}
                <div className='relative z-10 flex flex-col items-center justify-center h-full px-4 text-center'>
                    <h1 className='text-4xl sm:text-5xl md:text-6xl font-bold text-white'>
                        Welcome to My Enterprise Portfolio
                    </h1>
                    <p className='mt-4 text-lg sm:text-xl md:text-2xl text-white opacity-90'>
                        We deliver innovative solutions for next-generation
                        digital experiences.
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
            </div>
        </section>
    )
}
