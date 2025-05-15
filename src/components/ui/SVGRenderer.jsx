import React from 'react';
import './SVGAnimations.css'; // For animation styles

const SVGRenderer = ({
  svgString,
  className = '',
  style = {},
  width,
  height,
  onClick,
  isAnimating = false,
  animationType = 'pulse',
  ...rest
}) => {
  if (!svgString) return null;

  // Convert SVG string to base64
  const encoded = `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(svgString)))}`;

  // Compose animation class if active
  const animationClass = isAnimating ? `svg-animation-${animationType}` : '';

  return (
    <img
      src={encoded}
      alt="svg"
      className={`${className} ${animationClass}`}
      style={{ display: 'inline-block', ...style }}
      width={width}
      height={height}
      onClick={onClick}
      {...rest}
    />
  );
};

export default SVGRenderer;
