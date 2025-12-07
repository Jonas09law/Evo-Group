import { useState, useEffect } from "react";
import { 
  Shield, 
  FileText,
  Search,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  Activity,
  Users,
  UserPlus,
  UserMinus,
  MessageSquare,
  Ban,
  Settings,
  Bell,
  Trash2
} from "lucide-react";

interface LogEntry {
  id: string;
  timestamp: string;
  type: string;
  category: string;
  description: string;
  author: string;
  details?: any;
  color: string;
}

interface AdminLogsProps {
  userDiscordId: string;
  userRank: number;
}

// Categorias de logs baseadas no PUR
const LOG_CATEGORIES = [
  { id: 'all', label: 'Todos', icon: FileText },
  { id: 'members', label: 'Membros', icon: Users },
  { id: 'roles', label: 'Cargos', icon: Shield },
  { id: 'channels', label: 'Canais', icon: MessageSquare },
  { id: 'messages', label: 'Mensagens', icon: MessageSquare },
  { id: 'bans', label: 'Banimentos', icon: Ban },
  { id: 'kicks', label: 'Expulsões', icon: UserMinus },
  { id: 'server', label: 'Servidor', icon: Settings },
  { id: 'moderation', label: 'Moderação', icon: Shield }
];

// Mapeamento de action types do Discord para categorias
const ACTION_TYPE_MAP: Record<number, { category: string; label: string; color: string }> = {
  // Guild Updates
  1: { category: 'server', label: 'ATUALIZAÇÃO SERVIDOR', color: 'text-blue-400' },
  
  // Channel Management
  10: { category: 'channels', label: 'CANAL CRIADO', color: 'text-green-400' },
  11: { category: 'channels', label: 'CANAL ATUALIZADO', color: 'text-yellow-400' },
  12: { category: 'channels', label: 'CANAL DELETADO', color: 'text-red-400' },
  13: { category: 'channels', label: 'PERMISSÃO CANAL', color: 'text-purple-400' },
  
  // Member Actions
  20: { category: 'members', label: 'MEMBRO EXPULSO', color: 'text-red-400' },
  21: { category: 'members', label: 'MEMBRO PROMOVIDO', color: 'text-green-400' },
  22: { category: 'bans', label: 'MEMBRO BANIDO', color: 'text-red-500' },
  23: { category: 'bans', label: 'DESBANIMENTO', color: 'text-green-500' },
  24: { category: 'members', label: 'ATUALIZAÇÃO MEMBRO', color: 'text-blue-400' },
  25: { category: 'roles', label: 'CARGO ATUALIZADO', color: 'text-yellow-400' },
  
  // Role Management
  30: { category: 'roles', label: 'CARGO CRIADO', color: 'text-green-400' },
  31: { category: 'roles', label: 'CARGO ATUALIZADO', color: 'text-yellow-400' },
  32: { category: 'roles', label: 'CARGO DELETADO', color: 'text-red-400' },
  
  // Message Actions
  72: { category: 'messages', label: 'MENSAGEM DELETADA', color: 'text-red-400' },
  73: { category: 'messages', label: 'MENSAGENS BULK DELETE', color: 'text-red-500' },
  74: { category: 'messages', label: 'MENSAGEM FIXADA', color: 'text-yellow-400' },
  75: { category: 'messages', label: 'MENSAGEM DESPINADA', color: 'text-gray-400' },
  
  // Moderation
  80: { category: 'moderation', label: 'TIMEOUT APLICADO', color: 'text-orange-400' },
  81: { category: 'moderation', label: 'TIMEOUT REMOVIDO', color: 'text-green-400' }
};

export const AdminLogs = ({ userDiscordId, userRank }: AdminLogsProps) => {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Carregar logs quando categoria, página ou pesquisa mudar
  useEffect(() => {
    loadLogs();
  }, [selectedCategory, currentPage]);

  // Debounce para pesquisa
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchTerm) {
        setCurrentPage(1);
        loadLogs();
      } else if (searchTerm === '' && logs.length > 0) {
        loadLogs();
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  const loadLogs = async () => {
    setIsLoading(true);
    setError('');

    try {
      let url = `/api/audit-logs?discordId=${userDiscordId}&page=${currentPage}`;
      
      if (selectedCategory !== 'all') {
        url += `&category=${selectedCategory}`;
      }
      
      if (searchTerm) {
        url += `&search=${encodeURIComponent(searchTerm)}`;
      }

      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        // Processar logs do Discord
        const processedLogs: LogEntry[] = data.logs.map((log: any) => {
          const actionInfo = ACTION_TYPE_MAP[log.action] || {
            category: 'server',
            label: `AÇÃO ${log.action}`,
            color: 'text-gray-400'
          };

          return {
            id: log.id,
            timestamp: new Date(log.timestamp).toLocaleString('pt-PT', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit'
            }),
            type: actionInfo.label,
            category: actionInfo.category,
            description: formatLogDescription(log),
            author: log.userId || 'Sistema',
            details: log.details,
            color: actionInfo.color
          };
        });

        setLogs(processedLogs);
        setTotalPages(data.totalPages || 1);
      } else {
        setError(data.error || 'Erro ao carregar logs');
      }
    } catch (err) {
      console.error('Erro ao carregar logs:', err);
      setError('Erro ao conectar ao servidor');
    } finally {
      setIsLoading(false);
    }
  };

  const formatLogDescription = (log: any): string => {
    const actionInfo = ACTION_TYPE_MAP[log.action];
    
    if (!actionInfo) {
      return 'Ação desconhecida';
    }

    // Extrair informações dos changes
    if (log.details && Array.isArray(log.details)) {
      const changes = log.details.map((change: any) => {
        if (change.key === 'name') {
          return `Nome: ${change.old_value || 'N/A'} → ${change.new_value || 'N/A'}`;
        }
        if (change.key === '$add') {
          return `Adicionado: ${JSON.stringify(change.new_value)}`;
        }
        if (change.key === '$remove') {
          return `Removido: ${JSON.stringify(change.new_value)}`;
        }
        return `${change.key}: ${change.old_value || ''} → ${change.new_value || ''}`;
      }).join(' • ');

      return changes || actionInfo.label;
    }

    return actionInfo.label;
  };

  const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      setCurrentPage(1);
      loadLogs();
    }
  };

  const renderCategoryButton = (cat: typeof LOG_CATEGORIES[0]) => {
    const Icon = cat.icon;
    const isActive = selectedCategory === cat.id;

    return (
      <button
        key={cat.id}
        onClick={() => {
          setSelectedCategory(cat.id);
          setCurrentPage(1);
        }}
        className={`p-4 rounded-xl border-2 transition-all font-bold text-sm flex flex-col items-center gap-2 min-h-[90px] ${
          isActive
            ? 'bg-primary/20 text-primary border-primary'
            : 'bg-card text-gray-400 border-border hover:border-primary/50'
        }`}
      >
        <Icon className="w-6 h-6" />
        <span>{cat.label}</span>
      </button>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-white uppercase tracking-tight flex items-center gap-3">
          <FileText className="w-8 h-8 text-primary" />
          Registos do Servidor (Logs)
        </h2>
        <p className="text-sm text-gray-500 mt-1">Sistema avançado de monitorização de eventos do Discord</p>
      </div>

      {/* Categorias */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
        {LOG_CATEGORIES.map(renderCategoryButton)}
      </div>

      {/* Pesquisa */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyDown={handleSearch}
          placeholder="Pesquisar por descrição, autor ou tipo..."
          className="w-full bg-card border border-border rounded-xl pl-12 pr-4 py-4 text-white placeholder-gray-600 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
        />
      </div>

      {/* Lista de Logs */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        {/* Header da tabela */}
        <div className="bg-background px-6 py-4 border-b border-border flex text-xs font-black text-gray-500 uppercase tracking-wider">
          <div className="w-32">Tipo</div>
          <div className="flex-1">Descrição do Evento</div>
          <div className="w-36 text-right">Utilizador</div>
          <div className="w-32 text-right">Timestamp</div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="p-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-gray-400 font-bold">A carregar logs...</p>
          </div>
        )}

        {/* Error State */}
        {error && !isLoading && (
          <div className="p-12 text-center">
            <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
            <p className="text-red-400 text-lg font-bold mb-2">Erro ao carregar logs</p>
            <p className="text-gray-500 text-sm">{error}</p>
            <button
              onClick={() => loadLogs()}
              className="mt-4 px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-all font-bold"
            >
              Tentar Novamente
            </button>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !error && logs.length === 0 && (
          <div className="p-12 text-center">
            <FileText className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400 text-lg font-bold">Nenhum registo encontrado</p>
            <p className="text-gray-600 text-sm mt-2">
              Tente ajustar os filtros ou a pesquisa
            </p>
          </div>
        )}

        {/* Logs List */}
        {!isLoading && !error && logs.length > 0 && (
          <>
            {logs.map((log, index) => (
              <div
                key={log.id}
                className="flex items-center text-sm px-6 py-5 border-b border-border last:border-0 hover:bg-white/5 transition-all duration-200 group"
                style={{ animationDelay: `${index * 30}ms` }}
              >
                <div className="w-32">
                  <span className={`inline-flex items-center gap-2 font-bold text-xs px-3 py-1.5 rounded-lg ${log.color} bg-opacity-10 border border-current border-opacity-20`}>
                    {log.type}
                  </span>
                </div>
                <div className="flex-1 text-gray-300 pr-4 leading-relaxed">
                  {log.description}
                </div>
                <div className="w-36 text-right">
                  <span className="text-gray-400 text-xs font-mono bg-background px-3 py-1.5 rounded-lg border border-border group-hover:border-primary transition-colors">
                    {log.author}
                  </span>
                </div>
                <div className="w-32 text-right text-gray-500 font-mono text-xs">
                  {log.timestamp}
                </div>
              </div>
            ))}

            {/* Paginação */}
            {totalPages > 1 && (
              <div className="p-5 border-t border-border bg-background flex items-center justify-between text-sm text-gray-400">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-5 py-2.5 bg-card border border-border rounded-lg hover:bg-background hover:border-primary transition-all font-bold text-white flex items-center gap-2 disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Anterior
                </button>
                <div className="font-bold text-white">
                  Página {currentPage} de {totalPages}
                </div>
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage >= totalPages}
                  className="px-5 py-2.5 bg-card border border-border rounded-lg hover:bg-background hover:border-primary transition-all font-bold text-white flex items-center gap-2 disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  Próximo
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};
