import { render, screen } from '@testing-library/react';
import ResponsiveImage from '../../../../components/projects/responsive/ResponsiveImage';
import useViewport from '../../../../hooks/useViewport';

// Mock the useViewport hook
jest.mock('../../../../hooks/useViewport', () => ({
  __esModule: true,
  default: jest.fn()
}));

describe('ResponsiveImage', () => {
  const mockSources = {
    xs: '/images/test-xs.jpg',
    sm: '/images/test-sm.jpg',
    md: '/images/test-md.jpg',
    lg: '/images/test-lg.jpg',
    xl: '/images/test-xl.jpg'
  };

  const mockSrcSetSources = {
    640: '/images/test-640.jpg',
    768: '/images/test-768.jpg',
    1024: '/images/test-1024.jpg',
    1280: '/images/test-1280.jpg',
    1920: '/images/test-1920.jpg'
  };

  // Reset mocks before each test
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders with correct responsive source for mobile viewport', () => {
    // Mock the viewport hook to return mobile width
    useViewport.mockReturnValue({ width: 375 });
    
    render(
      <ResponsiveImage 
        sources={mockSources} 
        alt="Test image"
        className="test-class"
      />
    );
    
    const image = screen.getByAltText('Test image');
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute('src', '/images/test-xs.jpg');
    expect(image).toHaveClass('test-class');
    expect(image).toHaveAttribute('loading', 'lazy');
  });

  test('renders with correct responsive source for tablet viewport', () => {
    // Mock the viewport hook to return tablet width
    useViewport.mockReturnValue({ width: 700 });
    
    render(
      <ResponsiveImage 
        sources={mockSources} 
        alt="Test image"
      />
    );
    
    const image = screen.getByAltText('Test image');
    expect(image).toHaveAttribute('src', '/images/test-sm.jpg');
  });

  test('renders with correct responsive source for desktop viewport', () => {
    // Mock the viewport hook to return desktop width
    useViewport.mockReturnValue({ width: 1200 });
    
    render(
      <ResponsiveImage 
        sources={mockSources} 
        alt="Test image"
      />
    );
    
    const image = screen.getByAltText('Test image');
    expect(image).toHaveAttribute('src', '/images/test-lg.jpg');
  });

  test('generates and applies correct srcSet when provided', () => {
    useViewport.mockReturnValue({ width: 1024 });
    
    render(
      <ResponsiveImage 
        sources={mockSources} 
        srcSetSources={mockSrcSetSources}
        sizes="(max-width: 768px) 100vw, 50vw"
        alt="Test image with srcSet"
      />
    );
    
    const image = screen.getByAltText('Test image with srcSet');
    expect(image).toHaveAttribute('srcSet');
    
    // Verify the srcSet format
    const srcSet = image.getAttribute('srcSet');
    expect(srcSet).toContain('/images/test-640.jpg 640w');
    expect(srcSet).toContain('/images/test-1920.jpg 1920w');
    
    // Verify sizes attribute
    expect(image).toHaveAttribute('sizes', '(max-width: 768px) 100vw, 50vw');
  });

  test('applies additional img props', () => {
    useViewport.mockReturnValue({ width: 1024 });
    
    render(
      <ResponsiveImage 
        sources={mockSources} 
        alt="Test image with props"
        imgProps={{
          style: { objectFit: 'cover' },
          title: 'Test title',
          'data-testid': 'test-img'
        }}
      />
    );
    
    const image = screen.getByAltText('Test image with props');
    expect(image).toHaveAttribute('title', 'Test title');
    expect(image).toHaveAttribute('data-testid', 'test-img');
    expect(image.style.objectFit).toBe('cover');
  });
});
