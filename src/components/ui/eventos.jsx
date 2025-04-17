import React, { useState, useRef } from 'react';
// Import sample event image - replace with your actual path
import eventImage from '../../assets/images/evento1.png';
import eventImage2 from '../../assets/images/evento2.png';
import eventImage3 from '../../assets/images/evento3.png';

// Import icons - you can use actual icon files or an icon library
import { FaCalendarAlt, FaMapMarkerAlt } from 'react-icons/fa';


// Import button background image
import buttonBg from '../../assets/images/aplasta.gif';

const EventosSection = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const carouselRef = useRef(null);
  
  // Sample event data - replace with your actual content
  const eventItems = [
    {
      image: eventImage,
      title: "Lecturas vividas",
      dateRange: "06/04/25 - 08/04/25",
      location: "Tilde",
      description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Curabitur euismod urna eu velit gravida, at fringilla neque interdum."
    },
    {
      image: eventImage2,
      title: "Taller de poesía",
      dateRange: "15/04/25 - 17/04/25",
      location: "Centro Cultural",
      description: "Vivamus non interdum nisi. Aenean quis egestas justo, vitae tristique ut fermentum risus fermentum."
    },
    {
      image: eventImage3,
      title: "Encuentro de autores",
      dateRange: "22/04/25 - 25/04/25",
      location: "Biblioteca Municipal",
      description: "Cras pharetra nec leo sed vel. Sed et sodales tellus, sed feugiat. Proin venenatis dolor non lectus."
    }
  ];
  
  const nextSlide = () => {
    setCurrentSlide((prev) => (prev === eventItems.length - 1 ? 0 : prev + 1));
  };
  
  const prevSlide = () => {
    setCurrentSlide((prev) => (prev === 0 ? eventItems.length - 1 : prev - 1));
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
    <div className="eventos-section">
      <h2 className="eventos-title">EVENTOS Y TALLERES</h2>
      
      <div 
        className="eventos-carousel"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
      >
        <div className="carousel-container" style={{
          transform: `translateX(-${currentSlide * 100}%)`,
        }}>
          {eventItems.map((event, index) => (
            <div key={index} className="event-item">
              <div className="event-image-container">
                <img src={event.image} alt={event.title} className="event-image" />
              </div>
              
              <div className="event-details">
                <div className="event-info">
                  <div className="event-date">
                  <FaCalendarAlt className="info-icon" />
                  <span>{event.dateRange}</span>
                  </div>
                  <div className="event-location">
                  <FaMapMarkerAlt className="info-icon" />
                  <span>{event.location}</span>
                  </div>
                </div>
                
                <h3 className="event-title">{event.title}</h3>
                
                <p className="event-description">{event.description}</p>
                
                <div className="ver-mas-container">
                  <button className="ver-mas-button">
                    VER MAS
                    <div className="button-background" style={{ backgroundImage: `url(${buttonBg})` }}></div>
                  </button>
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
            {eventItems.map((_, index) => (
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
      
      
    </div>
  );
};

export default EventosSection;