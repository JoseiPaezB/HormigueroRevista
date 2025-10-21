import React, { useState, useEffect, useRef } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Link, useNavigate } from 'react-router-dom';
import { FaBars, FaTimes, FaChevronDown } from 'react-icons/fa';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

const Navbar = () => {
  const [isMobile, setIsMobile] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [edicionesDropdownOpen, setEdicionesDropdownOpen] = useState(false);
  const [allEditions, setAllEditions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hormigueroLogoUrl, setHormigueroLogoUrl] = useState('');
  
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  // Check screen size and update state when it changes
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  // Handle clicks outside the menu for mobile
  useEffect(() => {
    if (!isMobile) return;
    
    const handleClickOutside = (event) => {
      const navbarElement = document.getElementById('navbar');
      const menuElement = document.getElementById('navbar-menu');
      
      if (menuOpen && 
          navbarElement && 
          !navbarElement.contains(event.target) && 
          menuElement && 
          !menuElement.contains(event.target)) {
        setMenuOpen(false);
      }
    };
    
    if (menuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [menuOpen, isMobile]);

  // Handle clicks outside dropdown for desktop
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setEdicionesDropdownOpen(false);
      }
    };
    
    if (edicionesDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [edicionesDropdownOpen]);

  // Fetch all editions from database
  useEffect(() => {
    const fetchEditions = async () => {
      try {
        const { data, error } = await supabase
          .from('revista')
          .select('id, numero')
          .order('numero', { ascending: false });

        if (error) throw error;
        
        setAllEditions(data || []);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching editions:', err);
        setLoading(false);
      }
    };

    fetchEditions();
  }, []);

  // Fetch logo
  useEffect(() => {
    const fetchLogo = async () => {
      try {
        const { data, error } = await supabase
          .from('caras2')
          .select('url');

        if (error) throw error;
        
        if (data && data.length > 0) {
          setHormigueroLogoUrl(data[0].url);
        }
      } catch (err) {
        console.error('Error fetching logo:', err);
      }
    };

    fetchLogo();
  }, []);

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  const toggleEdicionesDropdown = () => {
    setEdicionesDropdownOpen(!edicionesDropdownOpen);
  };

  const handleEditionClick = (editionId) => {
    navigate(`/?edicion=${editionId}`);
    setEdicionesDropdownOpen(false);
    setMenuOpen(false);
  };

  const getLogoSize = () => {
    if (isMobile) {
      return { width: '30px', height: 'auto' };
    } else if (window.innerWidth <= 1200) {
      return { width: '25px', height: 'auto' };
    } else {
      return { width: '25px', height: 'auto' };
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
          width: isMobile ? '20%' : '33%'
        }}>
          {/* Empty section to maintain the layout */}
        </div>
        
        {/* Center section - Logo centered in both mobile and desktop */}
        <div style={{ 
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          width: isMobile ? '60%' : '34%'
        }}>
          <a href="/#main-content" style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center',
          }}>
            <img
              src={hormigueroLogoUrl}
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
          width: isMobile ? '20%' : '33%',
          justifyContent: 'flex-end'
        }}>
          {/* Desktop right menu items */}
          {!isMobile && (
            <div style={{
              display: 'flex',
              flexWrap: window.innerWidth < 1200 ? 'wrap' : 'nowrap',
              justifyContent: 'flex-end',
              alignItems: 'center',
              gap: window.innerWidth < 1200 ? '15px' : '20px'
            }}>
              
              {/* Ediciones Dropdown */}
              <div 
                ref={dropdownRef}
                style={{ position: 'relative' }}
              >
                <button
                  onClick={toggleEdicionesDropdown}
                  style={{ 
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    textDecoration: 'none', 
                    color: '#000',
                    textTransform: 'uppercase',
                    fontSize: window.innerWidth < 1200 ? '12px' : '14px',
                    fontWeight: '500',
                    whiteSpace: 'nowrap',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px',
                    padding: 0
                  }}
                >
                  EDICIONES
                  <FaChevronDown size={10} style={{ 
                    transform: edicionesDropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                    transition: 'transform 0.3s ease'
                  }} />
                </button>
                
                {edicionesDropdownOpen && (
                  <div style={{
                    position: 'absolute',
                    top: '100%',
                    right: 0,
                    marginTop: '10px',
                    backgroundColor: 'white',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                    minWidth: '150px',
                    zIndex: 1001
                  }}>
                    {allEditions.map((edition, index) => (
                      <button
                        key={edition.id}
                        onClick={() => handleEditionClick(edition.id)}
                        style={{
                          display: 'block',
                          width: '100%',
                          padding: '12px 20px',
                          textAlign: 'left',
                          background: 'none',
                          border: 'none',
                          borderBottom: index < allEditions.length - 1 ? '1px solid #eee' : 'none',
                          cursor: 'pointer',
                          fontSize: '15px',
                          color: '#000',
                          transition: 'background-color 0.2s ease'
                        }}
                        onMouseEnter={(e) => e.target.style.backgroundColor = '#f5f5f5'}
                        onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                      >
                        Edición {edition.numero}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              
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

      {/* Mobile dropdown menu */}
      {isMobile && menuOpen && (
        <div 
          id="navbar-menu"
          style={{
            position: 'fixed',
            top: '20px',
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
            
            {/* Ediciones submenu for mobile */}
            <li style={{ padding: '10px 0', borderBottom: '1px solid #eee' }}>
              <div
                onClick={toggleEdicionesDropdown}
                style={{ 
                  textDecoration: 'none', 
                  color: '#000',
                  cursor: 'pointer',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                EDICIONES
                <FaChevronDown size={10} style={{ 
                  transform: edicionesDropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                  transition: 'transform 0.3s ease'
                }} />
              </div>
              
              {edicionesDropdownOpen && (
                <ul style={{
                  listStyleType: 'none',
                  margin: '10px 0 0 0',
                  padding: '0 0 0 15px',
                }}>
                  {allEditions.map((edition) => (
                    <li 
                      key={edition.id}
                      style={{ padding: '8px 0' }}
                    >
                      <button
                        onClick={() => handleEditionClick(edition.id)}
                        style={{
                          background: 'none',
                          border: 'none',
                          padding: 0,
                          cursor: 'pointer',
                          textDecoration: 'none',
                          color: '#666',
                          fontSize: '14px'
                        }}
                      >
                        Edición {edition.numero}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
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