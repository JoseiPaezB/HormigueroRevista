import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Link } from 'react-router-dom';
import { FaBars, FaTimes } from 'react-icons/fa';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

const Navbar = () => {
  const [isMobile, setIsMobile] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [revista, setRevista] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hormigueroLogoUrl, setHormigueroLogoUrl] = useState('');

  // Check screen size and update state when it changes
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    // Initial check
    checkScreenSize();
    
    // Add listener for resize events
    window.addEventListener('resize', checkScreenSize);
    
    // Clean up
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  // Handle clicks outside the menu for mobile
  useEffect(() => {
    if (!isMobile) return; // Only needed for mobile
    
    const handleClickOutside = (event) => {
      const navbarElement = document.getElementById('navbar');
      const menuElement = document.getElementById('navbar-menu');
      
      // Si el menú está abierto y el clic fue fuera del navbar y del menú
      if (menuOpen && 
          navbarElement && 
          !navbarElement.contains(event.target) && 
          menuElement && 
          !menuElement.contains(event.target)) {
        setMenuOpen(false);
      }
    };
    
    // Añadir el detector de eventos si el menú está abierto
    if (menuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    // Limpiar detector de eventos
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [menuOpen, isMobile]);

  // Fetch revista data
  useEffect(() => {
    const fetchRevista = async () => {
      try {
        // Fetch the revista with ID 1
        const { data, error } = await supabase
          .from('revista')
          .select('*')
          .eq('id', 2)
          .single();

        if (error) throw error;
        
        setRevista(data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching revista:', err);
        setError('Failed to load magazine data');
        setLoading(false);
      }
    };

    fetchRevista();
  }, []);

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };
  useEffect(() => {
    const fetchLogo = async () => {
      try {
        const { data, error } = await supabase
          .from('caras')
          .select('url')
          .single();

        if (error) throw error;
        setHormigueroLogoUrl(data.url);
      } catch (err) {
        console.error('Error fetching logo:', err);
      }
    };

    fetchLogo();
  }, []);
  // Logo and brand size based on screen size
  const getLogoSize = () => {
    if (isMobile) {
      return { width: '30px', height: 'auto' };
    } else if (window.innerWidth <= 1200) {
      return { width: '25px', height: 'auto' }; // Smaller for medium screens
    } else {
      return { width: '25px', height: 'auto' }; // Smaller for large screens
    }
  };

  const getBrandTextSize = () => {
    if (isMobile) {
      return '9px';
    } else if (window.innerWidth <= 1200) {
      return '13px'; // Smaller for medium screens
    } else {
      return '15px'; // Smaller for large screens
    }
  };

  return (
    <>
      <nav 
        id="navbar"
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: isMobile ? '2px 12px' : '10px 20px',
          width: '100%',
          backgroundColor: 'white',
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 1000,
          boxSizing: 'border-box'
        }}>
        
        {/* Left section - Empty on both mobile and desktop */}
        <div style={{ 
          width: isMobile ? '20%' : '33%' // Give each section equal width on desktop
        }}>
          {/* Empty section to maintain the layout */}
        </div>
        
        {/* Center section - Logo centered in both mobile and desktop */}
        <div style={{ 
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          width: isMobile ? '60%' : '34%' // Give slightly more space for the logo
        }}>
          {/* Logo and text */}
          <a href="/#main-content" style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center',

          }}>
            <img
              src={hormigueroLogoUrl} // fallback al logo local si no carga desde DB
              alt="Hormiga"
              style={getLogoSize()}
            />
           
          </a>
        </div>
        
        {/* Right section - All navigation items on desktop, menu icon on mobile */}
        <div style={{ 
          display: 'flex',
          alignItems: 'center',
          gap: isMobile ? 0 : '20px',
          width: isMobile ? '20%' : '33%', // Give each section equal width on desktop
          justifyContent: 'flex-end' // Push items to the right
        }}>
          {/* Desktop right menu items - all navigation in one place */}
          {!isMobile && (
            <div style={{
              display: 'flex',
              flexWrap: window.innerWidth < 1200 ? 'wrap' : 'nowrap',
              justifyContent: 'flex-end',
              gap: window.innerWidth < 1200 ? '15px' : '20px'
            }}>
              
              <Link 
                to="/contenidos" 
                style={{ 
                  textDecoration: 'none', 
                  color: '#000',
                  textTransform: 'uppercase',
                  fontSize: window.innerWidth < 1200 ? '12px' : '14px',
                  fontWeight: '500',
                  whiteSpace: 'nowrap'
                }}
              >
                EDICIÓN {revista?.numero || 1}
              </Link>
              
              <a 
                href="/#hormigueados" 
                style={{ 
                  textDecoration: 'none', 
                  color: '#000',
                  textTransform: 'uppercase',
                  fontSize: window.innerWidth < 1200 ? '12px' : '14px',
                  fontWeight: '500',
                  whiteSpace: 'nowrap'
                }}
              >
                HORMIGUEADOS
              </a>
              <a 
                href="/#colaboradores" 
                style={{ 
                  textDecoration: 'none', 
                  color: '#000',
                  textTransform: 'uppercase',
                  fontSize: window.innerWidth < 1200 ? '12px' : '14px',
                  fontWeight: '500',
                  whiteSpace: 'nowrap'
                }}
              >
                COLABORADORES
              </a>
              <a 
                href="/#contacto" 
                style={{ 
                  textDecoration: 'none', 
                  color: '#000',
                  textTransform: 'uppercase',
                  fontSize: window.innerWidth < 1200 ? '12px' : '14px',
                  fontWeight: '500',
                  whiteSpace: 'nowrap'
                }}
              >
                CONTACTO
              </a>
              
              <a 
                href="/#contacto" 
                style={{ 
                  textDecoration: 'none', 
                  color: '#000',
                  textTransform: 'uppercase',
                  fontSize: window.innerWidth < 1200 ? '12px' : '14px',
                  fontWeight: '500',
                  whiteSpace: 'nowrap'  
                }}
              >
                SUSCRÍBETE
              </a>
            </div>
          )}

          {/* Menu toggle - only visible on mobile */}
          {isMobile && (
            <button 
              aria-label="Menu" 
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
              onClick={toggleMenu}
            >
              {menuOpen ? <FaTimes size={18} color="#000" /> : <FaBars size={18} color="#000" />}
            </button>
          )}
        </div>
      </nav>

      {/* Mobile dropdown menu - only rendered on mobile */}
      {isMobile && menuOpen && (
        <div 
          id="navbar-menu"
          style={{
            position: 'fixed',
            top: '20px', // Adjust based on your navbar height
            left: 0,
            right: 0,
            backgroundColor: 'white',
            borderBottom: '1px solid #ddd',
            zIndex: 999,
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
            padding: '20px',
            transition: 'all 0.3s ease',
            transform: menuOpen ? 'translateY(0)' : 'translateY(-100%)',
            opacity: menuOpen ? 1 : 0,
          }}>
          <ul style={{
            listStyleType: 'none',
            margin: 0,
            padding: 0,
          }}>
            <li style={{ padding: '10px 0', borderBottom: '1px solid #eee' }}>
              <a 
                href="/#main-content" 
                style={{ textDecoration: 'none', color: '#000' }}
                onClick={() => setMenuOpen(false)}
              >
                INICIO
              </a>
            </li>
            
            <li style={{ padding: '10px 0', borderBottom: '1px solid #eee' }}>
              <Link 
                to="/contenidos" 
                style={{ textDecoration: 'none', color: '#000' }}
                onClick={() => setMenuOpen(false)}
              >
                EDICIÓN {revista?.numero || 1}
              </Link>
            </li>
            
            <li style={{ padding: '10px 0', borderBottom: '1px solid #eee' }}>
              <a
                href="/#hormigueados" 
                style={{ textDecoration: 'none', color: '#000' }}
                onClick={() => setMenuOpen(false)}
              >
                HORMIGUEADOS
              </a>
            </li>
            <li style={{ padding: '10px 0', borderBottom: '1px solid #eee' }}>
              <a 
                href="/#colaboradores" 
                style={{ textDecoration: 'none', color: '#000' }}
                onClick={() => setMenuOpen(false)}
              >
                COLABORADORES
              </a>
            </li>
            
            <li style={{ padding: '10px 0', borderBottom: '1px solid #eee' }}>
              <a 
                href="/#contacto" 
                style={{ textDecoration: 'none', color: '#000' }}
                onClick={() => setMenuOpen(false)}
              >
                CONTACTO
              </a>
            </li>

            <li style={{ padding: '10px 0', borderBottom: '1px solid #eee' }}>
              <a 
                href="/#suscribir" 
                style={{ textDecoration: 'none', color: '#000' }}
                onClick={() => setMenuOpen(false)}
              >
                SUSCRÍBETE
              </a>
            </li>
          </ul>
        </div>
      )}
    </>
  );
};

export default Navbar;