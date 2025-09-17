import { useEffect, useRef } from 'react';

const usePrevious = <T,>(value: T) => {
  const ref = useRef<Nullable<T>>(null);

  useEffect(() => {
    ref.current = value;
  }, [value]);

  return ref.current;
};

export default usePrevious;
