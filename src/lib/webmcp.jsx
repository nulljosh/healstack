// WebMCP tool registration. Exposes healstack's core actions to in-browser
// agents (Claude in Chrome et al) via document.modelContext.
//
// ponytail: every tool delegates to an existing hook callback. Mount <WebMCP />
// once inside the signed-in shell; it owns its own hook instances.
//
// ponytail: the hooks are localStorage-backed with per-instance state, so a
// write made through a tool lands on disk immediately but other mounted views
// only pick it up on their next mount. Add a storage-event subscription to the
// hooks if live cross-view refresh starts mattering.
import { useEffect, useRef } from 'react';
import { useDoseLog } from '../hooks/useDoseLog';
import { useSubstances } from '../hooks/useSubstances';
import { useBiometrics } from '../hooks/useBiometrics';
import { useLabResults } from '../hooks/useLabResults';
import { useRoutine } from '../hooks/useRoutine';

const ISO_DATE = { type: 'string', description: 'Date as YYYY-MM-DD (defaults to today)' };

function buildTools(get) {
  return [
    // ---- read-only -------------------------------------------------------
    {
      name: 'search_substances',
      description: 'Search the substance library by name. Returns built-in and user-added substances.',
      inputSchema: {
        type: 'object',
        properties: { query: { type: 'string', description: 'Name or partial name' } },
        required: ['query'],
      },
      execute: async ({ query }) => ({ substances: get().substances.search(query) }),
    },
    {
      name: 'get_substance',
      description: 'Get the full record for one substance, including dosing and interaction notes.',
      inputSchema: {
        type: 'object',
        properties: { id: { type: 'string', description: 'Substance id from search_substances' } },
        required: ['id'],
      },
      execute: async ({ id }) => get().substances.getById(id) ?? { error: `Unknown substance "${id}"` },
    },
    {
      name: 'get_dose_log',
      description: 'List logged doses, newest first, optionally filtered.',
      inputSchema: {
        type: 'object',
        properties: {
          substanceId: { type: 'string', description: 'Only doses of this substance' },
          route: { type: 'string', description: 'Only this route of administration' },
          since: { type: 'string', description: 'ISO timestamp lower bound' },
          until: { type: 'string', description: 'ISO timestamp upper bound' },
        },
      },
      execute: async (filters = {}) => ({ entries: get().doseLog.getEntries(filters) }),
    },
    {
      name: 'get_active_doses',
      description: 'List doses logged in the last 24 hours — what is likely still active.',
      inputSchema: { type: 'object', properties: {} },
      execute: async () => ({ entries: get().doseLog.getActive() }),
    },
    {
      name: 'get_biometrics',
      description: 'List logged biometric entries (weight, sleep, HRV and other tracked metrics).',
      inputSchema: { type: 'object', properties: {} },
      execute: async () => ({ entries: get().biometrics.entries, targets: get().biometrics.getTargets() }),
    },
    {
      name: 'get_lab_results',
      description: 'List saved lab panels with their markers and out-of-range flags.',
      inputSchema: { type: 'object', properties: {} },
      execute: async () => ({ results: get().labs.results }),
    },
    {
      name: 'get_marker_history',
      description: 'Get one lab marker over time across every saved panel.',
      inputSchema: {
        type: 'object',
        properties: { marker: { type: 'string', description: 'Marker name, e.g. Ferritin. Omit to list available names.' } },
      },
      execute: async ({ marker } = {}) =>
        marker ? { marker, history: get().labs.getByMarker(marker) }
               : { markers: get().labs.allMarkerNames() },
    },
    {
      name: 'get_routine_status',
      description: "Get today's routine completion count and the current streak.",
      inputSchema: { type: 'object', properties: {} },
      execute: async () => {
        const r = get().routine;
        return { date: r.todayKey, completedToday: r.completedToday, streak: r.streak };
      },
    },

    // ---- reversible state changes ----------------------------------------
    {
      name: 'log_dose',
      description: 'Log a dose taken. Reversible with delete_dose.',
      inputSchema: {
        type: 'object',
        properties: {
          substanceId: { type: 'string', description: 'Substance id from search_substances' },
          dose: { type: 'number', description: 'Amount taken' },
          unit: { type: 'string', description: 'Dose unit (default mg)' },
          route: { type: 'string', description: 'Route of administration, e.g. oral' },
          timestamp: { type: 'string', description: 'ISO time taken (defaults to now)' },
          notes: { type: 'string', description: 'Free-text notes' },
          rating: { type: 'number', description: 'Subjective rating 1-5' },
        },
        required: ['substanceId', 'dose', 'route'],
      },
      execute: async (args) => get().doseLog.addEntry(args),
    },
    {
      name: 'update_dose',
      description: 'Change fields on an already-logged dose.',
      inputSchema: {
        type: 'object',
        properties: {
          id: { type: 'string', description: 'Entry id from get_dose_log' },
          updates: { type: 'object', description: 'Fields to change (dose, unit, route, timestamp, notes, rating)' },
        },
        required: ['id', 'updates'],
      },
      execute: async ({ id, updates }) => { get().doseLog.updateEntry(id, updates); return { updated: id }; },
    },
    {
      name: 'delete_dose',
      description: 'Delete one logged dose by id.',
      inputSchema: {
        type: 'object',
        properties: { id: { type: 'string', description: 'Entry id from get_dose_log' } },
        required: ['id'],
      },
      execute: async ({ id }) => { get().doseLog.deleteEntry(id); return { deleted: id }; },
    },
    {
      name: 'log_biometrics',
      description: 'Save a biometric entry for a day.',
      inputSchema: {
        type: 'object',
        properties: {
          date: ISO_DATE,
          metrics: { type: 'object', description: 'Metric name to numeric value, e.g. {"weight": 78.4}' },
          notes: { type: 'string', description: 'Free-text notes' },
        },
        required: ['metrics'],
      },
      execute: async (args) => get().biometrics.addEntry(args),
    },
    {
      name: 'log_lab_result',
      description: 'Save a lab panel. Out-of-range flags are computed from the reference ranges given.',
      inputSchema: {
        type: 'object',
        properties: {
          date: ISO_DATE,
          lab: { type: 'string', description: 'Lab name' },
          panel: { type: 'string', description: 'Panel name' },
          markers: {
            type: 'array',
            description: 'Markers on the panel',
            items: {
              type: 'object',
              properties: {
                name: { type: 'string' },
                value: { type: 'number' },
                unit: { type: 'string' },
                refLow: { type: 'number' },
                refHigh: { type: 'number' },
              },
              required: ['name', 'value'],
            },
          },
        },
        required: ['markers'],
      },
      execute: async (args) => get().labs.addResult(args),
    },
    {
      name: 'toggle_routine_item',
      description: "Check or uncheck one item on today's routine.",
      inputSchema: {
        type: 'object',
        properties: { id: { type: 'string', description: 'Routine item id' } },
        required: ['id'],
      },
      execute: async ({ id }) => { get().routine.toggle(id); return { toggled: id, checked: !get().routine.isChecked(id) }; },
    },

    // ---- consequential ----------------------------------------------------
    {
      name: 'delete_lab_result',
      description: 'Permanently delete a saved lab panel and all of its markers.',
      requiresConfirmation: true,
      inputSchema: {
        type: 'object',
        properties: { id: { type: 'string', description: 'Result id from get_lab_results' } },
        required: ['id'],
      },
      execute: async ({ id }) => { get().labs.deleteResult(id); return { deleted: id }; },
    },
    {
      name: 'clear_dose_log',
      description: 'Permanently delete the entire dose history. Cannot be undone.',
      requiresConfirmation: true,
      inputSchema: { type: 'object', properties: {} },
      execute: async () => { get().doseLog.clearAll(); return { cleared: true }; },
    },
  ];
}

export function WebMCP() {
  const ctx = {
    doseLog: useDoseLog(),
    substances: useSubstances(),
    biometrics: useBiometrics(),
    labs: useLabResults(),
    routine: useRoutine(),
  };
  const ref = useRef(ctx);
  ref.current = ctx;

  useEffect(() => {
    const mc = document.modelContext;
    if (!mc?.registerTool) return; // browser without WebMCP support
    let cancelled = false;
    const registered = [];

    (async () => {
      for (const tool of buildTools(() => ref.current)) {
        if (cancelled) return;
        try {
          registered.push(await mc.registerTool(tool));
        } catch (err) {
          console.warn('[webmcp] failed to register', tool.name, err?.message);
        }
      }
    })();

    return () => {
      cancelled = true;
      for (const h of registered) { try { h?.unregister?.(); } catch { /* gone already */ } }
    };
  }, []);

  return null;
}
