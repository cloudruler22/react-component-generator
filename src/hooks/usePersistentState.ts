import { useEffect, useState } from 'react';
import { readStorage, writeStorage } from '../utils/storage';

export function usePersistentState<T>(
  key: string,
  fallback: T,
  parse: (raw: unknown) => T | undefined,
) {
  const [value, setValue] = useState<T>(() => readStorage(key, parse, fallback));

  useEffect(() => {
    writeStorage(key, value);
  }, [key, value]);

  return [value, setValue] as const;
}
