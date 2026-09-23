import React, { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { ChevronLeft, ChevronRight, Clock, MapPin, X } from 'lucide-react';
import { insects } from '../../data/insects';
import InsectColony from './MovingSvgBackground';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_KEY,
);

const normalizarFotos = (fotos) => {
  if (Array.isArray(fotos)) return fotos.filter(Boolean);
  if (typeof fotos === 'string' && fotos.trim()) {
    try {
      const fotosParseadas = JSON.parse(fotos);
      if (Array.isArray(fotosParseadas)) return fotosParseadas.filter(Boolean);
    } catch {
      // La columna puede contener un arreglo de URLs sin formato JSON válido.
    }

    const urls = fotos.match(/https?:\/\/[^\s"{},]+/g);
    if (urls?.length) return urls;

    return [fotos.trim()];
  }
  return [];
};

const EventoCard = ({ evento, onOpen }) => (
  <article className="evento-card" onClick={() => onOpen(evento)}>
    {evento.fotos?.[0] && (
      <img className="evento-card__image" src={evento.fotos[0]} alt={evento.nombre} />
    )}

    <div className="evento-card__content">
      <h2>{evento.nombre}</h2>

      {(evento.lugar || evento.hora) && (
        <div className="evento-card__details">
          {evento.lugar && (
            <span>
              <MapPin size={15} aria-hidden="true" />
              {evento.lugar}
            </span>
          )}
          {evento.hora && (
            <span>
              <Clock size={15} aria-hidden="true" />
              {evento.hora}
            </span>
          )}
        </div>
      )}

    </div>
  </article>
);

const EventoDetalle = ({ evento, onClose }) => {
  const [fotoActiva, setFotoActiva] = useState(0);
  const totalFotos = evento.fotos?.length || 0;

  const cambiarFoto = (direccion) => {
    setFotoActiva((fotoActual) => (fotoActual + direccion + totalFotos) % totalFotos);
  };

  return (
  <div className="evento-modal" role="presentation" onClick={onClose}>
    <div className="evento-modal__content" role="dialog" aria-modal="true" aria-labelledby="evento-modal-title" onClick={(event) => event.stopPropagation()}>
      <button className="evento-modal__close" type="button" onClick={onClose} aria-label="Cerrar detalle del evento">
        <X size={22} />
      </button>

      <div className="evento-modal__gallery" aria-label={`Galería de ${evento.nombre}`}>
        {totalFotos > 0 && (
          <>
            <img src={evento.fotos[fotoActiva]} alt={`${evento.nombre} - fotografía ${fotoActiva + 1} de ${totalFotos}`} />
            {totalFotos > 1 && (
              <>
                <button className="evento-modal__arrow evento-modal__arrow--previous" type="button" onClick={() => cambiarFoto(-1)} aria-label="Ver foto anterior">
                  <ChevronLeft size={24} />
                </button>
                <button className="evento-modal__arrow evento-modal__arrow--next" type="button" onClick={() => cambiarFoto(1)} aria-label="Ver foto siguiente">
                  <ChevronRight size={24} />
                </button>
                <div className="evento-modal__counter">{fotoActiva + 1} / {totalFotos}</div>
                <div className="evento-modal__dots" aria-label="Seleccionar foto">
                  {evento.fotos.map((foto, index) => (
                    <button key={foto} className={index === fotoActiva ? 'is-active' : ''} type="button" onClick={() => setFotoActiva(index)} aria-label={`Ver foto ${index + 1}`} />
                  ))}
                </div>
              </>
            )}
          </>
        )}
      </div>

      <div className="evento-modal__body">
        <h2 id="evento-modal-title">{evento.nombre}</h2>
        {evento.descripcion && <p>{evento.descripcion}</p>}
        {(evento.lugar || evento.hora) && (
          <div className="evento-card__details">
            {evento.lugar && <span><MapPin size={15} aria-hidden="true" />{evento.lugar}</span>}
            {evento.hora && <span><Clock size={15} aria-hidden="true" />{evento.hora}</span>}
          </div>
        )}
      </div>
    </div>
  </div>
  );
};

const Eventos = () => {
  const [eventos, setEventos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [eventoActivo, setEventoActivo] = useState(null);

  useEffect(() => {
    const cargarEventos = async () => {
      const { data, error: fetchError } = await supabase
        .from('eventosH')
        .select('id, nombre, descripcion, fotos, lugar, hora, fecha')
        .order('fecha', { ascending: true, nullsFirst: false });

      if (fetchError) {
        console.error('Error al cargar eventos:', fetchError);
        setError('No se pudieron cargar los eventos.');
      } else {
        setEventos((data || []).map((evento) => ({
          ...evento,
          fotos: normalizarFotos(evento.fotos),
        })));
      }

      setCargando(false);
    };

    cargarEventos();
  }, []);

  return (
    <main className="eventos-page">
      <div className="eventos-page__ants" aria-hidden="true">
        <InsectColony insects={insects.filter((insect) => insect.type === 'mosquito')} count={50} />
      </div>
      <header className="eventos-page__header">
        <h1>Eventos</h1>
      </header>

      <section className="eventos-grid" aria-label="Eventos">
        {cargando && <p className="eventos-status">Cargando eventos...</p>}
        {!cargando && error && <p className="eventos-status">{error}</p>}
        {!cargando && !error && eventos.length === 0 && (
          <p className="eventos-status">No hay eventos disponibles.</p>
        )}
        {!cargando && !error && eventos.map((evento, index) => (
          <EventoCard key={`${evento.nombre}-${index}`} evento={evento} onOpen={setEventoActivo} />
        ))}
      </section>

      {eventoActivo && <EventoDetalle evento={eventoActivo} onClose={() => setEventoActivo(null)} />}
    </main>
  );
};

export default Eventos;