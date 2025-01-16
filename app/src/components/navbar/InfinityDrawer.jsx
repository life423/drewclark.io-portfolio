import React, { useRef } from 'react'

export default function InfinityDrawer({
    isOpen,
    onClose,
    children, // to render nav links or anything else
}) {
    // Handle keyboard events (Escape key) to close the drawer
    function handleKeyDown(e) {
        if (e.key === 'Escape') {
            onClose()
        }
    }

    return (
        <div
            className={`
                fixed top-0 left-0 h-full w-[80%] max-w-sm
                bg-brandGray-900 text-white z-50
                transform transition-transform duration-300
                ${isOpen ? 'translate-x-0' : '-translate-x-full'}
            `}
            tabIndex={-1}
            onKeyDown={handleKeyDown}
            role='dialog'
            aria-modal='true'
        >
            {children}
        </div>
    )
}
