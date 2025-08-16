// Create a new component for peeking body parts
import React, { useState, useEffect } from 'react';

const PeekingBodyParts = () => {
  const [visibleParts, setVisibleParts] = useState({});

  // Array of 12 body parts - 6 arms and 6 legs
  const bodyParts = [
    // 6 Arms - alternating left/right positions
    {
      id: 'arm1',
      src: 'src/assets/MANIS/manilargo.png',
      position: 'left',
      top: '15%',
      size: '80px'
    },
    {
      id: 'arm2', 
      src: 'src/assets/MANIS/manilargo.png',
      position: 'right',
      top: '25%',
      size: '75px'
    },
    {
      id: 'arm3',
      src: 'src/assets/MANIS/manilargo.png',
      position: 'left',
      top: '35%',
      size: '85px'
    },
    {
      id: 'arm4',
      src: 'src/assets/MANIS/manilargo.png',
      position: 'right',
      top: '45%',
      size: '70px'
    },
    {
      id: 'arm5',
      src: 'src/assets/MANIS/manilargo.png',
      position: 'left',
      top: '55%',
      size: '78px'
    },
    {
      id: 'arm6',
      src: 'src/assets/MANIS/manilargo.png',
      position: 'right',
      top: '65%',
      size: '82px'
    },
    // 6 Legs - alternating left/right positions
    {
      id: 'leg1',
      src: 'src/assets/MANIS/manilargo.png',
      position: 'left',
      bottom: '30%',
      size: '90px'
    },
    {
      id: 'leg2',
      src: 'src/assets/MANIS/manilargo.png',
      position: 'right',
      bottom: '25%', 
      size: '85px'
    },
    {
      id: 'leg3',
      src: 'src/assets/MANIS/manilargo.png',
      position: 'left',
      bottom: '20%',
      size: '88px'
    },
    {
      id: 'leg4',
      src: 'src/assets/MANIS/manilargo.png',
      position: 'right',
      bottom: '15%',
      size: '92px'
    },
    {
      id: 'leg5',
      src: 'src/assets/MANIS/manilargo.png',
      position: 'left',
      bottom: '10%',
      size: '87px'
    },
    {
      id: 'leg6',
      src: 'src/assets/MANIS/manilargo.png',
      position: 'right',
      bottom: '5%',
      size: '89px'
    }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      // Randomly pick a body part to show
      const randomPart = bodyParts[Math.floor(Math.random() * bodyParts.length)];
      
      // Show the part
      setVisibleParts(prev => ({ ...prev, [randomPart.id]: true }));
      
      // Hide it after 2-3 seconds
      setTimeout(() => {
        setVisibleParts(prev => ({ ...prev, [randomPart.id]: false }));
      }, 2500);
      
    }, 4000); // New part every 4 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <>
      {bodyParts.map((part) => (
        <div
          key={part.id}
          className={`peeking-part peeking-part--${part.position} ${
            visibleParts[part.id] ? 'visible' : ''
          }`}
          style={{
            position: 'absolute',
            [part.position]: visibleParts[part.id] ? '10px' : '-100px', // Slide in/out
            top: part.top || 'auto',
            bottom: part.bottom || 'auto',
            width: part.size,
            height: part.size,
            zIndex: 5,
            transition: 'all 0.8s ease-in-out',
            pointerEvents: 'none'
          }}
        >
          <img 
            src={part.src}
            alt={`Body part ${part.id}`}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'contain',
              filter: 'drop-shadow(2px 2px 4px rgba(0,0,0,0.3))'
            }}
          />
        </div>
      ))}
    </>
  );
};

// CSS styles to add to your figureBackgroundStyles


export default PeekingBodyParts;