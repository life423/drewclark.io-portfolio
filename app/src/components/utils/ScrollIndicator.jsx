import React from 'react';
import { motion } from 'framer-motion';

const ScrollIndicator = ({ scrollProgress = 0, className = '' }) => {
  return (
    <motion.div
      className={`flex flex-col items-center ${className}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 - Math.min(1, scrollProgress * 2) }}
      transition={{ duration: 0.3 }}
    >
      <div className="text-white/70 text-sm font-medium mb-2">Scroll</div>
      <div className="relative w-6 h-10 border-2 border-white/30 rounded-full overflow-hidden">
        <motion.div
          className="absolute top-1 left-1/2 w-2 h-2 bg-white rounded-full -translate-x-1/2"
          animate={{
            y: [0, 12, 0]
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </div>
    </motion.div>
  );
};

export default ScrollIndicator;
