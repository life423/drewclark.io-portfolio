import React, { useMemo } from 'react'
import PropTypes from 'prop-types'
import useViewport from '../../../hooks/useViewport'
import { getResponsiveImage, createSrcSet } from '../../../utils/responsiveImage'

/**
 * ResponsiveImage component that loads appropriate image based on viewport size
 * 
 * @param {Object} props - Component props
 * @param {Object} props.sources - Image sources for different breakpoints (xs, sm, md, lg, xl)
 * @param {Object} props.srcSetSources - Optional srcSet sources with width as keys
 * @param {string} props.alt - Alt text for the image
 * @param {string} [props.sizes="100vw"] - Sizes attribute for the image
 * @param {string} [props.className=""] - Additional classes for the image
 * @param {Object} [props.imgProps={}] - Additional props to pass to the img element
 */
const ResponsiveImage = ({
  sources,
  srcSetSources,
  alt,
  sizes = "100vw",
  className = "",
  imgProps = {},
}) => {
  const { width } = useViewport();
  
  // Get appropriate image based on screen size
  const src = useMemo(() => 
    getResponsiveImage(sources, width)
  , [sources, width]);
  
  // Generate srcSet if srcSetSources is provided
  const srcSet = useMemo(() => 
    srcSetSources ? createSrcSet(srcSetSources) : undefined
  , [srcSetSources]);
  
  return (
    <img 
      src={src}
      srcSet={srcSet}
      sizes={sizes}
      alt={alt}
      className={className}
      loading="lazy"
      {...imgProps}
    />
  );
};

ResponsiveImage.propTypes = {
  sources: PropTypes.shape({
    xs: PropTypes.string.isRequired,
    sm: PropTypes.string,
    md: PropTypes.string,
    lg: PropTypes.string,
    xl: PropTypes.string,
  }).isRequired,
  srcSetSources: PropTypes.objectOf(PropTypes.string),
  alt: PropTypes.string.isRequired,
  sizes: PropTypes.string,
  className: PropTypes.string,
  imgProps: PropTypes.object,
};

export default ResponsiveImage;
