import React, { useEffect, useState, useMemo } from 'react';
import { createClient } from '@supabase/supabase-js';

// Individual insect component
const Insect = ({ 
  src,
  type = 'default',
  size = 30,
  opacity = 0.7,
  zIndex = 1,
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
      position: 'absolute',
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
        onError={(e) => {
          // Fallback image if database image fails to load
          e.target.src = '/default-insect.png';
        }}
      />
    </div>
  );
};

// Insects colony component with Supabase integration
const InsectColony = ({ count = 5 }) => {
  const [carasImages, setCarasImages] = useState([]);
  const [insectInstances, setInsectInstances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Initialize Supabase client
  const supabase = useMemo(() => {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseKey = import.meta.env.VITE_SUPABASE_KEY;
    return createClient(supabaseUrl, supabaseKey)
  }, []);

  // Fetch images from caras table using Supabase
  useEffect(() => {
    const fetchCarasImages = async () => {
      try {
        setLoading(true);
        
        const { data, error: supabaseError } = await supabase
          .from('caras')
          .select('id, url');
        
        if (supabaseError) {
          throw new Error(supabaseError.message);
        }
        
        // Filter out any null/empty URLs and map the data
        const images = data
          .filter(cara => cara.url && cara.url.trim() !== '')
          .map(cara => ({
            id: cara.id,
            src: cara.url,
            type: 'default', // You can add a type column to your table if needed
          }));
        
        if (images.length === 0) {
          throw new Error('No valid image URLs found in caras table');
        }
        
        setCarasImages(images);
      } catch (err) {
        console.error('Error fetching caras images from Supabase:', err);
        setError(err.message);
        // Set fallback images if database fetch fails
        setCarasImages([
          { id: 1, src: '/fallback-insect1.png', type: 'ant' },
          { id: 2, src: '/fallback-insect2.png', type: 'bee' },
          { id: 3, src: '/fallback-insect3.png', type: 'fly' }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchCarasImages();
  }, [supabase]);

  // Generate insects based on database images
  useEffect(() => {
    if (carasImages.length === 0) return;

    const generateInsects = () => {
      const insectInstances = [];
      
      for (let i = 0; i < count; i++) {
        // Cycle through available images from database
        const imageIndex = i % carasImages.length;
        const selectedImage = carasImages[imageIndex];
        
        // Create instance with random properties
        insectInstances.push({
          id: `insect-${i}`,
          src: selectedImage.src,
          type: selectedImage.type || 'default',
          size: Math.floor(Math.random() * 20) + 20, // 20-40px
          opacity: (Math.random() * 0.4) + 0.4, // 0.4-0.8
          initialPosition: { 
            x: Math.random() * 100, 
            y: Math.random() * 100 
          },
          speed: (Math.random() * 0.8) + 0.3, // 0.3-1.1
          zIndex: 1 + Math.floor(Math.random() * 3), // 1 to 3
          moveStyle: 'wander'
        });
      }
      
      return insectInstances;
    };

    setInsectInstances(generateInsects());
  }, [count, carasImages]);

  // Show loading state
  if (loading) {
    return (
      <div style={{ 
        position: 'relative',
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        opacity: 0.5
      }}>
        <div>Cargando insectos...</div>
      </div>
    );
  }

  // Show error state (but still render with fallback)
  if (error) {
    console.warn('InsectColony: Using fallback images due to error:', error);
  }

  return (
    <div style={{ 
      position: 'relative',
      width: '100%',
      height: '100%',
      overflow: 'hidden'
    }}>
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
    </div>
  );
};

export default InsectColony;