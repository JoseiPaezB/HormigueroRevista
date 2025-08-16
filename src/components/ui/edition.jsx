import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { createClient } from '@supabase/supabase-js';
import portada from '/assets/images/edicion1.png'; // Fallback image
import HormigueadosSection from './hormigueados';
import EventosSection from './eventos';
import Footer from './footer';
// Importa los nuevos componentes
import ScrollReveal from './ScrollReveal'; // Ajusta la ruta según tu estructura
import { setupHashNavigation } from './scrollUtils'; // Ajusta la ruta según tu estructura
import '../ui/ScrollReveal.css';
import {insects} from '../../data/insects'
import InsectColony from './MovingSvgBackground'; // Adjust the path as needed
import { Helmet } from 'react-helmet';


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
          const authorNames = authorsData
    .map(author => author.nombre)
    .sort(); // Additional alphabetical sort in JavaScript
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
    textShadow: '2px 2px 4px rgba(0,0,0,0.8)',
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
              color: 'white'
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
      lineHeight: '1.1'
    }}>
      {words.map((word, index) => {
        const fontWeights = ['300', '900', '300', '300', '900']; // LOS(light), ESPÍRITUS(bold), DE(light), LO(light), MÍNIMO(bold)
        const fontWeight = fontWeights[index] || '400';
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
      <div>
        <h1>Test</h1>
        <img src="/assets/images/LOS ESPÍRITUS DE LO MÍNIMO (5).png" alt="test" style={{width: '200px'}} />
        <p>If you see this image, the path works</p>
      </div>      
<CustomStyles />
      
        {/* Green gradient cover image */}
       <div 
  ref={coverImageRef}
  className="cover-image" 
  id="main-content" 
  style={{
    backgroundImage: revista?.portada ? `url(${revista.portada})` : 'none',
    position: 'relative',
    overflow: 'hidden',
    minHeight: isDesktop ? '190vh': '800px',
    display: 'flex',
    flexDirection: 'column'

  }}
>
   <div style={{ 
        position: 'absolute', 
        top: '80px', 
        left: 0, 
        width: '100%', 
        height: '100%', 
        zIndex: 0, // Para estar detrás de los elementos
        pointerEvents: 'none' // Para que no interfiera con clics
      }}>
       <InsectColony 
        insects={insects.filter(insect => insect.type === 'mosquito')}
        count={10}
      />
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
        margin: isDesktop ? '0 auto' : 'none'
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
      marginTop:'2rem'
    }}>
      30.05.25 PRIMER NÚMERO
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
        fontWeight: '300',
        letterSpacing: '0.5px', 
        width:'95%'
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
      
      {/* Article preview section */}
      <ScrollReveal direction="up">
        <div className="article-preview">
          {renderTitle()}
          
          <ScrollReveal delay={300} direction="up">
            <div className="article-content">
              <p style={{whiteSpace:"pre-line", fontSize:isDesktop? 'auto':'11px'}}>
                {revista?.general || 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse viverra egestas euismod gravida, ut fringilla neque interdum. Vivamus non interdum nisi. Aenean quis egestas justo, vitae tristique ut fermentum risus fermentum. Cras pharetra nec leo sed vel. Sed et sodales tellus, sed feugiat. Proin venenatis dolor non lectus.Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse viverra egestas enim eu gravida, ut fringilla neque interdum. Vivamus non interdum nisi. Aenean quis.Fusce posuere fermentum. Cras pharetra nec leo sed vel. Sed et sodales tellus, sed feugiat.'}
              </p>
              
              <ScrollReveal delay={500} direction="left">
                <a href="/contenidos#sintesis" className="read-more">
                Leer primer número...
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

export default Edicion;