// localStorage 접근은 비공개 모드·용량 초과 등으로 throw할 수 있으므로 모두 삼킨다.
export function readStorage<T>(
  key: string,
  parse: (raw: unknown) => T | undefined,
  fallback: T,
): T {
  try {
    const stored = localStorage.getItem(key);
    if (stored === null) return fallback;
    return parse(JSON.parse(stored)) ?? fallback;
  } catch {
    return fallback;
  }
}

export function writeStorage(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // 저장 실패는 무시한다. 상태 자체는 메모리에 유지된다.
  }
}
