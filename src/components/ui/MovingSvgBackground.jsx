import React, { useEffect, useState, useMemo } from 'react';

// Individual insect component
const Insect = ({ 
  src,
  type = 'default',
  size = 30,
  opacity = 0.7,
  zIndex = -1,
  initialPosition,
  speed = 1,
  rotationSpeed = 0.5,
  moveStyle = 'wander'
}) => {
  const [position, setPosition] = useState(initialPosition);
  const [rotation, setRotation] = useState(Math.random() * 360);
  const [direction, setDirection] = useState(Math.random() * 2 * Math.PI);
  
  // Different movement behavior based on insect type
  const getMovementSettings = () => {
    switch(type) {
      case 'ant':
        return {
          directionChangeRate: 0.2,
          speedMultiplier: 0.8,
          wiggleAmount: 0.3
        };
      case 'bee':
        return {
          directionChangeRate: 0.5,
          speedMultiplier: 1.5,
          wiggleAmount: 0.8
        };
      case 'mosquito':
        return {
          directionChangeRate: 0.8,
          speedMultiplier: 2.0,
          wiggleAmount: 1.2
        };
      case 'fly':
        return {
          directionChangeRate: 0.7,
          speedMultiplier: 1.8,
          wiggleAmount: 1.0
        };
      default:
        return {
          directionChangeRate: 0.3,
          speedMultiplier: 1.0,
          wiggleAmount: 0.5
        };
    }
  };
  
  const movementSettings = useMemo(getMovementSettings, [type]);
  
  useEffect(() => {
    // Create movement pattern based on insect type
    const moveInsect = () => {
      if (moveStyle === 'wander') {
        // Change direction based on insect type
        const directionChange = (Math.random() - 0.5) * movementSettings.wiggleAmount;
        const newDirection = direction + directionChange;
        
        // Calculate new position based on speed and type
        const effectiveSpeed = speed * movementSettings.speedMultiplier;
        const newX = position.x + Math.cos(newDirection) * effectiveSpeed;
        const newY = position.y + Math.sin(newDirection) * effectiveSpeed;
        
        // Keep in bounds (0-100%)
        const boundedX = Math.max(0, Math.min(100, newX));
        const boundedY = Math.max(0, Math.min(100, newY));
        
        // Change direction more dramatically if hitting a wall
        if (boundedX !== newX || boundedY !== newY) {
          setDirection(Math.random() * 2 * Math.PI);
        } else {
          setDirection(newDirection);
        }
        
        // Update position
        setPosition({ x: boundedX, y: boundedY });
        
        // Update rotation to match direction of movement
        const newRotation = (Math.atan2(Math.sin(newDirection), Math.cos(newDirection)) * 180 / Math.PI) + 90;
        setRotation(newRotation);
      }
    };
    
    // Update interval based on insect type
    const intervalTime = 50 / movementSettings.speedMultiplier;
    const intervalId = setInterval(moveInsect, intervalTime);
    
    return () => clearInterval(intervalId);
  }, [position, direction, speed, moveStyle, type, movementSettings]);
  
  return (
    <div style={{
      position: 'fixed',
      left: `${position.x}%`,
      top: `${position.y}%`,
      transform: `translate(-50%, -50%) rotate(${rotation}deg)`,
      width: `${size}px`,
      height: 'auto',
      opacity: opacity,
      zIndex: zIndex,
      pointerEvents: 'none',
      transition: 'transform 0.1s ease-out',
    }}>
      <img 
        src={src}
        alt={`${type} insect`}
        style={{
          width: '100%',
          height: '100%',
        }}
      />
    </div>
  );
};

// Insects colony component
const InsectColony = ({ insects = [], count = 5 }) => {
  // Generate the insect instances with randomized properties
  const generateInsects = () => {
    const insectInstances = [];
    let insectIndex = 0;
    
    for (let i = 0; i < count; i++) {
      // Cycle through the provided insects array
      const insectTemplate = insects[insectIndex % insects.length];
      insectIndex++;
      
      // Create instance with randomized values
      insectInstances.push({
        id: i,
        src: insectTemplate.src,
        type: insectTemplate.type,
        size: insectTemplate.size || Math.floor(Math.random() * 20) + 20, // 20-40px default
        opacity: insectTemplate.opacity || (Math.random() * 0.4) + 0.4, // 0.4-0.8 default
        initialPosition: insectTemplate.initialPosition || { 
          x: Math.random() * 100, 
          y: Math.random() * 100 
        },
        speed: insectTemplate.speed || (Math.random() * 0.8) + 0.3, // 0.3-1.1 default
        zIndex: insectTemplate.zIndex || -1 - Math.floor(Math.random() * 3), // -1 to -3 default
        moveStyle: insectTemplate.moveStyle || 'wander'
      });
    }
    
    return insectInstances;
  };
  
  // Create insect instances when component mounts
  const [insectInstances] = useState(generateInsects);
  
  return (
    <>
      {insectInstances.map(insect => (
        <Insect
          key={insect.id}
          src={insect.src}
          type={insect.type}
          size={insect.size}
          opacity={insect.opacity}
          initialPosition={insect.initialPosition}
          speed={insect.speed}
          zIndex={insect.zIndex}
          moveStyle={insect.moveStyle}
        />
      ))}
    </>
  );
};

export default InsectColony;