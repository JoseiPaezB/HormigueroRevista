import React from 'react';
import portada from '../../assets/images/edicion1.png'; // Adjust the path as necessary
import HormigueadosSection from './hormigueados'; // Adjust the path as necessary
import EventosSection from './eventos';

const Edicion = () => {
  return (
    <div className="edition-container">
      {/* Green gradient cover image */}
      <div className="cover-image" style={{
        backgroundImage: `url(${portada})`
      }}>
        <div className="texture-overlay"></div>
        
        {/* Issue info overlay */}
        <div className="issue-info">
          <h2 className="edition-title">EDICION 1</h2>
          <p className="edition-date">04/08/25</p>
          
          {/* Contributors list */}
          <div className="contributors-list">
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
          </div>
        </div>
      </div>
      
      {/* Article preview section */}
      <div className="article-preview">
        <div className="article-date">01/08/25</div>
        <h2 className="edition-title" style={{ fontWeight: 'bold' }}>
          LOS INSECTOS TAMBIEN SON PARTE DE LO MINIMO
        </h2>
        
        <div className="article-content">
          <p>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. 
            Suspendisse viverra egestas euismod 
            gravida, ut fringilla neque
            interdum. Vivamus non interdum
            nisi. Aenean quis egestas justo, 
            vitae tristique ut fermentum risus
            fermentum. Cras pharetra nec leo sed
            vel. Sed et sodales tellus, sed
            feugiat. Proin venenatis dolor non
            lectus.Lorem ipsum dolor sit amet, 
            consectetur adipiscing elit. 
            Suspendisse viverra egestas enim eu
            gravida, ut fringilla neque
            interdum. Vivamus non interdum 
            nisi. Aenean quis.Fusce posuere
            fermentum. Cras pharetra nec leo sed
            vel. Sed et sodales tellus, sed
            feugiat.
          </p>
          
          <p className="read-more">
            Leer más...
          </p>
        </div>
      </div>

      {/* Additional articles section */}
      <br />
      <HormigueadosSection></HormigueadosSection>
      <br />
      <EventosSection></EventosSection>
      
      
    </div>
  );
};

export default Edicion;