import { beforeEach, describe, expect, it } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import { usePersistentState } from './usePersistentState';

const asString = (raw: unknown) => (typeof raw === 'string' ? raw : undefined);

describe('usePersistentState', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('저장된 값이 없으면 초기값을 사용한다', () => {
    const { result } = renderHook(() => usePersistentState('k', 'init', asString));
    expect(result.current[0]).toBe('init');
  });

  it('저장된 값이 있으면 마운트 시 복원한다', () => {
    localStorage.setItem('k', JSON.stringify('saved'));
    const { result } = renderHook(() => usePersistentState('k', 'init', asString));
    expect(result.current[0]).toBe('saved');
  });

  it('상태가 바뀌면 localStorage에 저장한다', () => {
    const { result } = renderHook(() => usePersistentState('k', 'init', asString));
    act(() => result.current[1]('next'));
    expect(localStorage.getItem('k')).toBe('"next"');
  });
});
