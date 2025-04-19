import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import hormigueroLogo from '../../assets/anticon.svg'; // Adjust the path as necessary


import { createClient } from '@supabase/supabase-js';

// Import your ant GIFs - replace these paths with your actual paths
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);
const HormigueadosSection = () => {
  const antTopRight = 'https://i.makeagif.com/media/3-07-2018/sWmlMp.gif';
  const antBottomLeft = 'https://i.makeagif.com/media/3-07-2018/sWmlMp.gif';

  const [carouselItems, setCarouselItems] = useState([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const carouselRef = useRef(null);
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
        .order('hormigueos', { ascending: false }) // <- Ordenamos por hormigueos DESC
        .limit(3); // <- Solo traemos los 3 más altos
  
      if (error) {
        console.error('Error fetching poems:', error);
      } else {
        const processedData = data.map((poema) => ({
          id: poema.id,
          titulo: poema.titulo,
          autor: poema.autor?.nombre || 'Autor desconocido',
          portada: poema.portada,
          hormigueos: poema.hormigueos,
          link: `/poema/${poema.id}`,
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


  return (
    <div className="hormigueados-section" style={{ marginTop: '4rem' }}>
      <div className="hormigueados-header">
        <h2 className="edition-title" style={{fontWeight:'bold'}}>LOS MAS HORMIGUEADOS</h2>
        <img src={antTopRight} alt="Ant animation" className="ant-top-right" />
      </div>
      
      <div 
        className="hormigueados-carousel"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
      >
        <div className="carousel-container" style={{
          transform: `translateX(-${currentSlide * 100}%)`,
        }}>
          {carouselItems.map((item, index) => (
            <div key={index} className="carousel-item">

              <Link  key={item.id} to={item.link}  className="carousel-item">
                <div
                  className="carousel-content"
                  style={{ background: `url(${item.portada || hormigueroLogo}) center/cover no-repeat` }}                >
                  <div className="carousel-text" style={{ backgroundColor: 'rgba(0, 0, 0, 0.2)' }}>
                  <p>{item.titulo}</p>
                  <small>{item.autor}</small>
                </div>

                </div>
              </Link>
            </div>
          ))}
        </div>
        
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
      
      <img src={antBottomLeft} alt="Ant animation" className="ant-bottom-left" />
      
     
    </div>
  );
};

export default HormigueadosSection;