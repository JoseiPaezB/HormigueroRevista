import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Link } from 'react-router-dom';
import { FaInstagram, FaEnvelope, FaSearch, FaBars, FaTimes } from 'react-icons/fa';
import hormigueroLogo from '../../assets/anticon.svg'; // Adjust the path as necessary
import { FaBell } from 'react-icons/fa6';
import { HashLink } from 'react-router-hash-link';


const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

const Navbar = () => {
  const [isMobile, setIsMobile] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [revista, setRevista] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [contributors, setContributors] = useState([]);
  
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

  // Check for scroll to eventos
 

  // Handle clicks outside the menu
  useEffect(() => {
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
  }, [menuOpen]);

  // Fetch revista data
  useEffect(() => {
    const fetchRevista = async () => {
      try {
        // Fetch the revista with ID 1
        const { data, error } = await supabase
          .from('revista')
          .select('*')
          .eq('id', 1)
          .single();

        if (error) throw error;
        
        setRevista(data);
        
        // Parse contributors string into array
        if (data.contribuyentes) {
          const contributorsList = data.contribuyentes.split(',').map(name => name.trim());
          setContributors(contributorsList);
        }
        
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
        {!isMobile && (
          <div style={{ 
            display: 'flex', 
            gap: '20px'
          }}>
            <a href="#instagram" aria-label="Instagram">
              <FaInstagram size={20} color="#000" />
            </a>
            <a href="#email" aria-label="Email">
              <FaEnvelope size={20} color="#000" />
            </a>
          </div>
        )}

        {isMobile && <div style={{ width: '20px' }}></div>}

        <div style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center' 
        }}>
          <Link to="/#main-content">
            <img
              src={hormigueroLogo}
              alt="Hormiga"
              style={{ width: isMobile ? '30px' : '60px', height: 'auto' }}
            />
          </Link>
          <span style={{ 
            fontSize: isMobile ? '12px' : '25px',
            marginTop: '2px',
            color: '#000',
            textTransform: 'uppercase'
          }}>
            Hormiguero
          </span>
        </div>

        {/* Right icons */}
        <div style={{ 
          display: 'flex', 
          gap: isMobile ? '15px' : '20px'
        }}>
          {/* Search icon - only visible on desktop */}
          {!isMobile && (
            <button aria-label="Search" style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
              <FaSearch size={20} color="#000" />
            </button>
          )}
          
          {/* Menu icon - always visible */}
          <button 
            aria-label="Menu" 
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
            onClick={toggleMenu}
          >
            {menuOpen ? <FaTimes size={isMobile ? 18 : 20} color="#000" /> : <FaBars size={isMobile ? 18 : 20} color="#000" />}
          </button>
        </div>
      </nav>

      {/* Dropdown menu */}
      {menuOpen && (
        <div 
          id="navbar-menu"
          style={{
            position: 'fixed',
            top: isMobile ? '60px' : '80px', // Adjust based on your navbar height
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
            fontFamily: '"JetBrains Mono", monospace',
          }}>
            <li style={{ padding: '10px 0', borderBottom: '1px solid #eee' }}>
              <Link 
                to="/#main-content" 
                className="edition-link" 
                style={{ textDecoration: 'none', color: '#000' }}
                onClick={() => setMenuOpen(false)}

              >
                INICIO
              </Link>
            </li>
            
            <li style={{ padding: '10px 0', borderBottom: '1px solid #eee' }}>
              <Link 
                to="/contenidos" 
                className="edition-link" 
                style={{ textDecoration: 'none', color: '#000' }}
                onClick={() => setMenuOpen(false)}
              >
                EDICION {revista?.numero}
              </Link>
            </li>
            
            <li style={{ padding: '10px 0', borderBottom: '1px solid #eee' }}>
              <Link 
                to="/#eventos" 
                className="edition-link" 
                style={{ textDecoration: 'none', color: '#000' }}
                onClick={() => setMenuOpen(false)}

              >
                EVENTOS
              </Link>
            </li>

            {/* Only show these on mobile since they're hidden in the navbar */}
            {isMobile && (
              <>
                <li style={{ padding: '10px 0', borderBottom: '1px solid #eee' }}>
                  <Link 
                    to="/#contacto" 
                    className="edition-link" 
                    style={{ textDecoration: 'none', color: '#000', display: 'flex', alignItems: 'center', gap: '10px' }}
                    onClick={() => setMenuOpen(false)}

                  >
                    CONTACTO
                  </Link>
                </li>

                <li style={{ padding: '10px 0', borderBottom: '1px solid #eee' }}>
                  <Link 
                    to="/#contacto" 
                    className="edition-link" 
                    style={{ textDecoration: 'none', color: '#000', display: 'flex', alignItems: 'center', gap: '10px' }}
                    onClick={() => setMenuOpen(false)}

                  >
                    SUSCRIBETE
                  </Link>
                </li>
              </>
            )}
          </ul>
        </div>
      )}
    </>
  );
};

export default Navbar;