import React from 'react';
import hormigueroLogo from '../../assets/anticon.svg'; // Asegurate de que el path sea correcto

const LoadingPage = () => {
  return (
    <div style={{
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: '#fff',
    }}>
      <img 
        src={hormigueroLogo}
        alt="Cargando"
        style={{
          width: '80px',
          height: '80px',
          animation: 'pulse 1.5s ease-in-out infinite'
        }}
      />
      

      <style>
        {`
          @keyframes pulse {
            0% { transform: scale(1); }
            50% { transform: scale(1.3); }
            100% { transform: scale(1); }
          }
        `}
      </style>
    </div>
  );
};

export default LoadingPage;
