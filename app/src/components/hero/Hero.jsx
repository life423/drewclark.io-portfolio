import React from 'react'

export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center px-4 py-32 text-white">
      <div className="container mx-auto">
        <h1 className="text-4xl md:text-6xl font-bold mb-4">
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-brandGreen-300 to-brandBlue-400">
            Drew Clark
          </span>
        </h1>
        <h2 className="text-2xl md:text-3xl mb-8 text-brandGray-100">
          Software Engineer
        </h2>
        <p className="max-w-2xl mb-8 text-lg">
          Creating elegant solutions to complex problems with a focus on user experience and performance.
        </p>
      </div>
    </section>
  )
}
