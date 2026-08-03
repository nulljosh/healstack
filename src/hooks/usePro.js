import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';

export function usePro() {
  const { user } = useAuth();
  const [isPro, setIsPro] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) return;
    fetch(`/api/stripe?action=status&userId=${user.id}`)
      .then(r => r.json())
      .then(d => setIsPro(Boolean(d.isPro)))
      .catch(() => {});
  }, [user]);

  const unlock = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const res = await fetch('/api/stripe?action=checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id }),
      });
      const { url } = await res.json();
      if (url) window.location.href = url;
    } finally {
      setLoading(false);
    }
  }, [user]);

  return { isPro, loading, unlock };
}
