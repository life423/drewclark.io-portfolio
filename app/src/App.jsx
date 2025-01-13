// app/src/App.jsx

import React from 'react'
import NavBar from './components/navbar/Navbar'
import ProgressBar from './components/progress/ProgressBar'
import sprout from './assets/sprout.jpg'

export default function App() {
    return (
        <div
            className='min-h-screen bg-cover'
            style={{ backgroundImage: `url(${sprout})` }}
        >
            <NavBar />
            <ProgressBar />

            <main className='pt-16'>
                <section className='p-8'>
                    <h1 className='text-3xl text-brandGreen-700 mb-4'>
                        Welcome to My Site
                    </h1>
                    <p className='text-brandGray-700'>
                        Scroll down to see the nav blur and the progress bar
                        fill up.
                    </p>

                    {/* Fake big content to enable scrolling */}
                    <div className='h-[200vh] bg-transparent mt-6'>
                        <p className='text-center pt-6'></p>
                    </div>
                </section>
            </main>
        </div>
    )
}
