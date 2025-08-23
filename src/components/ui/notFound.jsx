import React from 'react';
import { Home } from 'lucide-react';
import { Link } from 'react-router-dom';
import anti from '/assets/dead-ant-isolated-on-white-600nw-2117536565.webp'; // Adjust the path as necessary

const NotFound = () => {
  return (
    <div className="not-found-container">
      <div className="content-wrapper">
        <div className="image-container">
          <img 
            src={anti}
            alt="Ant" 
          />
        </div>
        
        <h1 className="error-code">404</h1>
        <h2 className="error-title">PAGINA NO ENCONTRADA</h2>
        
        <Link to="/" className="home-link">
          <Home size={20} />
          <span>VOLVER AL INICIO</span>
        </Link>
      </div>
    </div>
  );
};

export default NotFound;