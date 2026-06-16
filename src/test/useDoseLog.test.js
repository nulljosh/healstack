import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useDoseLog } from '../hooks/useDoseLog';

beforeEach(() => localStorage.clear());

const valid = {
  substanceId: 'caffeine',
  dose: 200,
  unit: 'mg',
  route: 'oral',
};

describe('useDoseLog', () => {
  it('starts with empty entries', () => {
    const { result } = renderHook(() => useDoseLog());
    expect(result.current.entries).toEqual([]);
  });

  it('adds a valid entry', () => {
    const { result } = renderHook(() => useDoseLog());
    act(() => { result.current.addEntry(valid); });
    expect(result.current.entries).toHaveLength(1);
    expect(result.current.entries[0].substanceId).toBe('caffeine');
    expect(result.current.entries[0].dose).toBe(200);
    expect(result.current.entries[0].id).toBeTruthy();
  });

  it('assigns a unique id per entry', () => {
    const { result } = renderHook(() => useDoseLog());
    act(() => {
      result.current.addEntry(valid);
      result.current.addEntry({ ...valid, substanceId: 'sertraline' });
    });
    const ids = result.current.entries.map(e => e.id);
    expect(new Set(ids).size).toBe(2);
  });

  it('throws on missing substanceId', () => {
    const { result } = renderHook(() => useDoseLog());
    expect(() => {
      act(() => result.current.addEntry({ ...valid, substanceId: '' }));
    }).toThrow('Substance is required');
  });

  it('throws on zero dose', () => {
    const { result } = renderHook(() => useDoseLog());
    expect(() => {
      act(() => result.current.addEntry({ ...valid, dose: 0 }));
    }).toThrow('Dose must be a positive number');
  });

  it('throws on negative dose', () => {
    const { result } = renderHook(() => useDoseLog());
    expect(() => {
      act(() => result.current.addEntry({ ...valid, dose: -50 }));
    }).toThrow('Dose must be a positive number');
  });

  it('throws on NaN dose', () => {
    const { result } = renderHook(() => useDoseLog());
    expect(() => {
      act(() => result.current.addEntry({ ...valid, dose: 'abc' }));
    }).toThrow('Dose must be a positive number');
  });

  it('throws on missing route', () => {
    const { result } = renderHook(() => useDoseLog());
    expect(() => {
      act(() => result.current.addEntry({ ...valid, route: '' }));
    }).toThrow('Route of administration is required');
  });

  it('throws on invalid rating', () => {
    const { result } = renderHook(() => useDoseLog());
    expect(() => {
      act(() => result.current.addEntry({ ...valid, rating: 6 }));
    }).toThrow('Rating must be between 1 and 5');
  });

  it('accepts rating 0 (no rating)', () => {
    const { result } = renderHook(() => useDoseLog());
    act(() => result.current.addEntry({ ...valid, rating: 0 }));
    expect(result.current.entries[0].rating).toBe(null);
  });

  it('defaults timestamp to now', () => {
    const { result } = renderHook(() => useDoseLog());
    const before = Date.now();
    act(() => result.current.addEntry(valid));
    const after = Date.now();
    const ts = new Date(result.current.entries[0].timestamp).getTime();
    expect(ts).toBeGreaterThanOrEqual(before);
    expect(ts).toBeLessThanOrEqual(after);
  });

  it('deletes an entry by id', () => {
    const { result } = renderHook(() => useDoseLog());
    act(() => result.current.addEntry(valid));
    const id = result.current.entries[0].id;
    act(() => result.current.deleteEntry(id));
    expect(result.current.entries).toHaveLength(0);
  });

  it('throws on delete with missing id', () => {
    const { result } = renderHook(() => useDoseLog());
    expect(() => {
      act(() => result.current.deleteEntry(''));
    }).toThrow('Entry id is required');
  });

  it('filters by substanceId', () => {
    const { result } = renderHook(() => useDoseLog());
    act(() => {
      result.current.addEntry(valid);
      result.current.addEntry({ ...valid, substanceId: 'cannabis' });
    });
    const filtered = result.current.getEntries({ substanceId: 'caffeine' });
    expect(filtered).toHaveLength(1);
    expect(filtered[0].substanceId).toBe('caffeine');
  });

  it('filters by route', () => {
    const { result } = renderHook(() => useDoseLog());
    act(() => {
      result.current.addEntry(valid);
      result.current.addEntry({ ...valid, route: 'vaped' });
    });
    const filtered = result.current.getEntries({ route: 'oral' });
    expect(filtered).toHaveLength(1);
  });

  it('returns entries sorted newest first', () => {
    const { result } = renderHook(() => useDoseLog());
    act(() => {
      result.current.addEntry({ ...valid, timestamp: '2026-01-01T10:00' });
      result.current.addEntry({ ...valid, timestamp: '2026-01-02T10:00' });
    });
    const entries = result.current.getEntries();
    expect(new Date(entries[0].timestamp) > new Date(entries[1].timestamp)).toBe(true);
  });

  it('getActive returns only last 24h entries', () => {
    const { result } = renderHook(() => useDoseLog());
    const old = new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString();
    act(() => {
      result.current.addEntry({ ...valid, timestamp: old });
      result.current.addEntry(valid);
    });
    expect(result.current.getActive()).toHaveLength(1);
  });

  it('clearAll removes all entries', () => {
    const { result } = renderHook(() => useDoseLog());
    act(() => {
      result.current.addEntry(valid);
      result.current.addEntry(valid);
      result.current.clearAll();
    });
    expect(result.current.entries).toHaveLength(0);
    expect(localStorage.getItem('dose:log')).toBeNull();
  });

  it('persists to localStorage', () => {
    const { result } = renderHook(() => useDoseLog());
    act(() => result.current.addEntry(valid));
    const raw = localStorage.getItem('dose:log');
    expect(raw).toBeTruthy();
    const parsed = JSON.parse(raw);
    expect(parsed[0].substanceId).toBe('caffeine');
  });

  it('loads persisted entries on mount', () => {
    // Pre-populate localStorage
    const entry = { id: 'test-1', substanceId: 'cannabis', dose: 10, unit: 'mg', route: 'smoked', timestamp: new Date().toISOString(), notes: '', rating: null };
    localStorage.setItem('dose:log', JSON.stringify([entry]));
    const { result } = renderHook(() => useDoseLog());
    expect(result.current.entries).toHaveLength(1);
    expect(result.current.entries[0].id).toBe('test-1');
  });

  it('handles corrupted localStorage gracefully', () => {
    localStorage.setItem('dose:log', 'not-json{{{');
    const { result } = renderHook(() => useDoseLog());
    expect(result.current.entries).toEqual([]);
  });

  it('handles localStorage returning non-array gracefully', () => {
    localStorage.setItem('dose:log', JSON.stringify({ corrupted: true }));
    const { result } = renderHook(() => useDoseLog());
    expect(result.current.entries).toEqual([]);
  });
});
