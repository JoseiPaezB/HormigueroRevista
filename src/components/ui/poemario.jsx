import React, { useState, useEffect } from 'react';
import eventImage from '/assets/evento1.png';
import portada from '/assets/edicion1.png';

import { Link, useParams, useNavigate, useLocation } from 'react-router-dom';
import { createClient } from '@supabase/supabase-js';
import InsectColony from './MovingSvgBackground'; // Adjust the path as needed
import mosquito from '/assets/mosquito.svg';
// import ant from '/assets/images/ant.svg';
import bee from '/assets/bee.svg';
import fly from '/assets/roach.svg';
import ant from '/assets/libelula.svg';
import ScrollReveal from './ScrollReveal'; // Ajusta la ruta según tu estructura
import { Helmet } from 'react-helmet';
import hormigueroLogo from '/assets/anticon2.svg'; // Make sure path is correct


// Initialize Supabase client
const insects = [
    {
      src: mosquito,
      type: 'mosquito',
      size: 30,
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
      src: mosquito,
      type: 'default',
      size: 32
    }
  ];


// Initialize Supabase client
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);


const AuthorBio = () => {
    const { nombre } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const [autor, setAutor] = useState(null);
    const [poemas, setPoemas] = useState([]);
    const [edicionesAutor, setEdicionesAutor] = useState([]);
    const edicionParam = new URLSearchParams(location.search).get('edicion');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [revista, setRevista] = useState(null);       // latest edition (for nav)
    const [revistas, setRevistas] = useState([]);        // all editions
    const [poemario, setPoemario] = useState(null);
    const [portadaEdicion, setPortadaEdicion] = useState(null);
    const [isVisualArtist, setIsVisualArtist] = useState(false);
    const [windowWidth, setWindowWidth] = useState(window.innerWidth);
    

    const countWords = (text) => {
      if (!text) return 0;
      return text.split(/\s+/).filter(word => word.length > 0).length;
    };

useEffect(() => {
     if (!sessionStorage.getItem('authorPageReferrer') && !location.state?.fromRegresar) {
        const referrer = document.referrer;
        if (referrer.includes('/creaciones')) {
          sessionStorage.setItem('authorPageReferrer', 'creaciones');
        } else if (referrer.includes('/critica')) {
          sessionStorage.setItem('authorPageReferrer', 'critica');
        }
      }
  }, [location.state]);

  useEffect(() => {
    const handlePopState = () => {
      const referrer = sessionStorage.getItem('authorPageReferrer');
      if (autor?.id === 63) {
        sessionStorage.removeItem('authorPageReferrer');
        navigate('/edicion?edicion=3', { replace: true });
        return;
      }
      if (referrer) {
        sessionStorage.removeItem('authorPageReferrer');
        navigate(`/${referrer}`, { replace: true });
      }
    };

    window.addEventListener('popstate', handlePopState);
    
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [navigate, autor]);

useEffect(() => {
  window.scrollTo(0, 0);
  
  if ('scrollRestoration' in history) {
    history.scrollRestoration = 'manual';
  }
  
  return () => {
    if ('scrollRestoration' in history) {
      history.scrollRestoration = 'auto';
    }
  };
}, []);

useEffect(() => {
  const fetchData = async () => {
    try {
      console.log('URL param:', nombre);
      console.log('Decoded:', decodeURIComponent(nombre));
      const decodedNombre = decodeURIComponent(nombre);

      const { data: autorData, error: autorError } = await supabase
        .from('autor')
        .select('*')
         .ilike('nombre', decodedNombre.trim()) 
        .single();

      if (autorError) throw autorError;
      setAutor(autorData);
      
      const authorId = autorData.id;
      
      setIsVisualArtist(autorData.tipo_creacion === 'visuales' || autorData.tipo_creacion === 'entrevista');

      const { data: revistaData, error: revistaError } = await supabase
        .from('revista')
        .select('*')
        .order('id', { ascending: false });

      if (revistaError) throw revistaError;
      setRevistas(revistaData);

      const { data: relaciones, error: relacionesError } = await supabase
        .from('revista_autor')
        .select('id_revista')
        .eq('id_autor', authorId);
      if (relacionesError) throw relacionesError;
      const ediciones = (revistaData || []).filter(r =>
        (relaciones || []).some(rel => rel.id_revista === r.id)
      ).sort((a, b) => (a.numero || 0) - (b.numero || 0));
      setEdicionesAutor(ediciones);
      const seleccionada = ediciones.find(r => String(r.id) === edicionParam);
      setRevista(seleccionada || ediciones[ediciones.length - 1] || revistaData?.[0]);

      if (autorData.tipo_creacion !== 'visuales') {
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
        
        if (!poemarioError) {
          setPoemario(poemarioData);
        }

        // La portada contextual solo aplica al entrar desde una edición.
        // Sin ?edicion= se conserva la portada general del poemario.
        setPortadaEdicion(null);
        if (!poemarioError && poemarioData && edicionParam) {
          const { data: secciones, error: seccionesError } = await supabase
            .from('creaciones')
            .select('id')
            .eq('id_revista', edicionParam)
            .eq('tipo', 'creaciones');
          if (seccionesError) throw seccionesError;

          if (secciones?.length) {
            const { data: portadaRelaciones, error: portadaError } = await supabase
              .from('creaciones_poemario')
              .select('portada')
              .eq('id_creacion', secciones[0].id)
              .eq('id_poemario', poemarioData.id)
              .limit(1);
            if (portadaError) throw portadaError;
            setPortadaEdicion(portadaRelaciones?.[0]?.portada || null);
          }
        }
        
        // La edición de un poema se obtiene de poema_revista, NO de revista_autor.
        const ids = (poemasData || []).map(p => p.id);
        let publicaciones = [];
        if (ids.length) {
          const { data, error: publicacionesError } = await supabase
            .from('poema_revista').select('id_poema, id_revista').in('id_poema', ids);
          if (publicacionesError) throw publicacionesError;
          publicaciones = data || [];
        }
        const transformedPoemas = (poemasData || []).flatMap(poema => {
          const relacionesPoema = publicaciones.filter(rel => rel.id_poema === poema.id);
          // No atribuimos automáticamente poemas sin relación a una edición.
          return relacionesPoema.filter(rel => !edicionParam || String(rel.id_revista) === edicionParam)
            .map(rel => ({
              id: poema.id,
              editionId: rel.id_revista,
              title: poema.titulo,
              author: autorData.nombre,
              cover: poema.portada,
              link: `/poema/${encodeURIComponent(poema.titulo.toLowerCase())}?edicion=${rel.id_revista}`,
              wordCount: countWords(poema.texto),
            }));
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
}, [nombre, edicionParam]);

    const categorizeBooks = (books) => {
      const small = books.filter(book => book.wordCount < 100);
      const medium = books.filter(book => book.wordCount >= 100 && book.wordCount <= 200);
      const large = books.filter(book => book.wordCount > 200);
      
      return { small, medium, large };
    };

    const arrangeBooks = (books) => {
      const { small, medium, large } = categorizeBooks(books);
      const result = [];
        if (autor?.id === 63) {
          return books.map(book => ({ ...book, sizeCategory: 'small' }));
        }
      const maxSets = Math.max(
        Math.ceil(small.length / 2),
        Math.ceil(large.length),
        Math.ceil(medium.length / 2)
      );
      
      for (let i = 0; i < maxSets; i++) {
        if (i * 2 < small.length) {
          result.push({...small[i * 2], sizeCategory: 'medium'});
        }
        
        if (i * 2 + 1 < small.length) {
          result.push({...small[i * 2 + 1], sizeCategory: 'medium'});
        }
        
        if (i < large.length) {
          result.push({...large[i], sizeCategory: 'large'});
        }
        
        if (i * 2 < medium.length) {
          result.push({...medium[i * 2], sizeCategory: 'medium'});
        }
        
        if (i * 2 + 1 < medium.length) {
          result.push({...medium[i * 2 + 1], sizeCategory: 'medium'});
        }
      }
      
      return result;
    };
    
    const groupedBooks = edicionParam
      ? [{ edition: edicionesAutor.find(r => String(r.id) === edicionParam), books: arrangeBooks(poemas) }]
      : edicionesAutor.map(edition => ({
          edition,
          books: arrangeBooks(poemas.filter(p => p.editionId === edition.id)),
        })).filter(group => group.books.length > 0);
    const arrangedBooks = groupedBooks.flatMap(group => [
      ...(!edicionParam ? [{ isHeading: true, id: `heading-${group.edition.id}`, title: `Número ${group.edition.numero} — ${group.edition.nombre}` }] : []),
      ...group.books,
    ]);

    const getBookSize = (wordCount, sizeCategory) => {
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

    const getTitleStyles = (sizeInfo) => {
      if (sizeInfo.isLarge) {
        return {
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          textAlign: 'center',
          color: 'white',
          fontSize: '16px',
          fontWeight: 'bold',
          letterSpacing: '1px',
          textShadow: '2px 2px 4px rgba(0,0,0,0.8)',
          padding: isDesktop ? '0' : '10px',
          width: isDesktop ? '100%' : 'auto',
        };
      }
      
      return {
        margin: '0 0 5px 0', 
        fontSize: isDesktop ? '1.5rem':'14px',
        fontWeight: 'bold',
        letterSpacing: '0.5px',
      };
    };

    if (loading) return <div>Loading...</div>;
    if (error) return <div>{error}</div>;

    const authorName = autor?.nombre?.toUpperCase() || "AUTOR";
    
    const firstLetter = authorName.charAt(0);
    const restOfName = authorName.substring(1);
    const isDesktop = windowWidth > 840;
    const processItalics = (text) => {
      if (!text) return text;
      const parts = text.split(/\$([^$]+)\$/);
      return parts.map((part, index) =>
        index % 2 === 1 ? <em key={index}>{part}</em> : part
      );
    };

return (
  <>
   <Helmet>
        <title>{autor?.nombre ? `${autor.nombre} - Hormiguero de Poemas` : 'Autor - Hormiguero de Poemas'}</title>
        <meta name="description" content={
          autor?.semblanza 
            ? `${autor.nombre}: ${autor.semblanza.substring(0, 150)}...` 
            : `Descubre la obra de ${autor?.nombre || nombre} en Hormiguero de Poemas`
        } />
        <meta name="keywords" content={`${autor?.nombre || nombre}, poesía, literatura, hormiguero de poemas, autor`} />
        
        {/* Open Graph */}
        <meta property="og:title" content={`${autor?.nombre || nombre} - Hormiguero de Poemas`} />
        <meta property="og:description" content={
          autor?.semblanza 
            ? `${autor.nombre}: ${autor.semblanza.substring(0, 200)}...` 
            : `Obra y biografía de ${autor?.nombre || nombre}`
        } />
        <meta property="og:type" content="profile" />
        <meta property="og:url" content={`http://hormiguerodepoemas/autor/${encodeURIComponent(nombre)}`} />
        <meta property="og:image" content={autor?.imagen || '/default-author.jpg'} />
        <meta property="og:image:alt" content={`Foto de ${autor?.nombre || nombre}`} />
        
        {/* Twitter Cards */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={`${autor?.nombre || nombre} - Hormiguero de Poemas`} />
        <meta name="twitter:description" content={
          autor?.semblanza 
            ? `${autor.nombre}: ${autor.semblanza.substring(0, 150)}...` 
            : `Descubre la obra de ${autor?.nombre || nombre}`
        } />
        <meta name="twitter:image" content={autor?.imagen || '/default-author.jpg'} />
      </Helmet>

{/* ── Outer container: no background ── */}
<div 
  className="bio-container scroll-reveal-container" 
  style={{ 
    minHeight: '100vh',
  }}
>
  {/* Cover image */}
    <ScrollReveal direction="up">
      <div style={{margin:isDesktop ? '0 auto':'normal',width:isDesktop ? '30%':'normal',display: isDesktop? 'flex':'normal', justifyContent: isDesktop ?  'center' : 'normal'}}>
        <div className="cover-image image_2" style={{
          backgroundImage: `url(${!isVisualArtist ? (portadaEdicion || poemario?.portada || portada) : (autor?.imagen || portada)})`,
          height: '30vh',
          backgroundSize: '45%',
          backgroundRepeat: 'no-repeat',
        }}>
        </div>
      </div>
    </ScrollReveal>
    
    <ScrollReveal direction="up" delay={300}>
      {/* ── Semblanza wrapper: background image lives here ── */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        maxWidth: isDesktop ? 'none' : '400px',
        width: isDesktop ? '75%' : 'auto',
        overflow: 'hidden',
        margin: '10px auto',
        /* Background image */
        backgroundImage: autor?.id === 63 && revistas.find(r => r.numero === 3)?.bg_sintesis ? `url(${revistas.find(r => r.numero === 3).bg_sintesis})` : 'none',
        backgroundPosition:isDesktop ? 'top': ' 50%',      
        backgroundSize: isDesktop ? '75%' : '80%',
        backgroundRepeat: 'no-repeat',
        borderRadius: '8px',
        position: 'relative',
      }}>

        {/* Semi-transparent overlay so text stays readable */}
        {autor?.id === 63 && revistas.find(r => r.numero === 3)?.bg_sintesis && (
          <div style={{
            position: 'absolute',
            inset: 0,
            borderRadius: '8px',
            background: 'rgba(255,255,255,0.6)',
            zIndex: 0,
          }} />
        )}
        
        {/* Content section — sits above the overlay */}
        <div style={{
          padding: isDesktop ? '20px' : '8px',
          backgroundColor: 'transparent',
          position: 'relative',
          zIndex: 1,
        }}>
          {/* Semblanza: siempre texto arriba y fotografía debajo */}
          <ScrollReveal direction="up" delay={400}>
            <div style={{
              fontSize: isDesktop ? '1rem' : '14px',
              lineHeight: '1.5',
              width: (autor?.semblanza || '').trim().length < 200
                ? (isDesktop ? '50%' : '75%')
                : '100%',
              marginLeft: 'auto',
              marginRight: 'auto'
            }}>
              <p style={{
                marginBottom: '15px',
                textAlign: (autor?.semblanza || '').trim().length < 200 ? 'left' : 'justify',
                overflowWrap: 'break-word'
              }}>
                <span style={{
                  fontSize: isDesktop ? '2rem' : '28px',
                  fontWeight: 'bold',
                  float: 'left',
                  marginRight: '2px',
                  lineHeight: '1'
                }}>
                  {firstLetter}
                </span>
                {restOfName}, {processItalics(autor?.semblanza || '')}
              </p>
            </div>
          </ScrollReveal>

          <ScrollReveal direction="scale" delay={600}>
            <div style={{
              width: '100%',
              display: 'flex',
              justifyContent: 'center',
              margin: isDesktop ? '40px 0' : '30px 0'
            }}>
              <img
                src={autor?.imagen || eventImage}
                alt={autor?.nombre || 'Author'}
                style={{
                  height: isDesktop ? '410px' : '200px',
                  width: isDesktop ? '50%' : '75%',
                  objectFit: 'cover',
                  border: '1px solid #eee',
                  boxShadow: '0 4px 10px rgba(0,0,0,0.1)'
                }}
              />
            </div>
          </ScrollReveal>

          {/* Bio corta section */}
          <ScrollReveal direction="up" delay={1000}>
            <div style={{ 
              clear: 'both',
              marginBottom: '20px',
              marginTop: '30px'
            }}>
              <p style={{
                fontSize: isDesktop ? '1rem' : '14px',
                lineHeight: '1.5',
                margin: 0
              }}>
                {autor?.bio_corta || ''}
              </p>
              {autor?.URL && (
              <div style={{ 
                textAlign: 'center'
              }}>
                <a 
                  href={autor.URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    fontSize: isDesktop ? '1rem' : '12px',
                    textDecoration: 'underline',
                    fontWeight: '500',
                    transition: 'all 0.3s ease',
                    padding: '8px 16px',
                    borderRadius: '4px',
                    display: 'inline-block'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.textDecoration = 'none';
                    e.target.style.transform = 'translateY(-2px)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = 'transparent';
                    e.target.style.textDecoration = 'underline';
                    e.target.style.transform = 'translateY(0px)';
                    e.target.style.boxShadow = 'none';
                  }}
                >
                  {autor.URL}
                </a>
              </div>
            )}
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
          paddingTop: '30px'
        }}>
          <div style={{ 
            position: 'absolute', 
            top: 0, 
            left: 0, 
            width: '100%', 
            height: '100%', 
            zIndex: 0,
            pointerEvents: 'none'
          }}>
            <InsectColony 
              count={35}
              insects={insects}
            />
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '20px',
            marginBottom: '40px',
            padding: '0 20px',
            maxWidth: '800px',
            margin: '20px auto',
            position: 'relative',
            zIndex: 1
          }}>
            {arrangedBooks.map((book, index) => {
              if (book.isHeading) return (
                <h2 key={book.id} style={{ gridColumn: '1 / -1', fontSize: isDesktop ? '24px' : '18px', margin: '28px 0 4px' }}>
                  {book.title}
                </h2>
              );
              const sizeStyles = getBookSize(book.wordCount, book.sizeCategory);
              const titleStyles = getTitleStyles(sizeStyles);
              const isLargeBook = sizeStyles.isLarge;
              
              const gridPosition = {};
              if (isLargeBook) {
                gridPosition.gridColumn = '1 / span 2';
              }
              
              return (
                <div 
        key={book.id}
        style={{
          ...gridPosition,
          gridColumn: isLargeBook ? '1 / span 2' : 'auto'
        }}
      >
        <ScrollReveal delay={200 + index * 100} direction="up">
          <Link 
            to={book.link} 
            style={{
              textDecoration: 'none', 
              color: 'inherit',
              display: 'block',
              height: '100%'
            }}
          >
            <div style={{
              position: 'relative',
              overflow: 'hidden',
              boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
              transition: 'transform 0.3s ease',
              height: sizeStyles.height,
              width: '100%',
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
                        <div style={titleStyles}>
                          <h3>{book.title}</h3>
                        </div>
                      ) : (
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
          <ScrollReveal direction="up" delay={200}>
                          <div style={{
                            display: 'flex',
                            justifyContent: 'center',
                            gap: isDesktop ? '80px' : '40px',
                            marginTop: '30px',
                            marginBottom: '30px',
                          }}>
                  
                            <div
                              onClick={() => {
                                sessionStorage.removeItem('poemHistory');
                                sessionStorage.removeItem('poemPageAuthor');
                                if (autor?.id === 63) {
                                  navigate(-1);
                                } else {
                                  const referrer = autor?.tipo_creacion === 'critica' || autor?.tipo_creacion === 'crítica'
                                    ? `/critica?edicion=${revista?.id}`
                                    : `/creaciones?edicion=${revista?.id}`;
                                  navigate(referrer, { replace: true });
                                }
                              }}
                              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'pointer' }}
                            >
                              <img
                                src={hormigueroLogo}
                                alt={autor?.id === 63 ? 'Regresar' : 'Ver más autores'}
                                style={{ width: '40px', transform: 'rotate(0deg)', transition: 'transform 0.3s ease' }}
                                onMouseEnter={(e) => (e.currentTarget.style.transform = 'rotate(90deg)')}
                                onMouseLeave={(e) => (e.currentTarget.style.transform = 'rotate(0deg)')}
                              />
                              <span style={{ marginTop: '5px', textTransform: 'uppercase', fontSize: '12px', textAlign: 'center' }}>
                                {autor?.id === 63 ? 'Regresar' : <>Ver otros<br />autores</>}
                              </span>
                            </div>
                  
                          </div>
                        </ScrollReveal>
        </div>
      </>
    )}
    
    <style jsx>{`
      .scroll-reveal-container {
        overflow-x: hidden;
      }
    `}</style>
  </div>
  </>
);
};

export default AuthorBio;