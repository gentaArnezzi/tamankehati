import { render, screen } from '@testing-library/react';
import { SearchResultCard } from '../SearchResultCard';

const mockResult = {
  id: '1',
  type: 'flora' as const,
  title: 'Rafflesia arnoldii',
  description: 'Bunga terbesar di dunia yang endemik di Indonesia',
  score: 0.95,
  url: '/flora/1'
};

describe('SearchResultCard', () => {
  it('renders search result with correct information', () => {
    render(<SearchResultCard result={mockResult} />);
    
    expect(screen.getByText('Rafflesia arnoldii')).toBeInTheDocument();
    expect(screen.getByText('Bunga terbesar di dunia yang endemik di Indonesia')).toBeInTheDocument();
    expect(screen.getByText('Flora')).toBeInTheDocument();
    expect(screen.getByText('95%')).toBeInTheDocument();
  });

  it('renders with correct link', () => {
    render(<SearchResultCard result={mockResult} />);
    
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', '/flora/1');
  });

  it('displays correct icon for flora type', () => {
    render(<SearchResultCard result={mockResult} />);
    
    // Check if the flora icon is present (Leaf icon)
    const icon = screen.getByTestId('flora-icon');
    expect(icon).toBeInTheDocument();
  });
});
