import React, { useState, useEffect } from 'react';
import eventImage from '../../assets/images/evento1.png';
import portada from '../../assets/images/edicion1.png';
import bookCover1 from '../../assets/images/1res.png';
import bookCover2 from '../../assets/images/2res.png';
import bookCover3 from '../../assets/images/3res.png';
import bookCover4 from '../../assets/images/4res.png';
import bookCover5 from '../../assets/images/5res.png';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { createClient } from '@supabase/supabase-js';
import InsectColony from './MovingSvgBackground'; // Adjust the path as needed
import mosquito from '../../assets/images/mosquito.svg';
// import ant from '../../assets/images/ant.svg';
import bee from '../../assets/images/bee.svg';
import fly from '../../assets/images/roach.svg';
import ant from '../../assets/images/libelula.svg';
import ScrollReveal from './ScrollReveal'; // Ajusta la ruta según tu estructura

// Initialize Supabase client
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


const AuthorBio = () => {
    const { id } = useParams(); // Get author ID from URL if available
    const navigate = useNavigate(); // Initialize navigate function
    const [autor, setAutor] = useState(null);
    const [poemas, setPoemas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [revista, setRevista] = useState(null);
    const [poemario, setPoemario] = useState(null);
    const [isVisualArtist, setIsVisualArtist] = useState(false);
    const [windowWidth, setWindowWidth] = useState(window.innerWidth);
    

    // Default book covers mapping
    const defaultCovers = {
      1: bookCover1,
      2: bookCover2,
      3: bookCover3,
      4: bookCover4,
      5: bookCover5
    };

    // Count words in a text
    const countWords = (text) => {
      if (!text) return 0;
      return text.split(/\s+/).filter(word => word.length > 0).length;
    };

    // Fetch data on component mount
    useEffect(() => {
      const fetchData = async () => {
        try {
          // Default author ID if not provided in URL
          const authorId = id // Using ID from URL params
          
          // 1. Fetch autor (author) data
          const { data: autorData, error: autorError } = await supabase
            .from('autor')
            .select('*')
            .eq('id', authorId)
            .single();

          if (autorError) throw autorError;
          setAutor(autorData);
          
          // Check if author is visual artist
          setIsVisualArtist(autorData.tipo_creacion === 'visuales' || autorData.tipo_creacion === 'entrevista');

          // 2. Fetch revista for the header background
          const { data: revistaData, error: revistaError } = await supabase
            .from('revista')
            .select('*')
            .eq('id', 1)
            .single();

          if (revistaError) throw revistaError;
          setRevista(revistaData);

          // Only fetch poems if the author is not a visual artist
          if (autorData.tipo_creacion !== 'visuales') {
            // 3. Fetch poems by this author
            const { data: poemasData, error: poemasError } = await supabase
              .from('poema')
              .select('*')
              .eq('id_autor', authorId);

            if (poemasError) throw poemasError;
            
            // 4. Fetch poemario info
            const { data: poemarioData, error: poemarioError } = await supabase
              .from('poemario')
              .select('*')
              .eq('id_autor', authorId)
              .single();
            
            if (!poemarioError) {
              setPoemario(poemarioData);
            }
            
            // Transform poemas to match the books format and count words
            const transformedPoemas = poemasData.map((poema, index) => {
              // Count words in the poem text
              const wordCount = countWords(poema.texto);
              
              return {
                id: poema.id,
                title: poema.titulo,
                author: autorData.nombre,
                cover: poema.portada || defaultCovers[(index % 5) + 1], // Cycle through available covers
                link: `/poema/${poema.id}`,
                wordCount: wordCount || Math.floor(Math.random() * 150) + 20, 
              };
            });

            setPoemas(transformedPoemas);
          }
          
          setLoading(false);
        } catch (err) {
          console.error('Error fetching author data:', err);
          setError('Failed to load author data');
          setLoading(false);
        }
      };

      fetchData();
    }, [id]);

    // Function to categorize books by size based on word count
    const categorizeBooks = (books) => {
      const small = books.filter(book => book.wordCount < 100);
      const medium = books.filter(book => book.wordCount >= 100 && book.wordCount <= 200);
      const large = books.filter(book => book.wordCount > 200);
      
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
          result.push({...small[i * 2], sizeCategory: 'medium'});
        }
        
        // Add second small book if available
        if (i * 2 + 1 < small.length) {
          result.push({...small[i * 2 + 1], sizeCategory: 'medium'});
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
    const arrangedBooks = arrangeBooks(poemas);

    // Function to determine book size based on word count
    const getBookSize = (wordCount, sizeCategory) => {
      // Use the explicit size category for consistent sizing
      if (sizeCategory === 'large') {
        return { 
          height: '280px', 
          width: '100%', 
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
          height: isDesktop ? '390px':'180px', 
          width: 'auto', 
          gridColumn: 'span 1',
          gridRow: 'span 1',
          isSmall: true
        };
      }
    };

    // Function to get title styling based on book size
    const getTitleStyles = (sizeInfo) => {
      if (sizeInfo.isLarge) {
        return {
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          textAlign: 'center',
          color: 'white',
          fontSize: '24px',
          fontWeight: 'bold',
          letterSpacing: '1px',
          textShadow: '2px 2px 4px rgba(0,0,0,0.8)',
          padding: isDesktop ? '0' : '10px',
          width: isDesktop ? '100%' : 'auto',
        };
      }
      
      return {
        margin: '0 0 5px 0', 
        fontSize: isDesktop ? '2.5rem':'14px',
        fontWeight: 'bold',
        letterSpacing: '0.5px',

      };
    };

    if (loading) return <div>Loading...</div>;
    if (error) return <div>{error}</div>;

    // Format author name for display
    const authorName = autor?.nombre?.toUpperCase() || "AUTOR";
    
    // Generate first letter for emphasized display
    const firstLetter = authorName.charAt(0);
    const restOfName = authorName.substring(1);
    const isDesktop = windowWidth > 840; // Define el umbral para desktop igual que en getTitleStyles


return (
  <div className="bio-container scroll-reveal-container">
    {/* Cover image con ScrollReveal */}
    <ScrollReveal direction="up">
      <div className="cover-image image_2" style={{
        backgroundImage: `url(${!isVisualArtist ? (poemario?.portada || portada) : (autor?.imagen || portada)})`,
        height: '30vh'
      }}>
      </div>
    </ScrollReveal>
    
    <ScrollReveal direction="up" delay={300}>
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        maxWidth: isDesktop ? 'none' : '400px',
        width: isDesktop ? '75%' : 'auto',
        overflow: 'hidden',
        margin: '20px auto'
      }}>
        
        {/* Content section */}
        <div style={{
          padding: isDesktop ? '20px' : '8px',
          backgroundColor: 'white',
          position: 'relative'
        }}>
          {(() => {
            // Get the semblanza text
            const fullSemblanza = autor?.semblanza || '';
            
            // Check if we need to split the text (if longer than 100 chars)
            if (fullSemblanza.length > 100) {
              // Find all the periods in the text
              const periods = [];
              let dotIndex = fullSemblanza.indexOf('. ');
              
              while (dotIndex !== -1) {
                periods.push(dotIndex + 1); // Include the period
                dotIndex = fullSemblanza.indexOf('. ', dotIndex + 1);
              }
              
              // If no periods found, don't split the text
              if (periods.length === 0) {
                return (
                  <ScrollReveal direction="up" delay={400}>
                    <div style={{ 
                      fontSize: isDesktop ? '2rem' : '14px',
                      lineHeight: '1.5'
                    }}>
                      {/* Author image floating right since no good breaking point */}
                      <img 
                        src={autor?.imagen || eventImage} 
                        alt={autor?.nombre || "Author"} 
                        style={{
                          float: 'right',
                          height: isDesktop ? '400px' : '140px',
                          objectFit: 'cover',
                          margin: isDesktop ? '0 0 20px 20px' : '0 0 10px 10px',
                          border: '1px solid #eee'
                        }}
                      />
                      
                      {/* Author name and full semblanza */}
                      <p style={{ marginBottom: '15px' }}>
                        <span style={{ 
                          fontSize: isDesktop ? '4rem' : '28px', 
                          fontWeight: 'bold',
                          float: 'left',
                          marginRight: '2px',
                          lineHeight: '1'
                        }}>
                          {firstLetter}
                        </span>
                        {restOfName}, {/* Author name with comma */}
                        {fullSemblanza}
                      </p>
                    </div>
                  </ScrollReveal>
                );
              }
              
              // Find the period closest to the middle of the text
              const middle = fullSemblanza.length / 2;
              let breakIndex = periods[0]; // Default to first period
              let closestDistance = Math.abs(periods[0] - middle);
              
              // Find the period closest to the middle
              for (let i = 1; i < periods.length; i++) {
                const distance = Math.abs(periods[i] - middle);
                // If this period is closer to the middle than our current best
                if (distance < closestDistance) {
                  breakIndex = periods[i];
                  closestDistance = distance;
                }
                // If we've passed the middle, we can stop looking
                if (periods[i] > middle) {
                  break;
                }
              }
              
              // Make sure we have a minimum first part length (at least 50 chars)
              if (breakIndex < 50 && periods.length > 1) {
                breakIndex = periods[1]; // Use the second period instead
              }
              
              // Split the semblanza at the chosen period
              const firstPart = fullSemblanza.substring(0, breakIndex);
              const secondPart = fullSemblanza.substring(breakIndex).trim();
              
              return (
                <>
                  {/* Author name and first part of semblanza */}
                  <ScrollReveal direction="left" delay={400}>
                    <div style={{ 
                      fontSize: isDesktop ? '2rem' : '14px',
                      display:'flex',
                      justifyContent:'center'
                    }}>
                      <p style={{ marginBottom: '15px', width: isDesktop ? 'auto' : '90%' }}>
                        <span style={{ 
                          fontSize: isDesktop ? '4rem' : '28px', 
                          fontWeight: 'bold',
                          float: 'left',
                          marginRight: '2px',
                          lineHeight: '1'
                        }}>
                          {firstLetter}
                        </span>
                        {restOfName}, {/* Author name with comma */}
                        {firstPart}
                      </p>
                    </div>
                  </ScrollReveal>
                  
                  {/* Author image between text parts - LARGER SIZE */}
                  <ScrollReveal direction="scale" delay={600}>
                    <div style={{
                      width: '100%',
                      display: 'flex',
                      justifyContent: 'center',
                      margin: isDesktop ? '40px 0' : '30px 0' // Increased margins
                    }}>
                      <img 
                        src={autor?.imagen || eventImage} 
                        alt={autor?.nombre || "Author"} 
                        style={{
                          height: isDesktop ? '500px' : '200px', // Increased height
                          width: isDesktop ? '50%':'75%',
                          objectFit: 'cover',
                          border: '1px solid #eee',
                          boxShadow: '0 4px 10px rgba(0,0,0,0.1)' // Added shadow for emphasis
                        }}
                      />
                    </div>
                  </ScrollReveal>
                  
                  {/* Second part of semblanza */}
                  <ScrollReveal direction="right" delay={800}>
                    <div style={{ 
                      fontSize: isDesktop ? '2rem' : '14px',
                      display:'flex',
                      justifyContent:'center'
                    }}>
                      <p style={{ marginBottom: '15px',width: isDesktop ? 'auto' : '90%'}}>{secondPart}</p>
                    </div>
                  </ScrollReveal>
                </>
              );
            } 
            // For short semblanzas, keep image on the right (smaller size)
            else {
              return (
                <ScrollReveal direction="up" delay={400}>
                  <div style={{ 
                    fontSize: isDesktop ? '2rem' : '14px',
                    lineHeight: '1.5'
                  }}>
                    {/* Author image floating right */}
                    <img 
                      src={autor?.imagen || eventImage} 
                      alt={autor?.nombre || "Author"} 
                      style={{
                        float: 'right',
                        height: isDesktop ? '400px' : '140px',
                        objectFit: 'cover',
                        margin: isDesktop ? '0 0 20px 20px' : '0 0 10px 10px',
                        border: '1px solid #eee'
                      }}
                    />
                    
                    {/* First paragraph with author name and semblanza */}
                    <p style={{ marginBottom: '15px' }}>
                      <span style={{ 
                        fontSize: isDesktop ? '4rem' : '28px', 
                        fontWeight: 'bold',
                        float: 'left',
                        marginRight: '2px',
                        lineHeight: '1'
                      }}>
                        {firstLetter}
                      </span>
                      {restOfName}, {/* Author name with comma */}
                      {fullSemblanza}
                    </p>
                  </div>
                </ScrollReveal>
              );
            }
          })()}
          
          {/* Bio corta section */}
          <ScrollReveal direction="up" delay={1000}>
            <div style={{ 
              clear: 'both',
              marginBottom: '20px',
              marginTop: '30px'
            }}>
              <p style={{
                fontSize: isDesktop ? '2rem' : '14px',
                lineHeight: '1.5',
                margin: 0
              }}>
                {autor?.bio_corta || ''}
              </p>
            </div>
          </ScrollReveal>
          
          {/* Visual artist specific section */}
          {isVisualArtist && (
            <ScrollReveal direction="up" delay={1200}>
              <div style={{
                marginTop: '30px',
                textAlign: 'center'
              }}>
                <div 
                  onClick={() => navigate(-1)}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    marginTop: '30px',
                    marginBottom: '30px',
                    cursor: 'pointer'
                  }}
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M19 12H5" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M12 19L5 12L12 5" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  <span style={{ marginTop: '5px', textTransform: 'uppercase', fontSize: '12px' }}>
                    Regresar
                  </span>
                </div>
              </div>
            </ScrollReveal>
          )}
        </div>
      </div>
    </ScrollReveal>
    
    {/* Only show poemario title and works if not a visual artist */}
    {!isVisualArtist && (
      <>
        <div style={{ 
          position: 'relative', 
          marginBottom: '40px',
          paddingTop: '30px' // Espacio para el título
        }}>
          <div style={{ 
            position: 'absolute', 
            top: 0, 
            left: 0, 
            width: '100%', 
            height: '100%', 
            zIndex: 0, // Para estar detrás de los elementos
            pointerEvents: 'none' // Para que no interfiera con clics
          }}>
            <InsectColony 
              insects={insects}
              count={35}
            />
          </div>

          {poemario && (
            <ScrollReveal direction="up">
              <h2 className="edition-title" style={{ 
                fontWeight: 'bold', 
                marginBottom: '30px', 
                textAlign: 'center',
                position: 'relative', // Para estar por encima de los insectos
                zIndex: 1 // Mayor que los insectos
              }}>
                SUS POEMAS
              </h2>
            </ScrollReveal>
          )}
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)', // Fixed to exactly 2 columns
            gap: '20px',
            marginBottom: '40px',
            padding: '0 20px', // Add horizontal padding
            maxWidth: '800px', // Set a maximum width
            margin: '20px auto', // Center the grid with automatic horizontal margins
            position: 'relative', // Para estar encima de los insectos
            zIndex: 1
          }}>
            {arrangedBooks.map((book, index) => {
              const sizeStyles = getBookSize(book.wordCount, book.sizeCategory);
              const titleStyles = getTitleStyles(sizeStyles);
              const isLargeBook = sizeStyles.isLarge;
              
              // For large books, ensure they start at the beginning of a row
              // by placing them in positions that align with the grid
              const gridPosition = {};
              if (isLargeBook) {
                gridPosition.gridColumn = '1 / span 2'; // Always span full width
              }
              
              return (
                <div 
        key={book.id}
        style={{
          ...gridPosition,
          // Esta es la clave: aplicar la posición del grid al contenedor externo
          gridColumn: isLargeBook ? '1 / span 2' : 'auto'
        }}
      >
        <ScrollReveal delay={200 + index * 100} direction="up">
          <Link 
            to={book.link} 
            style={{
              textDecoration: 'none', 
              color: 'inherit',
              display: 'block', // Asegura que el Link ocupe todo el espacio disponible
              height: '100%'
            }}
          >
            <div style={{
              position: 'relative',
              overflow: 'hidden',
              boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
              transition: 'transform 0.3s ease',
              height: sizeStyles.height,
              width: '100%', // Always use full width of grid cell
            }}>
              <img 
                src={book.cover} 
                alt={book.title} 
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover'
                }}
              />
                      
                      {isLargeBook ? (
                        // Centered title for large books
                        <div style={titleStyles}>
                          <h3>{book.title}</h3>
                        </div>
                      ) : (
                        // Standard top-aligned title for small/medium books
                        <div style={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          padding: '10px',
                          color: 'white',
                          textShadow: '1px 1px 3px rgba(0,0,0,0.7)',
                          width: '100%',
                          background: 'linear-gradient(to bottom, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0) 100%)'
                        }}>
                          <h4 style={titleStyles}>{book.title}</h4>
                        </div>
                      )}
                      
                      <div style={{
                        position: 'absolute',
                        bottom: '5px',
                        right: '5px',
                        fontSize: isDesktop ? '14px' : '8px',
                        color: 'white',
                        background: 'rgba(0,0,0,0.6)',
                        padding: '2px 5px',
                        borderRadius: '2px'
                      }}>
                        {book.wordCount} PALABRAS
                      </div>
                     </div>
                    </Link>
                  </ScrollReveal>
                </div>
              );
            })}
          </div>
        </div>
      </>
    )}
    
    {/* CSS necesario para las animaciones */}
    <style jsx>{`
      .scroll-reveal-container {
        overflow-x: hidden; /* Evitar desbordamiento horizontal durante animaciones */
      }
    `}</style>
  </div>
);
};

export default AuthorBio;