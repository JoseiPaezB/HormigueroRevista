import React, { useState, useEffect, useRef } from 'react';

/**
 * Componente ScrollReveal para crear animaciones de aparición/desaparición
 * al hacer scroll en ambas direcciones.
 * 
 * @param {React.ReactNode} children - Contenido que será animado
 * @param {number} delay - Retraso en milisegundos antes de iniciar la animación
 * @param {string} direction - Dirección de la animación: 'up', 'down', 'left', 'right', 'scale'
 * @param {number} threshold - Porcentaje del elemento que debe ser visible para activar la animación (0.0 a 1.0)
 * @param {string} className - Clases CSS adicionales para el contenedor
 * @returns {JSX.Element}
 */
const ScrollReveal = ({ 
  children, 
  delay = 0, 
  direction = 'up', 
  threshold = 0.1,
  className = ''
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef(null);

  // Determinar la transformación basada en la dirección
  const getTransform = (entering) => {
    // Si está entrando, usamos la transformación original
    // Si está saliendo, usamos la transformación opuesta
    const distance = '30px';
    const scale = '0.95';
    
    if (entering) {
      switch (direction) {
        case 'up': return `translateY(${distance})`;
        case 'down': return `translateY(-${distance})`;
        case 'left': return `translateX(${distance})`;
        case 'right': return `translateX(-${distance})`;
        case 'scale': return `scale(${scale})`;
        default: return `translateY(${distance})`;
      }
    } else {
      // Transformación opuesta para salida
      switch (direction) {
        case 'up': return `translateY(-${distance})`;
        case 'down': return `translateY(${distance})`;
        case 'left': return `translateX(-${distance})`;
        case 'right': return `translateX(${distance})`;
        case 'scale': return `scale(${parseFloat(scale) + (1 - parseFloat(scale)) * 2})`;
        default: return `translateY(-${distance})`;
      }
    }
  };

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        // Cuando el elemento entra o sale del viewport
        if (entry.isIntersecting) {
          // Elemento entrando en viewport
          setTimeout(() => {
            setIsVisible(true);
          }, delay);
        } else {
          // Elemento saliendo del viewport
          setTimeout(() => {
            setIsVisible(false);
          }, delay / 2); // Salida más rápida que entrada
        }
      },
      {
        root: null,
        rootMargin: '0px',
        threshold: threshold, // Porcentaje del elemento que debe ser visible
      }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current);
      }
    };
  }, [delay, threshold]);

  return (
    <div
      ref={ref}
      className={`scroll-reveal-item ${className}`}
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'none' : getTransform(!isVisible),
        transition: `opacity 0.6s ease-out, transform 0.6s ease-out`,
        willChange: 'opacity, transform',
      }}
    >
      {children}
    </div>
  );
};

export default ScrollReveal;