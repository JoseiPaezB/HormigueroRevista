import React, { useState, useEffect, useRef } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { createClient } from '@supabase/supabase-js';

import HormigueadosSection from './hormigueados';
import Footer from './footer';
import ScrollReveal from './ScrollReveal';
import { setupHashNavigation } from './scrollUtils';
import '../ui/ScrollReveal.css';
import {insects} from '../../data/insects'
import InsectColony from './MovingSvgBackground';
import { Helmet } from 'react-helmet';
import RotatingMani from './rotatingMani';

// Initialize Supabase client
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const CustomStyles = () => (
  <style>{`
    .article-content p {
      text-align: justify;
      text-justify: inter-word;
      hyphens: auto;
    }
    
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
    
    .click-hint {
      font-size: 12px;
      opacity: 0;
      transition: opacity 0.5s ease;
      margin-top: 5px;
      text-align: center;
    }
    
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
    
    @media (max-width: 768px) {
      .click-hint {
        font-size: 10px;
        padding: 2px 5px;
        border-radius: 3px;
      }
      
      .animate-link::after {
        height: 3px;
      }
      
      .animate-link .portada {
        text-shadow: 0 0 8px rgba(255,255,255,0.4), 2px 2px 4px rgba(0,0,0,0.8);
      }
    }
  `}</style>
);

const Edicion = () => {
  const [searchParams] = useSearchParams();
  const edicionId = searchParams.get('edicion'); // Get edition ID from URL
  
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
  const editionLinkRef = useRef(null);
  const isEditionLinkVisible = useRef(false);

  useEffect(() => {
    if (!editionLinkRef.current) return;
    
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !isEditionLinkVisible.current) {
          isEditionLinkVisible.current = true;
          
          setTimeout(() => {
            if (editionLinkRef.current) {
              editionLinkRef.current.classList.add('animate-link');
            }
          }, 1000);
        }
      });
    }, {
      threshold: 0.7,
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
  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
      setViewportHeight(window.innerHeight);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Setup hash navigation
  useEffect(() => {
    const cleanup = setupHashNavigation(setActiveHash);
    return cleanup;
  }, []);

  // Fetch revista data - DYNAMIC based on URL param or latest edition
  useEffect(() => {
    const fetchData = async () => {
      try {
        let revistaData;
        
        if (edicionId) {
          // If edition ID is provided in URL, fetch that specific edition
          const { data, error: revistaError } = await supabase
            .from('revista')
            .select('*')
            .eq('id', edicionId)
            .single();

          if (revistaError) throw revistaError;
          revistaData = data;
        } else {
          // Otherwise, fetch the latest edition (highest numero)
          const { data, error: revistaError } = await supabase
            .from('revista')
            .select('*')
            .order('numero', { ascending: false })
            .limit(1)
            .single();

          if (revistaError) throw revistaError;
          revistaData = data;
        }
        
        setRevista(revistaData);
        
        // Parse contributors
        if (revistaData.contribuyentes) {
          const contributorsList = revistaData.contribuyentes.split(',').map(name => name.trim());
          setContributors(contributorsList);
        }

        // Fetch authors for THIS edition using the dynamic ID
        const { data: authorsData, error: authorsError } = await supabase
          .from('revista_autor')
          .select(`
            autor(nombre)
          `)
          .eq('id_revista', revistaData.id); // Use the fetched revista's ID

        if (authorsError) throw authorsError;
        
        if (authorsData && authorsData.length > 0) {
          const authorNames = authorsData
            .map(item => item.autor.nombre)
            .sort();
          setAllAuthors(authorNames);
          setAutores(authorNames);
          
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
  }, [edicionId]); // Re-fetch when edicionId changes

  // Generate safe position for the author name
  const generateSafePosition = () => {
    const isMobile = windowWidth < 768;
    
    const mobileMargins = {
      top: 25,
      bottom: 35,
      left: 25,
      right: 25
    };
    
    const desktopMargins = {
      top: 15,
      bottom: 30,
      left: 20,
      right: 20
    };
    
    const margins = isMobile ? mobileMargins : desktopMargins;
    
    if (isMobile) {
      const topMin = margins.top;
      const topMax = 100 - margins.bottom;
      const leftMin = margins.left;
      const leftMax = 100 - margins.right;
      
      const topPosition = Math.floor(Math.random() * (topMax - topMin)) + topMin;
      const leftPosition = Math.floor(Math.random() * (leftMax - leftMin)) + leftMin;
      
      return {
        top: `${topPosition}%`,
        left: `${leftPosition}%`
      };
    } else {
      const safeZones = [
        {
          topMin: margins.top,
          topMax: 50,
          leftMin: margins.left,
          leftMax: 100 - margins.right
        },
        {
          topMin: margins.top, 
          topMax: 45,
          leftMin: margins.left,
          leftMax: 70 
        }
      ];
      
      const safeZone = safeZones[Math.floor(Math.random() * safeZones.length)];
      
      const topPosition = Math.floor(Math.random() * (safeZone.topMax - safeZone.topMin)) + safeZone.topMin;
      const leftPosition = Math.floor(Math.random() * (safeZone.leftMax - safeZone.leftMin)) + safeZone.leftMin;
      
      return {
        top: `${topPosition}%`,
        left: `${leftPosition}%`
      };
    }
  };

  // Effect for rotating through author names
  useEffect(() => {
    if (!allAuthors.length) return;
    
    const interval = setInterval(() => {
      setVisibleAuthorIndex(prevIndex => (prevIndex + 1) % allAuthors.length);
      setAuthorPosition(generateSafePosition());
    }, 3000);
    
    return () => clearInterval(interval);
  }, [allAuthors, windowWidth]);

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: '2-digit'
    });
  };

  const getCurrentAuthor = () => {
    if (allAuthors.length === 0) {
      return contributors.length > 0 ? contributors[0] : "AUTORES DESTACADOS";
    }
    return allAuthors[visibleAuthorIndex];
  };

  const getAuthorFontSize = () => {
    const author = getCurrentAuthor() || '';
    const isMobile = windowWidth < 768;
    
    const mobileBaseSize = 9;
    const desktopBaseSize = 15;
    
    const baseSize = isMobile ? mobileBaseSize : desktopBaseSize;
    
    if (author.length > 20) return `${isMobile ? 8 : 14}px`;
    if (author.length > 15) return `${isMobile ? 9 : 16}px`;
    return `${baseSize}px`;
  };

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

  const renderHormigueroTitle = () => {
    const words = ['HORMIGUERO', 'DE POEMAS'];
    const isDesktop = windowWidth > 840;
    
    return (
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column',
        alignItems: 'flex-start'
      }}>
        {words.map((word, index) => {
          const fontWeights = ['900', '300'];
          const fontWeight = fontWeights[index] || '400';
          const directions = ['left', 'up'];
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
                textShadow: '2px 2px 2px rgba(0, 0, 0, 0.5)'
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
    const titleText = revista?.nombre?.toUpperCase() || '';
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
        textShadow: '2px 2px 2px rgba(0, 0, 0, 0.5)'
      }}>
        {words.map((word, index) => {
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
          const fontWeights = ['900', '300', '900'];
          const fontWeight = fontWeights[index] || '400';
          const directions = ['left', 'up', 'right'];
          const direction = directions[index] || 'up';
          
          return (
            <ScrollReveal 
              key={index} 
              delay={index * 200}
              direction={direction}
              className="mx-1"
            >
              <span style={{ 
                fontWeight, 
                display: 'inline-block',
                letterSpacing: word === 'HORMIGUERO' ? '1px' : '0.5px',
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

  const isDesktop = windowWidth > 840;

  // Build the edition link with query parameter
  const editionLink = revista ? `/contenidos?edicion=${revista.id}` : '/contenidos';

  if (loading) {
    return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Cargando...</div>;
  }

  if (error) {
    return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Error: {error}</div>;
  }

  return (
    <>
      <Helmet>
        <title>{revista?.nombre ? `Hormiguero de Poemas - ${revista.nombre}` : 'Hormiguero de Poemas'}</title>
        <meta name="description" content={
          revista?.general && revista?.nombre 
            ? `${revista.general} Edición ${revista.numero}: ${revista.nombre}.`
            : "Hormiguero de Poemas - Revista de literatura especializada en poesía."
        } />
        <meta name="keywords" content="poesía, literatura, revista, hormiguero, poemas, verso, prosa" />
        
        <meta property="og:title" content={revista?.nombre ? `Hormiguero de Poemas - ${revista.nombre}` : 'Hormiguero de Poemas'} />
        <meta property="og:description" content={
          revista?.general 
            ? `${revista.general} Descubre la edición ${revista?.numero}: ${revista?.nombre}.`
            : "Revista de literatura especializada en poesía."
        } />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://hormiguerodepoemas.com/" />
        <meta property="og:image" content={revista?.portada || '/assets/anticon.svg'} />
        <meta property="og:image:alt" content={`Portada de ${revista?.nombre || 'Hormiguero de Poemas'}`} />
        
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={revista?.nombre ? `Hormiguero de Poemas - ${revista.nombre}` : 'Hormiguero de Poemas'} />
        <meta name="twitter:description" content={
          revista?.general 
            ? `${revista.general} Edición ${revista?.numero}: ${revista?.nombre}.`
            : "Revista de literatura especializada en poesía."
        } />
        <meta name="twitter:image" content={revista?.portada || '/default-cover.jpg'} />
        <meta name="twitter:site" content="@hormiguerodepoemas" />
        
        <meta name="author" content="Hormiguero de Poemas" />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href="https://hormiguerodepoemas.com/" />
      </Helmet>

      <div className="edition-container scroll-reveal-container">
        <CustomStyles />

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
            flexDirection: 'column',
          }}
        >
          <div className="texture-overlay"></div>
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
            <ScrollReveal direction="left" delay={2000}>
              <div style={{ position: 'relative', display: 'inline-block' }}>
                {renderHormigueroTitle()}
              </div>
            </ScrollReveal>
            
            <div style={{ marginTop: '20px' }}>
              <ScrollReveal direction="left" delay={400}>
                <div style={{
                  fontSize: isDesktop ? '1.0rem': '0.6rem',
                  fontWeight: '300',
                  color: 'white',
                  lineHeight: '1.3',
                  letterSpacing: '1px',
                  opacity: '0.8',
                  margin: isDesktop ? '0 auto' : 'none',
                  textShadow: '2px 2px 2px rgba(0, 0, 0, 1)'
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
            left: '10px',
            transform: 'translateY(-50%)',
            color: 'white',
            zIndex: 10,
            maxWidth: windowWidth <= 768 ? '90%' : '60%',
            textAlign: 'left',
          }}>
            <ScrollReveal direction="up" delay={2000}>
              {renderEspiritusTitle()}
            </ScrollReveal>
            
            <div style={{
              bottom: isDesktop ?'4rem' : '6rem',
              left: isDesktop ?'10%' : '25%',
              zIndex: 10
            }}>
              <ScrollReveal direction="left" delay={200}>
                <Link
                  ref={editionLinkRef}
                  to={editionLink}
                  className="edition-link hover-underline-animation"
                  style={{
                    color: 'white',
                    fontSize: 'clamp(0.7rem, 1.5vw, 1rem)',
                    fontWeight: '300',
                    letterSpacing: '1px',
                    textDecoration: 'none',
                    paddingBottom: '2px',
                    textShadow: '2px 2px 2px rgba(0, 0, 0, 1)'
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
                textShadow: '2px 2px 2px rgba(0, 0, 0, 1)',
              }}>
                {revista?.fecha_publicacion ? formatDate(revista.fecha_publicacion) : ''} EDICIÓN {revista?.numero || ''}
              </div>
            </ScrollReveal>
            
            <div style={{ 
              maxWidth: windowWidth <= 768 ? '100%' : '65%',
              order: windowWidth <= 768 ? 2 : 1
            }}>
              <ScrollReveal direction="up" delay={1200}>
                <div style={{
                  fontSize: 'clamp(0.6rem, 1.2vw, 0.9rem)',
                  lineHeight: '1.4',
                  fontWeight: '500',
                  letterSpacing: '0.5px', 
                  width:'95%',
                  textShadow: '2px 2px 2px rgba(0, 0, 0, 1)',
                }}>
                  {autores.length > 0 ? autores.join(' · ') : 'Cargando autores...'}
                </div>
              </ScrollReveal>
            </div>
          </div>
        </div>

        <div className="figure-background-container" style={{ 
          position: 'relative', 
          minHeight: '100vh',
          overflow: 'hidden',
        }}> 
          {revista?.numero === 2 && (
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            zIndex: -1
          }}>
            <RotatingMani
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
        )}

          <ScrollReveal direction="up">
            <div className="article-preview">
              {renderTitle()}
              
              <ScrollReveal delay={300} direction="up">
                <div className="article-content">
                  <p style={{whiteSpace:"pre-line", fontSize:isDesktop? 'auto':'11px'}}>
                    {revista?.general || 'Lorem ipsum...'}
                  </p>
                  
                  <ScrollReveal delay={500} direction="left">
                    <a href={`/contenidos?edicion=${revista?.id}#sintesis`} className="read-more">
                      Leer edición {revista?.numero}...
                    </a>
                  </ScrollReveal>
                </div>
              </ScrollReveal>
            </div>
          </ScrollReveal>

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
      </div>
    </>
  );
};

export default Edicion;