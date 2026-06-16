import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useSubstances } from '../hooks/useSubstances';
import { SUBSTANCES } from '../data/substances';

beforeEach(() => localStorage.clear());

describe('useSubstances', () => {
  it('returns all built-in substances', () => {
    const { result } = renderHook(() => useSubstances());
    expect(result.current.builtIn).toHaveLength(SUBSTANCES.length);
  });

  it('has pre-seeded substances', () => {
    expect(SUBSTANCES.length).toBeGreaterThanOrEqual(20);
  });

  it('getById returns correct substance', () => {
    const { result } = renderHook(() => useSubstances());
    const sub = result.current.getById('caffeine');
    expect(sub).toBeTruthy();
    expect(sub.name).toBe('Caffeine');
  });

  it('getById returns null for unknown id', () => {
    const { result } = renderHook(() => useSubstances());
    expect(result.current.getById('nonexistent')).toBeNull();
  });

  it('search finds by name (case-insensitive)', () => {
    const { result } = renderHook(() => useSubstances());
    const results = result.current.search('caffeine');
    expect(results.some(s => s.id === 'caffeine')).toBe(true);
  });

  it('search finds by category', () => {
    const { result } = renderHook(() => useSubstances());
    const results = result.current.search('psychedelic');
    expect(results.every(s => s.category === 'psychedelic')).toBe(true);
    expect(results.length).toBeGreaterThan(0);
  });

  it('search with empty query returns all', () => {
    const { result } = renderHook(() => useSubstances());
    expect(result.current.search('')).toHaveLength(result.current.substances.length);
  });

  it('adds a custom substance', () => {
    const { result } = renderHook(() => useSubstances());
    act(() => {
      result.current.addCustom({ id: 'my-herb', name: 'My Herb', category: 'supplement', effects: [] });
    });
    expect(result.current.getById('my-herb')).toBeTruthy();
    expect(result.current.custom).toHaveLength(1);
  });

  it('throws when adding custom without id', () => {
    const { result } = renderHook(() => useSubstances());
    expect(() => {
      act(() => result.current.addCustom({ name: 'Test' }));
    }).toThrow('requires id and name');
  });

  it('throws when adding duplicate id', () => {
    const { result } = renderHook(() => useSubstances());
    expect(() => {
      act(() => result.current.addCustom({ id: 'caffeine', name: 'Duplicate' }));
    }).toThrow('already exists');
  });

  it('removes a custom substance', () => {
    const { result } = renderHook(() => useSubstances());
    act(() => {
      result.current.addCustom({ id: 'temp', name: 'Temp', category: 'supplement', effects: [] });
      result.current.removeCustom('temp');
    });
    expect(result.current.getById('temp')).toBeNull();
  });

  it('all substances have required fields', () => {
    SUBSTANCES.forEach(s => {
      expect(s.id, `${s.name} missing id`).toBeTruthy();
      expect(s.name, `${s.id} missing name`).toBeTruthy();
      expect(s.category, `${s.id} missing category`).toBeTruthy();
      expect(Array.isArray(s.effects), `${s.id} effects not array`).toBe(true);
      expect(Array.isArray(s.harmReduction), `${s.id} harmReduction not array`).toBe(true);
    });
  });

  it('persists custom substances across remounts', () => {
    const { result, rerender } = renderHook(() => useSubstances());
    act(() => {
      result.current.addCustom({ id: 'persist-test', name: 'Persist', category: 'supplement', effects: [] });
    });
    rerender();
    expect(result.current.getById('persist-test')).toBeTruthy();
  });
});
