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

            <main className='pt-16'>
                <section className='p-8'>
                    <h1>Welcome</h1>
                </section>

                <section className='p-8'>
                    <h2>Projects</h2>
                    <p>Placeholder text...</p>
                </section>

                <section className='p-8'>
                    <h2>Contact</h2>
                    <p>
                        More placeholder text..Lorem ipsum dolor sit amet,
                        consectetur adipiscing elit, sed do eiusmod tempor
                        incididunt ut labore et dolore magna aliqua. ...
                        <br />
                        (enough text to let the user scroll)
                    </p>
                </section>
            </main>
        </div>
    )
}
