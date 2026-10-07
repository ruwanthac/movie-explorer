// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';
import { TextEncoder, TextDecoder } from 'util';
import { installIntersectionObserverMock } from './testUtils/intersectionObserver';

// React Router needs TextEncoder, which the Jest jsdom environment does not provide
Object.assign(global, { TextEncoder, TextDecoder });

// jsdom does not implement scrolling, which ScrollToTop calls on every route change
window.scrollTo = jest.fn();

// Fake IntersectionObserver for infinite scroll tests
installIntersectionObserverMock();
