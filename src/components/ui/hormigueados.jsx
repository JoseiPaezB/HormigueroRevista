import React, { useState, useRef } from 'react';
// Import your ant GIFs - replace these paths with your actual paths

const HormigueadosSection = () => {
    const antTopRight= 'https://i.makeagif.com/media/3-07-2018/sWmlMp.gif'; // Replace with your actual path
    const antBottomLeft= 'https://i.makeagif.com/media/3-07-2018/sWmlMp.gif'; // Replace with your actual path
  const [currentSlide, setCurrentSlide] = useState(0);
  const carouselRef = useRef(null);
  
  // Sample carousel items - replace with your actual content
  const carouselItems = [
    {
      title: "Verso tercero",
      background: "linear-gradient(135deg, #ff7b7b 0%, #4ac29a 100%)",
      date: "01/08/25"
    },
    {
      title: "Hormiga obrera",
      background: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
      date: "02/08/25"
    },
    {
      title: "Insectos nocturnos",
      background: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
      date: "03/08/25"
    }
  ];
  
  const nextSlide = () => {
    setCurrentSlide((prev) => (prev === carouselItems.length - 1 ? 0 : prev + 1));
  };
  
  const prevSlide = () => {
    setCurrentSlide((prev) => (prev === 0 ? carouselItems.length - 1 : prev - 1));
  };

  // For swipe functionality
  const handleTouchStart = (e) => {
    const touchDownX = e.touches[0].clientX;
    carouselRef.current = { touchDownX };
  };
  
  const handleTouchMove = (e) => {
    if (!carouselRef.current) return;
    
    const touchMoveX = e.touches[0].clientX;
    const diff = carouselRef.current.touchDownX - touchMoveX;
    
    // Swipe threshold
    if (Math.abs(diff) > 50) {
      if (diff > 0) {
        // Swipe left, go next
        nextSlide();
      } else {
        // Swipe right, go previous
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
              <div 
                className="carousel-content" 
                style={{ background: item.background }}
              >
                <div className="carousel-text">
                  <p>{item.title}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="carousel-controls">
          <button className="carousel-button prev" onClick={prevSlide}>
            &lt;
          </button>
          <div className="carousel-indicators">
            {carouselItems.map((_, index) => (
              <span 
                key={index} 
                className={`indicator ${index === currentSlide ? 'active' : ''}`}
                onClick={() => setCurrentSlide(index)}
              />
            ))}
          </div>
          <button className="carousel-button next" onClick={nextSlide}>
            &gt;
          </button>
        </div>
      </div>
      
      <img src={antBottomLeft} alt="Ant animation" className="ant-bottom-left" />
      
     
    </div>
  );
};

export default HormigueadosSection;