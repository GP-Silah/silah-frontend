/// <reference types="vitest" />

import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import Landing from './Landing';

beforeAll(() => {
  global.IntersectionObserver = class {
    constructor() {}
    observe() {}
    disconnect() {}
    unobserve() {}
  };
});

test('renders Landing page sections and buttons', () => {
  render(<Landing />);

  expect(
    screen.getByText('Find Trusted Suppliers & Grow Your Business'),
  ).toBeInTheDocument();
  expect(screen.getByText('Why Choose Us?')).toBeInTheDocument();
  expect(screen.getByText('How It Works?')).toBeInTheDocument();
});
