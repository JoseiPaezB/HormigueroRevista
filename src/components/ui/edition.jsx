import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createClient } from '@supabase/supabase-js';
import portada from '../../assets/images/edicion1.png'; // Fallback image
import HormigueadosSection from './hormigueados';
import EventosSection from './eventos';
import Footer from './footer';

// Initialize Supabase client
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const Edicion = () => {
  // State for revista data
  const [revista, setRevista] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [contributors, setContributors] = useState([]);
  const [readyToShow, setReadyToShow] = useState(false);

  // Control scroll and content visibility


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
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: '2-digit'
    });
  };


  return (
    <div className="edition-container" >
      {/* Green gradient cover image */}
      <div className="cover-image" id="main-content" style={{
        backgroundImage: `url(${portada})`
      }}>
        <div className="texture-overlay"></div>
        
        {/* Issue info overlay */}
        <div className="issue-info">
          <Link to="/contenidos" className="edition-link" style={{color: 'white'}}>
            <h2 className="edition-title">EDICION {revista?.numero || 1}</h2>
          </Link>          
          <p className="edition-date">{formatDate(revista?.fecha) || '04/08/25'}</p>
          
          {/* Contributors list */}
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
        </div>
      </div>
      
      {/* Article preview section */}
      <div className="article-preview">
        <div className="article-date">{formatDate(revista?.fecha) || '01/08/25'}</div>
        <h2 className="edition-title" style={{ fontWeight: 'bold' }}>
          {revista?.nombre.toUpperCase() || 'LOS INSECTOS TAMBIEN SON PARTE DE LO MINIMO'}
        </h2>
        
        <div className="article-content">
          <p>
            {revista?.sintesis || 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse viverra egestas euismod gravida, ut fringilla neque interdum. Vivamus non interdum nisi. Aenean quis egestas justo, vitae tristique ut fermentum risus fermentum. Cras pharetra nec leo sed vel. Sed et sodales tellus, sed feugiat. Proin venenatis dolor non lectus.Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse viverra egestas enim eu gravida, ut fringilla neque interdum. Vivamus non interdum nisi. Aenean quis.Fusce posuere fermentum. Cras pharetra nec leo sed vel. Sed et sodales tellus, sed feugiat.'}
          </p>
          
          <p className="read-more">
            Leer más...
          </p>
        </div>
      </div>

      {/* Additional articles section */}
      <br />
      <HormigueadosSection />
      <br />
      <div id="eventos">
        <EventosSection />
      </div>
      <br />
      <div >
        <Footer />
      </div>
      <div id="contacto"></div>
    </div>
  );
};

export default Edicion;