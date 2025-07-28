import { describe, it, expect, vi } from 'vitest';
import { getPendingTimeOffRequests } from './schedule-actions';

describe('Simple Test', () => {
  it('should be a function', () => {
    expect(typeof getPendingTimeOffRequests).toBe('function');
  });
});
