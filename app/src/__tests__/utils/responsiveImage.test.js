import { getResponsiveImage, createSrcSet } from '../../utils/responsiveImage';

describe('getResponsiveImage', () => {
  // Mock image sources for different screen sizes
  const mockSources = {
    xs: '/images/sprout-xs.jpg',
    sm: '/images/sprout-mobile.jpg',
    lg: '/images/sprout.jpg',
    xl: '/images/sprout-original.jpg'
  };

  // Test cases with different viewport widths
  test('should return xs image for extra small screens', () => {
    expect(getResponsiveImage(mockSources, 320)).toBe('/images/sprout-xs.jpg');
    expect(getResponsiveImage(mockSources, 639)).toBe('/images/sprout-xs.jpg');
  });

  test('should return sm image for small screens', () => {
    expect(getResponsiveImage(mockSources, 640)).toBe('/images/sprout-mobile.jpg');
    expect(getResponsiveImage(mockSources, 767)).toBe('/images/sprout-mobile.jpg');
  });

  test('should return lg image for large screens since md is not provided', () => {
    expect(getResponsiveImage(mockSources, 768)).toBe('/images/sprout.jpg');
    expect(getResponsiveImage(mockSources, 1023)).toBe('/images/sprout.jpg');
  });

  test('should return lg image for large screens', () => {
    expect(getResponsiveImage(mockSources, 1024)).toBe('/images/sprout.jpg');
    expect(getResponsiveImage(mockSources, 1279)).toBe('/images/sprout.jpg');
  });

  test('should return xl image for extra large screens', () => {
    expect(getResponsiveImage(mockSources, 1280)).toBe('/images/sprout-original.jpg');
    expect(getResponsiveImage(mockSources, 1920)).toBe('/images/sprout-original.jpg');
  });

  test('should handle missing breakpoints by returning nearest smaller size', () => {
    const partialSources = {
      xs: '/images/sprout-xs.jpg',
      lg: '/images/sprout.jpg'
    };
    
    // Without sm, should fall back to xs
    expect(getResponsiveImage(partialSources, 700)).toBe('/images/sprout-xs.jpg');
    
    // Without xl, should use lg for very large screens
    expect(getResponsiveImage(partialSources, 1500)).toBe('/images/sprout.jpg');
  });
});

describe('createSrcSet', () => {
  test('should create a proper srcSet string from sources object', () => {
    const sources = {
      640: '/images/sprout-xs.jpg',
      1024: '/images/sprout-mobile.jpg',
      1920: '/images/sprout.jpg'
    };
    
    const expected = '/images/sprout-xs.jpg 640w, /images/sprout-mobile.jpg 1024w, /images/sprout.jpg 1920w';
    expect(createSrcSet(sources)).toBe(expected);
  });

  test('should return empty string for empty sources', () => {
    expect(createSrcSet({})).toBe('');
  });
});
