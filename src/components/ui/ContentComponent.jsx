import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createClient } from '@supabase/supabase-js';
import SVGRenderer from './SVGRenderer'; // Import the SVGRenderer component
import {useRef} from 'react';
import { Helmet } from 'react-helmet-async';


// Import your book cover images
import bookCover1 from '../../assets/images/1res.png';
import bookCover2 from '../../assets/images/2res.png';
import bookCover3 from '../../assets/images/3res.png';
import bookCover4 from '../../assets/images/4res.png';
import bookCover5 from '../../assets/images/5res.png';
import ScrollReveal from './ScrollReveal'; // Ajusta la ruta según tu estructura

// Initialize Supabase client
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

// This component handles both creaciones, traducciones, and other similar sections
const ContentComponent = ({ contentType }) => {
  // State for data
  const [revista, setRevista] = useState(null);
  const [content, setContent] = useState(null);
  const [poemarios, setPoemarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [contributors, setContributors] = useState([]);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [animatingBookId, setAnimatingBookId] = useState(null);
  const [highlightedAuthorId, setHighlightedAuthorId] = useState(null);

  // Default book covers mapping
  const defaultCovers = {
    1: bookCover1,
    2: bookCover2,
    3: bookCover3,
    4: bookCover4,
    5: bookCover5
  };

  // Capitalize first letter for display purposes
  const displayTitle = contentType.charAt(0).toUpperCase() + contentType.slice(1);

  // Function to check if a string is an SVG
  const isSVG = (str) => {
    if (!str || typeof str !== 'string') return false;
    return str.trim().startsWith('<svg') && str.includes('</svg>');
  };

  // Fetch data on component mount
  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };
    window.addEventListener('resize', handleResize);
    
    const fetchData = async () => {
      try {
        
        // 1. Fetch revista with ID 1
        const { data: revistaData, error: revistaError } = await supabase
          .from('revista')
          .select('*')
          .eq('id', 1)
          .single();
  
        if (revistaError) throw revistaError;
        setRevista(revistaData);
  
        // 2. Fetch content section linked to this revista
        const { data: contentData, error: contentError } = await supabase
          .from('creaciones') // This table holds all content types (both creaciones and traducciones)
          .select('*')
          .eq('id_revista', 1)
          .eq('tipo', contentType) // Use the contentType prop to differentiate
          .single();
  
        if (contentError) throw contentError;
        setContent(contentData);
  
        // Parse colaboradores
        if (contentData.colaboradores) {
          const colaboradoresList = contentData.colaboradores
            .split(',')
            .map(name => name.trim());
          setContributors(colaboradoresList);
        }
  
        // 3. Fetch poemario IDs from junction table
        // The junction table name might need to be adjusted based on your DB structure
        const junctionTable = `creaciones_poemario`;
        
        const { data: poemarioRelations, error: relationsError } = await supabase
          .from(junctionTable)
          .select('id_poemario')
          .eq('id_creacion', contentData.id);
  
        if (relationsError) throw relationsError;
  
        const poemarioIds = poemarioRelations.map(relation => relation.id_poemario);
  
        // 4. Fetch actual poemarios
        if (poemarioIds.length > 0) {
          const { data: poemarioData, error: poemarioError } = await supabase
            .from('poemario')
            .select('*, autor(nombre)')
            .in('id', poemarioIds);
  
          if (poemarioError) throw poemarioError;
  
          // 5. Fetch poem count for each poemario
          const poemariosWithCount = await Promise.all(
            poemarioData.map(async (poemario) => {
              const { count, error: countError } = await supabase
                .from('poema')
                .select('*', { count: 'exact', head: true })
                .eq('id_poemario', poemario.id);
  
              return {
                id: poemario.id,
                title: poemario.titulo,
                author: poemario.autor ? poemario.autor.nombre : 'Unknown',
                cover: poemario.portada,
                isSVG: isSVG(poemario.portada),
                link: `/autor/${encodeURIComponent(poemario.autor ? poemario.autor.nombre : 'unknown')}`,
                poemCount: countError ? Math.floor(Math.random() * 10) + 1 : count
              };
            })
          );
  
          setPoemarios(poemariosWithCount);
        }
  
        setLoading(false);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError(`Failed to load ${contentType} data`);
        setLoading(false);
      }
      
    };
  
    fetchData();
    
    return () => window.removeEventListener('resize', handleResize);
  }, [contentType]);
  // Add this useEffect in your ContentComponent
useEffect(() => {
  // Always scroll to top when the component mounts
  window.scrollTo(0, 0);
  
  // Disable scroll restoration temporarily
  if ('scrollRestoration' in history) {
    history.scrollRestoration = 'manual';
  }
  
  return () => {
    // Re-enable scroll restoration when component unmounts
    if ('scrollRestoration' in history) {
      history.scrollRestoration = 'auto';
    }
  };
}, []);
  // Modifica la función getBookSize para usar porcentajes en desktop
  const getBookSize = (poemCount, sizeCategory) => {
    const isDesktop = windowWidth > 840; // Define el umbral para desktop
    
    // En desktop, usar porcentajes para las alturas
    if (isDesktop) {
      if (sizeCategory === 'large') {
        return { 
          height: '45vh', // 80% de la altura de la ventana para libros grandes
          width: 'auto', 
          gridColumn: 'span 2',
          gridRow: 'span 1',
          isLarge: true
        };
      } else if (sizeCategory === 'medium') {
        return { 
          height: '45vh', // 65% para libros medianos
          width: 'auto', 
          gridColumn: 'span 1',
          gridRow: 'span 2',
          isMedium: true
        };
      } else {
        return { 
          height: '45vh', // 50% para libros pequeños
          width: 'auto', 
          gridColumn: 'span 1',
          gridRow: 'span 1',
          isSmall: true
        };
      }
    } 
    // En móvil, mantener las alturas en píxeles originales
    else {
      if (sizeCategory === 'large') {
        return { 
          height: '240px', 
          width: 'auto', 
          gridColumn: 'span 2',
          gridRow: 'span 1',
          isLarge: true
        };
      } else if (sizeCategory === 'medium') {
        return { 
          height: '240px', 
          width: 'auto', 
          gridColumn: 'span 1',
          gridRow: 'span 2',
          isMedium: true
        };
      } else {
        return { 
          height: '180px', 
          width: 'auto', 
          gridColumn: 'span 1',
          gridRow: 'span 1',
          isSmall: true
        };
      }
    }
  };
  
 const FadeInElement = ({ children, delay = 0 }) => {
  const ref = useRef(null);
  
  useEffect(() => {
    // Función para manejar la animación del elemento
    const handleIntersection = (entries) => {
      entries.forEach(entry => {
        // Si el elemento está entrando en el viewport (desde arriba o abajo)
        if (entry.isIntersecting) {
          // Aplicar la animación de entrada con el retraso especificado
          setTimeout(() => {
            if (ref.current) {
              ref.current.classList.add('fade-in-visible');
              ref.current.classList.remove('fade-out');
            }
          }, delay);
        } 
        // Si el elemento está saliendo del viewport
        else {
          // Cuando sale del viewport, prepararlo para la siguiente animación
          // Sólo si no estamos en modo de clic
          if (ref.current && !document.body.classList.contains('clicking-mode')) {
            ref.current.classList.remove('fade-in-visible');
            ref.current.classList.add('fade-out');
          }
        }
      });
    };
    
    const observer = new IntersectionObserver(handleIntersection, {
      root: null,
      rootMargin: '10px', // Un pequeño margen para activar un poco antes
      threshold: 0.1 // Activar cuando al menos el 10% del elemento es visible
    });
    
    if (ref.current) {
      observer.observe(ref.current);
    }
    
    return () => {
      if (ref.current) {
        observer.unobserve(ref.current);
      }
    };
  }, [delay]);
  
  return (
    <div ref={ref} className="fade-in-element">
      {children}
    </div>
  );
};
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

  // Function to categorize books by size
  const categorizeBooks = (books) => {
    const small = books.filter(book => book.poemCount == -2);
    const medium = books.filter(book => book.poemCount == -1);
    const large = books.filter(book => book.poemCount >= 0);
    
    return {small,medium, large };
  };

  // Function to arrange books in the pattern: small, large, medium, small, large, medium...
  const arrangeBooks = (books) => {
    const { small, medium, large } = categorizeBooks(books);
    const result = [];
    
    // Calculate how many complete sets we can create
    const maxSets = Math.max(
      Math.ceil(small.length / 2),
      Math.ceil(large.length),
      Math.ceil(medium.length / 2)
    );
    
    // Create the pattern: small, small, large, medium, medium
    for (let i = 0; i < maxSets; i++) {
      // Add first small book if available
      if (i * 2 < small.length) {
        result.push({...small[i * 2], sizeCategory: 'small'});
      }
      
      // Add second small book if available
      if (i * 2 + 1 < small.length) {
        result.push({...small[i * 2 + 1], sizeCategory: 'small'});
      }
      
      // Add large book if available
      if (i < large.length) {
        result.push({...large[i], sizeCategory: 'large'});
      }
      
      // Add first medium book if available
      if (i * 2 < medium.length) {
        result.push({...medium[i * 2], sizeCategory: 'medium'});
      }
      
      // Add second medium book if available
      if (i * 2 + 1 < medium.length) {
        result.push({...medium[i * 2 + 1], sizeCategory: 'medium'});
      }
    }
    
    return result;
  };
  
  // Arrange books in the desired pattern
  const arrangedBooks = arrangeBooks(poemarios);

  // Function to get title styling based on book size
  const getTitleStyles = (sizeInfo, isHighlighted) => {
  const isDesktop = windowWidth > 840;
  
  if (sizeInfo.isLarge) {
    return {
      position: 'absolute',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      textAlign: 'center',
      color: isHighlighted ? 'white' : 'white',
      fontSize: isDesktop ? '1.5rem' : '16px',
      fontWeight: 'bold',
      letterSpacing: '1px',
      textShadow: '2px 2px 4px rgba(0,0,0,0.8)',
      width: '80%',
      textTransform: 'uppercase',
      textDecoration: isHighlighted ? 'underline' : 'none', // Agregar subrayado
      textDecorationColor: 'white', // Color del subrayado
      textDecorationThickness: '3px', // Grosor del subrayado
    };
  }
  
  return {
    margin: isDesktop ? '0 0 0 0' : '0 0 5px 0',
    fontWeight: 'bold',
    letterSpacing: '0.5px',
    fontSize: isDesktop ? '2.7rem' : 'inherit',
    textAlign: isDesktop ? 'center' : 'left',
    color: isHighlighted ? 'white' : 'white',
    textDecoration: isHighlighted ? 'underline' : 'none', // Agregar subrayado
    textDecorationColor: 'white', // Color del subrayado
    textDecorationThickness: '3px', // Grosor del subrayado
  };
};

  // Function to handle contributor click and highlight the related book
 // Línea 370-398 aproximadamente
const handleContributorClick = (bookId) => {
  // Desactiva todas las animaciones de aparición cuando se hace clic
  document.querySelectorAll('.fade-in-element').forEach(el => {
    el.classList.add('fade-in-visible');
  });
  
  // Create an ID for the book element based on the book's id
  const bookElementId = `book-${bookId}`;
  
  // Find the book element by ID
  const bookElement = document.getElementById(bookElementId);
  
  if (bookElement) {
    // Scroll to the element with smooth animation
    bookElement.scrollIntoView({ 
      behavior: 'smooth',
      block: 'center'
    });
    
    // Set highlighted author ID - sólo establecemos esto para el resaltado
    setHighlightedAuthorId(bookId);
    
    // Reset highlight after 5 seconds
    setTimeout(() => {
      setHighlightedAuthorId(null);
    }, 5000);
    
    // No establecemos animatingBookId para evitar la animación de pulso que puede causar los parpadeos
  }
};
    const getSectionTitle = () => {
    switch(contentType.toLowerCase()) {
      case 'creaciones':
        return 'El Hormiguero';
      case 'critica':
      case 'crítica':
        return 'Otros Bichos';
      case 'traducciones':
        return 'Traducciones';
      case 'rescates':
        return 'Rescates';
      default:
        return contentType.charAt(0).toUpperCase() + contentType.slice(1);
    }
  };
   const getSectionSubtitle = () => {
    switch(contentType.toLowerCase()) {
      case 'creaciones':
        return 'Poemas en verso y prosa';
      case 'critica':
      case 'crítica':
        return 'Ensayos, cuentos y críticas';
      case 'traducciones':
        return 'Traducciones de poesía mundial';
      case 'rescates':
        return 'Rescates literarios';
      default:
        return `Contenido de ${contentType}`;
    }
  };
    const getAuthorsNames = () => {
    if (!contributors.length) return '';
    return contributors.slice(0, 8).join(', '); // Máximo 8 autores
  };
  const isDesktop = windowWidth > 840; // Define el umbral para desktop igual que en getTitleStyles
  
  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <>
     <Helmet>
        <title>{`${getSectionTitle()} - ${getSectionSubtitle()} | Hormiguero de Poemas`}</title>
        <meta name="description" content={
          contributors.length > 0
            ? `${getSectionTitle()}: ${getSectionSubtitle()}. Autores: ${getAuthorsNames()}.`
            : `${getSectionTitle()} - ${getSectionSubtitle()} en Hormiguero de Poemas`
        } />
        <meta name="keywords" content={`${contentType}, ${getSectionTitle().toLowerCase()}, ${getAuthorsNames()}, hormiguero de poemas, literatura, poesía`} />
        
        {/* Open Graph */}
        <meta property="og:title" content={`${getSectionTitle()} - ${getSectionSubtitle()}`} />
        <meta property="og:description" content={
          contributors.length > 0
            ? `${getSectionTitle()}: ${getSectionSubtitle()}. Con ${contributors.length} autor${contributors.length > 1 ? 'es' : ''}: ${getAuthorsNames()}`
            : `Descubre ${getSectionTitle()} en Hormiguero de Poemas`
        } />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={`http://hormiguerodepoemas/${contentType}`} />
        <meta property="og:image" content={
          content?.imagen ||
          (poemarios.length > 0 && poemarios[0].cover) ||
          '/default-section.jpg'
        } />
        <meta property="og:image:alt" content={`${getSectionTitle()} - Hormiguero de Poemas`} />
        
        {/* Twitter Cards */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={`${getSectionTitle()} - ${getSectionSubtitle()}`} />
        <meta name="twitter:description" content={
          contributors.length > 0
            ? `${contributors.length} autor${contributors.length > 1 ? 'es' : ''} en ${getSectionTitle()}: ${getAuthorsNames()}`
            : `${getSectionTitle()}: ${getSectionSubtitle()}`
        } />
        <meta name="twitter:image" content={
          content?.imagen ||
          (poemarios.length > 0 && poemarios[0].cover) ||
          '/default-section.jpg'
        } />
        <meta name="twitter:site" content="@hormiguerodepoemas" />
        
        {/* Específico por sección */}
        <meta property="article:section" content={getSectionTitle()} />
        <meta property="article:tag" content={contentType} />
        <meta property="article:tag" content="literatura" />
        <meta property="article:tag" content="poesía" />
        
        {/* Schema.org */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "CollectionPage",
            "name": `${getSectionTitle()} - ${getSectionSubtitle()}`,
            "description": `${getSectionTitle()}: ${getSectionSubtitle()}`,
            "url": `http://localhost:3000/${contentType}`,
            "publisher": {
              "@type": "Organization",
              "name": "Hormiguero de Poemas"
            },
            "image": content?.imagen,
            "numberOfItems": poemarios.length,
            "about": {
              "@type": "CreativeWork",
              "name": getSectionTitle()
            }
          })}
        </script>
      </Helmet>

    <div className="edition-container scroll-reveal-container">
      {/* Cover image */}
      
      {/* Article preview section */}
      <div className="article-preview">
        {/* Título principal con ScrollReveal */}
        <ScrollReveal direction="up">
          <h2 
            className="edition-title" 
            style={{ 
              fontWeight: 'bold', 
              marginBottom: '30px', 
              fontSize: isDesktop ? '3rem' : '40px', 
              marginTop: '3rem' 
            }}
          >
            {displayTitle.toLowerCase() === 'creaciones' 
              ? (
                  <>
                    EL HORMIGUERO
                    <p className="subtitle" style={{ fontSize: isDesktop ? '1.5rem' : '1rem', fontWeight: 'bold',marginTop:'-0.5rem',marginBottom:'2.5rem',fontStyle:'italic'
                    }}>
                      POEMAS EN VERSO Y PROSA
                    </p>
                  </>
                ) 
              : displayTitle.toLowerCase() === 'critica' || displayTitle.toLowerCase() === 'crítica'
                ? (
                    <>
                      OTROS BICHOS
                      <p className="subtitle" style={{  fontSize: isDesktop ? '1.5rem' : '1rem', fontWeight: 'bold',marginTop:'-0.5rem',marginBottom:'2.5rem',fontStyle:'italic' }}>
                      Ensayo, entrevistas y homenajes      
                      </p>
                    </>
                  )
                : displayTitle.toUpperCase()
            }
          </h2>
        </ScrollReveal>
        
        {/* Contributors list con ScrollReveal */}
        <ScrollReveal direction="up" delay={200}>
          <div className="contributors-list" style={{marginTop: '-1.5rem', marginBottom: '2rem',display:'grid',background: displayTitle.toLowerCase() === 'critica' || displayTitle.toLowerCase() === 'crítica' 
  ? 'transparent' 
  : 'transparent',
boxShadow: isDesktop 
  ? '0 6px 80px 25px rgba(0, 0, 0, 0.15)' 
  : '0 4px 12px rgba(0, 0, 0, 0.15)',}}>
            {contributors.length > 0 ? (
              contributors.map((contributor, index) => {
                // Find the matching book for this contributor
                const matchingBook = arrangedBooks.find(book => 
                  book.author.toLowerCase() === contributor.toLowerCase() ||
                  contributor.toLowerCase().includes(book.author.toLowerCase()) ||
                  book.author.toLowerCase().includes(contributor.toLowerCase())
                );
                
                // ScrollReveal para cada contribuidor con diferentes direcciones
                const direction = index % 2 === 0 ? 'left' : 'right';
                
                return (
                  <ScrollReveal key={index} delay={100 + index * 80} direction={direction} threshold={0.3}>
                    <p 
                      onClick={() => matchingBook && handleContributorClick(matchingBook.id)}
                      style={{
                        marginTop: '4px',
                        marginBottom: '10px',
                        cursor: matchingBook ? 'pointer' : 'default',
                        position: 'relative',
                        display: 'inline-block',
                        transition: 'transform 0.2s ease, color 0.3s ease',
                        fontWeight:300
                        
                                          }}
                      // Add hover effects
                      onMouseEnter={(e) => {
                        if (matchingBook) {
                          e.currentTarget.style.transform = 'translateX(10px)';
                          e.currentTarget.style.color = 'black'; // Highlight color on hover
                          // Highlight the corresponding author name
                          setHighlightedAuthorId(matchingBook.id);
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (matchingBook) {
                          e.currentTarget.style.transform = 'translateX(0)';
                          e.currentTarget.style.color = 'inherit';
                          // Remove highlight when not hovering or clicking
                          if (animatingBookId !== matchingBook.id) {
                            setHighlightedAuthorId(null);
                          }
                        }
                      }}
                    >
                      {contributor.toUpperCase()}
                    </p>
                  </ScrollReveal>
                );
              })
            ) : (
              /* Fallback contributors con ScrollReveal */
              <>
                <ScrollReveal delay={100} direction="left">
                  <p style={{marginBottom: '10px'}}>JOSÉ NERUDA – "Veinte poemas de amor y una canción desesperada"</p>
                </ScrollReveal>
                <ScrollReveal delay={180} direction="right">
                  <p style={{marginBottom: '10px'}}>FEDERICO GARCÍA LORCA – "Romancero gitano"</p>
                </ScrollReveal>
                <ScrollReveal delay={260} direction="left">
                  <p style={{marginBottom: '10px'}}>EMILY DICKINSON – "Poems by Emily Dickinson"</p>
                </ScrollReveal>
                <ScrollReveal delay={340} direction="right">
                  <p style={{marginBottom: '10px'}}>GABRIEL GARCÍA MÁRQUEZ – "Obra poética completa"</p>
                </ScrollReveal>
                <ScrollReveal delay={420} direction="left">
                  <p style={{marginBottom: '10px'}}>OCTAVIO PAZ – "Piedra de sol"</p>
                </ScrollReveal>
              </>
            )}
          </div>
        </ScrollReveal>
        
        {/* Texto del artículo con ScrollReveal */}
        

        {/* Book covers grid - No modificado según instrucciones */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)', // Fixed to exactly 2 columns
          gap: '20px',
          marginBottom: '40px'
        }}>
          {arrangedBooks.map((book, index) => {
            const sizeStyles = getBookSize(book.poemCount, book.sizeCategory);
            const isHighlighted = highlightedAuthorId === book.id;
            const titleStyles = getTitleStyles(sizeStyles, isHighlighted);
            const isLargeBook = sizeStyles.isLarge;
            
            // For large books, ensure they start at the beginning of a row
            const gridPosition = {};
            if (isLargeBook) {
              gridPosition.gridColumn = '1 / span 2'; // Always span full width
            }
            const delay = index * 100;
            return (
          <FadeInElement key={book.id} delay={delay}>
              <Link 
                key={book.id} 
                to={book.link} 
                state={{ fromInternal: true, contentType: contentType }}
                style={{
                  textDecoration: 'none', 
                  color: 'inherit',
                  ...gridPosition
                }}
              >
                {/* Add an ID to each book div to use for scrolling */}
                <div 
                  id={`book-${book.id}`} // Add this ID to target for scrolling
                  style={{
                    position: 'relative',
                    overflow: 'hidden',
                    borderRadius: '4px',
                    transition: 'all 0.3s ease', // Modified transition to include all properties
                    height: sizeStyles.height,
                    width: '100%', // Always use full width of grid cell
                    boxShadow: '0 8px 12px rgba(0, 0, 0, 0.15)',
                   
                  }}
                >
                  {/* Use SVGRenderer for SVG covers, regular img tag for other images */}
                  {book.isSVG ? (
                    <SVGRenderer
                      svgString={book.cover}
                      style={{
                        width: isDesktop ? '65%' : '100%',
                        height: '100%',
                        objectFit: 'cover'
                      }}
                      isAnimating={animatingBookId === book.id}
                      animationType="pulse"
                    />
                  ) : (
                    <img 
                      src={book.cover} 
                      alt={book.author} 
                      style={{
                        width: isDesktop ? '65%' : '100%',
                        height: '100%',
                        objectFit: 'cover'
                      }}
                      className={animatingBookId === book.id ? 'highlight-animation' : ''}
                    />
                  )}
                  
                  {isLargeBook ? (
                    // Centered title for large books
                    <div style={titleStyles}>
                      <h3>{book.author.toUpperCase()}</h3>
                    </div>
                  ) : (
                    // Standard top-aligned title for small/medium books con centrado en desktop
                    <div style={{
                      position: 'absolute',
                      top: isDesktop ? '50%' : 0,
                      left: 0,
                      padding: '10px',
                      textShadow: '1px 1px 3px rgba(0,0,0,0.7)',
                      width: '100%',
                      transform: isDesktop ? 'translateY(-50%)' : 'none',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: isDesktop ? 'center' : 'flex-start',
                    }}>
                      <h4 style={titleStyles}>{book.author.toUpperCase()}</h4>
                      
                    </div>
                  )}
                </div>
              </Link>
            </FadeInElement>
            );
          })}
        </div>
      </div>
      
      {/* Add CSS for the highlight animation */}
      <style jsx>{`
         @keyframes highlight-pulse {
         
        }
        
        .highlight-animation {
          animation: highlight-pulse 3s ease;
        }
        
        .fade-in-element {
          opacity: 0;
          transform: translateY(30px);
          transition: opacity 0.6s ease-out, transform 0.6s ease-out;
          will-change: opacity, transform;
        }
        
        .fade-in-visible {
          opacity: 1;
          transform: translateY(0);
        }
        
        .fade-out {
          opacity: 0;
          transform: translateY(-30px); /* Movimiento hacia arriba al desaparecer */
          transition: opacity 0.6s ease-in, transform 0.6s ease-in;
        }
        
        /* Desactivar transiciones cuando se hace clic */
        .clicking-mode .fade-in-element {
          transition: none !important;
          opacity: 1 !important;
          transform: translateY(0) !important;
        }
        
        /* Clase para contenedor principal */
        .scroll-reveal-container {
          overflow-x: hidden; /* Evitar desbordamiento horizontal durante animaciones */
        }
      `}</style>
    </div>
    </>
  );
};

export default ContentComponent;