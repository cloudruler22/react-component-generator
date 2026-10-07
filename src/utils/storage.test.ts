import { beforeEach, describe, expect, it, vi } from 'vitest';
import { readStorage, writeStorage } from './storage';

const asString = (raw: unknown) => (typeof raw === 'string' ? raw : undefined);

describe('readStorage', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('저장된 값이 있으면 파싱해서 반환한다', () => {
    localStorage.setItem('k', JSON.stringify('hello'));
    expect(readStorage('k', asString, 'x')).toBe('hello');
  });

  it('값이 없으면 fallback을 반환한다', () => {
    expect(readStorage('k', asString, 'x')).toBe('x');
  });

  it('JSON이 깨져 있으면 fallback을 반환한다', () => {
    localStorage.setItem('k', '{broken');
    expect(readStorage('k', asString, 'x')).toBe('x');
  });

  it('parse가 undefined를 반환하면 fallback을 반환한다', () => {
    localStorage.setItem('k', JSON.stringify(123));
    expect(readStorage('k', asString, 'x')).toBe('x');
  });

  it('localStorage 접근이 throw해도 fallback을 반환한다', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('denied');
    });
    expect(readStorage('k', asString, 'x')).toBe('x');
    vi.restoreAllMocks();
  });
});

describe('writeStorage', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('값을 JSON으로 저장한다', () => {
    writeStorage('k', { a: 1 });
    expect(localStorage.getItem('k')).toBe('{"a":1}');
  });

  it('저장 공간이 가득 차 throw해도 예외를 전파하지 않는다', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('quota');
    });
    expect(() => writeStorage('k', 'v')).not.toThrow();
    vi.restoreAllMocks();
  });
});
