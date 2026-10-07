import { screen, fireEvent, within, waitFor } from '@testing-library/react';
import { getTrendingMovies, getMovieDetails } from '../api/tmdb';
import { renderAt, signIn, resetAppState } from '../testUtils/app';

jest.mock('../api/tmdb', () => require('../testUtils/tmdbMock').createTmdbMock());

beforeEach(resetAppState);

describe('movie details page', () => {
  beforeEach(() => {
    signIn();
    jest.clearAllMocks();
  });

  const inception = {
    id: 27205,
    title: 'Inception',
    tagline: 'Your mind is the scene of the crime.',
    overview: 'A thief who steals corporate secrets through dream-sharing technology.',
    release_date: '2010-07-15',
    runtime: 148,
    vote_average: 8.369,
    vote_count: 40353,
    poster_path: '/poster.jpg',
    backdrop_path: '/backdrop.jpg',
    genres: [
      { id: 28, name: 'Action' },
      { id: 878, name: 'Science Fiction' },
    ],
    credits: {
      cast: [
        { id: 6193, credit_id: 'a', name: 'Leonardo DiCaprio', character: 'Dom Cobb', profile_path: '/leo.jpg' },
        { id: 24045, credit_id: 'b', name: 'Joseph Gordon-Levitt', character: 'Arthur', profile_path: null },
      ],
    },
    videos: {
      results: [
        { key: 'clip1', site: 'YouTube', type: 'Clip', official: true },
        { key: 'YoHD9XEInc0', site: 'YouTube', type: 'Trailer', official: false },
      ],
    },
  };

  test('shows the full movie information', async () => {
    getMovieDetails.mockResolvedValue(inception);
    renderAt('/movie/27205');

    expect(await screen.findByRole('heading', { level: 1, name: /inception/i })).toBeInTheDocument();
    expect(getMovieDetails).toHaveBeenCalledWith('27205', expect.anything());
    expect(screen.getByText('Your mind is the scene of the crime.')).toBeInTheDocument();
    expect(screen.getByText(/dream-sharing technology/i)).toBeInTheDocument();
    expect(screen.getByText('8.4')).toBeInTheDocument();
    expect(screen.getByText(/40,353 votes/)).toBeInTheDocument();
    expect(screen.getByText('July 15, 2010')).toBeInTheDocument();
    expect(screen.getByText('2h 28m')).toBeInTheDocument();
    expect(screen.getByText('Action')).toBeInTheDocument();
    expect(screen.getByText('Science Fiction')).toBeInTheDocument();
  });

  test('shows the cast with character names', async () => {
    getMovieDetails.mockResolvedValue(inception);
    renderAt('/movie/27205');

    const cast = await screen.findByRole('list', { name: /cast/i });
    expect(cast).toHaveTextContent('Leonardo DiCaprio');
    expect(cast).toHaveTextContent('Dom Cobb');
    expect(cast).toHaveTextContent('Joseph Gordon-Levitt');
  });

  test('plays the trailer (not a clip) in a pop-up player', async () => {
    getMovieDetails.mockResolvedValue(inception);
    renderAt('/movie/27205');

    fireEvent.click(await screen.findByRole('button', { name: /watch trailer/i }));

    const dialog = screen.getByRole('dialog', { name: /inception/i });
    const player = within(dialog).getByTitle('Inception trailer');
    expect(player).toHaveAttribute('src', expect.stringContaining('youtube-nocookie.com/embed/YoHD9XEInc0'));
    expect(within(dialog).getByRole('link', { name: /watch on youtube/i })).toHaveAttribute(
      'href',
      'https://www.youtube.com/watch?v=YoHD9XEInc0'
    );
  });

  test('closing the trailer removes the player so the video stops', async () => {
    getMovieDetails.mockResolvedValue(inception);
    renderAt('/movie/27205');

    fireEvent.click(await screen.findByRole('button', { name: /watch trailer/i }));
    fireEvent.click(screen.getByRole('button', { name: /close trailer/i }));

    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    expect(screen.queryByTitle('Inception trailer')).not.toBeInTheDocument();
  });

  test('hides the trailer button when there is no trailer', async () => {
    getMovieDetails.mockResolvedValue({ ...inception, videos: { results: [] } });
    renderAt('/movie/27205');

    await screen.findByRole('heading', { level: 1, name: /inception/i });
    expect(screen.queryByRole('button', { name: /watch trailer/i })).not.toBeInTheDocument();
  });

  test('shows "Movie not found" for an id TMDb does not know', async () => {
    getMovieDetails.mockRejectedValue({ response: { status: 404 } });
    renderAt('/movie/999999999');

    expect(await screen.findByRole('heading', { name: /movie not found/i })).toBeInTheDocument();
  });

  test('shows "Movie not found" for a non-numeric id without calling the API', () => {
    renderAt('/movie/abc');

    expect(screen.getByRole('heading', { name: /movie not found/i })).toBeInTheDocument();
    expect(getMovieDetails).not.toHaveBeenCalled();
  });

  test('shows an error with retry when loading fails', async () => {
    getMovieDetails.mockRejectedValueOnce(new Error('Network Error')).mockResolvedValueOnce(inception);
    renderAt('/movie/27205');

    expect(await screen.findByText(/could not load movie details/i)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /retry/i }));
    expect(await screen.findByRole('heading', { level: 1, name: /inception/i })).toBeInTheDocument();
  });

  test('opens from a movie card and goes back to the list', async () => {
    getTrendingMovies.mockResolvedValue({ results: [inception], page: 1, total_pages: 1 });
    getMovieDetails.mockResolvedValue(inception);
    renderAt('/');

    fireEvent.click(await screen.findByRole('link', { name: /inception/i }));
    expect(await screen.findByRole('heading', { level: 1, name: /inception/i })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /back/i }));
    expect(await screen.findByRole('heading', { name: /trending this week/i })).toBeInTheDocument();
  });
});
