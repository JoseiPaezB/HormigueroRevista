// PeekingEyes.js - Eyes that slide in from page borders
import React, { useState, useEffect } from 'react';

const PeekingEyes = ({ 
  eyeImages = [
    '/assets/images/eye1.png',
    '/assets/images/eye2.png',
    '/assets/images/eye3.png',
    '/assets/images/eye4.png',
    '/assets/images/eye5.png'
  ],
  peekDuration = 7000, // 7 seconds visible
  hideDuration = 3000, // 3 seconds hidden between peeks
  slideDistance = 120, // How far they slide in from edge
  containerHeight = '100vh',
  containerWidth = '100vw'
}) => {
  const [currentEye, setCurrentEye] = useState(null);
  const [animationState, setAnimationState] = useState('hidden'); // 'hidden', 'sliding-in', 'visible', 'sliding-out'

  // Possible peek positions (from edges)
  const peekPositions = [
    // From left edge
    { 
      side: 'left', 
      top: '20%', 
      hiddenX: '-100px', 
      visibleX: `${slideDistance}px`, 
      y: '20%',
      rotation: 0 
    },
    { 
      side: 'left', 
      top: '50%', 
      hiddenX: '-100px', 
      visibleX: `${slideDistance}px`, 
      y: '50%',
      rotation: 0 
    },
    { 
      side: 'left', 
      top: '80%', 
      hiddenX: '-100px', 
      visibleX: `${slideDistance}px`, 
      y: '80%',
      rotation: 0 
    },
    
    // From right edge
    { 
      side: 'right', 
      top: '20%', 
      hiddenX: `calc(100vw + 100px)`, 
      visibleX: `calc(100vw - ${slideDistance}px)`, 
      y: '20%',
      rotation: 0 
    },
    { 
      side: 'right', 
      top: '50%', 
      hiddenX: `calc(100vw + 100px)`, 
      visibleX: `calc(100vw - ${slideDistance}px)`, 
      y: '50%',
      rotation: 0 
    },
    { 
      side: 'right', 
      top: '80%', 
      hiddenX: `calc(100vw + 100px)`, 
      visibleX: `calc(100vw - ${slideDistance}px)`, 
      y: '80%',
      rotation: 0 
    },
    
    // From top edge
    { 
      side: 'top', 
      left: '25%', 
      hiddenY: '-100px', 
      visibleY: `${slideDistance}px`, 
      x: '25%',
      rotation: 0 
    },
    { 
      side: 'top', 
      left: '75%', 
      hiddenY: '-100px', 
      visibleY: `${slideDistance}px`, 
      x: '75%',
      rotation: 0 
    },
    
    // From bottom edge
    { 
      side: 'bottom', 
      left: '25%', 
      hiddenY: `calc(100vh + 100px)`, 
      visibleY: `calc(100vh - ${slideDistance}px)`, 
      x: '25%',
      rotation: 0 
    },
    { 
      side: 'bottom', 
      left: '75%', 
      hiddenY: `calc(100vh + 100px)`, 
      visibleY: `calc(100vh - ${slideDistance}px)`, 
      x: '75%',
      rotation: 0 
    }
  ];

  useEffect(() => {
    const peekCycle = () => {
      // Select random eye and position
      const randomEye = eyeImages[Math.floor(Math.random() * eyeImages.length)];
      const randomPosition = peekPositions[Math.floor(Math.random() * peekPositions.length)];
      
      // Set the eye and position
      setCurrentEye({
        image: randomEye,
        position: randomPosition,
        id: Date.now()
      });
      
      // Start animation sequence
      setAnimationState('sliding-in');
      
      // After slide-in animation, set to visible
      setTimeout(() => {
        setAnimationState('visible');
      }, 800); // Slide-in duration
      
      // After peek duration, start sliding out
      setTimeout(() => {
        setAnimationState('sliding-out');
      }, peekDuration);
      
      // After slide-out, hide completely
      setTimeout(() => {
        setAnimationState('hidden');
        setCurrentEye(null);
      }, peekDuration + 600); // Add slide-out duration
    };

    // Start the cycle
    const timeout = setTimeout(peekCycle, 1000); // Initial delay
    
    // Set interval for continuous peeking
    const interval = setInterval(peekCycle, peekDuration + hideDuration + 1400); // Total cycle time
    
    return () => {
      clearTimeout(timeout);
      clearInterval(interval);
    };
  }, [eyeImages, peekPositions, peekDuration, hideDuration, slideDistance]);

  if (!currentEye || animationState === 'hidden') return null;

  // Calculate current position based on animation state
  const getPosition = () => {
    const pos = currentEye.position;
    
    if (pos.side === 'left' || pos.side === 'right') {
      return {
        left: animationState === 'sliding-in' || animationState === 'visible' 
          ? pos.visibleX 
          : pos.hiddenX,
        top: pos.y,
        transform: `translateY(-50%) rotate(${pos.rotation}deg)`
      };
    } else {
      return {
        left: pos.x,
        top: animationState === 'sliding-in' || animationState === 'visible' 
          ? pos.visibleY 
          : pos.hiddenY,
        transform: `translateX(-50%) rotate(${pos.rotation}deg)`
      };
    }
  };

  return (
    <div 
      className="peeking-eyes-container"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: containerWidth,
        height: containerHeight,
        pointerEvents: 'none',
        zIndex: 1000 // Very high z-index to appear above everything
      }}
    >
      <div
        className={`peeking-eye ${animationState}`}
        style={{
          position: 'absolute',
          ...getPosition(),
          width: '80px',
          height: '80px',
          transition: animationState === 'sliding-in' || animationState === 'sliding-out' 
            ? 'all 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94)' 
            : 'none',
          transformOrigin: 'center center',
          opacity: animationState === 'visible' ? 1 : 0.9
        }}
      >
        <img 
          src={currentEye.image}
          alt="peeking eye"
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'contain',
            filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.5))',
            animation: animationState === 'visible' ? 'eyeBlink 3s ease-in-out infinite' : 'none'
          }}
        />
      </div>

      {/* CSS for eye animations */}
      <style>
        {`
          @keyframes eyeBlink {
            0%, 85%, 100% {
              transform: scaleY(1);
            }
            5%, 10% {
              transform: scaleY(0.1);
            }
          }

          /* Hover effect when visible */
          .peeking-eye.visible:hover {
            animation: eyeWiggle 0.5s ease-in-out;
          }

          @keyframes eyeWiggle {
            0%, 100% { transform: rotate(0deg); }
            25% { transform: rotate(-5deg); }
            75% { transform: rotate(5deg); }
          }

          /* Mobile adjustments */
          @media (max-width: 768px) {
            .peeking-eye {
              width: 60px !important;
              height: 60px !important;
            }
          }

          /* Tablet adjustments */
          @media (max-width: 1024px) and (min-width: 769px) {
            .peeking-eye {
              width: 70px !important;
              height: 70px !important;
            }
          }
        `}
      </style>
    </div>
  );
};

// Multiple eyes version - can show multiple eyes at once
const MultiPeekingEyes = ({ 
  eyeImages = [],
  maxEyes = 3, // Maximum eyes visible at once
  peekDuration = 7000,
  hideDuration = 2000
}) => {
  const [activeEyes, setActiveEyes] = useState([]);

  const peekPositions = [
    { side: 'left', top: '15%', left: '-80px', rotation: 0 },
    { side: 'left', top: '45%', left: '-80px', rotation: 0 },
    { side: 'left', top: '75%', left: '-80px', rotation: 0 },
    { side: 'right', top: '15%', right: '-80px', rotation: 0 },
    { side: 'right', top: '45%', right: '-80px', rotation: 0 },
    { side: 'right', top: '75%', right: '-80px', rotation: 0 },
    { side: 'top', top: '-80px', left: '25%', rotation: 90 },
    { side: 'top', top: '-80px', left: '75%', rotation: 90 },
    { side: 'bottom', bottom: '-80px', left: '25%', rotation: -90 },
    { side: 'bottom', bottom: '-80px', left: '75%', rotation: -90 }
  ];

  useEffect(() => {
    const addEye = () => {
      if (activeEyes.length < maxEyes) {
        const newEye = {
          id: Date.now() + Math.random(),
          image: eyeImages[Math.floor(Math.random() * eyeImages.length)],
          position: peekPositions[Math.floor(Math.random() * peekPositions.length)],
          visible: true
        };
        
        setActiveEyes(prev => [...prev, newEye]);
        
        // Remove eye after duration
        setTimeout(() => {
          setActiveEyes(prev => prev.filter(eye => eye.id !== newEye.id));
        }, peekDuration);
      }
    };

    const interval = setInterval(addEye, hideDuration);
    return () => clearInterval(interval);
  }, [activeEyes.length, maxEyes, eyeImages, peekPositions, peekDuration, hideDuration]);

  return (
    <div style={{
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      pointerEvents: 'none',
      overflow: 'hidden',
      zIndex: 10
    }}>
      {activeEyes.map(eye => (
        <div
          key={eye.id}
          style={{
            position: 'absolute',
            ...eye.position,
            width: '80px',
            height: '80px',
            transform: `rotate(${eye.position.rotation}deg)`,
            animation: 'peekIn 0.8s cubic-bezier(0.68, -0.55, 0.265, 1.55)'
          }}
        >
          <img 
            src={eye.image}
            alt="peeking eye"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'contain',
              filter: 'drop-shadow(0 3px 8px rgba(0,0,0,0.3))'
            }}
          />
        </div>
      ))}
    </div>
  );
};

// Usage examples
const UsageExamples = () => {
  return (
    <div>
      {/* Single eye peeking */}
      <PeekingEyes 
        eyeImages={[
          '/assets/images/eye1.png',
          '/assets/images/eye2.png',
          '/assets/images/eye3.png'
        ]}
        peekDuration={7000}
        hideDuration={3000}
      />
      
      {/* Multiple eyes peeking */}
      <MultiPeekingEyes 
        eyeImages={[
          '/assets/images/eye1.png',
          '/assets/images/eye2.png',
          '/assets/images/eye3.png',
          '/assets/images/eye4.png'
        ]}
        maxEyes={2}
        peekDuration={6000}
        hideDuration={4000}
      />
      
      {/* Quick peeking eyes */}
      <PeekingEyes 
        eyeImages={['/assets/images/spooky-eye.png']}
        peekDuration={3000}
        hideDuration={8000}
      />
    </div>
  );
};

export default PeekingEyes;
export { MultiPeekingEyes };