import React from 'react';

const FunSearchIcon: React.FC<React.SVGProps<SVGSVGElement>> = (
  props: React.SVGProps<SVGSVGElement>
) => (
  <svg
    viewBox="0 0 64 64"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <circle cx="30" cy="26" r="18" stroke="white" strokeWidth="8" />
    <line
      x1="44.3431"
      y1="40"
      x2="58"
      y2="53.6569"
      stroke="white"
      strokeWidth="8"
      strokeLinecap="round"
    />
  </svg>
);

export default FunSearchIcon;
