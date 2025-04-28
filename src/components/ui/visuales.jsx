import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import FloatingHormiguearButton from './hormiguearButton';
import { Link} from 'react-router-dom';

// Initialize Supabase client
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const Visuales = () => {
  const [revista, setRevista] = useState(null);
  const [visuales, setVisuales] = useState([]);
  const [allVisualPieces, setAllVisualPieces] = useState([]); // Store all visual pieces
  const [visualesSection, setVisualesSection] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPiece, setSelectedPiece] = useState(null);
  const [showPopup, setShowPopup] = useState(false);
  const [contributors, setContributors] = useState([]);
  const [showHormiguearModal, setShowHormiguearModal] = useState(false);
  const [userName, setUserName] = useState('');
  const [hormiguearSuccess, setHormiguearSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // New state for authors and selected author - initialize as null
  const [authors, setAuthors] = useState([]);
  const [selectedAuthor, setSelectedAuthor] = useState(null);

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
  
        // 2. Fetch visuales section information  
        const { data: visualesSectionData, error: sectionError } = await supabase
          .from('creaciones')
          .select('*')
          .eq('id_revista', 1)
          .eq('tipo', 'visuales')
          .single();
  
        if (sectionError) throw sectionError;
        setVisualesSection(visualesSectionData);
  
        // Parse colaboradores if they exist
        if (visualesSectionData?.colaboradores) {
          const colaboradoresList = visualesSectionData.colaboradores
            .split(',')
            .map(name => name.trim());
          setContributors(colaboradoresList);
        }
  
        // 3. Fetch all authors who have visual pieces
        const { data: authorsData, error: authorsError } = await supabase
          .from('autor')
          .select('id, nombre, semblanza')
          .order('nombre')
          .eq('tipo_creacion', 'visuales');
  
        if (authorsError) throw authorsError;
        setAuthors(authorsData);
        
        // Do NOT set default author
        // Remove the code that sets the first author as default
  
        // 4. Fetch all visual pieces with author info
        const { data: visualPieces, error: visualesError } = await supabase
          .from('visuales')
          .select('*, autor(id, nombre)')
          .eq('id_revista', 1);
  
        if (visualesError) throw visualesError;
        
        // Store all visual pieces
        setAllVisualPieces(visualPieces);
        
        // Don't process any pieces initially, leave visuales as empty array
        // This will ensure no content appears until an author is selected
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load visual pieces');
        setLoading(false);
      }
    };
  
    fetchData();
  }, []);

  // Handle author change
  const handleAuthorChange = (event) => {
    const authorId = event.target.value;
    
    if (authorId === "") {
      // Reset to default state (no author selected)
      setSelectedAuthor(null);
      setVisuales([]);
      return;
    }
    
    // Otherwise, process the selected author
    const parsedId = parseInt(authorId);
    const author = authors.find(a => a.id === parsedId);
    
    setSelectedAuthor(author);
    
    // Filter visual pieces by selected author
    const filteredPieces = allVisualPieces.filter(
      piece => piece.id_autor === parsedId
    );
    
    // Process the filtered pieces
    const processedPieces = filteredPieces.map((piece, index) => {
      const gridProps = getRandomGridProperties(index, filteredPieces.length);
      return {
        ...piece,
        ...gridProps,
        margin: `${Math.floor(Math.random() * 15)}px`,
        order: index
      };
    });
    
    setVisuales(processedPieces);
  };

  // Enhanced function to assign varied grid properties
  const getRandomGridProperties = (index, totalItems) => {
    // Define size variations (for grid column/row spanning)
    const sizeVariations = [
      // Small - default size
      { 
        colSpan: 1, 
        rowSpan: 1, 
        width: '100%',
        height: '100%',
        size: 'small',
        aspectRatio: Math.random() > 0.5 ? '3/4' : '4/3'  // Mix of portrait and landscape
      },
      // Medium - spans 1 column, 2 rows OR 2 columns, 1 row
      { 
        colSpan: Math.random() > 0.5 ? 1 : 2, 
        rowSpan: Math.random() > 0.5 ? 2 : 1,
        width: '100%',
        height: '100%', 
        size: 'medium',
        aspectRatio: Math.random() > 0.5 ? '3/4' : '4/3'
      },
      // Large - spans 2 columns and 2 rows
      { 
        colSpan: 2, 
        rowSpan: 2,
        width: '100%',
        height: '100%', 
        size: 'large',
        aspectRatio: '1/1'  // Square for large items
      }
    ];
    
    // Probability distribution to determine size category
    // Make large items rarer, small more common
    let sizeIndex;
    const random = Math.random();
    
    if (random < 0.6) {
      sizeIndex = 0; // 60% small
    } else if (random < 0.9) {
      sizeIndex = 1; // 30% medium
    } else {
      sizeIndex = 2; // 10% large
    }
    
    // Special case: Make first image potentially larger to create focal point
    if (index === 0 && Math.random() > 0.5) {
      sizeIndex = 2; // 50% chance first image is large
    }
    
    // Special case: Make sure we have at least one large image
    if (index === totalItems - 1 && totalItems > 3 && 
        !visuales.some(item => item.size === 'large')) {
      sizeIndex = 2; // Force last image to be large if no large images yet
    }
    
    return sizeVariations[sizeIndex];
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

  const handlePieceClick = (piece) => {
    setSelectedPiece(piece);
    setShowPopup(true);
    // Prevent scrolling when popup is shown
    document.body.style.overflow = 'hidden';
  };

  const closePopup = () => {
    setShowPopup(false);
    setSelectedPiece(null);
    // Restore scrolling
    document.body.style.overflow = 'auto';
  };
  
  const handleHormiguear = async () => {
    if (!selectedPiece) return;
    setShowHormiguearModal(true);
  };

  // Function to submit the hormiguear for visual pieces
  const submitHormiguear = async (e) => {
    e.preventDefault();
    
    if (!userName.trim()) {
      // Show an error message if the name is empty
      alert('Por favor, ingresa tu nombre para continuar.');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // First, get the current hormiguear count for the selected visual piece
      const { data: currentPiece, error: fetchError } = await supabase
        .from('visuales')
        .select('hormigueos, nombre_pieza, id_revista, autor(nombre, formspree_url),id_poemario')
        .eq('id', selectedPiece.id)
        .single();
      
      if (fetchError) throw fetchError;
      
      // Calculate new count (default to 1 if it doesn't exist yet)
      const newCount = (currentPiece.hormigueos || 0) + 1;
      
      // Update the count in the database
      const { error: updateError } = await supabase
        .from('visuales')
        .update({ hormigueos: newCount })
        .eq('id', selectedPiece.id);
      
      if (updateError) throw updateError;
      
      // If author has a formspree_url, submit to Formspree
      if (currentPiece.autor?.formspree_url) {
        try {
          const formspreeResponse = await fetch(currentPiece.autor.formspree_url, {
            method: 'POST',
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              mensaje_nombre: userName,
              message: `¡Nuevo Hormigueo en la obra visual "${currentPiece.nombre_pieza}" de la revista #${currentPiece.id_revista}`,
              obra: currentPiece.nombre_pieza,
              artista: currentPiece.autor?.nombre || 'Artista desconocido',
              fecha: new Date().toLocaleString(),
              poemario: currentPiece.id_poemario || 'No disponible'
            })
          });
          
          if (!formspreeResponse.ok) {
            console.error('Formspree error:', formspreeResponse);
          }
        } catch (formspreeError) {
          // Log the error but don't fail the whole process
          console.error('Error submitting to Formspree:', formspreeError);
        }
      }
      
      // Show success message
      setHormiguearSuccess(true);
      
      // Update local state to reflect the new hormigueo count
      setSelectedPiece({
        ...selectedPiece,
        hormigueos: newCount
      });
      
      // Also update in the visuales array
      setVisuales(visuales.map(piece => 
        piece.id === selectedPiece.id 
          ? { ...piece, hormigueos: newCount } 
          : piece
      ));
      
      // Also update in the allVisualPieces array
      setAllVisualPieces(allVisualPieces.map(piece => 
        piece.id === selectedPiece.id 
          ? { ...piece, hormigueos: newCount } 
          : piece
      ));
      
      // Close modal after 2 seconds
      setTimeout(() => {
        setShowHormiguearModal(false);
        setHormiguearSuccess(false);
        setUserName('');
      }, 2000);
      
    } catch (error) {
      console.error('Error updating hormiguear count:', error);
      alert('No se pudo registrar su hormigueo. Por favor, intente de nuevo.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Add close modal function
  const closeModal = () => {
    setShowHormiguearModal(false);
    setHormiguearSuccess(false);
    setUserName('');
  };

  if (loading) return <div>Loading visual pieces...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className="visuales-container">
      {/* Cover image */}
      {visualesSection?.imagen && (
        <div className="cover-image image_2" style={{
          backgroundImage: `url(${visualesSection.imagen})`,
          height: '30vh'
        }}>
        </div>
      )}
      
      <div className="visuales-content" style={{ padding: '0 20px' }}>
        <div className="article-date" style={{ textAlign: 'center', margin: '20px 0' }}>
          {formatDate(revista?.fecha)}
        </div>
        
        <h2 className="visuales-title" style={{ 
          fontWeight: 'bold', 
          textAlign: 'center',
          margin: '30px 0',
          textTransform: 'uppercase'
        }}>
          VISUALES
        </h2>
        
        {/* Author selection dropdown */}
        <div style={{
            maxWidth: '400px',
            margin: '0 auto 30px',
            textAlign: 'center'
          }}>
            <label htmlFor="author-select" style={{
              display: 'block',
              marginBottom: '10px',
              fontWeight: 'bold',
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: '14px'
            }}>
              SELECCIONAR ARTISTA
            </label>
            <select
              id="author-select"
              value={selectedAuthor ? selectedAuthor.id : ""}
              onChange={handleAuthorChange}
              style={{
                padding: '8px 12px',
                backgroundColor: 'white',
                fontFamily: 'JetBrains Mono, monospace',
                fontSize: '14px',
                cursor: 'pointer',
                background: '#fff',
                border: 'none',
              }}
            >
              <option value="">Todos los artistas</option>
              {authors.map(author => (
                <option key={author.id} value={author.id}>
                  {author.nombre}
                </option>
              ))}
            </select>
          </div>

        {/* Conditional rendering based on whether an author is selected */}
        {selectedAuthor ? (
          <>
            {/* Show selected author info if available */}
            <div style={{
              maxWidth: '700px',
              margin: '0 auto 30px',
              textAlign: 'center'
            }}>
              <h3 style={{
                fontWeight: 'bold',
                margin: '0 0 15px 0',
                fontFamily: 'JetBrains Mono, monospace'
              }}>
                {selectedAuthor.nombre.toUpperCase()}
              </h3>
              {selectedAuthor.semblanza && (
                <>
                  <p>{selectedAuthor.semblanza.slice(0, Math.floor(selectedAuthor.semblanza.length / 2))}</p>
                  <Link to={`/poemario/${selectedAuthor.id}`}>Leer más...</Link>
                </>
              )}
            </div>
            
            {/* Enhanced Collage Layout with CSS Grid - only show when author is selected */}
            <div className="collage-container" style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
              gridAutoRows: 'minmax(150px, auto)',
              gap: '20px',
              padding: '20px',
              maxWidth: '1200px',
              margin: '0 auto'
            }}>
              {visuales.length > 0 ? (
                visuales.map((piece, index) => (
                  <div 
                    key={piece.id || index}
                    className="collage-item"
                    onClick={() => handlePieceClick(piece)}
                    style={{
                      gridColumn: `span ${piece.colSpan}`,
                      gridRow: `span ${piece.rowSpan}`,
                      margin: piece.margin,
                      overflow: 'hidden',
                      boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
                      cursor: 'pointer',
                      transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                      aspectRatio: piece.aspectRatio,
                      transform: 'none',
                      position: 'relative',
                      zIndex: 0
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.transform = 'scale(1.05)';
                      e.currentTarget.style.boxShadow = '0 8px 16px rgba(0,0,0,0.2)';
                      e.currentTarget.style.zIndex = 1;
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.transform = 'none';
                      e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.1)';
                      e.currentTarget.style.zIndex = 0;
                    }}
                  >
                    <img 
                      src={piece.pieza || `https://source.unsplash.com/random/300x${200 + index}?art`} 
                      alt={piece.nombre_pieza || 'Visual piece'}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        display: 'block'
                      }}
                    />
                    <div className="hover-overlay" style={{
                      position: 'absolute',
                      bottom: 0,
                      left: 0,
                      right: 0,
                      background: 'linear-gradient(transparent, rgba(0,0,0,0.7))',
                      padding: '15px 10px 10px',
                      transform: 'translateY(100%)',
                      transition: 'transform 0.3s ease',
                      color: 'white',
                      pointerEvents: 'none'
                    }}>
                      <h4 style={{ margin: '0 0 5px', fontSize: '16px' }}>
                        {piece.nombre_pieza || 'Untitled'}
                      </h4>
                      <p style={{ margin: 0, fontSize: '12px', opacity: 0.8 }}>
                        {piece.autor?.nombre || 'Unknown artist'}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p style={{ gridColumn: 'span 2', textAlign: 'center', padding: '40px 0' }}>
                  No hay obras visuales disponibles para este artista.
                </p>
              )}
            </div>
          </>
        ) : (
          // Show general section info when no author is selected
          <>
            {/* Contributors section */}
            {contributors.length > 0 && (
              <div className="contributors-list" style={{
                textAlign: 'center', 
                marginBottom: '30px'
              }}>
                {contributors.map((contributor, index) => (
                  <p key={index} style={{marginBottom: '10px'}}>{contributor.toUpperCase()}</p>
                ))}
              </div>
            )}
            
            {/* Synthesis/Description */}
            {visualesSection?.sintesis && (
              <div style={{ maxWidth: '700px', margin: '0 auto 40px' }}>
                <h3 className="title" style={{ 
                  fontWeight: 'bold',
                  textAlign: 'center',
                  marginBottom: '20px'
                }}>
                  SINTESIS
                </h3>
                <p style={{ 
                  textIndent: '1em',
                  lineHeight: '1.5',
                  hyphens: 'auto',
                  textAlign: 'justify',
                  fontSize: '12px',
                }}>
                  {visualesSection.sintesis}
                </p>
              </div>
            )}
            
            {/* Message to select an author */}
            <div style={{ 
              textAlign: 'center', 
              padding: '40px 0',
              color: '#666',
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: '14px',
              maxWidth: '600px',
              margin: '0 auto'
            }}>
              Por favor, selecciona un artista para ver sus obras visuales.
            </div>
          </>
        )}
      </div>

      {/* Popup for detailed view */}
      {showPopup && selectedPiece && (
        <div className="popup-overlay" 
          onClick={closePopup}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.8)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1000
          }}
        >
          <div 
            className="popup-content" 
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: '#fff',
              borderRadius: '8px',
              width: '90%',
              maxWidth: '1000px',
              maxHeight: '90vh',
              overflow: 'auto',
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            <button
              onClick={closePopup}
              style={{
                position: 'absolute',
                top: '10px',
                right: '10px',
                background: 'none',
                border: 'none',
                fontSize: '18px',
                cursor: 'pointer',
                color: 'white',
              }}
            >
              ✕
            </button>

            
            <div className="popup-image-container" style={{
               height: '500px',  // Fixed height
               maxWidth: '800px', // Maximum width
               margin: '0 auto',  // Center horizontally
               overflow: 'hidden',
               display: 'flex',
               justifyContent: 'center',
               alignItems: 'center',
               backgroundColor: '#f8f8f8', // Light background to show image boundaries
               border: '1px solid #eee'
            }}>
              <img 
                src={selectedPiece.pieza || `https://source.unsplash.com/random/800x600?art`}
                alt={selectedPiece.nombre_pieza || 'Visual piece'} 
                style={{
                  maxWidth: '100%',
                  maxHeight: '100%',
                  objectFit: 'contain',
                  boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
                }}
              />
            </div>
            
            <div className="popup-details" style={{
              padding: '20px'
            }}>
              <h2 style={{ 
                marginTop: 0, 
                marginBottom: '10px',
                fontWeight: 'bold'
              }}>
                {selectedPiece.nombre_pieza || 'Untitled'}
              </h2>
              
              <h4 style={{ 
                color: '#666',
                marginBottom: '20px',
                fontWeight: 'normal'
              }}>
                {selectedPiece.autor?.nombre || 'Unknown artist'}
              </h4>
              
              <div className="piece-description">
                <p style={{ textAlign: 'justify' }}>
                  {selectedPiece.descripcion_pieza || 
                   'No description available for this piece.'}
                </p>
              </div>
              
              <FloatingHormiguearButton 
                handleHormiguear={handleHormiguear}
                offsetBeforeStop={150}
              />
            </div>
          </div>
        </div>
      )}
      
      {/* Hormiguear Modal */}
      {showHormiguearModal && (
        <div onClick={closeModal} style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000
        }}>
          <div onClick={(e) => e.stopPropagation()} style={{
            backgroundColor: 'white',
            padding: '20px',
            borderRadius: '8px',
            width: '300px',
            maxWidth: '90%',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
            position: 'relative'
          }}>
            {/* Close button */}
            <button
              onClick={closeModal}
              style={{
                position: 'absolute',
                top: '10px',
                right: '10px',
                background: 'none',
                border: 'none',
                fontSize: '18px',
                cursor: 'pointer',
                color: 'black',
              }}
            >
              ✕
            </button>
            
            {!hormiguearSuccess ? (
              <form onSubmit={submitHormiguear}>
                <h3 style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  marginBottom: '20px',
                  fontFamily: 'JetBrains Mono, monospace',
                  fontSize: '16px'
                  }}>
                  {/* Replace with your actual image source */}
                  <span style={{ fontSize: '24px' }}>🐜</span>
                  HORMIGUEAR OBRA VISUAL
                </h3>
                <p style={{
                  marginBottom: '15px',
                  textAlign: 'center',
                  fontSize: '14px'
                }}>
                  Por favor, ingresa tu nombre para hormiguear esta obra visual
                </p>
                <input
                  type="text"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  placeholder="Tu nombre"
                  style={{
                      width: '95%',
                      padding: '8px',
                      borderRadius: '4px',
                      border: '1px solid #aaa',
                      marginBottom: '15px',
                      fontSize: '14px',
                      fontFamily: 'JetBrains Mono, monospace',
                      outline: 'none',
                      transition: 'border 0.2s, box-shadow 0.2s'
                  }}
                  
                  />
                <div style={{
                  display: 'flex',
                  justifyContent: 'center'
                }}>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    style={{
                      padding: '8px 16px',
                      backgroundColor: '#000',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: isSubmitting ? 'not-allowed' : 'pointer',
                      fontFamily: 'JetBrains Mono, monospace',
                      fontSize: '14px',
                      opacity: isSubmitting ? 0.7 : 1
                    }}
                  >
                    {isSubmitting ? 'ENVIANDO...' : 'ENVIAR'}
                  </button>
                </div>
              </form>
            ) : (
              // Modified success screen
              <div style={{
                textAlign: 'center',
                padding: '20px 0'
              }}>
                <h3 style={{
                  marginBottom: '15px',
                  fontFamily: 'JetBrains Mono, monospace',
                  fontSize: '20px',
                  fontWeight: 'bold'
                }}>
                  GRACIAS
                </h3>
                <p style={{
                  fontFamily: 'JetBrains Mono, monospace',
                  fontSize: '14px',
                  marginBottom: '10px'
                }}>
                  POR HABER HORMIGUEADO<br />
                  ESTA OBRA VISUAL
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Visuales;