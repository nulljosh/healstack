import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, waitFor } from '@testing-library/react';
import { WebMCP } from '../lib/webmcp';

describe('WebMCP', () => {
  let tools;
  beforeEach(() => {
    localStorage.clear();
    tools = new Map();
    document.modelContext = {
      registerTool: vi.fn(async (t) => { tools.set(t.name, t); return { unregister: () => tools.delete(t.name) }; }),
    };
  });

  it('registers the tool set', async () => {
    render(<WebMCP />);
    await waitFor(() => expect(tools.has('log_dose')).toBe(true));
    expect(tools.has('search_substances')).toBe(true);
    expect(tools.get('get_dose_log').requiresConfirmation).toBeUndefined();
  });

  it('gates only destructive tools behind confirmation', async () => {
    render(<WebMCP />);
    await waitFor(() => expect(tools.has('clear_dose_log')).toBe(true));
    const gated = [...tools.values()].filter(t => t.requiresConfirmation).map(t => t.name).sort();
    expect(gated).toEqual(['clear_dose_log', 'delete_lab_result']);
  });

  it('logs a dose through the real hook and reads it back', async () => {
    render(<WebMCP />);
    await waitFor(() => expect(tools.has('log_dose')).toBe(true));
    const entry = await tools.get('log_dose').execute({ substanceId: 'creatine', dose: 5, unit: 'g', route: 'oral' });
    expect(entry.id).toBeTruthy();
    // Reads see the write once the component re-renders; agents call tools in
    // separate round-trips, so only a synchronous test needs the wait.
    await waitFor(async () => {
      const { entries } = await tools.get('get_dose_log').execute({});
      expect(entries.map(e => e.substanceId)).toContain('creatine');
    });
  });

  it('no-ops in a browser without WebMCP', () => {
    delete document.modelContext;
    expect(() => render(<WebMCP />)).not.toThrow();
  });
});
