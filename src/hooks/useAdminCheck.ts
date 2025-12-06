import { useState, useEffect } from 'react';

export function useAdminCheck(discordId: string | null) {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!discordId) {
      setIsAdmin(false);
      setLoading(false);
      return;
    }

    setLoading(true);

    fetch(`/api/check-admin?discordId=${discordId}`)
      .then(r => r.json())
      .then(data => {
        setIsAdmin(data.isAdmin === true);
        setLoading(false);
      })
      .catch(() => {
        setIsAdmin(false);
        setLoading(false);
      });
  }, [discordId]);

  return { isAdmin, loading };
}
