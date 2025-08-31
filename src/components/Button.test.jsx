/// <reference types="vitest" />

import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import Button from './Button';

test('renders button with given label', () => {
    render(<Button label="Get Started" />);
    const button = screen.getByText('Get Started');
    expect(button).toBeInTheDocument();
});
