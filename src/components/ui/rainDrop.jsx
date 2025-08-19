// RainDrops.js - Animated rain drops component with database SVG
import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const RainDrops = ({ 
  count = 50, 
  speed = 'medium', 
  intensity = 'normal',
  containerHeight = '100vh',
  containerWidth = '100vw',
  svgName = 'gota' // Name of the SVG in the database
}) => {
  const [rainDrops, setRainDrops] = useState([]);
  const [svgContent, setSvgContent] = useState('');
  const [loading, setLoading] = useState(true);

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

  // Fetch SVG from database
  useEffect(() => {
    const fetchSVG = async () => {
      try {
        const { data, error } = await supabase
          .from('svgs')
          .select('url')
          .single();

        
          setSvgContent(data.url);
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching SVG:', err);
        setLoading(false);
      }
    };

    fetchSVG();
  }, [svgName]);

  // Generate initial rain drops
  useEffect(() => {
    if (!loading) {
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
    }
  }, [count, speed, intensity, loading]);

  // Animation loop
  useEffect(() => {
    if (loading) return;

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
  }, [currentSpeed, loading]);

  // Function to check if SVG content is URL or inline SVG
  const isUrl = (str) => {
    try {
      new URL(str);
      return true;
    } catch {
      return false;
    }
  };

  // Don't render drops while loading SVG
  if (loading) {
    return null;
  }

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
          {isUrl(svgContent) ? (
            // If it's a URL, use img tag
            <img 
              src={svgContent}
              alt="rain drop"
              style={{
                width: '100%',
                height: '100%',
                filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))'
              }}
            />
          ) : (
            // If it's inline SVG, render directly
            <div 
              dangerouslySetInnerHTML={{ __html: svgContent }}
              style={{
                width: '100%',
                height: '100%',
                filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))'
              }}
            />
          )}
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

          /* Style for inline SVG */
          .rain-drop svg {
            width: 100%;
            height: 100%;
          }
        `}
      </style>
    </div>
  );
};

// Usage examples


export default RainDrops;