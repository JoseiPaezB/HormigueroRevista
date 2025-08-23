import React, { useState, useEffect } from 'react';
import HormigueadosSection from './hormigueados';
import {Link} from 'react-router-dom';
import hormigueroLogo from '/assets/anticon.svg';
import RainDrops from './rainDrop';
import { createClient } from '@supabase/supabase-js';

// Importar ScrollReveal
import ScrollReveal from './ScrollReveal'; // Ajusta la ruta según donde hayas guardado el componente
import './ScrollReveal.css'; // Ajusta la ruta según donde hayas guardado los estilos
import { setupHashNavigation } from './scrollUtils'; // Ajusta la ruta según donde hayas guardado las utilidades
import { Helmet } from 'react-helmet';

import RotatingBackground from './rotatingBg';



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

  // Configurar navegación por hash
  useEffect(() => {
    const cleanup = setupHashNavigation(setActiveHash);
    return cleanup;
  }, []);

  // Fetch revista data on component mount
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

  // Array of menu items for the grid
const menuItems = [
  { 
    path: "/creaciones", 
    title: "EL HORMIGUERO", 
    subtitle: "Poemas en verso y prosa",
    delay: 0 
  },
  { 
    path: "/critica", 
    title: "OTROS BICHOS", 
    subtitle: "Ensayos, entrevistas y traducciones",
    delay: 0.3 
  },
  { 
    path: "/visuales", 
    title: "A OJO DE HORMIGA", 
    subtitle: "Visuales",
    delay: 1.2 
  },
  //{ path: "/entrevista", title: "ENTREVISTAS", subtitle: "Conversaciones", delay: 1.5 }
];

  // Determine grid layout based on screen width
  const isDesktop = windowWidth > 840;
  const isMobile = windowWidth <= 840;
  const gridColumns = isDesktop ? 3 : 1; // 3 columns for desktop, 1 for mobile
  
  // Renderizar título con animación
  const renderTitle = () => {
    const title = revista?.nombre?.toUpperCase() || 'LOS INSECTOS TAMBIEN SON PARTE DE LO MINIMO';
    const words = title.split(' ');
    
    // Orden alternativo para las animaciones, creando un patrón más interesante
    // Primero aparecen las palabras del centro, luego se expanden hacia afuera
    const getAnimationOrder = (totalWords) => {
      const order = [];
      let middle = Math.floor(totalWords / 2);
      
      // Comienza desde el medio
      order.push(middle);
      
      // Alterna entre añadir palabras a la izquierda y derecha del centro
      for (let i = 1; i <= Math.max(middle, totalWords - middle - 1); i++) {
        if (middle - i >= 0) order.push(middle - i); // Palabra a la izquierda
        if (middle + i < totalWords) order.push(middle + i); // Palabra a la derecha
      }
      
      return order;
    };
    
    // Obtener el orden de animación
    const animationOrder = getAnimationOrder(words.length);
    
    // Obtener el índice de animación (posición en la secuencia) para cada palabra
    const getAnimationIndex = (wordIndex) => animationOrder.indexOf(wordIndex);
    
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
          
          // Calcular el retraso basado en el orden de animación
          const animIndex = getAnimationIndex(index);
          const delay = animIndex * 150; // 150ms entre cada palabra
          
          // Direcciones variadas basadas en la posición
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




  return (
    <>
   <Helmet>
      <title>{revista?.nombre ? `${revista.nombre} - Contenidos | Hormiguero de Poemas` : 'Los Espíritus de lo Mínimo - Contenidos'}</title>
      <meta name="description" content={
        revista?.nombre && revista?.sintesis 
          ? `${revista.nombre}. ${revista.sintesis} Secciones: El Hormiguero, Otros Bichos, A Ojo de Hormiga.`
          : "Los Espíritus de lo Mínimo. Secciones: El Hormiguero, Otros Bichos, A Ojo de Hormiga. Hormiguero de Poemas."
      } />
      <meta name="keywords" content="poesía, literatura, revista, hormiguero, poemas, verso, prosa, el hormiguero, otros bichos, a ojo de hormiga" />
      
      {/* Open Graph */}
      <meta property="og:title" content={`${revista?.nombre || 'Los Espíritus de lo Mínimo'} - Contenidos`} />
      <meta property="og:description" content={
        revista?.sintesis 
          ? `${revista.sintesis} Descubre nuestras secciones: El Hormiguero, Otros Bichos y A Ojo de Hormiga.`
          : "Primera edición de Hormiguero de Poemas. Secciones: El Hormiguero, Otros Bichos y A Ojo de Hormiga."
      } />
      <meta property="og:type" content="website" />
      <meta property="og:url" content="https://hormiguerodepoemas.com/contenidos" />
      <meta property="og:image" content={revista?.portada || '/default-cover.jpg'} />
      <meta property="og:image:alt" content={`Portada de ${revista?.nombre || 'Hormiguero de Poemas'}`} />
      
      {/* Twitter Cards */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={`${revista?.nombre || 'Los Espíritus de lo Mínimo'} - Contenidos`} />
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
      
      {/* Cover image with title - esta no tiene animación */}
      <div className="cover-image image_2" style={{
        backgroundImage: revista?.portada ? `url(${revista.portada})` : 'none',
        position: 'relative',
        marginTop: isDesktop ? '60px':'none' // Space for navbar
      }}>
        
     </div>
      {/* Article preview section - aquí empiezan las animaciones */}
      
        
    
      <ScrollReveal direction="up">
        <div className="res" >
          {/* Usa el título con animación que creamos */}
          {renderTitle()}
          
          <ScrollReveal delay={300} direction="up">
            
              <div className="article-content" >
              
                <p id="sintesis" style={{whiteSpace:'pre-line'}}>
                  {revista?.sintesis || 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Architecto consectetur vitae possimus eos. Vel impedit sapiente, aliquam blanditiis accusamus ea modi veniam esse quod atque in sed quidem placeat! Ipsam neque dicta repellat nesciunt, quisquam amet quidem magni provident mollitia laudantium assumenda porro esse soluta praesentium consequuntur nemo nulla repudiandae fugit quis quasi iusto ut at deserunt itaque! Minus tenetur culpa atque ullam quibusdam eaque. Quia nostrum eligendi magni placeat velit vitae! Veniam dolor porro sed aut tempora, repellat nisi officiis omnis molestias recusandae obcaecati, sapiente placeat neque unde, quasi illo inventore in quis iusto optio cupiditate! Perspiciatis culpa pariatur recusandae, totam, omnis aperiam aliquam, veniam accusamus tempora blanditiis impedit.'}
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
              <div >
                  <RotatingBackground 
                    changeInterval={850}
                    opacity={0.525}
                    zIndex={-1}
                    supabase={supabase}

                  />
              </div>

                {/* Optional: Add overlay for better text readability */}
                {/* <RainDrops 
                count={75}
                speed="fast"
                intensity="heavy"
                svgName="gota"
              /> */}

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

                    /* Enhanced menu item styling for better visibility on background */
                    .menu-item {
                      transition: all 0.3s ease;
                    }

                    .menu-item:hover {
                      transform: translateY(-5px);
                    }
                  `}
                </style>
                
                {/* Contenedor de insectos */}
                <div style={{ 
                  position: 'absolute', 
                  top: 0, 
                  left: 0, 
                  width: '100%', 
                  height: '100%', 
                  zIndex: 0
                }}>
                  
                </div>
                  
                  
                {/* Map through menu items con animaciones secuenciales */}
                {menuItems.map((item, index) => {
                  // Array of background images
                  
                  // Determine which SVG to use based on index
                  let antIcon;
                  switch(index) {
                    case 0: antIcon = hormigueroLogo; break;
                    case 1: antIcon = hormigueroLogo; break;
                    case 2: antIcon = hormigueroLogo; break;
                    case 3: antIcon = hormigueroLogo; break;
                    case 4: antIcon = hormigueroLogo; break;
                    case 5: antIcon = hormigueroLogo; break;
                    default: antIcon = hormigueroLogo;
                  }
                  
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
                        
                        {/* Nuevo subtítulo */}
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