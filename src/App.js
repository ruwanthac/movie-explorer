import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ColorModeProvider } from './context/ThemeContext';
import Layout from './components/Layout';
import ScrollToTop from './components/ScrollToTop';
import Home from './pages/Home';
import MovieDetails from './pages/MovieDetails';
import Favorites from './pages/Favorites';
import Login from './pages/Login';
import NotFound from './pages/NotFound';

function App() {
  return (
    <ColorModeProvider>
      <BrowserRouter>
        <ScrollToTop />
        <Routes>
          {/* Login has its own full-screen layout without the navbar */}
          <Route path="/login" element={<Login />} />

          {/* Main app pages share the navbar layout */}
          <Route element={<Layout />}>
            <Route path="/" element={<Home />} />
            <Route path="/movie/:id" element={<MovieDetails />} />
            <Route path="/favorites" element={<Favorites />} />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ColorModeProvider>
  );
}

export default App;
