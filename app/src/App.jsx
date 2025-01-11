// app/src/App.jsx

import React from 'react'
import NavBar from './components/navbar/Navbar'
import ProgressBar from './components/progress/ProgressBar'

export default function App() {
    return (
        <div className='min-h-screen bg-brandGray-50'>
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
                    <div className='h-[200vh] bg-brandGray-50 mt-6'>
                        <p className='text-center pt-6'>Big content area…</p>
                    </div>
                </section>
            </main>
        </div>
    )
}
