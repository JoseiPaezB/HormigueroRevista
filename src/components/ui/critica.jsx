import React, { useState, useEffect } from 'react';
import ContentComponent from './ContentComponent';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

const Critica = () => {
  const [imageUrl, setImageUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    const fetchImageUrl = async () => {
      try {
        setLoading(true);
        setImageError(false);
        
        const { data, error } = await supabase
          .from('creaciones')
          .select('imagen')
          .eq('tipo', 'critica')
          .eq('id_revista', 2)
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

  return (
    <div style={{
      position: 'relative',
      minHeight: '100vh',
      color: '#fff'
    }}>
      {/* Background image overlay - same as visuales */}
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundImage: imageUrl ? `url(${imageUrl})` : 'none',
        backgroundSize: 'cover',
        backgroundPosition: 'center center',
        backgroundRepeat: 'no-repeat',
        zIndex: -1, 
      }} />

      {/* Loading state */}
      {loading && (
        <div style={{
          position: 'fixed',
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

      {/* Error state fallback */}
      {imageError && !loading && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundColor: 'rgba(50, 50, 50, 0.9)',
          zIndex: -1
        }} />
      )}
      
      {/* Content overlay with higher z-index */}
      <div style={{ 
        position: 'relative', 
        zIndex: 1, 
        color: 'white',
        minHeight: '100vh',
        backgroundColor: 'rgba(46, 45, 45, 0.2)'

      }}>
        <ContentComponent contentType="critica" />
      </div>
    </div>
  );
};

export default Critica;