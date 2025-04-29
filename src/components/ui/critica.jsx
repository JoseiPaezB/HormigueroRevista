import React from 'react';
import ContentComponent from './ContentComponent';
import video from '../../assets/images/2800-162896281_medium (1).mp4';

const Critica = () => {
  return (
    <div className="relative w-full">
      {/* Video background wrapper with opacity control */}
      <div 
        className="fixed top-0 left-0 w-full h-full"
        style={{ 
          position: 'fixed',
          zIndex: '-1',
          opacity: 0.5  // Adjust this value between 0 and 1 (0 = invisible, 1 = fully opaque)
        }}
      >
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
          <source src={video} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      </div>
      
      {/* Content overlay with higher z-index */}
      <div className="relative" style={{ zIndex: '1' }}>
        <ContentComponent contentType="critica" />
      </div>
    </div>
  );
};

export default Critica;