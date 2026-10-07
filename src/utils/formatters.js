// Returns the year from a TMDb date string ("2024-05-17" -> "2024"), or "N/A"
export const getReleaseYear = (date) => (date ? date.slice(0, 4) : 'N/A');

// Formats a TMDb vote average (0-10) to one decimal place, or "NR" if unrated
export const formatRating = (rating) => (rating ? rating.toFixed(1) : 'NR');
