// app/src/App.jsx
import React, { useState } from 'react'
import NavBar from './components/navbar/Navbar'
import ProgressBar from './components/progress/ProgressBar'
import sprout from './assets/sprout-mobile.jpg'

export default function App() {
    const [drawerOpen, setDrawerOpen] = useState(false)

    return (
        <div className='relative min-h-screen'>
            {/* Fixed background behind everything */}
            <div
                className='fixed inset-0 -z-10 bg-cover bg-no-repeat bg-center'
                style={{ backgroundImage: `url(${sprout})` }}
            />

            {/* NavBar & ProgressBar (hide progress bar if drawer is open) */}
            <NavBar drawerOpen={drawerOpen} setDrawerOpen={setDrawerOpen} />
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
                        Here’s where we’ll showcase some awesome work. For now,
                        enjoy this stylish placeholder text, ensuring we have a
                        nice scrolling experience. Lorem ipsum dolor sit amet,
                        consectetur adipiscing elit, sed do eiusmod tempor
                        incididunt ut labore et dolore magna aliqua. Nulla
                        facilisi morbi tempus iaculis urna id volutpat lacus
                        laoreet.
                    </p>
                    <p>
                        Ultrices neque ornare aenean euismod elementum nisi quis
                        eleifend. Dui nunc mattis enim ut tellus elementum
                        sagittis vitae. Tempor orci dapibus ultrices in iaculis
                        nunc. Neque laoreet suspendisse interdum consectetur
                        libero id faucibus nisl tincidunt.
                    </p>
                </section>

                {/* Contact Section */}
                <section className='p-8'>
                    <h2 className='text-3xl font-semibold mb-2'>Contact Me</h2>
                    <p className='mb-6'>
                        Want to reach out? This is a perfect place for a form or
                        email link. Lorem ipsum dolor sit amet, consectetur
                        adipiscing elit, sed do eiusmod tempor incididunt ut
                        labore et dolore magna aliqua. Viverra nam libero justo
                        laoreet sit amet cursus. Tincidunt lobortis feugiat
                        vivamus at augue eget arcu dictum.
                    </p>

                    {/* Extra Large Spacer for Scrolling */}
                   
                </section>
            </main>
        </div>
    )
}
