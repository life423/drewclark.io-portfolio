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
                        More placeholder text.. Enough text so the user can
                        scroll down. (Repeat Lorem ipsum or similar so we have
                        aLorem ipsum dolor sit amet, consectetur adipiscing
                        elit, sed do eiusmod tempor incididunt ut labore et
                        dolore magna aliqua. Ut enim ad minim veniam, quis
                        nostrud exercitation ullamco laboris nisi ut aliquip ex
                        ea commodo consequat. Duis aute irure dolor in
                        reprehenderit in voluptate velit esse cillum dolore eu
                        fugiat nulla pariatur. Excepteur sint occaecat cupidatat
                        non proident, sunt in culpa qui officia deserunt mollit
                        Lorem ipsum dolor sit amet, consectetur adipiscing elit,
                        sed do eiusmod tempor incididunt ut labore et dolore
                        magna aliqua. Ut enim ad minim veniam, quis nostrud
                        exercitation ullamco laboris nisi ut aliquip ex ea
                        commodo consequat. Duis aute irure dolor in
                        reprehenderit in voluptate velit esse cillum dolore eu
                        fugiat nulla pariatur. Excepteur sint occaecat cupidatat
                        non proident, sunt in culpa qui officia deserunt mollit
                        Lorem ipsum dolor sit amet, consectetur adipiscing elit,
                        sed do eiusmod tempor incididunt ut labore et dolore
                        magna aliqua. Ut enim ad minim veniam, quis nostrud
                        exercitation ullamco laboris nisi ut aliquip ex ea
                        commodo consequat. Duis aute irure dolor in
                        reprehenderit in voluptate velit esse cillum dolore eu
                        fugiat nulla pariatur. Excepteur sint occaecat cupidatat
                        non proident, sunt in culpa qui officia deserunt mollit
                        anim id est laborum. Lorem ipsum dolor sit amet,
                        consectetur adipiscing elit, sed do eiusmod tempor
                        incididunt ut labore et dolore magna aliqua. Ut enim ad
                        minim veniam, quis nostrud exercitation ullamco laboris
                        nisi ut aliquip ex ea commodo consequat. Duis aute irure
                        dolor in reprehenderit in voluptate velit esse cillum
                        dolore eu fugiat nulla pariatur. Excepteur sint occaecat
                        cupidatat non proident, sunt in culpa qui officia
                        deserunt mollit anim id est laborum. Lorem ipsum dolor
                        sit amet, consectetur adipiscing elit, sed do eiusmod
                        tempor incididunt ut labore et dolore magna aliqua. Ut
                        enim ad minim veniam, quis nostrud exercitation ullamco
                        laboris nisi ut aliquip ex ea commodo consequat. Duis
                        aute irure dolor in reprehenderit in voluptate velit
                        esse cillum dolore eu fugiat nulla pariatur. Excepteur
                        sint occaecat cupidatat non proident, sunt in culpa qui
                        officia deserunt mollit anim id est laborum. anim id est
                        laborum. anim id est laborum. tall page.)
                    </p>
                </section>
            </main>
        </div>
    )
}
