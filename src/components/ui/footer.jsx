import React from 'react';
import { Github, Twitter, Linkedin, Mail, Heart } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-grid">
         

          {/* Contact */}
          <div className="footer-section">
            <h3 className="footer-heading">CONTACTO</h3>
            <ul className="footer-list" style={{ textAlign: 'left', padding: 0 }}>
              <li style={{ textAlign: 'left', listStyleType: 'none', marginBottom: '8px' }}>
                HORMIGUERO@GMAIL.COM
              </li>
              <li style={{ textAlign: 'left', listStyleType: 'none' }}>
                BRUNOJAVIER@GMAIL.COM
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div className="footer-section">
            <h3 className="footer-heading">QUEDATE AL PENDIENTE</h3>
            <p className="newsletter-text">SUBSCRIBETE PARA RECIBIR LAS ULTIMAS NOTICIAS</p>
            <form className="newsletter-form">
              <input
                type="email"
                placeholder="Ingresa tu correo"
                className="newsletter-input"
              />
              <button className="newsletter-button">
                Subscribete
              </button>
            </form>
          </div>
        </div>

        {/* Social Links & Copyright */}
        <div className="footer-bottom">
        <div className="copyright">
              <span>&copy; {new Date().getFullYear()} HORMIGUERO. TODOS LOS DERECHOS RESERVADOS.</span>
            </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;