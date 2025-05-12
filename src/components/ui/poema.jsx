import React, { useState, useEffect, useRef } from 'react';
import portada from '../../assets/images/edicion1.png';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { createClient } from '@supabase/supabase-js';
import hormigueroLogo from '../../assets/anticon.svg';
import FloatingHormiguearButton from './hormiguearButton'; // Import our new component
import hormigueroLogo2 from '../../assets/anticon2.svg'; // Make sure path is correct


// Initialize Supabase client
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);


const Poema = () => {
    const [isFocused, setIsFocused] = useState(false);

  const { id } = useParams(); // Get poem ID from URL
  const navigate = useNavigate();
  const [poema, setPoema] = useState(null);
  const [autor, setAutor] = useState(null);
  const [revista, setRevista] = useState(null);
  const [otrosPoemas, setOtrosPoemas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showHormiguearModal, setShowHormiguearModal] = useState(false);
  const [userName, setUserName] = useState('');
  const [hormiguearSuccess, setHormiguearSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  
  
  const masPoemasSectionRef = useRef(null);
  const articleContainerRef = useRef(null);

  // Fetch data on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Default poem ID if not provided in URL
        const poemId = id || 1;
        
        // 1. Fetch poem data
        const { data: poemaData, error: poemaError } = await supabase
          .from('poema')
          .select('*, id_autor, id_poemario')
          .eq('id', poemId)
          .single();

        if (poemaError) throw poemaError;
        setPoema(poemaData);
        
        // 2. Fetch author data based on the poem's author ID
        if (poemaData.id_autor) {
          const { data: autorData, error: autorError } = await supabase
            .from('autor')
            .select('*')
            .eq('id', poemaData.id_autor)
            .single();

          if (autorError) throw autorError;
          setAutor(autorData);
          
          // 3. Fetch other poems by the same author from the same poemario
          if (poemaData.id_poemario) {
            const { data: otrosPoemaData, error: otrosPoemaError } = await supabase
              .from('poema')
              .select('*')
              .eq('id_autor', poemaData.id_autor)
              .eq('id_poemario', poemaData.id_poemario)
              .neq('id', poemId) // Exclude current poem
              .limit(2); // Get only 2 poems for display
  
            if (otrosPoemaError) throw otrosPoemaError;
            setOtrosPoemas(otrosPoemaData);
          }
        }

        // 4. Fetch revista for header background
        const { data: revistaData, error: revistaError } = await supabase
          .from('revista')
          .select('*')
          .eq('id', 1)
          .single();

        if (revistaError) throw revistaError;
        setRevista(revistaData);
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching poem data:', err);
        setError('Failed to load poem');
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

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
  
  const handleHormiguear = async () => {
    setShowHormiguearModal(true);
  };

  // Function to submit the hormiguear
  const submitHormiguear = async (e) => {
    e.preventDefault();
    
    if (!userName.trim()) {
      // Show an error message if the name is empty
      alert('Por favor, ingresa tu nombre para continuar.');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // First, get the current hormiguear count
      const { data: currentPoem, error: fetchError } = await supabase
        .from('poema')
        .select('hormigueos, titulo, id_poemario, id_autor')
        .eq('id', id || 1)
        .single();
      
      if (fetchError) throw fetchError;
      
      // Get poemario title
      const { data: poemarioData, error: poemarioError } = await supabase
        .from('poemario')
        .select('titulo')
        .eq('id', currentPoem.id_poemario)
        .single();
        
      if (poemarioError && poemarioError.code !== 'PGRST116') throw poemarioError;
      
      // Get author data including formspree_url
      const { data: authorData, error: authorError } = await supabase
        .from('autor')
        .select('nombre, formspree_url')
        .eq('id', currentPoem.id_autor)
        .single();
        
      if (authorError) throw authorError;
      
      // Calculate new count (default to 1 if it doesn't exist yet)
      const newCount = (currentPoem.hormigueos || 0) + 1;
      
      // Update the count in the database
      const { error: updateError } = await supabase
        .from('poema')
        .update({ hormigueos: newCount })
        .eq('id', id || 1);
      
      if (updateError) throw updateError;
      
      // If author has a formspree_url, submit to Formspree
      if (authorData.formspree_url) {
        try {
          const formspreeResponse = await fetch(authorData.formspree_url, {
            method: 'POST',
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              mensaje_nombre: userName,
              message: `¡Nuevo Hormigueo en "${currentPoem.titulo}" del poemario "${poemarioData?.titulo || 'Sin poemario'}"`,
              poema: currentPoem.titulo,
              poemario: poemarioData?.titulo || 'Sin poemario',
              fecha: new Date().toLocaleString()
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
      
      // Update local state if needed
      if (poema) {
        setPoema({
          ...poema,
          hormigueos: newCount
        });
      }
      
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
  
  // Handle navigation to another poem
  const handleGoToPoem = (poemId) => {
    navigate(`/poema/${poemId}`);
    window.scrollTo(0, 0); // Scroll to top when navigating
  };

  // Process poem text to handle indentation and stanzas
  const processPoemaText = (text) => {
    if (!text) return [];
    
    // Split text into sections based on special titles
    const sectionRegex = /^-([^-]+)-$/gm;
    let sections = [];
    let lastIndex = 0;
    let match;
    let initialContent = '';
    
    // Find all section markers
    const matches = [...text.matchAll(sectionRegex)];
    
    if (matches.length === 0) {
      // No section markers, treat the whole text as one section
      sections.push({
        title: '',
        content: processStanzas(text)
      });
    } else {
      // If there's content before the first section marker
      if (matches[0].index > 0) {
        initialContent = text.substring(0, matches[0].index).trim();
        sections.push({
          title: '',
          content: processStanzas(initialContent)
        });
      }
      
      // Process each marked section
      matches.forEach((match, i) => {
        const title = `-${match[1]}-`;
        const startIdx = match.index + match[0].length;
        const endIdx = i < matches.length - 1 ? matches[i + 1].index : text.length;
        const content = text.substring(startIdx, endIdx).trim();
        
        sections.push({
          title: title,
          content: processStanzas(content)
        });
      });
    }
    
    return sections;
  };
  
  // Process text to handle stanzas based on indentation
  const processStanzas = (text) => {
    if (!text) return text;
  
    // Split by newline characters and process each line
    const lines = text.split('\n');
    let processedText = '';
  
    lines.forEach((line, index) => {
      // Check if the line starts with spaces/tabs (indentation) to identify stanzas
      if (line.match(/^\s+/) && index > 0) {
        // Indented line, this indicates a new stanza (adding an extra line break)
        processedText += '\n\n' + line.trim();
      } else {
        // Otherwise, continue the current stanza
        if (index > 0) processedText += '\n';
        processedText += line.trim();
      }
    });
  
    return processedText;
  };
  
  // Get excerpt from a poem text (for the thumbnail view)
  const getPoemaExcerpt = (texto, maxLength = 80) => {
    if (!texto) return '';
    
    // Clean up any section markers and remove extra whitespace
    const cleanText = texto
      .replace(/^-([^-]+)-$/gm, '')
      .replace(/\n+/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
      
    // Return a short excerpt
    return cleanText.length > maxLength 
      ? cleanText.substring(0, maxLength) + '...'
      : cleanText;
  };

  // Fallback poem if data isn't available
  const fallbackPoem = {
    title: "EN CUBA",
    author: "Alejandra Pizarnik",
    date: "01/08/25",
    sections: [
      {
        title: "-Inicio-",
        content: "Perdido en la mirada\ndivulgué sin considerar una parada.\nMi cuerpo se guía solo\nseguido de su mano en el arroyo.\nNo hay por qué considerar al resto\ndel momento\nsi es que en nuestro aleteo\nlos dos volamos\ny no llevamos velo."
      },
      {
        title: "-Segundo-",
        content: "En el momento\nmi boca fue arrebatada por completo.\nPero no era de perfección\nsino de lo que me decía su alma.\nLlanto desamparado\nfue la vía\ncorrigiendo a mi sangre.\nMe pregunto\nqué será de mí\no cómo viviré\nsi es que te decides ir.\nTomé un consejo de ingenuidad\ny sonreí ante los últimos días\nde la visita que dejaste."
      },
      {
        title: "-Tercero-",
        content: "No sé cómo pasó,\nen un caso de sostenerla\nde acariciar su racimo de amor\nde templar con los labios que\nconjugaban\ny de reír con su alegría cálida\nse desvaneció.\nEn la pena\ncomo el mar se iba\ndejando el alma en llanto\ny agonía,\nya solo me queda esperar\nel regreso de mi querida."
      }
    ]
  };

  // Process poem sections
  const poemSections = poema?.texto 
    ? processPoemaText(poema.texto) 
    : fallbackPoem.sections;

  // Determine if we have other poems to show
  const hasOtherPoems = otrosPoemas && otrosPoemas.length > 0;
  const isDesktop = windowWidth > 840;

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className="edition-container" ref={articleContainerRef}>
      {/* Green gradient cover image */}
      <div className="cover-image image_2" style={{
        backgroundImage: `url(${poema?.portada || portada})`,
        height: '30vh'
      }}>
      </div>
      
      {/* Article preview section */}
      <div className="article-preview" style={{
        paddingLeft: '20px',
        paddingRight: '20px'
      }}>
        <div style={{ textAlign: 'left', color: '#888', fontSize: '14px', marginTop: '20px' }}>
          {formatDate(poema?.fecha) || fallbackPoem.date}
        </div>
        
        <div style={{ textAlign: 'left', marginTop: '10px', marginBottom: '5px' }}>
          {autor?.nombre || fallbackPoem.author}
        </div>
        
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '40px'
        }}>
          <h2 style={{ 
            fontWeight: 'bold',
            textAlign: 'left',
            fontSize: '24px',
            fontFamily: 'JetBrains Mono, monospace',
            margin: 0 // Remove default margin
          }}>
            {poema?.titulo?.toUpperCase() || fallbackPoem.title}
          </h2>
        </div>
       
        <div style={{
          marginBottom: '3rem',
          textAlign: 'left',
          padding: 0
        }}>
          {/* Poem section */}
          <div style={{
            fontFamily: 'monospace',
            fontSize: isDesktop ? '1.3rem':'14px',
            lineHeight: '1.8',
            textAlign: 'left',
            padding: 0,
            marginLeft: 0
          }}>
            {poemSections.map((section, index) => (
              <div key={index} style={{ 
                marginBottom: '40px',
                textAlign: 'left'
              }}>
                {section.title && (
                  <p style={{ 
                    marginBottom: '15px',
                    textAlign: 'left' 
                  }}>{section.title}</p>
                )}
                <div style={{ 
                  textAlign: 'left',
                  whiteSpace: 'pre-line'
                }}>{section.content}</div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Section for other poems by the author */}
        {hasOtherPoems && (
          <div ref={masPoemasSectionRef} style={{ marginTop: '60px', marginBottom: '40px' }}>
            <h3 style={{ 
              textAlign: 'center', 
              fontWeight: 'bold',
              marginBottom: '30px',
              textTransform: 'uppercase',
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: isDesktop ? '1.7rem':'18px'
            }}>
              MAS POEMAS DE {autor?.nombre?.toUpperCase() || 'ALEJANDRA'}
            </h3>
            
            <div style={{
              display: 'flex',
              justifyContent: 'space-around',
              flexWrap: 'wrap',
              gap: '20px'
            }}>
              {otrosPoemas.map((otroPoema) => (
                <div 
                  key={otroPoema.id} 
                  onClick={() => handleGoToPoem(otroPoema.id)}
                  style={{
                    width: isDesktop ? '300px': '150px',
                    cursor: 'pointer',
                    marginBottom: '20px'
                  }}
                >
                  <div style={{
                    position: 'relative',
                    height: isDesktop ? '375px' :'200px',
                    width: '100%',
                    marginBottom: '10px',
                    boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
                    borderRadius: '4px',
                    overflow: 'hidden'
                  }}>
                    <img 
                      src={otroPoema.portada || portada}
                      alt={otroPoema.titulo}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover'
                      }}
                    />
                    <div style={{
                      position: 'absolute',
                      bottom: '5px',
                      right: '5px',
                      fontSize: isDesktop ? '12px' :'8px',
                      color: 'white',
                      background: 'rgba(0,0,0,0.6)',
                      padding: '2px 5px',
                      borderRadius: '2px'
                    }}>
                      {getPoemaExcerpt(otroPoema.texto).split(' ').length} PALABRAS
                    </div>
                  </div>
                  <h4 style={{
                    fontSize: isDesktop ? '1.2rem': '11px',
                    textAlign: 'center',
                    fontWeight: 'bold',
                    textTransform: 'uppercase',
                    margin: '0 0 5px 0'
                  }}>
                    {otroPoema.titulo}
                  </h4>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Back button */}
        <div 
        onClick={() => navigate(-1)}
         style={{
          background: 'none',
          position: 'relative', // Change from no position to relative
          margin: '40px auto',  // Use margin instead of absolute positioning
          border: 'none',
          borderRadius: '50%',
          flexDirection: 'column',
          width: isDesktop ? '70px' : 'auto',
          height: '70px',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'transform 0.2s ease, background-color 0.2s ease',
          padding: '8px',
          zIndex: 100  // Lower z-index           // asegúrate de que esté por encima de otros elementos

        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'scale(1.1)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'scale(1)';
        }}
      >
        <img 
          src={hormigueroLogo} 
          alt="Anterior" 
          style={{
            width: '100%',
            height: '100%',
            transform: 'rotate(-90deg)',
            transition: 'transform 0.3s ease',
            background:'none'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'rotate(-90deg)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'rotate(-90deg)';
          }}
        />
          <span style={{ marginTop: '5px', textTransform: 'uppercase', fontSize: '12px' }}>
            Regresar
          </span>
        </div>
      </div>
      
      {/* Add the floating Hormiguear button */}
      <FloatingHormiguearButton 
        handleHormiguear={handleHormiguear}
        stopAtElement={masPoemasSectionRef}
        offsetBeforeStop={150} // You can adjust this value to control how far before the section it stops
      />

      {/* Keep your existing modal code with modified styling for the success message */}
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
                  <img 
                      src={hormigueroLogo2} 
                      alt="Hormiga" 
                      style={{ width:'30px', height: 'auto' }} 
                  />
                  HORMIGUEAR POEMA
                  </h3>
                <p style={{
                  marginBottom: '15px',
                  textAlign: 'center',
                  fontSize: '14px'
                }}>
                  Por favor, ingresa tu nombre para hormiguear este poema
                </p>
                <input
                  type="text"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  onFocus={() => setIsFocused(true)}
                  onBlur={() => setIsFocused(false)}
                  placeholder="Tu nombre"
                  style={{
                      width: '95%',
                      padding: '8px',
                      borderRadius: '4px',
                      border: isFocused ? '1px solid black' : '1px solid #aaa',
                      marginBottom: '15px',
                      fontSize: '14px',
                      fontFamily: 'JetBrains Mono, monospace',
                      outline: 'none',
                      boxShadow: isFocused ? '0 0 0 2px black' : 'none',
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
                  ESTE POEMA
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Poema;