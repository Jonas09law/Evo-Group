import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Navigation } from "@/components/Navigation";
import { AdminDashboard } from "./AdminDashboard";
import { useAdminCheck } from "@/hooks/useAdminCheck";
import { Shield } from "lucide-react";

const Admin = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);

  // Carrega o usuário do localStorage
  useEffect(() => {
    const saved = localStorage.getItem("robloxUser");
    if (saved) {
      try {
        setUser(JSON.parse(saved));
      } catch {
        navigate("/");
      }
    } else {
      navigate("/");
    }
  }, [navigate]);

  // Usa o hook novo
  const { isAdmin, loading } = useAdminCheck(user?.discordId || null);

  // Se não for admin, manda embora
  useEffect(() => {
    if (!loading && !isAdmin && user) {
      navigate("/");
    }
  }, [isAdmin, loading, user, navigate]);

  // Loading
  if (loading || !user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-400 font-rajdhani">Verificando permissões...</p>
        </div>
      </div>
    );
  }

  // Acesso negado
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <Shield className="w-20 h-20 text-red-400 mx-auto mb-6" />
          <h1 className="text-4xl md:text-5xl font-bold text-red-400 mb-4 font-rajdhani">
            Acesso Negado
          </h1>
          <p className="text-gray-400 mb-8 text-lg">
            Você não tem permissão para acessar o painel administrativo.
          </p>
          <button
            onClick={() => navigate("/")}
            className="bg-primary hover:bg-primary/90 text-white px-8 py-4 rounded-lg font-bold font-rajdhani uppercase tracking-wider transition-all transform hover:scale-105"
          >
            Voltar ao Início
          </button>
        </div>
      </div>
    );
  }

  // ADMIN LIBERADO
  return (
    <>
      <Navigation />
      <AdminDashboard userDiscordId={user.discordId} userRank={10} />
    </>
  );
};

export default Admin;
