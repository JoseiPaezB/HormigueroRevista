import React, { useEffect, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { createClient } from '@supabase/supabase-js';
import { Helmet } from 'react-helmet';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_KEY
);

const PELOTA_GIF = 'https://hkapdwrhiafewoqxdwsr.supabase.co/storage/v1/object/public/animation/Grabaciondepantalla2026-10-17alas12.46.23a.m.-ezgif.com-video-to-gif-converter-no-bg.gif';

/** Pelotas decorativas con colisiones elásticas entre sí y con los bordes. */
function PelotasSwarm() {
  const contenedorRef = useRef(null);

  useEffect(() => {
    const contenedor = contenedorRef.current;
    if (!contenedor) return;
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
    let frame = 0;
    let bolas = [];
    let anterior = 0;
    let ancho = 0;
    let alto = 0;

    const preparar = () => {
      cancelAnimationFrame(frame);
      contenedor.replaceChildren();
      bolas = [];
      if (motion.matches) return;
      ancho = window.innerWidth;
      alto = window.innerHeight;
      const movil = ancho <= 840;
      const cantidad = movil ? 20 : 40;
      const diametro = movil ? 64 : 100;
      const radio = diametro / 2;

      for (let i = 0; i < cantidad; i++) {
        // Intentar colocar cada pelota sin superponerla con las demás.
        let x = radio, y = radio;
        for (let intento = 0; intento < 100; intento++) {
          x = radio + Math.random() * Math.max(0, ancho - diametro);
          y = radio + Math.random() * Math.max(0, alto - diametro);
          if (bolas.every(b => Math.hypot(b.x - x, b.y - y) >= radio + b.radio + 8)) break;
        }
        const angulo = Math.random() * Math.PI * 2;
        const velocidad = movil ? 42 + Math.random() * 30 : 50 + Math.random() * 42;
        const img = document.createElement('img');
        img.src = PELOTA_GIF;
        img.alt = '';
        img.draggable = false;
        img.style.width = `${diametro}px`;
        img.style.height = `${diametro}px`;
        img.style.position = 'absolute';
        img.style.left = '0';
        img.style.top = '0';
        img.style.objectFit = 'contain';
        img.style.opacity = '0.20';
        img.style.mixBlendMode = 'multiply';
        img.style.willChange = 'transform';
        contenedor.appendChild(img);
        bolas.push({ x, y, vx: Math.cos(angulo) * velocidad, vy: Math.sin(angulo) * velocidad, radio, img });
      }
      anterior = 0;
      frame = requestAnimationFrame(animar);
    };

    const animar = (tiempo) => {
      const dt = anterior ? Math.min((tiempo - anterior) / 1000, 0.035) : 0;
      anterior = tiempo;
      for (const b of bolas) {
        b.x += b.vx * dt;
        b.y += b.vy * dt;
        if (b.x < b.radio) { b.x = b.radio; b.vx = Math.abs(b.vx); }
        if (b.x > ancho - b.radio) { b.x = ancho - b.radio; b.vx = -Math.abs(b.vx); }
        if (b.y < b.radio) { b.y = b.radio; b.vy = Math.abs(b.vy); }
        if (b.y > alto - b.radio) { b.y = alto - b.radio; b.vy = -Math.abs(b.vy); }
      }
      for (let i = 0; i < bolas.length; i++) {
        for (let j = i + 1; j < bolas.length; j++) {
          const a = bolas[i], b = bolas[j];
          let dx = b.x - a.x, dy = b.y - a.y;
          let distancia = Math.hypot(dx, dy);
          const minimo = a.radio + b.radio;
          if (distancia >= minimo) continue;
          if (distancia < 0.001) { dx = 1; dy = 0; distancia = 1; }
          const nx = dx / distancia, ny = dy / distancia;
          const solapamiento = (minimo - distancia) / 2;
          a.x -= nx * solapamiento; a.y -= ny * solapamiento;
          b.x += nx * solapamiento; b.y += ny * solapamiento;
          // Masas iguales: intercambiar la velocidad en el eje del choque.
          const relativa = (b.vx - a.vx) * nx + (b.vy - a.vy) * ny;
          if (relativa < 0) {
            a.vx += relativa * nx; a.vy += relativa * ny;
            b.vx -= relativa * nx; b.vy -= relativa * ny;
          }
        }
      }
      for (const b of bolas) {
        b.img.style.transform = `translate3d(${b.x - b.radio}px, ${b.y - b.radio}px, 0)`;
      }
      frame = requestAnimationFrame(animar);
    };

    preparar();
    window.addEventListener('resize', preparar);
    motion.addEventListener?.('change', preparar);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('resize', preparar);
      motion.removeEventListener?.('change', preparar);
      contenedor.replaceChildren();
    };
  }, []);

  return <div ref={contenedorRef} aria-hidden="true" className="visuales2-fondo-pelotas" />;
}

/** Galería independiente para la revista ID 5. */
export default function Visuales2() {
  const [searchParams] = useSearchParams();
  const edicion = searchParams.get('edicion');
  const [obras, setObras] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError('');
    setSelected(null);

    if (edicion !== '5') {
      setObras([]);
      setLoading(false);
      return () => { active = false; };
    }

    const load = async () => {
      // Relación FK visuales2.id_autor -> autor.id para mostrar el nombre.
      const { data, error: queryError } = await supabase
        .from('visuales2')
        .select('id, id_autor, id_revista, titulo, imagen_url, descripcion, autor(nombre)')
        .eq('id_revista', 5)
        .order('id', { ascending: true });
      if (!active) return;
      if (queryError) setError('No se pudieron cargar las obras visuales.');
      else setObras(data || []);
      setLoading(false);
    };
    load();
    return () => { active = false; };
  }, [edicion]);

  return (
    <main style={{ minHeight: '100vh', padding: 'clamp(100px, 12vw, 150px) 20px 90px', background: '#fff', color: '#111', position: 'relative', isolation: 'isolate' }}>
      <PelotasSwarm />
      <Helmet>
        <title>A ojo de hormiga | Hormiguero de Poemas</title>
        <meta name="description" content="Obras visuales de artistas participantes en la edición 5 de Hormiguero de Poemas." />
      </Helmet>
      <div style={{ maxWidth: 1150, margin: '0 auto', position: 'relative', zIndex: 1 }}>
        <header style={{ textAlign: 'center', marginBottom: 55 }}>
          <p style={{ fontSize: 12, letterSpacing: '0.2em', marginBottom: 14 }}>EDICIÓN 4</p>
          <h1 style={{ fontSize: 'clamp(2rem, 6vw, 4.5rem)', lineHeight: 1.1, margin: '0 0 15px', fontWeight: 900 }}>A OJO DE HORMIGA</h1>
          <p style={{ fontSize: 15, fontStyle: 'italic' }}>Artes visuales</p>
        </header>

        {edicion !== '5' ? (
          <p style={{ textAlign: 'center' }}>Esta sección está disponible únicamente para la edición 5.</p>
        ) : loading ? (
          <p style={{ textAlign: 'center' }}>Cargando obras...</p>
        ) : error ? (
          <p role="alert" style={{ textAlign: 'center' }}>{error}</p>
        ) : obras.length === 0 ? (
          <p style={{ textAlign: 'center' }}>Próximamente se publicarán las obras de esta edición.</p>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))', gap: '48px 30px', alignItems: 'start' }}>
            {obras.map(obra => (
              <article key={obra.id} className="visual-obra" style={{ minWidth: 0 }}>
                <button
                  type="button"
                  onClick={() => setSelected(obra)}
                  aria-label={`Ampliar ${obra.titulo}`}
                  className="visual-obra-boton"
                  style={{ width: '100%', padding: 0, border: 0, background: '#f5f5f5', cursor: 'zoom-in', display: 'block' }}
                >
                  <img className="visual-obra-imagen" src={obra.imagen_url} alt={obra.titulo} loading="lazy" style={{ display: 'block', width: '100%', height: 340, objectFit: 'contain' }} />
                </button>
                <h2 style={{ fontSize: 19, margin: '16px 0 6px' }}>{obra.titulo}</h2>
                {obra.autor?.nombre && (
                  <Link to={`/autor/${encodeURIComponent(obra.autor.nombre)}?edicion=5`} style={{ color: 'inherit', fontSize: 14, textDecoration: 'underline' }}>
                    {obra.autor.nombre}
                  </Link>
                )}
                {obra.descripcion && <p style={{ fontSize: 14, lineHeight: 1.7, whiteSpace: 'pre-line', marginTop: 12 }}>{obra.descripcion}</p>}
              </article>
            ))}
          </div>
        )}
      </div>
      <style>{`
        .visuales2-fondo-pelotas {
          position: fixed;
          inset: 0;
          z-index: 0;
          overflow: hidden;
          pointer-events: none;
        }
        .visual-obra-boton { overflow: hidden; border-radius: 2px; }
        @media (min-width: 841px) and (hover: hover) and (pointer: fine) {
          .visual-obra {
            transition: transform 350ms ease;
          }
          .visual-obra-boton {
            transition: box-shadow 350ms ease, background-color 350ms ease;
          }
          .visual-obra-imagen {
            transition: transform 550ms cubic-bezier(.2,.75,.25,1), filter 350ms ease;
            will-change: transform;
          }
          .visual-obra:hover, .visual-obra:focus-within {
            transform: translateY(-7px);
          }
          .visual-obra:hover .visual-obra-boton, .visual-obra:focus-within .visual-obra-boton {
            box-shadow: 0 16px 30px rgba(0,0,0,.14);
            background-color: #eee;
          }
          .visual-obra:hover .visual-obra-imagen, .visual-obra:focus-within .visual-obra-imagen {
            transform: scale(1.045);
            filter: contrast(1.04);
          }
        }
        @media (prefers-reduced-motion: reduce) {
          .visual-obra, .visual-obra-boton, .visual-obra-imagen { transition: none !important; }
        }
      `}</style>
      {selected && (
        <div role="dialog" aria-modal="true" aria-label={selected.titulo} onClick={() => setSelected(null)} style={{ position: 'fixed', inset: 0, zIndex: 2000, background: 'rgba(0,0,0,0.93)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 24, cursor: 'zoom-out' }}>
          <button type="button" onClick={() => setSelected(null)} aria-label="Cerrar" style={{ position: 'absolute', right: 20, top: 16, background: 'none', border: 0, color: 'white', fontSize: 34, cursor: 'pointer' }}>×</button>
          <img src={selected.imagen_url} alt={selected.titulo} onClick={e => e.stopPropagation()} style={{ maxWidth: '100%', maxHeight: '78vh', objectFit: 'contain', cursor: 'default' }} />
          <p style={{ color: '#fff', textAlign: 'center', marginTop: 18 }}>{selected.titulo}{selected.autor?.nombre ? ` — ${selected.autor.nombre}` : ''}</p>
        </div>
      )}
    </main>
  );
}
