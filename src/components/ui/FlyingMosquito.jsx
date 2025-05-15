import React, { useState, useEffect } from 'react';
// Import all your SVGs here
// import mosquito from '../../assets/images/mosquito.svg';
// import ant from '../../assets/images/ant.svg';
// import bee from '../../assets/images/bee.svg';
// etc.

const FlyingInsectsSwarm = ({ insects = [] }) => {
  const [isDesktop, setIsDesktop] = useState(
    typeof window !== 'undefined' ? window.innerWidth >= 768 : false
  );

  // Check if desktop on component mount and when window resizes
  useEffect(() => {
    const checkIfDesktop = () => {
      setIsDesktop(window.innerWidth >= 768);
    };
    
    // Initial check
    checkIfDesktop();
    
    // Set up listener for resize
    window.addEventListener('resize', checkIfDesktop);
    
    // Clean up
    return () => window.removeEventListener('resize', checkIfDesktop);
  }, []);
  
  // If no insects provided, don't render anything
  if (!insects || insects.length === 0) return null;
  
  return (
    <>
      {insects.map((insect, index) => {
        // Increase size for desktop - multiply by 1.5x or 2x
        const adjustedSize = isDesktop 
          ? (insect.size || 30) * 1.75
          : (insect.size || 30);
        
        return (
          <FlyingInsect
            key={`flying-insect-${index}`}
            src={insect.src}
            type={insect.type || 'default'}
            size={adjustedSize}
            speed={insect.speed}
            initialPosition={insect.initialPosition}
            isDesktop={isDesktop}
          />
        );
      })}
    </>
  );
};

// Individual flying insect component
const FlyingInsect = ({ src, type = 'default', size = 30, speed, initialPosition, isDesktop }) => {
  // Different behavior profiles for different insect types
  const behaviorProfiles = {
    mosquito: {
      speed: isDesktop ? 2.5 : 2,
      changeDirectionFrequency: 2000,
      buzzFrequency: 100,
      disappearFrequency: 15000,
      disappearDuration: 5000,
      rotationAmount: 20,
      scaleVariation: 0.4
    },
    bee: {
      speed: isDesktop ? 3.5 : 3,
      changeDirectionFrequency: 1500,
      buzzFrequency: 80,
      disappearFrequency: 20000,
      disappearDuration: 3000,
      rotationAmount: 15,
      scaleVariation: 0.3
    },
    ant: {
      speed: isDesktop ? 2 : 1.5,
      changeDirectionFrequency: 3000,
      buzzFrequency: 150,
      disappearFrequency: 25000,
      disappearDuration: 4000,
      rotationAmount: 25,
      scaleVariation: 0.2
    },
    fly: {
      speed: isDesktop ? 3 : 2.5,
      changeDirectionFrequency: 1000,
      buzzFrequency: 50,
      disappearFrequency: 10000,
      disappearDuration: 2000,
      rotationAmount: 30,
      scaleVariation: 0.5
    },
    butterfly: {
      speed: isDesktop ? 1.5 : 1,
      changeDirectionFrequency: 4000,
      buzzFrequency: 200,
      disappearFrequency: 30000,
      disappearDuration: 10000,
      rotationAmount: 40,
      scaleVariation: 0.6
    },
    default: {
      speed: isDesktop ? 2.5 : 2,
      changeDirectionFrequency: 2500,
      buzzFrequency: 120,
      disappearFrequency: 18000,
      disappearDuration: 5000,
      rotationAmount: 25,
      scaleVariation: 0.3
    }
  };
  
  // Get behavior profile based on type, or use default
  const behavior = behaviorProfiles[type] || behaviorProfiles.default;
  
  // Override speed if provided
  if (speed) behavior.speed = speed;
  
  // State for insect position and movement
  const [position, setPosition] = useState(initialPosition || { 
    x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth - size : 500), 
    y: Math.random() * (typeof window !== 'undefined' ? window.innerHeight - size : 500) 
  });
  const [direction, setDirection] = useState({ 
    x: Math.random() * 2 - 1, 
    y: Math.random() * 2 - 1 
  });
  const [rotation, setRotation] = useState(Math.random() * 360);
  const [scale, setScale] = useState(1);
  const [isVisible, setIsVisible] = useState(true);
  
  // Screen boundaries
  const [boundaries, setBoundaries] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 1000,
    height: typeof window !== 'undefined' ? window.innerHeight : 800
  });

  // Update boundaries on window resize
  useEffect(() => {
    const handleResize = () => {
      setBoundaries({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Movement animation
  useEffect(() => {
    if (!isVisible) return;
    
    const moveInsect = () => {
      setPosition(prev => {
        // Calculate new position
        let newX = prev.x + direction.x * behavior.speed;
        let newY = prev.y + direction.y * behavior.speed;
        
        // Bounce off edges
        let newDirectionX = direction.x;
        let newDirectionY = direction.y;
        
        if (newX <= 0 || newX >= boundaries.width - size) {
          newDirectionX = -direction.x;
          setRotation(prev => prev + 180);
        }
        
        if (newY <= 0 || newY >= boundaries.height - size) {
          newDirectionY = -direction.y;
          setRotation(prev => prev + 180);
        }
        
        // Update direction if needed
        if (newDirectionX !== direction.x || newDirectionY !== direction.y) {
          setDirection({ x: newDirectionX, y: newDirectionY });
        }
        
        return { 
          x: Math.max(0, Math.min(boundaries.width - size, newX)), 
          y: Math.max(0, Math.min(boundaries.height - size, newY)) 
        };
      });
    };
    
    const moveInterval = setInterval(moveInsect, 20);
    return () => clearInterval(moveInterval);
  }, [direction, boundaries, behavior.speed, isVisible, size]);

  // Buzzing effect
  useEffect(() => {
    if (!isVisible) return;
    
    const buzzInterval = setInterval(() => {
      // Create buzzing effect
      setRotation(prev => prev + (Math.random() * behavior.rotationAmount - behavior.rotationAmount/2));
      setScale(prev => 0.9 + Math.random() * behavior.scaleVariation); 
    }, behavior.buzzFrequency);
    
    return () => clearInterval(buzzInterval);
  }, [behavior.buzzFrequency, behavior.rotationAmount, behavior.scaleVariation, isVisible]);

  // Random direction changes
  useEffect(() => {
    if (!isVisible) return;
    
    const directionInterval = setInterval(() => {
      // Generate random direction change
      setDirection({
        x: (Math.random() * 2 - 1),
        y: (Math.random() * 2 - 1)
      });
      
      // Add a random rotation
      setRotation(Math.random() * 360);
    }, behavior.changeDirectionFrequency);
    
    return () => clearInterval(directionInterval);
  }, [behavior.changeDirectionFrequency, isVisible]);

  // Disappear and reappear randomly
  useEffect(() => {
    const disappearInterval = setInterval(() => {
      setIsVisible(false);
      
      // Reappear after a delay at a new position
      setTimeout(() => {
        setIsVisible(true);
        setPosition({
          x: Math.random() * (boundaries.width - size),
          y: Math.random() * (boundaries.height - size)
        });
      }, behavior.disappearDuration);
    }, behavior.disappearFrequency);
    
    return () => clearInterval(disappearInterval);
  }, [boundaries, behavior.disappearDuration, behavior.disappearFrequency, size]);

  // Only render when visible
  if (!isVisible) return null;

  // Shadow effect for more depth, especially on desktop
  const shadowStyle = isDesktop
    ? '0 3px 10px rgba(0, 0, 0, 0.2)'
    : '0 2px 5px rgba(0, 0, 0, 0.1)';

  return (
    <div
      style={{
        position: 'fixed',
        left: `${position.x}px`,
        top: `${position.y}px`,
        transform: `rotate(${rotation}deg) scale(${scale})`,
        transition: 'transform 0.1s ease-out',
        zIndex: 1000,
        pointerEvents: 'none', // Don't interfere with user interactions
        width: `${size}px`,
        height: `${size}px`,
        filter: `drop-shadow(${shadowStyle})` // Add shadow for depth
      }}
    >
      <img 
        src={src} 
        alt={`Flying ${type}`} 
        style={{
          width: '100%',
          height: '100%'
        }}
      />
    </div>
  );
};

export default FlyingInsectsSwarm;