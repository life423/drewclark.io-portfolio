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
                <main className='pt-24 md:pt-20 text-white transition-colors duration-300'>
                    {}
                    <section className='p-8'>
                        <h1 className='text-4xl font-bold mb-4'>
                            Welcome to MyBrand
                        </h1>
                        <p className='leading-relaxed mb-6'>
                            This is a preview of our site in development mode.
                            Enjoy scrolling through some placeholder content!
                            We’re still polishing up the final design and
                            features, but feel free to take a peek at what’s in
                            the works.
                        </p>
                    </section>

                    {}
                    <section className='p-8 bg-brandGray-800/60 rounded-md shadow-md mx-4 mb-8'>
                        <h2 className='text-3xl font-semibold mb-2'>
                            Latest Projects
                        </h2>
                        <p className='mb-4'>
                            Here’s where we’ll showcase some awesome work. For
                            now, check out these placeholders for a glimpse at
                            our style and approach!
                        </p>
                        <ul className='list-disc list-inside pl-4 space-y-2'>
                            <li>
                                <strong>Project Alpha</strong> – a modern React
                                + Tailwind web app
                            </li>
                            <li>
                                <strong>Project Beta</strong> – an experimental
                                Next.js site exploring serverless deployments
                            </li>
                            <li>
                                <strong>Project Gamma</strong> – an upcoming
                                design system revamp for an e-commerce platform
                            </li>
                        </ul>
                    </section>

                    {}
                    <section className='p-8 bg-brandGray-800/30 rounded-md shadow-md mx-4 mb-8'>
                        <h2 className='text-3xl font-semibold mb-2'>
                            About Us
                        </h2>
                        <p className='mb-4 leading-relaxed'>
                            MyBrand is all about delivering top-tier digital
                            experiences. We fuse cutting-edge technologies with
                            a keen eye for design, ensuring our clients (and
                            their users) have a memorable, high-performance
                            journey. Stay tuned for more details on our story,
                            our values, and our approach to innovation!
                        </p>
                    </section>

                    {}
                    <section className='p-8 bg-brandGray-800/60 rounded-md shadow-md mx-4 mb-8'>
                        <h2 className='text-3xl font-semibold mb-4'>
                            Services
                        </h2>
                        <div className='grid gap-4 md:grid-cols-3'>
                            <div className='p-4 bg-brandGray-900 rounded-md'>
                                <h3 className='text-xl font-bold mb-2'>
                                    Web Dev
                                </h3>
                                <p className='text-sm'>
                                    Modern front-end frameworks, integrated
                                    back-end, and fully responsive designs.
                                </p>
                            </div>
                            <div className='p-4 bg-brandGray-900 rounded-md'>
                                <h3 className='text-xl font-bold mb-2'>
                                    Branding
                                </h3>
                                <p className='text-sm'>
                                    From logo creation to brand guidelines and
                                    messaging, we shape identity.
                                </p>
                            </div>
                            <div className='p-4 bg-brandGray-900 rounded-md'>
                                <h3 className='text-xl font-bold mb-2'>
                                    UI/UX
                                </h3>
                                <p className='text-sm'>
                                    User-centric design focusing on seamless,
                                    delightful interactions.
                                </p>
                            </div>
                        </div>
                    </section>

                    {}
                    <section className='p-8 bg-brandGray-800/30 rounded-md shadow-md mx-4 mb-8'>
                        <h2 className='text-3xl font-semibold mb-4'>
                            Testimonials
                        </h2>
                        <div className='space-y-4'>
                            <blockquote className='italic'>
                                "MyBrand delivered an outstanding product. The
                                attention to detail and performance exceeded our
                                expectations!"
                                <footer className='mt-1 text-right'>
                                    — Happy Client
                                </footer>
                            </blockquote>
                            <blockquote className='italic'>
                                "From concept to launch, the MyBrand team was
                                incredible to work with. Our site is stunning
                                and easy to maintain."
                                <footer className='mt-1 text-right'>
                                    — Another Satisfied Customer
                                </footer>
                            </blockquote>
                        </div>
                    </section>

                    {}
                    <section className='p-8'>
                        <h2 className='text-3xl font-semibold mb-2'>
                            Contact Me
                        </h2>
                        <p className='mb-6'>
                            Interested in learning more or collaborating? We’d
                            love to hear from you. This is just a placeholder—
                            check back soon for a fully functional contact form!
                        </p>
                    </section>

                    {}
                    <div className='h-24' />
                </main>
                <Footer />
            </div>
        </div>
    )
}
