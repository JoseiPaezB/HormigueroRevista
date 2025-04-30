import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

const EntrevistasComponent = () => {
  // State for data
  const [entrevistas, setEntrevistas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [contributors, setContributors] = useState([]);
  const [expandedDescriptions, setExpandedDescriptions] = useState({});
  const [videoPlayingStates, setVideoPlayingStates] = useState({});
  const [sintesis, setSintesis] = useState("");
  
  // VideoRefs to control playback
  const videoRefs = useRef({});

  // Toggle description expansion
  const toggleDescription = (id) => {
    setExpandedDescriptions(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };
  
  // Handle video play/pause events
  const handleVideoPlay = (id) => {
    setVideoPlayingStates(prev => ({
      ...prev,
      [id]: true
    }));
  };
  
  const handleVideoPause = (id) => {
    setVideoPlayingStates(prev => ({
      ...prev,
      [id]: false
    }));
  };

  // Fetch data on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        // First, fetch the creadores data for entrevista to get colaboradores
        const { data: creadoresData, error: creadoresError } = await supabase
          .from('creaciones')
          .select('colaboradores')
          .eq('tipo', 'entrevista')
          .single();

        if (creadoresError) {
          console.error('Error fetching creaciones data:', creadoresError);
        }

        let colaboradoresList = [];
        if (creadoresData && creadoresData.colaboradores) {
          colaboradoresList = creadoresData.colaboradores
            .split(',')
            .map(name => name.trim().toUpperCase());
          setContributors(colaboradoresList);
        }

        // Now fetch entrevistas with author information
        const { data: entrevistasData, error: entrevistasError } = await supabase
          .from('entrevista')
          .select(`
            *,
            autor:id_autor(id, nombre)
          `)
          .order('id', { ascending: true }); // Order by ID in ascending order

        if (entrevistasError) throw entrevistasError;
        
        // Process the data to fit our component needs
        const processedEntrevistas = entrevistasData.map((entrevista) => {
          // Extract video duration (in a real app you might want to get this from the video itself)
          const fakeDuration = `${Math.floor(Math.random() * 15 + 5)}:${Math.floor(Math.random() * 59).toString().padStart(2, '0')}`;
          
          return {
            id: entrevista.id,
            title: `Entrevista ${entrevista.id}`, // You might want to add a title field to your database
            description: entrevista.descripcion,
            videoUrl: entrevista.video, // URL from your database
            thumbnailUrl: "/api/placeholder/640/360", // Placeholder for now
            duration: fakeDuration,
            colaboradores: entrevista.colaboradores, // Individual video collaborators from entrevista table
            // Author information
            authorId: entrevista.id_autor,
            authorName: entrevista.autor ? entrevista.autor.nombre : 'Autor desconocido'
          };
        });
        
        setEntrevistas(processedEntrevistas);
        
        // If we already have contributors from creaciones, no need to extract from entrevistas
        if (colaboradoresList.length === 0 && processedEntrevistas.length > 0) {
          // Fallback: Get contributors from the first entrevista
          const firstEntrevista = processedEntrevistas[0];
          if (firstEntrevista.colaboradores) {
            colaboradoresList = firstEntrevista.colaboradores
              .split(',')
              .map(name => name.trim().toUpperCase());
            setContributors(colaboradoresList);
          } else {
            // Default contributors if none found
            setContributors([
              "GABRIEL GARCÍA MÁRQUEZ – Director de cine y literatura",
              "JORGE LUIS BORGES – Entrevistador principal",
              "OCTAVIO PAZ – Productor ejecutivo"
            ]);
          }
        }
          
        // Use the first entrevista's description as the sintesis, or set a default
        if (processedEntrevistas.length > 0) {
          const firstEntrevista = processedEntrevistas[0];
          setSintesis(firstEntrevista.description || 
            "Nuestra colección de entrevistas reúne conversaciones profundas con los más destacados escritores y artistas latinoamericanos. Cada entrevista revela no solo los procesos creativos detrás de obras maestras, sino también las inspiraciones, luchas y filosofías que han dado forma a la literatura contemporánea.");
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load entrevistas data');
        
        // Fallback to mock data in case of error
        const mockEntrevistas = [
          {
            id: 1, 
            title: "Entrevista con Gabriel García Márquez",
            description: "Conversación sobre realismo mágico y su proceso creativo. El realismo mágico es un género literario que incorpora elementos fantásticos en narrativas que de otro modo serían realistas. García Márquez explora cómo este estilo refleja la realidad latinoamericana y cómo sus propias experiencias en la costa caribeña de Colombia han influido en sus obras más reconocidas como 'Cien años de soledad'.",
            videoUrl: "https://example.com/interview1.mp4", 
            thumbnailUrl: "/api/placeholder/640/360",
            duration: "12:45",
            colaboradores: "Gabriel García Márquez, Carlos Fuentes",
            authorId: 1,
            authorName: "Gabriel García Márquez"
          },
          {
            id: 2,
            title: "Jorge Luis Borges habla sobre la literatura fantástica",
            description: "El reconocido autor argentino habla sobre su visión de la literatura y la construcción de mundos imaginarios. Borges explica cómo su fascinación por los laberintos, espejos, bibliotecas infinitas y el tiempo cíclico ha dado forma a su obra. También discute la influencia de la filosofía idealista y su concepto de que la realidad misma puede ser un sueño o una ficción.",
            videoUrl: "https://example.com/interview2.mp4",
            thumbnailUrl: "/api/placeholder/320/240",
            duration: "8:20",
            colaboradores: "Jorge Luis Borges, María Kodama",
            authorId: 2,
            authorName: "Jorge Luis Borges"
          },
          {
            id: 3,
            title: "Octavio Paz y la poesía moderna",
            description: "El Nobel mexicano reflexiona sobre la evolución de la poesía en el siglo XX y su propia contribución a las letras hispánicas. Paz analiza la relación entre tradición y ruptura, la importancia del surrealismo en su obra temprana y su posterior exploración de la poesía oriental. Discute también cómo su experiencia diplomática en diferentes países ha enriquecido su visión poética del mundo.",
            videoUrl: "https://example.com/interview3.mp4",
            thumbnailUrl: "/api/placeholder/320/180",
            duration: "5:30",
            colaboradores: "Octavio Paz, Elena Poniatowska",
            authorId: 3,
            authorName: "Octavio Paz"
          }
        ];
        
        setEntrevistas(mockEntrevistas);
        setContributors([
          "GABRIEL GARCÍA MÁRQUEZ – Director de cine y literatura",
          "JORGE LUIS BORGES – Entrevistador principal",
          "OCTAVIO PAZ – Productor ejecutivo"
        ]);
        setSintesis("Nuestra colección de entrevistas reúne conversaciones profundas con los más destacados escritores y artistas latinoamericanos.");
        setLoading(false);
      }
    };
  
    fetchData();
  }, []);

  // Función para convertir URL de YouTube en formato embebible
function getYouTubeEmbedUrl(url) {
  // Extraer el ID del video de YouTube de diferentes formatos de URL
  let videoId = '';
  
  if (url.includes('youtube.com/watch')) {
    videoId = new URL(url).searchParams.get('v');
  } else if (url.includes('youtu.be/')) {
    videoId = url.split('youtu.be/')[1];
    // Eliminar parámetros adicionales si existen
    if (videoId.includes('?')) {
      videoId = videoId.split('?')[0];
    }
  }
  
  return `https://www.youtube.com/embed/${videoId}`;
}

// Función para convertir URL de Google Drive en formato embebible
function getGoogleDriveEmbedUrl(url) {
  // Extraer el ID del archivo de Drive
  let fileId = '';
  
  if (url.includes('/file/d/')) {
    const parts = url.split('/file/d/');
    if (parts.length > 1) {
      fileId = parts[1].split('/')[0];
      // Limpiar cualquier parámetro de la URL
      if (fileId.includes('?')) {
        fileId = fileId.split('?')[0];
      }
    }
  }
  
  return `https://drive.google.com/file/d/${fileId}/preview`;
}

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className="entrevistas-container">
      {/* Header section */}
      <div className="article-preview" style={{marginTop: '5rem'}}>
        <h2 className="edition-title" style={{ fontWeight: 'bold', marginBottom: '30px', fontSize:'50px' }}>
          ENTREVISTAS
        </h2>
        <div className="contributors-list" style={{marginTop: '-1.5rem', marginBottom: '2rem'}}>
          {contributors.map((contributor, index) => (
            <p key={index} style={{marginBottom: '10px'}}>{contributor}</p>
          ))}
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
              color: '#fff',         
            }}>
            {sintesis}
          </p>
        </div>

        {/* Videos in a single column */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '40px',
          marginBottom: '60px',
          maxWidth: '800px',
          margin: '0 auto'
        }}>
          {entrevistas.map((video) => (
            <div 
              key={video.id} 
              style={{
                width: '100%',
                backgroundColor: '#111',
                borderRadius: '8px',
                overflow: 'hidden',
                boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
              }}
            >
              {/* Video container */}
              <div 
                style={{
                  position: 'relative',
                  width: '100%',
                  height: '450px',  // Fixed height for all videos
                }}
              >
                {/* Video element */}
                {video.videoUrl.includes('youtube.com') || video.videoUrl.includes('youtu.be') ? (
                    // Para videos de YouTube
                    <iframe
                      ref={el => videoRefs.current[video.id] = el}
                      width="100%"
                      height="100%"
                      src={getYouTubeEmbedUrl(video.videoUrl)}
                      title={`YouTube video ${video.id}`}
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      style={{
                        width: '100%',
                        height: '100%',
                        display: 'block',
                      }}
                    ></iframe>
                  ) : video.videoUrl.includes('drive.google.com') ? (
                    // Para videos de Google Drive
                    <iframe
                      ref={el => videoRefs.current[video.id] = el}
                      width="100%"
                      height="100%"
                      src={getGoogleDriveEmbedUrl(video.videoUrl)}
                      title={`Google Drive video ${video.id}`}
                      frameBorder="0"
                      allow="autoplay"
                      allowFullScreen
                      style={{
                        width: '100%',
                        height: '100%',
                        display: 'block',
                      }}
                    ></iframe>
                  ) : (
                    // Para videos MP4 directos y otros formatos compatibles
                    <video
                      ref={el => videoRefs.current[video.id] = el}
                      loop
                      autoPlay
                      playsInline
                      controls
                      poster={video.thumbnailUrl || "/api/placeholder/640/360"}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        display: 'block',
                      }}
                      onPlay={() => handleVideoPlay(video.id)}
                      onPause={() => handleVideoPause(video.id)}
                    >
                      <source src={video.videoUrl} type="video/mp4" />
                      Your browser does not support the video tag.
                    </video>
                  )}
                
                {/* Overlay gradient - fades during playback */}
                <div style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.2) 50%, rgba(0,0,0,0.4) 100%)',
                  pointerEvents: 'none',
                  opacity: videoPlayingStates[video.id] ? 0.3 : 0.7,
                  transition: 'opacity 0.3s ease',
                }}></div>
                
                {/* Title overlay - disappears during playback */}
                <div style={{
                  position: 'absolute',
                  bottom: '20px',
                  left: '20px',
                  color: 'white',
                  zIndex: 2,
                  textShadow: '1px 1px 3px rgba(0,0,0,0.7)',
                  opacity: videoPlayingStates[video.id] ? 0 : 1,
                  transition: 'opacity 0.3s ease',
                  pointerEvents: 'none',
                }}>
                  <h3 style={{
                    fontSize: '24px',
                    fontWeight: 'bold',
                    margin: '0 0 8px 0',
                    letterSpacing: '0.5px',
                  }}>
                    {video.title.toUpperCase()}
                  </h3>
                  
                  {/* Colaboradores */}
                  <p style={{
                    fontSize: '16px',
                    margin: '0',
                    opacity: 0.9,
                  }}>
                    {video.colaboradores ? video.colaboradores : 'Entrevista exclusiva'}
                  </p>
                </div>
              </div>
              
              {/* Description button and expandable content */}
              <div style={{
                padding: '15px 20px',
                borderTop: '1px solid rgba(255,255,255,0.1)',
              }}>
                {/* Description toggle button */}
                <button
                  onClick={() => toggleDescription(video.id)}
                  style={{
                    width: '100%',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    backgroundColor: 'transparent',
                    border: 'none',
                    color: 'white',
                    padding: '10px 0',
                    fontSize: '16px',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    textAlign: 'left',
                  }}
                >
                  <span>DESCRIPCIÓN</span>
                  <span style={{
                    transition: 'transform 0.3s ease',
                    transform: expandedDescriptions[video.id] ? 'rotate(180deg)' : 'rotate(0deg)',
                    fontSize: '24px',
                  }}>
                    &#9662;
                  </span>
                </button>
                
                {/* Expandable description */}
                <div style={{
                  height: expandedDescriptions[video.id] ? 'auto' : '0',
                  overflow: 'hidden',
                  opacity: expandedDescriptions[video.id] ? 1 : 0,
                  visibility: expandedDescriptions[video.id] ? 'visible' : 'hidden',
                  transition: 'height 0.3s ease, opacity 0.3s ease, visibility 0.3s ease',
                  marginTop: expandedDescriptions[video.id] ? '10px' : '0',
                }}>
                  <p style={{
                    margin: '0 0 15px 0',
                    color: '#ccc',
                    lineHeight: '1.6',
                    fontSize: '14px',
                    textAlign: 'justify',
                  }}>
                    {video.description}
                  </p>
                  
                  {/* Author link */}
                  <div style={{
                    display: 'flex',
                    justifyContent: 'flex-end',
                    marginTop: '10px'
                  }}>
                    <Link 
                      to={`/poemario/${video.authorId}`}
                      style={{
                        color: '#fff',
                        textDecoration: 'none',
                        fontWeight: 'bold',
                        fontSize: '14px',
                        padding: '5px 10px',
                        borderRadius: '4px',
                        background: 'rgba(255,255,255,0.1)',
                        transition: 'background 0.2s ease'
                      }}
                    >
                      {video.authorName} &rarr;
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default EntrevistasComponent;