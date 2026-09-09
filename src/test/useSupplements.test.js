import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useSupplements, adherence, dayKey } from '../hooks/useSupplements';

beforeEach(() => localStorage.clear());

describe('useSupplements', () => {
  it('adds, toggles, persists, removes', () => {
    const { result } = renderHook(() => useSupplements());
    act(() => result.current.add('magnesium'));
    act(() => result.current.add('magnesium'));
    expect(result.current.stack).toEqual(['magnesium']);
    act(() => result.current.toggle('magnesium'));
    expect(result.current.isTaken('magnesium')).toBe(true);
    expect(result.current.takenToday).toBe(1);
    expect(JSON.parse(localStorage.getItem('dose:supplements')).stack).toEqual(['magnesium']);
    act(() => result.current.remove('magnesium'));
    expect(result.current.stack).toEqual([]);
    expect(result.current.takenToday).toBe(0);
  });

  it('adherence counts taken days over the window', () => {
    const now = new Date();
    const yesterday = new Date(now); yesterday.setDate(now.getDate() - 1);
    const taken = { [dayKey(now)]: { a: true, b: true }, [dayKey(yesterday)]: { a: true } };
    expect(adherence(['a', 'b'], taken, 7, now)).toBe(Math.round((3 / 14) * 100));
    expect(adherence([], taken)).toBe(0);
  });
});
