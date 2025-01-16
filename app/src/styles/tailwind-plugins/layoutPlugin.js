// app/src/styles/tailwind-plugins/layoutPlugin.js

export default function layoutPlugin({ addBase }) {
    addBase({
        html: {
            // Maybe enable smooth scrolling or advanced HTML-level styles
            'scroll-behavior': 'smooth',
        },
        body: {
            // If you want the default transform origin or transition on the entire body
            'transform-origin': 'left center',
            transition: 'transform 0.3s ease-in-out',
        },
        '.drawer-open body': {
            /* 
               This is the key to pushing the entire page aside 
               whenever .drawer-open is on <html>. 
            */
            transform: 'translateX(70%) scale(0.95) rotateY(3deg)',
        },
    })
}
