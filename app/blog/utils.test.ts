import { describe, expect, it } from 'vitest';
import { formatDate } from './utils';

describe('formatDate', () => {
  it('formats a date-only string as a full date', () => {
    expect(formatDate('2024-04-08')).toBe('April 8, 2024');
  });

  it('includes a relative suffix when requested', () => {
    const result = formatDate('2024-04-08', true);
    expect(result).toContain('April 8, 2024');
    expect(result).toMatch(/\(\d+(y|mo|d) ago|\(Today\)/);
  });
});
