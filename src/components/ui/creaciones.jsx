import React, { useState, useEffect } from 'react';
import ContentComponent from './ContentComponent';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

const Creaciones = () => {
  const [imageUrl, setImageUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);


  useEffect(() => {
    // Function to fetch the image URL from Supabase
    const fetchImageUrl = async () => {
      try {
        setLoading(true);
        setImageError(false);
        
        const { data, error } = await supabase
          .from('creaciones')
          .select('imagen')
          .eq('tipo', 'creaciones')
          .single();
        
        if (error) {
          console.error('Error fetching image URL:', error);
          setImageError(true);
          return;
        }
        
        if (data && data.imagen) {
          if (data.imagen.startsWith('portadas/')) {
            const { data: urlData } = supabase.storage
              .from('portadas')
              .getPublicUrl(data.imagen.replace('portadas/', ''));
            
            setImageUrl(urlData.publicUrl);
          } else {
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
  const isDesktop = windowWidth > 768;

  return (
    <div 
      style={{ 
        position: 'relative',
        width: '100%',
        minHeight: isDesktop? '100vh': '800px',
        backgroundImage: !loading && !imageError && imageUrl ? `url(${imageUrl})` : 'none',
        backgroundSize: 'cover',
        backgroundPosition: 'center center',
        backgroundRepeat: 'no-repeat',
        backgroundAttachment: 'fixed', // This keeps the background fixed
      }}
    >
      {/* Loading overlay */}
      {loading && (
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundColor: 'rgba(0,0,0,0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 10
        }}>
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
        </div>
      )}

      {/* Background overlay for opacity */}
      {!loading && !imageError && imageUrl && (
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundColor: 'rgba(0, 0, 0, 0.2)', // This creates the opacity effect
          zIndex: 1
        }} />
      )}
      
      {/* Content */}
      <div style={{ position: 'relative', zIndex: 2, color: 'white' }}>
        <ContentComponent contentType="creaciones" />
      </div>
    </div>
  );
};

export default Creaciones;