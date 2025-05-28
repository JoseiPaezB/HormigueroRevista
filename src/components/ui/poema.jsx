import React, { useState, useEffect, useRef } from 'react';
import portada from '../../assets/images/edicion1.png';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { createClient } from '@supabase/supabase-js';
import hormigueroLogo from '../../assets/anticon.svg';
import FloatingHormiguearButton from './hormiguearButton'; // Import our new component
import hormigueroLogo2 from '../../assets/anticon2.svg'; // Make sure path is correct
import ScrollReveal from './ScrollReveal'; // Ajusta la ruta según tu estructura
import {insects} from '../../data/insects'
import InsectColony from './MovingSvgBackground';

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
  const { titulo } = useParams(); // Get only the poem title

  
  const masPoemasSectionRef = useRef(null);
  const articleContainerRef = useRef(null);

  // Fetch data on component mount
  useEffect(() => {
      const fetchData = async () => {
        try {
          // Decode and convert URL parameter back to original case
          const decodedTitulo = decodeURIComponent(titulo);
          
          // 1. Fetch poem by title (case-insensitive search)
          const { data: poemaData, error: poemaError } = await supabase
            .from('poema')
            .select('*, id_autor, id_poemario')
            .ilike('titulo', decodedTitulo) // Case-insensitive search
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
                .neq('id', poemaData.id) // Exclude current poem
                .limit(2);

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
    }, [titulo]);

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
      alert('Debes dejar un mensaje.');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const poemId = poema.id;

      // First, get the current hormiguear count
      const { data: currentPoem, error: fetchError } = await supabase
        .from('poema')
        .select('hormigueos, titulo, id_poemario, id_autor')
        .eq('id', poemId || 1)
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
        .eq('id', poemId || 1);
      
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
const handleGoToPoem = (poemTitle) => {
  navigate(`/poema/${encodeURIComponent(poemTitle.toLowerCase())}`);
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
  <div className="edition-container scroll-reveal-container" ref={articleContainerRef}>
    {/* Green gradient cover image */}
    <ScrollReveal direction="up">
      <div className="cover-image image_2" style={{
        backgroundImage: `url(${poema?.portada || portada})`,
        height: '30vh'
      }}>
      </div>
    </ScrollReveal>
    
    {/* Article preview section */}
    <div className="article-preview" style={{
      paddingLeft: '20px',
      paddingRight: '20px'
    }}>
      <ScrollReveal direction="left" delay={300}>
        <div style={{ textAlign: 'left', color: '#888', fontSize: '14px', marginTop: '20px' }}>
          {formatDate(poema?.fecha) || fallbackPoem.date}
        </div>
      </ScrollReveal>
      
      <ScrollReveal direction="left" delay={400}>
        <div style={{ textAlign: 'left', marginTop: '10px', marginBottom: '5px' }}>
          {autor?.nombre || fallbackPoem.author}
        </div>
      </ScrollReveal>
      
      <ScrollReveal direction="up" delay={500}>
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
            margin: 0 // Remove default margin
          }}>
            {poema?.titulo?.toUpperCase() || fallbackPoem.title}
          </h2>
        </div>
      </ScrollReveal>
     
      <div style={{
        marginBottom: '3rem',
        textAlign: 'left',
        padding: 0
      }}>
        {/* Poem section - cada sección con su propia animación */}
        <div style={{
          fontSize: isDesktop ? '0.9rem':'11px',
          lineHeight: '1.8',
          textAlign: 'left',
          padding: 0,
          marginLeft: 0,
          width:'96%'
        }}>
          {poemSections.map((section, index) => (
          <div 
            key={index}
            style={{ 
              marginBottom: '40px',
              textAlign: 'left'
            }}
          >
            {section.title && (
              <p style={{ 
                marginBottom: '15px',
                textAlign: 'left' 
              }}>{section.title}</p>
            )}
            <div style={{ 
              textAlign: 'left'
            }}>
              {poema.id === 50 ? (
            (() => {
              const lines = section.content.split('\n');
              let currentQuestion = null;
              let currentAnswer = [];
              const questionAnswerPairs = [];
              let qaIndex = 0;

              lines.forEach((line, lineIndex) => {
                const startsWithNumber = /^\d+\./.test(line.trim());
                
                if (startsWithNumber) {
                  // If we have a previous question and answer, save it
                  if (currentQuestion !== null) {
                    questionAnswerPairs.push({
                      question: currentQuestion,
                      answer: currentAnswer.join('\n'),
                      index: qaIndex++
                    });
                  }
                  // Start new question
                  currentQuestion = line;
                  currentAnswer = [];
                } else if (line.trim() !== '') {
                  // Add to current answer
                  currentAnswer.push(line);
                }
              });

              // Don't forget the last question-answer pair
              if (currentQuestion !== null) {
                questionAnswerPairs.push({
                  question: currentQuestion,
                  answer: currentAnswer.join('\n'),
                  index: qaIndex++
                });
              }

              return questionAnswerPairs.map((qa, qaIndex) => (
                <div key={qaIndex} style={{ marginBottom: '30px' }}>
                  <ScrollReveal 
                    direction="up" 
                    delay={200 + (qaIndex * 300)}
                  >
                    <div style={{ marginBottom: '10px' }}>
                      <strong>{qa.question}</strong>
                    </div>
                  </ScrollReveal>
                  
                  <ScrollReveal 
                    direction="up" 
                    delay={400 + (qaIndex * 300)}
                  >
                    <div style={{ 
                      whiteSpace: 'pre-line',
                      marginBottom: '20px'
                    }}>
                      {qa.answer}
                    </div>
                  </ScrollReveal>
                </div>
              ));
            })()
          ) : (
            <div style={{ whiteSpace: 'pre-line' }}>
              {section.content}
            </div>
          )}
        </div>
      </div>
    ))}
        </div>
      </div>
      
      {/* Section for other poems by the author */}
      {hasOtherPoems && (
        <div ref={masPoemasSectionRef} style={{ marginTop: '60px', marginBottom: '40px' }}>
          <ScrollReveal direction="up">
            <h3 style={{ 
              textAlign: 'center', 
              fontWeight: 'bold',
              marginBottom: '30px',
              textTransform: 'uppercase',
              fontSize: isDesktop ? '1.7rem':'18px'
            }}>
              MAS POEMAS DE {autor?.nombre?.toUpperCase() || 'ALEJANDRA'}
            </h3>
          </ScrollReveal>
          
          <div style={{
            display: 'flex',
            justifyContent: 'space-around',
            flexWrap: 'wrap',
            gap: '20px'
          }}>
            {otrosPoemas.map((otroPoema, index) => (
              <ScrollReveal 
                key={otroPoema.id} 
                direction="up" 
                delay={300 + (index * 150)}
              >
                <div 
                  onClick={() => handleGoToPoem(otroPoema.titulo)} // Pass titulo instead of id
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
              </ScrollReveal>
            ))}
          </div>
        </div>
      )}
      
      {/* Back button */}
      <ScrollReveal direction="up" delay={200}>
        <div 
          onClick={() => navigate(`/autor/${encodeURIComponent(autor.nombre)}`)}
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            marginTop: '30px',
            marginBottom: '30px',
            cursor: 'pointer'
          }}
        >
          <img 
            src={hormigueroLogo} 
            alt="Siguiente" 
            style={{
              width: '40px',
              transform: 'rotate(270deg)', // Start at 270 degrees
              transition: 'transform 0.3s ease',
              background: 'none'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'rotate(90deg)'; // Rotate to 90 degrees on hover
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'rotate(270deg)'; // Return to 270 degrees when not hovering
            }}
          />
          <span style={{ marginTop: '5px', textTransform: 'uppercase', fontSize: '12px' }}>
            Regresar
          </span>
        </div>
      </ScrollReveal>
    </div>
    
    {/* Add the floating Hormiguear button */}
    <FloatingHormiguearButton 
      handleHormiguear={handleHormiguear}
      stopAtElement={masPoemasSectionRef}
      offsetBeforeStop={150} // You can adjust this value to control how far before the section it stops
    />

    {/* Modal code - sin ScrollReveal ya que es una superposición */}
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
                Deja un mensaje para hormiguear este poema
              </p>
              <input
                type="text"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                placeholder="Mensaje"
                style={{
                    width: '100%',
                    padding: '8px',
                    borderRadius: '4px',
                    border: isFocused ? '1px solid black' : '1px solid #aaa',
                    marginBottom: '15px',
                    fontSize: '14px',
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
              <div style={{ 
                      position: 'absolute', 
                      top: '80px', 
                      left: 0, 
                      width: '100%', 
                      height: '60%', 
                      zIndex: 0, // Para estar detrás de los elementos
                      pointerEvents: 'none' // Para que no interfiera con clics
                    }}>
                     <InsectColony 
                      insects={insects.filter(insect => insect.type === 'mosquito')}
                      count={30}
                    />
                    </div>
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
                ESTE POEMA
              </p>
            </div>
          )}
        </div>
      </div>
    )}
    
    {/* CSS para manejo de overflow */}
    <style jsx>{`
      .scroll-reveal-container {
        overflow-x: hidden; /* Prevenir desbordamiento horizontal durante animaciones */
      }
      
      @media (max-width: 768px) {
        .scroll-reveal-item {
          transition-duration: 0.5s !important; /* Animaciones más rápidas en móvil */
        }
      }
    `}</style>
  </div>
);
};

export default Poema;