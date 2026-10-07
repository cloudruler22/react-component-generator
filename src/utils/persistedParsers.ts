import type { GeneratedComponent, Provider } from '../types';

const PROVIDERS: readonly Provider[] = ['anthropic', 'google'];

export function parseProvider(raw: unknown): Provider | undefined {
  return PROVIDERS.find((p) => p === raw);
}

export function parseStringArray(raw: unknown): string[] | undefined {
  return Array.isArray(raw) && raw.every((v) => typeof v === 'string') ? raw : undefined;
}

export function parseComponents(raw: unknown): GeneratedComponent[] | undefined {
  if (!Array.isArray(raw)) return undefined;
  const result: GeneratedComponent[] = [];
  for (const item of raw) {
    if (
      typeof item !== 'object' || item === null ||
      typeof item.id !== 'string' ||
      typeof item.prompt !== 'string' ||
      typeof item.code !== 'string' ||
      typeof item.createdAt !== 'string'
    ) {
      return undefined;
    }
    const createdAt = new Date(item.createdAt);
    if (Number.isNaN(createdAt.getTime())) return undefined;
    result.push({ id: item.id, prompt: item.prompt, code: item.code, createdAt });
  }
  return result;
}
