import './App.css';
import './footer.css';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/ui/navBar.jsx';
import Edicion from './components/ui/edition.jsx';
import Contenido from './components/ui/contenidos.jsx';
import Creaciones from './components/ui/creaciones.jsx';
import AuthorBio from './components/ui/poemario.jsx';
import Poema from './components/ui/poema.jsx';
import EventosContent from './components/ui/eventos_content.jsx'; // Update import name to match export
import LoadingPage from './components/ui/LoadingPage.jsx';
import { LoadingProvider, useLoading } from './components/ui/LoadingContext.jsx';
import { useEffect } from 'react';
import ScrollToHashElement from './components/ui/ScrollToHashElement';
import NotFound from './components/ui/notFound.jsx';

// Subcomponente que escucha cambios en la URL y muestra el loading
function RoutesWithLoading() {
  const location = useLocation();
  const { loading, setLoading } = useLoading();

  useEffect(() => {
    setLoading(true);
    const timeout = setTimeout(() => {
      setLoading(false);
    }, 600); // Simula una carga (puedes ajustar o sincronizar con fetchs reales)

    return () => clearTimeout(timeout);
  }, [location.pathname]);

  if (loading) return <LoadingPage />;

  return (
    <>
      {/* Include ScrollToHashElement here so it listens for hash changes */}
      <ScrollToHashElement />
      <Navbar />
      <Routes>
        <Route path="/" element={<Edicion />} />
        <Route path="/contenidos" element={<Contenido />} />
        <Route path="/creaciones" element={<Creaciones />} />
        <Route path="/poemario/:id" element={<AuthorBio />} />
        <Route path="/poema/:id" element={<Poema />} />
        <Route path="/evento/:id" element={<EventosContent />} /> {/* Make sure component name matches import */}
        <Route path="*" element={<NotFound />} /> 

      </Routes>
    </>
  );
}

function App() {
  return (
    <LoadingProvider>
      <BrowserRouter>
        <RoutesWithLoading />
      </BrowserRouter>
    </LoadingProvider>
  );
}

export default App;