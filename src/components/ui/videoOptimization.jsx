import React, { useState, useEffect } from 'react';
import ContentComponent from './ContentComponent';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

const Creaciones = () => {
  const [videoUrl, setVideoUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  
  // Track window resize
  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  useEffect(() => {
    // Function to fetch the video URL from Supabase
    const fetchVideoUrl = async () => {
      try {
        setLoading(true);
        
        // Adjust this query based on your actual table and column names
        const { data, error } = await supabase
          .from('creaciones')
          .select('video')
          .eq('tipo', 'creaciones') // Use appropriate filter
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

  // Always show video background when available
  const shouldShowVideo = videoUrl;

  return (
    <div 
      style={{
        position: 'relative',
        width: '100%',
        minHeight: '100vh',
        backgroundColor: 'rgba(0, 0, 0, 0.85)', // Dark fallback color
        overflow: 'hidden' // Prevent any content from breaking out
      }}
    >
      {/* Video Background - Not using position:fixed to avoid layout issues */}
      {!loading && shouldShowVideo && (
        <div 
          style={{ 
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            overflow: 'hidden',
            zIndex: 0
          }}
        >
          <video 
            style={{ 
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              position: 'absolute',
              top: 0,
              left: 0,
              pointerEvents: 'none',
              opacity: 0.7 // Increased opacity for better video visibility
            }}
            autoPlay 
            loop 
            muted
            playsInline
            disablePictureInPicture 
            controlsList="nodownload nofullscreen noremoteplayback"
            onContextMenu={(e) => e.preventDefault()}
            preload="auto" // Ensure video loads quickly
          >
            <source src={videoUrl} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        </div>
      )}
      
      {/* Dark overlay to improve content visibility */}
      <div 
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundColor: shouldShowVideo ? 'rgba(0, 0, 0, 0.3)' : 'transparent', // Lighter overlay to let more video show through
          zIndex: 1
        }}
      />
      
      {/* Content container - Important to set position relative and z-index */}
      <div 
        style={{ 
          position: 'relative',
          zIndex: 2,
          width: '100%',
          paddingTop: '80px', // Account for your fixed navbar height
          color: 'white',
          minHeight: '100vh',
          overflowX: 'hidden' // Prevent horizontal scroll
        }}
      >
        <ContentComponent contentType="creaciones" />
      </div>
    </div>
  );
};

export default Creaciones;