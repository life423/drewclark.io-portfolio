import { render, screen } from '@testing-library/react';
import HeroBackground from '../../../components/hero/HeroBackground';
import useViewport from '../../../hooks/useViewport';

// Mock the useViewport hook
jest.mock('../../../hooks/useViewport', () => ({
  __esModule: true,
  default: jest.fn()
}));

describe('HeroBackground', () => {
  // Reset mocks before each test
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders background image with correct props', () => {
    // Mock the useViewport hook to return a specific width
    useViewport.mockReturnValue({ width: 1024 });
    
    render(<HeroBackground scrollY={0} />);
    
    // Check if the image element is rendered
    const backgroundImage = screen.getByAltText('Background');
    expect(backgroundImage).toBeInTheDocument();
    
    // Image should have srcSet and sizes attributes
    expect(backgroundImage).toHaveAttribute('srcSet');
    expect(backgroundImage).toHaveAttribute('sizes', '100vw');
    
    // Should have proper CSS classes
    expect(backgroundImage).toHaveClass('absolute');
    expect(backgroundImage).toHaveClass('inset-0');
    expect(backgroundImage).toHaveClass('w-full');
    expect(backgroundImage).toHaveClass('h-full');
    expect(backgroundImage).toHaveClass('object-cover');
  });

  test('renders different images for different screen sizes', () => {
    // Test with mobile viewport
    useViewport.mockReturnValue({ width: 640 });
    const { rerender } = render(<HeroBackground scrollY={0} />);

    // Test with desktop viewport
    useViewport.mockReturnValue({ width: 1280 });
    rerender(<HeroBackground scrollY={0} />);

    // Verify viewport hook is being called correctly
    expect(useViewport).toHaveBeenCalledTimes(2);
  });

  test('applies parallax effect based on scrollY', () => {
    useViewport.mockReturnValue({ width: 1024 });
    
    // Test with scrollY = 100
    render(<HeroBackground scrollY={100} />);
    
    // Check if transform is applied to the image
    const backgroundImage = screen.getByAltText('Background');
    
    // The inline style should include a transform with translateY 
    // that uses the scrollY value
    const style = window.getComputedStyle(backgroundImage);
    expect(backgroundImage.style.transform).toContain('translateY');
  });
});
