/**
 * Utilidad para manejar la navegación por anclaje (hash)
 * y que funcione correctamente con las animaciones de ScrollReveal
 */

/**
 * Configura un listener para navegación por anclaje que trabaja con ScrollReveal
 * @param {Function} setActiveHash - Función para actualizar el estado de hash activo
 * @returns {Function} - Función para limpiar el listener
 */
export const setupHashNavigation = (setActiveHash) => {
  const handleHashChange = () => {
    const hash = window.location.hash.substring(1); // Eliminar el # del hash
    if (hash) {
      setActiveHash(hash);
      
      // Pequeño retraso para permitir que los componentes se monten y las animaciones se inicialicen
      setTimeout(() => {
        const element = document.getElementById(hash);
        if (element) {
          // Desactivar temporalmente las animaciones en todos los contenedores de ScrollReveal
          document.querySelectorAll('.scroll-reveal-item').forEach(el => {
            el.classList.add('force-visible');
          });
          
          // Scroll al elemento
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
          
          // Restaurar las animaciones después del scroll
          setTimeout(() => {
            document.querySelectorAll('.scroll-reveal-item').forEach(el => {
              el.classList.remove('force-visible');
            });
          }, 1000); // Tiempo suficiente para completar el scroll
        }
      }, 300);
    }
  };
  
  // Ejecutar al llamar a la función
  handleHashChange();
  window.addEventListener('hashchange', handleHashChange);
  
  // Devolver función de limpieza
  return () => {
    window.removeEventListener('hashchange', handleHashChange);
  };
};

/**
 * Realiza un scroll suave a un elemento por ID
 * @param {string} elementId - ID del elemento al que hacer scroll
 * @param {Object} options - Opciones adicionales
 * @param {string} options.block - Posición del bloque ('start', 'center', 'end', 'nearest')
 * @param {number} options.delay - Retraso antes de hacer scroll (ms)
 */
export const scrollToElement = (elementId, options = {}) => {
  const { block = 'start', delay = 0 } = options;
  
  setTimeout(() => {
    const element = document.getElementById(elementId);
    if (element) {
      // Desactivar temporalmente las animaciones
      document.querySelectorAll('.scroll-reveal-item').forEach(el => {
        el.classList.add('force-visible');
      });
      
      // Scroll al elemento
      element.scrollIntoView({ behavior: 'smooth', block });
      
      // Restaurar las animaciones después del scroll
      setTimeout(() => {
        document.querySelectorAll('.scroll-reveal-item').forEach(el => {
          el.classList.remove('force-visible');
        });
      }, 1000);
    }
  }, delay);
};