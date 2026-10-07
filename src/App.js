import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ColorModeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import { MovieProvider } from './context/MovieContext';
import { NotificationProvider } from './context/NotificationContext';
import ErrorBoundary from './components/ErrorBoundary';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import ScrollToTop from './components/ScrollToTop';
import Home from './pages/Home';
import MovieDetails from './pages/MovieDetails';
import Favorites from './pages/Favorites';
import Login from './pages/Login';
import NotFound from './pages/NotFound';

function App() {
  return (
    <ColorModeProvider>
      {/* Inside the theme provider so the error page matches light/dark mode */}
      <ErrorBoundary>
        <AuthProvider>
          <MovieProvider>
            <NotificationProvider>
              <BrowserRouter>
                <ScrollToTop />
                <Routes>
                  {/* Login has its own full-screen layout without the navbar */}
                  <Route path="/login" element={<Login />} />

                  {/* Everything else requires a logged-in user and shares the navbar layout */}
                  <Route element={<ProtectedRoute />}>
                    <Route element={<Layout />}>
                      <Route path="/" element={<Home />} />
                      <Route path="/movie/:id" element={<MovieDetails />} />
                      <Route path="/favorites" element={<Favorites />} />
                      <Route path="*" element={<NotFound />} />
                    </Route>
                  </Route>
                </Routes>
              </BrowserRouter>
            </NotificationProvider>
          </MovieProvider>
        </AuthProvider>
      </ErrorBoundary>
    </ColorModeProvider>
  );
}

export default App;
