import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import GuestHeader from './GuestHeader';

test('renders GuestHeader with logo and buttons', () => {
  render(<GuestHeader />);
  expect(screen.getByAltText('Logo')).toBeInTheDocument(); // ✅ صح
  expect(screen.getByText('Login')).toBeInTheDocument();
  expect(screen.getByText('Sign up')).toBeInTheDocument();
});
