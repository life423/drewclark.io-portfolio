import React from 'react';
import clsx from 'clsx';
import { brandGreen, neonOrange, brandGray } from '../../../styles/colors';

/**
 * Interactive project markers that display on the progress timeline
 * Shows completed, current, and upcoming projects with appropriate styling
 */
const ProjectMarkers = ({ currentProject, totalProjects, onProjectClick }) => {
  return (
    <div className="absolute inset-0 flex justify-between items-center">
      {Array.from({ length: totalProjects }).map((_, index) => (
        <button
          key={index}
          onClick={() => onProjectClick?.(index)}
          className={clsx(
            'w-3 h-3 rounded-full transform transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-brandGreen-500 group',
            'border-2 border-brandGray-800',
            index < currentProject
              ? 'bg-brandGreen-400 scale-100' // Completed projects
              : index === currentProject
                ? 'bg-neonOrange-500 scale-110 animate-pulse-subtle' // Current project
                : 'bg-brandGray-600 scale-90' // Upcoming projects
          )}
          aria-label={`Go to project ${index + 1}`}
          aria-current={index === currentProject ? 'step' : undefined}
        >
          {/* Tooltip showing project number on hover/focus */}
          <div className={clsx(
            'absolute -top-8 left-1/2 -translate-x-1/2',
            'opacity-0 group-hover:opacity-100 group-focus:opacity-100 transition-opacity duration-200',
            'text-xs text-brandGray-400 whitespace-nowrap bg-brandGray-800 px-2 py-1 rounded pointer-events-none'
          )}>
            {index + 1}/{totalProjects}
          </div>
        </button>
      ))}
    </div>
  );
};

export default React.memo(ProjectMarkers);
