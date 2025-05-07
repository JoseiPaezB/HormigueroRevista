import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { createClient } from '@supabase/supabase-js';
import portada from '../../assets/images/edicion1.png'; // Fallback image
import HormigueadosSection from './hormigueados';
import EventosSection from './eventos';
import Footer from './footer';

// Initialize Supabase client
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const Edicion = () => {
  // State for revista data
  const [revista, setRevista] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [contributors, setContributors] = useState([]);
  const [allAuthors, setAllAuthors] = useState([]);
  const [visibleAuthorIndex, setVisibleAuthorIndex] = useState(0);
  const [authorPosition, setAuthorPosition] = useState({ top: '40%', left: '50%' });
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const coverImageRef = useRef(null);

  // Track window resize
  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Fetch revista data on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        // 1. Fetch the revista with ID 1
        const { data: revistaData, error: revistaError } = await supabase
          .from('revista')
          .select('*')
          .eq('id', 1)
          .single();

        if (revistaError) throw revistaError;
        setRevista(revistaData);
        
        // 2. Parse contributors string into array if it exists
        if (revistaData.contribuyentes) {
          const contributorsList = revistaData.contribuyentes.split(',').map(name => name.trim());
          setContributors(contributorsList);
        }

        // 3. Fetch authors from the autor table
        const { data: authorsData, error: authorsError } = await supabase
          .from('autor')
          .select('nombre')
          .order('nombre');

        if (authorsError) throw authorsError;
        
        // 4. If we have authors from the database, use them
        if (authorsData && authorsData.length > 0) {
          const authorNames = authorsData.map(author => author.nombre);
          setAllAuthors(authorNames);
          
          // If no contributors in revista, use authors
          if (!revistaData.contribuyentes || revistaData.contribuyentes.trim() === '') {
            setContributors(authorNames);
          }
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load magazine data');
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Generate safe position for the author name
  const generateSafePosition = () => {
    // Define safe zones based on device size
    const isMobile = windowWidth < 768;
    
    // Safe zone boundaries (percentage of container)
    // Avoid the bottom area where "EDICION 1" text appears (typically bottom 30%)
    const safeZones = [
      // Top area
      {
        topMin: 15,
        topMax: isMobile ? 40 : 50,
        leftMin: 20,
        leftMax: 80
      },
      // Left side (avoiding the right where text might overflow on mobile)
      {
        topMin: 15, 
        topMax: 45,
        leftMin: 20,
        leftMax: isMobile ? 50 : 70 
      }
    ];
    
    // Randomly choose a safe zone
    const safeZone = safeZones[Math.floor(Math.random() * safeZones.length)];
    
    // Generate position within the chosen safe zone
    const topPosition = Math.floor(Math.random() * (safeZone.topMax - safeZone.topMin)) + safeZone.topMin;
    const leftPosition = Math.floor(Math.random() * (safeZone.leftMax - safeZone.leftMin)) + safeZone.leftMin;
    
    return {
      top: `${topPosition}%`,
      left: `${leftPosition}%`
    };
  };

  // Effect for rotating through author names and positions
  useEffect(() => {
    if (!allAuthors.length) return;
    
    const interval = setInterval(() => {
      setVisibleAuthorIndex(prevIndex => (prevIndex + 1) % allAuthors.length);
      setAuthorPosition(generateSafePosition());
    }, 3000); // Change author every 3 seconds
    
    return () => clearInterval(interval);
  }, [allAuthors, windowWidth]);

  // Format date for display (YYYY-MM-DD to DD/MM/YY)
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: '2-digit'
    });
  };

  // Get the current author to display
  const getCurrentAuthor = () => {
    if (allAuthors.length === 0) {
      // Fallback if no authors found
      return contributors.length > 0 ? contributors[0] : "AUTORES DESTACADOS";
    }
    return allAuthors[visibleAuthorIndex];
  };

  // Determine author font size based on screen width and name length
  const getAuthorFontSize = () => {
    const author = getCurrentAuthor() || '';
    const isMobile = windowWidth < 768;
    const baseSize = isMobile ? 16 : 22;
    
    // Reduce font size for longer names
    if (author.length > 20) return `${isMobile ? 12 : 18}px`;
    if (author.length > 15) return `${isMobile ? 14 : 20}px`;
    return `${baseSize}px`;
  };

  // Author name style - dynamic based on screen size
  const authorStyle = {
    position: 'absolute',
    top: authorPosition.top,
    left: authorPosition.left,
    transform: 'translate(-50%, -50%)',
    fontSize: getAuthorFontSize(),
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: '1px',
    color: 'white',
    textShadow: '2px 2px 4px rgba(0,0,0,0.8)',
    transition: 'all 0.5s ease-in-out',
    whiteSpace: 'nowrap',
    maxWidth: windowWidth < 768 ? '70%' : '90%',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    zIndex: 10
  };

  return (
    <div className="edition-container">
      {/* Green gradient cover image */}
      <div 
        ref={coverImageRef}
        className="cover-image" 
        id="main-content" 
        style={{
          backgroundImage: revista?.portada ? `url(${revista.portada})` : `url(${portada})`,
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <div className="texture-overlay"></div>
        
        {/* Random positioned author */}
        <div style={authorStyle}>
          {getCurrentAuthor()?.toUpperCase()}
        </div>
        
        {/* Issue info overlay */}
        <div className="issue-info">
          <Link to="/contenidos" className="edition-link" style={{color: 'white'}}>
            <h2 className="portada">EDICION {revista?.numero || 1}</h2>
          </Link>          
          <p className="edition-date">{formatDate(revista?.fecha) || '04/08/25'}</p>
        </div>
      </div>
      
      {/* Article preview section */}
      <div className="article-preview">
        <h2 className="edition-title" style={{ fontWeight: 'bold' }}>
          {revista?.nombre?.toUpperCase() || 'LOS INSECTOS TAMBIEN SON PARTE DE LO MINIMO'}
        </h2>
        
        <div className="article-content">
          <p>
            {revista?.sintesis || 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse viverra egestas euismod gravida, ut fringilla neque interdum. Vivamus non interdum nisi. Aenean quis egestas justo, vitae tristique ut fermentum risus fermentum. Cras pharetra nec leo sed vel. Sed et sodales tellus, sed feugiat. Proin venenatis dolor non lectus.Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse viverra egestas enim eu gravida, ut fringilla neque interdum. Vivamus non interdum nisi. Aenean quis.Fusce posuere fermentum. Cras pharetra nec leo sed vel. Sed et sodales tellus, sed feugiat.'}
          </p>
          
          <p className="read-more">
            Leer más...
          </p>
        </div>
      </div>

      {/* Additional articles section */}
      <br />
      <HormigueadosSection />
      <br />
      <div id="eventos">
        <EventosSection />
      </div>
      <br />
      <div>
        <Footer />
      </div>
      <div id="contacto"></div>
    </div>
  );
};

export default Edicion;