import React from 'react';

interface LogoProps {
  size?: number;
  className?: string;
}

export const Logo: React.FC<LogoProps> = ({ size = 48, className = '' }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Paw pad */}
      <ellipse cx="50" cy="65" rx="20" ry="16" fill="#FF6B35" />

      {/* Toe pads */}
      <circle cx="32" cy="45" r="8" fill="#FF6B35" />
      <circle cx="50" cy="40" r="8" fill="#FF6B35" />
      <circle cx="68" cy="45" r="8" fill="#FF6B35" />

      {/* Dog face silhouette (left) */}
      <path
        d="M28 48 C28 48, 24 52, 22 58 C20 64, 22 68, 26 68 C30 68, 32 64, 32 60"
        fill="#F7C548"
        opacity="0.8"
      />

      {/* Cat face silhouette (right) */}
      <path
        d="M72 48 C72 48, 76 52, 78 58 C80 64, 78 68, 74 68 C70 68, 68 64, 68 60"
        fill="#E59500"
        opacity="0.8"
      />

      {/* Small heart accent */}
      <path
        d="M50 35 C50 35, 47 32, 45 32 C43 32, 42 34, 42 36 C42 37, 43 38, 45 40 L50 44 L55 40 C57 38, 58 37, 58 36 C58 34, 57 32, 55 32 C53 32, 50 35, 50 35 Z"
        fill="#F7C548"
        opacity="0.6"
      />
    </svg>
  );
};
