import React from 'react';
import clsx from 'clsx';
import { brandGreen, neonOrange, brandGray } from '../../../styles/colors';

/**
 * Enhanced project markers that display on the progress timeline
 * Shows completed, current, and upcoming projects with sophisticated styling
 * and improved interaction states
 */
const ProjectMarkers = ({ currentProject, totalProjects, onProjectClick }) => {
  return (
    <div className="absolute inset-0 flex justify-between items-center px-[2px]">
      {Array.from({ length: totalProjects }).map((_, index) => (
        <button
          key={index}
          onClick={() => onProjectClick?.(index + 1)}
          className={clsx(
            'group relative w-4 h-4 rounded-full transition-all duration-300',
            'hover:scale-110 focus:outline-none focus:ring-2 focus:ring-brandGreen-500/50',
            index + 1 === currentProject && 'z-10'
          )}
          aria-label={`Project ${index + 1}`}
          aria-current={index + 1 === currentProject ? 'step' : undefined}
        >
          <div className={clsx(
            'absolute inset-0 rounded-full transform transition-all duration-300',
            'border-2',
            index + 1 === currentProject
              ? 'border-neonOrange-500 scale-100 animate-pulse-subtle'
              : index + 1 < currentProject
                ? 'border-brandGreen-500 scale-90'
                : 'border-brandGray-600 scale-75'
          )} />
          
          {/* Hover tooltip */}
          <div className={clsx(
            'absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1',
            'bg-brandGray-800 rounded text-xs text-white whitespace-nowrap',
            'opacity-0 group-hover:opacity-100 transition-opacity duration-200',
            'pointer-events-none'
          )}>
            Project {index + 1}
          </div>
        </button>
      ))}
    </div>
  );
};

export default React.memo(ProjectMarkers);
