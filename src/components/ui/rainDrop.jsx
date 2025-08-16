// RainDrops.js - Animated rain drops component
import React, { useState, useEffect } from 'react';

const RainDrops = ({ 
  count = 50, 
  speed = 'medium', 
  intensity = 'normal',
  svgPath = 'src/assets/images/raindrop.svg',
  containerHeight = '100vh',
  containerWidth = '100vw'
}) => {
  const [rainDrops, setRainDrops] = useState([]);

  // Speed configurations
  const speedConfig = {
    superSlow: { min: 1, max: 4 },
    slow: { min: 3, max: 8 },
    medium: { min: 5, max: 12 },
    fast: { min: 8, max: 20 }
  };

  // Intensity configurations (affects opacity and size)
  const intensityConfig = {
    light: { opacity: 0.3, sizeMultiplier: 0.7 },
    normal: { opacity: 0.6, sizeMultiplier: 1 },
    heavy: { opacity: 0.8, sizeMultiplier: 1.3 }
  };

  const currentSpeed = speedConfig[speed] || speedConfig.medium;
  const currentIntensity = intensityConfig[intensity] || intensityConfig.normal;

  // Generate initial rain drops
  useEffect(() => {
    const drops = Array.from({ length: count }, (_, i) => ({
      id: i,
      x: Math.random() * 100, // Percentage position
      y: Math.random() * -100, // Start above screen
      size: (Math.random() * 0.5 + 0.5) * currentIntensity.sizeMultiplier, // Random size
      speed: Math.random() * (currentSpeed.max - currentSpeed.min) + currentSpeed.min,
      opacity: Math.random() * 0.3 + currentIntensity.opacity,
      rotation: Math.random() * 360, // Random rotation
      delay: Math.random() * 5 // Random animation delay
    }));
    
    setRainDrops(drops);
  }, [count, speed, intensity]);

  // Animation loop
  useEffect(() => {
    const animationFrame = () => {
      setRainDrops(prevDrops => 
        prevDrops.map(drop => {
          let newY = drop.y + drop.speed * 0.1;
          
          // Reset drop to top when it goes off screen
          if (newY > 110) {
            newY = Math.random() * -20;
            return {
              ...drop,
              y: newY,
              x: Math.random() * 100, // New random x position
              speed: Math.random() * (currentSpeed.max - currentSpeed.min) + currentSpeed.min
            };
          }
          
          return { ...drop, y: newY };
        })
      );
    };

    const interval = setInterval(animationFrame, 16); // ~60fps
    return () => clearInterval(interval);
  }, [currentSpeed]);

  return (
    <div 
      className="rain-container"
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: containerWidth,
        height: containerHeight,
        pointerEvents: 'none',
        overflow: 'hidden',
        zIndex: 1
      }}
    >
      {rainDrops.map(drop => (
        <div
          key={drop.id}
          className="rain-drop"
          style={{
            position: 'absolute',
            left: `${drop.x}%`,
            top: `${drop.y}%`,
            transform: `rotate(${drop.rotation}deg) scale(${drop.size})`,
            opacity: drop.opacity,
            transition: 'all 0.1s linear',
            width: '20px',
            height: '30px'
          }}
        >
          <img 
            src={svgPath}
            alt="rain drop"
            style={{
              width: '100%',
              height: '100%',
              filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))'
            }}
          />
        </div>
      ))}

      {/* CSS for additional effects */}
      <style>
        {`
          .rain-drop {
            animation: rainFall ${Math.random() * 2 + 3}s linear infinite;
          }
          
          @keyframes rainFall {
            0% {
              transform: translateY(-20px) rotate(0deg);
              opacity: 0;
            }
            10% {
              opacity: 1;
            }
            90% {
              opacity: 1;
            }
            100% {
              transform: translateY(100vh) rotate(10deg);
              opacity: 0;
            }
          }

          @keyframes rainSplash {
            0% {
              transform: scale(1);
              opacity: 1;
            }
            100% {
              transform: scale(2);
              opacity: 0;
            }
          }

          /* Responsive adjustments */
          @media (max-width: 768px) {
            .rain-drop {
              width: 15px;
              height: 20px;
            }
          }
        `}
      </style>
    </div>
  );
};

// Alternative version with SVG sprite support
const RainDropsWithSprite = ({ 
  count = 50,
  spriteId = '#raindrop1',
  spritePath = 'src/assets/images/rain-sprite.svg'
}) => {
  const [rainDrops, setRainDrops] = useState([]);

  useEffect(() => {
    const drops = Array.from({ length: count }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * -100,
      size: Math.random() * 0.5 + 0.5,
      speed: Math.random() * 10 + 5,
      opacity: Math.random() * 0.4 + 0.4,
      delay: Math.random() * 5
    }));
    
    setRainDrops(drops);
  }, [count]);

  useEffect(() => {
    const animationFrame = () => {
      setRainDrops(prevDrops => 
        prevDrops.map(drop => {
          let newY = drop.y + drop.speed * 0.1;
          if (newY > 110) {
            newY = Math.random() * -20;
            return { ...drop, y: newY, x: Math.random() * 100 };
          }
          return { ...drop, y: newY };
        })
      );
    };

    const interval = setInterval(animationFrame, 16);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="rain-container" style={{
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      pointerEvents: 'none',
      overflow: 'hidden',
      zIndex: 1
    }}>
      {rainDrops.map(drop => (
        <svg
          key={drop.id}
          style={{
            position: 'absolute',
            left: `${drop.x}%`,
            top: `${drop.y}%`,
            width: `${20 * drop.size}px`,
            height: `${30 * drop.size}px`,
            opacity: drop.opacity,
            transition: 'all 0.1s linear'
          }}
        >
          <use href={`${spritePath}${spriteId}`} />
        </svg>
      ))}
    </div>
  );
};

// Usage examples
const UsageExamples = () => {
  return (
    <div>
      {/* Basic usage */}
      <RainDrops />
      
      {/* Customized rain */}
      <RainDrops 
        count={100}
        speed="fast"
        intensity="heavy"
        svgPath="src/assets/images/my-raindrop.svg"
      />
      
      {/* Light drizzle */}
      <RainDrops 
        count={30}
        speed="slow"
        intensity="light"
      />
      
      {/* With sprite */}
      <RainDropsWithSprite 
        count={75}
        spriteId="#drop1"
        spritePath="src/assets/images/rain-drops.svg"
      />
    </div>
  );
};

export default RainDrops;
export { RainDropsWithSprite };