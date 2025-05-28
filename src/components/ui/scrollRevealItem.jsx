import React, { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';

const ScrollRevealItem = ({ piece, index, handlePieceClick, totalPieces }) => {
  const [isVisible, setIsVisible] = useState(false);
  const itemRef = useRef(null);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        // When item enters viewport
        if (entry.isIntersecting) {
          // Add a small delay for staggered appearance
          setTimeout(() => {
            setIsVisible(true);
          }, 150 * index);
        } else {
          // When item exits viewport - make it fade out
          setIsVisible(false);
        }
        // Don't unobserve - keep tracking for both entering and exiting
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
  }, [index]); // Added index to dependencies

    const isDesktop = windowWidth > 840;

  // Generate a dynamic position and rotation for the image
  const getPositionStyle = (index, total) => {
    // Different positions based on index
    const positions = [
      { left: '3%', maxWidth: isDesktop ?  '30%':'88%' },
      { left: '25%', maxWidth:isDesktop ?  '46%': '80%' },
      { left: '10%', maxWidth:isDesktop ?  '52%': '85%' },
      { left: '20%', maxWidth:isDesktop ?  '39%': '70%' },
      { left: '5%', maxWidth: isDesktop ?  '40%':'78%' }
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
        opacity: isVisible ? 1 : 0, // Fade in/out based on visibility
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