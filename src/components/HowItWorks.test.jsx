/// <reference types="vitest" />

import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import HowItWorks from './HowItWorks';

test('renders HowItWorks section with steps', () => {
  render(<HowItWorks />);
  expect(screen.getByText('How It Works?')).toBeInTheDocument();
  expect(screen.getByText('Sign Up')).toBeInTheDocument();
  expect(screen.getByText('Explore & Connect')).toBeInTheDocument();
});
