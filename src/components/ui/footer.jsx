import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Github, Twitter, Linkedin, Mail, Heart, Instagram, CheckCircle, AlertCircle } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';

// Definimos el componente de estilo para los keyframes
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

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
  const [email, setEmail] = useState('');
  const [subscriptionStatus, setSubscriptionStatus] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
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

  const handleSubscribe = async (e) => {
    e.preventDefault();
    
    // Basic email validation
    if (!email || !email.includes('@') || !email.includes('.')) {
      setSubscriptionStatus({
        success: false,
        message: 'Por favor, ingresa un correo electrónico válido'
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // First, check if email already exists
      const { data: existingUser, error: checkError } = await supabase
        .from('suscriptor')
        .select('correo, fecha')
        .eq('correo', email)
        .single();
      
      if (checkError && checkError.code !== 'PGRST116') {
        // If error is not "no rows returned" error
        throw checkError;
      }
      
      if (existingUser) {
        // Email already exists
        const registrationDate = new Date(existingUser.fecha);
        const formattedDate = registrationDate.toLocaleDateString('es-ES', {
          day: '2-digit',
          month: '2-digit',
          year: '2-digit'
        });
        
        setSubscriptionStatus({
          success: false,
          message: `Este correo ya está registrado desde el ${formattedDate}`
        });
      } else {
        // Insert new email
        const { error: insertError } = await supabase
          .from('suscriptor')
          .insert([{ correo: email }]);
        
        if (insertError) throw insertError;
        
        // Success
        setSubscriptionStatus({
          success: true,
          message: '¡Te has suscrito exitosamente!'
        });
        
        // Clear email input on success
        setEmail('');
        
        // Clear success message after 5 seconds
        setTimeout(() => {
          setSubscriptionStatus(null);
        }, 5000);
      }
    } catch (error) {
      console.error('Error during subscription:', error);
      setSubscriptionStatus({
        success: false,
        message: 'Ocurrió un error. Por favor, intenta nuevamente.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <footer className="footer">
      {/* Incluimos los keyframes de la animación */}
      <PulseStyle />
      
      <div className="footer-container">
        <div className="footer-grid">
          {/* Contact */}
          <div className="footer-section">
            <h3 className="footer-heading" id="contacto">
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
                    <Instagram size={16} /> hormiguerodepoemas
                  </span>
                </a>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div className="footer-section" >
            <h3 className="footer-heading">QUEDATE AL PENDIENTE</h3>
            <p className="newsletter-text">SUSCRIBETE PARA RECIBIR LAS ULTIMAS NOTICIAS</p>
            <form className="newsletter-form" onSubmit={handleSubscribe}>
              <input
                type="email"
                placeholder="Ingresa tu correo"
                className="newsletter-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isSubmitting}
              />
              <button 
                className="newsletter-button" 
                type="submit"
                disabled={isSubmitting}
                style={{
                  cursor: isSubmitting ? 'not-allowed' : 'pointer',
                  opacity: isSubmitting ? 0.7 : 1,
                }}
              >
                {isSubmitting ? 'Enviando...' : 'Suscríbete'}
              </button>
            </form>
            
            {/* Subscription status message */}
            {subscriptionStatus && (
              <div 
                style={{
                  marginTop: '10px',
                  padding: '8px 12px',
                  borderRadius: '4px',
                  backgroundColor: subscriptionStatus.success ? 'rgba(76, 175, 80, 0.1)' : 'rgba(9, 9, 9, 0.1)',
                  color: subscriptionStatus.success ? '#4caf50' : '#f44336',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontSize: '14px',
                  fontFamily: 'JetBrains Mono, monospace',
                }}
              >
                {subscriptionStatus.success ? (
                  <CheckCircle size={16} />
                ) : (
                  <AlertCircle size={16} />
                )}
                {subscriptionStatus.message}
              </div>
            )}
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