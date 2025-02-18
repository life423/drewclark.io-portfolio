import React from 'react'

export default function Projects() {
    return (
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
    )
}
