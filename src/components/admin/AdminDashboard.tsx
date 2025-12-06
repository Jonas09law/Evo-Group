import { useState, useEffect } from "react";
import { 
  Users, Shield, Activity, FileText,
  UserPlus, Edit, Trash2, X, Search, 
  ChevronLeft, ChevronRight, AlertCircle 
} from "lucide-react";

interface StaffMember {
  id: string;
  discordId: string;
  username: string;
  avatar: string;
  role: string;
  rank: number;
  addedAt: string;
}

interface DashboardStats {
  totalMembers: number;
  onlineMembers: number;
  staffOnline: number;
  totalStaff: number;
  recentLogs: number;
}

interface AuditLog {
  id: string;
  action: string;
  userId: string;
  details: any;
  timestamp: string;
  source: 'discord' | 'internal';
}

interface AdminDashboardProps {
  userDiscordId: string;
  userRank: number;
}

export const AdminDashboard = ({ userDiscordId, userRank }: AdminDashboardProps) => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'staff' | 'logs'>('dashboard');
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [staffList, setStaffList] = useState<StaffMember[]>([]);
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [logCategories, setLogCategories] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [currentLogPage, setCurrentLogPage] = useState(1);
  const [totalLogPages, setTotalLogPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');

  // Modais
  const [showAddStaffModal, setShowAddStaffModal] = useState(false);
  const [showEditStaffModal, setShowEditStaffModal] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<StaffMember | null>(null);

  // Form states
  const [newStaffDiscordId, setNewStaffDiscordId] = useState('');
  const [newStaffRole, setNewStaffRole] = useState('Moderador');
  const [newStaffRank, setNewStaffRank] = useState(5);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // ---- LOAD DATA ----
  useEffect(() => {
    fetchDashboardStats();
    fetchStaffList();
    fetchLogCategories();
  }, []);

  useEffect(() => {
    if(activeTab === 'logs') fetchLogs();
  }, [activeTab, selectedCategory, currentLogPage, searchTerm]);

  // Funções para carregar dados (troque os endpoints conforme necessidade)
  const fetchDashboardStats = async () => {
    try {
      const res = await fetch(`/api/dashboard_stats?discordId=${userDiscordId}`);
      const data = await res.json();
      if(data.success) setStats(data.stats);
    } catch (err) { console.error(err); }
  };

  const fetchStaffList = async () => {
    try {
      const res = await fetch(`/api/staff_list?discordId=${userDiscordId}`);
      const data = await res.json();
      if(data.success) setStaffList(data.staff);
    } catch (err) { console.error(err); }
  };

  const fetchLogCategories = async () => {
    try {
      const res = await fetch(`/api/log_categories?discordId=${userDiscordId}`);
      const data = await res.json();
      if(data.success) setLogCategories(data.categories);
    } catch (err) { console.error(err); }
  };

  const fetchLogs = async () => {
    try {
      let url = `/api/audit_logs?discordId=${userDiscordId}&page=${currentLogPage}`;
      if(selectedCategory) url += `&category=${selectedCategory}`;
      if(searchTerm) url += `&search=${encodeURIComponent(searchTerm)}`;
      const res = await fetch(url);
      const data = await res.json();
      if(data.success){
        setLogs(data.logs);
        setTotalLogPages(data.totalPages);
      }
    } catch (err) { console.error(err); }
  };

  // ---- STAFF ACTIONS ----
  const handleAddStaff = async (e: React.FormEvent) => {
    e.preventDefault(); setIsLoading(true); setError('');
    try {
      const res = await fetch('/api/add_staff', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
          discordId: userDiscordId,
          targetDiscordId: newStaffDiscordId,
          role: newStaffRole,
          rank: newStaffRank
        })
      });
      const data = await res.json();
      if(data.success){
        setShowAddStaffModal(false);
        setNewStaffDiscordId(''); setNewStaffRole('Moderador'); setNewStaffRank(5);
        fetchStaffList();
      } else setError(data.error || 'Erro ao adicionar staff');
    } catch(err){ setError('Erro de conexão'); }
    finally{ setIsLoading(false); }
  };

  const handleRemoveStaff = async (targetDiscordId: string) => {
    if(!confirm('Remover este membro da equipe?')) return;
    try {
      const res = await fetch('/api/remove_staff', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ discordId: userDiscordId, targetDiscordId })
      });
      const data = await res.json();
      if(data.success) fetchStaffList(); else alert(data.error || 'Erro ao remover staff');
    } catch(err){ alert('Erro de conexão'); }
  };

  const handleUpdateStaff = async (e: React.FormEvent) => {
    e.preventDefault(); if(!selectedStaff) return;
    setIsLoading(true); setError('');
    try {
      const res = await fetch('/api/update_staff', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
          discordId: userDiscordId,
          targetDiscordId: selectedStaff.discordId,
          newRole: newStaffRole,
          newRank: newStaffRank
        })
      });
      const data = await res.json();
      if(data.success){
        setShowEditStaffModal(false);
        setSelectedStaff(null);
        fetchStaffList();
      } else setError(data.error || 'Erro ao atualizar staff');
    } catch(err){ setError('Erro de conexão'); }
    finally{ setIsLoading(false); }
  };

  const openEditModal = (staff: StaffMember) => {
    setSelectedStaff(staff);
    setNewStaffRole(staff.role);
    setNewStaffRank(staff.rank);
    setShowEditStaffModal(true);
  };

  const formatDate = (date: string) => new Date(date).toLocaleString('pt-PT');

  const getRankColor = (rank: number) => {
    if(rank>=10) return 'text-red-400 bg-red-900/20 border-red-500/30';
    if(rank>=8) return 'text-orange-400 bg-orange-900/20 border-orange-500/30';
    if(rank>=5) return 'text-yellow-400 bg-yellow-900/20 border-yellow-500/30';
    return 'text-blue-400 bg-blue-900/20 border-blue-500/30';
  };

  // ---- JSX ----
  return (
    <div className="min-h-screen bg-background pt-24 pb-12">
      <div className="container mx-auto px-4">
        {/* HEADER */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
            <Shield className="w-10 h-10 text-red-400" />
            Painel Administrativo
          </h1>
          <p className="text-gray-400">Sistema de gestão e auditoria</p>
        </div>

        {/* TABS */}
        <div className="flex gap-2 mb-6 border-b border-border">
          <button onClick={()=>setActiveTab('dashboard')} className={`px-6 py-3 font-bold transition-all ${activeTab==='dashboard'?'text-primary border-b-2 border-primary':'text-gray-400 hover:text-white'}`}>
            <Activity className="w-4 h-4 inline mr-2"/>Dashboard
          </button>
          <button onClick={()=>setActiveTab('staff')} className={`px-6 py-3 font-bold transition-all ${activeTab==='staff'?'text-primary border-b-2 border-primary':'text-gray-400 hover:text-white'}`}>
            <Users className="w-4 h-4 inline mr-2"/>Gestão Staff
          </button>
          <button onClick={()=>setActiveTab('logs')} className={`px-6 py-3 font-bold transition-all ${activeTab==='logs'?'text-primary border-b-2 border-primary':'text-gray-400 hover:text-white'}`}>
            <FileText className="w-4 h-4 inline mr-2"/>Registos (Logs)
          </button>
        </div>

        {/* DASHBOARD */}
        {activeTab==='dashboard' && stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-card border border-border rounded-xl p-6 hover:border-primary/50 transition-all">
              <Users className="w-10 h-10 text-primary"/>
              <p className="text-gray-400 text-sm uppercase tracking-wider mb-1">Membros Total</p>
              <p className="text-4xl font-bold text-white">{stats.totalMembers}</p>
            </div>
            <div className="bg-card border border-border rounded-xl p-6 hover:border-green-500/50 transition-all">
              <Activity className="w-10 h-10 text-green-400"/>
              <p className="text-gray-400 text-sm uppercase tracking-wider mb-1">Membros Online</p>
              <p className="text-4xl font-bold text-white">{stats.onlineMembers}</p>
            </div>
            <div className="bg-card border border-border rounded-xl p-6 hover:border-yellow-500/50 transition-all">
              <Shield className="w-10 h-10 text-yellow-400"/>
              <p className="text-gray-400 text-sm uppercase tracking-wider mb-1">Staff Online</p>
              <p className="text-4xl font-bold text-white">{stats.staffOnline}</p>
            </div>
            <div className="bg-card border border-border rounded-xl p-6 hover:border-red-500/50 transition-all">
              <FileText className="w-10 h-10 text-red-400"/>
              <p className="text-gray-400 text-sm uppercase tracking-wider mb-1">Total Staff</p>
              <p className="text-4xl font-bold text-white">{stats.totalStaff}</p>
            </div>
          </div>
        )}

        {/* STAFF */}
        {activeTab==='staff' && (
          <div>
            {userRank>=8 && (
              <div className="mb-6 flex justify-end">
                <button onClick={()=>setShowAddStaffModal(true)} className="bg-primary hover:bg-primary/90 text-white px-6 py-3 rounded-lg font-bold flex items-center gap-2 transition-all">
                  <UserPlus className="w-5 h-5"/>Adicionar Staff
                </button>
              </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {staffList.map(staff=>(
                <div key={staff.id} className="bg-card border border-border rounded-xl p-5 hover:border-primary/50 transition-all group">
                  <div className="flex items-center gap-4">
                    <img src={staff.avatar} alt={staff.username} className="w-14 h-14 rounded-full border-2 border-primary"
                      onError={e=>e.currentTarget.src=`https://ui-avatars.com/api/?name=${encodeURIComponent(staff.username)}&background=5865F2&color=fff`}/>
                    <div className="flex-1">
                      <h3 className="text-white font-bold text-lg">{staff.username}</h3>
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        <span className={`text-xs px-2 py-1 rounded border ${getRankColor(staff.rank)}`}>{staff.role}</span>
                        <span className="text-xs text-gray-500">Rank: {staff.rank}</span>
                      </div>
                    </div>
                    {userRank>=8 && staff.discordId!=="1113945518071107705" && (
                      <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={()=>openEditModal(staff)} className="p-2 bg-blue-900/50 text-blue-400 rounded hover:bg-blue-600 hover:text-white transition-all" title="Editar">
                          <Edit className="w-4 h-4"/>
                        </button>
                        <button onClick={()=>handleRemoveStaff(staff.discordId)} className="p-2 bg-red-900/50 text-red-400 rounded hover:bg-red-600 hover:text-white transition-all" title="Remover">
                          <Trash2 className="w-4 h-4"/>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* LOGS */}
        {activeTab==='logs' && (
          <div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 mb-6">
              <button onClick={()=>setSelectedCategory('')} className={`p-4 rounded-xl border-2 transition-all font-bold text-sm ${selectedCategory===''?'bg-primary text-white border-primary':'bg-card text-gray-400 border-border hover:border-primary/50'}`}>Todos</button>
              {logCategories.map(cat=>(
                <button key={cat.id} onClick={()=>setSelectedCategory(cat.id)} className={`p-4 rounded-xl border-2 transition-all font-bold text-sm ${selectedCategory===cat.id?'bg-primary text-white border-primary':'bg-card text-gray-400 border-border hover:border-primary/50'}`}>{cat.label}</button>
              ))}
            </div>
            <div className="relative mb-6">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500"/>
              <input type="text" value={searchTerm} onChange={e=>setSearchTerm(e.target.value)} placeholder="Pesquisar logs..." className="w-full bg-card border border-border rounded-xl pl-12 pr-4 py-4 text-white focus:border-primary outline-none transition-all"/>
            </div>
            <div className="bg-card border border-border rounded-xl overflow-hidden">
              {logs.length===0 ? (
                <div className="p-12 text-center">
                  <AlertCircle className="w-16 h-16 text-gray-600 mx-auto mb-4"/>
                  <p className="text-gray-400 text-lg font-bold">Nenhum registo encontrado</p>
                </div>
              ) : (
                logs.map(log=>(
                  <div key={log.id} className="border-b border-border last:border-0 p-5 hover:bg-white/5 transition-all">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className={`text-xs px-2 py-1 rounded border ${log.source==='discord'?'bg-blue-900/20 text-blue-400 border-blue-500/30':'bg-purple-900/20 text-purple-400 border-purple-500/30'}`}>{log.action}</span>
                          <span className="text-xs text-gray-500 font-mono">{formatDate(log.timestamp)}</span>
                        </div>
                        <p className="text-white text-sm">User ID: <span className="font-mono text-primary">{log.userId}</span></p>
                        {log.details && Object.keys(log.details).length>0 && <pre className="text-xs text-gray-400 mt-2 bg-black/30 p-2 rounded">{JSON.stringify(log.details,null,2)}</pre>}
                      </div>
                    </div>
                  </div>
                ))
              )}
              {totalLogPages>1 && (
                <div className="p-4 bg-black/30 flex items-center justify-between">
                  <button onClick={()=>setCurrentLogPage(p=>Math.max(1,p-1))} disabled={currentLogPage===1} className="px-4 py-2 bg-card border border-border rounded-lg disabled:opacity-30 disabled:cursor-not-allowed hover:border-primary transition-all"><ChevronLeft className="w-5 h-5"/></button>
                  <span className="text-gray-400">Página {currentLogPage} de {totalLogPages}</span>
                  <button onClick={()=>setCurrentLogPage(p=>Math.min(totalLogPages,p+1))} disabled={currentLogPage===totalLogPages} className="px-4 py-2 bg-card border border-border rounded-lg disabled:opacity-30 disabled:cursor-not-allowed hover:border-primary transition-all"><ChevronRight className="w-5 h-5"/></button>
                </div>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
