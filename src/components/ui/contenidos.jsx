import React, { useState, useEffect } from 'react';
import portada from '../../assets/images/edicion1.png'; // Adjust the path as necessary
import HormigueadosSection from './hormigueados'; // Adjust the path as necessary
import EventosSection from './eventos';
import {Link} from 'react-router-dom';
import hormigueroLogo from '../../assets/anticon.svg'; // Adjust the path as necessary
import homrigueroLogo1 from '../../assets/uno.svg'; // Adjust the path as necessary
import homrigueroLogo2 from '../../assets/dos.svg'; // Adjust the path as necessary
import homrigueroLogo3 from '../../assets/cinco2.svg'; // Adjust the path as necessary
import homrigueroLogo4 from '../../assets/cuatro.svg'; // Adjust the path as necessary
import homrigueroLogo5 from '../../assets/tres2.svg'; // Adjust the path as necessary
import homrigueroLogo6 from '../../assets/seis.svg'; // Adjust the path as necessary
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);


const Contenido = () => {
  // State for revista data
  const [revista, setRevista] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [contributors, setContributors] = useState([]);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  // Track window resize
  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Fetch revista data on component mount
  useEffect(() => {
    const fetchRevista = async () => {
      try {
        // Fetch the revista with ID 1
        const { data, error } = await supabase
          .from('revista')
          .select('*')
          .eq('id', 1)
          .single();

        if (error) throw error;
        
        setRevista(data);
        
        // Parse contributors string into array
        if (data.contribuyentes) {
          const contributorsList = data.contribuyentes.split(',').map(name => name.trim());
          setContributors(contributorsList);
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching revista:', err);
        setError('Failed to load magazine data');
        setLoading(false);
      }
    };

    fetchRevista();
  }, []);

  // Format date for display (YYYY-MM-DD to DD/MM/YY)
  const formatDate = (dateString) => {
    if (!dateString) return '01/08/25';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: '2-digit'
    });
  };

  // Array of menu items for the grid
  const menuItems = [
    { path: "/creaciones", title: "CREACIONES", delay: 0 },
    { path: "/traducciones", title: "TRADUCCION", delay: 0.3 },
    { path: "/critica", title: "CRITICA", delay: 0.6 },
    { path: "/rescates", title: "RESCATES", delay: 0.9 },
    { path: "/visuales", title: "VISUALES", delay: 1.2 },
    { path: "/entrevista", title: "ENTREVISTAS", delay: 1.5 }
  ];

  // Determine grid layout based on screen width
  const isDesktop = windowWidth > 840;
  const gridColumns = isDesktop ? 3 : 1; // 3 columns for desktop, 1 for mobile
  
  return (
    <div className="edition-container">
      {/* Cover image with title */}
      <div className="cover-image image_2" style={{
        backgroundImage: revista?.portada ? `url(${revista.portada})` : 'none',
        position: 'relative',
        marginTop: '60px' // Space for navbar
      }}>
        
      </div>
      
      {/* Article preview section */}
      <div className="article-preview">
        <h2 className="edition-title" style={{ fontWeight: 'bold' }}>
          {revista?.nombre.toUpperCase() || 'LOS INSECTOS TAMBIEN SON PARTE DE LO MINIMO'}
        </h2>
        <div className="contributors-list">
          {contributors.length > 0 ? (
            contributors.map((contributor, index) => (
              <p key={index}>{contributor.toUpperCase()}</p>
            ))
          ) : (
            /* Fallback contributors if none are found */
            <>
              <p>JOSÉ NERUDA</p>
              <p>FEDERICO GARCÍA LORCA</p>
              <p>EMILY DICKINSON</p>
              <p>GABRIEL GARCÍA MÁRQUEZ</p>
              <p>OCTAVIO PAZ</p>
              <p>SYLVIA PLATH</p>
              <p>JORGE LUIS BORGES</p>
              <p>GABRIELA MISTRAL</p>
              <p>WALT WHITMAN</p>
              <p>ALEJANDRA PIZARNIK</p>
            </>
          )}
        </div>
        <h3 id="sintesis"className="title" style={{ fontWeight: 'bold', fontSize:isDesktop ? '2.5rem' : '1.8rem' }}>
          SINTESIS
        </h3>
        <div className="article-content" >
          <p style={{marginRight: '1.3rem'}}>
            {revista?.sintesis || 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Architecto consectetur vitae possimus eos. Vel impedit sapiente, aliquam blanditiis accusamus ea modi veniam esse quod atque in sed quidem placeat! Ipsam neque dicta repellat nesciunt, quisquam amet quidem magni provident mollitia laudantium assumenda porro esse soluta praesentium consequuntur nemo nulla repudiandae fugit quis quasi iusto ut at deserunt itaque! Minus tenetur culpa atque ullam quibusdam eaque. Quia nostrum eligendi magni placeat velit vitae! Veniam dolor porro sed aut tempora, repellat nisi officiis omnis molestias recusandae obcaecati, sapiente placeat neque unde, quasi illo inventore in quis iusto optio cupiditate! Perspiciatis culpa pariatur recusandae, totam, omnis aperiam aliquam, veniam accusamus tempora blanditiis impedit.'}
          </p>
        </div>

        {/* Menu Grid with Numbered Ants */}
        <div className="vertical-menu" style={{
          display: 'grid',
          gap: '30px',
          padding: '8px',
          width: '100%',
          margin: '30px 0',
          fontSize: '1.3rem'
        }}>
          {/* Define the keyframes animation for pulsing effect */}
          <style>
            {`
              @keyframes pulse {
                0% { transform: scale(1); }
                50% { transform: scale(1.1); }
                100% { transform: scale(1); }
              }
              
              @keyframes textPulse {
                0% { opacity: 0.75; }
                50% { opacity: 1; }
                100% { opacity: 0.75; }
              }
              
              .pulsing-ant {
                animation: pulse 2s infinite ease-in-out;
              }
              
              .pulsing-text {
                animation: textPulse 2s infinite ease-in-out;
              }
              
              .menu-item:hover .pulsing-ant {
                animation: pulse 1s infinite ease-in-out;
              }
              
              .menu-item:hover .pulsing-text {
                animation: textPulse 1s infinite ease-in-out;
              }

              .menu-item:hover .index-number {
                opacity: 1;
                transform: translate(-50%, -50%) scale(1.2);
              }
            `}
          </style>

          {/* Map through menu items */}
          {menuItems.map((item, index) => {
            // Determine which SVG to use based on index
            let antIcon;
            switch(index) {
              case 0:
                antIcon = homrigueroLogo1; // First icon for CREACIONES
                break;
              case 1:
                antIcon = homrigueroLogo2; // Second icon for TRADUCCION
                break;
              case 2:
                antIcon = homrigueroLogo3; // Third icon for CRITICA
                break;
              case 3:
                antIcon = homrigueroLogo4; // Fourth icon for RESCATES
                break;
              case 4:
                antIcon = homrigueroLogo5; // Fifth icon for VISUALES
                break;
              case 5:
                antIcon = homrigueroLogo6; // Sixth icon for ENTREVISTAS
                break;
              default:
                antIcon = hormigueroLogo; // Fallback to the default icon
            }
            
            return (
              <Link 
                key={index}
                to={item.path} 
                className="menu-item" 
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  textDecoration: 'none',
                  color: 'black',
                  transition: 'transform 0.2s',
                  justifyContent: 'center',
                  textAlign: 'center',
                  padding: '15px',
                  position: 'relative',
                }}
              >
                {/* Index number behind ant icon */}
                <div 
                  className="index-number"
                  style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    fontSize: '80px',
                    fontWeight: 'bold',
                    color: 'balck',
                    zIndex: 0,
                    transition: 'opacity 0.3s, transform 0.3s',
                    pointerEvents: 'none'
                  }}
                >
                  {index + 1}
                </div>
                
                <div className="ant-icon" style={{ 
                  marginBottom: '10px',
                  position: 'relative',
                  zIndex: 1,
                  opacity: 0.7
                }}>
                  <img 
                    src={antIcon} // Use the specific SVG for this menu item
                    alt={`${item.title} icon`} 
                    width="60" 
                    height="60" 
                    className="pulsing-ant"
                    style={{ 
                      animationDelay: `${item.delay}s`,
                      position: 'relative',
                      zIndex: 2
                    }}
                  />
                </div>
                
                <div 
                  className="menu-text pulsing-text" 
                  style={{
                    fontSize: windowWidth > 728 ? '1.7rem' : '18px',
                    letterSpacing: '1px',
                    animationDelay: `${item.delay}s`,
                    position: 'relative',
                    zIndex: 1,
                    marginTop: '1rem'
                  }}
                >
                  {item.title}
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Contenido;