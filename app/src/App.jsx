// app/src/App.jsx

import React from 'react'
import useNavigationState from './hooks/useNavigationState'
import NavBar from './components/navbar/Navbar'
import ProgressBar from './components/progress/ProgressBar'
import useScrollPosition from './hooks/useScrollPosition'

import sprout from './assets/sprout-mobile.jpg'

export default function App() {
    const { drawerOpen, openDrawer, closeDrawer } = useNavigationState()
    const scrollY = useScrollPosition()

    // Keep more of the gradient on scroll: from 80% to 60%
    const overlayOpacity = scrollY === 0 ? 'opacity-80' : 'opacity-60'

    return (
        <div className='relative min-h-screen'>
            {/* Fixed background image */}
            <div
                className='fixed inset-0 -z-10 bg-cover bg-no-repeat bg-center'
                style={{ backgroundImage: `url(${sprout})` }}
            />

            {/* HERO GRADIENT OVERLAY */}
            <div
                className={`
                    pointer-events-none 
                    fixed inset-0 
                    -z-5
                    bg-gradient-to-br
                    from-brandGray-900/60 
                    via-brandGreen-700/30 
                    to-brandGray-800/60
                    transition-opacity duration-300
                    ${overlayOpacity}
                `}
            />

            {/* 
              OPTIONAL MINIMAL WAVE BACKDROP 
              - Sits behind NavBar, in front of overlay 
              - If you dislike the wave, remove this entire <div>.
            */}
            <div
                className='
                    pointer-events-none 
                    absolute top-0 w-full h-[120px]
                    -z-4 overflow-hidden
                '
                aria-hidden='true'
            >
                <svg
                    className='relative block w-full h-full'
                    viewBox='0 0 1440 320'
                    preserveAspectRatio='none'
                >
                    {/* A very subtle curve, mostly near the top */}
                    <path
                        fill='#0F172A' // brandGray-900
                        fillOpacity='0.4'
                        d='
                            M0,64L48,74.7C96,85,192,107,288,128C384,149,480,171,576,181.3C672,192,768,192,864,186.7
                            C960,181,1056,171,1152,138.7C1248,107,1344,53,1392,26.7L1440,0L1440,320L1392,320
                            C1344,320,1248,320,1152,320C1056,320,960,320,864,320
                            C768,320,672,320,576,320C480,320,384,320,288,320
                            C192,320,96,320,48,320L0,320Z
                        '
                    />
                </svg>
            </div>

            {/* NavBar & ProgressBar */}
            <NavBar
                drawerOpen={drawerOpen}
                setDrawerOpen={openDrawer}
                closeDrawer={closeDrawer}
            />
            {!drawerOpen && <ProgressBar />}

            <main className='pt-16 text-white'>
                {/* Intro Section */}
                <section className='p-8'>
                    <h1 className='text-4xl font-bold mb-4'>
                        Welcome to MyBrand
                    </h1>
                    <p className='leading-relaxed mb-6'>
                        This is a preview of our site in development mode. Enjoy
                        scrolling through some placeholder content!
                    </p>
                </section>

                {/* Projects Section */}
                <section className='p-8 bg-brandGray-800/60 rounded-md shadow-md mx-4 mb-8'>
                    <h2 className='text-3xl font-semibold mb-2'>
                        Latest Projects
                    </h2>
                    <p className='mb-4'>
                        Here’s where we’ll showcase some awesome work...
                    </p>
                    <p>Ultrices neque ornare aenean euismod elementum...</p>
                </section>

                {/* Contact Section */}
                <section className='p-8'>
                    <h2 className='text-3xl font-semibold mb-2'>Contact Me</h2>
                    <p className='mb-6'>
                        Want to reach out? This is a perfect place for a form or
                        email link...
                    </p>
                </section>
            </main>
        </div>
    )
}
