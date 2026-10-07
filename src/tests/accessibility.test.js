import { screen, fireEvent, waitFor } from '@testing-library/react';
import { getMovieDetails } from '../api/tmdb';
import { renderAt, signIn, resetAppState } from '../testUtils/app';

jest.mock('../api/tmdb', () => require('../testUtils/tmdbMock').createTmdbMock());

beforeEach(resetAppState);

describe('page titles and accessibility', () => {
  beforeEach(() => {
    signIn();
    jest.clearAllMocks();
  });

  test('sets a descriptive browser tab title for each page', async () => {
    getMovieDetails.mockResolvedValue({
      id: 27205,
      title: 'Inception',
      release_date: '2010-07-15',
      genres: [],
      credits: { cast: [] },
      videos: { results: [] },
    });

    const { unmount } = renderAt('/movie/27205');
    await waitFor(() => expect(document.title).toBe('Inception (2010) | Movie Explorer'));
    unmount();

    renderAt('/favorites');
    expect(document.title).toBe('My favorites | Movie Explorer');
  });

  test('uses the app name on the home page and the search term while searching', () => {
    localStorage.setItem('movieExplorer.lastSearch', JSON.stringify('matrix'));
    renderAt('/');
    expect(document.title).toBe('Search: matrix | Movie Explorer');

    fireEvent.click(screen.getByRole('button', { name: /clear search/i }));
    expect(document.title).toBe('Movie Explorer');
  });

  test('has a skip link that points to the main content', () => {
    renderAt('/');
    expect(screen.getByRole('link', { name: /skip to content/i })).toHaveAttribute('href', '#main-content');
    expect(screen.getByRole('main')).toHaveAttribute('id', 'main-content');
  });
});
