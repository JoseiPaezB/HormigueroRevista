import React, { useState, useEffect } from 'react';
import eventImage from '../../assets/images/evento1.png';
import portada from '../../assets/images/edicion1.png';
import bookCover1 from '../../assets/images/1res.png';
import bookCover2 from '../../assets/images/2res.png';
import bookCover3 from '../../assets/images/3res.png';
import bookCover4 from '../../assets/images/4res.png';
import bookCover5 from '../../assets/images/5res.png';
import { Link, useParams } from 'react-router-dom';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);


const AuthorBio = () => {
    const { id } = useParams(); // Get author ID from URL if available
    const [autor, setAutor] = useState(null);
    const [poemas, setPoemas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [revista, setRevista] = useState(null);
    const [poemario, setPoemario] = useState(null);


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
          const authorId = id || 5; // Using ID 5 from our sample data (Alejandra Pizarnik)
          
          // 1. Fetch autor (author) data
          const { data: autorData, error: autorError } = await supabase
            .from('autor')
            .select('*')
            .eq('id', authorId)
            .single();

          if (autorError) throw autorError;
          setAutor(autorData);

          // 2. Fetch revista for the header background
          const { data: revistaData, error: revistaError } = await supabase
            .from('revista')
            .select('*')
            .eq('id', 1)
            .single();

          if (revistaError) throw revistaError;
          setRevista(revistaData);

          // 3. Fetch poems by this author
          const { data: poemasData, error: poemasError } = await supabase
            .from('poema')
            .select('*')
            .eq('id_autor', authorId);

          if (poemasError) throw poemasError;
          
          const { data: poemarioData, error: poemarioError } = await supabase
            .from('poemario')
            .select('*')
            .eq('id_autor', authorId)
            .single();
          
            if (poemarioError) throw poemarioError;
            setPoemario(poemarioData);
          // Transform poemas to match the books format and count words
          const transformedPoemas = poemasData.map((poema, index) => {
            // Count words in the poem text
            const wordCount = countWords(poema.texto);
            
            return {
              id: poema.id,
              title: poema.titulo,
              author: autorData.nombre,
              cover: poema.portada, // Cycle through available covers
              link: `/poema/${poema.id}`,
              wordCount: wordCount || Math.floor(Math.random() * 150) + 20 // Real word count or random if text is missing
            };
          });

          setPoemas(transformedPoemas);
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
          height: '180px', 
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
          width: '80%',
          textTransform: 'uppercase',
        };
      }
      
      return {
        margin: '0 0 5px 0', 
        fontSize: '14px',
        fontWeight: 'bold',
        letterSpacing: '0.5px'
      };
    };

    if (loading) return <div>Loading...</div>;
    if (error) return <div>{error}</div>;

    // Format author name for display
    const authorName = autor?.nombre?.toUpperCase() || "ALEJANDRA PIZARNIK";
    
    // Generate first letter for emphasized display
    const firstLetter = authorName.charAt(0);
    const restOfName = authorName.substring(1);

    return (
      <div className="bio-container">
        <div className="cover-image image_2" style={{
          backgroundImage: `url(${poemario?.portada || portada})`,
          height: '30vh'
        }}>
        </div>
        
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          maxWidth: '400px',
          overflow: 'hidden',
          fontFamily: 'JetBrains Mono, monospace',
          margin: '20px auto'
        }}>
          
          {/* Content section */}
          <div style={{
            padding: '20px',
            backgroundColor: 'white',
            position: 'relative'
          }}>
            {/* First paragraph with first letter emphasized */}
            <p style={{ 
              margin: '0 0 15px 0',
              fontWeight: 'normal',
              fontSize: '14px',
              lineHeight: '1.5'
            }}>
              <span style={{ 
                fontSize: '28px', 
                fontWeight: 'bold',
                float: 'left',
                marginRight: '2px',
                lineHeight: '1'
              }}>{firstLetter}</span>
              {restOfName} {autor?.semblanza || 'nació en Avellaneda en 1936, y desde entonces cargó con una lengua que le dolía. Escritora, traductora, habitante de los márgenes. En su voz convivían el murmullo de la muerte, la inocencia herida y una lucidez que quemaba. Su poesía no fue una evasión: fue una condena a una salvación. Murió en 1972, a los 36 años, pero dejó un temblor que todavía no acaba.'}
            </p>
            
            {/* Second paragraph with image */}
            <div style={{ 
              display: 'flex', 
              gap: '15px',
              marginBottom: '20px' 
            }}>
              {/* Second paragraph text */}
              <p style={{
                fontSize: '14px',
                lineHeight: '1.5',
                margin: 0,
                flex: 1
              }}>
                En <i>Árbol de Diana</i>, su poemario más conocido, el lenguaje rompe la lógica y el tiempo. Escribe versos breves, fulgurantes, que se abren como cuchillas. El yo poético es una niña sin consuelo, una mujer que grita desde la habitación cerrada del alma.
              </p>
              
              {/* Author image */}
              <img 
                src={autor?.imagen || eventImage} 
                alt={autor?.nombre || "Author"} 
                style={{
                  width: '100px',
                  height: '140px',
                  objectFit: 'cover',
                  alignSelf: 'flex-start',
                  border: '1px solid #eee'
                }}
              />
            </div>
            
            {/* Footer signature */}
            <div style={{
              paddingTop: '12px',
              marginTop: '10px',
              textAlign: 'center',
              fontWeight: 'bold',
              fontSize: '14px'
            }}>
              
            </div>
          </div>
        </div>
        <h2 className="edition-title" style={{ fontWeight: 'bold', marginBottom: '30px', textAlign: 'center'}}>
            YO Y ANTES LA HORMIGA
          </h2>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)', // Fixed to exactly 2 columns
          gap: '20px',
          marginBottom: '40px',
          padding: '0 20px', // Add horizontal padding
          maxWidth: '800px', // Set a maximum width
          margin: '20px auto' // Center the grid with automatic horizontal margins
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
                <Link 
                  key={book.id} 
                  to={book.link} 
                  style={{
                    textDecoration: 'none', 
                    color: 'inherit',
                    ...gridPosition
                  }}
                >
                  <div style={{
                    position: 'relative',
                    overflow: 'hidden',
                    borderRadius: '4px',
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
                        <p style={{fontSize: '16px', margin: '5px 0 0 0', textTransform: 'uppercase'}}>{book.author}</p>
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
                        <p style={{margin: 0, fontSize: '10px'}}>{book.author}</p>
                      </div>
                    )}
                    
                    <div style={{
                      position: 'absolute',
                      bottom: '5px',
                      right: '5px',
                      fontSize: '8px',
                      color: 'white',
                      background: 'rgba(0,0,0,0.6)',
                      padding: '2px 5px',
                      borderRadius: '2px'
                    }}>
                      {book.wordCount} PALABRAS
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
      </div>
    );
};

export default AuthorBio;