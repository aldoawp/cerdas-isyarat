import React from 'react';

const FunBookIcon: React.FC<React.SVGProps<SVGSVGElement>> = (
  props: React.SVGProps<SVGSVGElement>
) => (
  <svg
    viewBox="0 0 64 64"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path
      d="M54 10V52C54 55.3137 51.3137 58 48 58H11C7.68629 58 5 55.3137 5 52V10C5 6.68629 7.68629 4 11 4H48C51.3137 4 54 6.68629 54 10Z"
      fill="#67E8F9"
      stroke="white"
      strokeWidth="6"
    />
    <path
      d="M32 58V4"
      stroke="white"
      strokeWidth="6"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M22 23C22 20 24 18 26.5 18C29 18 31.5 21 32 23C32.5 21 35 18 37.5 18C40 18 42 20 42 23C42 28 32 36 32 36C32 36 22 28 22 23Z"
      fill="#F472B6"
    />
  </svg>
);

export default FunBookIcon;
