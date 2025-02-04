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

    // Retain the overlay but never fully fade it
    const overlayOpacity = scrollY === 0 ? 'opacity-80' : 'opacity-60'

    return (
        <div className='relative min-h-screen'>
            {/* Fixed background image */}
            <div
                className='fixed inset-0 -z-10 bg-cover bg-no-repeat bg-center'
                style={{ backgroundImage: `url(${sprout})` }}
            />

            {/* HERO GRADIENT OVERLAY (keeps site cohesive) */}
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

            {/* NavBar & ProgressBar */}
            <NavBar
                drawerOpen={drawerOpen}
                setDrawerOpen={openDrawer}
                closeDrawer={closeDrawer}
            />
            {!drawerOpen && <ProgressBar />}

            <main
                // Increased top padding so "Welcome" no longer collides with the nav
                className='pt-24 md:pt-20 text-white transition-colors duration-300'
            >
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
