import { screen, act } from '@testing-library/react';
import { getTrendingMovies } from '../api/tmdb';
import { renderAt, signIn, resetAppState } from '../testUtils/app';
import { withoutApiKey } from '../testUtils/env';

jest.mock('../api/tmdb', () => require('../testUtils/tmdbMock').createTmdbMock());

beforeEach(resetAppState);

describe('status banners', () => {
  beforeEach(() => signIn());

  test('shows an offline banner while the connection is down', () => {
    renderAt('/');
    expect(screen.queryByText(/you're offline/i)).not.toBeInTheDocument();

    act(() => {
      window.dispatchEvent(new Event('offline'));
    });
    expect(screen.getByText(/you're offline/i)).toBeInTheDocument();

    act(() => {
      window.dispatchEvent(new Event('online'));
    });
    expect(screen.queryByText(/you're offline/i)).not.toBeInTheDocument();
  });

  test('warns when the TMDb API key is not configured', () =>
    withoutApiKey(() => {
      renderAt('/');
      expect(screen.getByText(/configuration needed/i)).toBeInTheDocument();
      expect(screen.getByText(/REACT_APP_TMDB_API_KEY/)).toBeInTheDocument();
    }));

  test('error messages explain why a request failed', async () => {
    getTrendingMovies.mockRejectedValue({ response: { status: 429 } });
    renderAt('/');

    expect(
      await screen.findByText('Could not load trending movies. Too many requests. Please wait a moment and try again.')
    ).toBeInTheDocument();
  });
});
