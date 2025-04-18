import './App.css'
import './footer.css'
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/ui/navBar.jsx';
import Edicion from './components/ui/edition.jsx';
import Contenido from './components/ui/contenidos.jsx'; // Import your Contenido component
import Footer from './components/ui/footer.jsx';
import Creaciones from './components/ui/creaciones.jsx';

function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<Edicion />} />
        <Route path="/contenidos" element={<Contenido />} />
        <Route path="/creaciones" element={<Creaciones />} />
      </Routes>
      <br />
      <Footer />
    </BrowserRouter>
  )
}

export default App