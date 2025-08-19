// RotatingBackground.js - Component for rotating background images from Supabase collage table
import React, { useState, useEffect } from 'react';

const RotatingBackground = ({ 
  changeInterval = 4000, // Time between changes in milliseconds
  opacity = 1,
  zIndex = -2,
}) => {
  const [images, setImages] = useState([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseKey = import.meta.env.VITE_SUPABASE_KEY;
  // Fetch images from Supabase collage table
  useEffect(() => {
    const fetchImages = async () => {
      try {
        const response = await fetch(`${supabaseUrl}/rest/v1/collages`, {
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
          console.error('Failed to fetch images from collage table');
          setLoading(false);
        }
      } catch (error) {
        console.error('Error fetching collage images:', error);
        setLoading(false);
      }
    };

    fetchImages();
  }, [supabaseUrl, supabaseKey]);

  // Rotate images randomly
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

  // Loading state
 

  // No images found


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
      transition: 'background-image 0.8s ease-in-out' // Smooth transition between images
    }} />
  );
};

// Version with Supabase client (if you prefer using the client)
const RotatingBackgroundWithClient = ({ 
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
          .from('collage')
          .select('*');

        if (error) {
          console.error('Error fetching collage images:', error);
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
      transition: 'background-image 0.8s ease-in-out'
    }} />
  );
};

export default RotatingBackground;
export { RotatingBackgroundWithClient };