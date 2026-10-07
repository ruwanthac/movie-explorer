// Returns the year from a TMDb date string ("2024-05-17" -> "2024"), or "N/A"
export const getReleaseYear = (date) => (date ? date.slice(0, 4) : 'N/A');

// Formats a TMDb vote average (0-10) to one decimal place, or "NR" if unrated
export const formatRating = (rating) => (rating ? rating.toFixed(1) : 'NR');

// Formats a runtime in minutes as "2h 28m", or null if unknown
export const formatRuntime = (minutes) => {
  if (!minutes) return null;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return hours ? `${hours}h ${mins}m` : `${mins}m`;
};

// Formats a TMDb date ("2010-07-16") as "July 16, 2010", or null if missing.
// UTC is used so the day never shifts because of the user's time zone.
export const formatReleaseDate = (date) => {
  if (!date) return null;
  return new Date(`${date}T00:00:00Z`).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC',
  });
};

// Picks the best YouTube video to use as the trailer:
// official trailers first, then any trailer, then a teaser
export const getTrailer = (videos = []) => {
  const youtube = videos.filter((video) => video.site === 'YouTube');
  return (
    youtube.find((video) => video.type === 'Trailer' && video.official) ||
    youtube.find((video) => video.type === 'Trailer') ||
    youtube.find((video) => video.type === 'Teaser') ||
    null
  );
};

export const getYouTubeUrl = (key) => `https://www.youtube.com/watch?v=${key}`;

// Embed URL for playing a trailer inside the app. The privacy-enhanced
// youtube-nocookie.com domain avoids tracking cookies until the video is played.
export const getYouTubeEmbedUrl = (key) =>
  `https://www.youtube-nocookie.com/embed/${key}?autoplay=1&rel=0&modestbranding=1`;
