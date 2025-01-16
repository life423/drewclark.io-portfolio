// src/App.jsx
import React, { useState } from 'react'
import NavBar from './components/navbar/Navbar'
import ProgressBar from './components/progress/ProgressBar'
import sprout from './assets/sprout-mobile.jpg'

export default function App() {
    const [drawerOpen, setDrawerOpen] = useState(false)

    return (
        <div
            className='min-h-screen bg-cover bg-pos-75 bg-no-repeat'
            style={{ backgroundImage: `url(${sprout})` }}
        >
            {/* Pass a setter function to NavBar so it knows when the drawer is open */}
            <NavBar onDrawerToggle={setDrawerOpen} />

            <ProgressBar />

            {/* 
        The outer wrapper can apply transform based on whether the drawer is open.
        This is optional if you want the "main" to tilt/scale.
      */}
            <div
                className={`
          transition-transform duration-300 
          ${
              drawerOpen
                  ? 'transform scale-[0.95] md:scale-[0.98] md:-translate-x-16'
                  : ''
          }
        `}
            >
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
        </div>
    )
}
