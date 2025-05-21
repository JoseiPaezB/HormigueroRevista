import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Github, Twitter, Linkedin, Mail, Heart, Instagram, CheckCircle, AlertCircle, Users } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';
import ScrollReveal from './ScrollReveal'; // Importa el componente ScrollReveal (ajusta la ruta según sea necesario)

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
  const [colaboradores, setColaboradores] = useState([]);
  
  // Fetch colaboradores from the revista table
  useEffect(() => {
    const fetchColaboradores = async () => {
      try {
        // Obtener colaboradores de la última revista (ID 1)
        const { data, error } = await supabase
          .from('revista')
          .select('contribuyentes')
          .eq('id', 1)
          .single();
        
        if (error) throw error;
        
        if (data && data.contribuyentes) {
          // Dividir la cadena por comas y eliminar espacios en blanco
          const colaboradoresList = data.contribuyentes
            .split(',')
            .map(nombre => nombre.trim())
            .filter(nombre => nombre.length > 0); // Filtrar nombres vacíos
          
          setColaboradores(colaboradoresList);
        }
      } catch (error) {
        console.error('Error fetching colaboradores:', error);
      }
    };
    
    fetchColaboradores();
  }, []);
  
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
    <footer className="footer scroll-reveal-container">
      {/* Incluimos los keyframes de la animación */}
      <PulseStyle />
      
      <div className="footer-container">
        <div className="footer-grid">
          {/* Sección de Colaboradores - Nueva sección */}
          <ScrollReveal direction="up" delay={300}>
           <div className="footer-section">
            <h3 className="footer-heading" id="colaboradores">
              
               COLABORADORES
              
            </h3>
            <div className="colaboradores-list" style={{ 
              display: 'flex', 
              flexDirection: 'column',  // Cambio clave para mostrar en columna
              gap: '8px', 
              marginTop: '12px',
              maxWidth: '100%'
            }}>
              {colaboradores.length > 0 ? (
                colaboradores.map((colaborador, index) => (
                  <span 
                    key={index}
                    style={{ 
                      display: 'block',  // Cambiado a block para ocupar todo el ancho
                      padding: '4px 8px',
                      fontSize: '14px',
                      transition: 'all 0.2s ease',
                      cursor: 'default',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateX(5px)';  // Modificado para un efecto horizontal
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateX(0)';
                    }}
                  >
                   <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Users size={16} /> {colaborador.toUpperCase()}
                    </span>
                  </span>
                ))
              ) : (
                <p style={{ fontSize: '14px', fontStyle: 'italic', margin: '0' }}>
                  Cargando colaboradores...
                </p>
              )}
            </div>
          </div>
          </ScrollReveal>
          
          {/* Contact */}
          <ScrollReveal direction="up" delay={500}>
            <div className="footer-section">
              <h3 className="footer-heading" id="contacto">
                CONTACTO
              </h3>
              <ul className="footer-list" style={{ textAlign: 'left', padding: 0 }}>
                <li style={{ textAlign: 'left', listStyleType: 'none', marginBottom: '8px' }}>
                  <a href="mailto:hormiguero.bj@gmail.com" style={{ textDecoration: 'none', color: 'inherit' }} >
                    <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Mail size={16} /> HORMIGUERO.BJ@GMAIL.COM
                    </span>
                  </a>
                </li>
                <li style={{ textAlign: 'left', listStyleType: 'none' }}>
                  <a href="https://www.instagram.com/hormiguerodepoemas?igsh=Y2owbnVvOGkxcmhs" target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none', color: 'inherit' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Instagram size={16} /> HORMIGUERODEPOEMAS
                    </span>
                  </a>
                </li>
              </ul>
            </div>
          </ScrollReveal>

          {/* Newsletter */}
          <ScrollReveal direction="up" delay={700}>
            <div className="footer-section" id="suscribir">
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
          </ScrollReveal>
        </div>

        {/* Social Links & Copyright */}
        <ScrollReveal direction="up" delay={900}>
          <div className="footer-bottom">
            <div className="copyright">
              <span id="suscribete">&copy; {new Date().getFullYear()} HORMIGUERO. TODOS LOS DERECHOS RESERVADOS.</span>
            </div>
          </div>
        </ScrollReveal>
      </div>
      
      {/* CSS para el contenedor scroll-reveal */}
      <style>{`
        .scroll-reveal-container {
          overflow-x: hidden;
        }
        
        /* Estilo para el grid del footer para incluir 3 columnas */
        .footer-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 20px;
        }
        
        /* Ajuste para móviles */
        @media (max-width: 768px) {
          .footer-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </footer>
  );
};

export default Footer;