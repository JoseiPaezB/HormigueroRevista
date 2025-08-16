import './App.css';
import './footer.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import Navbar from './components/ui/navBar.jsx';
import Edicion from './components/ui/edition.jsx';
import Contenido from './components/ui/contenidos.jsx';
import Creaciones from './components/ui/creaciones.jsx';
import Traducciones from './components/ui/traducciones.jsx';
import AuthorBio from './components/ui/poemario.jsx';
import Poema from './components/ui/poema.jsx';
import EventosContent from './components/ui/eventos_content.jsx';
import ScrollToHashElement from './components/ui/ScrollToHashElement';
import NotFound from './components/ui/notFound.jsx';
import Critica from './components/ui/critica.jsx';
import Rescates from './components/ui/rescates.jsx';
import VisualesWrapper from './components/ui/visuales_wrapper.jsx';
import EntrevistaWrapper from './components/ui/entrevistaWrapper.jsx';
import Res from './components/ui/res.jsx';

function App() {
  return (
      <BrowserRouter>
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
          <Route path="/autor/:nombre" element={<AuthorBio />} />
          <Route path="/poema/:titulo" element={<Poema />} />
          <Route path="/evento/:id" element={<EventosContent />} />
          <Route path="/res" element={<Res />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
  );
}

export default App;