import React from 'react';

export function useResizeObserver<T extends HTMLDivElement>(
  onResize: () => void
) {
  const ref = React.useRef<T>(null);

  React.useEffect(() => {
    if (!ref.current) return;

    const observer = new ResizeObserver(() => {
      onResize();
    });

    observer.observe(ref.current);

    return () => {
      observer.disconnect();
    };
  }, [onResize]);

  return { ref };
}
