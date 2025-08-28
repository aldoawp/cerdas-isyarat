import React from 'react';

const FunGamepadIcon: React.FC<React.SVGProps<SVGSVGElement>> = (
  props: React.SVGProps<SVGSVGElement>
) => (
  <svg
    viewBox="0 0 64 64"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path
      d="M51 22C57.0751 22 62 26.9249 62 33V43C62 49.0751 57.0751 54 51 54H13C6.92487 54 2 49.0751 2 43V33C2 26.9249 6.92487 22 13 22H51Z"
      fill="#A78BFA"
      stroke="white"
      strokeWidth="6"
    />
    <path
      d="M16 32V44"
      stroke="white"
      strokeWidth="6"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M22 38H10"
      stroke="white"
      strokeWidth="6"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M42 42C44.2091 42 46 40.2091 46 38C46 35.7909 44.2091 34 42 34C39.7909 34 38 35.7909 38 38C38 40.2091 39.7909 42 42 42Z"
      fill="white"
    />
    <path
      d="M52 36C54.2091 36 56 34.2091 56 32C56 29.7909 54.2091 28 52 28C49.7909 28 48 29.7909 48 32C48 34.2091 49.7909 36 52 36Z"
      fill="white"
    />
    <path
      d="M13 22L21 10"
      stroke="white"
      strokeWidth="6"
      strokeLinecap="round"
    />
    <path
      d="M51 22L43 10"
      stroke="white"
      strokeWidth="6"
      strokeLinecap="round"
    />
  </svg>
);

export default FunGamepadIcon;
