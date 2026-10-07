import axios from 'axios';
import { getErrorMessage, describeError } from './errors';

const httpError = (status) => ({ response: { status } });

describe('getErrorMessage', () => {
  test('explains HTTP errors from TMDb', () => {
    expect(getErrorMessage(httpError(401))).toMatch(/api key is invalid/i);
    expect(getErrorMessage(httpError(404))).toMatch(/could not be found/i);
    expect(getErrorMessage(httpError(429))).toMatch(/too many requests/i);
    expect(getErrorMessage(httpError(503))).toMatch(/having problems/i);
    expect(getErrorMessage(httpError(400))).toMatch(/something went wrong/i);
  });

  test('explains timeouts', () => {
    expect(getErrorMessage({ code: 'ECONNABORTED' })).toMatch(/took too long/i);
  });

  test('explains being offline', () => {
    const onLine = jest.spyOn(navigator, 'onLine', 'get').mockReturnValue(false);
    expect(getErrorMessage({ code: 'ERR_NETWORK' })).toMatch(/you appear to be offline/i);
    onLine.mockRestore();
  });

  test('explains other network failures', () => {
    expect(getErrorMessage({ code: 'ERR_NETWORK' })).toMatch(/could not reach the movie database/i);
  });

  test('reuses a message already added by the interceptor', () => {
    expect(getErrorMessage({ userMessage: 'Custom message' })).toBe('Custom message');
  });

  test('returns null for cancelled requests', () => {
    expect(getErrorMessage(new axios.CanceledError())).toBeNull();
  });
});

test('describeError combines what failed with why', () => {
  expect(describeError('Could not load trending movies.', httpError(429))).toBe(
    'Could not load trending movies. Too many requests. Please wait a moment and try again.'
  );
});
