import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Github, Twitter, Linkedin, Mail, Heart, Instagram } from 'lucide-react';

// Definimos el componente de estilo para los keyframes
const PulseStyle = () => (
  <style>{`
    @keyframes pulse {
      0% { transform: scale(1); }
      20% { transform: scale(1.1); }
      40% { transform: scale(1.08); }
      60% { transform: scale(1.1); }
      80% { transform: scale(1.08); }
      100% { transform: scale(1); }
    }
  `}</style>
);

const Footer = () => {
  const [emphasizeContact, setEmphasizeContact] = useState(false);
  
  
  
  const handleContactEmphasis = () => {
   




    const footerElement = document.getElementById('contacto');
    if (footerElement) {
      footerElement.scrollIntoView({ behavior: 'smooth' });
      
      // Activar el efecto después de un pequeño retraso
      setTimeout(() => {
        setEmphasizeContact(true);
        
        // Desactivar después de completar la animación
        setTimeout(() => {
          setEmphasizeContact(false);
        }, 1500);
      }, 300); // Pequeño retraso para que la animación comience después del scroll
    }
  };

  return (
    <footer className="footer">
      {/* Incluimos los keyframes de la animación */}
      <PulseStyle />
      
      <div className="footer-container">
        <div className="footer-grid">
          {/* Contact */}
          <div 
            className="footer-section"
            
          >
            <h3 
              className="footer-heading" 
              id="contacto"
              
            >
              CONTACTO
            </h3>
            <ul className="footer-list" style={{ textAlign: 'left', padding: 0 }}>
              <li style={{ textAlign: 'left', listStyleType: 'none', marginBottom: '8px' }}>
                <a href="mailto:hormiguero@gmail.com" style={{ textDecoration: 'none', color: 'inherit' }} >
                  <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Mail size={16} /> HORMIGUERO@GMAIL.COM
                  </span>
                </a>
              </li>
              <li style={{ textAlign: 'left', listStyleType: 'none' }}>
                <a href="https://www.instagram.com/hormiguero.revista/" target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none', color: 'inherit' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Instagram size={16} /> HORMIGUERODEPOEMAS
                  </span>
                </a>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div className="footer-section" >
            <h3 className="footer-heading">QUEDATE AL PENDIENTE</h3>
            <p className="newsletter-text">SUSCRIBETE PARA RECIBIR LAS ULTIMAS NOTICIAS</p>
            <form className="newsletter-form">
              <input
                type="email"
                placeholder="Ingresa tu correo"
                className="newsletter-input"
              />
              <button className="newsletter-button" >
                Suscribete
              </button>
            </form>
          </div>
        </div>

        {/* Social Links & Copyright */}
        <div className="footer-bottom">
          <div className="copyright">
            <span id="suscribete">&copy; {new Date().getFullYear()} HORMIGUERO. TODOS LOS DERECHOS RESERVADOS.</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;