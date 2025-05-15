import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { createClient } from '@supabase/supabase-js';
import { FaCalendarAlt, FaMapMarkerAlt, FaChevronLeft, FaChevronRight } from 'react-icons/fa';

// Import button background image
import buttonBg from '../../assets/images/aplasta.gif';
import hormigueroLogo from '../../assets/anticon.svg'; // Adjust the path as necessary


// Create the Supabase client
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const EventosSection = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [eventItems, setEventItems] = useState([]);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const carouselRef = useRef(null);

  // Track window resize
  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Fetch events from Supabase when component mounts
  useEffect(() => {
    const fetchEvents = async () => {
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

  // Determine if we should show desktop or mobile layout
  const isDesktop = windowWidth > 728;
  
  // For desktop view with 4 columns, we need to group events
  const totalGroups = Math.ceil(eventItems.length / 4);
  
  // Get current group of events to display
  const getCurrentEvents = () => {
    if (isDesktop) {
      // In desktop, show current group of 4 events
      const startIdx = currentSlide * 4;
      
      // Create array of 4 items, filling with null if not enough events
      const groupEvents = [];
      for (let i = 0; i < 4; i++) {
        const eventIndex = startIdx + i;
        groupEvents.push(eventIndex < eventItems.length ? eventItems[eventIndex] : null);
      }
      
      return groupEvents;
    } else {
      // In mobile, show one event at a time
      return [eventItems[currentSlide]].filter(Boolean);
    }
  };

  // Navigation functions for carousel
  const nextSlide = () => {
    if (isDesktop) {
      // For desktop, navigate between groups of 4
      setCurrentSlide((prev) => (prev === totalGroups - 1 ? 0 : prev + 1));
    } else {
      // For mobile, navigate one by one
      setCurrentSlide((prev) => (prev === eventItems.length - 1 ? 0 : prev + 1));
    }
  };

  const prevSlide = () => {
    if (isDesktop) {
      // For desktop, navigate between groups of 4
      setCurrentSlide((prev) => (prev === 0 ? totalGroups - 1 : prev - 1));
    } else {
      // For mobile, navigate one by one
      setCurrentSlide((prev) => (prev === 0 ? eventItems.length - 1 : prev - 1));
    }
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

  // Show carousel controls if we have more than 4 events in desktop mode
  const showDesktopCarouselControls = isDesktop && eventItems.length > 4;
  
  // Get the events to display
  const currentEvents = getCurrentEvents();

  return (
    <div className="eventos-section">
      <h2 className="eventos-title">EVENTOS Y TALLERES</h2>

      {isDesktop ? (
        // Desktop view with 4 columns
        <div style={{ position: 'relative' }}>
          <div 
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: '20px',
              width: '100%',
              margin: '0 auto'
            }}
          >
            {currentEvents.map((event, index) => (
              event ? (
                // Actual event card
                <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                width: '100%'
              }}>
                  <div
                    key={event.id}
                    className="event-item-desktop"
                    style={{
                      overflow: 'hidden',
                      boxShadow: '0 3px 10px rgba(0, 0, 0, 0.1)',
                      transition: 'all 0.3s ease',
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      backgroundColor: 'white',
                      cursor: 'pointer',
                      width: '75%',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-8px)';
                      e.currentTarget.style.boxShadow = '0 10px 20px rgba(0, 0, 0, 0.15)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '0 3px 10px rgba(0, 0, 0, 0.1)';
                    }}
                  >
                
                  <Link to={`/evento/${event.id}`} style={{ textDecoration: 'none', color: 'inherit', height: '100%', display: 'flex', flexDirection: 'column' }}>
                    <div className="event-image-container" style={{ flexShrink: 0 }}>
                      <img
                        src={event.imagen}
                        alt={event.nombre}
                        className="event-image"
                        style={{ 
                          width: '100%', 
                          height: '180px',
                          objectFit: 'cover',
                          transition: 'transform 0.5s ease'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.transform = 'scale(1.05)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = 'scale(1)';
                        }}
                      />
                    </div>
    
                    <div className="event-details" style={{ padding: '15px', display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
                      <div className="event-info" style={{ 
                        display: 'flex', 
                        flexDirection: 'column',
                        gap: '5px',
                        marginBottom: '10px'
                      }}>
                        <div className="event-date" style={{ 
                          display: 'flex', 
                          alignItems: 'center',
                          fontSize: '12px',
                          gap: '5px',
                          color: '#555'
                        }}>
                          <FaCalendarAlt className="info-icon" style={{ color: '#888' }} />
                          <span>{`${event.fecha_inicio} - ${event.fecha_fin || event.fecha_inicio}`}</span>
                        </div>
                        <div className="event-location" style={{ 
                          display: 'flex', 
                          alignItems: 'center',
                          fontSize: '12px',
                          gap: '5px',
                          color: '#555'
                        }}>
                          <FaMapMarkerAlt className="info-icon" style={{ color: '#888' }} />
                          <span style={{
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                          }}>{event.ubicacion}</span>
                        </div>
                      </div>
    
                      <h3 className="event-title" style={{ 
                        margin: '0 0 10px 0',
                        fontSize: '16px',
                        fontWeight: 'bold',
                        height: '40px',
                        overflow: 'hidden',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        color: '#222',
                        transition: 'color 0.2s ease'
                      }}>{event.nombre.toUpperCase()}</h3>
    
                      <p className="event-description" style={{ 
                        fontSize: '13px',
                        lineHeight: '1.4',
                        marginBottom: '15px',
                        height: '70px',
                        overflow: 'hidden',
                        display: '-webkit-box',
                        WebkitLineClamp: 4,
                        WebkitBoxOrient: 'vertical',
                        color: '#666',
                        flexGrow: 1
                      }}>{event.descripcion}</p>
    
                      <div className="ver-mas-container" style={{ textAlign: 'center', marginTop: 'auto' }}>
                        <button className="ver-mas-button" style={{
                          position: 'relative',
                          border: 'none',
                          fontWeight: 'bold',
                          cursor: 'pointer',
                          overflow: 'hidden',
                          zIndex: 1,
                          fontSize: '12px',
                          borderRadius: '4px',
                          transition: 'transform 0.2s ease'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.transform = 'scale(1.05)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = 'scale(1)';
                        }}
                        >
                          VER MÁS
                          <div
                            className="button-background"
                            style={{ 
                              backgroundImage: `url(${buttonBg})`,
                              position: 'absolute',
                              top: 0,
                              left: 0,
                              width: '100%',
                              height: '100%',
                              zIndex: -1,
                              backgroundSize: 'cover',
                              backgroundPosition: 'center'
                            }}
                          ></div>
                        </button>
                      </div>
                    </div>
                  </Link>
                </div>
                </div>
              ) : (
                // Empty placeholder when we don't have enough events
                <div key={`empty-${index}`} style={{ 
                  height: '400px',
                  borderRadius: '8px',
                  backgroundColor: '#f5f5f5',
                  opacity: 0.3
                }}></div>
              )
            ))}
          </div>
          
          {/* Desktop carousel navigation */}
          {showDesktopCarouselControls && (
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              marginTop: '30px',
              gap: '20px'
            }}>
              <button
                onClick={prevSlide}
                style={{
                  background: 'none',
                  border: 'none',
                  borderRadius: '50%',
                  width: '44px',
                  height: '44px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'transform 0.2s ease, background-color 0.2s ease',
                  padding: '8px'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'scale(1.1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'scale(1)';
                }}
              >
                <img 
                  src={hormigueroLogo} 
                  alt="Anterior" 
                  style={{
                    width: '100%',
                    height: '100%',
                    transform: 'rotate(-90deg)',
                    transition: 'transform 0.3s ease',
                    background:'none'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'rotate(-90deg) translateX(-3px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'rotate(-90deg)';
                  }}
                />
              </button>
              
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
              }}>
                {Array.from({ length: totalGroups }).map((_, index) => (
                  <span
                    key={index}
                    style={{
                      width: '15px',
                      height: '5px',
                      borderRadius: '0%',
                      backgroundColor: currentSlide === index ? '#000' : '#ccc',
                      cursor: 'pointer',
                      transition: 'transform 0.2s ease, background-color 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'scale(1.2)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'scale(1)';
                    }}
                    onClick={() => setCurrentSlide(index)}
                  ></span>
                ))}
              </div>
              
              <button
                onClick={nextSlide}
                style={{
                  border: 'none',
                  borderRadius: '50%',
                  background:"none",
                  width: '44px',
                  height: '44px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'transform 0.2s ease, background-color 0.2s ease',
                  padding: '8px'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'scale(1.1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'scale(1)';
                }}
              >
                <img 
                  src={hormigueroLogo} 
                  alt="Siguiente" 
                  style={{
                    width: '100%',
                    height: '100%',
                    transform: 'rotate(90deg)',
                    transition: 'transform 0.3s ease',
                    background:'none'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'rotate(90deg) translateX(3px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'rotate(90deg)';
                  }}
                />
              </button>
            </div>
          )}
        </div>
      ) : (
        // Mobile carousel view - maintain the original design
        <div
          className="eventos-carousel"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
        >
          <div
            className="carousel-container carousel-dos"
            style={{
              transform: `translateX(-${currentSlide * 100}%)`,
            }}
          >
            {eventItems.map((event, index) => (
              <div key={index} className="event-item">
                <div className="event-image-container">
                  <img
                    src={event.imagen}
                    alt={event.nombre}
                    className="event-image"
                  />
                </div>

                <div className="event-details">
                  <div className="event-info">
                    <div className="event-date">
                      <FaCalendarAlt className="info-icon" />
                      <span>{`${event.fecha_inicio} - ${event.fecha_fin || event.fecha_inicio}`}</span>
                    </div>
                    <div className="event-location">
                      <FaMapMarkerAlt className="info-icon" />
                      <span>{event.ubicacion}</span>
                    </div>
                  </div>

                  <h3 className="event-title">{event.nombre.toUpperCase()}</h3>

                  <p className="event-description">{event.descripcion}</p>

                  <div className="ver-mas-container">
                    <Link to={`/evento/${event.id}`}>
                      <button className="ver-mas-button">
                        VER MÁS
                        <div
                          className="button-background"
                          style={{ backgroundImage: `url(${buttonBg})` }}
                        ></div>
                      </button>
                    </Link>
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
      )}
    </div>
  );
};

export default EventosSection;