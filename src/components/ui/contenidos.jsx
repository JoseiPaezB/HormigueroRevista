import React, { useState, useEffect } from 'react';
import portada from '../../assets/images/edicion1.png'; // Adjust the path as necessary
import HormigueadosSection from './hormigueados'; // Adjust the path as necessary
import EventosSection from './eventos';
import {Link} from 'react-router-dom';
import hormigueroLogo from '../../assets/anticon.svg'; // Adjust the path as necessary
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

  return (
    <div className="edition-container">
      {/* Green gradient cover image */}
      <div className="cover-image image_2" style={{
        backgroundImage: `url(${portada})`,
      }}>
        
        {/* Issue info overlay */}
        
      </div>
      
      {/* Article preview section */}
      <div className="article-preview">
        <div className="article-date">{formatDate(revista?.fecha)}</div>
        <h2 className="edition-title" style={{ fontWeight: 'bold' }}>
          {revista?.nombre || 'LOS INSECTOS TAMBIEN SON PARTE DE LO MINIMO'}
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
        <h3 className="title" style={{ fontWeight: 'bold' }}>
          SINTESIS
        </h3>
        <div className="article-content">
          <p>
            {revista?.sintesis || 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Architecto consectetur vitae possimus eos. Vel impedit sapiente, aliquam blanditiis accusamus ea modi veniam esse quod atque in sed quidem placeat! Ipsam neque dicta repellat nesciunt, quisquam amet quidem magni provident mollitia laudantium assumenda porro esse soluta praesentium consequuntur nemo nulla repudiandae fugit quis quasi iusto ut at deserunt itaque! Minus tenetur culpa atque ullam quibusdam eaque. Quia nostrum eligendi magni placeat velit vitae! Veniam dolor porro sed aut tempora, repellat nisi officiis omnis molestias recusandae obcaecati, sapiente placeat neque unde, quasi illo inventore in quis iusto optio cupiditate! Perspiciatis culpa pariatur recusandae, totam, omnis aperiam aliquam, veniam accusamus tempora blanditiis impedit.'}
          </p>
          
        </div>

        {/* Vertical Menu with Ants */}
        <div className="vertical-menu" style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center', // Add this
            textAlign: 'center',      // Add this
            gap: '30px',
            padding: '2px',
            width: '100%', 
            margin: '30px 0'
            }}>
          <Link to="/creaciones" className="menu-item" style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textDecoration: 'none',
            color: 'black',
            transition: 'transform 0.2s',
            justifyContent: 'center', // Add this
            textAlign: 'center',      // Add this
            width: '100%'           // Add this
          }}>
            <div className="ant-icon" style={{ marginBottom: '10px' }}>
              {/* Place for your ant image */}
              <img src={hormigueroLogo} alt="Ant icon" width="60" height="60" style={{ opacity: 0.5 }} />
            </div>
            <div className="menu-text" style={{
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: '18px',
              fontWeight: 'bold',
              letterSpacing: '1px',
            }}>CREACIONES</div>
          </Link>
          
          <Link to="/traduccion" className="menu-item" style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textDecoration: 'none',
            color: 'black',
            transition: 'transform 0.2s',
            justifyContent: 'center', // Add this
            textAlign: 'center',      // Add this
            width: '100%',            // Add this
          }}>
            <div className="ant-icon" style={{ marginBottom: '10px' }}>
              {/* Place for your ant image */}
              <img src={hormigueroLogo} alt="Ant icon" width="60" height="60" style={{ opacity: 0.5 }} />
            </div>
            <div className="menu-text" style={{
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: '18px',
              fontWeight: 'bold',
              letterSpacing: '1px'
            }}>TRADUCCION</div>
          </Link>
          
          <Link to="/critica" className="menu-item" style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textDecoration: 'none',
            color: 'black',
            transition: 'transform 0.2s',
            justifyContent: 'center', // Add this
            textAlign: 'center',      // Add this
            width: '100%',            // Add this
          }}>
            <div className="ant-icon" style={{ marginBottom: '10px' }}>
              {/* Place for your ant image */}
              <img src={hormigueroLogo} alt="Ant icon" width="60" height="60" style={{ opacity: 0.5 }} />
            </div>
            <div className="menu-text" style={{
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: '18px',
              fontWeight: 'bold',
              letterSpacing: '1px'
            }}>CRITICA</div>
          </Link>
          
          <Link to="/rescates" className="menu-item" style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textDecoration: 'none',
            color: 'black',
            transition: 'transform 0.2s',
            justifyContent: 'center', // Add this
            textAlign: 'center',      // Add this
            width: '100%',            // Add this
          }}>
            <div className="ant-icon" style={{ marginBottom: '10px' }}>
              {/* Place for your ant image */}
              <img src={hormigueroLogo} alt="Ant icon" width="60" height="60" style={{ opacity: 0.5 }} />
            </div>
            <div className="menu-text" style={{
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: '18px',
              fontWeight: 'bold',
              letterSpacing: '1px'
            }}>RESCATES</div>
          </Link>
          <Link to="/visuales" className="menu-item" style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textDecoration: 'none',
            color: 'black',
            transition: 'transform 0.2s',
            justifyContent: 'center', // Add this
            textAlign: 'center',      // Add this
            width: '100%',            // Add this
          }}>
            <div className="ant-icon" style={{ marginBottom: '10px' }}>
              {/* Place for your ant image */}
              <img src={hormigueroLogo} alt="Ant icon" width="60" height="60" style={{ opacity: 0.5 }} />
            </div>
            <div className="menu-text" style={{
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: '18px',
              fontWeight: 'bold',
              letterSpacing: '1px'
            }}>VISUALES</div>
          </Link>
          <Link to="/critica" className="menu-item" style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textDecoration: 'none',
            color: 'black',
            transition: 'transform 0.2s',
            justifyContent: 'center', // Add this
            textAlign: 'center',      // Add this
            width: '100%',            // Add this
          }}>
            <div className="ant-icon" style={{ marginBottom: '10px' }}>
              {/* Place for your ant image */}
              <img src={hormigueroLogo} alt="Ant icon" width="60" height="60" style={{ opacity: 0.5 }} />
            </div>
            <div className="menu-text" style={{
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: '18px',
              fontWeight: 'bold',
              letterSpacing: '1px'
            }}>ENTREVISTAS</div>
          </Link>
        </div>
      </div>

      {/* Additional articles section */}
      
    </div>
  );
};

export default Contenido;