import { useState, useEffect } from 'react';

interface AdminStatus {
  isAdmin: boolean;
  rank: number;
  loading: boolean;
  user: {
    id: string;
    username: string;
    avatar: string;
  } | null;
}

export function useAdminCheck(discordId: string | null): AdminStatus {
  const [adminStatus, setAdminStatus] = useState<AdminStatus>({
    isAdmin: false,
    rank: 0,
    loading: true,
    user: null
  });

  useEffect(() => {
    if (!discordId) {
      setAdminStatus({
        isAdmin: false,
        rank: 0,
        loading: false,
        user: null
      });
      return;
    }

    setAdminStatus(prev => ({ ...prev, loading: true }));

    fetch(`/api/check-admin?discordId=${discordId}`)
      .then(r => r.json())
      .then(data => {
        setAdminStatus({
          isAdmin: data.isAdmin === true,
          rank: data.rank || 0,
          loading: false,
          user: data.user || null
        });
      })
      .catch(err => {
        console.error('Erro ao verificar admin:', err);
        setAdminStatus({
          isAdmin: false,
          rank: 0,
          loading: false,
          user: null
        });
      });
  }, [discordId]);

  return adminStatus;
}

