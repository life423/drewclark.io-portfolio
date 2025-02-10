// FILE: app/src/components/layout/BackgroundOverlay.jsx
import React from 'react'
import sprout from '../../assets/sprout-mobile.jpg'

export default function BackgroundOverlay() {
    return (
        <div
            className='fixed inset-0 -z-10 bg-cover bg-no-repeat bg-center filter brightness-75 transition-opacity duration-300 opacity-60'
            style={{
                backgroundImage: `linear-gradient(to bottom right, rgba(4,120,87,0.6), rgba(52,211,153,0.6)), url(${sprout})`,
            }}
        />
    )
}
