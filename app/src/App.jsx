// app/src/App.jsx
import React, { useState } from 'react'
import NavBar from './components/navbar/Navbar'
import ProgressBar from './components/progress/ProgressBar'
import sprout from './assets/sprout-mobile.jpg'

export default function App() {
    // Local state for drawer
    const [drawerOpen, setDrawerOpen] = useState(false)

    return (
        <div
            className='min-h-screen bg-cover bg-pos-75 bg-no-repeat'
            style={{ backgroundImage: `url(${sprout})` }}
        >
            {/* Nav bar with hamburger => toggles drawer */}
            <NavBar drawerOpen={drawerOpen} setDrawerOpen={setDrawerOpen} />

            {/* Scroll progress bar */}
            <ProgressBar />

            {/* Main content */}
            <main className='pt-16'>
                <section className='p-8'>
                    <h1 className='text-3xl text-brandGreen-700 mb-4'>
                        Welcome to My Site
                    </h1>
                    <p className='text-brandGray-700'>
                        Scroll down to see the nav blur and the progress bar
                        fill up.
                    </p>
                </section>
            </main>
        </div>
    )
}
