import { useState, useCallback, useRef } from 'react';

const TOKEN_KEY = 'dose:sync_token';
const SYNC_URL = '/api/sync';

function getToken() {
  return localStorage.getItem(TOKEN_KEY) || '';
}

export function useSync() {
  const [syncing, setSyncing] = useState(false);
  const [lastSync, setLastSync] = useState(null);
  const [error, setError] = useState(null);
  const debounceRef = useRef(null);

  const setToken = useCallback((token) => {
    localStorage.setItem(TOKEN_KEY, token);
  }, []);

  const push = useCallback(async () => {
    const token = getToken();
    if (!token) return;

    setSyncing(true);
    setError(null);

    try {
      const payload = {
        log: JSON.parse(localStorage.getItem('dose:log') || '[]'),
        substances: JSON.parse(localStorage.getItem('dose:custom_substances') || '[]'),
        biometrics: JSON.parse(localStorage.getItem('dose:biometrics') || '[]'),
        profile: JSON.parse(localStorage.getItem('dose:profile') || '{}'),
        medications: JSON.parse(localStorage.getItem('dose:medications') || '[]'),
      };

      const res = await fetch(SYNC_URL, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error(`Sync failed: ${res.status}`);
      const data = await res.json();
      setLastSync(data.updatedAt);
    } catch (err) {
      setError(err.message);
    } finally {
      setSyncing(false);
    }
  }, []);

  const pull = useCallback(async () => {
    const token = getToken();
    if (!token) return null;

    setSyncing(true);
    setError(null);

    try {
      const res = await fetch(SYNC_URL, {
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (!res.ok) throw new Error(`Sync failed: ${res.status}`);
      const data = await res.json();

      if (data.log) localStorage.setItem('dose:log', JSON.stringify(data.log));
      if (data.substances) localStorage.setItem('dose:custom_substances', JSON.stringify(data.substances));
      if (data.biometrics) localStorage.setItem('dose:biometrics', JSON.stringify(data.biometrics));
      if (data.profile) localStorage.setItem('dose:profile', JSON.stringify(data.profile));
      if (data.medications) localStorage.setItem('dose:medications', JSON.stringify(data.medications));

      setLastSync(data.updatedAt);
      return data;
    } catch (err) {
      setError(err.message);
      return null;
    } finally {
      setSyncing(false);
    }
  }, []);

  const debouncedPush = useCallback(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(push, 2000);
  }, [push]);

  return {
    syncing,
    lastSync,
    error,
    token: getToken(),
    setToken,
    push,
    pull,
    debouncedPush,
  };
}
