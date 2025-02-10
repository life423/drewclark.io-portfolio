// FILE: app/src/components/hero/Hero.jsx
import React from 'react'
import sprout from '../../assets/sprout-mobile.jpg'

export default function Hero() {
    return (
        <section
            className='relative flex items-center justify-center h-screen bg-cover bg-center'
            style={{ backgroundImage: `url(${sprout})` }}
        >
            {/* Gradient overlay */}
            <div className='absolute inset-0 bg-gradient-to-b from-neonOrange-500/30 to-neonOrange-200/10 z-0' />

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
                        className='inline-block px-8 py-4 bg-brandGreen-500 text-white font-semibold rounded-md shadow-lg
                                   hover:bg-brandGreen-600 transition-colors duration-300'
                    >
                        Get in Touch
                    </a>
                </div>
            </div>
        </section>
    )
}

;<div
    class='relative bg-center bg-cover bg-no-repeat'
    style="background-image: url('/path/to/sprout.jpg')"
>
    <div class='absolute inset-0 bg-[linear-gradient(135deg,_theme(colors.brandGreen.200)/40_0%,_theme(colors.brandBlue.200)/40_100%)]'></div>
</div>
