import './App.css';
import './footer.css';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/ui/navBar.jsx';
import Edicion from './components/ui/edition.jsx';
import Contenido from './components/ui/contenidos.jsx';
import Creaciones from './components/ui/creaciones.jsx';
import Traducciones from './components/ui/traducciones.jsx';
import AuthorBio from './components/ui/poemario.jsx';
import Poema from './components/ui/poema.jsx';
import EventosContent from './components/ui/eventos_content.jsx';
import LoadingPage from './components/ui/LoadingPage.jsx';
import { LoadingProvider, useLoading } from './components/ui/LoadingContext.jsx';
import { useEffect } from 'react';
import ScrollToHashElement from './components/ui/ScrollToHashElement';
import NotFound from './components/ui/notFound.jsx';
import Critica from './components/ui/critica.jsx'; // Import the Critica component
import Rescates from './components/ui/rescates.jsx';
import VisualesWrapper from './components/ui/visuales_wrapper.jsx'; // Import the Visuales component
import EntrevistaWrapper from './components/ui/entrevistaWrapper.jsx';
// Import the other content type components - these would be similar to Creaciones.jsx


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
        <Route path="/traducciones" element={<Traducciones />} />
        <Route path="/critica" element={<Critica />} />
        <Route path="/rescates" element={<Rescates />} />
        <Route path="/visuales" element={<VisualesWrapper />} />
        <Route path="/entrevista" element={<EntrevistaWrapper />} />
        <Route path="/poemario/:id" element={<AuthorBio />} />
        <Route path="/poema/:id" element={<Poema />} />
        <Route path="/evento/:id" element={<EventosContent />} />
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