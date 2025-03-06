import React, { memo } from 'react';
import PropTypes from 'prop-types';
import { gradients, cards } from '../../styles/utils';

/**
 * ProjectCardFallback - Loading state placeholder for project cards
 */
const ProjectCardFallback = memo(() => {
  return (
    <div className={`${cards.base} p-0.5 animate-pulse bg-gradient-to-br from-brandGray-900 to-brandGray-800`}>
      <div className={`absolute inset-0 ${gradients.cardBorder} opacity-50`}></div>
      
      <div className="relative z-10 h-full bg-brandGray-900 p-5 rounded-[7px] flex flex-col">
        {/* Image placeholder */}
        <div className="relative h-48 w-full mb-4 rounded-md bg-brandGray-800"></div>

        {/* Title placeholder */}
        <div className="h-6 bg-brandGray-800 rounded-md w-3/4 mb-4"></div>

        {/* Description placeholder */}
        <div className="space-y-2 mb-4 flex-grow">
          <div className="h-4 bg-brandGray-800 rounded-md w-full"></div>
          <div className="h-4 bg-brandGray-800 rounded-md w-5/6"></div>
          <div className="h-4 bg-brandGray-800 rounded-md w-4/6"></div>
        </div>
        
        {/* Tags placeholder */}
        <div className="flex flex-wrap gap-2 mb-4">
          <div className="h-6 bg-brandGray-800 rounded-full w-16"></div>
          <div className="h-6 bg-brandGray-800 rounded-full w-20"></div>
          <div className="h-6 bg-brandGray-800 rounded-full w-14"></div>
        </div>
        
        {/* Buttons placeholder */}
        <div className="flex gap-3 mt-auto">
          <div className="h-8 bg-brandGray-800 rounded-md w-20"></div>
          <div className="h-8 bg-brandGray-700 rounded-md w-24"></div>
        </div>
      </div>
    </div>
  );
});

ProjectCardFallback.displayName = 'ProjectCardFallback';

export default ProjectCardFallback;
