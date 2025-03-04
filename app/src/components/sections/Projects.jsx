// FILE: app/src/components/sections/Projects.jsx
import React from 'react'

export default function Projects() {
  return (
    <section className="py-12">
      <div className="mx-auto max-w-3xl text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-8">
          Our Projects
        </h2>
        <p className="text-white/90 mb-8">
          Explore our portfolio of projects that demonstrate our
          expertise in web development, branding, and UX design.
        </p>
        <ul className="space-y-4 text-left">
          <li className="text-white">
            <strong>Project Alpha:</strong> A responsive web app built with React and Tailwind.
          </li>
          <li className="text-white">
            <strong>Project Beta:</strong> A mobile-first e-commerce platform that redefines user experience.
          </li>
          <li className="text-white">
            <strong>Project Gamma:</strong> A progressive web app delivering seamless performance.
          </li>
        </ul>
      </div>
    </section>
  )
}
