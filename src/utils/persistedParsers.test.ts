import { describe, expect, it } from 'vitest';
import {
  parseComponents,
  parseProvider,
  parseString,
  parseStringArray,
} from './persistedParsers';

describe('parseString', () => {
  it('문자열은 그대로 반환한다', () => {
    expect(parseString('abc')).toBe('abc');
  });

  it('문자열이 아니면 undefined를 반환한다', () => {
    expect(parseString(1)).toBeUndefined();
  });
});

describe('parseProvider', () => {
  it('허용된 프로바이더는 그대로 반환한다', () => {
    expect(parseProvider('anthropic')).toBe('anthropic');
    expect(parseProvider('google')).toBe('google');
  });

  it('알 수 없는 값이면 undefined를 반환한다', () => {
    expect(parseProvider('openai')).toBeUndefined();
  });
});

describe('parseStringArray', () => {
  it('문자열 배열은 그대로 반환한다', () => {
    expect(parseStringArray(['a', 'b'])).toEqual(['a', 'b']);
  });

  it('배열이 아니거나 문자열 외 요소가 섞이면 undefined를 반환한다', () => {
    expect(parseStringArray('a')).toBeUndefined();
    expect(parseStringArray(['a', 1])).toBeUndefined();
  });
});

describe('parseComponents', () => {
  const stored = { id: '1', prompt: 'p', code: 'c', createdAt: '2026-01-02T03:04:05.000Z' };

  it('createdAt 문자열을 Date로 복원한다', () => {
    const [result] = parseComponents([stored])!;
    expect(result.createdAt).toBeInstanceOf(Date);
    expect(result.createdAt.toISOString()).toBe(stored.createdAt);
  });

  it('필드가 빠진 항목이 있으면 undefined를 반환한다', () => {
    expect(parseComponents([{ id: '1' }])).toBeUndefined();
  });

  it('날짜가 올바르지 않으면 undefined를 반환한다', () => {
    expect(parseComponents([{ ...stored, createdAt: 'nope' }])).toBeUndefined();
  });

  it('배열이 아니면 undefined를 반환한다', () => {
    expect(parseComponents({})).toBeUndefined();
  });
});
