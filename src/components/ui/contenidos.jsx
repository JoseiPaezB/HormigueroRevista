import React, { useState, useEffect } from 'react';
import HormigueadosSection from './hormigueados';
import {Link, useSearchParams} from 'react-router-dom';
import hormigueroLogo from '/assets/anticon.svg';
import RainDrops from './rainDrop';
import { createClient } from '@supabase/supabase-js';

import ScrollReveal from './ScrollReveal';
import './ScrollReveal.css';
import { setupHashNavigation } from './scrollUtils';
import { Helmet } from 'react-helmet';

import RotatingBackground from './rotatingBg';
import mosquito from '/assets/mosquito.svg';
import bee from '/assets/bee.svg'; 
import fly from '/assets/roach.svg';
import ant from '/assets/libelula.svg';
import InsectColony from './MovingSvgBackground';



const insects = [
    {
      src: mosquito,
      type: 'mosquito',
      size: 30,
      // Optional: customize further
      // speed: 2.5,
      // initialPosition: { x: 100, y: 100 }
    },
    {
      src: ant,
      type: 'ant',
      size: 25
    },
    {
      src: bee,
      type: 'bee',
      size: 35
    },
    {
      src: fly,
      type: 'fly',
      size: 28
    },
    {
      src: mosquito, // You can reuse the same SVG with different behavior
      type: 'default',
      size: 32
    }
  ];

// Initialize Supabase client
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

// Custom styles for text formatting
const CustomStyles = () => (
  <style>{`
    /* Tus estilos aquí... */
  `}</style>
);

const Contenido = () => {
  const [searchParams] = useSearchParams();
  const edicionId = searchParams.get('edicion'); // Get edition ID from URL
  
  // State for revista data
  const [revista, setRevista] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [contributors, setContributors] = useState([]);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [activeHash, setActiveHash] = useState('');

  // Track window resize
  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
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
    const fetchRevista = async () => {
      try {
        let revistaData;
        
        if (edicionId) {
          // If edition ID is provided in URL, fetch that specific edition
          const { data, error } = await supabase
            .from('revista')
            .select('*')
            .eq('id', edicionId)
            .single();

          if (error) throw error;
          revistaData = data;
        } else {
          // Otherwise, fetch the latest edition (highest numero)
          const { data, error } = await supabase
            .from('revista')
            .select('*')
            .order('numero', { ascending: false })
            .limit(1)
            .single();

          if (error) throw error;
          revistaData = data;
        }
        
        setRevista(revistaData);
        
        // Parse contributors string into array
        if (revistaData.contribuyentes) {
          const contributorsList = revistaData.contribuyentes.split(',').map(name => name.trim());
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
  }, [edicionId]); // Re-fetch when edicionId changes

  // Format date for display (YYYY-MM-DD to DD/MM/YY)
  const formatDate = (dateString) => {
    if (!dateString) return '01/08/25';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: '2-digit'
    });
  };

  // Array of menu items for the grid - NOW DYNAMIC with edicionId
  // Conditionally include "A Ojo de Hormiga" only for edition 1
  const menuItems = [
    { 
      path: `/creaciones?edicion=${revista?.id || edicionId || ''}`, 
      title: "EL HORMIGUERO", 
      subtitle: "Poemas en verso y prosa",
      delay: 0 
    },
    { 
      path: `/critica?edicion=${revista?.id || edicionId || ''}`, 
      title: "OTROS BICHOS", 
      subtitle: "Ensayos, entrevistas y traducciones",
      delay: 0.3 
    },
    // Only show "A Ojo de Hormiga" for edition 1 (id = 1)
    ...(revista?.id === 1 || revista?.numero === 1 ? [{
      path: `/visuales?edicion=${revista?.id || edicionId || ''}`,
      title: "A OJO DE HORMIGA",
      subtitle: "Artista visual",
      delay: 0.6
    }] : [])
  ];

  // Determine grid layout based on screen width
  const isDesktop = windowWidth > 840;
  const isMobile = windowWidth <= 840;
  const gridColumns = isDesktop ? 3 : 1;
  
  // Render title with animation
  const renderTitle = () => {
    const title = revista?.nombre?.toUpperCase() || 'CARGANDO...';
    const words = title.split(' ');
    
    const getAnimationOrder = (totalWords) => {
      const order = [];
      let middle = Math.floor(totalWords / 2);
      
      order.push(middle);
      
      for (let i = 1; i <= Math.max(middle, totalWords - middle - 1); i++) {
        if (middle - i >= 0) order.push(middle - i);
        if (middle + i < totalWords) order.push(middle + i);
      }
      
      return order;
    };
    
    const animationOrder = getAnimationOrder(words.length);
    const getAnimationIndex = (wordIndex) => animationOrder.indexOf(wordIndex);
    
    return (
      <h2 className="edition-title" style={{ 
        fontWeight: 'bold', 
        display: 'flex', 
        flexWrap: 'wrap', 
        justifyContent: 'center' 
      }}>
        {words.map((word, index) => {
          const isSecondWord = index === 1;
          const isLastWord = index === words.length - 1;
          const fontWeight = (isSecondWord || isLastWord) ? '1000' : '300';
          
          const animIndex = getAnimationIndex(index);
          const delay = animIndex * 150;
          
          let direction;
          if (index < words.length / 3) direction = 'up';
          else if (index < 2 * words.length / 3) direction = index % 2 === 0 ? 'left' : 'right';
          else direction = 'down';
          
          return (
            <ScrollReveal 
              key={index} 
              delay={delay} 
              direction={direction}
              className="mx-1"
            >
              <span style={{ 
                fontWeight, 
                display: 'inline-block', 
                margin: '0 5px',
                opacity: 0.9,
                transition: 'opacity 0.3s ease-out'
              }}>
                {word}
              </span>
            </ScrollReveal>
          );
        })}
      </h2>
    );
  };

  if (loading) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        marginTop: '80px'
      }}>
        Cargando contenido...
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        marginTop: '80px'
      }}>
        Error: {error}
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>{revista?.nombre ? `${revista.nombre} - Contenidos | Hormiguero de Poemas` : 'Contenidos | Hormiguero de Poemas'}</title>
        <meta name="description" content={
          revista?.nombre && revista?.sintesis 
            ? `${revista.nombre}. ${revista.sintesis} Secciones: El Hormiguero, Otros Bichos, A Ojo de Hormiga.`
            : "Hormiguero de Poemas. Secciones: El Hormiguero, Otros Bichos, A Ojo de Hormiga."
        } />
        <meta name="keywords" content="poesía, literatura, revista, hormiguero, poemas, verso, prosa, el hormiguero, otros bichos, a ojo de hormiga" />
        
        {/* Open Graph */}
        <meta property="og:title" content={`${revista?.nombre || 'Hormiguero de Poemas'} - Contenidos`} />
        <meta property="og:description" content={
          revista?.sintesis 
            ? `${revista.sintesis} Descubre nuestras secciones: El Hormiguero, Otros Bichos y A Ojo de Hormiga.`
            : "Edición de Hormiguero de Poemas. Secciones: El Hormiguero, Otros Bichos y A Ojo de Hormiga."
        } />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://hormiguerodepoemas.com/contenidos" />
        <meta property="og:image" content={revista?.portada || '/default-cover.jpg'} />
        <meta property="og:image:alt" content={`Portada de ${revista?.nombre || 'Hormiguero de Poemas'}`} />
        
        {/* Twitter Cards */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={`${revista?.nombre || 'Hormiguero de Poemas'} - Contenidos`} />
        <meta name="twitter:description" content={
          revista?.sintesis 
            ? `${revista.sintesis} Secciones: El Hormiguero, Otros Bichos, A Ojo de Hormiga.`
            : "Contenidos de Hormiguero de Poemas: El Hormiguero, Otros Bichos, A Ojo de Hormiga."
        } />
        <meta name="twitter:image" content={revista?.portada || '/default-cover.jpg'} />
        <meta name="twitter:site" content="@hormiguerodepoemas" />
      </Helmet>
      
      <div className="edition-container scroll-reveal-container">
        {/* Include custom styles */}
        <CustomStyles />
        
        {/* Cover image with title */}
        <div className="cover-image image_2" style={{
          backgroundImage: revista?.portada ? `url(${revista.portada})` : 'none',
          position: 'relative',
          marginTop: isDesktop ? '60px':'none'
        }}>
        </div>
        
        {/* Article preview section */}
        <ScrollReveal direction="up">
          <div className="res">
            {/* Use animated title */}
            {renderTitle()}
            
            <ScrollReveal delay={300} direction="up">
              <div className="article-content">
                <p id="sintesis" style={{whiteSpace:'pre-line'}}>
                  {revista?.sintesis || 'Cargando contenido...'}
                </p>
              </div>
            </ScrollReveal>

            {/* Menu Grid with Background Image */}
            <ScrollReveal direction="scale" delay={400}>
              <div 
                className="menu-background-section"
                style={{
                  position: 'relative',
                  padding: isMobile ? '0' : '375px 10px',
                  margin: isMobile ? '30px 0' :'0px 0',
                  overflow: 'hidden',
                  marginRight: isMobile ? '0' : '0'
                }}
              >
                {/* Background Image */}
               {revista?.numero === 2 ? (
                <div>
                  <RotatingBackground 
                    changeInterval={850}
                    opacity={0.525}
                    zIndex={-1}
                    supabase={supabase}
                  />
                </div>
              ) : revista?.numero === 1 ? (
                <div 
                  style={{ 
                    position: 'absolute', 
                    top: 0, 
                    left: 0, 
                    width: '100%', 
                    height: '100%', 
                    zIndex: 0 // Para estar detrás de los elementos del menú
                  }}
                >
                  <InsectColony 
                    insects={insects}
                    count={25}
                  />
                </div>
              ) : null}



                <div className="vertical-menu" style={{
                  display: 'grid',
                  gap: '30px',
                  padding: '8px',
                  width: '100%',
                  fontSize: '1.3rem',
                  position: 'relative',
                  zIndex: 1
                }}>
                  {/* Define the keyframes animation for pulsing effect */}
                  <style>
                    {`
                      @keyframes pulse {
                        0% { transform: scale(1); }
                        50% { transform: scale(1.1); }
                        100% { transform: scale(1); }
                      }
                      
                      @keyframes textPulse {
                        0% { opacity: 0.75; }
                        50% { opacity: 1; }
                        100% { opacity: 0.75; }
                      }
                      
                      .pulsing-ant {
                        animation: pulse 2s infinite ease-in-out;
                      }
                      
                      .pulsing-text {
                        animation: textPulse 2s infinite ease-in-out;
                      }
                      
                      .menu-item:hover .pulsing-ant {
                        animation: pulse 1s infinite ease-in-out;
                      }
                      
                      .menu-item:hover .pulsing-text {
                        animation: textPulse 0.5s infinite ease-in-out;
                      }

                      .menu-item:hover .index-number {
                        opacity: 1;
                        transform: translate(-50%, -50%) scale(1.2);
                      }

                      .menu-item {
                        transition: all 0.3s ease;
                      }

                      .menu-item:hover {
                        transform: translateY(-5px);
                      }
                    `}
                  </style>
                  
                  {/* Map through menu items with sequential animations */}
                  {menuItems.map((item, index) => {
                    let antIcon = hormigueroLogo;
                    
                    const directions = ['left', 'right', 'up'];
                    const direction = directions[index % directions.length];
                    
                    return (
                      <ScrollReveal key={index} delay={index * 200} direction={direction}>
                        <Link 
                          to={item.path} 
                          className="menu-item" 
                          style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            textDecoration: 'none',
                            color: 'black',
                            justifyContent: 'center',
                            textAlign: 'center',
                            padding: '20px',
                            position: 'relative',
                            zIndex: 2,
                          }}
                        >
                          <div 
                            className="menu-text pulsing-text" 
                            style={{
                              fontSize: windowWidth > 728 ? '1.7rem' : '18px',
                              letterSpacing: '1px',
                              animationDelay: `${item.delay}s`,
                              position: 'relative',
                              zIndex: 1,
                              fontWeight: '800',
                              padding: '5px'
                            }}
                          >
                            {item.title}
                          </div>
                          
                          {/* Subtitle */}
                          <div 
                            className="menu-subtitle"
                            style={{
                              fontSize: windowWidth > 728 ? '0.9rem' : '0.5rem',
                              letterSpacing: '0.5px',
                              fontWeight: '300',
                              color: 'rgba(0, 0, 0, 0.7)',
                              fontStyle: 'italic'
                            }}
                          >
                            {item.subtitle}
                          </div>
                        </Link>
                      </ScrollReveal>
                    );
                  })}
                </div>
              </div>
            </ScrollReveal>
          </div>
        </ScrollReveal>
      </div>
    </>
  );
};

export default Contenido;