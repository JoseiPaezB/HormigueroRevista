import React, { useState, useEffect, useRef } from 'react';
import { createClient } from '@supabase/supabase-js';
import { FaCalendarAlt, FaMapMarkerAlt } from 'react-icons/fa';

// Import button background image
import buttonBg from '../../assets/images/aplasta.gif';

// Create the Supabase client
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const EventosSection = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [eventItems, setEventItems] = useState([]);
  const carouselRef = useRef(null);

  // Fetch events from Supabase when component mounts
  useEffect(() => {
    const fetchEvents = async () => {
      // First, update outdated events
      const { error: updateError } = await supabase.rpc('update_event_status_by_date2');
  
      if (updateError) {
        console.error('Error updating event statuses:', updateError);
        return;
      }
  
      // Now fetch only the active events
      const { data, error } = await supabase
        .from('evento')
        .select('*')
        .eq('status', 'activo');
  
      if (error) {
        console.error('Error fetching events:', error);
      } else {
        setEventItems(data);
      }
    };
  
    fetchEvents();
  }, []);

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
        <div
          className="carousel-container"
          style={{
            transform: `translateX(-${currentSlide * 100}%)`,
          }}
        >
          {eventItems.map((event, index) => (
            <div key={index} className="event-item">
              <div className="event-image-container">
                <img
                  src={event.imagen} // Use the 'imagen' column for the image URL
                  alt={event.nombre} // Use the 'nombre' as the alt text
                  className="event-image"
                />
              </div>

              <div className="event-details">
                <div className="event-info">
                  <div className="event-date">
                    <FaCalendarAlt className="info-icon" />
                    <span>{`${event.fecha_inicio} - ${event.fecha_fin}`}</span>
                  </div>
                  <div className="event-location">
                    <FaMapMarkerAlt className="info-icon" />
                    <span>{event.ubicacion}</span>
                  </div>
                </div>

                <h3 className="event-title">{event.nombre.toUpperCase()}</h3>

                <p className="event-description">{event.descripcion}</p>

                <div className="ver-mas-container">
                  <button className="ver-mas-button">
                    VER MÁS
                    <div
                      className="button-background"
                      style={{ backgroundImage: `url(${buttonBg})` }}
                    ></div>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="carousel-controls">
          <div className="carousel-indicators">
            {eventItems.map((_, index) => (
              <span
                key={index}
                className={`indicator ${index === currentSlide ? 'active' : ''}`}
                onClick={() => setCurrentSlide(index)}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventosSection;
