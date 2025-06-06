import React, { useRef, useEffect } from 'react';

const GridBackground = () => {
  const gridRef = useRef(null);
  const mousePos = useRef({ x: 0, y: 0 });
  const animatedPos = useRef({ x: 0, y: 0 });
  const animationFrameId = useRef(null);

  useEffect(() => {
    const handleMouseMove = (e) => {
      mousePos.current = { x: e.clientX, y: e.clientY };
    };
    
    const animate = () => {
      const dx = mousePos.current.x - animatedPos.current.x;
      const dy = mousePos.current.y - animatedPos.current.y;
      
      animatedPos.current.x += dx * 0.08;
      animatedPos.current.y += dy * 0.08;

      if (gridRef.current) {
        gridRef.current.style.setProperty('--mouse-x', `${animatedPos.current.x}px`);
        gridRef.current.style.setProperty('--mouse-y', `${animatedPos.current.y}px`);
      }

      animationFrameId.current = requestAnimationFrame(animate);
    };

    window.addEventListener('mousemove', handleMouseMove);
    
    animationFrameId.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, []);

  return <div ref={gridRef} className="grid-background"></div>;
};

export default GridBackground;