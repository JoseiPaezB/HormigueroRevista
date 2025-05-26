import React, { useEffect, useState, useRef } from 'react';
import hormigueroLogo from '../../assets/anticon2.svg'; // Make sure path is correct


const FloatingHormiguearButton = ({ handleHormiguear, stopAtElement, offsetBeforeStop = 150 }) => {
    const [buttonStyle, setButtonStyle] = useState({
        position: 'fixed',
        right: '5px',
        top: '40%',
        zIndex: 999,
        transition: 'all 0.3s ease',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center'
      });
  
  const buttonRef = useRef(null);
  const stopElementRef = useRef(null);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const isDesktop = windowWidth > 840;
  useEffect(() => {
    // Set reference to the stop element if provided
    if (stopAtElement && stopAtElement.current) {
      stopElementRef.current = stopAtElement.current;
    }

    const handleScroll = () => {
      if (!buttonRef.current || !stopElementRef.current) return;
      
      // Get button dimensions
      const buttonHeight = buttonRef.current.offsetHeight;
      
      // Get the position of the stop element relative to the document
      const stopElementBounds = stopElementRef.current.getBoundingClientRect();
      const stopElementTopPosition = window.scrollY + stopElementBounds.top;
      
      // Use the offsetBeforeStop prop passed from the parent component
      const offsetBeforeSection = offsetBeforeStop; // Custom offset to stop well before the section
      
      // Current scroll position
      const scrollPosition = window.scrollY;
      
      // Calculate the absolute position where the button should stop
      const absoluteStopPosition = stopElementTopPosition - buttonHeight - offsetBeforeSection;
      
      if (scrollPosition + window.innerHeight / 2 > absoluteStopPosition) {
        // We've scrolled past the stopping point, switch to absolute positioning
        setButtonStyle(prev => ({
          ...prev,
          position: 'absolute',
          top: `${absoluteStopPosition}px`,
        }));
      } else {
        // Keep using fixed positioning
        setButtonStyle(prev => ({
          ...prev,
          position: 'fixed',
          top: '40%',
        }));
      }
    };

    window.addEventListener('scroll', handleScroll);
    // Run once to set initial position
    handleScroll();
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, [stopAtElement]);

  return (
    <div ref={buttonRef} style={buttonStyle}>
      <button
        onClick={handleHormiguear}
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          background: 'white',
          border: '1px solid #ddd',
          borderRadius: '50%',
          padding: isDesktop ? '10px':'6px',
          cursor: 'pointer',
          boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
          transition: 'transform 0.2s, box-shadow 0.2s'
        }}
        onMouseOver={(e) => {
          e.currentTarget.style.transform = 'scale(1.05)';
          e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.2)';
        }}
        onMouseOut={(e) => {
          e.currentTarget.style.transform = 'scale(1)';
          e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.15)';
        }}
      >
        <img 
          src={hormigueroLogo} 
          alt="Hormiguear" 
          style={{  width: isDesktop ? '30px':'20px', height: 'auto' }} 
        />
        
      </button>
    </div>
  );
};

export default FloatingHormiguearButton;