import React, { useState, useEffect } from 'react';
import { FaInstagram, FaEnvelope, FaSearch, FaBars, FaTimes } from 'react-icons/fa';
import hormigueroLogo from '../../assets/anticon.svg'; // Adjust the path as necessary

const Navbar = () => {
  const [isMobile, setIsMobile] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

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

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  return (
    <>
      <nav style={{
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
        <img 
            src={hormigueroLogo} 
            alt="Hormiga" 
            style={{ width: isMobile ? '30px' : '60px', height: 'auto' }} 
        />
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
        <div style={{
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
              <a href="#" style={{ textDecoration: 'none', color: '#000' }}>Home</a>
            </li>
            <li style={{ padding: '10px 0', borderBottom: '1px solid #eee' }}>
              <a href="#" style={{ textDecoration: 'none', color: '#000' }}>About</a>
            </li>
            <li style={{ padding: '10px 0', borderBottom: '1px solid #eee' }}>
              <a href="#" style={{ textDecoration: 'none', color: '#000' }}>Blog</a>
            </li>
            <li style={{ padding: '10px 0' }}>
              <a href="#" style={{ textDecoration: 'none', color: '#000' }}>Contact</a>
            </li>
            {/* Only show these on mobile since they're hidden in the navbar */}
            {isMobile && (
              <>
                <li style={{ padding: '10px 0', borderBottom: '1px solid #eee' }}>
                  <a href="#instagram" style={{  color: '#000', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <FaInstagram size={16} /> Instagram
                  </a>
                </li>
                <li style={{ padding: '10px 0', borderBottom: '1px solid #eee' }}>
                  <a href="#email" style={{  color: '#000', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <FaEnvelope size={16} /> Contact
                  </a>
                </li>
                <li style={{ padding: '10px 0' }}>
                  <a href="#search" style={{  color: '#000', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <FaSearch size={16} /> Search
                  </a>
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