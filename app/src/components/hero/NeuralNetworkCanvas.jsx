import React, { useRef, useEffect } from 'react'
import useViewport from '../../hooks/useViewport'
import { brandGreen, brandBlue } from '../../styles/colors'

// Placeholder static canvas with simple dots (temporary solution)
const PlaceholderCanvas = ({ scrollPosition }) => {
  const canvasRef = useRef(null);
  // Latest scroll position for the drawing loop, so scrolling never restarts it
  const scrollRef = useRef(scrollPosition);

  useEffect(() => {
    scrollRef.current = scrollPosition;
  }, [scrollPosition]);

  // One animation loop per mount. Before, every scroll started a new loop that
  // was never cancelled, so the page got slower the longer you scrolled.
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let frameId = null;

    const drawDots = () => {
      ctx.clearRect(0, 0, width, height);

      // Calculate scroll factor (0 to 1)
      const scrollFactor = Math.min(scrollRef.current / 500, 1);

      // Draw 30 dots with random positions
      for (let i = 0; i < 30; i++) {
        const x = Math.random() * width;
        const y = Math.random() * height;
        const size = 2 + Math.random() * 2;
        
        // Color based on position
        let color;
        if (i % 3 === 0) color = brandGreen[400];
        else if (i % 3 === 1) color = brandBlue[500];
        else color = brandGreen[500];
        
        ctx.beginPath();
        ctx.arc(x, y, size * (0.8 + scrollFactor * 0.4), 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.fill();
        
        // Draw lines between some dots
        if (i > 0 && Math.random() > 0.7) {
          const prevX = Math.random() * width;
          const prevY = Math.random() * height;
          
          ctx.beginPath();
          ctx.moveTo(prevX, prevY);
          ctx.lineTo(x, y);
          ctx.strokeStyle = `rgba(255, 255, 255, ${0.1 * scrollFactor})`;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }
    };

    const animate = () => {
      drawDots();
      frameId = requestAnimationFrame(animate);
    };

    if (reduceMotion) {
      drawDots(); // a single still frame for people who prefer less motion
    } else {
      frameId = requestAnimationFrame(animate);
    }

    return () => {
      if (frameId !== null) {
        cancelAnimationFrame(frameId);
      }
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      width={800}
      height={600}
      className="absolute inset-0 w-full h-full"
    />
  );
};

// Main component with temp canvas setup
const NeuralNetworkCanvas = ({ scrollPosition = 0 }) => {
  const mousePosition = useRef({ x: 0, y: 0 });
  const { isDesktop } = useViewport();
  
  // Track mouse position
  const handleMouseMove = (e) => {
    mousePosition.current = {
      x: e.clientX,
      y: e.clientY
    };
  };
  
  // Only render on desktop
  if (!isDesktop) return null;
  
  return (
    <div 
      className="absolute inset-0 z-0 pointer-events-none"
      onMouseMove={handleMouseMove}
      style={{ 
        opacity: 0.4,
        mixBlendMode: 'screen'
      }}
    >
      <PlaceholderCanvas scrollPosition={scrollPosition} />
    </div>
  );
};

export default NeuralNetworkCanvas
