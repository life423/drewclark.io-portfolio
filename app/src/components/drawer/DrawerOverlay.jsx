// File: app/src/components/drawer/DrawerOverlay.jsx
import React from 'react'
import clsx from 'clsx'

function DrawerOverlay({ isOpen, onClick }) {
    return (
        <div
            className={clsx(
                'fixed inset-0 z-60 bg-brandGray-900/80 transition-opacity duration-300',
                {
                    'opacity-100 pointer-events-auto': isOpen,
                    'opacity-0 pointer-events-none': !isOpen,
                }
            )}
            onClick={onClick}
            aria-hidden='true'
            tabIndex={-1}
            role='presentation'
        />
    )
}

export default DrawerOverlay
