/// <reference types="vitest" />

import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import HeroSection from './HeroSection';

test('renders HeroSection with heading and button', () => {
    render(<HeroSection />);
    expect(
        screen.getByText('Find Trusted Suppliers & Grow Your Business'),
    ).toBeInTheDocument();
    expect(
        screen.getByText(
            'The easiest way to source products and connect with reliable suppliers.',
        ),
    ).toBeInTheDocument();
    expect(screen.getByText('Get Started')).toBeInTheDocument();
});
