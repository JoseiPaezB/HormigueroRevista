// RotatingMani.js - Component for rotating background images from Supabase
import React, { useState, useEffect } from 'react';


const RotatingMani = ({ 
  changeInterval = 4000, // Time between changes in milliseconds
  opacity = 1,
  zIndex = -2,
  
}) => {
  const [images, setImages] = useState([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseKey = import.meta.env.VITE_SUPABASE_KEY;
  // Fetch images from Supabase
  useEffect(() => {
    const fetchImages = async () => {
      try {
        const response = await fetch(`${supabaseUrl}/rest/v1/manilargos`, {
          headers: {
            'apikey': supabaseKey,
            'Authorization': `Bearer ${supabaseKey}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          const data = await response.json();
          setImages(data);
          setLoading(false);
        } else {
          console.error('Failed to fetch images');
          setLoading(false);
        }
      } catch (error) {
        console.error('Error fetching images:', error);
        setLoading(false);
      }
    };

    fetchImages();
  }, [supabaseUrl, supabaseKey]);

  // Rotate images
  useEffect(() => {
    if (images.length === 0) return;

    const interval = setInterval(() => {
      setCurrentImageIndex(prevIndex => {
        let nextIndex;
        do {
          nextIndex = Math.floor(Math.random() * images.length);
        } while (nextIndex === prevIndex && images.length > 1);
        return nextIndex;
      });
    }, changeInterval);

    return () => clearInterval(interval);
  }, [images.length, changeInterval]);

  if (loading) {
    return (
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundColor: 'rgba(0,0,0,0.1)',
        zIndex: zIndex,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#666'
      }}>
        Loading images...
      </div>
    );
  }

  if (images.length === 0) {
    return null;
  }

  const currentImageUrl = images[currentImageIndex]?.url;

  return (
    <div style={{
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      backgroundImage: `url(${currentImageUrl})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
      opacity: opacity,
      zIndex: zIndex,
      transition: 'background-image 0.5s ease-in-out'
    }} />
  );
};

// Alternative version using Supabase client (if you have @supabase/supabase-js installed)
const RotatingManiWithClient = ({ 
  changeInterval = 4000,
  opacity = 1,
  zIndex = -2,
  supabase // Pass your supabase client instance
}) => {
  const [images, setImages] = useState([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchImages = async () => {
      try {
        const { data, error } = await supabase
          .from('manilargos')
          .select('*');

        if (error) {
          console.error('Error fetching images:', error);
        } else {
          setImages(data);
        }
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };

    if (supabase) {
      fetchImages();
    }
  }, [supabase]);

  useEffect(() => {
    if (images.length === 0) return;

    const interval = setInterval(() => {
      setCurrentImageIndex(prevIndex => {
        let nextIndex;
        do {
          nextIndex = Math.floor(Math.random() * images.length);
        } while (nextIndex === prevIndex && images.length > 1);
        return nextIndex;
      });
    }, changeInterval);

    return () => clearInterval(interval);
  }, [images.length, changeInterval]);

  if (loading) {
    return (
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundColor: 'rgba(0,0,0,0.1)',
        zIndex: zIndex
      }}>
        Loading...
      </div>
    );
  }

  if (images.length === 0) return null;

  return (
    <div style={{
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      backgroundImage: `url(${images[currentImageIndex]?.url})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
      opacity: opacity,
      zIndex: zIndex,
      transition: 'background-image 0.5s ease-in-out'
    }} />
  );
};

export default RotatingMani;
export { RotatingManiWithClient };