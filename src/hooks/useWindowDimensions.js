import React, { useEffect } from 'react';

export function useWindowDimensions() {
  const [width, setWidth] = React.useState(window.innerWidth);

  useEffect(() => {
    const listener = () => {
      setWidth(window.innerWidth);
    };
    window.addEventListener('resize', listener);
    return () => window.removeEventListener('resize', listener);
  });
  // return { width };
  return width;
}
