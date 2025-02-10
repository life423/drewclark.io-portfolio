import React from 'react'
import useNavigationState from './hooks/useNavigationState'
import NavBar from './components/navbar/Navbar'
import ProgressBar from './components/progress/ProgressBar'
import useScrollPosition from './hooks/useScrollPosition'
import Footer from './components/footer/Footer'

import sprout from './assets/sprout-mobile.jpg'

export default function App() {
    const { drawerOpen, openDrawer, closeDrawer } = useNavigationState()

    const scrollY = useScrollPosition()
    const overlayOpacity = scrollY === 0 ? 'opacity-80' : 'opacity-60'

    return (
        <div className='relative min-h-screen overflow-x-hidden'>
            {}
            <div
                className='fixed inset-0 -z-10 bg-cover bg-no-repeat bg-center'
                style={{ backgroundImage: `url(${sprout})` }}
            />

            {}
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

            {}
            <NavBar
                drawerOpen={drawerOpen}
                setDrawerOpen={openDrawer}
                closeDrawer={closeDrawer}
            />
            {!drawerOpen && <ProgressBar />}

            {}
            <div
                id='content'
                className={`
                    transition-transform duration-300
                    ${drawerOpen ? 'translate-x-[70%]' : ''}
                `}
            >
                
                    
                <Footer />
            </div>
        </div>
    )
}
