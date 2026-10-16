import React from 'react';
import './HormigaCaminando.css';

const GIF_DERECHA = 'https://hkapdwrhiafewoqxdwsr.supabase.co/storage/v1/object/public/animation/Grabaciondepantalla2026-10-15alas8.53.35p.m.-ezgif.com-rotate.gif';
const GIF_IZQUIERDA = 'https://hkapdwrhiafewoqxdwsr.supabase.co/storage/v1/object/public/animation/Grabaciondepantalla2026-10-15alas8.53.35p.m.-ezgif.com-video-to-gif-converter%20(1)-no-bg.gif';

export default function HormigaCaminando() {
  return (
    <div className="hormiga-recorrido" aria-hidden="true">
      <img className="hormiga-caminando hormiga-ida" src={GIF_DERECHA} alt="" draggable="false" />
      <img className="hormiga-caminando hormiga-vuelta" src={GIF_IZQUIERDA} alt="" draggable="false" />
    </div>
  );
}
