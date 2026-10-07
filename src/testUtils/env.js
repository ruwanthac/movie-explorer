// Runs `callback` with the TMDb API key removed, then restores it.
// process.env turns `undefined` into the string "undefined", so a missing key
// has to be restored with `delete` rather than assignment.
export const withoutApiKey = async (callback) => {
  const originalKey = process.env.REACT_APP_TMDB_API_KEY;
  delete process.env.REACT_APP_TMDB_API_KEY;
  try {
    await callback();
  } finally {
    if (originalKey === undefined) delete process.env.REACT_APP_TMDB_API_KEY;
    else process.env.REACT_APP_TMDB_API_KEY = originalKey;
  }
};
