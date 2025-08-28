import React from 'react';

const CameraIcon: React.FC<React.SVGProps<SVGSVGElement>> = props => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    {...props}
  >
    <path d="M12 9a3.75 3.75 0 100 7.5A3.75 3.75 0 0012 9z" />
    <path
      fillRule="evenodd"
      d="M9.344 3.071a49.52 49.52 0 015.312 0c.967.052 1.83.585 2.342 1.374a3.026 3.026 0 01.64 2.288V17.5a3.026 3.026 0 01-.64 2.288c-.512.79-1.375 1.322-2.342 1.374a49.52 49.52 0 01-5.312 0c-.967-.052-1.83-.585-2.342-1.374a3.026 3.026 0 01-.64-2.288V6.733a3.026 3.026 0 01.64-2.288c.512-.79 1.375 1.322 2.342 1.374zM12 18a6 6 0 100-12 6 6 0 000 12z"
      clipRule="evenodd"
    />
  </svg>
);

export default CameraIcon;
