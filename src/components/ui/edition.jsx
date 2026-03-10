import React, { useState, useEffect, useRef } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { createClient } from '@supabase/supabase-js';

import HormigueadosSection from './hormigueados';
import Footer from './footer';
import ScrollReveal from './ScrollReveal';
import { setupHashNavigation } from './scrollUtils';
import '../ui/ScrollReveal.css';
import { insects } from '../../data/insects';
import InsectColony from './MovingSvgBackground';
import { Helmet } from 'react-helmet';
import RotatingMani from './rotatingMani';
import RotatingBackground from './rotatingBg';
import hormigueroLogo from '/assets/anticon.svg';
import mosquito from '/assets/mosquito.svg';
import bee from '/assets/bee.svg';
import fly from '/assets/roach.svg';
import ant from '/assets/libelula.svg';

const localInsects = [
  { src: mosquito, type: 'mosquito', size: 30 },
  { src: ant,      type: 'ant',      size: 25 },
  { src: bee,      type: 'bee',      size: 35 },
  { src: fly,      type: 'fly',      size: 28 },
  { src: mosquito, type: 'default',  size: 32 },
];

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// ─── Styles ───────────────────────────────────────────────────────────────────
const CustomStyles = () => (
  <style>{`
    .article-content p {
      text-align: justify;
      text-justify: inter-word;
      hyphens: auto;
    }
    @media (min-width: 768px)  { .article-content { max-width: 70%; margin: 0 auto; } }
    @media (min-width: 1024px) { .article-content { max-width: 60%; } }
    @media (min-width: 1280px) { .article-content { max-width: 50%; } }

    .edicion-title-animation {
      display: inline-block; position: relative; opacity: 0;
      animation: slideInFromBelow 0.8s forwards 0.3s;
    }
    @keyframes slideInFromBelow {
      0%   { opacity: 0; transform: translateY(30px) scale(0.9); filter: blur(5px); }
      100% { opacity: 1; transform: translateY(0)    scale(1);   filter: blur(0);   }
    }

    .edition-link::after {
      content: ''; position: absolute; bottom: -5px; left: 0%;
      transform: translateX(-50%); height: 2px; background-color: white;
      transition: width 0.3s ease; width: 0;
    }
    .click-hint { font-size: 12px; opacity: 0; transition: opacity 0.5s ease; margin-top: 5px; text-align: center; }
    .animate-link::after { animation: pulseLine 3.5s infinite ease-in-out; width: 15%; }
    .animate-link .click-hint { opacity: 1; }
    @keyframes pulseLine {
      0%   { opacity: 0.5; width: 30%;  }
      50%  { opacity: 1;   width: 100%; }
      100% { opacity: 0.5; width: 30%;  }
    }
    @media (min-width: 769px) {
      .edition-link:hover::after { width: 100%; animation: none; opacity: 1; }
      .edition-link:hover .click-hint { opacity: 1; }
      .edition-link:hover .portada { transform: scale(1.05); transition: transform 0.3s ease; }
    }
    @media (max-width: 768px) {
      .click-hint { font-size: 10px; padding: 2px 5px; border-radius: 3px; }
      .animate-link::after { height: 3px; }
      .animate-link .portada { text-shadow: 0 0 8px rgba(255,255,255,0.4), 2px 2px 4px rgba(0,0,0,0.8); }
    }

    @keyframes pulse {
      0%   { transform: scale(1);   }
      50%  { transform: scale(1.1); }
      100% { transform: scale(1);   }
    }
    @keyframes textPulse {
      0%   { opacity: 0.75; }
      50%  { opacity: 1;    }
      100% { opacity: 0.75; }
    }
    .pulsing-text { animation: textPulse 2s infinite ease-in-out; }
    .menu-item { transition: all 0.3s ease; }
    .menu-item:hover { transform: translateY(-5px); }
    .menu-item:hover .pulsing-text { animation: textPulse 0.5s infinite ease-in-out; }
  `}</style>
);

// ─── Main Component ───────────────────────────────────────────────────────────
const Edicion = () => {
  const [searchParams] = useSearchParams();
  const edicionId = searchParams.get('edicion');

  const [revista,            setRevista]            = useState(null);
  const [loading,            setLoading]            = useState(true);
  const [error,              setError]              = useState(null);
  const [contributors,       setContributors]       = useState([]);
  const [allAuthors,         setAllAuthors]         = useState([]);
  const [autores,            setAutores]            = useState([]);
  const [visibleAuthorIndex, setVisibleAuthorIndex] = useState(0);
  const [authorPosition,     setAuthorPosition]     = useState({ top: '40%', left: '50%' });
  const [windowWidth,        setWindowWidth]        = useState(window.innerWidth);
  const [viewportHeight,     setViewportHeight]     = useState(window.innerHeight);
  const [activeHash,         setActiveHash]         = useState('');
  const [autorEspecial, setAutorEspecial] = useState(null);

  const coverImageRef      = useRef(null);
  const editionLinkRef     = useRef(null);
  const isEditionLinkVisible = useRef(false);

  // Intersection observer for edition link animation
  useEffect(() => {
    if (!editionLinkRef.current) return;
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !isEditionLinkVisible.current) {
          isEditionLinkVisible.current = true;
          setTimeout(() => {
            if (editionLinkRef.current) editionLinkRef.current.classList.add('animate-link');
          }, 1000);
        }
      });
    }, { threshold: 0.7, rootMargin: '0px' });
    observer.observe(editionLinkRef.current);
    return () => { if (editionLinkRef.current) observer.unobserve(editionLinkRef.current); };
  }, [windowWidth]);

  // Resize
  useEffect(() => {
    const handleResize = () => { setWindowWidth(window.innerWidth); setViewportHeight(window.innerHeight); };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
useEffect(() => {
  if (revista) console.log('revista data:', revista);
}, [revista]);
  // Hash navigation
  useEffect(() => {
    const cleanup = setupHashNavigation(setActiveHash);
    return cleanup;
  }, []);

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      try {
        let revistaData;
        if (edicionId) {
          const { data, error: e } = await supabase.from('revista').select('*').eq('id', edicionId).single();
          if (e) throw e;
          revistaData = data;
        } else {
          const { data, error: e } = await supabase.from('revista').select('*').order('numero', { ascending: false }).limit(1).single();
          if (e) throw e;
          revistaData = data;
        }
        setRevista(revistaData);

        if (revistaData.contribuyentes) {
          setContributors(revistaData.contribuyentes.split(',').map(n => n.trim()));
        }

        const { data: authorsData, error: ae } = await supabase
          .from('revista_autor').select('autor(nombre)').eq('id_revista', revistaData.id);
        if (ae) throw ae;
        if (authorsData?.length > 0) {
          const names = authorsData.map(i => i.autor.nombre).sort();
          setAllAuthors(names);
          setAutores(names);
          if (!revistaData.contribuyentes?.trim()) setContributors(names);
        }
         const { data: autorData, error: autorError } = await supabase
          .from('autor')
          .select('nombre')
          .eq('id', 63)
          .single();
        if (!autorError && autorData) setAutorEspecial(autorData.nombre);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load magazine data');
        setLoading(false);
      }
    };
    fetchData();
  }, [edicionId]);

  // Rotating author position
  const generateSafePosition = () => {
    const isMobile = windowWidth < 768;
    const m = isMobile
      ? { top: 25, bottom: 35, left: 25, right: 25 }
      : { top: 15, bottom: 30, left: 20, right: 20 };
    if (isMobile) {
      return {
        top:  `${Math.floor(Math.random() * (100 - m.bottom - m.top))  + m.top}%`,
        left: `${Math.floor(Math.random() * (100 - m.right - m.left)) + m.left}%`,
      };
    }
    const zones = [
      { topMin: m.top, topMax: 50, leftMin: m.left, leftMax: 100 - m.right },
      { topMin: m.top, topMax: 45, leftMin: m.left, leftMax: 70 },
    ];
    const z = zones[Math.floor(Math.random() * zones.length)];
    return {
      top:  `${Math.floor(Math.random() * (z.topMax - z.topMin))  + z.topMin}%`,
      left: `${Math.floor(Math.random() * (z.leftMax - z.leftMin)) + z.leftMin}%`,
    };
  };

  useEffect(() => {
    if (!allAuthors.length) return;
    const interval = setInterval(() => {
      setVisibleAuthorIndex(prev => (prev + 1) % allAuthors.length);
      setAuthorPosition(generateSafePosition());
    }, 3000);
    return () => clearInterval(interval);
  }, [allAuthors, windowWidth]);

  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: '2-digit' });
  };

  // ── Derived values ──
  const isDesktop = windowWidth > 840;
  const isMobile  = !isDesktop;

  const menuItems = [
   {
    path: revista?.id === 3 
       ? `/autor/${autorEspecial}` 
      : `/creaciones?edicion=${revista?.id || edicionId || ''}`,
    title: revista?.id === 3 ? (autorEspecial?.toUpperCase() || 'Cargando...') : 'EL HORMIGUERO',
    subtitle: revista?.id === 3 ? 'Obra poética' : 'Poemas en verso y prosa',
    delay: 0,
  },
  {
    path: `/critica?edicion=${revista?.id || edicionId || ''}`,
    title: revista?.id === 3 ? 'TEJER LUZ A PERPETUIDAD' : 'OTROS BICHOS',
    subtitle: revista?.id === 3 ? 'Ensayos, entrevistas y traducciones' : 'Ensayos, entrevistas y traducciones',
    delay: 0.3,
  },
  ...(revista?.id === 1 || revista?.numero === 1 ? [{
    path: `/visuales?edicion=${revista?.id || edicionId || ''}`,
    title: 'A OJO DE HORMIGA',
    subtitle: 'Artista visual',
    delay: 0.6,
  }] : []),
];

  // ── Render helpers ──
  const renderHormigueroTitle = () => (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
      {['HORMIGUERO', 'DE POEMAS'].map((word, index) => (
        <ScrollReveal key={index} delay={200 + index * 200} direction={['left', 'up'][index]}>
          <span style={{
            fontWeight: ['900', '300'][index],
            display: 'inline-block',
            letterSpacing: word === 'HORMIGUERO' ? '2px' : '1px',
            fontSize: index === 0 ? (isDesktop ? '6rem' : '2.5rem') : (isDesktop ? '4.5rem' : '1.5rem'),
            lineHeight: '0.9',
            color: 'white',
            textShadow: '2px 2px 2px rgba(0,0,0,0.5)',
          }}>
            {word}
          </span>
        </ScrollReveal>
      ))}
    </div>
  );

  const renderEditionTitle = () => {
    const words = (revista?.nombre?.toUpperCase() || '').split(' ');
    return (
      <h2 style={{
        fontWeight: 'bold', display: 'flex', flexWrap: 'wrap',
        justifyContent: 'flex-start', gap: '12px',
        margin: '0 0 15px 0', lineHeight: '1.1',
        textShadow: '2px 2px 2px rgba(0,0,0,0.5)',
      }}>
        {words.map((word, index) => {
          const fontWeight = (index === 0 || index === 2 || index === 4) ? '900' : '300';
          const directions = ['left', 'up', 'right', 'left', 'up'];
          return (
            <ScrollReveal key={index} delay={2000 + index * 150} direction={directions[index] || 'up'}>
              <span style={{ fontWeight, display: 'inline-block', letterSpacing: '0.5px', fontSize: 'clamp(1.5rem, 5vw, 4.5rem)' }}>
                {word}
              </span>
            </ScrollReveal>
          );
        })}
      </h2>
    );
  };

  // "EDICIÓN N — NOMBRE" animated section title
  const renderSectionTitle = () => {
    const title = revista?.nombre?.toUpperCase() || '';
    const words = title.split(' ');
    const getAnimationOrder = (total) => {
      const order = [];
      const mid = Math.floor(total / 2);
      order.push(mid);
      for (let i = 1; i <= Math.max(mid, total - mid - 1); i++) {
        if (mid - i >= 0) order.push(mid - i);
        if (mid + i < total) order.push(mid + i);
      }
      return order;
    };
    const animOrder = getAnimationOrder(words.length);

    return (
      <h2 className="edition-title" style={{ fontWeight: 'bold', display: 'flex', flexWrap: 'wrap', justifyContent: 'center' }}>
        {words.map((word, index) => {
          const fontWeight = (index === 1 || index === words.length - 1) ? '1000' : '300';
          const animIndex = animOrder.indexOf(index);
          const delay = animIndex * 150;
          let direction;
          if (index < words.length / 3) direction = 'up';
          else if (index < 2 * words.length / 3) direction = index % 2 === 0 ? 'left' : 'right';
          else direction = 'down';
          return (
            <ScrollReveal key={index} delay={delay} direction={direction} className="mx-1">
              <span style={{ fontWeight, display: 'inline-block', margin: '0 5px', opacity: 0.9 }}>
                {word}
              </span>
            </ScrollReveal>
          );
        })}
      </h2>
    );
  };

  // ── Loading / Error ──
  if (loading) return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Cargando...</div>;
  if (error)   return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Error: {error}</div>;

  return (
    <>
      <Helmet>
        <title>{revista?.nombre ? `Hormiguero de Poemas - ${revista.nombre}` : 'Hormiguero de Poemas'}</title>
        <meta name="description" content={revista?.general && revista?.nombre ? `${revista.general} Edición ${revista.numero}: ${revista.nombre}.` : 'Hormiguero de Poemas - Revista de literatura especializada en poesía.'} />
        <meta name="keywords" content="poesía, literatura, revista, hormiguero, poemas, verso, prosa" />
        <meta property="og:title" content={revista?.nombre ? `Hormiguero de Poemas - ${revista.nombre}` : 'Hormiguero de Poemas'} />
        <meta property="og:description" content={revista?.general ? `${revista.general} Descubre la edición ${revista?.numero}: ${revista?.nombre}.` : 'Revista de literatura especializada en poesía.'} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://hormiguerodepoemas.com/" />
        <meta property="og:image" content={revista?.portada || '/assets/anticon.svg'} />
        <meta property="og:image:alt" content={`Portada de ${revista?.nombre || 'Hormiguero de Poemas'}`} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={revista?.nombre ? `Hormiguero de Poemas - ${revista.nombre}` : 'Hormiguero de Poemas'} />
        <meta name="twitter:description" content={revista?.general ? `${revista.general} Edición ${revista?.numero}: ${revista?.nombre}.` : 'Revista de literatura especializada en poesía.'} />
        <meta name="twitter:image" content={revista?.portada || '/default-cover.jpg'} />
        <meta name="twitter:site" content="@hormiguerodepoemas" />
        <meta name="author" content="Hormiguero de Poemas" />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href="https://hormiguerodepoemas.com/" />
      </Helmet>

      <div className="edition-container scroll-reveal-container">
        <CustomStyles />

        {/* ══════════════════════════════════════════════
            HERO — portada de la edición con fondo
        ══════════════════════════════════════════════ */}
        <div
          ref={coverImageRef}
          className="cover-image"
          id="main-content"
          style={{
            backgroundImage: revista?.portada ? `url(${revista.portada})` : 'none',
            position: 'relative',
            overflow: 'hidden',
            minHeight: isDesktop ? '190vh' : '800px',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <div className="texture-overlay" />

          {/* Insect colony background */}
          {revista?.id !== 3 && (
            <div style={{ position: 'absolute', top: '80px', left: 0, width: '100%', height: '100%', zIndex: 0, pointerEvents: 'none' }}>
              <InsectColony insects={insects.filter(i => i.type === 'mosquito')} count={10} />
            </div>
          )}
          <div className="texture-overlay" />

          {/* Top left — magazine identity */}
          

          {/* Center — edition title + authors + CTA */}
          <div style={{
            position: 'absolute', top: '60%', left: '10px',
            transform: 'translateY(-50%)', color: 'white', zIndex: 10,
            maxWidth: windowWidth <= 768 ? '90%' : '60%', textAlign: 'left',
          }}>
            <ScrollReveal direction="up" delay={2000}>
              {renderEditionTitle()}
            </ScrollReveal>


            <ScrollReveal direction="up" delay={1000}>
              <div style={{ fontSize: 'clamp(0.8rem, 2vw, 1.4rem)', fontWeight: '300', letterSpacing: '1px', width: '95%', marginTop: '2rem', textShadow: '2px 2px 2px rgba(0,0,0,1)' }}>
                {revista?.fecha_publicacion ? formatDate(revista.fecha_publicacion) : ''} EDICIÓN {revista?.numero || ''}
              </div>
            </ScrollReveal>

            <div style={{ maxWidth: windowWidth <= 768 ? '100%' : '65%' }}>
              <ScrollReveal direction="up" delay={1200}>
                <div style={{ fontSize: 'clamp(0.6rem, 1.2vw, 0.9rem)', lineHeight: '1.4', fontWeight: '500', letterSpacing: '0.5px', width: '95%', textShadow: '2px 2px 2px rgba(0,0,0,1)' }}>
                  {autores.length > 0 ? autores.join(' · ') : 'Cargando autores...'}
                </div>
              </ScrollReveal>
            </div>
          </div>
        </div>

        {/* ══════════════════════════════════════════════
            SECCIÓN DETALLE — descripción + menú + hormigueados
        ══════════════════════════════════════════════ */}
        <div
          id="edicion-detalle"
          className="figure-background-container"
          style={{ position: 'relative', minHeight: '100vh', overflow: 'hidden' }}
        >
          {/* Rotating background per edition */}
          {revista?.numero === 2 && (
            <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: -1 }}>
              <RotatingMani supabase={supabase} changeInterval={4000} opacity={0.18} zIndex={-1} />
              <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(255,255,255,0.1)', zIndex: 1 }} />
            </div>
          )}

          {/* ── Título animado de la edición ── */}
          <ScrollReveal direction="up">
            <div className="article-preview">
              {renderSectionTitle()}

              {/* ── Descripción del número (revista.sintesis) ── */}
              <ScrollReveal delay={300} direction="up">
                <div
                  className="article-content"
                  style={revista?.numero === 3 && revista?.bg_sintesis ? {
                    backgroundImage: `url(${revista.bg_sintesis})`,
                    backgroundPosition: 'center',
                    backgroundSize: isDesktop ?  '85%' : '100%',
                    borderRadius: '8px',
                    position: 'relative',
                    backgroundRepeat: 'no-repeat',
                  } : {}}
                >
                  {revista?.numero === 3 && revista?.bg_sintesis && (
                    <div style={{
                      position: 'absolute', inset: 0, borderRadius: '8px',
                      background: 'rgba(255,255,255,0.6)',
                      zIndex: 0,
                    }} />
                  )}
                  <p id="sintesis" style={{
                    whiteSpace: 'pre-line',
                    fontSize: isDesktop ? 'auto' : '11px',
                    position: 'relative', zIndex: 1,
                  }}>
                    {revista?.sintesis || revista?.general || 'Cargando contenido...'}
                  </p>
                </div>
              </ScrollReveal>

              {/* ── Menú de contenidos ── */}
              <ScrollReveal direction="scale" delay={400}>
                <div
                  className="menu-background-section"
                  style={{
                    position: 'relative',
                    padding: isMobile ? '0' : revista?.numero === 1 ? '100px 10px' : revista?.numero === 2 ? '400px 10px' : '250px 10px',                    
                    margin: isMobile ? '30px 0' : '0px 0',
                    overflow: 'hidden',
                  }}
                >
                  {/* Per-edition background inside menu */}
                  {revista?.numero === 2 ? (
                    <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 0 }}>
                      <RotatingBackground changeInterval={850} opacity={0.65} zIndex={-1} supabase={supabase} />
                    </div>
                  ) : revista?.numero === 1 ? (
                    <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 0 }}>
                      <InsectColony insects={localInsects} count={25} />
                    </div>
                  ) : revista?.numero === 3 && revista?.bg_menu ? (
                    <div style={{
                      position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 0,
                      backgroundImage: `url(${revista.bg_menu})`,
                      backgroundSize: isDesktop ?  '40%' : '65%',
                      backgroundRepeat: 'no-repeat',
                      backgroundPosition: 'center',
                    }} />
                  ) : null}

                  <div className="vertical-menu" style={{ display: 'grid', gap: '30px', padding: '8px', width: '100%', fontSize: '1.3rem', position: 'relative', zIndex: 1 }}>
                    {menuItems.map((item, index) => {
                      const directions = ['left', 'right', 'up'];
                      return (
                        <ScrollReveal key={index} delay={index * 200} direction={directions[index % directions.length]}>
                          <Link
                            to={item.path}
                            className="menu-item"
                            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textDecoration: 'none', color: 'black', justifyContent: 'center', textAlign: 'center', padding: '20px', position: 'relative', zIndex: 2 }}
                          >
                            <div
                              className="menu-text pulsing-text"
                              style={{ fontSize: windowWidth > 728 ? '1.7rem' : '18px', letterSpacing: '1px', animationDelay: `${item.delay}s`, fontWeight: '800', padding: '5px' }}
                            >
                              {item.title}
                            </div>
                            <div
                              className="menu-subtitle"
                              style={{ fontSize: windowWidth > 728 ? '0.9rem' : '0.5rem', letterSpacing: '0.5px', fontWeight: '300', color: 'rgba(0,0,0,0.7)', fontStyle: 'italic' }}
                            >
                              {item.subtitle}
                            </div>
                          </Link>
                        </ScrollReveal>
                      );
                    })}
                  </div>
                </div>
              </ScrollReveal>
             

            </div>
          </ScrollReveal>

          <br />

          {/* ── Hormigueados de esta edición ── */}
          {revista?.id !== 3 && (
            <ScrollReveal direction="right">
              <div id="hormigueados">
                <HormigueadosSection edicionId={revista?.id} />
              </div>
            </ScrollReveal>
          )}

          <br />
          <div id="contacto" />
        </div>
      </div>
    </>
  );
};

export default Edicion;