import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { createClient } from '@supabase/supabase-js';
import SVGRenderer from './SVGRenderer';
import { Helmet } from 'react-helmet';
import ScrollReveal from './ScrollReveal';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// ─── Author Search Bar ────────────────────────────────────────────────────────
const AuthorSearchBar = ({ poemarios, onSelect, isDesktop }) => {
  const [query, setQuery] = useState('');
  const [focused, setFocused] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const inputRef = useRef(null);
  const listRef = useRef(null);

  const filtered = query.trim().length === 0
    ? []
    : poemarios.filter(p =>
        p.author.toLowerCase().includes(query.toLowerCase())
      ).slice(0, 2);

  const handleKey = (e) => {
    if (!filtered.length) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex(i => Math.min(i + 1, filtered.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex(i => Math.max(i - 1, 0));
    } else if (e.key === 'Enter' && activeIndex >= 0) {
      handleSelect(filtered[activeIndex]);
    } else if (e.key === 'Escape') {
      setQuery('');
      setFocused(false);
      inputRef.current?.blur();
    }
  };

  const handleSelect = (book) => {
    setQuery(book.author);
    setFocused(false);
    setActiveIndex(-1);
    onSelect(book.id);
  };

  const showDropdown = focused && filtered.length > 0;

  return (
    <div style={{
      width: '100%',
      maxWidth: isDesktop ? '480px' : '100%',
      margin: '0 auto 2.5rem auto',
      position: 'relative',
    }}>
      {/* Input wrapper */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        borderBottom: `2px solid ${focused ? '#000' : '#fff'}`,
        transition: 'border-color 0.25s ease',
        paddingBottom: '6px',
        gap: '10px',
      }}>
        {/* Search icon */}
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={focused ? '#000' : '#fff'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, transition: 'stroke 0.25s ease' }}>
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>

        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={e => { setQuery(e.target.value); setActiveIndex(-1); }}
          onFocus={() => setFocused(true)}
          onBlur={() => setTimeout(() => setFocused(false), 150)}
          onKeyDown={handleKey}
          placeholder="Buscar autor..."
          style={{
            flex: 1,
            background: 'transparent',
            border: 'none',
            outline: 'none',
            fontSize: isDesktop ? '1rem' : '14px',
            fontFamily: 'inherit',
            color: '#fff',
            letterSpacing: '0.03em',
          }}
        />

        {/* Clear button */}
        {query && (
          <button
            onClick={() => { setQuery(''); inputRef.current?.focus(); }}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              padding: '2px', color: '#999', display: 'flex', alignItems: 'center',
              flexShrink: 0,
            }}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        )}
      </div>

      {/* Dropdown results */}
      {showDropdown && (
        <div
          ref={listRef}
          style={{
            position: 'absolute',
            top: 'calc(100% + 4px)',
            left: 0,
            right: 0,
            backgroundColor: 'white',
            border: '1px solid #e0e0e0',
            borderRadius: '3px',
            boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
            zIndex: 100,
            overflow: 'hidden',
          }}
        >
          {filtered.map((book, i) => (
            <button
              key={book.id}
              onMouseDown={() => handleSelect(book)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                width: '100%',
                padding: '10px 14px',
                background: i === activeIndex ? '#f5f5f5' : 'white',
                border: 'none',
                borderBottom: i < filtered.length - 1 ? '1px solid #f0f0f0' : 'none',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'background 0.1s ease',
              }}
              onMouseEnter={() => setActiveIndex(i)}
            >
              {/* Thumbnail */}
              {book.cover && !book.isSVG ? (
                <img
                  src={book.cover}
                  alt={book.author}
                  style={{ width: '32px', height: '32px', objectFit: 'cover', borderRadius: '2px', flexShrink: 0 }}
                />
              ) : (
                <div style={{
                  width: '32px', height: '32px', borderRadius: '2px', backgroundColor: '#f0f0f0',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '13px', fontWeight: 'bold', color: '#999', flexShrink: 0,
                }}>
                  {book.author.charAt(0).toUpperCase()}
                </div>
              )}
              <span style={{ fontSize: '13px', fontWeight: '500', color: '#000', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                {book.author}
              </span>
            </button>
          ))}
        </div>
      )}

      {/* No results */}
      {focused && query.trim() && filtered.length === 0 && (
        <div style={{
          position: 'absolute',
          top: 'calc(100% + 4px)',
          left: 0, right: 0,
          backgroundColor: 'white',
          border: '1px solid #e0e0e0',
          borderRadius: '3px',
          padding: '12px 14px',
          fontSize: '13px',
          color: '#999',
          boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
          zIndex: 100,
        }}>
          Sin resultados para "{query}"
        </div>
      )}
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────
const ContentComponent = ({ contentType }) => {
  const [searchParams] = useSearchParams();
  const edicionId = searchParams.get('edicion');

  const [revista, setRevista] = useState(null);
  const [content, setContent] = useState(null);
  const [poemarios, setPoemarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [contributors, setContributors] = useState([]);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [animatingBookId, setAnimatingBookId] = useState(null);
  const [highlightedAuthorId, setHighlightedAuthorId] = useState(null);

  const displayTitle = contentType.charAt(0).toUpperCase() + contentType.slice(1);
  const isDesktop = windowWidth > 840;

  const isSVG = (str) => {
    if (!str || typeof str !== 'string') return false;
    return str.trim().startsWith('<svg') && str.includes('</svg>');
  };

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);

    const fetchData = async () => {
      try {
        let revistaData;

        if (edicionId) {
          const { data, error: revistaError } = await supabase
            .from('revista').select('*').eq('id', edicionId).single();
          if (revistaError) throw revistaError;
          revistaData = data;
        } else {
          const { data, error: revistaError } = await supabase
            .from('revista').select('*').order('numero', { ascending: false }).limit(1).single();
          if (revistaError) throw revistaError;
          revistaData = data;
        }

        setRevista(revistaData);

        const { data: contentData, error: contentError } = await supabase
          .from('creaciones').select('*')
          .eq('id_revista', revistaData.id).eq('tipo', contentType).single();
        if (contentError) throw contentError;
        setContent(contentData);

        if (contentData.colaboradores) {
          setContributors(contentData.colaboradores.split(',').map(n => n.trim()));
        }

        const { data: poemarioRelations, error: relationsError } = await supabase
          .from('creaciones_poemario').select('id_poemario').eq('id_creacion', contentData.id);
        if (relationsError) throw relationsError;

        const poemarioIds = poemarioRelations.map(r => r.id_poemario);

        if (poemarioIds.length > 0) {
          const { data: poemarioData, error: poemarioError } = await supabase
            .from('poemario').select('*, autor(nombre)').in('id', poemarioIds);
          if (poemarioError) throw poemarioError;

          const poemariosWithCount = await Promise.all(
            poemarioData.map(async (poemario) => {
              const { count, error: countError } = await supabase
                .from('poema').select('*', { count: 'exact', head: true }).eq('id_poemario', poemario.id);
              return {
                id: poemario.id,
                title: poemario.titulo,
                author: poemario.autor ? poemario.autor.nombre : 'Unknown',
                cover: poemario.portada,
                isSVG: isSVG(poemario.portada),
                link: `/autor/${encodeURIComponent(poemario.autor ? poemario.autor.nombre : 'unknown')}?edicion=${revistaData.id}`,
                poemCount: countError ? Math.floor(Math.random() * 10) + 1 : count,
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
    return () => window.removeEventListener('resize', handleResize);
  }, [contentType, edicionId]);

  useEffect(() => {
    window.scrollTo(0, 0);
    if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
    return () => { if ('scrollRestoration' in history) history.scrollRestoration = 'auto'; };
  }, []);

  const getBookSize = (poemCount, sizeCategory) => {
    if (isDesktop) {
      if (sizeCategory === 'large') return { height: '45vh', width: 'auto', gridColumn: 'span 2', isLarge: true };
      if (sizeCategory === 'medium') return { height: '45vh', width: 'auto', gridColumn: 'span 1', isMedium: true };
      return { height: '45vh', width: 'auto', gridColumn: 'span 1', isSmall: true };
    } else {
      if (sizeCategory === 'large') return { height: '240px', width: 'auto', gridColumn: 'span 2', isLarge: true };
      if (sizeCategory === 'medium') return { height: '240px', width: 'auto', gridColumn: 'span 1', isMedium: true };
      return { height: '180px', width: 'auto', gridColumn: 'span 1', isSmall: true };
    }
  };

  const FadeInElement = ({ children, delay = 0 }) => {
    const ref = useRef(null);
    useEffect(() => {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            setTimeout(() => { if (ref.current) { ref.current.classList.add('fade-in-visible'); ref.current.classList.remove('fade-out'); } }, delay);
          } else {
            if (ref.current && !document.body.classList.contains('clicking-mode')) {
              ref.current.classList.remove('fade-in-visible');
              ref.current.classList.add('fade-out');
            }
          }
        });
      }, { root: null, rootMargin: '10px', threshold: 0.1 });
      if (ref.current) observer.observe(ref.current);
      return () => { if (ref.current) observer.unobserve(ref.current); };
    }, [delay]);
    return <div ref={ref} className="fade-in-element">{children}</div>;
  };

  const categorizeBooks = (books) => ({
    small: books.filter(b => b.poemCount == -2),
    medium: books.filter(b => b.poemCount == -1),
    large: books.filter(b => b.poemCount >= 0),
  });

  const arrangeBooks = (books) => {
    const { small, medium, large } = categorizeBooks(books);
    const result = [];
    const maxSets = Math.max(Math.ceil(small.length / 2), Math.ceil(large.length), Math.ceil(medium.length / 2));
    for (let i = 0; i < maxSets; i++) {
      if (i * 2 < small.length) result.push({ ...small[i * 2], sizeCategory: 'small' });
      if (i * 2 + 1 < small.length) result.push({ ...small[i * 2 + 1], sizeCategory: 'small' });
      if (i < large.length) result.push({ ...large[i], sizeCategory: 'large' });
      if (i * 2 < medium.length) result.push({ ...medium[i * 2], sizeCategory: 'medium' });
      if (i * 2 + 1 < medium.length) result.push({ ...medium[i * 2 + 1], sizeCategory: 'medium' });
    }
    return result;
  };

  const arrangedBooks = arrangeBooks(poemarios);

  const getTitleStyles = (sizeInfo, isHighlighted) => {
    if (sizeInfo.isLarge) {
      return {
        position: 'absolute', top: '50%', left: '50%',
        transform: 'translate(-50%, -50%)', textAlign: 'center',
        color: 'white', fontSize: isDesktop ? '1.5rem' : '9px',
        fontWeight: 'bold', letterSpacing: '1px',
        textShadow: '2px 2px 4px rgba(0,0,0,0.8)', width: '100%',
        textTransform: 'uppercase',
        textDecoration: isHighlighted ? 'underline' : 'none',
        textDecorationColor: 'white', textDecorationThickness: '3px',
      };
    }
    return {
      margin: isDesktop ? 0 : '0 0 5px 0',
      fontWeight: 'bold', letterSpacing: '0.5px',
      fontSize: isDesktop ? '2.7rem' : 'inherit',
      textAlign: isDesktop ? 'center' : 'left',
      color: 'white',
      textDecoration: isHighlighted ? 'underline' : 'none',
      textDecorationColor: 'white', textDecorationThickness: '3px',
    };
  };

  // Called by search bar — scroll to book and highlight it
  const handleSearchSelect = useCallback((bookId) => {
    document.querySelectorAll('.fade-in-element').forEach(el => el.classList.add('fade-in-visible'));
    const el = document.getElementById(`book-${bookId}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      setHighlightedAuthorId(bookId);
      setTimeout(() => setHighlightedAuthorId(null), 5000);
    }
  }, []);

  const getSectionTitle = () => {
    switch (contentType.toLowerCase()) {
      case 'creaciones': case 'creaciones2': return 'El Hormiguero';
      case 'critica': case 'crítica': return 'Otros Bichos';
      case 'traducciones': return 'Traducciones';
      case 'rescates': return 'Rescates';
      default: return contentType.charAt(0).toUpperCase() + contentType.slice(1);
    }
  };

  const getSectionSubtitle = () => {
    switch (contentType.toLowerCase()) {
      case 'creaciones': case 'creaciones2': return 'Poemas en verso y prosa';
      case 'critica': case 'crítica': return 'Ensayos, cuentos y críticas';
      case 'traducciones': return 'Traducciones de poesía mundial';
      case 'rescates': return 'Rescates literarios';
      default: return `Contenido de ${contentType}`;
    }
  };

  const getAuthorsNames = () => contributors.slice(0, 8).join(', ');

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: '80px' }}>
        Cargando {getSectionTitle()}...
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: '80px' }}>
        Error: {error}
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>{`${getSectionTitle()} - ${getSectionSubtitle()} | Hormiguero de Poemas`}</title>
        <meta name="description" content={contributors.length > 0 ? `${getSectionTitle()}: ${getSectionSubtitle()}. Autores: ${getAuthorsNames()}.` : `${getSectionTitle()} - ${getSectionSubtitle()} en Hormiguero de Poemas`} />
        <meta name="keywords" content={`${contentType}, ${getSectionTitle().toLowerCase()}, ${getAuthorsNames()}, hormiguero de poemas, literatura, poesía`} />
        <meta property="og:title" content={`${getSectionTitle()} - ${getSectionSubtitle()}`} />
        <meta property="og:description" content={contributors.length > 0 ? `${getSectionTitle()}: ${getSectionSubtitle()}. Con ${contributors.length} autor${contributors.length > 1 ? 'es' : ''}: ${getAuthorsNames()}` : `Descubre ${getSectionTitle()} en Hormiguero de Poemas`} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={`http://hormiguerodepoemas/${contentType}`} />
        <meta property="og:image" content={content?.imagen || (poemarios.length > 0 && poemarios[0].cover) || '/default-section.jpg'} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={`${getSectionTitle()} - ${getSectionSubtitle()}`} />
      </Helmet>

      <div className="edition-container scroll-reveal-container">
        <div className="article-preview" style={{ background: 'rgba(0, 0, 0, 0.25)' }}>

          {/* ── Section title ── */}
          <ScrollReveal direction="up">
            <h2
              className="edition-title"
              style={{ fontWeight: 'bold', marginBottom: '30px', fontSize: isDesktop ? '3rem' : '40px', marginTop: '3rem' }}
            >
              {displayTitle.toLowerCase() === 'creaciones'
                ? (<>EL HORMIGUERO<p className="subtitle" style={{ fontSize: isDesktop ? '1.5rem' : '1rem', fontWeight: 'bold', marginTop: '-0.5rem', marginBottom: '2.5rem', fontStyle: 'italic' }}>POEMAS EN VERSO Y PROSA</p></>)
                : (displayTitle.toLowerCase() === 'critica' || displayTitle.toLowerCase() === 'crítica') && revista?.id === 3
                  ? (<>TEJER LUZ A PERPETUIDAD<p className="subtitle" style={{ fontSize: isDesktop ? '1.5rem' : '1rem', fontWeight: 'bold', marginTop: '-0.5rem', marginBottom: '2.5rem', fontStyle: 'italic' }}>Ensayo, entrevistas y traducciones</p></>)
                  : displayTitle.toLowerCase() === 'critica' || displayTitle.toLowerCase() === 'crítica'
                    ? (<>OTROS BICHOS<p className="subtitle" style={{ fontSize: isDesktop ? '1.5rem' : '1rem', fontWeight: 'bold', marginTop: '-0.5rem', marginBottom: '2.5rem', fontStyle: 'italic' }}>Ensayo, entrevistas y traducciones</p></>)
                    : displayTitle.toUpperCase()
              }
            </h2>
          </ScrollReveal>

          {/* ── Search bar (replaces contributors list) ── */}
          <ScrollReveal direction="up" delay={200}>
            <div style={{
              marginTop: '-1.5rem',
              marginBottom: '2rem',
              padding: isDesktop ? '1.5rem 2rem' : '1.2rem 1rem',
              background: 'transparent',
              boxShadow: isDesktop
                ? '0 6px 80px 25px rgba(0, 0, 0, 0.15)'
                : '0 4px 12px rgba(0, 0, 0, 0.15)',
            }}>
              <AuthorSearchBar
                poemarios={arrangedBooks}
                onSelect={handleSearchSelect}
                isDesktop={isDesktop}
              />

              {/* Subtle author count hint */}
              {contributors.length > 0 && (
                <p style={{
                  textAlign: 'center',
                  fontSize: '11px',
                  color: 'rgb(255, 255, 255)',
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  margin: 0,
                }}>
                  {contributors.length} {contributors.length === 1 ? 'autor' : 'autores'} en esta edición
                </p>
              )}
            </div>
          </ScrollReveal>

          {/* ── Books grid ── */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '20px',
            marginBottom: '40px',
            

          }}>
            {arrangedBooks.map((book, index) => {
              const sizeStyles = getBookSize(book.poemCount, book.sizeCategory);
              const isHighlighted = highlightedAuthorId === book.id;
              const titleStyles = getTitleStyles(sizeStyles, isHighlighted);
              const isLargeBook = sizeStyles.isLarge;

              return (
                <FadeInElement key={book.id} delay={index * 100}>
                  <Link
                    to={book.link}
                    state={{ fromInternal: true, contentType }}
                    style={{
                      textDecoration: 'none',
                      color: 'inherit',
                      display: 'block',
                      gridColumn: isLargeBook ? '1 / span 2' : 'auto',
                    }}
                  >
                    <div
                      id={`book-${book.id}`}
                      style={{
                        position: 'relative',
                        overflow: 'hidden',
                        borderRadius: '4px',
                        transition: 'all 0.4s ease',
                        height: sizeStyles.height,
                        width: '100%',
                        boxShadow: isHighlighted
                          ? '0 0 0 3px #fff, 0 0 30px rgba(255,255,255,0.4)'
                          : '0 8px 12px rgba(0, 0, 0, 0.15)',
                        outline: isHighlighted ? '3px solid white' : 'none',
                        transform: isHighlighted ? 'scale(1.02)' : 'scale(1)',
                      }}
                    >
                      {book.isSVG ? (
                        <SVGRenderer
                          svgString={book.cover}
                          style={{ width: isDesktop ? '65%' : '100%', height: '100%', objectFit: 'cover' }}
                          isAnimating={animatingBookId === book.id}
                          animationType="pulse"
                        />
                      ) : (
                        <img
                          src={book.cover}
                          alt={book.author}
                          style={{ width: isDesktop ? '65%' : '100%', height: '100%', objectFit: 'cover' }}
                        />
                      )}

                      {/* Highlight overlay */}
                      {isHighlighted && (
                        <div style={{
                          position: 'absolute', inset: 0,
                          background: 'rgba(255,255,255,0.08)',
                          pointerEvents: 'none',
                          animation: 'highlightFade 5s ease forwards',
                        }} />
                      )}

                      {isLargeBook ? (
                        <div style={titleStyles}><h3>{book.author.toUpperCase()}</h3></div>
                      ) : (
                        <div style={{
                          position: 'absolute',
                          top: isDesktop ? '50%' : 0,
                          left: 0, padding: '10px',
                          textShadow: '1px 1px 3px rgba(0,0,0,0.7)',
                          width: '100%',
                          transform: isDesktop ? 'translateY(-50%)' : 'none',
                          display: 'flex', flexDirection: 'column',
                          alignItems: isDesktop ? 'center' : 'flex-start',
                        }}>
                          <h4 style={titleStyles}>{book.author.toUpperCase()}</h4>
                        </div>
                      )}
                    </div>
                  </Link>
                </FadeInElement>
              );
            })}
          </div>
        </div>

        <style jsx>{`
          @keyframes highlightFade {
            0%   { opacity: 1; }
            70%  { opacity: 1; }
            100% { opacity: 0; }
          }

          .fade-in-element {
            opacity: 0;
            transform: translateY(30px);
            transition: opacity 0.6s ease-out, transform 0.6s ease-out;
            will-change: opacity, transform;
          }
          .fade-in-visible {
            opacity: 1;
            transform: translateY(0);
          }
          .fade-out {
            opacity: 0;
            transform: translateY(-30px);
            transition: opacity 0.6s ease-in, transform 0.6s ease-in;
          }
          .clicking-mode .fade-in-element {
            transition: none !important;
            opacity: 1 !important;
            transform: translateY(0) !important;
          }
          .scroll-reveal-container {
            overflow-x: hidden;
          }
        `}</style>
      </div>
    </>
  );
};

export default ContentComponent;
