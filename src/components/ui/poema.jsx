import React, { useState, useEffect } from 'react';
import portada from '../../assets/images/edicion1.png';
import { Link, useParams } from 'react-router-dom';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);


const Poema = () => {
  const { id } = useParams(); // Get poem ID from URL
  const [poema, setPoema] = useState(null);
  const [autor, setAutor] = useState(null);
  const [revista, setRevista] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch data on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Default poem ID if not provided in URL
        const poemId = id || 1;
        
        // 1. Fetch poem data
        const { data: poemaData, error: poemaError } = await supabase
          .from('poema')
          .select('*, id_autor')
          .eq('id', poemId)
          .single();

        if (poemaError) throw poemaError;
        setPoema(poemaData);
        
        // 2. Fetch author data based on the poem's author ID
        if (poemaData.id_autor) {
          const { data: autorData, error: autorError } = await supabase
            .from('autor')
            .select('*')
            .eq('id', poemaData.id_autor)
            .single();

          if (autorError) throw autorError;
          setAutor(autorData);
        }

        // 3. Fetch revista for header background
        const { data: revistaData, error: revistaError } = await supabase
          .from('revista')
          .select('*')
          .eq('id', 1)
          .single();

        if (revistaError) throw revistaError;
        setRevista(revistaData);
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching poem data:', err);
        setError('Failed to load poem');
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

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

  // Process poem text to handle indentation and stanzas
  const processPoemaText = (text) => {
    if (!text) return [];
    
    // Split text into sections based on special titles
    const sectionRegex = /^-([^-]+)-$/gm;
    let sections = [];
    let lastIndex = 0;
    let match;
    let initialContent = '';
    
    // Find all section markers
    const matches = [...text.matchAll(sectionRegex)];
    
    if (matches.length === 0) {
      // No section markers, treat the whole text as one section
      sections.push({
        title: '',
        content: processStanzas(text)
      });
    } else {
      // If there's content before the first section marker
      if (matches[0].index > 0) {
        initialContent = text.substring(0, matches[0].index).trim();
        sections.push({
          title: '',
          content: processStanzas(initialContent)
        });
      }
      
      // Process each marked section
      matches.forEach((match, i) => {
        const title = `-${match[1]}-`;
        const startIdx = match.index + match[0].length;
        const endIdx = i < matches.length - 1 ? matches[i + 1].index : text.length;
        const content = text.substring(startIdx, endIdx).trim();
        
        sections.push({
          title: title,
          content: processStanzas(content)
        });
      });
    }
    
    return sections;
  };
  
  // Process text to handle stanzas based on indentation
  const processStanzas = (text) => {
    if (!text) return text;
  
    // Split by newline characters and process each line
    const lines = text.split('\n');
    let processedText = '';
  
    lines.forEach((line, index) => {
      // Check if the line starts with spaces/tabs (indentation) to identify stanzas
      if (line.match(/^\s+/) && index > 0) {
        // Indented line, this indicates a new stanza (adding an extra line break)
        processedText += '\n\n' + line.trim();
      } else {
        // Otherwise, continue the current stanza
        if (index > 0) processedText += '\n';
        processedText += line.trim();
      }
    });
  
    return processedText;
  };
  

  // Fallback poem if data isn't available
  const fallbackPoem = {
    title: "EN CUBA",
    author: "Alejandra Pizarnik",
    date: "01/08/25",
    sections: [
      {
        title: "-Inicio-",
        content: "Perdido en la mirada\ndivulgué sin considerar una parada.\nMi cuerpo se guía solo\nseguido de su mano en el arroyo.\nNo hay por qué considerar al resto\ndel momento\nsi es que en nuestro aleteo\nlos dos volamos\ny no llevamos velo."
      },
      {
        title: "-Segundo-",
        content: "En el momento\nmi boca fue arrebatada por completo.\nPero no era de perfección\nsino de lo que me decía su alma.\nLlanto desamparado\nfue la vía\ncorrigiendo a mi sangre.\nMe pregunto\nqué será de mí\no cómo viviré\nsi es que te decides ir.\nTomé un consejo de ingenuidad\ny sonreí ante los últimos días\nde la visita que dejaste."
      },
      {
        title: "-Tercero-",
        content: "No sé cómo pasó,\nen un caso de sostenerla\nde acariciar su racimo de amor\nde templar con los labios que\nconjugaban\ny de reír con su alegría cálida\nse desvaneció.\nEn la pena\ncomo el mar se iba\ndejando el alma en llanto\ny agonía,\nya solo me queda esperar\nel regreso de mi querida."
      }
    ]
  };

  // Process poem sections
  const poemSections = poema?.texto 
    ? processPoemaText(poema.texto) 
    : fallbackPoem.sections;

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className="edition-container">
      {/* Green gradient cover image */}
      <div className="cover-image image_2" style={{
        backgroundImage: `url(${poema?.portada || portada})`,
        height: '30vh'
      }}>
      </div>
      
      {/* Article preview section */}
      <div className="article-preview" style={{
        paddingLeft: '20px',
        paddingRight: '20px'
      }}>
        <div style={{ textAlign: 'left', color: '#888', fontSize: '14px', marginTop: '20px' }}>
          {formatDate(poema?.fecha) || fallbackPoem.date}
        </div>
        
        <div style={{ textAlign: 'left', marginTop: '10px', marginBottom: '5px' }}>
          {autor?.nombre || fallbackPoem.author}
        </div>
        
        <h2 style={{ 
          fontWeight: 'bold', 
          marginBottom: '40px',
          textAlign: 'left',
          fontSize: '24px',
          fontFamily: 'JetBrains Mono, monospace',
        }}>
          {poema?.titulo || fallbackPoem.title}
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
            {poemSections.map((section, index) => (
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