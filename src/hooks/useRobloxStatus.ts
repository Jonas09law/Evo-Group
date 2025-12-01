import { useState, useEffect } from "react";

interface RobloxStatus {
  players: number;
  max: number;
  loading: boolean;
  error: boolean;
}

export const useRobloxStatus = (serverId: string | null): RobloxStatus => {
  const [status, setStatus] = useState<RobloxStatus>({
    players: 0,
    max: 0,
    loading: true,
    error: false,
  });

  useEffect(() => {
    if (!serverId) {
      setStatus({ players: 0, max: 0, loading: false, error: false });
      return;
    }

    const fetchPlayers = async () => {
      try {
        setStatus(prev => ({ ...prev, loading: true }));

        const res = await fetch(`/api/roblox/${serverId}`);
        const data = await res.json();

        setStatus({
          players: data.players || 0,
          max: data.max || 1000,
          loading: false,
          error: false,
        });
      } catch (err) {
        console.error("Erro ao carregar jogadores:", err);
        setStatus({ players: 0, max: 1000, loading: false, error: true });
      }
    };

    fetchPlayers();
    const interval = setInterval(fetchPlayers, 60000);

    return () => clearInterval(interval);
  }, [serverId]);

  return status;
};
