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
    const checkAdminStatus = async () => {
      if (!discordId) {
        setAdminStatus({
          isAdmin: false,
          rank: 0,
          loading: false,
          user: null
        });
        return;
      }

      try {
        const response = await fetch(`/api/api?action=check_admin&discordId=${discordId}`);
        const data = await response.json();

        if (data.success) {
          setAdminStatus({
            isAdmin: data.isAdmin,
            rank: data.rank,
            loading: false,
            user: data.user
          });
        } else {
          setAdminStatus({
            isAdmin: false,
            rank: 0,
            loading: false,
            user: null
          });
        }
      } catch (error) {
        console.error('Error checking admin status:', error);
        setAdminStatus({
          isAdmin: false,
          rank: 0,
          loading: false,
          user: null
        });
      }
    };

    checkAdminStatus();
  }, [discordId]);

  return adminStatus;
}