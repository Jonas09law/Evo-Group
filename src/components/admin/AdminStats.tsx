import { useState, useEffect } from "react";
import { Users, Activity, Shield, FileText } from "lucide-react";

interface DashboardStats {
  totalMembers: number;
  onlineMembers: number;
  staffOnline: number;
  totalStaff: number;
  recentLogs: number;
}

interface AdminStatsProps {
  userDiscordId: string;
}

export const AdminStats = ({ userDiscordId }: AdminStatsProps) => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, [userDiscordId]);

  const loadStats = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/dashboard-stats?discordId=${userDiscordId}`);
      const data = await response.json();
      if (data.success) {
        setStats(data.stats);
      }
    } catch (err) {
      console.error('Error loading stats:', err);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading || !stats) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-card border border-border rounded-xl p-6 animate-pulse">
            <div className="h-10 w-10 bg-gray-700 rounded mb-4"></div>
            <div className="h-4 bg-gray-700 rounded w-24 mb-2"></div>
            <div className="h-8 bg-gray-700 rounded w-16"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <div className="bg-card border border-border rounded-xl p-6 hover:border-primary/50 transition-all">
        <div className="flex items-center justify-between mb-4">
          <Users className="w-10 h-10 text-primary" />
        </div>
        <p className="text-gray-400 text-sm uppercase tracking-wider mb-1">Membros Total</p>
        <p className="text-4xl font-bold text-white">{stats.totalMembers}</p>
      </div>

      <div className="bg-card border border-border rounded-xl p-6 hover:border-green-500/50 transition-all">
        <div className="flex items-center justify-between mb-4">
          <Activity className="w-10 h-10 text-green-400" />
        </div>
        <p className="text-gray-400 text-sm uppercase tracking-wider mb-1">Membros Online</p>
        <p className="text-4xl font-bold text-white">{stats.onlineMembers}</p>
      </div>

      <div className="bg-card border border-border rounded-xl p-6 hover:border-yellow-500/50 transition-all">
        <div className="flex items-center justify-between mb-4">
          <Shield className="w-10 h-10 text-yellow-400" />
        </div>
        <p className="text-gray-400 text-sm uppercase tracking-wider mb-1">Staff Online</p>
        <p className="text-4xl font-bold text-white">{stats.staffOnline}</p>
      </div>

      <div className="bg-card border border-border rounded-xl p-6 hover:border-red-500/50 transition-all">
        <div className="flex items-center justify-between mb-4">
          <FileText className="w-10 h-10 text-red-400" />
        </div>
        <p className="text-gray-400 text-sm uppercase tracking-wider mb-1">Total Staff</p>
        <p className="text-4xl font-bold text-white">{stats.totalStaff}</p>
      </div>
    </div>
  );
};

// src/components/admin/AdminStaff.tsx
import { useState, useEffect } from "react";
import { UserPlus, Edit, Trash2, X } from "lucide-react";

interface StaffMember {
  id: string;
  discordId: string;
  username: string;
  avatar: string;
  role: string;
  rank: number;
  addedAt: string;
}

interface AdminStaffProps {
  userDiscordId: string;
  userRank: number;
}

export const AdminStaff = ({ userDiscordId, userRank }: AdminStaffProps) => {
  const [staffList, setStaffList] = useState<StaffMember[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadStaffList();
  }, []);

  const loadStaffList = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/staff-list?discordId=${userDiscordId}`);
      const data = await response.json();
      if (data.success) {
        setStaffList(data.staff || []);
      }
    } catch (err) {
      console.error('Error loading staff:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const getRankColor = (rank: number) => {
    if (rank >= 10) return 'text-red-400 bg-red-900/20 border-red-500/30';
    if (rank >= 8) return 'text-orange-400 bg-orange-900/20 border-orange-500/30';
    if (rank >= 5) return 'text-yellow-400 bg-yellow-900/20 border-yellow-500/30';
    return 'text-blue-400 bg-blue-900/20 border-blue-500/30';
  };

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-gray-400">A carregar equipa...</p>
      </div>
    );
  }

  return (
    <div>
      {userRank >= 8 && (
        <div className="mb-6 flex justify-end">
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-primary hover:bg-primary/90 text-white px-6 py-3 rounded-lg font-bold flex items-center gap-2 transition-all"
          >
            <UserPlus className="w-5 h-5" />
            Adicionar Staff
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {staffList.length === 0 ? (
          <div className="col-span-2 text-center py-12 text-gray-400">
            Nenhum membro da staff encontrado
          </div>
        ) : (
          staffList.map((staff) => (
            <div
              key={staff.id}
              className="bg-card border border-border rounded-xl p-5 hover:border-primary/50 transition-all group"
            >
              <div className="flex items-center gap-4">
                <img
                  src={staff.avatar}
                  alt={staff.username}
                  className="w-14 h-14 rounded-full border-2 border-primary"
                  onError={(e) => {
                    e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(staff.username)}&background=5865F2&color=fff`;
                  }}
                />
                <div className="flex-1">
                  <h3 className="text-white font-bold text-lg">{staff.username}</h3>
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    <span className={`text-xs px-2 py-1 rounded border ${getRankColor(staff.rank)}`}>
                      {staff.role}
                    </span>
                    <span className="text-xs text-gray-500">Rank: {staff.rank}</span>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
