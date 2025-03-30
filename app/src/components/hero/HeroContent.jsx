import React from 'react'
import PropTypes from 'prop-types'
import ProgressiveElement from '../utils/ProgressiveElement'
import PrimaryButton from '../utils/PrimaryButton'

/**
 * Hero content section with progressive loading animations
 */
const HeroContent = ({ isLoaded }) => {
  // Specialty tags with standardized color naming
  const renderSpecialtyTags = () => (
    <div className='flex gap-2 mb-3'>
      <span className='px-2 py-0.5 bg-brandGreen-800/70 rounded text-xs font-medium text-brandGreen-100 border border-brandGreen-500/40 whitespace-nowrap'>
        Full-Stack
      </span>
      <span className='px-2 py-0.5 bg-brandBlue-800/70 rounded text-xs font-medium text-brandBlue-100 border border-brandBlue-500/40 whitespace-nowrap'>
        Cloud
      </span>
      <span className='px-2 py-0.5 bg-brandOrange-900/70 rounded text-xs font-medium text-brandOrange-100 border border-brandOrange-600/40 whitespace-nowrap'>
        AI
      </span>
    </div>
  );

  return (
    <div className='container mx-auto z-10 relative'>
      {/* Progressive name element - Stage 1 */}
      <ProgressiveElement
        id='hero-name'
        appearDelay={0}
        focusStage={1}
        className='relative mb-8'
      >
        <span
          className='absolute -inset-x-4 -inset-y-2 bg-gradient-to-r 
             from-brandGray-900/85 to-brandGray-900/40 rounded-lg blur-xl'
        ></span>
        <h1 className='relative text-4xl md:text-6xl font-bold'>
          <span
            className='inline-block bg-clip-text text-transparent bg-gradient-to-r 
               from-brandGreen-300 via-brandGreen-200 to-brandBlue-400'
          >
            Drew Clark
          </span>
        </h1>
      </ProgressiveElement>

      {/* Progressive role element - Stage 2 */}
      <ProgressiveElement
        id='hero-role'
        appearDelay={300}
        focusStage={2}
        className='block mt-4'
      >
        <h2 className='text-2xl md:text-3xl mb-2 font-light text-white'>
          Software Engineer
        </h2>
      </ProgressiveElement>
      
      {/* Specialty tags moved outside ProgressiveElement */}
      {renderSpecialtyTags()}

      {/* Progressive description - Stage 3 */}
      <ProgressiveElement
        id='hero-description'
        appearDelay={600}
        focusStage={3}
        className='block mt-8 mb-10'
      >
        <div className='relative max-w-2xl'>
          <div className='absolute inset-0 bg-brandGray-900/40 rounded-lg border-l-2 border-brandGreen-500/40 pointer-events-none'></div>
          <p className='relative px-3 py-2 text-lg text-white font-medium leading-relaxed'>
            Creating elegant solutions to complex problems with
            a focus on user experience and performance.
          </p>
        </div>
      </ProgressiveElement>

      {/* Progressive CTA - Stage 4 */}
      <ProgressiveElement
        id='hero-cta'
        appearDelay={900}
        focusStage={4}
      >
        <PrimaryButton href='#projects'>
          <span className='text-white font-medium'>
            Featured Projects
          </span>
        </PrimaryButton>
      </ProgressiveElement>
    </div>
  );
};

HeroContent.propTypes = {
  isLoaded: PropTypes.bool
};

export default HeroContent;
