import { act } from '@testing-library/react';

// jsdom has no IntersectionObserver, so tests use this fake one.
// `scrollSentinelIntoView()` simulates the user scrolling to the bottom of a list.
const observers = new Set();

class MockIntersectionObserver {
  constructor(callback) {
    this.callback = callback;
    this.elements = new Set();
    observers.add(this);
  }

  observe(element) {
    this.elements.add(element);
  }

  unobserve(element) {
    this.elements.delete(element);
  }

  disconnect() {
    this.elements.clear();
    observers.delete(this);
  }
}

export const installIntersectionObserverMock = () => {
  window.IntersectionObserver = MockIntersectionObserver;
  global.IntersectionObserver = MockIntersectionObserver;
};

export const scrollSentinelIntoView = () => {
  act(() => {
    observers.forEach((observer) => {
      observer.elements.forEach((target) => observer.callback([{ isIntersecting: true, target }]));
    });
  });
};
