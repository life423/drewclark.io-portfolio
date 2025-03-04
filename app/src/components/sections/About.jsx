// FILE: app/src/components/sections/About.jsx
import React from 'react'

export default function About() {
  return (
    <section className="py-12">
      <div className="mx-auto max-w-3xl text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-8">
          About Us
        </h2>
        <div className="space-y-4 text-white/90">
          <p>
            At Clark Company Limited, we craft innovative digital
            solutions that empower businesses and engage audiences.
            Our multidisciplinary team excels in delivering
            cutting-edge technology and creative design.
          </p>
          <p>
            We pride ourselves on our commitment to quality and our
            ability to adapt to the ever-changing digital landscape.
          </p>
        </div>
      </div>
    </section>
  )
}
