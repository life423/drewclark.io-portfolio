// app/src/App.jsx
import React, { useState, useEffect } from 'react'
import NavBar from './components/navbar/Navbar'
import ProgressBar from './components/progress/ProgressBar'
import sprout from './assets/sprout-mobile.jpg'

export default function App() {
    const [drawerOpen, setDrawerOpen] = useState(false)

    useEffect(() => {
        if (drawerOpen) {
            document.documentElement.classList.add('drawer-open')
        } else {
            document.documentElement.classList.remove('drawer-open')
        }
        return () => {
            document.documentElement.classList.remove('drawer-open')
        }
    }, [drawerOpen])

    return (
        <div
            className='min-h-screen bg-cover bg-pos-75 bg-no-repeat'
            style={{ backgroundImage: `url(${sprout})` }}
        >
            <NavBar drawerOpen={drawerOpen} setDrawerOpen={setDrawerOpen} />
            <ProgressBar />

            {/* 
         Optional subtle tilt: 
         'rotate-y-3 scale-[0.95]' just for a slight 3D effect
         WITHOUT translating it horizontally (which caused that white gap).
      */}
            <div
                className={`
          relative
          transition-transform duration-300
          ${drawerOpen ? 'rotate-y-3 scale-95' : ''}
        `}
                style={{
                    perspective: '1200px',
                    transformStyle: 'preserve-3d',
                }}
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
