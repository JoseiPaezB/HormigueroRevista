// Create a new component for rotating heads
import React, { useState, useEffect } from 'react';

const RotatingEyes = ({ className = "" }) => {
  const [currentHead, setCurrentHead] = useState(7);
  const [isTransitioning, setIsTransitioning] = useState(false);
  
  // Generate array of head numbers (1-12)
const headNumbers = [1,2,3];

  useEffect(() => {
    const interval = setInterval(() => {
      setIsTransitioning(true);
      
      setTimeout(() => {
        // Get random head number (different from current)
        let nextHead;
        do {
          nextHead = headNumbers[Math.floor(Math.random() * headNumbers.length)];
        } while (nextHead === currentHead && headNumbers.length > 1);
        
        setCurrentHead(nextHead);
        setIsTransitioning(false);
      }, 200); // Quick transition
      
    }, 2000); // Change every 2 seconds

    return () => clearInterval(interval);
  }, [currentHead]);

  return (
    <div className={`rotating-head-container ${className}`} style={{left:'85%',marginTop:'-30rem'}}>
      <img 
        src={`/assets/images/web/ojo${currentHead}.webp`}
        alt={`Colored head ${currentHead}`}
        className={`rotating-head ${isTransitioning ? 'fade-out' : 'fade-in'}`}
      />
    </div>
  );
};

// Updated CSS for the figure with rotating heads


// Updated JSX structure with rotating heads


export default RotatingEyes;