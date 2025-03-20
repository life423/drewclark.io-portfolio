import React from 'react';
import PropTypes from 'prop-types';
import ProgressBar from './ProgressBar';
import ProjectMarkers from './ProjectMarkers';
import clsx from 'clsx';

/**
 * ProjectProgressIndicator - Shows visual indication of progress through projects
 * Features:
 * - Interactive timeline with progress bar
 * - Project markers showing completed, current, and upcoming states
 * - Dynamic status message
 * - Accent-focused color progression
 */
const ProjectProgressIndicator = ({ 
  currentProject,
  totalProjects,
  onProjectClick
}) => {
  // Calculate progress percentage
  const progress = ((currentProject) / totalProjects) * 100;
  
  return (
    <div 
      className="flex items-center gap-4 text-sm px-5"
      role="region" 
      aria-label="Project progress indicator"
    >
      {/* Interactive Timeline */}
      <div className="relative flex-grow h-1 bg-brandGray-700 rounded-full overflow-hidden">
        {/* Animated Progress Bar */}
        <ProgressBar progress={progress} />
        
        {/* Project Markers */}
        <ProjectMarkers 
          currentProject={currentProject}
          totalProjects={totalProjects}
          onProjectClick={onProjectClick}
        />
      </div>

      {/* Project Progress Counter */}
      <div className="flex items-center gap-2 min-w-[120px] text-brandGray-400" style={{
          justifyContent: "flex-end"
      }}>
        <span className="font-mono">
          {currentProject.toString().padStart(2, '0')}/{totalProjects.toString().padStart(2, '0')}
        </span>
      </div>
    </div>
  );
};

ProjectProgressIndicator.propTypes = {
  currentProject: PropTypes.number.isRequired,
  totalProjects: PropTypes.number.isRequired,
  onProjectClick: PropTypes.func
};

export default React.memo(ProjectProgressIndicator);
