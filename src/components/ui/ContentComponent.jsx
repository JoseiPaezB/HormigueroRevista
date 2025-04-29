import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createClient } from '@supabase/supabase-js';

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

  // Fetch data on component mount
  useEffect(() => {
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
  }, [contentType]);
  
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

  // Function to determine book size based on poem count
  const getBookSize = (poemCount, sizeCategory) => {
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
      fontWeight: 'bold',
      letterSpacing: '0.5px'
    };
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className="edition-container">
      {/* Cover image */}
      <div className="cover-image image_2" style={{
        backgroundImage: `url(${content?.imagen})`,
        height: '30vh'
      }}>
      </div>
      
      {/* Article preview section */}
      <div className="article-preview" style={{marginTop: '0rem'}}>
        <div className="article-date" style={{color:'#fff'}}>{formatDate(revista?.fecha)}</div>
        <h2 className="edition-title" style={{ fontWeight: 'bold', marginBottom: '30px' }}>
          {displayTitle.toUpperCase()}
        </h2>
        <div className="contributors-list" style={{marginTop: '-1.5rem', marginBottom: '2rem'}}>
          {contributors.length > 0 ? (
            contributors.map((contributor, index) => (
              <p key={index} style={{marginBottom: '10px'}}>{contributor.toUpperCase()}</p>
            ))
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
        <h3 className="title" style={{ fontWeight: 'bold' }}>
          SINTESIS
        </h3>
        <div className="article-content" style={{marginBottom: '3rem'}}>
          <p style={{ 
              textIndent: '1em',
              maxWidth: '27em',
              lineHeight: '1.5',
              hyphens: 'auto',
              textAlign: 'justify',
              color: 'white',
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
            const titleStyles = getTitleStyles(sizeStyles);
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
                      <h3>{book.title.toUpperCase()}</h3>
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
                      <h4 style={titleStyles}>{book.title.toUpperCase()}</h4>
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
                    + {book.poemCount} POEMAS
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ContentComponent;