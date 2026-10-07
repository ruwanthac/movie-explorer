import { useEffect } from 'react';

const APP_NAME = 'Movie Explorer';

// Sets the browser tab title, e.g. "Inception (2010) | Movie Explorer".
// Without a title, only the app name is shown.
const useDocumentTitle = (title) => {
  useEffect(() => {
    document.title = title ? `${title} | ${APP_NAME}` : APP_NAME;
  }, [title]);
};

export default useDocumentTitle;
