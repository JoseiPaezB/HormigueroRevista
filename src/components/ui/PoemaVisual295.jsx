import React, { useEffect, useMemo, useState } from 'react';

// Poema 295: URLs en poema.texto, una por línea, en orden de lectura.
export default function PoemaVisual295({ texto }) {
  const urls = useMemo(() => (texto || '')
    .split(/\r?\n/)
    .map((url) => url.trim())
    .filter((url) => /^https:\/\//i.test(url)), [texto]);
  const [estado, setEstado] = useState({ cargando: true, errores: [] });

  useEffect(() => {
    let activo = true;
    setEstado({ cargando: true, errores: [] });
    if (!urls.length) {
      setEstado({ cargando: false, errores: [] });
      return () => { activo = false; };
    }
    Promise.all(urls.map((url) => new Promise((resolve) => {
      const imagen = new Image();
      imagen.onload = () => resolve(null);
      imagen.onerror = () => resolve(url);
      imagen.src = url;
    }))).then((resultados) => {
      if (activo) setEstado({ cargando: false, errores: resultados.filter(Boolean) });
    });
    return () => { activo = false; };
  }, [urls]);

  if (!urls.length) return <p>No hay imágenes configuradas para este poema.</p>;
  if (estado.cargando) return <p role="status" style={{ textAlign: 'center' }}>Cargando poema…</p>;
  if (estado.errores.length) return (
    <div role="alert" style={{ textAlign: 'center' }}>
      No se pudieron cargar todas las páginas del poema. Comprueba las URLs en Supabase.
    </div>
  );

  return (
    <div aria-label="Poema visual completo" style={{ width: '100%', maxWidth: 850, margin: '0 auto', background: '#fff', lineHeight: 0 }}>
      {urls.map((url, index) => (
        <img
          key={`${index}-${url}`}
          src={url}
          alt={`Página ${index + 1} de ${urls.length} del poema`}
          loading="eager"
          decoding="sync"
          style={{ display: 'block', width: '100%', height: 'auto', margin: 0, padding: 0, border: 0, borderRadius: 0, boxShadow: 'none', objectFit: 'contain' }}
        />
      ))}
    </div>
  );
}
