// src/components/admin/AdminDashboard.tsx
import { useState } from "react";
import { 
  Users, 
  Shield, 
  Activity, 
  FileText
} from "lucide-react";

// Importar componentes
import { AdminStats } from "./AdminStats";
import { AdminStaff } from "./AdminStaff";
import { AdminLogs } from "./AdminLogs";

interface AdminDashboardProps {
  userDiscordId: string;
  userRank: number;
}

type TabType = 'dashboard' | 'staff' | 'logs';

export const AdminDashboard = ({ userDiscordId, userRank }: AdminDashboardProps) => {
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');

  const tabs = [
    { id: 'dashboard' as TabType, label: 'Dashboard', icon: Activity },
    { id: 'staff' as TabType, label: 'Gestão Staff', icon: Users },
    { id: 'logs' as TabType, label: 'Registos (Logs)', icon: FileText }
  ];

  return (
    <div className="min-h-screen bg-background pt-24 pb-12">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
            <Shield className="w-10 h-10 text-red-400" />
            Painel Administrativo
          </h1>
          <p className="text-gray-400">Sistema de gestão e auditoria</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b border-border overflow-x-auto">
          {tabs.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-3 font-bold transition-all whitespace-nowrap flex items-center gap-2 ${
                  activeTab === tab.id
                    ? 'text-primary border-b-2 border-primary'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        <div className="mt-6">
          {activeTab === 'dashboard' && (
            <AdminStats userDiscordId={userDiscordId} />
          )}
          
          {activeTab === 'staff' && (
            <AdminStaff userDiscordId={userDiscordId} userRank={userRank} />
          )}
          
          {activeTab === 'logs' && (
            <AdminLogs userDiscordId={userDiscordId} userRank={userRank} />
          )}
        </div>
      </div>
    </div>
  );
};
