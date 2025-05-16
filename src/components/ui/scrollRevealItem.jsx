import React, { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';





const ScrollRevealItem = ({ piece, index, handlePieceClick, totalPieces }) => {
  const [isVisible, setIsVisible] = useState(false);
  const itemRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        // When item enters viewport with 20% visibility
        if (entry.isIntersecting) {
          // Set a delay based on index to create sequential reveal
          setTimeout(() => {
            setIsVisible(true);
            // Once revealed, unobserve
            observer.unobserve(entry.target);
          }, 150 * index); // Slight staggered reveal
        } else {
          // When item exits viewport
          setIsVisible(false);
        }
      },
      {
        threshold: 0.2, // Trigger when 20% of the item is visible
        rootMargin: '0px 0px -10% 0px' // Adjust based on when you want reveal to happen
      }
    );

    if (itemRef.current) {
      observer.observe(itemRef.current);
    }

    return () => {
      if (itemRef.current) {
        observer.unobserve(itemRef.current);
      }
    };
  }, []);

  // Generate a dynamic position and rotation for the image
  const getPositionStyle = (index, total) => {
    // Different positions based on index
   const positions = [
  { left: '3%', maxWidth: '88%' },     // Increased from 50% to 75%
  { left: '25%', maxWidth: '80%' },    // Increased from 55% to 80%
  { left: '10%', maxWidth: '85%' },    // Increased from 60% to 85%
  { left: '20%', maxWidth: '70%' },    // Increased from 45% to 70%
  { left: '5%', maxWidth: '78%' }      // Increased from 40% to 78%
];
    
    // Use modulo to cycle through positions for more than 5 images
    const posIndex = index % positions.length;
    const position = positions[posIndex];
    
    // Calculate a slight rotation between -5 and 5 degrees
    const rotation = ((index % 3) - 1) * 3;
    
    // Calculate margin-top to create a staggered effect
    const marginTop = index === 0 ? '0px' : `${50 + (index * 20)}px`;

    return {
      ...position,
      marginTop,
      transform: `rotate(${rotation}deg)`,
      zIndex: total - index // Higher items appear on top
    };
  };

  const posStyle = getPositionStyle(index, totalPieces);

  return (
    <div 
      ref={itemRef}
      className="scroll-reveal-item"
      onClick={() => handlePieceClick(piece)}
      style={{
        position: 'relative',
        marginBottom: '60px',
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 
          `translateY(0) rotate(${posStyle.transform})` : 
          'translateY(50px) rotate(0deg)',
        transition: 'opacity 0.8s ease, transform 0.8s ease',
        left: posStyle.left,
        marginTop: posStyle.marginTop,
        maxWidth: posStyle.maxWidth,
        zIndex: posStyle.zIndex,
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        cursor: 'pointer',
        overflow: 'hidden'
      }}
    >
      <img 
        src={piece.pieza || `https://source.unsplash.com/random/800x500?art`} 
        alt={piece.nombre_pieza || 'Visual piece'}
        style={{
          width: '100%',
          height: 'auto',
          objectFit: 'cover',
          display: 'block',
          transition: 'transform 0.5s ease',
          transform: 'scale(1)',
        }}
        onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
        onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
      />
      
    </div>
  );
};

export default ScrollRevealItem;    