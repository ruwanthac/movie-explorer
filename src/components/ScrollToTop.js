import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

// Scrolls back to the top whenever the route changes,
// so opening a movie never starts halfway down the page
const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};

export default ScrollToTop;
