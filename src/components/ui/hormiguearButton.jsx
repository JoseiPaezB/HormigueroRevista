import React, { useEffect, useState, useRef } from 'react';
import hormigueroLogo from '../../assets/anticon.svg'; // Make sure path is correct

const FloatingHormiguearButton = ({ handleHormiguear, stopAtElement }) => {
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

  useEffect(() => {
    // Set reference to the stop element if provided
    if (stopAtElement && stopAtElement.current) {
      stopElementRef.current = stopAtElement.current;
    }

    const handleScroll = () => {
      if (!buttonRef.current || !stopElementRef.current) return;
      
      const stopElementBounds = stopElementRef.current.getBoundingClientRect();
      const buttonHeight = buttonRef.current.offsetHeight;
      
      // Calculate the threshold where the button should stop
      // This is the top position of the stop element minus button height and some padding
      const stopThreshold = stopElementBounds.top - buttonHeight - 20;
      
      if (stopThreshold <= 0) {
        // Stop element is at or above viewport top, switch to absolute positioning
        setButtonStyle(prev => ({
          ...prev,
          position: 'absolute',
          top: `${window.scrollY + stopThreshold}px`, // Position relative to page
        }));
      } else {
        // Keep fixed positioning while scrolling normally
        setButtonStyle(prev => ({
          ...prev,
          position: 'fixed',
          top: '40%', // Or any desired position
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
      padding: '10px',
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
      style={{ width: '30px', height: 'auto' }} 
    />
    
  </button>
  <span style={{
      fontSize: '10px',
      fontWeight: 'bold',
      marginTop: '5px',
    }}>
      HORMIGUEAR
    </span>
</div>

  );
};

export default FloatingHormiguearButton;