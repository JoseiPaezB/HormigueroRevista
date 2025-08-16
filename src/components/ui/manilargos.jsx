// DancingBodies.js - Animated dancing figures component
import React, { useState, useEffect } from 'react';

const DancingBodies = ({ 
count = 10, 
  imagePaths = [
    '/assets/images/body1.png',
    '/assets/images/body2.png',
    '/assets/images/body3.png',
    '/assets/images/body4.png',
    '/assets/images/body5.png'
  ], // Array of different body images
  containerHeight = '100vh',
  containerWidth = '100vw',
  swayDistance = 30 // How far they sway (in pixels)
}) => {
  const [bodies, setBodies] = useState([]);

  // Generate static figures in grid layout
  useEffect(() => {
    const figures = Array.from({ length: count }, (_, i) => {
      // Calculate grid position (2 rows of 5)
      const row = Math.floor(i / 5); // 0 or 1 (for 2 rows)
      const col = i % 5; // 0-4 (for 5 columns)
      
      // Calculate positions based on grid
      const xPosition = (col + 1) * (100 / 6); // Distribute across width with padding
      const yPosition = (row + 1) * (100 / 3); // Distribute across height with padding
      
      return {
        id: i,
        x: xPosition,
        y: yPosition,
        gridRow: row,
        gridCol: col,
        size: Math.random() * 0.3 + 0.8, // 0.8 to 1.1 (slight size variation)
        opacity: Math.random() * 0.2 + 0.7, // 0.7 to 0.9 (consistent opacity)
        rotation: Math.random() * 20 - 10, // -10 to +10 degrees (subtle rotation)
        imageIndex: i % imagePaths.length, // Cycle through images
        imagePath: imagePaths[i % imagePaths.length], // Assign image based on index
        animationDelay: i * 0.2 // Stagger the animations
      };
    });
    
    setBodies(figures);
  }, [count, imagePaths]);

  return (
    <div 
      className="static-bodies-container"
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: containerWidth,
        height: containerHeight,
        pointerEvents: 'none',
        overflow: 'hidden',
        zIndex: -1
      }}
    >
      {bodies.map(body => (
        <div
          key={body.id}
          className={`static-figure ${body.gridRow === 0 ? 'top-row' : 'bottom-row'}`}
          style={{
            position: 'absolute',
            left: `${body.x}%`,
            top: `${body.y}%`,
            transform: `translate(-50%, -50%) rotate(${body.rotation}deg) scale(${body.size})`,
            opacity: body.opacity,
            width: '60px',
            height: '90px',
            transformOrigin: 'center center',
            animationDelay: `${body.animationDelay}s`
          }}
        >
          <img 
            src={body.imagePath}
            alt={`static figure ${body.imageIndex + 1}`}
            style={{
              width: '100%',
              height: '100%',
              filter: `
                drop-shadow(0 4px 8px rgba(0,0,0,0.3)) 
                hue-rotate(${body.id * 30}deg) 
                saturate(${0.8 + Math.random() * 0.4})
              `
            }}
          />
        </div>
      ))}

      {/* CSS for simple sway animation */}
      <style>
        {`
          .static-figure {
            animation-duration: 4s;
            animation-timing-function: ease-in-out;
            animation-iteration-count: infinite;
          }

          /* Top row moves right first, then left */
          .top-row {
            animation-name: swayRightFirst;
          }

          /* Bottom row moves left first, then right */
          .bottom-row {
            animation-name: swayLeftFirst;
          }

          @keyframes swayRightFirst {
            0%, 100% {
              transform: translate(-50%, -50%) translateX(0px);
            }
            50% {
              transform: translate(-50%, -50%) translateX(${swayDistance}px);
            }
          }

          @keyframes swayLeftFirst {
            0%, 100% {
              transform: translate(-50%, -50%) translateX(0px);
            }
            50% {
              transform: translate(-50%, -50%) translateX(-${swayDistance}px);
            }
          }

          /* Hover effect pauses animation */
          .static-figure:hover {
            animation-play-state: paused;
            transform: translate(-50%, -50%) scale(1.1);
            transition: transform 0.3s ease;
          }

          /* Mobile responsiveness */
          @media (max-width: 768px) {
            .static-figure {
              width: 40px !important;
              height: 60px !important;
            }

            @keyframes swayRightFirst {
              0%, 100% {
                transform: translate(-50%, -50%) translateX(0px);
              }
              50% {
                transform: translate(-50%, -50%) translateX(${swayDistance * 0.7}px);
              }
            }

            @keyframes swayLeftFirst {
              0%, 100% {
                transform: translate(-50%, -50%) translateX(0px);
              }
              50% {
                transform: translate(-50%, -50%) translateX(-${swayDistance * 0.7}px);
              }
            }
          }

          /* Tablet adjustments */
          @media (max-width: 1024px) and (min-width: 769px) {
            .static-figure {
              width: 50px !important;
              height: 75px !important;
            }
          }
        `}
      </style>
    </div>
  );
};

// Version with exact positioning (more control)
const StaticBodiesExact = ({ 
  count = 10,
  imagePaths = [],
  positions = null // Optional: provide exact positions
}) => {
  const [bodies, setBodies] = useState([]);

  useEffect(() => {
    const figures = Array.from({ length: count }, (_, i) => {
      // Use provided positions or default grid
      let xPos, yPos;
      
      if (positions && positions[i]) {
        xPos = positions[i].x;
        yPos = positions[i].y;
      } else {
        // Default grid calculation
        const row = Math.floor(i / 5);
        const col = i % 5;
        xPos = (col + 1) * (100 / 6);
        yPos = (row + 1) * (100 / 3);
      }
      
      return {
        id: i,
        x: xPos,
        y: yPos,
        size: 1, // Fixed size
        opacity: 0.8, // Fixed opacity
        rotation: 0, // No rotation
        imagePath: imagePaths[i % imagePaths.length]
      };
    });
    
    setBodies(figures);
  }, [count, imagePaths, positions]);

  return (
    <div style={{
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      pointerEvents: 'none',
      overflow: 'hidden',
      zIndex: 1
    }}>
      {bodies.map(body => (
        <div
          key={body.id}
          style={{
            position: 'absolute',
            left: `${body.x}%`,
            top: `${body.y}%`,
            transform: `translate(-50%, -50%)`,
            opacity: body.opacity,
            width: '60px',
            height: '90px'
          }}
        >
          <img 
            src={body.imagePath}
            alt={`figure ${body.id + 1}`}
            style={{
              width: '100%',
              height: '100%',
              filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.3))'
            }}
          />
        </div>
      ))}
    </div>
  );
};
// Usage examples

// Usage examples with multiple images


export default DancingBodies;
export { StaticBodiesExact };
