import {
  formatRating,
  formatReleaseDate,
  formatRuntime,
  getReleaseYear,
  getTrailer,
} from './formatters';

test('getReleaseYear', () => {
  expect(getReleaseYear('2010-07-15')).toBe('2010');
  expect(getReleaseYear('')).toBe('N/A');
});

test('formatRating', () => {
  expect(formatRating(8.369)).toBe('8.4');
  expect(formatRating(0)).toBe('NR');
});

test('formatRuntime', () => {
  expect(formatRuntime(148)).toBe('2h 28m');
  expect(formatRuntime(45)).toBe('45m');
  expect(formatRuntime(0)).toBeNull();
});

test('formatReleaseDate does not shift the day across time zones', () => {
  expect(formatReleaseDate('2010-07-15')).toBe('July 15, 2010');
  expect(formatReleaseDate('')).toBeNull();
});

describe('getTrailer', () => {
  const video = (type, official, site = 'YouTube') => ({ key: `${type}-${official}-${site}`, type, official, site });

  test('prefers an official YouTube trailer', () => {
    const videos = [video('Trailer', false), video('Trailer', true), video('Teaser', true)];
    expect(getTrailer(videos).key).toBe('Trailer-true-YouTube');
  });

  test('falls back to any trailer, then a teaser', () => {
    expect(getTrailer([video('Teaser', true), video('Trailer', false)]).key).toBe('Trailer-false-YouTube');
    expect(getTrailer([video('Clip', true), video('Teaser', false)]).key).toBe('Teaser-false-YouTube');
  });

  test('ignores videos that are not on YouTube', () => {
    expect(getTrailer([video('Trailer', true, 'Vimeo')])).toBeNull();
    expect(getTrailer()).toBeNull();
  });
});
