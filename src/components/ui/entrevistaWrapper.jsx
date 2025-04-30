import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import Entrevista from './entrevista';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

const EntrevistaWrapper = () => {
  const [videoUrl, setVideoUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const [videoError, setVideoError] = useState(false);
 
  useEffect(() => {
    // Function to fetch the video URL from Supabase
    const fetchVideoUrl = async () => {
      try {
        setLoading(true);
        
        // Adjust this query based on your actual table and column names
        const { data, error } = await supabase
        .from('creaciones')
        .select('video')
        .eq('tipo', 'entrevista') // Use appropriate filter
        .single(); // If you expect only one result
      
        
        if (error) {
          console.error('Error fetching video URL:', error);
          setVideoError(true);
        } else if (data && data.video) {
          setVideoUrl(data.video); // Assuming 'video' is the column name
        } else {
          // No video data found
          setVideoError(true);
        }
      } catch (error) {
        console.error('Unexpected error:', error);
        setVideoError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchVideoUrl();
  }, []);

  

  // Handle video load error
  const handleVideoError = () => {
    console.log('Video failed to load');
    setVideoError(true);
  };
 
  return (
    <div className="relative w-full">
      {/* Video or fallback background wrapper */}
      <div 
        className="fixed top-0 left-0 w-full h-full"
        style={{ 
          position: 'fixed',
          zIndex: '-1',
        }}
      >
        {!loading && videoUrl && !videoError ? (
          // Video background when available
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
            onError={handleVideoError}
          >
            <source src={videoUrl} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        ) : (
          // Fallback gradient background when video is not available or has an error
          <div 
            style={{
              width: '100%',
              height: '100%',
              background: 'linear-gradient(135deg, #f5f5f5 0%, #ffffff 50%, #f0f0f0 100%)',
              position: 'absolute',
              top: 0,
              left: 0
            }}
          />
        )}
      </div>
      
      {/* Content overlay with higher z-index */}
      <div 
        className="relative" 
        style={{ 
          zIndex: '1', 
          color: !loading && videoUrl && !videoError ? 'white' : 'black' 
        }}
      >
        <Entrevista />
      </div>
    </div>
  );
};

export default EntrevistaWrapper;