import React from 'react';
import portada from '../../assets/images/edicion1.png';
import {Link} from 'react-router-dom';

// Import your book cover images
import bookCover1 from '../../assets/images/1res.png';
import bookCover2 from '../../assets/images/2res.png';
import bookCover3 from '../../assets/images/3res.png';
import bookCover4 from '../../assets/images/4res.png';
import bookCover5 from '../../assets/images/5res.png';

const Creaciones = () => {
  // Book data with poem counts
  const books = [
    {
      id: 1,
      title: "LA BANCA DE UN PARQUE",
      author: "OCTAVIO PAZ",
      cover: bookCover1,
      link: "/poemario",
      poemCount: 4 // Small
    },
    {
      id: 2,
      title: "ODISEA",
      author: "SYLVIA PLATH",
      cover: bookCover2,
      link: "/book/2",
      poemCount: 6 // Medium
    },
    {
      id: 3,
      title: "DEJOS DE CUCARACHAS",
      author: "CHARLES BAUDELAIRE",
      cover: bookCover3,
      link: "/book/3",
      poemCount: 9 // Large
    },
    {
      id: 4,
      title: "MI VIDA EN LA MANCHA",
      author: "FEDERICO GARCÍA LORCA",
      cover: bookCover4,
      link: "/book/4",
      poemCount: 3 // Small
    },
    {
      id: 5,
      title: "RAICES SECAS",
      author: "EMILY DICKINSON",
      cover: bookCover5,
      link: "/book/5",
      poemCount: 8 // Large
    }, 
    {
      id: 6,
      title: "LA BANCA DE UN PARQUE",
      author: "OCTAVIO PAZ",
      cover: bookCover1,
      link: "/book/1",
      poemCount: 6 // Small
    },
    {
      id: 7,
      title: "LA BANCA DE UN PARQUE",
      author: "OCTAVIO PAZ",
      cover: bookCover1,
      link: "/book/1",
      poemCount: 4 // Small
    },
    {
      id: 8,
      title: "LA BANCA DE UN PARQUE",
      author: "OCTAVIO PAZ",
      cover: bookCover1,
      link: "/book/1",
      poemCount: 6 // Small
    },
    {
      id: 9,
      title: "LA BANCA DE UN PARQUE",
      author: "OCTAVIO PAZ",
      cover: bookCover1,
      link: "/book/1",
      poemCount: 11 // Small
    },
    {
      id: 10,
      title: "LA BANCA DE UN PARQUE",
      author: "OCTAVIO PAZ",
      cover: bookCover1,
      link: "/book/1",
      poemCount: 1 // Small
    },
    {
      id: 11,
      title: "LA BANCA DE UN PARQUE",
      author: "OCTAVIO PAZ",
      cover: bookCover1,
      link: "/book/1",
      poemCount: 6 // Small
    }
  ];

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
  const arrangedBooks = arrangeBooks(books);

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
      fontSize: '14px',
      fontWeight: 'bold',
      letterSpacing: '0.5px'
    };
  };

  return (
    <div className="edition-container">
      {/* Green gradient cover image */}
      <div className="cover-image image_2" style={{
        backgroundImage: `url(${portada})`,
        height: '30vh'
      }}>
      </div>
      
      {/* Article preview section */}
      <div className="article-preview">
        <div className="article-date">01/08/25</div>
        <h2 className="edition-title" style={{ fontWeight: 'bold', marginBottom: '30px' }}>
          CREACIONES
        </h2>
        <div className="contributors-list" style={{marginTop: '-1.5rem', marginBottom: '2rem'}}>
        <p style={{marginBottom: '10px'}}>JOSÉ NERUDA – "Veinte poemas de amor y una canción desesperada"</p>
        <p style={{marginBottom: '10px'}}>FEDERICO GARCÍA LORCA – "Romancero gitano"</p>
        <p style={{marginBottom: '10px'}}>EMILY DICKINSON – "Poems by Emily Dickinson"</p>
        <p style={{marginBottom: '10px'}}>GABRIEL GARCÍA MÁRQUEZ – "Obra poética completa"</p>
        <p style={{marginBottom: '10px'}}>OCTAVIO PAZ – "Piedra de sol"</p>
        <p style={{marginBottom: '10px'}}>SYLVIA PLATH – "Ariel"</p>
        <p style={{marginBottom: '10px'}}>JORGE LUIS BORGES – "Fervor de Buenos Aires"</p>
        <p style={{marginBottom: '10px'}}>GABRIELA MISTRAL – "Desolación"</p>
        <p style={{marginBottom: '10px'}}>WALT WHITMAN – "Leaves of Grass"</p>
        <p style={{marginBottom: '10px'}}>ALEJANDRA PIZARNIK – "Extracción de la piedra de locura"</p>
</div>
          <h3 className="title" style={{ fontWeight: 'bold' }}>
          SINTESIS
        </h3>
        <div className="article-content" style={{marginBottom: '3rem'}}>
        <p style={{ 
            textIndent: '1em',
            maxWidth: '27em',  // This controls line width
            lineHeight: '1.5', // Improves readability
            hyphens: 'auto',   // Enables hyphenation
            textAlign: 'justify' // Makes text edges align on both sides
        }}>
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Architecto consectetur vitae possimus eos. Vel impedit sapiente, aliquam blanditiis accusamus ea modi veniam esse quod atque in sed quidem placeat! Ipsam neque dicta repellat nesciunt, quisquam amet quidem magni provident mollitia laudantium assumenda porro esse soluta praesentium consequuntur nemo nulla repudiandae fugit quis quasi iusto ut at deserunt itaque! Minus tenetur culpa atque ullam quibusdam eaque. Quia nostrum eligendi magni placeat velit vitae! Veniam dolor porro sed aut tempora, repellat nisi officiis omnis molestias recusandae obcaecati, sapiente placeat neque unde, quasi illo inventore in quis iusto optio cupiditate! Perspiciatis culpa pariatur recusandae, totam, omnis aperiam aliquam, veniam accusamus tempora blanditiis impedit.
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
                  {/* Rest of your code for the book card remains the same */}
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

export default Creaciones;