import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import hormigueroLogo from '/assets/anticon.svg';
import { createClient } from '@supabase/supabase-js';
import {insects} from '../../data/insects'
import InsectColony from './MovingSvgBackground'; // Adjust the path as needed

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const HormigueadosSection = () => {
  const [carouselItems, setCarouselItems] = useState([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const carouselRef = useRef(null);

  // Detectar el ancho de la ventana y actualizarlo cuando cambie
  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const fetchPoems = async () => {
      const { data, error } = await supabase
        .from('poema')
        .select(`
          id,
          titulo,
          fecha,
          portada,
          hormigueos,
          autor:autor (
            nombre
          )
        `)
        .not('hormigueos', 'is', null)
        .order('hormigueos', { ascending: false })
        .limit(3);

      if (error) {
        console.error('Error fetching poems:', error);
      } else {
        const processedData = data.map((poema) => ({
          id: poema.id,
          titulo: poema.titulo,
          autor: poema.autor?.nombre || 'Autor desconocido',
          portada: poema.portada,
          hormigueos: poema.hormigueos,
          link: `/poema/${encodeURIComponent(poema.titulo.toLowerCase())}`, // Updated to use lowercase title
        }));

        setCarouselItems(processedData);
      }
    };

    fetchPoems();
  }, []);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev === carouselItems.length - 1 ? 0 : prev + 1));
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev === 0 ? carouselItems.length - 1 : prev - 1));
  };

  const handleTouchStart = (e) => {
    const touchDownX = e.touches[0].clientX;
    carouselRef.current = { touchDownX };
  };

  const handleTouchMove = (e) => {
    if (!carouselRef.current) return;

    const touchMoveX = e.touches[0].clientX;
    const diff = carouselRef.current.touchDownX - touchMoveX;

    if (Math.abs(diff) > 50) {
      if (diff > 0) {
        nextSlide();
      } else {
        prevSlide();
      }
      carouselRef.current = null;
    }
  };

  // Determinar si mostrar el carrusel o la vista de columnas
  const isDesktop = windowWidth > 840;

  return (
    <div className="hormigueados-section" style={{ 
      marginTop: '4rem',
      position: 'relative' // Added to contain the absolute positioned InsectColony
    }}>
      {/* InsectColony Background */}
      

      <div className="hormigueados-header" style={{ position: 'relative', zIndex: 1 }}>
        <h2 className="edition-title" style={{ fontWeight: 'bold',fontSize:'clamp(18px, 4vw, 3rem)',marginBottom:'-1rem' }}>LOS MÁS HORMIGUEADOS</h2>
      </div>
      <div style={{ 
        position: 'absolute', 
        top: '80px', 
        left: 0, 
        width: '100%', 
        height: '100%', 
        zIndex: 0, // Para estar detrás de los elementos
        pointerEvents: 'none' // Para que no interfiera con clics
      }}>
       <InsectColony 
        insects={insects.filter(insect => insect.type === 'mosquito' )}
        count={100}
      />
      </div>

      {isDesktop ? (
        // Vista de tres columnas para escritorio (> 840px)
        <div 
          className="hormigueados-grid"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '20px',
            margin: '0 auto',
            maxWidth: '1200px',
            padding: '0 15px',
            position: 'relative',
            zIndex: 1
          }}
        >
          {carouselItems.map((item, index) => (
            <Link 
              key={item.id} 
              to={item.link} 
              style={{
                textDecoration: 'none',
                color: 'inherit',
                display: 'block',
                height: '100%',
                transition: 'transform 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'scale(1.03)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
              }}
            >
              <div 
                style={{
                  position: 'relative',
                  height: '400px',
                  width: '70%',
                  overflow: 'hidden',
                  boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
                  margin: '0 auto' // Add this line

                }}
              >
                <div
                  style={{
                    background: `url(${item.portada || hormigueroLogo}) center/cover no-repeat`,
                    height: '100%',
                    width: '100%'
                  }}
                ></div>
                <div 
                  style={{ 
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    padding: '15px',
                    background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.2) 100%)',
                    color: 'white'
                  }}
                >
                  <h3 style={{ margin: '0 0 5px 0', fontSize: '18px' }}>{item.titulo}</h3>
                  <p style={{ margin: 0, fontSize: '14px' }}>{item.autor}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        // Vista de carrusel para móvil (<= 840px)
        <div
          className="hormigueados-carousel"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          style={{ position: 'relative', zIndex: 1 }}
        >
          <div
            className="carousel-container"
            style={{
              transform: `translateX(-${currentSlide * 100}%)`,
              display: 'flex',
              transition: 'transform 0.5s ease',
            }}
          >
            {carouselItems.map((item, index) => (
              <div key={index} className="carousel-item">
                <Link key={item.id} to={item.link} className="carousel-item">
                  <div
                    className="carousel-content"
                    style={{
                      background: `url(${item.portada || hormigueroLogo}) center/cover no-repeat`,
                    }}
                  >
                    <div className="carousel-text" style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
                      <p>{item.titulo}</p>
                      <small>{item.autor}</small>
                    </div>
                  </div>
                </Link>
              </div>
            ))}
          </div>

          {/* FLECHAS SOLO EN PANTALLAS ENTRE 728px Y 840px */}
          {windowWidth > 728 && windowWidth <= 840 && (
            <>
              <button className="carousel-arrow left-arrow" onClick={prevSlide}>←</button>
              <button className="carousel-arrow right-arrow" onClick={nextSlide}>→</button>
            </>
          )}

          <div className="carousel-controls">
            <div className="carousel-indicators">
              {carouselItems.map((_, index) => (
                <span
                  key={index}
                  className={`indicator ${index === currentSlide ? 'active' : ''}`}
                  onClick={() => setCurrentSlide(index)}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HormigueadosSection;