import React from 'react';
import ContentComponent from './ContentComponent';
import video from '../../assets/images/2800-162896281_medium (1).mp4';

const Critica = () => {
  return (
    <div className="relative w-full">
      {/* Full page video background */}
      <video 
        className="fixed top-0 left-0 w-full h-full object-cover z-0"
        style={{ 
          minWidth: '100vw',
          minHeight: '100vh',
          position: 'fixed',
          zIndex: '-1' //
        }}
        autoPlay 
        loop 
        muted
      >
        <source src={video} type="video/mp4" />
        Your browser does not support the video tag.
      </video>
      
      {/* Content overlay - everything from ContentComponent will display on top */}
      <div className="relative z-10" style={{color: 'white'}}>
        <ContentComponent contentType="critica" />
      </div>
    </div>
  );
};

export default Critica;