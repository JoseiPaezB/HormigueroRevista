import React, { useEffect, useState, useRef } from 'react';
import hormigueroLogo from '../../assets/anticon.svg'; // Make sure path is correct

const FloatingHormiguearButton = ({ handleHormiguear, stopAtElement, offsetBeforeStop = 150 }) => {
    const [buttonStyle, setButtonStyle] = useState({
        position: 'fixed',
        right: '20px',
        top: '40%',
        zIndex: 999,
        transition: 'all 0.3s ease',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center'
      });
  
  const buttonRef = useRef(null);
  const stopElementRef = useRef(null);
  const hasStoppedRef = useRef(false);
  const stopPositionRef = useRef(0);

  useEffect(() => {
    // Set reference to the stop element if provided
    if (stopAtElement && stopAtElement.current) {
      stopElementRef.current = stopAtElement.current;
    }

    const handleScroll = () => {
      if (!buttonRef.current || !stopElementRef.current) return;
      
      // Get the position of the stop element relative to the document
      const stopElementBounds = stopElementRef.current.getBoundingClientRect();
      const stopElementTopPosition = window.scrollY + stopElementBounds.top;
      
      // Calculate the stopping position (where we want the button to stop)
      const stoppingPosition = stopElementTopPosition - offsetBeforeStop;
      
      // Store the stopping position for reference
      if (stopPositionRef.current === 0) {
        stopPositionRef.current = stoppingPosition;
      }
      
      // Simple logic: when scrolling down and we hit the threshold, fix the position
      if (window.scrollY > stopPositionRef.current) {
        if (!hasStoppedRef.current) {
          // First time reaching the stopping point - fix the position
          setButtonStyle({
            position: 'absolute',
            right: '20px',
            top: `${stopPositionRef.current}px`,
            zIndex: 999
          });
          hasStoppedRef.current = true;
        }
      } else {
        // When scrolling up above the threshold, return to fixed positioning
        if (hasStoppedRef.current) {
          setButtonStyle({
            position: 'fixed',
            right: '20px',
            top: '40%',
            zIndex: 999
          });
          hasStoppedRef.current = false;
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    
    // Run once to set initial position
    handleScroll();
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, [offsetBeforeStop, stopAtElement]);

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
          padding: '10px',
          cursor: 'pointer',
          boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
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
          style={{ width: '30px', height: 'auto' }} 
        />
        
      </button>
      <span style={{
          fontSize: '10px',
          fontWeight: 'bold',
          marginTop: '5px',
          fontFamily: 'JetBrains Mono, monospace'
        }}>
          HORMIGUEAR
        </span>
    </div>
  );
};

export default FloatingHormiguearButton;