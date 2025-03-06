import plugin from 'tailwindcss/plugin'

export default plugin(function ({ addBase, addUtilities }) {
    // 1. Base keyframes for all animations
    addBase({
        '@keyframes pulse': {
            '0%': { transform: 'scale(1)', opacity: '0.7' },
            '50%': { transform: 'scale(1.5)', opacity: '0.3' },
            '100%': { transform: 'scale(2)', opacity: '0' },
        },
        '@keyframes colorPulse': {
            '0%': { backgroundPosition: '0% 50%' },
            '50%': { backgroundPosition: '100% 50%' },
            '100%': { backgroundPosition: '0% 50%' },
        },
        '@keyframes iconPulse': {
            '0%': { transform: 'scale(1)', opacity: '1', color: '#10B981' },
            '25%': { transform: 'scale(1.2)', opacity: '1', color: '#FF6B00' },
            '75%': { transform: 'scale(1.2)', opacity: '1', color: '#FF6B00' },
            '100%': { transform: 'scale(1)', opacity: '1', color: '#10B981' },
        },
        '@keyframes iconTap': {
            '0%': { transform: 'scale(1)', color: '#10B981' },
            '30%': { transform: 'scale(0.9)', color: '#FF6B00' },
            '60%': { transform: 'scale(1.15)', color: '#FF6B00' },
            '100%': { transform: 'scale(1)', color: '#10B981' },
        },
        '@keyframes iconGentlePulse': {
            '0%':   { transform: 'scale(1)', color: '#10B981' },
            '20%':  { transform: 'scale(1.15)', color: '#FF6B00' },
            '50%':  { transform: 'scale(1.2)', color: '#FF6B00', filter: 'drop-shadow(0 0 5px rgba(255,107,0,0.7))' },
            '80%':  { transform: 'scale(1.15)', color: '#FF6B00' },
            '100%': { transform: 'scale(1)', color: '#10B981' },
        },
        '@keyframes subtleWobble': {
            '0%':   { transform: 'scale(1)' },
            '50%':  { transform: 'scale(1.05)' },
            '100%': { transform: 'scale(1)' },
        },
        '@keyframes slightRotate': {
            '0%':   { transform: 'rotate(0deg)' },
            '50%':  { transform: 'rotate(5deg)' },
            '100%': { transform: 'rotate(0deg)' },
        },
        '@keyframes gentleBounce': {
            '0%':   { transform: 'translateY(0)' },
            '50%':  { transform: 'translateY(-2px)' },
            '100%': { transform: 'translateY(0)' },
        },
        '@keyframes faintPulse': {
            '0%':   { opacity: 1 },
            '50%':  { opacity: 0.8 },
            '100%': { opacity: 1 },
        },
        '@keyframes softGlow': {
            '0%':   { filter: 'drop-shadow(0 0 0px #FF6B00)' },
            '50%':  { filter: 'drop-shadow(0 0 6px #FF6B00)' },
            '100%': { filter: 'drop-shadow(0 0 0px #FF6B00)' },
        },
        '@keyframes triplePulseToOrange': {
            '0%':   { filter: 'drop-shadow(0 0 0px #FF6B00)', color: '#FF6B00' },
            '5%':   { filter: 'drop-shadow(0 0 8px #FF6B00)', color: '#FF6B00' },
            '10%':  { filter: 'drop-shadow(0 0 0px #FF6B00)', color: '#FF6B00' },
            '15%':  { filter: 'drop-shadow(0 0 0px #FF6B00)', color: '#FF6B00' },
            '20%':  { filter: 'drop-shadow(0 0 0px #FF6B00)', color: '#FF6B00' },
            '25%':  { filter: 'drop-shadow(0 0 8px #FF6B00)', color: '#FF6B00' },
            '30%':  { filter: 'drop-shadow(0 0 0px #FF6B00)', color: '#FF6B00' },
            '35%':  { filter: 'drop-shadow(0 0 0px #FF6B00)', color: '#FF6B00' },
            '40%':  { filter: 'drop-shadow(0 0 0px #FF6B00)', color: '#FF6B00' },
            '45%':  { filter: 'drop-shadow(0 0 8px #FF6B00)', color: '#FF6B00' },
            '50%':  { filter: 'drop-shadow(0 0 0px #FF6B00)', color: '#FF6B00' },
            '80%':  { filter: 'drop-shadow(0 0 0px #10B981)', color: '#10B981' },
            '100%': { filter: 'drop-shadow(0 0 2px #10B981)', color: '#10B981' },
        },
        '@keyframes drawerLinkPop': {
            '0%': { transform: 'translateY(20px) scale(0.9) rotateX(25deg)', opacity: '0' },
            '40%': { transform: 'translateY(0) scale(1.05) rotateX(0deg)', opacity: '0.8' },
            '80%': { transform: 'translateY(0) scale(1)', opacity: '1' },
            '100%': { transform: 'translateY(0) scale(1)', opacity: '1' },
        },
        '@keyframes navLinkUnderline': {
            '0%': { transform: 'scaleX(0)', opacity: '0' },
            '100%': { transform: 'scaleX(1)', opacity: '1' },
        },
        '@keyframes navLinkGlow': {
            '0%': { textShadow: '0 0 0 rgba(255, 107, 0, 0)' },
            '100%': { textShadow: '0 0 5px rgba(255, 107, 0, 0.3)' },
        },
    });

    // 2. Add the animation utilities
    addUtilities({
        '.animate-pulse-once': {
            animation: 'pulse 1s ease-out 1 forwards',
        },
        '.animate-color-pulse': {
            animation: 'colorPulse 6s ease-in-out infinite',
        },
        '.animate-icon-pulse': {
            animation: 'iconPulse 2.5s cubic-bezier(0.4, 0, 0.2, 1) 1 forwards',
            filter: 'drop-shadow(0 0 4px currentColor)',
        },
        '.animate-icon-tap': {
            animation: 'iconTap 0.8s cubic-bezier(0.4, 0, 0.2, 1) 1 forwards',
            filter: 'drop-shadow(0 0 4px currentColor)',
        },
        '.animate-icon-gentle-pulse': {
            animation: 'iconGentlePulse 2s cubic-bezier(0.4, 0, 0.2, 1) 1 forwards',
            willChange: 'transform, color, filter',
        },
        '.animate-subtle-wobble': {
            animation: 'subtleWobble 1s ease-in-out infinite',
        },
        '.animate-slight-rotate': {
            animation: 'slightRotate 1s ease-in-out infinite',
        },
        '.animate-gentle-bounce': {
            animation: 'gentleBounce 1s ease-in-out infinite',
        },
        '.animate-faint-pulse': {
            animation: 'faintPulse 1.5s ease-in-out infinite',
        },
        '.animate-soft-glow': {
            animation: 'softGlow 1.2s ease-in-out infinite',
            transition: 'all 0.3s ease',
            transform: 'scale(1.05)',
        },
        '.animate-triple-pulse-to-orange': {
            animation: 'triplePulseToOrange 4s ease-in-out 1 forwards',
        },
        '.animate-drawer-link-pop': {
            animation: 'drawerLinkPop 0.6s cubic-bezier(0.25, 0.8, 0.25, 1) forwards',
            'will-change': 'transform, opacity',
        },
        '.animation-delay-0': { 'animation-delay': '0s' },
        '.animation-delay-1': { 'animation-delay': '0.2s' },
        '.animation-delay-2': { 'animation-delay': '0.4s' },
        '.nav-link-hover': {
            position: 'relative',
            transition: 'color 0.3s ease, transform 0.3s ease',
        },
        '.nav-link-hover:hover': {
            color: '#FF6B00', /* neonOrange-500 */
            transform: 'scale(1.03)',
            textShadow: '0 0 5px rgba(255, 107, 0, 0.3)',
        },
        '.nav-link-hover::after': {
            content: '""',
            position: 'absolute',
            bottom: '-4px',
            left: '50%',
            width: '0%',
            height: '2px',
            backgroundColor: '#FF6B00', /* neonOrange-500 */
            transform: 'translateX(-50%) scaleX(0)',
            transformOrigin: 'center',
            transition: 'transform 0.3s ease, width 0.3s ease',
            opacity: '0',
        },
        '.nav-link-hover:hover::after': {
            width: '80%',
            transform: 'translateX(-50%) scaleX(1)',
            opacity: '1',
        },
    });
})
