// app/src/App.jsx
import React, { useState, useEffect } from 'react'
import NavBar from './components/navbar/Navbar'
import ProgressBar from './components/progress/ProgressBar'
import sprout from './assets/sprout-mobile.jpg'

export default function App() {
    const [drawerOpen, setDrawerOpen] = useState(false)

    // OPTIONAL: If you want to globally toggle .drawer-open on <html>
    // so that our layoutPlugin can handle the transform:
    useEffect(() => {
        if (drawerOpen) {
            document.documentElement.classList.add('drawer-open')
        } else {
            document.documentElement.classList.remove('drawer-open')
        }
        return () => document.documentElement.classList.remove('drawer-open')
    }, [drawerOpen])

    return (
        <div
            className='min-h-screen bg-cover bg-pos-75 bg-no-repeat'
            style={{ backgroundImage: `url(${sprout})` }}
        >
            <NavBar drawerOpen={drawerOpen} setDrawerOpen={setDrawerOpen} />
            <ProgressBar />

            {/* 
        If you're letting layoutPlugin do the push/tilt, 
        you can remove the translate-x and rotate classes here. 
        But if you want to keep it local, here's how:
      */}
            <div
                className={`
          transition-transform duration-300
          ${drawerOpen ? 'translate-x-[70%] scale-[0.95] rotate-y-3' : ''}
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
