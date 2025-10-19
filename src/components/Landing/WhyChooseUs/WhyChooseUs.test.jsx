import '@testing-library/jest-dom';
import WhyChooseUs from './WhyChooseUs'; // ← تأكدي أن المسار صحيح حسب مكان الملف
import { render, screen } from '@testing-library/react';

test('renders all WhyChooseUs list items', () => {
  render(<WhyChooseUs />);
  const points = [
    'Wide range of products and services',
    'Connect with trusted suppliers',
    'Join group purchases',
    'AI-powered forecasts',
    'User-friendly platform',
  ];

  points.forEach((point) => {
    expect(screen.getByText(point)).toBeInTheDocument();
  });
});
