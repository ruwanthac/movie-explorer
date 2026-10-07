import { getTrendingMovies, isApiKeyConfigured, MISSING_API_KEY_MESSAGE } from './tmdb';
import { withoutApiKey } from '../testUtils/env';

test('detects a missing API key', () =>
  withoutApiKey(() => {
    expect(isApiKeyConfigured()).toBe(false);
  }));

test('stops the request before it is sent when the API key is missing', () =>
  withoutApiKey(async () => {
    await expect(getTrendingMovies()).rejects.toMatchObject({ userMessage: MISSING_API_KEY_MESSAGE });
  }));
