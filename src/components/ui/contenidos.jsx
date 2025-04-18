import React from 'react';
import portada from '../../assets/images/edicion1.png'; // Adjust the path as necessary
import HormigueadosSection from './hormigueados'; // Adjust the path as necessary
import EventosSection from './eventos';
import {Link} from 'react-router-dom';
import hormigueroLogo from '../../assets/anticon.svg'; // Adjust the path as necessary

// Import your ant image here
// import antIcon from '../../assets/images/ant.svg'; // Uncomment and adjust path as needed

const Contenido = () => {
  return (
    <div className="edition-container">
      {/* Green gradient cover image */}
      <div className="cover-image image_2" style={{
        backgroundImage: `url(${portada})`
      }}>
        
        {/* Issue info overlay */}
        
      </div>
      
      {/* Article preview section */}
      <div className="article-preview">
        <div className="article-date">01/08/25</div>
        <h2 className="edition-title" style={{ fontWeight: 'bold' }}>
          LOS INSECTOS TAMBIEN SON PARTE DE LO MINIMO
        </h2>
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
          <h3 className="title" style={{ fontWeight: 'bold' }}>
          SINTESIS
        </h3>
        <div className="article-content">
        <p style={{ textIndent: '2em' }}>
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Architecto consectetur vitae possimus eos. Vel impedit sapiente, aliquam blanditiis accusamus ea modi veniam esse quod atque in sed quidem placeat! Ipsam neque dicta repellat nesciunt, quisquam amet quidem magni provident mollitia laudantium assumenda porro esse soluta praesentium consequuntur nemo nulla repudiandae fugit quis quasi iusto ut at deserunt itaque! Minus tenetur culpa atque ullam quibusdam eaque. Quia nostrum eligendi magni placeat velit vitae! Veniam dolor porro sed aut tempora, repellat nisi officiis omnis molestias recusandae obcaecati, sapiente placeat neque unde, quasi illo inventore in quis iusto optio cupiditate! Perspiciatis culpa pariatur recusandae, totam, omnis aperiam aliquam, veniam accusamus tempora blanditiis impedit.
        </p>
        <p style={{ textIndent: '2em' }}>
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Architecto consectetur vitae possimus eos. Vel impedit sapiente, aliquam blanditiis accusamus ea modi veniam esse quod atque in sed quidem placeat! Ipsam neque dicta repellat nesciunt, quisquam amet quidem magni provident mollitia laudantium assumenda porro esse soluta praesentium consequuntur nemo nulla repudiandae fugit quis quasi iusto ut at deserunt itaque! Minus tenetur culpa atque ullam quibusdam eaque. Quia nostrum eligendi magni placeat velit vitae! Veniam dolor porro sed aut tempora, repellat nisi officiis omnis molestias recusandae obcaecati, sapiente placeat neque unde, quasi illo inventore in quis iusto optio cupiditate! Perspiciatis culpa pariatur recusandae, totam, omnis aperiam aliquam, veniam accusamus tempora blanditiis impedit.
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
        margin: '30px 0',
        marginTop: '5rem'
        }}>
          <Link to="/creaciones" className="menu-item" style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center', // Add this
            textAlign: 'center',      // Add this
            width: '100%',            // Add this
            textDecoration: 'none',
            color: 'black',
            transition: 'transform 0.2s'
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
            }}>CREACIONES</div>
          </Link>
          
          <Link to="/traduccion" className="menu-item" style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textDecoration: 'none',
            color: 'black',
            transition: 'transform 0.2s'
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
            transition: 'transform 0.2s'
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
            transition: 'transform 0.2s'
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
            transition: 'transform 0.2s'
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

          <Link to="/entrevistas" className="menu-item" style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textDecoration: 'none',
            color: 'black',
            transition: 'transform 0.2s'
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