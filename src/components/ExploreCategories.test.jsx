// src/components/ExploreCategories.test.jsx
import { render, screen, fireEvent } from '@testing-library/react';
import ExploreCategories from './ExploreCategories';

describe('ExploreCategories Component', () => {
    test('renders section title and subtitle', () => {
        render(<ExploreCategories />);

        expect(
            screen.getByText(/All You Need in One Place/i),
        ).toBeInTheDocument();
        expect(
            screen.getByText(
                /Explore Our Categories and Source with Confidence!/i,
            ),
        ).toBeInTheDocument();
    });

    test('renders both tabs and highlights active tab', () => {
        render(<ExploreCategories />);

        const productsButton = screen.getByRole('button', { name: 'Products' });
        const servicesButton = screen.getByRole('button', { name: 'Services' });

        expect(productsButton).toBeInTheDocument();
        expect(servicesButton).toBeInTheDocument();

        fireEvent.click(servicesButton);
        expect(servicesButton.className).toContain('active-tab');
    });

    test('renders all filters', () => {
        render(<ExploreCategories />);

        const filters = [
            'Agricultural & Pet Supplies',
            'Beauty & Personal Care',
            'Fashion & Accessories',
            'Food, Beverages & Health',
            'Home & Living',
            'Hardware & Tools',
            'Packaging & Materials',
        ];

        filters.forEach((filter) => {
            expect(screen.getByText(filter)).toBeInTheDocument();
        });
    });

    test('renders cards', () => {
        render(<ExploreCategories />);

        const cards = [
            'Animal Feed',
            'Fertilizers',
            'Pet Accessories & Toys',
            'Pet Medicines',
        ];

        cards.forEach((card) => {
            expect(screen.getByText(card)).toBeInTheDocument();
        });
    });
});
