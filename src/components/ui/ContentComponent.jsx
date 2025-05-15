import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createClient } from '@supabase/supabase-js';
import SVGRenderer from './SVGRenderer'; // Import the SVGRenderer component

// Import your book cover images
import bookCover1 from '../../assets/images/1res.png';
import bookCover2 from '../../assets/images/2res.png';
import bookCover3 from '../../assets/images/3res.png';
import bookCover4 from '../../assets/images/4res.png';
import bookCover5 from '../../assets/images/5res.png';

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
                link: `/poemario/${poemario.id_autor}`,
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
    const small = books.filter(book => book.poemCount < 5);
    const medium = books.filter(book => book.poemCount >= 5 && book.poemCount <= 7);
    const large = books.filter(book => book.poemCount > 7);
    
    return { small, medium, large };
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
    const isDesktop = windowWidth > 840; // Define el umbral para desktop
    
    if (sizeInfo.isLarge) {
      return {
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        textAlign: 'center',
        color: isHighlighted ? '#ffeb3b' : 'white', // Change color to yellow when highlighted
        fontSize: isDesktop ? '3rem' : '24px', // 3rem para desktop, 24px para móvil
        fontWeight: 'bold',
        letterSpacing: '1px',
        textShadow: '2px 2px 4px rgba(0,0,0,0.8)',
        width: '80%',
        textTransform: 'uppercase',
      };
    }
    
    return {
      margin: isDesktop ? '0 0 0 0' : '0 0 5px 0', 
      fontWeight: 'bold',
      letterSpacing: '0.5px',
      fontSize: isDesktop ? '2.7rem' : 'inherit', // 1.5rem para desktop, heredado para móvil
      textAlign: isDesktop ? 'center' : 'left', // Centrado en desktop, izquierda en móvil
      color: isHighlighted ? '#ffeb3b' : 'white', // Change color to yellow when highlighted
    };
  };

  // Function to handle contributor click and highlight the related book
  const handleContributorClick = (bookId) => {
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
      
      // Set animating book ID to trigger SVG animation
      setAnimatingBookId(bookId);
      
      // Set highlighted author ID
      setHighlightedAuthorId(bookId);
      
      // Reset animation after it completes
      setTimeout(() => {
        setAnimatingBookId(null);
        // Keep the highlight for 3 more seconds after animation ends
        setTimeout(() => {
          setHighlightedAuthorId(null);
        }, 3000);
      }, 1500); // Animation duration
    }
  };
  
  const isDesktop = windowWidth > 840; // Define el umbral para desktop igual que en getTitleStyles
  
  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className="edition-container">
      {/* Cover image */}
      
      {/* Article preview section */}
      <div className="article-preview">
        <h2 className="edition-title" style={{ fontWeight: 'bold', marginBottom: '30px', fontSize: isDesktop ? '4rem' : '50px', marginTop: '3rem' }}>
          {displayTitle.toUpperCase()}
        </h2>
        
        {/* Contributors list - Made clickable with scroll functionality */}
        <div className="contributors-list" style={{marginTop: '-1.5rem', marginBottom: '2rem',display:'grid'}}>
          {contributors.length > 0 ? (
            contributors.map((contributor, index) => {
              // Find the matching book for this contributor
              const matchingBook = arrangedBooks.find(book => 
                book.author.toLowerCase() === contributor.toLowerCase() ||
                contributor.toLowerCase().includes(book.author.toLowerCase()) ||
                book.author.toLowerCase().includes(contributor.toLowerCase())
              );
              
              return (
                <p 
                  key={index} 
                  onClick={() => matchingBook && handleContributorClick(matchingBook.id)}
                  style={{
                    marginBottom: '10px',
                    cursor: matchingBook ? 'pointer' : 'default',
                    position: 'relative',
                    display: 'inline-block',
                    transition: 'transform 0.2s ease, color 0.3s ease',
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
              );
            })
          ) : (
            /* Fallback contributors if none are found */
            <>
              <p style={{marginBottom: '10px'}}>JOSÉ NERUDA – "Veinte poemas de amor y una canción desesperada"</p>
              <p style={{marginBottom: '10px'}}>FEDERICO GARCÍA LORCA – "Romancero gitano"</p>
              <p style={{marginBottom: '10px'}}>EMILY DICKINSON – "Poems by Emily Dickinson"</p>
              <p style={{marginBottom: '10px'}}>GABRIEL GARCÍA MÁRQUEZ – "Obra poética completa"</p>
              <p style={{marginBottom: '10px'}}>OCTAVIO PAZ – "Piedra de sol"</p>
            </>
          )}
        </div>
        
        <div className="article-content" style={{marginBottom: '3rem', display: 'flex', justifyContent: 'center'}}>
          <p style={{ 
            textIndent: '1em',
            lineHeight: '1.5',
            hyphens: 'auto',
            color: 'white',
            backgroundColor: 'rgba(0, 0, 0, 0.5)', // Fondo negro semitransparente 
            padding: '14px',                        // Espacio interior
            borderRadius: '4px',                    // Esquinas redondeadas
            backdropFilter: 'blur(2px)',            // Efecto de desenfoque (opcional)
            maxWidth: isDesktop ? '900px' : '100%', 
          }}>
            {content?.sintesis || 'Default synthesis text if none is available.'}
          </p>
        </div>

        {/* Book covers grid */}
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
            
            return (
              <Link 
                key={book.id} 
                to={book.link} 
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
                    boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
                    transition: 'all 0.3s ease', // Modified transition to include all properties
                    height: sizeStyles.height,
                    width: '100%', // Always use full width of grid cell
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
                      <p className='responsive-text' style={{ textTransform: 'uppercase'}}>{book.poemCount} POEMAS</p>
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
                      <p className="responsive-text" style={{ 
                        textAlign: isDesktop ? 'center' : 'left',
                        width: '100%',
                        color: 'white'
                      }}>
                        {book.poemCount} {book.poemCount === 1 ? 'POEMA' : 'POEMAS'}
                      </p>
                    </div>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      </div>
      
      {/* Add CSS for the highlight animation */}
      <style jsx>{`
        @keyframes highlight-pulse {
          0% { 
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            transform: scale(1);
          }
          50% { 
            box-shadow: 0 0 20px 5px rgba(227, 226, 220, 0.4);
            transform: scale(1.05);
          }
          100% { 
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            transform: scale(1);
          }
        }
        
        .highlight-animation {
          animation: highlight-pulse 2s ease;
        }
        
        /* Optional: Add a smooth hover effect for the book items as well */
        #book-container > div:hover {
          transform: translateY(-5px);
          box-shadow: 0 10px 20px rgba(0,0,0,0.2);
        }
      `}</style>
    </div>
  );
};

export default ContentComponent;