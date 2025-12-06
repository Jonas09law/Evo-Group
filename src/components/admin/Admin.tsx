import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Navigation } from "@/components/Navigation";
import { AdminDashboard } from "./AdminDashboard";
import { useAdminCheck } from "@/components/hooks/useAdminCheck";
import { Shield } from "lucide-react";

interface UserData {
  id: string;
  username: string;
  avatar: string;
  discordId: string;
  discordUsername: string;
  discordAvatar: string;
  verified: boolean;
  loginDate: string;
}

const Admin = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<UserData | null>(null);

  // Carregar usuário do localStorage
  useEffect(() => {
    const savedUser = localStorage.getItem("robloxUser");
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (err) {
        console.error("Error parsing user data:", err);
        navigate("/");
      }
    } else {
      // Se não houver usuário logado, redirecionar para home
      navigate("/");
    }
  }, [navigate]);

  // Admin check
  const adminStatus = useAdminCheck(user?.discordId || null);

  // Redirecionar se não for admin
  useEffect(() => {
    if (!adminStatus.loading && !adminStatus.isAdmin && user) {
      navigate("/");
    }
  }, [adminStatus, user, navigate]);

  // Loading state
  if (adminStatus.loading || !user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-400 font-rajdhani">Verificando permissões...</p>
        </div>
      </div>
    );
  }

  // Access denied
  if (!adminStatus.isAdmin) {
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

  // Admin access granted
  return (
    <>
      <Navigation />
      <AdminDashboard 
        userDiscordId={user.discordId} 
        userRank={adminStatus.rank} 
      />
    </>
  );
};

export default Admin;