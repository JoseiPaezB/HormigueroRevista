import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { createClient } from '@supabase/supabase-js';
import portada from '../../assets/images/edicion1.png'; // Fallback image
import HormigueadosSection from './hormigueados';
import EventosSection from './eventos';
import Footer from './footer';
// Importa los nuevos componentes
import ScrollReveal from './ScrollReveal'; // Ajusta la ruta según tu estructura
import { setupHashNavigation } from './scrollUtils'; // Ajusta la ruta según tu estructura
import '../ui/ScrollReveal.css';

// Initialize Supabase client
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Add custom styles for the article content

const CustomStyles = () => (
  <style>{`
    /* Apply text justification on all screen sizes */
    .article-content p {
      text-align: justify;
      text-justify: inter-word;
      hyphens: auto;
    }
    
    /* Desktop-specific width constraints */
    @media (min-width: 768px) {
      .article-content {
        max-width: 70%;
        margin: 0 auto;
      }
    }
    
    @media (min-width: 1024px) {
      .article-content {
        max-width: 60%;
      }
    }
    
    @media (min-width: 1280px) {
      .article-content {
        max-width: 50%;
      }
    }
  
    /* Animación para el título EDICION 1 */
    .edicion-title-animation {
      display: inline-block;
      position: relative;
      opacity: 0;
      animation: slideInFromBelow 0.8s forwards 0.3s;
    }
    
    @keyframes slideInFromBelow {
      0% {
        opacity: 0;
        transform: translateY(30px) scale(0.9);
        filter: blur(5px);
      }
      100% {
        opacity: 1;
        transform: translateY(0) scale(1);
        filter: blur(0);
      }
    }
    
    /* Línea pulsante debajo */
    .edition-link::after {
      content: '';
      position: absolute;
      bottom: -5px;
      left: 50%;
      transform: translateX(-50%);
      height: 2px;
      background-color: white;
      transition: width 0.3s ease;
      width: 0;
    }
    
    /* Texto de "Ver más" */
    .click-hint {
      font-size: 12px;
      opacity: 0;
      transition: opacity 0.5s ease;
      margin-top: 5px;
      text-align: center;
    }
    
    /* Animación al entrar en viewport */
    .animate-link::after {
      animation: pulseLine 3.5s infinite ease-in-out;
      width: 100%;
    }
    
    .animate-link .click-hint {
      opacity: 1;
    }
    
    @keyframes pulseLine {
      0% { opacity: 0.5; width: 30%; }
      50% { opacity: 1; width: 100%; }
      100% { opacity: 0.5; width: 30%; }
    }
    
    /* Desktop hover effects */
    @media (min-width: 769px) {
      .edition-link:hover::after {
        width: 100%;
        animation: none;
        opacity: 1;
      }
      
      .edition-link:hover .click-hint {
        opacity: 1;
      }
      
      .edition-link:hover .portada {
        transform: scale(1.05);
        transition: transform 0.3s ease;
      }
    }
    
    /* Mobile enhancements */
    @media (max-width: 768px) {
      .click-hint {
        font-size: 10px;
        padding: 2px 5px;
        border-radius: 3px;
      }
      
      .animate-link::after {
        /* Línea más visible en móvil */
        height: 3px;
      }
      
      .animate-link .portada {
        text-shadow: 0 0 8px rgba(255,255,255,0.4), 2px 2px 4px rgba(0,0,0,0.8);
      }
    }
  `}</style>
);

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
  const [activeHash, setActiveHash] = useState('');
  const coverImageRef = useRef(null);

useEffect(() => {
  if (!editionLinkRef.current) return;
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !isEditionLinkVisible.current) {
        // El elemento ha entrado en el viewport
        isEditionLinkVisible.current = true;
        
        // Activar la animación de línea pulsante después de un momento
        setTimeout(() => {
          if (editionLinkRef.current) {
            editionLinkRef.current.classList.add('animate-link');
          }
        }, 1000);
      }
    });
  }, {
    threshold: 0.7, // Se activa cuando el 70% del elemento es visible
    rootMargin: '0px'
  });
  
  observer.observe(editionLinkRef.current);
  
  return () => {
    if (editionLinkRef.current) {
      observer.unobserve(editionLinkRef.current);
    }
  };
}, [windowWidth]);
  // Track window resize
// Referencia para el elemento de edición
const editionLinkRef = useRef(null);
const isEditionLinkVisible = useRef(false);

// Función para observar el enlace de edición y activar la animación
useEffect(() => {
  if (!editionLinkRef.current) return;
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !isEditionLinkVisible.current) {
        // El elemento ha entrado en el viewport por primera vez
        isEditionLinkVisible.current = true;
        
        // Activar la animación después de un pequeño retraso
        setTimeout(() => {
          if (editionLinkRef.current) {
            editionLinkRef.current.classList.add('animate-underline');
            
            // En móviles, mostrar el texto de "haz clic" automáticamente
            if (windowWidth < 768) {
              editionLinkRef.current.classList.add('show-click-hint');
            }
          }
        }, 1000);
      }
    });
  }, {
    threshold: 0.7, // Se activa cuando el 70% del elemento es visible
    rootMargin: '0px'
  });
  
  observer.observe(editionLinkRef.current);
  
  return () => {
    if (editionLinkRef.current) {
      observer.unobserve(editionLinkRef.current);
    }
  };
}, [windowWidth]);

  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Configurar navegación por hash
  useEffect(() => {
    const cleanup = setupHashNavigation(setActiveHash);
    return cleanup;
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
  // Generate safe position for the author name
const generateSafePosition = () => {
  // Define safe zones based on device size
  const isMobile = windowWidth < 768;
  
  // Márgenes más seguros para móvil
  const mobileMargins = {
    top: 25,      // 25% desde arriba
    bottom: 35,   // 35% desde abajo (evitar área de "EDICION 1")
    left: 25,     // 25% desde la izquierda
    right: 25     // 25% desde la derecha
  };
  
  // Márgenes normales para desktop
  const desktopMargins = {
    top: 15,
    bottom: 30,
    left: 20,
    right: 20
  };
  
  const margins = isMobile ? mobileMargins : desktopMargins;
  
  // Para móviles, creamos una única zona segura centrada con márgenes amplios
  if (isMobile) {
    // Calculamos los límites respetando los márgenes
    const topMin = margins.top;
    const topMax = 100 - margins.bottom;
    const leftMin = margins.left;
    const leftMax = 100 - margins.right;
    
    // Generamos posición dentro de esta zona segura
    const topPosition = Math.floor(Math.random() * (topMax - topMin)) + topMin;
    const leftPosition = Math.floor(Math.random() * (leftMax - leftMin)) + leftMin;
    
    return {
      top: `${topPosition}%`,
      left: `${leftPosition}%`
    };
  } 
  // Para desktop mantenemos el comportamiento original con zonas
  else {
    // Safe zone boundaries (percentage of container)
    const safeZones = [
      // Top area
      {
        topMin: margins.top,
        topMax: 50,
        leftMin: margins.left,
        leftMax: 100 - margins.right
      },
      // Left side
      {
        topMin: margins.top, 
        topMax: 45,
        leftMin: margins.left,
        leftMax: 70 
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
  }
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
  // Determine author font size based on screen width and name length
const getAuthorFontSize = () => {
  const author = getCurrentAuthor() || '';
  const isMobile = windowWidth < 768;
  
  // Tamaños base ajustados para móvil
  const mobileBaseSize = 9; // Reducido de 10px
  const desktopBaseSize = 15;
  
  // Usar tamaños base según dispositivo
  const baseSize = isMobile ? mobileBaseSize : desktopBaseSize;
  
  // Ajustar según longitud del nombre
  if (author.length > 20) return `${isMobile ? 8 : 14}px`; // Nombres muy largos
  if (author.length > 15) return `${isMobile ? 9 : 16}px`; // Nombres largos
  return `${baseSize}px`; // Nombres normales
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
    maxWidth: windowWidth < 768 ? '60%' : '90%',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    zIndex: 10
  };

  // Función para renderizar el título con palabras individualmente animadas
  const renderTitle = () => {
    const title = revista?.nombre?.toUpperCase() || '';
    const words = title.split(' ');
    
    return (
      <h2 className="edition-title" style={{ 
        fontWeight: 'bold', 
        display: 'flex', 
        flexWrap: 'wrap', 
        justifyContent: 'center' 
      }}>
        {words.map((word, index) => {
          // Determinar estilo para palabras específicas (segunda y última)
          const isSecondWord = index === 1;
          const isLastWord = index === words.length - 1;
          const fontWeight = (isSecondWord || isLastWord) ? '1000' : '300';
          
          // Alternar dirección de animación
          const direction = index % 2 === 0 ? 'left' : 'right';
          
          return (
            <ScrollReveal 
              key={index} 
              delay={index * 100} 
              direction={direction}
              className="mx-1"
            >
              <span style={{ 
                fontWeight, 
                display: 'inline-block', 
                margin: '0 5px'
              }}>
                {word}
              </span>
            </ScrollReveal>
          );
        })}
      </h2>
    );
  };

  return (
    <div className="edition-container scroll-reveal-container">
      {/* Include custom styles */}
      <CustomStyles />
      
      {/* Green gradient cover image */}
      <div 
        ref={coverImageRef}
        className="cover-image" 
        id="main-content" 
        style={{
          backgroundImage: revista?.portada ? `url(${revista.portada})` : 'none',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <div className="texture-overlay"></div>
        
        {/* Random positioned author */}
        <div style={authorStyle} className="float">
          {getCurrentAuthor()?.toUpperCase()}
        </div>
        
        {/* Issue info overlay */}
        <div className="issue-info">
            <ScrollReveal direction="up" delay={800}>

           <Link ref={editionLinkRef}  to="/contenidos" className="edition-link hover-underline-animation" style={{
              color: 'white',
              position: 'relative',
              display: 'inline-block',
              cursor: 'pointer'
            }}>
              <h2 className="portada edicion-title-animation">EDICION {revista?.numero || 1}</h2>
              <ScrollReveal direction="up" delay={1000}>
              <p className="edition-date" style={{marginTop:'-2rem'}}>{formatDate(revista?.fecha) || '04/08/25'}</p>
              </ScrollReveal>
              <div className="click-hint">Haz clic para ver más</div>
          </Link>  
          </ScrollReveal>
          

        </div>
      </div>
      
      {/* Article preview section */}
      <ScrollReveal direction="up">
        <div className="article-preview">
          {renderTitle()}
          
          <ScrollReveal delay={300} direction="up">
            <div className="article-content">
              <p>
                {revista?.sintesis || 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse viverra egestas euismod gravida, ut fringilla neque interdum. Vivamus non interdum nisi. Aenean quis egestas justo, vitae tristique ut fermentum risus fermentum. Cras pharetra nec leo sed vel. Sed et sodales tellus, sed feugiat. Proin venenatis dolor non lectus.Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse viverra egestas enim eu gravida, ut fringilla neque interdum. Vivamus non interdum nisi. Aenean quis.Fusce posuere fermentum. Cras pharetra nec leo sed vel. Sed et sodales tellus, sed feugiat.'}
              </p>
              
              <ScrollReveal delay={500} direction="left">
                <a href="/contenidos#sintesis" className="read-more">
                  Leer más...
                </a>
              </ScrollReveal>
            </div>
          </ScrollReveal>
        </div>
      </ScrollReveal>

      {/* Additional articles section */}
      <br />
      <ScrollReveal direction="right">
        <HormigueadosSection />
      </ScrollReveal>
      <br />
      <ScrollReveal direction="up">
        <div id="eventos">
          <EventosSection />
        </div>
      </ScrollReveal>
      <br />
      <ScrollReveal direction="scale">
        <div>
          <Footer />
        </div>
      </ScrollReveal>
      <div id="contacto"></div>
    </div>
  );
};

export default Edicion;