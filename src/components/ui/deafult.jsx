import React, { useState, useEffect, useRef } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { createClient } from '@supabase/supabase-js';

import HormigueadosSection from './hormigueados';
import Footer from './footer';
import ScrollReveal from './ScrollReveal';
import { setupHashNavigation } from './scrollUtils';
import '../ui/ScrollReveal.css';
import {insects} from '../../data/insects'
import InsectColony from './MovingSvgBackground';
import { Helmet } from 'react-helmet';
import RotatingMani from './rotatingMani';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

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
      100% { opacity: 1; transform: translateY(0) scale(1);      filter: blur(0);   }
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

    /* ── Edition cards ── */
    .ed-card {
      cursor: pointer;
      transition: transform 0.3s ease, box-shadow 0.3s ease;
      text-decoration: none;
      color: inherit;
      display: block;
    }
    .ed-card:hover { transform: translateY(-5px); box-shadow: 0 12px 30px rgba(0,0,0,0.18) !important; }
    .ed-card:hover .ed-card-img { transform: scale(1.04); }
    .ed-card-img { transition: transform 0.4s ease; width: 100%; height: 100%; object-fit: cover; display: block; }
  `}</style>
);

// ─── Edition Cards ────────────────────────────────────────────────────────────
const EditionCards = ({ isDesktop }) => {
  const [editions, setEditions] = useState([]);
  const [loadingCards, setLoadingCards] = useState(true);

  useEffect(() => {
    supabase
      .from('revista')
      .select('id, numero, nombre, portada')
      .order('numero', { ascending: true })
      .then(({ data, error }) => {
        if (!error) setEditions(data || []);
        setLoadingCards(false);
      });
  }, []);

  if (loadingCards || editions.length === 0) return null;

  const cardW = isDesktop ? 275 : 120;
  const cardH = isDesktop ? 375 : 180;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center',marginTop: '2rem' }}>

      {/* Label */}
      <ScrollReveal direction="up" delay={600}>
        <p style={{
          fontSize: isDesktop ? '20px' : '8px',
          letterSpacing: '3px',
          textTransform: 'uppercase',
          color: '#000',
          opacity: 0.45,
          fontWeight: '500',
          margin: '0 0 12px 0',
          textAlign: 'center',
        }}>
        </p>
      </ScrollReveal>

      {/* Cards — flex row, always centered */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: isDesktop ? '20px' : '10px',
        justifyContent: 'center',
      }}>
        {editions.map((edition, i) => (
          <ScrollReveal key={edition.id} direction="up" delay={700 + i * 110}>
            <Link
              to={`/edicion?edicion=${edition.id}`}
              className="ed-card"
              style={{
                width: `${cardW}px`,
                backgroundColor: 'transparent',
                boxShadow: '0 6px 24px rgba(0,0,0,0.22)',
                overflow: 'hidden',
                position: 'relative',   // so the title overlay works
                display: 'block',
              }}
            >
              {/* Cover image — full card height, no footer bar */}
              <div style={{ width: `${cardW}px`, height: `${cardH}px`, overflow: 'hidden', backgroundColor: '#ececec', position: 'relative' }}>
                {edition.portada
                  ? <img src={edition.portada} alt={`Edición ${edition.numero}`} className="ed-card-img" />
                  : (
                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', color: '#bbb' }}>
                      №{edition.numero}
                    </div>
                  )
                }

                {/* Title overlaid at bottom of image with gradient */}
                <div style={{
                  position: 'absolute',
                  bottom: 0, left: 0, right: 0,
                  padding: isDesktop ? '28px 10px 10px' : '20px 8px 8px',
                  background: 'linear-gradient(to top, rgba(0,0,0,0.72) 0%, transparent 100%)',
                }}>
                  <div style={{
                    fontSize: isDesktop ? '8px' : '7px',
                    letterSpacing: '1.5px',
                    textTransform: 'uppercase',
                    color: 'rgba(255,255,255,0.65)',
                    marginBottom: '3px',
                  }}>
                    Nº {edition.numero}
                  </div>
                  {edition.nombre && (
                    <div style={{
                      fontSize: isDesktop ? '12px' : '10px',
                      fontWeight: '700',
                      color: '#fff',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      letterSpacing: '0.3px',
                    }}>
                      {edition.nombre}
                    </div>
                  )}
                </div>
              </div>
            </Link>
          </ScrollReveal>
        ))}
      </div>
    </div>
  );
};

// ─── Main component ───────────────────────────────────────────────────────────
const Default = () => {
  const [searchParams] = useSearchParams();
  const edicionId = searchParams.get('edicion');

  const [revista, setRevista] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [contributors, setContributors] = useState([]);
  const [allAuthors, setAllAuthors] = useState([]);
  const [visibleAuthorIndex, setVisibleAuthorIndex] = useState(0);
  const [authorPosition, setAuthorPosition] = useState({ top: '40%', left: '50%' });
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [activeHash, setActiveHash] = useState('');
  const coverImageRef = useRef(null);
  const [autores, setAutores] = useState([]);
  const [viewportHeight, setViewportHeight] = useState(window.innerHeight);
  const editionLinkRef = useRef(null);
  const isEditionLinkVisible = useRef(false);

  useEffect(() => {
    if (!editionLinkRef.current) return;
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !isEditionLinkVisible.current) {
          isEditionLinkVisible.current = true;
          setTimeout(() => { if (editionLinkRef.current) editionLinkRef.current.classList.add('animate-link'); }, 1000);
        }
      });
    }, { threshold: 0.7, rootMargin: '0px' });
    observer.observe(editionLinkRef.current);
    return () => { if (editionLinkRef.current) observer.unobserve(editionLinkRef.current); };
  }, [windowWidth]);

  useEffect(() => {
    const handleResize = () => { setWindowWidth(window.innerWidth); setViewportHeight(window.innerHeight); };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const cleanup = setupHashNavigation(setActiveHash);
    return cleanup;
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        let revistaData;
        if (edicionId) {
          const { data, error: revistaError } = await supabase.from('revista').select('*').eq('id', edicionId).single();
          if (revistaError) throw revistaError;
          revistaData = data;
        } else {
          const { data, error: revistaError } = await supabase.from('revista').select('*').order('numero', { ascending: false }).limit(1).single();
          if (revistaError) throw revistaError;
          revistaData = data;
        }
        setRevista(revistaData);
        if (revistaData.contribuyentes) setContributors(revistaData.contribuyentes.split(',').map(n => n.trim()));
        const { data: authorsData, error: authorsError } = await supabase
          .from('revista_autor').select('autor(nombre)').eq('id_revista', revistaData.id);
        if (authorsError) throw authorsError;
        if (authorsData && authorsData.length > 0) {
          const authorNames = authorsData.map(item => item.autor.nombre).sort();
          setAllAuthors(authorNames);
          setAutores(authorNames);
          if (!revistaData.contribuyentes || revistaData.contribuyentes.trim() === '') setContributors(authorNames);
        }
        setLoading(false);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load magazine data');
        setLoading(false);
      }
    };
    fetchData();
  }, [edicionId]);

  const generateSafePosition = () => {
    const isMobile = windowWidth < 768;
    const margins = isMobile
      ? { top: 25, bottom: 35, left: 25, right: 25 }
      : { top: 15, bottom: 30, left: 20, right: 20 };
    if (isMobile) {
      return {
        top:  `${Math.floor(Math.random() * (100 - margins.bottom - margins.top))  + margins.top}%`,
        left: `${Math.floor(Math.random() * (100 - margins.right - margins.left)) + margins.left}%`,
      };
    }
    const zones = [
      { topMin: margins.top, topMax: 50, leftMin: margins.left, leftMax: 100 - margins.right },
      { topMin: margins.top, topMax: 45, leftMin: margins.left, leftMax: 70 },
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

  const getCurrentAuthor = () => {
    if (allAuthors.length === 0) return contributors.length > 0 ? contributors[0] : 'AUTORES DESTACADOS';
    return allAuthors[visibleAuthorIndex];
  };

  const getAuthorFontSize = () => {
    const author = getCurrentAuthor() || '';
    const isMobile = windowWidth < 768;
    if (author.length > 20) return `${isMobile ? 8 : 14}px`;
    if (author.length > 15) return `${isMobile ? 9 : 16}px`;
    return `${isMobile ? 9 : 15}px`;
  };

  const authorStyle = {
    position: 'absolute',
    top: authorPosition.top, left: authorPosition.left,
    transform: 'translate(-50%, -50%)',
    fontSize: getAuthorFontSize(),
    fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px',
    color: 'white',
    textShadow: '1px 1px 2px black,-1px -1px 2px black,1px -1px 2px black,-1px 1px 2px black',
    transition: 'all 0.5s ease-in-out', whiteSpace: 'nowrap',
    maxWidth: windowWidth < 768 ? '60%' : '90%',
    overflow: 'hidden', textOverflow: 'ellipsis', zIndex: 10,
  };

  const renderHormigueroTitle = () => (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
      {['HORMIGUERO', 'DE POEMAS'].map((word, index) => (
        <ScrollReveal key={index} delay={200 + index * 200} direction={['left', 'up'][index]}>
          <span style={{
            fontWeight: ['900', '300'][index],
            display: 'inline-block',
            letterSpacing: word === 'HORMIGUERO' ? '2px' : '1px',
            fontSize: index === 0 ? (isDesktop ? '6rem' : '2.5rem') : (isDesktop ? '4.5rem' : '1.5rem'),
            lineHeight: '0.9', color: 'black',
            textShadow: '2px 2px 2px rgba(0,0,0,0.5)',
          }}>
            {word}
          </span>
        </ScrollReveal>
      ))}
    </div>
  );

  const renderTitle = () => (
    <h2 className="edition-title" style={{ fontWeight: 'bold', display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '12px' }}>
      {'SOBRE EL HORMIGUERO'.split(' ').map((word, index) => (
        <ScrollReveal key={index} delay={index * 200} direction={['left', 'up', 'right'][index]} className="mx-1">
          <span style={{ fontWeight: ['900', '300', '900'][index], display: 'inline-block', letterSpacing: word === 'HORMIGUERO' ? '1px' : '0.5px', transition: 'all 0.7s ease' }}>
            {word}
          </span>
        </ScrollReveal>
      ))}
    </h2>
  );

  const isDesktop = windowWidth > 840;
  const editionLink = revista ? `/contenidos?edicion=${revista.id}` : '/contenidos';

  if (loading) return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Cargando...</div>;
  if (error)   return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Error: {error}</div>;

  return (
    <>
      <Helmet>
        <title>{revista?.nombre ? `Hormiguero de Poemas - ${revista.nombre}` : 'Hormiguero de Poemas'}</title>
        <meta name="description" content={revista?.general && revista?.nombre ? `${revista.general} Edición ${revista.numero}: ${revista.nombre}.` : "Hormiguero de Poemas - Revista de literatura especializada en poesía."} />
        <meta name="keywords" content="poesía, literatura, revista, hormiguero, poemas, verso, prosa" />
        <meta property="og:title" content={revista?.nombre ? `Hormiguero de Poemas - ${revista.nombre}` : 'Hormiguero de Poemas'} />
        <meta property="og:description" content={revista?.general ? `${revista.general} Descubre la edición ${revista?.numero}: ${revista?.nombre}.` : "Revista de literatura especializada en poesía."} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://hormiguerodepoemas.com/" />
        <meta property="og:image" content={revista?.portada || '/assets/anticon.svg'} />
        <meta property="og:image:alt" content={`Portada de ${revista?.nombre || 'Hormiguero de Poemas'}`} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={revista?.nombre ? `Hormiguero de Poemas - ${revista.nombre}` : 'Hormiguero de Poemas'} />
        <meta name="twitter:description" content={revista?.general ? `${revista.general} Edición ${revista?.numero}: ${revista?.nombre}.` : "Revista de literatura especializada en poesía."} />
        <meta name="twitter:image" content={revista?.portada || '/default-cover.jpg'} />
        <meta name="twitter:site" content="@hormiguerodepoemas" />
        <meta name="author" content="Hormiguero de Poemas" />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href="https://hormiguerodepoemas.com/" />
      </Helmet>

      <div className="edition-container scroll-reveal-container">
        <CustomStyles />

        {/* ── HERO ── */}
        <div
          ref={coverImageRef}
          className="cover-image"
          id="main-content"
          style={{
            backgroundImage: '#fff',
            position: 'relative',
            overflow: 'hidden',
            minHeight: isDesktop ? '130vh' : '800px',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <div className="texture-overlay" />
          <div style={{ position: 'absolute', left: 0, width: '100%', height: '100%', zIndex: 0, pointerEvents: 'none' }}>
            <InsectColony insects={insects.filter(i => i.type === 'mosquito')} count={50} />
          </div>
          <div className="texture-overlay" />

          {/* Title — top left */}
          <div style={{
            position: 'absolute',
            top: '60px',
            left: '10px',
            zIndex: 10,
          }}>
            <ScrollReveal direction="left" delay={2000}>
              <div style={{ position: 'relative', display: 'inline-block' }}>
                {renderHormigueroTitle()}
              </div>
            </ScrollReveal>
            <div style={{ marginTop: '20px' }}>
              <ScrollReveal direction="left" delay={400}>
                <div style={{
                  fontSize: isDesktop ? '1.0rem' : '0.6rem',
                  fontWeight: '500', color: '#000000',
                  lineHeight: '1.3', letterSpacing: '1px', opacity: '0.8',
                }}>
                  REVISTA DE LITERATURA<br />
                  ESPECIALIZADA EN POESÍA
                </div>
              </ScrollReveal>
            </div>
          </div>
          <br/>
          
        
          {/* Edition cards — centered horizontally, pinned to bottom on desktop, higher on mobile */}
          <div style={{
            position: 'absolute',
            bottom: isDesktop ? '40px' : undefined,
            top: isDesktop ? '300px' : '250px',
            left: 0,
            right: 0,
            zIndex: 10,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}>
            <EditionCards isDesktop={isDesktop} />
          </div>
        </div>

        {/* ── ABOUT SECTION ── */}
        <div
          className="figure-background-container"
          style={{ position: 'relative', minHeight: '100vh', overflow: 'hidden' }}
        >
          {revista?.numero === 2 && (
            <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: -1 }} />
          )}

          <ScrollReveal direction="up">
            <div className="article-preview">
              {renderTitle()}
              <ScrollReveal delay={300} direction="up">
                <div className="article-content">
                  <p style={{ whiteSpace: 'pre-line', fontSize: isDesktop ? 'auto' : '11px' }}>
                    {revista?.general || 'Lorem ipsum...'}
                  </p>
                </div>
              </ScrollReveal>
            </div>
          </ScrollReveal>

          <br /><br /><br />

          <ScrollReveal direction="scale">
            <div><Footer /></div>
          </ScrollReveal>
          <div id="contacto" />
        </div>
      </div>
    </>
  );
};

export default Default;