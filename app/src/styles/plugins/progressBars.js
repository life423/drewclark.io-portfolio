import plugin from 'tailwindcss/plugin'
import { getInterpolatedColor } from '../../components/utils/colorInterpolate'

export default plugin(function ({ addComponents, theme }) {
  const progressBarComponents = {
    '.progress-bar-base': {
      position: 'fixed',
      left: 0,
      height: '0.25rem', // h-1
      zIndex: 60,
      transitionProperty: 'all',
      transitionDuration: '300ms',
    },
    
    // For the interpolated color background, we'll use a custom CSS variable
    // that will be set by the component
    '.progress-bar-interpolated': {
      backgroundColor: 'var(--progress-color)',
      boxShadow: '0 0 8px var(--progress-color), 0 0 2px var(--progress-color)',
      borderRadius: '1px',
    }
  }

  addComponents(progressBarComponents)
})
