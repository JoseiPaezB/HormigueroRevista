import React, { useState, useEffect, useRef } from 'react';
import { createClient } from '@supabase/supabase-js';
import { useNavigate, useLocation } from 'react-router-dom';
import { FaBars, FaTimes, FaChevronDown, FaSearch } from 'react-icons/fa';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const Navbar = () => {
  const [isMobile, setIsMobile] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [edicionesDropdownOpen, setEdicionesDropdownOpen] = useState(false);
  const [hormigueadosDropdownOpen, setHormigueadosDropdownOpen] = useState(false);
  const [eventosDropdownOpen, setEventosDropdownOpen] = useState(false);
  const [allEditions, setAllEditions] = useState([]);
  const [hormigueroLogoUrl, setHormigueroLogoUrl] = useState('');

  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);

  const dropdownRef = useRef(null);
  const hormigueadosRef = useRef(null);
  const eventosRef = useRef(null);
  const searchRef = useRef(null);
  const navbarRef = useRef(null);
  const [navbarHeight, setNavbarHeight] = useState(70);
  const searchDebounceRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Keep the mobile menu directly below the actual navbar height.
  useEffect(() => {
    const navbar = navbarRef.current;
    if (!navbar) return;
    const updateHeight = () => setNavbarHeight(navbar.getBoundingClientRect().height);
    updateHeight();
    const observer = new ResizeObserver(updateHeight);
    observer.observe(navbar);
    return () => observer.disconnect();
  }, []);

  // ── Navigate to a page then scroll to a section id ──
  const handleScrollToSection = (sectionId, page = '/') => {
    setMenuOpen(false);
    const tryScroll = () => {
      const el = document.getElementById(sectionId);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      } else {
        setTimeout(() => {
          document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' });
        }, 600);
      }
    };
    if (location.pathname === page) {
      tryScroll();
    } else {
      navigate(page);
      setTimeout(tryScroll, 300);
    }
  };

  useEffect(() => {
    const checkScreenSize = () => setIsMobile(window.innerWidth <= 1050);
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  useEffect(() => {
    if (!isMobile) return;
    const handleClickOutside = (event) => {
      const navbarElement = document.getElementById('navbar');
      const menuElement = document.getElementById('navbar-menu');
      if (menuOpen &&
          navbarElement && !navbarElement.contains(event.target) &&
          menuElement && !menuElement.contains(event.target)) {
        setMenuOpen(false);
      }
    };
    if (menuOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [menuOpen, isMobile]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target))
        setEdicionesDropdownOpen(false);
    };
    if (edicionesDropdownOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [edicionesDropdownOpen]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (hormigueadosRef.current && !hormigueadosRef.current.contains(event.target))
        setHormigueadosDropdownOpen(false);
    };
    if (hormigueadosDropdownOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [hormigueadosDropdownOpen]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (eventosRef.current && !eventosRef.current.contains(event.target))
        setEventosDropdownOpen(false);
    };
    if (eventosDropdownOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [eventosDropdownOpen]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) closeSearch();
    };
    if (searchOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [searchOpen]);

  useEffect(() => {
    if (searchOpen && searchRef.current) {
      const input = searchRef.current.querySelector('input');
      if (input) input.focus();
    }
  }, [searchOpen]);

  useEffect(() => {
    if (!searchQuery.trim()) { setSearchResults([]); setSearchLoading(false); return; }
    setSearchLoading(true);
    clearTimeout(searchDebounceRef.current);
    searchDebounceRef.current = setTimeout(async () => {
      try {
        const { data, error } = await supabase
          .from('autor').select('id, nombre, imagen, tipo_creacion')
          .ilike('nombre', `%${searchQuery.trim()}%`).limit(6);
        if (error) throw error;
        setSearchResults(data || []);
      } catch (err) {
        console.error('Search error:', err);
        setSearchResults([]);
      } finally {
        setSearchLoading(false);
      }
    }, 300);
    return () => clearTimeout(searchDebounceRef.current);
  }, [searchQuery]);

  useEffect(() => {
    const fetchEditions = async () => {
  try {
    const { data, error } = await supabase
      .from('revista').select('id, numero').order('numero', { ascending: false });
    if (error) throw error;
    setAllEditions((data || []));
  } catch (err) { console.error('Error fetching editions:', err); }
};
    fetchEditions();
  }, []);

  useEffect(() => {
    const fetchLogo = async () => {
      try {
        const { data, error } = await supabase.from('caras2').select('url');
        if (error) throw error;
        if (data?.length > 0) setHormigueroLogoUrl(data[0].url);
      } catch (err) { console.error('Error fetching logo:', err); }
    };
    fetchLogo();
  }, []);

  const closeSearch = () => { setSearchOpen(false); setSearchQuery(''); setSearchResults([]); };

  const handleAuthorClick = (authorName) => {
    navigate(`/autor/${encodeURIComponent(authorName)}`);
    closeSearch();
    setMenuOpen(false);
  };

  const handleEditionClick = (editionId) => {
    navigate(`/edicion?edicion=${editionId}`);
    setEdicionesDropdownOpen(false);
    setMenuOpen(false);
  };

  const handleHormigueadosEditionClick = (editionId) => {
    setHormigueadosDropdownOpen(false);
    setMenuOpen(false);
    navigate(`/edicion?edicion=${editionId}`);
    setTimeout(() => {
      const el = document.getElementById('hormigueados');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      } else {
        setTimeout(() => {
          document.getElementById('hormigueados')?.scrollIntoView({ behavior: 'smooth' });
        }, 600);
      }
    }, 300);
  };

  const handleEventosClick = () => {
    setEventosDropdownOpen(false);
    setMenuOpen(false);
    navigate('/eventos');
  };

  const getLogoSize = () => ({ width: isMobile ? '60px' : '60px', height: 'auto' });
  const navFontSize = 'clamp(11px, 0.85vw, 14px)';
  const desktopNavGap = 'clamp(8px, 1.1vw, 18px)';
  const mobileMenuFontSize = '17px';
  const mobileSubmenuFontSize = '14px';

  const dropdownMenuStyle = {
    position: 'absolute', top: '100%', right: 0, marginTop: '10px',
    backgroundColor: 'white', border: '1px solid #ddd', borderRadius: '4px',
    boxShadow: '0 4px 6px rgba(0,0,0,0.1)', minWidth: '180px', zIndex: 1001,
  };
  const dropdownBtnStyle = (index, total) => ({
    display: 'block', width: '100%', padding: '12px 20px',
    textAlign: 'left', background: 'none', border: 'none',
    borderBottom: index < total - 1 ? '1px solid #eee' : 'none',
    cursor: 'pointer', fontSize: '14px', color: '#000',
    transition: 'background-color 0.2s ease',
  });

  // Footer sections — all live on '/' (the Default landing page)
  const footerLinks = [
    { id: 'colaboradores', label: 'COLABORADORES', page: '/' },
    { id: 'contacto',      label: 'CONTACTO',      page: '/' },
    { id: 'suscribir',     label: 'SUSCRÍBETE',    page: '/' },
  ];

  return (
    <>
      <nav
        id="navbar"
        ref={navbarRef}
        style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          padding: isMobile ? '2px 12px' : '10px 20px',
          width: '100%', backgroundColor: 'white',
          position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000,
          boxSizing: 'border-box',
        }}
      >
        {/* ── LEFT: Search ── */}
        <div style={{ width: isMobile ? '20%' : 'auto', flex: isMobile ? 'none' : '1 1 0', minWidth: 0, display: 'flex', alignItems: 'center' }}>
          <div ref={searchRef} style={{ position: 'relative', zIndex: searchOpen ? 3 : 'auto' }}>
            {!searchOpen && (
              <button onClick={() => setSearchOpen(true)} aria-label="Buscar autor"
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', display: 'flex', alignItems: 'center', color: '#000', transition: 'opacity 0.2s ease' }}
                onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.5')}
                onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}>
                <FaSearch size={isMobile ? 15 : 14} />
              </button>
            )}
            {searchOpen && (
              <div>
                <style>{`
                  @keyframes expandSearch {
                    from { opacity: 0; transform: scaleX(0.6); transform-origin: left; }
                    to   { opacity: 1; transform: scaleX(1);   transform-origin: left; }
                  }
                `}</style>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', animation: 'expandSearch 0.25s ease forwards', position: 'absolute', left: 0, top: '50%', transform: 'translateY(-50%)', backgroundColor: 'white', padding: '6px 8px', boxShadow: '0 2px 10px rgba(0,0,0,0.08)' }}>
                  <FaSearch size={12} color="#999" style={{ flexShrink: 0 }} />
                  <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Buscar autor..."
                    style={{ border: 'none', borderBottom: '1px solid #000', outline: 'none', fontSize: isMobile ? '12px' : '13px', fontFamily: 'inherit', color: '#000', background: 'transparent', width: isMobile ? '110px' : '180px', padding: '2px 0' }}
                  />
                  <button onClick={closeSearch} aria-label="Cerrar búsqueda"
                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '2px', display: 'flex', alignItems: 'center', color: '#999', flexShrink: 0 }}>
                    <FaTimes size={10} />
                  </button>
                </div>
                {(searchLoading || searchResults.length > 0 || (searchQuery.trim() && !searchLoading)) && (
                  <div style={{ position: 'absolute', top: `${navbarHeight / 2 + 18}px`, left: 0, backgroundColor: 'white', border: '1px solid #e0e0e0', borderRadius: '4px', boxShadow: '0 6px 16px rgba(0,0,0,0.12)', minWidth: isMobile ? '200px' : '260px', zIndex: 1002, overflow: 'hidden' }}>
                    {searchLoading && <div style={{ padding: '14px 16px', color: '#999', fontSize: '13px' }}>Buscando...</div>}
                    {!searchLoading && searchResults.length === 0 && searchQuery.trim() && (
                      <div style={{ padding: '14px 16px', color: '#999', fontSize: '13px' }}>Sin resultados para "{searchQuery}"</div>
                    )}
                    {!searchLoading && searchResults.map((author, index) => (
                      <button key={author.id} onClick={() => handleAuthorClick(author.nombre)}
                        style={{ display: 'flex', alignItems: 'center', gap: '10px', width: '100%', padding: '10px 14px', background: 'none', border: 'none', borderBottom: index < searchResults.length - 1 ? '1px solid #f0f0f0' : 'none', cursor: 'pointer', textAlign: 'left', transition: 'background-color 0.15s ease' }}
                        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f7f7f7')}
                        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}>
                        {author.imagen ? (
                          <img src={author.imagen} alt={author.nombre} style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover', flexShrink: 0, border: '1px solid #eee' }} />
                        ) : (
                          <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: '14px', color: '#999', fontWeight: 'bold' }}>
                            {author.nombre.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <div>
                          <div style={{ fontSize: '13px', fontWeight: '500', color: '#000' }}>{author.nombre}</div>
                          {author.tipo_creacion && (
                            <div style={{ fontSize: '11px', color: '#999', textTransform: 'uppercase', marginTop: '1px' }}>{author.tipo_creacion}</div>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* ── CENTER: Logo ── */}
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: isMobile ? '60%' : 'auto', ...(isMobile ? {} : { position: 'absolute', left: '50%', transform: 'translateX(-50%)', pointerEvents: 'none' }) }}>
          <a href="/" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', pointerEvents: 'auto' }}>
            <img src={hormigueroLogoUrl} alt="Hormiga" style={getLogoSize()} />
          </a>
        </div>

        {/* ── RIGHT: Nav links / Hamburger ── */}
        <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? 0 : desktopNavGap, width: isMobile ? '20%' : 'auto', flex: isMobile ? 'none' : '0 1 auto', minWidth: 0, justifyContent: 'flex-end' }}>
          {!isMobile && (
            <div style={{ display: 'flex', flexWrap: 'nowrap', justifyContent: 'flex-end', alignItems: 'center', gap: desktopNavGap, whiteSpace: 'nowrap' }}>

              {/* EDICIONES */}
              <div ref={dropdownRef} style={{ position: 'relative' }}>
                <button onClick={() => setEdicionesDropdownOpen(!edicionesDropdownOpen)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#000', textTransform: 'uppercase', fontSize: navFontSize, fontWeight: '500', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: '5px', padding: 0 }}>
                  EDICIONES
                  <FaChevronDown size={10} style={{ transform: edicionesDropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.3s ease' }} />
                </button>
                {edicionesDropdownOpen && (
                  <div style={dropdownMenuStyle}>
                    {allEditions.map((edition, index) => (
                      <button key={edition.id} onClick={() => handleEditionClick(edition.id)}
                        style={dropdownBtnStyle(index, allEditions.length)}
                        onMouseEnter={(e) => (e.target.style.backgroundColor = '#f5f5f5')}
                        onMouseLeave={(e) => (e.target.style.backgroundColor = 'transparent')}>
                        Edición {edition.numero}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* HORMIGUEADOS — always dropdown */}
              <div ref={hormigueadosRef} style={{ position: 'relative' }}>
                <button onClick={() => setHormigueadosDropdownOpen(!hormigueadosDropdownOpen)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#000', textTransform: 'uppercase', fontSize: navFontSize, fontWeight: '500', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: '5px', padding: 0 }}>
                  HORMIGUEADOS
                  <FaChevronDown size={10} style={{ transform: hormigueadosDropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.3s ease' }} />
                </button>
                {hormigueadosDropdownOpen && (
                  <div style={dropdownMenuStyle}>
                    {allEditions.map((edition, index) => (
                      <button key={edition.id} onClick={() => handleHormigueadosEditionClick(edition.id)}
                        style={dropdownBtnStyle(index, allEditions.length)}
                        onMouseEnter={(e) => (e.target.style.backgroundColor = '#f5f5f5')}
                        onMouseLeave={(e) => (e.target.style.backgroundColor = 'transparent')}>
                        Hormigueados Edición {edition.numero}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* EVENTOS */}
              <div ref={eventosRef} style={{ position: 'relative' }}>
                <button onClick={() => setEventosDropdownOpen(!eventosDropdownOpen)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#000', textTransform: 'uppercase', fontSize: navFontSize, fontWeight: '500', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: '5px', padding: 0 }}>
                  EVENTOS
                  <FaChevronDown size={10} style={{ transform: eventosDropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.3s ease' }} />
                </button>
                {eventosDropdownOpen && (
                  <div style={dropdownMenuStyle}>
                    <button onClick={handleEventosClick}
                      style={dropdownBtnStyle(0, 1)}
                      onMouseEnter={(e) => (e.target.style.backgroundColor = '#f5f5f5')}
                      onMouseLeave={(e) => (e.target.style.backgroundColor = 'transparent')}>
                      Eventos
                    </button>
                  </div>
                )}
              </div>

              {/* COLABORADORES / CONTACTO / SUSCRÍBETE */}
              {footerLinks.map(({ id, label, page }) => (
                <button key={id} onClick={() => handleScrollToSection(id, page)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#000', textTransform: 'uppercase', fontSize: navFontSize, fontWeight: '500', whiteSpace: 'nowrap', padding: 0 }}>
                  {label}
                </button>
              ))}
            </div>
          )}

          {isMobile && (
            <button aria-label="Menu" style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }} onClick={() => setMenuOpen(!menuOpen)}>
              {menuOpen ? <FaTimes size={18} color="#000" /> : <FaBars size={18} color="#000" />}
            </button>
          )}
        </div>
      </nav>

      {/* ── Mobile menu ── */}
      {isMobile && menuOpen && (
        <div id="navbar-menu" style={{ position: 'fixed', top: `${navbarHeight}px`, left: 0, right: 0, backgroundColor: 'white', borderBottom: '1px solid #ddd', zIndex: 999, boxShadow: '0 4px 6px rgba(0,0,0,0.1)', padding: '20px', maxHeight: `calc(100dvh - ${navbarHeight}px)`, overflowY: 'auto', boxSizing: 'border-box', transition: 'all 0.3s ease' }}>
          <ul style={{ listStyleType: 'none', margin: 0, padding: 0, fontFamily: 'inherit', fontSize: mobileMenuFontSize, fontWeight: 400, lineHeight: 1.4 }}>

            <li style={{ padding: '10px 0', borderBottom: '1px solid #eee' }}>
              <a href="/" style={{ textDecoration: 'none', color: '#000', font: 'inherit' }} onClick={() => setMenuOpen(false)}>INICIO</a>
            </li>

            {/* EVENTOS */}
            <li style={{ padding: '10px 0', borderBottom: '1px solid #eee' }}>
              <div onClick={() => setEventosDropdownOpen(!eventosDropdownOpen)} style={{ color: '#000', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: mobileMenuFontSize, fontWeight: 400 }}>
                EVENTOS
                <FaChevronDown size={10} style={{ transform: eventosDropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.3s ease' }} />
              </div>
              {eventosDropdownOpen && (
                <ul style={{ listStyleType: 'none', margin: '10px 0 0 0', padding: '0 0 0 15px' }}>
                  <li style={{ padding: '8px 0' }}>
                    <button onClick={handleEventosClick} style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', color: '#666', fontSize: mobileSubmenuFontSize, fontFamily: 'inherit', fontWeight: 400 }}>
                      Eventos
                    </button>
                  </li>
                </ul>
              )}
            </li>

            {/* EDICIONES */}
            <li style={{ padding: '10px 0', borderBottom: '1px solid #eee' }}>
              <div onClick={() => setEdicionesDropdownOpen(!edicionesDropdownOpen)} style={{ color: '#000', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: mobileMenuFontSize, fontWeight: 400 }}>
                EDICIONES
                <FaChevronDown size={10} style={{ transform: edicionesDropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.3s ease' }} />
              </div>
              {edicionesDropdownOpen && (
                <ul style={{ listStyleType: 'none', margin: '10px 0 0 0', padding: '0 0 0 15px' }}>
                  {allEditions.map((edition) => (
                    <li key={edition.id} style={{ padding: '8px 0' }}>
                      <button onClick={() => handleEditionClick(edition.id)} style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', color: '#666', fontSize: mobileSubmenuFontSize, fontFamily: 'inherit', fontWeight: 400 }}>
                        Edición {edition.numero}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </li>

            {/* HORMIGUEADOS */}
            <li style={{ padding: '10px 0', borderBottom: '1px solid #eee' }}>
              <div onClick={() => setHormigueadosDropdownOpen(!hormigueadosDropdownOpen)} style={{ color: '#000', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: mobileMenuFontSize, fontWeight: 400 }}>
                HORMIGUEADOS
                <FaChevronDown size={10} style={{ transform: hormigueadosDropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.3s ease' }} />
              </div>
              {hormigueadosDropdownOpen && (
                <ul style={{ listStyleType: 'none', margin: '10px 0 0 0', padding: '0 0 0 15px' }}>
                  {allEditions.map((edition) => (
                    <li key={edition.id} style={{ padding: '8px 0' }}>
                      <button onClick={() => handleHormigueadosEditionClick(edition.id)} style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', color: '#666', fontSize: mobileSubmenuFontSize, fontFamily: 'inherit', fontWeight: 400 }}>
                        Hormigueados Edición {edition.numero}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </li>

            {/* COLABORADORES / CONTACTO / SUSCRÍBETE */}
            {footerLinks.map(({ id, label, page }) => (
              <li key={id} style={{ padding: '10px 0', borderBottom: '1px solid #eee' }}>
                <button onClick={() => handleScrollToSection(id, page)} style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', color: '#000', textTransform: 'uppercase', fontSize: mobileMenuFontSize, fontFamily: 'inherit', fontWeight: 400 }}>
                  {label}
                </button>
              </li>
            ))}

          </ul>
        </div>
      )}
    </>
  );
};

export default Navbar;