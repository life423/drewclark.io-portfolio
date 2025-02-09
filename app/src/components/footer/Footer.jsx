// FILE: app/src/components/footer/Footer.jsx
import React from 'react'

export default function Footer() {
    return (
        <footer className='mt-16 bg-brandGray-900 text-white relative'>
            {/* Pulse Accent Bar */}
            <div
                className='
          h-2 w-full
          bg-pulse-gradient
          animate-colorPulse
        '
            />

            {/* Footer Content */}
            <div className='py-4 px-4 text-center'>
                <p className='text-sm'> Clark Company Limited </p>
                <p> © {new Date().getFullYear()} </p>
            </div>
        </footer>
    )
}
