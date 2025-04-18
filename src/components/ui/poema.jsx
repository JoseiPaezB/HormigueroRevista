import React from 'react';
import portada from '../../assets/images/edicion1.png';
import {Link} from 'react-router-dom';

// Import your book cover images

const Poema = () => {
  // Sample poem content - this would be replaced by your actual poem data
  const poem = {
    title: "EN CUBA",
    author: "Alejandra Pizarnik",
    date: "01/08/25",
    sections: [
      {
        title: "-Inicio-",
        content: `Perdido en la mirada
divulgué sin considerar una parada.
Mi cuerpo se guía solo
seguido de su mano en el arroyo.
No hay por qué considerar al resto
del momento
si es que en nuestro aleteo
los dos volamos
y no llevamos velo.`
      },
      {
        title: "-Segundo-",
        content: `En el momento
mi boca fue arrebatada por completo.
Pero no era de perfección
sino de lo que me decía su alma.
Llanto desamparado
fue la vía
corrigiendo a mi sangre.
Me pregunto
qué será de mí
o cómo viviré
si es que te decides ir.
Tomé un consejo de ingenuidad
y sonreí ante los últimos días
de la visita que dejaste.`
      },
      {
        title: "-Tercero-",
        content: `No sé cómo pasó,
en un caso de sostenerla
de acariciar su racimo de amor
de templar con los labios que
conjugaban
y de reír con su alegría cálida
se desvaneció.
En la pena
como el mar se iba
dejando el alma en llanto
y agonía,
ya solo me queda esperar
el regreso de mi querida.`
      }
    ]
  };

  return (
    <div className="edition-container">
      {/* Green gradient cover image */}
      <div className="cover-image image_2" style={{
        backgroundImage: `url(${portada})`,
        height: '30vh'
      }}>
      </div>
      
      {/* Article preview section */}
      <div className="article-preview" style={{
        paddingLeft: '20px',
        paddingRight: '20px'
      }}>
        <div style={{ textAlign: 'left', color: '#888', fontSize: '14px', marginTop: '20px' }}>
          {poem.date}
        </div>
        
        <div style={{ textAlign: 'left', marginTop: '10px', marginBottom: '5px' }}>
          {poem.author}
        </div>
        
        <h2 style={{ 
          fontWeight: 'bold', 
          marginBottom: '40px',
          textAlign: 'left',
          fontSize: '24px',
          fontFamily: 'JetBrains Mono, monospace',
        }}>
          {poem.title}
        </h2>
       
        <div style={{
          marginBottom: '3rem',
          textAlign: 'left',
          padding: 0
        }}>
          {/* Poem section */}
          <div style={{
            fontFamily: 'monospace',
            fontSize: '14px',
            lineHeight: '1.8',
            textAlign: 'left',
            padding: 0,
            marginLeft: 0
          }}>
            {poem.sections.map((section, index) => (
              <div key={index} style={{ 
                marginBottom: '40px',
                textAlign: 'left'
              }}>
                {section.title && (
                  <p style={{ 
                    marginBottom: '15px',
                    textAlign: 'left' 
                  }}>{section.title}</p>
                )}
                <div style={{ 
                  textAlign: 'left',
                  whiteSpace: 'pre-line'
                }}>{section.content}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Poema;