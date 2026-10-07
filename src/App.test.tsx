import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from './App';

describe('App 영속화', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        json: async () => ({ envKeys: { anthropic: false, google: false } }),
      }),
    );
  });

  it('입력한 API 키는 localStorage에 저장하지 않는다', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.type(screen.getByLabelText('API 키'), 'secret-key-123');

    const stored = Object.keys(localStorage).map((k) => localStorage.getItem(k));
    expect(stored.join('')).not.toContain('secret-key-123');
  });

  it('선택한 Provider는 localStorage에 저장한다', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.selectOptions(screen.getByLabelText('AI 서비스'), 'anthropic');

    expect(localStorage.getItem('rcg:provider')).toBe('"anthropic"');
  });
});
