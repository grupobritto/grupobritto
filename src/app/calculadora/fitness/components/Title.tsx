import React from 'react';

type TitleProps = {
  children: React.ReactNode;
  className?: string;
};

export default function Title({ children, className = '' }: TitleProps) {
  return (
    <h1
      className={`bg-gradient-to-r from-green-600 via-yellow-300 to-blue-700 bg-clip-text text-center text-4xl font-extrabold text-transparent uppercase ${className}`}
    >
      {children}
    </h1>
  );
}
