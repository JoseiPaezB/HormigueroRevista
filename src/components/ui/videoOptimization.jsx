// Add this to your Creaciones component to optimize video for mobile devices

import React, { useState, useEffect, useRef } from 'react';

// Video optimization hook
const useOptimizedVideo = (videoUrl) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const videoRef = useRef(null);
  
  // Detect mobile devices
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  
  // Handle video loading
  useEffect(() => {
    if (!videoUrl || !videoRef.current) return;
    
    const video = videoRef.current;
    
    // Reset state when URL changes
    setIsLoaded(false);
    setIsPlaying(false);
    
    // Video quality settings for mobile
    if (isMobile) {
      video.setAttribute('playsinline', '');
      
      // Lower resolution for mobile if possible by setting size
      video.style.maxHeight = '100%';
      
      // Reduce framerate for better performance on mobile
      if ('requestVideoFrameCallback' in HTMLVideoElement.prototype) {
        let lastFrameTime = 0;
        const frameRateLimit = 15; // Lower framerate for mobile
        
        const frameCallback = (now, metadata) => {
          if (now - lastFrameTime > 1000 / frameRateLimit) {
            lastFrameTime = now;
            // Allow this frame to render
          }
          video.requestVideoFrameCallback(frameCallback);
        };
        
        video.requestVideoFrameCallback(frameCallback);
      }
    }
    
    // Handle video events
    const handleCanPlay = () => {
      setIsLoaded(true);
    };
    
    const handlePlay = () => {
      setIsPlaying(true);
    };
    
    const handleError = (e) => {
      console.error('Video error:', e);
    };
    
    video.addEventListener('canplay', handleCanPlay);
    video.addEventListener('play', handlePlay);
    video.addEventListener('error', handleError);
    
    return () => {
      video.removeEventListener('canplay', handleCanPlay);
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('error', handleError);
    };
  }, [videoUrl, isMobile, videoRef]);
  
  return { isLoaded, isPlaying, isMobile, videoRef };
};

// Example usage in your component:
/*
const MyComponent = () => {
  const [videoUrl, setVideoUrl] = useState('your-video-url.mp4');
  const { isLoaded, isPlaying, isMobile, videoRef } = useOptimizedVideo(videoUrl);
  
  return (
    <div>
      <video 
        ref={videoRef}
        style={{
          opacity: isLoaded ? 0.8 : 0,
          transition: 'opacity 0.5s ease',
          objectFit: 'cover',
          width: '100%',
          height: '100%'
        }}
        autoPlay
        loop
        muted
        playsInline
      >
        <source src={videoUrl} type="video/mp4" />
      </video>
      
      {!isLoaded && (
        <div className="loading-placeholder">
          Loading video...
        </div>
      )}
    </div>
  );
};
*/

// Additional mobile optimizations for ContentComponent
const mobileOptimizations = {
  // Reduce animation effects on mobile
  reduceMotion: () => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    return prefersReducedMotion || window.innerWidth < 768;
  },
  
  // Optimize image loading for book covers
  lazyLoadImages: (imageRef, src) => {
    if (!imageRef.current) return;
    
    // Use Intersection Observer for lazy loading
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          imageRef.current.src = src;
          observer.disconnect();
        }
      });
    }, { rootMargin: '100px' });
    
    observer.observe(imageRef.current);
    
    return () => {
      if (imageRef.current) {
        observer.disconnect();
      }
    };
  },
  
  // Adjust typography for better mobile reading
  mobileTypography: (windowWidth) => {
    if (windowWidth < 576) {
      return {
        titleFontSize: '28px',
        subtitleFontSize: '16px',
        bodyFontSize: '14px',
        lineHeight: 1.4
      };
    }
    return {
      titleFontSize: '50px',
      subtitleFontSize: '20px',
      bodyFontSize: '16px',
      lineHeight: 1.5
    };
  }
};

export { useOptimizedVideo, mobileOptimizations };