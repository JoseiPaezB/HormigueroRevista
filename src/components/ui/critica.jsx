import React, { useState, useEffect } from 'react';
import ContentComponent from './ContentComponent';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

const Critica = () => {
  const [imageUrl, setImageUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    // Function to fetch the image URL from Supabase
    const fetchImageUrl = async () => {
      try {
        setLoading(true);
        setImageError(false);
        
        // Method 1: Get data from table
        const { data, error } = await supabase
          .from('creaciones')
          .select('imagen')
          .eq('tipo', 'critica')
          .single();
        
        if (error) {
          console.error('Error fetching image URL:', error);
          setImageError(true);
          return;
        }
        
        if (data && data.imagen) {
          // Method 2: Get public URL if it's a storage path
          if (data.imagen.startsWith('portadas/')) {
            // If it's a storage path, get the public URL
            const { data: urlData } = supabase.storage
              .from('portadas')
              .getPublicUrl(data.imagen.replace('portadas/', ''));
            
            setImageUrl(urlData.publicUrl);
          } else {
            // If it's already a full URL, use it directly
            setImageUrl(data.imagen);
          }
        }
      } catch (error) {
        console.error('Unexpected error:', error);
        setImageError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchImageUrl();
  }, []);

  // Handle image load event
  const handleImageLoad = () => {
    setImageLoaded(true);
    setImageError(false);
  };

  // Handle image error event
  const handleImageError = (e) => {
    console.error('Image failed to load:', e);
    setImageError(true);
    setImageLoaded(false);
  };

  return (
    <div className="relative w-full min-h-screen">
      {/* Image background wrapper */}
      <div 
        className="fixed top-0 left-0 w-full h-full"
        style={{ 
          position: 'fixed',
          zIndex: '-1',
        }}
      >
        {/* Loading state */}
        {loading && (
          <div className="w-full h-full bg-gray-900 flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
          </div>
        )}

        {/* Success state - Image loaded */}
        {!loading && !imageError && imageUrl && (
          <div
            style={{
              width: '100%',
              height: '100%',
              backgroundImage: `url(${imageUrl})`,
              backgroundSize: 'cover', // Change this to 'contain' to see full image, or keep 'cover' to fill container
              backgroundPosition: 'center center',
              backgroundRepeat: 'no-repeat',
              minWidth: '100vw',
              minHeight: '100vh',
              opacity:0.8,
            }}
          />
        )}
        
        {/* Error state fallback */}
        {imageError && (
          <div className="w-full h-full bg-gray-800 flex items-center justify-center">
            <p className="text-white">Failed to load background image</p>
          </div>
        )}
      </div>
      
      {/* Content overlay with higher z-index */}
      <div className="relative" style={{ zIndex: '1', color: 'white' }}>
        <ContentComponent contentType="critica" />
      </div>
    </div>
  );
};

export default Critica;