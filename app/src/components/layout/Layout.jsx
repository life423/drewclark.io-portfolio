// FILE: app/src/components/layout/Layout.jsx
import React from 'react'
import clsx from 'clsx'
import NavBar from '../navbar/Navbar'
import ProgressBar from '../progress/ProgressBar'
import Hero from '../hero/Hero'
import Footer from '../footer/Footer'

export default function Layout({
    drawerOpen,
    openDrawer,
    closeDrawer,
    children,
}) {
    return (
        <div className='relative min-h-screen flex flex-col overflow-x-hidden bg-brandGray-500'>
            {/* Navigation Area */}
            <header>
                <NavBar
                    drawerOpen={drawerOpen}
                    setDrawerOpen={openDrawer}
                    closeDrawer={closeDrawer}
                />
                {/* <ProgressBar /> */}
                 {!drawerOpen && <ProgressBar />}
               
            </header>

            {/* Hero Section */}
            <Hero />

            {/* Main Content */}
            <main
                id='content'
                className='flex-grow transition-transform duration-300 '
            >
                {/* About Section */}
                <section className='p-8'>
                    <h2 className='text-3xl font-bold mb-4 text-white'>About Us</h2>
                    <p className='mb-6 text-white'>
                        At Clark Company Limited, we craft innovative digital
                        solutions that empower businesses and engage audiences.
                        Our multidisciplinary team excels in delivering
                        cutting‐edge technology and creative design.
                    </p>
                    <p className='text-white'>
                        We pride ourselves on our commitment to quality and our
                        ability to adapt to the ever‐changing digital landscape.
                    </p>
                </section>

                {/* Projects Section */}
                <section className='p-8 bg-brandGray-800/60 rounded-md shadow-md mx-4 mb-8'>
                    <h2 className='text-3xl font-semibold mb-2 text-white'>
                        Our Projects
                    </h2>
                    <p className='mb-4 text-white'>
                        Explore our portfolio of projects that demonstrate our
                        expertise in web development, branding, and UX design.
                    </p>
                    <ul className='list-disc list-inside pl-4 space-y-2 text-white'>
                        <li>
                            <strong>Project Alpha:</strong> A responsive web app
                            built with React and Tailwind.
                        </li>
                        <li>
                            <strong>Project Beta:</strong> A mobile-first
                            e-commerce platform that redefines user experience.
                        </li>
                        <li>
                            <strong>Project Gamma:</strong> A progressive web
                            app delivering seamless performance.
                        </li>
                    </ul>
                </section>

                {/* Services Section */}
                <section className='p-8'>
                    <h2 className='text-3xl font-bold mb-4 text-white'>
                        Our Services
                    </h2>
                    <p className='mb-4 text-white'>
                        We offer a range of services to help your business
                        thrive:
                    </p>
                    <div className='grid gap-4 md:grid-cols-3'>
                        <div className='p-4 bg-brandGray-900 rounded-md'>
                            <h3 className='text-xl font-bold mb-2 text-white'>
                                Web Development
                            </h3>
                            <p className='text-sm text-white'>
                                Modern, scalable solutions using the latest
                                technologies.
                            </p>
                        </div>
                        <div className='p-4 bg-brandGray-900 rounded-md'>
                            <h3 className='text-xl font-bold mb-2 text-white'>
                                Branding
                            </h3>
                            <p className='text-sm text-white'>
                                From logo creation to comprehensive brand
                                identity.
                            </p>
                        </div>
                        <div className='p-4 bg-brandGray-900 rounded-md'>
                            <h3 className='text-xl font-bold mb-2 text-white'>
                                UI/UX Design
                            </h3>
                            <p className='text-sm text-white'>
                                User-centric designs that create seamless,
                                engaging experiences.
                            </p>
                        </div>
                    </div>
                </section>

                {/* Testimonials Section */}
                <section className='p-8 bg-brandGray-800/30 rounded-md shadow-md mx-4 mb-8'>
                    <h2 className='text-3xl font-semibold mb-4 text-white'>
                        Testimonials
                    </h2>
                    <blockquote className='italic mb-4 text-white'>
                        "Clark Company Limited transformed our digital presence.
                        Their innovative approach exceeded our expectations!"
                        <footer className='mt-2 text-right'>
                            — Satisfied Client
                        </footer>
                    </blockquote>
                    <blockquote className='italic text-white'>
                        "Their expertise in both design and development helped
                        our project reach new heights."
                        <footer className='mt-2 text-right'>
                            — Happy Customer
                        </footer>
                    </blockquote>
                </section>

                {/* Contact Section */}
                <section className='p-8'>
                    <h2 className='text-3xl font-bold mb-4 text-white'>
                        Get In Touch
                    </h2>
                    <p className='mb-6 text-white'>
                        Ready to transform your digital presence? Contact us to
                        discuss your project needs.
                    </p>
                    <a
                        href='#contact'
                        className='inline-block px-8 py-4 bg-brandGreen-500 text-white font-semibold rounded-md shadow-lg hover:bg-brandGreen-600 transition-colors duration-300'
                    >
                        Contact Us
                    </a>
                </section>
            </main>

            {/* Footer always at the bottom */}
            <Footer />
        </div>
    )
}
