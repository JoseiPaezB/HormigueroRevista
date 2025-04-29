import React, { useState, useEffect } from 'react';
import ContentComponent from './ContentComponent';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);


const Critica = () => {
  const [videoUrl, setVideoUrl] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Function to fetch the video URL from Supabase
    const fetchVideoUrl = async () => {
      try {
        setLoading(true);
        
        // Adjust this query based on your actual table and column names
        const { data, error } = await supabase
          .from('creaciones')
          .select('video')
          .eq('tipo', 'critica') // Use appropriate filter
          .single(); // If you expect only one result
        
        if (error) {
          console.error('Error fetching video URL:', error);
        } else if (data) {
          setVideoUrl(data.video); // Assuming 'video' is the column name
        }
      } catch (error) {
        console.error('Unexpected error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchVideoUrl();
  }, []);

  return (
    <div className="relative w-full">
      {/* Video background wrapper with opacity control */}
      <div 
        className="fixed top-0 left-0 w-full h-full"
        style={{ 
          position: 'fixed',
          zIndex: '-1',
        }}
      >
        {!loading && videoUrl && (
          <video 
            className="w-full h-full object-cover"
            style={{ 
              minWidth: '100vw',
              minHeight: '100vh',
              pointerEvents: 'none'
            }}
            autoPlay 
            loop 
            muted
            playsInline
            disablePictureInPicture 
            controlsList="nodownload nofullscreen noremoteplayback"
            onContextMenu={(e) => e.preventDefault()}
          >
            <source src={videoUrl} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
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