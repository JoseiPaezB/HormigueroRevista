import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const ScrollToHashElement = () => {
  const { hash } = useLocation();

  useEffect(() => {
    const scrollToElement = () => {
      if (hash) {
        const element = document.getElementById(hash.slice(1)); // Remove '#' from hash
        if (element) {
          const navbar = document.getElementById('navbar'); // Get navbar element if it exists
          const offset = navbar ? navbar.offsetHeight : 0; // If there's a navbar, use its height as the offset
          const elementTop = element.offsetTop; // Get the element's position on the page

          // Adjust scroll position considering both navbar and extra content below
          window.scrollTo({
            top: elementTop - offset - 10, // Subtract the offset and a little extra space
            behavior: 'smooth',
          });
        }
      }
    };

    // Add delay to make sure the content has fully loaded when coming from an external page
    setTimeout(() => {
      scrollToElement();
    }, 200); // You can increase or decrease this delay depending on your page load speed

    // If already on the main page with the hash, scroll immediately
    if (window.location.hash && hash) {
      scrollToElement();
    }

  }, [hash]); // Re-run the effect when the hash changes

  return null; // This component doesn't render anything, it's only for scroll functionality
};

export default ScrollToHashElement;
