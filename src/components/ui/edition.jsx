import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { createClient } from '@supabase/supabase-js';

import HormigueadosSection from './hormigueados';
import Footer from './footer';
// Importa los nuevos componentes
import ScrollReveal from './ScrollReveal'; // Ajusta la ruta según tu estructura
import { setupHashNavigation } from './scrollUtils'; // Ajusta la ruta según tu estructura
import '../ui/ScrollReveal.css';
import {insects} from '../../data/insects'
import InsectColony from './MovingSvgBackground'; // Adjust the path as needed
import { Helmet } from 'react-helmet';


import RotatingMani from './rotatingMani';


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
      left:0%;
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
      width: 15%;
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

const Res= () => {
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
  const [autores, setAutores] = useState([]);
  const [viewportHeight, setViewportHeight] = useState(window.innerHeight);


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
      // 1. Fetch the revista with ID 2
      const { data: revistaData, error: revistaError } = await supabase
        .from('revista')
        .select('*')
        .eq('id', 2)
        .single();

      if (revistaError) throw revistaError;
      setRevista(revistaData);
      
      // 2. Parse contributors string into array if it exists
      if (revistaData.contribuyentes) {
        const contributorsList = revistaData.contribuyentes.split(',').map(name => name.trim());
        setContributors(contributorsList);
      }

      // 3. Fetch authors ONLY for revista 2 from the revista_autor junction table
      const { data: authorsData, error: authorsError } = await supabase
        .from('revista_autor')
        .select(`
          autor(nombre)
        `)
        .eq('id_revista', 2);

      if (authorsError) throw authorsError;
      
      // 4. If we have authors from the database, use them
      if (authorsData && authorsData.length > 0) {
        const authorNames = authorsData
          .map(item => item.autor.nombre)
          .sort(); // Alphabetical sort
        setAllAuthors(authorNames);
        setAutores(authorNames);
        
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
    textShadow: '1px 1px 2px black, -1px -1px 2px black, 1px -1px 2px black, -1px 1px 2px black',
    transition: 'all 0.5s ease-in-out',
    whiteSpace: 'nowrap',
    maxWidth: windowWidth < 768 ? '60%' : '90%',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    zIndex: 10
  };

  // Add these two new functions after your existing renderTitle function:

const renderHormigueroTitle = () => {
  const words = ['HORMIGUERO', 'DE POEMAS'];
  
  return (
    
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column',
      alignItems: 'flex-start'
    }}>
      {words.map((word, index) => {
        const fontWeights = ['900', '300', '300']; // HORMIGUERO(bold), DE(light), POEMAS(light)
        const fontWeight = fontWeights[index] || '400';
        const directions = ['left', 'up', 'right'];
        const direction = directions[index] || 'left';
        
        return (
          <ScrollReveal 
            key={index} 
            delay={200 + (index * 200)} 
            direction={direction}
          >
            <span style={{ 
              fontWeight, 
              display: 'inline-block',
              letterSpacing: word === 'HORMIGUERO' ? '2px' : '1px',
              fontSize: index === 0 ? (isDesktop ? '6rem' : '2.5rem') : (isDesktop ? '4.5rem' : '1.5rem'),
              lineHeight: '0.9',
              color: 'white',
              textShadow: '2px 2px 2px rgba(0, 0, 0, 0.5)' // More subtle
            }}>
              {word}
            </span>
          </ScrollReveal>
        );
      })}
    </div>
  );
};

const renderEspiritusTitle = () => {
  const titleText = revista?.nombre.toUpperCase() || '';
  const words = titleText.split(' ');

  return (
    <h2 style={{
      fontWeight: 'bold', 
      display: 'flex', 
      flexWrap: 'wrap', 
      justifyContent: 'flex-start',
      gap: '12px',
      margin: '0 0 15px 0',
      lineHeight: '1.1',
      textShadow: '2px 2px 2px rgba(0, 0, 0, 0.5)' // More subtle
    }}>
      {words.map((word, index) => {
        // Positions: 0=FORMAS(bold), 1=DE(light), 2=HABITAR(bold), 3=EL(light), 4=MUNDO(bold)
        const fontWeight = (index === 0 || index === 2 || index === 4) ? '900' : '300';
        const directions = ['left', 'up', 'right', 'left', 'up'];
        const direction = directions[index] || 'up';
        
        return (
          <ScrollReveal 
            key={index} 
            delay={2000 + (index * 150)} 
            direction={direction}
          >
            <span style={{ 
              fontWeight, 
              display: 'inline-block',
              letterSpacing: '0.5px',
              fontSize: 'clamp(1.5rem, 5vw, 4.5rem)'
            }}>
              {word}
            </span>
          </ScrollReveal>
        );
      })}
    </h2>
  );
};

  // Función para renderizar el título con palabras individualmente animadas
 const renderTitle = () => {
  const title = 'SOBRE EL HORMIGUERO';
  const words = title.split(' ');
  
  return (
    <h2 className="edition-title" style={{ 
      fontWeight: 'bold', 
      display: 'flex', 
      flexWrap: 'wrap', 
      justifyContent: 'center',
      gap: '12px'
    }}>
      {words.map((word, index) => {
        // Pesos específicos para cada palabra
        const fontWeights = ['900', '300', '900']; // SOBRE(bold), EL(light), HORMIGUERO(bold)
        const fontWeight = fontWeights[index] || '400';
        
        // Direcciones específicas para mejor flujo visual
        const directions = ['left', 'up', 'right']; // Más variedad
        const direction = directions[index] || 'up';
        
        return (
          <ScrollReveal 
            key={index} 
            delay={index * 200} // Más tiempo entre palabras
            direction={direction}
            className="mx-1"
          >
            <span style={{ 
              fontWeight, 
              display: 'inline-block',
              letterSpacing: word === 'HORMIGUERO' ? '1px' : '0.5px', // Más spacing en la palabra larga
              transition: 'all 0.7s ease'
            }}>
              {word}
            </span>
          </ScrollReveal>
        );
      })}
    </h2>
  );
};

useEffect(() => {
  const handleResize = () => {
    setViewportHeight(window.innerHeight);
  };
  
  window.addEventListener('resize', handleResize);
  return () => window.removeEventListener('resize', handleResize);
}, []);

  const isDesktop = windowWidth > 840;
const figureBackgroundStyles = `
  .figure-background-container {
    position: relative;
    z-index: 1;
  }

  .large-figure-overlay {
    position: absolute;
    top: 0;
    right: -50%;
    width: 120vw;
    height: 100%;
    z-index: -1;
    opacity: 0;
    pointer-events: none;
    transition: all 1.2s ease-out;
    transform: translateX(0);
    display: flex;
    flex-direction: column;
  }

  .large-figure-overlay.visible {
    opacity: .8;
    transform: translateX(-25%);
  }

  .figure-part {
    width: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    position: relative;
    transition: all 0.6s ease-out;
    transform: translateX(100px);
    opacity: 0;
  }

  .figure-part img {
    width: auto;
    height: 100%;
    object-fit: contain;
    object-position: center;
    filter: brightness(0.8) contrast(1.1);
  }

  /* Head section - NEW */
  .figure-part.head {
    height: 20%;
    min-height: 120px;
    
  }

  /* Top part - Body without head */
  .figure-part.top {
    height: 40%; /* Reduced from 70% */
    min-height: 300px;
  }

  /* Bottom part - Lower body/Legs */
  .figure-part.bottom {
    height: 30%;
    min-height: 200px;
  }

  /* Head section specific styles */
  .figure-part.head .rotating-head-container {
    position: relative;
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
   
    align-items: flex-end; /* Changed from center to flex-end - pushes head to bottom */
    padding-bottom: 10px; /* Small gap before body */
  }

  .figure-part.head .rotating-head {
    width: auto;
    height: 80%;
    object-fit: contain;
    transition: opacity 0.2s ease-in-out;

  }

  /* Rotating head styles - Updated */
  .rotating-head-container {
    position: absolute;
    top: 0;
    left: 85%;
    transform: translateX(-50%);
    z-index: 2;
    width: 80px;
    height: 80px;
  }

  .rotating-head {
    width: 100%;
    height: 100%;
    object-fit: contain;
    transition: opacity 0.2s ease-in-out;
    position: absolute;
    top: 0;
    left: 0;
  }

  .rotating-head.fade-out {
    opacity: 0;
  }

  .rotating-head.fade-in {
    opacity: 1;
  }

  /* Individual part animations */
  .large-figure-overlay.visible .figure-part.head {
    transform: translateX(0);
    opacity: 1;
    transition-delay: 0.1s;
  }

  .large-figure-overlay.visible .figure-part.top {
    transform: translateX(0);
    opacity: 1;
    transition-delay: 0.2s;
  }

 

  /* Ensure text readability */
  .figure-background-container h2,
  .figure-background-container h3,
  .figure-background-container p {
    position: relative;
    z-index: 2;
    text-shadow: 0 1px 3px rgba(255, 255, 255, 0.8);
  }

  /* Mobile adjustments */
  @media (max-width: 768px) {
    .large-figure-overlay {
      width: 140vw;
    }
    
    .large-figure-overlay.visible {
      transform: translateX(-30%);
      opacity: 0.8;
    }

    .figure-part.head {
      height: 22%;
      min-height: 80px;
      margin-bottom: -8rem; /* Overlap slightly with body section */
      z-index: 3; /* Higher z-index to appear on top */

    }

    .figure-part.top {
      height: 50%;
      min-height: 200px;
    }

  

    .rotating-head-container {
      width: 60px;
      height: 60px;
    }

    .figure-part.head .rotating-head {
      height: 70%;
    }

    .figure-background-container {
      background: rgba(255, 255, 255, 0.97);
    }
  }

  .large-figure-overlay.from-left {
    right: auto;
    left: -50%;
  }

  .large-figure-overlay.from-left.visible {
    transform: translateX(25%);
  }
    .peeking-part {
    opacity: 0;
    transform: scale(0.8);
    transition: all 0.8s cubic-bezier(0.68, -0.55, 0.265, 1.55);
  }

  .peeking-part.visible {
    opacity: 1;
    transform: scale(1);
  }

  .peeking-part--left {
    transform-origin: right center;
  }

  .peeking-part--right {
    transform-origin: left center;
  }

  /* Optional: Add subtle animation while visible */
  .peeking-part.visible img {
    animation: subtleFloat 3s ease-in-out infinite;
  }

  @keyframes subtleFloat {
    0%, 100% { transform: translateY(0px); }
    50% { transform: translateY(-3px); }
  }

  /* Mobile adjustments */
  @media (max-width: 768px) {
    .peeking-part {
      width: 60px !important;
      height: 60px !important;
    }
  }
`;

// Add this useEffect to trigger the figure animation
useEffect(() => {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const figureOverlay = document.getElementById('figure-overlay');
          if (figureOverlay) {
            figureOverlay.classList.add('visible');
          }
        }
      });
    },
    { 
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    }
  );

  const articlePreview = document.querySelector('.article-preview');
  if (articlePreview) {
    observer.observe(articlePreview);
  }

  return () => {
    if (articlePreview) {
      observer.unobserve(articlePreview);
    }
  };
}, []);
  return (
    <>
      <Helmet>
          <title>{revista?.nombre ? `Hormiguero de Poemas - ${revista.nombre}` : 'Hormiguero de Poemas - Los Espíritus de lo Mínimo'}</title>
          <meta name="description" content={
            revista?.general && revista?.nombre 
              ? `${revista.general} Primer número: ${revista.nombre}.`
              : "Hormiguero de Poemas - Revista de literatura especializada en poesía. Primer número: Los Espíritus de lo Mínimo."
          } />
          <meta name="keywords" content="poesía, literatura, revista, hormiguero, poemas, verso, prosa, los espíritus de lo mínimo" />
          
          {/* Open Graph */}
          <meta property="og:title" content={revista?.nombre ? `Hormiguero de Poemas - ${revista.nombre}` : 'Hormiguero de Poemas - Los Espíritus de lo Mínimo'} />
          <meta property="og:description" content={
            revista?.general 
              ? `${revista.general} Descubre nuestro primer número: ${revista?.nombre || 'Los Espíritus de lo Mínimo'}.`
              : "Revista de literatura especializada en poesía. Descubre nuestro primer número: Los Espíritus de lo Mínimo."
          } />
          <meta property="og:type" content="website" />
          <meta property="og:url" content="https://hormiguerodepoemas.com/" />
          <meta property="og:image" content={revista?.portada || '/assets/anticon.svg'} />
          <meta property="og:image:alt" content={`Portada de ${revista?.nombre || 'Hormiguero de Poemas'}`} />
          
          {/* Twitter Cards */}
          <meta name="twitter:card" content="summary_large_image" />
          <meta name="twitter:title" content={revista?.nombre ? `Hormiguero de Poemas - ${revista.nombre}` : 'Hormiguero de Poemas - Los Espíritus de lo Mínimo'} />
          <meta name="twitter:description" content={
            revista?.general 
              ? `${revista.general} Primer número: ${revista?.nombre || 'Los Espíritus de lo Mínimo'}.`
              : "Revista de literatura especializada en poesía. Primer número: Los Espíritus de lo Mínimo."
          } />
          <meta name="twitter:image" content={revista?.portada || '/default-cover.jpg'} />
          <meta name="twitter:site" content="@hormiguerodepoemas" />
          
          {/* Additional meta tags */}
          <meta name="author" content="Hormiguero de Poemas" />
          <meta name="robots" content="index, follow" />
          <link rel="canonical" href="https://hormiguerodepoemas.com/" />
      </Helmet>

    <div className="edition-container scroll-reveal-container">
      {/* Include custom styles */}
      <CustomStyles />
      <style>{figureBackgroundStyles}</style>

        {/* Green gradient cover image */}
       <div 
          ref={coverImageRef}
          className="cover-image animated-bg" 
          id="main-content" 
          style={{
            backgroundImage: revista?.portada ? `url(${revista.portada})` : 'none',
            position: 'relative',
            overflow: 'hidden',
            minHeight: isDesktop ? '190vh': '800px',
            display: 'flex',
            flexDirection: 'column',
            animation: 'pulse 4s ease-in-out infinite',
          }}
        >
          <style jsx>{`
            @keyframes pulse {
              0%, 100% {
                transform: scale(1);
                opacity: 1;
              }
              50% {
                transform: scale(1.02);
                opacity: 0.95;
              }
            }
          `}</style>
        </div>

   <div style={{ 
        position: 'absolute', 
        top: '80px', 
        left: 0, 
        width: '100%', 
        height: '100%', 
        zIndex: 0, // Para estar detrás de los elementos
        pointerEvents: 'none' // Para que no interfiera con clics
      }}>
       {/* <InsectColony 
        insects={insects.filter(insect => insect.type === 'mosquito')}
        count={10}
      /> */}
      </div>
  <div className="texture-overlay"></div>
  
{/* Top Section - Magazine Identity */}
<div style={{
  position: 'absolute',
  top: '60px',
  left: '10px',
  zIndex: 10,
  textAlign: 'left'
}}>
  {/* Magazine Title */}
  <ScrollReveal direction="left" delay={2000}>
    <div style={{ position: 'relative', display: 'inline-block' }}>
      {renderHormigueroTitle()}


      
      {/* InsectColony positioned over the title */}
      
    </div>
  </ScrollReveal>
  
  {/* "DE POEMAS" - Directly below HORMIGUERO */}
  

  {/* Subtitle - Below DE POEMAS */}
  <div style={{
    marginTop: '20px'
  }}>
    <ScrollReveal direction="left" delay={400}>
      <div style={{
      fontSize: isDesktop ? '1.0rem': '0.6rem',
        fontWeight: '300',
        color: 'white',
        lineHeight: '1.3',
        letterSpacing: '1px',
        opacity: '0.8',
        margin: isDesktop ? '0 auto' : 'none',
        textShadow: '2px 2px 2px rgba(0, 0, 0, 1)' // More subtle

      }}>
        REVISTA DE LITERATURA<br/>
        ESPECIALIZADA EN POESÍA
      </div>
    </ScrollReveal>
  </div>
</div>

{/* Center Section - Main Theme */}
<div style={{
  position: 'absolute',
  top: '60%',
  left: '10px', // Back to left alignment
  transform: 'translateY(-50%)', // Only center vertically
  color: 'white',
  zIndex: 10,
  maxWidth: window.innerWidth <= 768 ? '90%' : '60%',
  textAlign: 'left',

}}>
  
  <ScrollReveal direction="up" delay={2000}>
    {renderEspiritusTitle()}

  </ScrollReveal>
  <div style={{
  bottom:isDesktop ?'4rem' : '6rem',
  left: isDesktop ?'10%' : '25%',
  zIndex: 10
}}>
  <ScrollReveal direction="left" delay={200}>
      <Link
        ref={editionLinkRef}
        to="/contenidos"
        className="edition-link hover-underline-animation"
        style={{
          color: 'white',
          fontSize: 'clamp(0.7rem, 1.5vw, 1rem)',
          fontWeight: '300',
          letterSpacing: '1px',
          textDecoration: 'none',
          paddingBottom: '2px',
          textShadow: '2px 2px 2px rgba(0, 0, 0, 1)' // More subtle

        }}
      >
        HAZ CLIC PARA VER MÁS
      </Link>
    </ScrollReveal>
</div>
  
  <ScrollReveal direction="up" delay={1000}>
    <div style={{
      fontSize: 'clamp(0.8rem, 2vw, 1.4rem)',
      fontWeight: '300',
      letterSpacing: '1px',
      width:'95%',
      marginTop:'2rem',
      textShadow: '2px 2px 2px rgba(0, 0, 0, 1)', // More subtle

    }}>
      24.08.25 SEGUNDO NÚMERO
    </div>
  </ScrollReveal>
  {/* Authors */}
  <div style={{ 
    maxWidth: window.innerWidth <= 768 ? '100%' : '65%',
    order: window.innerWidth <= 768 ? 2 : 1
  }}>
    <ScrollReveal direction="up" delay={1200}>
      <div style={{
        fontSize: 'clamp(0.6rem, 1.2vw, 0.9rem)',
        lineHeight: '1.4',
        fontWeight: '500',
        letterSpacing: '0.5px', 
        width:'95%',
        textShadow: '2px 2px 2px rgba(0, 0, 0, 1)', // More subtle

      }}>
      {autores.length > 0 ? autores.join(' · ') : 'Cargando autores...'}
      </div>
    </ScrollReveal>
  </div>
</div>

{/* Bottom Section - Stack on mobile */}
<div style={{
  position: 'absolute',
  top:'70%',
  bottom: '60px',
  left: '10px', // Back to left alignment
  right: '60px',
  display: 'flex',
  flexDirection: window.innerWidth <= 768 ? 'column' : 'row',
  justifyContent: 'space-between',
  alignItems: window.innerWidth <= 768 ? 'flex-start' : 'flex-end',
  gap: window.innerWidth <= 768 ? '20px' : '0',
  color: 'white',
  zIndex: 10
}}>
  
</div>

{/* Center Bottom - CTA */}

</div>
      <div className="figure-background-container" style={{ 
        position: 'relative', 
        minHeight: '100vh',
        overflow: 'hidden',
     
      }}>
        <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: -1
      }}>  <RotatingMani
          supabase={supabase}
          changeInterval={4000}
          opacity={0.18}
          zIndex={-1}
        />
          <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: 'rgba(255, 255, 255, 0.1)',
          zIndex: 1
        }} />
      </div>
        {/* Three-Part Figure Background */}
       
      {/* Article preview section */}
      <ScrollReveal direction="up">
        <div className="article-preview">
          {renderTitle()}
          
          <ScrollReveal delay={300} direction="up">
            <div className="article-content" >
              <p style={{whiteSpace:"pre-line", fontSize:isDesktop? 'auto':'11px'}}>
                {revista?.general || 'Lorem ipsum...'}
              </p>
              
              <ScrollReveal delay={500} direction="left">
                <a href="/contenidos#sintesis" className="read-more">
                Leer segundo número...
                </a>
              </ScrollReveal>
            </div>
          </ScrollReveal>
        </div>
      </ScrollReveal>

      {/* Additional articles section */}
      
      <br />
      <ScrollReveal direction="right">
        <div id="hormigueados">
          <HormigueadosSection />
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
    
    </>
  );
  
};

export default Res;