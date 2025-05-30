import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import FloatingHormiguearButton from './hormiguearButton';
import { Link} from 'react-router-dom';
import hormigueroLogo2 from '../../assets/anticon2.svg'; // Adjust the path as necessary
import ScrollRevealItem from './scrollRevealItem';
import InsectColony from './InsectColony2';
import authorSvg from '../../assets/cinco2.svg'; // Adjust the path as necessary
import ant from '../../assets/uno.svg'; // Adjust the path as necessary
import ScrollReveal from './ScrollReveal'; // Ajusta la ruta según tu estructura
import { Helmet } from 'react-helmet-async';



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
  const getFirstName = (fullName) => {
  // Split the name by spaces
  const nameParts = fullName.split(' ');
  // Return just the first part
  return nameParts[0];
};
  const insects = [
      
      {
        src: ant,
        type: 'ant',
        size: 25
      },
       {
        src: ant,
        type: 'mosquito',
        size: 15
      },
      {
        src: ant,
        type: 'bee',
        size: 15
      }
       
      
    ];

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
          .select('id, nombre, semblanza, imagen')
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

  // Add this state at the top of your component
const [backgroundImage, setBackgroundImage] = useState('');

// Add this useEffect to fetch the background image
useEffect(() => {
  const fetchBackgroundImage = async () => {
    try {
      const { data, error } = await supabase
        .from('creaciones')
        .select('imagen')
        .eq('tipo', 'visuales') // or whatever identifies the visuales section
        .single();
      
      if (error) throw error;
      
      if (data && data.imagen) {
        setBackgroundImage(data.imagen);
      }
    } catch (error) {
      console.error('Error fetching background image:', error);
    }
  };

  fetchBackgroundImage();
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
      // Medium - spans 1 column, 2 rows OR 2 columns, 1 row
      
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
    
    
    sizeIndex = 0; // 60% small
    
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
      }else{
        console.log('No Formspree URL provided for this author.');
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
  const isDesktop = window.innerWidth > 768;

    const getAllWorksNames = () => {
    if (!allVisualPieces.length) return '';
    
    const worksNames = allVisualPieces
      .map(piece => piece.nombre_pieza)
      .filter(name => name) // Filtrar nombres vacíos
      .slice(0, 10) // Máximo 10 obras para no hacer muy largo
      .join(', ');
    
    return worksNames;
  };

  // Función para obtener nombres de autores
  const getAuthorsNames = () => {
    if (!authors.length) return '';
    
    return authors
      .map(author => author.nombre)
      .join(', ');
  };

  // Función para obtener extracto de semblanzas
  const getSemblanzasExcerpt = () => {
    if (!authors.length) return '';
    
    const semblanzas = authors
      .map(author => author.semblanza)
      .filter(semblanza => semblanza)
      .join(' ');
    
    return semblanzas.length > 200 
      ? semblanzas.substring(0, 200) + '...'
      : semblanzas;
  };


  return (
    <>
      <Helmet>
        <title>A Ojo de Hormiga - Obras Visuales | Hormiguero de Poemas</title>
        <meta name="description" content={
          authors.length > 0
            ? `Obras visuales en Hormiguero de Poemas. Artistas: ${getAuthorsNames()}. ${getSemblanzasExcerpt()}`
            : "Descubre las obras visuales de nuestros artistas en A Ojo de Hormiga - Hormiguero de Poemas"
        } />
        <meta name="keywords" content={`visuales, arte visual, obras, ${getAuthorsNames()}, hormiguero de poemas, a ojo de hormiga, ${getAllWorksNames()}`} />
        
        {/* Open Graph */}
        <meta property="og:title" content="A Ojo de Hormiga - Obras Visuales | Hormiguero de Poemas" />
        <meta property="og:description" content={
          authors.length > 0
            ? `Galería de obras visuales con ${authors.length} artista${authors.length > 1 ? 's' : ''}: ${getAuthorsNames()}`
            : "Galería de obras visuales en Hormiguero de Poemas"
        } />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="http://localhost:3000/visuales" />
        <meta property="og:image" content={
          backgroundImage || 
          (authors.length > 0 && authors[0].imagen) || 
          (allVisualPieces.length > 0 && allVisualPieces[0].pieza) || 
          '/default-visuales.jpg'
        } />
        <meta property="og:image:alt" content="A Ojo de Hormiga - Obras Visuales" />
        
        {/* Específico para galería */}
        <meta property="og:image:type" content="image/jpeg" />
        <meta name="theme-color" content="#000000" />
        
        {/* Twitter Cards */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="A Ojo de Hormiga - Obras Visuales" />
        <meta name="twitter:description" content={
          allVisualPieces.length > 0
            ? `${allVisualPieces.length} obra${allVisualPieces.length > 1 ? 's' : ''} visual${allVisualPieces.length > 1 ? 'es' : ''} de ${authors.length} artista${authors.length > 1 ? 's' : ''} en Hormiguero de Poemas`
            : "Galería de obras visuales en Hormiguero de Poemas"
        } />
        <meta name="twitter:image" content={
          backgroundImage || 
          (allVisualPieces.length > 0 && allVisualPieces[0].pieza) || 
          '/default-visuales.jpg'
        } />
        
        {/* Schema.org para galería de arte */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "ImageGallery",
            "name": "A Ojo de Hormiga - Obras Visuales",
            "description": `Galería de obras visuales con ${authors.length} artistas`,
            "url": "http://localhost:3000/visuales",
            "publisher": {
              "@type": "Organization",
              "name": "Hormiguero de Poemas"
            },
            "image": backgroundImage || (allVisualPieces.length > 0 && allVisualPieces[0].pieza),
            "numberOfItems": allVisualPieces.length,
            "about": {
              "@type": "CreativeWork",
              "name": "Arte Visual Contemporáneo"
            }
          })}
        </script>
      </Helmet>
   <div className="visuales-container" style={{
    position: 'relative',
    minHeight: '100vh',
    color:'#fff'
  }}>
    {/* Background image overlay */}
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      backgroundImage: backgroundImage ? `url(${backgroundImage})` : 'none',
      backgroundSize: 'cover',
      backgroundPosition: 'center center',
      backgroundRepeat: 'no-repeat',
      zIndex: -1
    }} />

    <div className="visuales-content" style={{ 
      padding: '0 20px', 
      marginTop: '6rem',
      position: 'relative',
      zIndex: 1 
    }}>
      
      <ScrollReveal direction="right" delay={200}>
        <h2 className="visuales-title" style={{
          fontWeight: 'bold',
          textAlign: 'center',
          margin: '30px 0',
          textTransform: 'uppercase',
          fontSize: isDesktop ? '3rem' : '40px',
          textShadow: '2px 2px 4px rgba(0,0,0,0.5)' // Add text shadow for better readability
        }}>
          A OJO DE HORMIGA
        </h2>
      </ScrollReveal>
      
      {/* Regular sized ants */}
      <InsectColony 
        insects={insects}
        count={80}
      />

      {/* Show all authors with their works */}
      {authors.map(author => {
        // Filter visual pieces for this specific author
        const authorPieces = allVisualPieces.filter(
          piece => piece.id_autor === author.id
        );
        
        // Process the pieces for this author
        const processedPieces = authorPieces.map((piece, index) => {
          const gridProps = getRandomGridProperties(index, authorPieces.length);
          return {
            ...piece,
            ...gridProps,
            margin: `${Math.floor(Math.random() * 15)}px`,
            order: index
          };
        });

        return (
          <div key={author.id} style={{ 
            marginBottom: '80px',
            borderRadius: '8px',
            padding: '20px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',

          }}>
            {/* Author info section */}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '40px 0',
              padding: '20px',
            }}>
              {/* Author name */}
            

              {/* Split semblanza with image in between */}
              {(() => {
                // Split the semblanza text in half
                const words = author.semblanza ? author.semblanza.split(' ') : [];
                const midPoint = Math.floor(words.length / 2);
                const firstHalf = words.slice(0, midPoint).join(' ');
                const secondHalf = words.slice(midPoint).join(' ');

                return (
                  <>
                    {/* First half of semblanza */}
                    {firstHalf && (
                      <ScrollReveal direction="down" delay={500}>
                        <p style={{
                          width: isDesktop ? '70%' : '100%',
                          textAlign: 'justify',
                          fontSize: '14px',
                          margin: isDesktop ? '0 auto 20px auto' : '10px 0 20px 0',
                          lineHeight: '1.6'
                        }}>
                          {firstHalf}
                        </p>
                      </ScrollReveal>
                    )}
                    
                    {/* Author image section */}
                    {author.imagen && (
                      <ScrollReveal direction="up" delay={700}>
                        <div style={{
                          margin: '30px 0',
                          display: 'flex',
                          justifyContent: 'center'
                        }}>
                          <img 
                            src={author.imagen} 
                            alt={author.nombre} 
                            style={{
                              height: isDesktop ? '200px' : '150px',
                              width: 'auto',
                              maxWidth: isDesktop ? '100%' : '100%',
                              objectFit: 'cover',
                              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                            }}
                          />
                        </div>
                      </ScrollReveal>
                    )}

                    {/* Second half of semblanza */}
                    {secondHalf && (
                      <ScrollReveal direction="down" delay={900}>
                        <p style={{
                          width: isDesktop ? '70%' : '100%',
                          textAlign: 'justify',
                          fontSize: '14px',
                          margin: isDesktop ? '20px auto 0 auto' : '20px 0 0 0',
                          lineHeight: '1.6'
                        }}>
                          {secondHalf}
                        </p>
                      </ScrollReveal>
                    )}
                  </>
                );
              })()}
            </div>

              {/* Author's visual works */}
              <div className="angled-grid-container" style={{
                maxWidth: '1000px',
                margin: '0 auto',
                padding: '20px',
                position: 'relative'
              }}>
                {/* Rest of your existing code continues unchanged... */}
                {processedPieces.length > 0 ? (
                  processedPieces.map((piece, index) => (
                    <ScrollRevealItem 
                      key={piece.id || index}
                      index={index}
                      piece={piece}
                      handlePieceClick={handlePieceClick}
                      totalPieces={processedPieces.length}
                    />
                  ))
                ) : (
                  <p style={{ 
                    textAlign: 'center', 
                    padding: '20px 0',
                    fontStyle: 'italic',
                  }}>
                    No hay obras visuales disponibles para este artista.
                  </p>
                )}
              </div>
            </div>
          );
        })}
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
                fontSize: '16px'
                }}>
                {/* Replace with your actual image source */}
                <img 
                  src={hormigueroLogo2} 
                  alt="Hormiga" 
                  style={{ width:'30px', height: 'auto' }} 
                  />
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
                fontSize: '20px',
                fontWeight: 'bold'
              }}>
                GRACIAS
              </h3>
              <p style={{
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
  </>
);
};

export default Visuales;