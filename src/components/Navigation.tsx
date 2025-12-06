import { useState, useEffect } from "react";
import { Menu, X, User, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import EvoLogo from "@/assets/AAAAAA.png";

const DISCORD_CLIENT_ID = "1399455643265536051";
const DISCORD_REDIRECT_URI = typeof window !== "undefined" 
  ? window.location.origin + "/" 
  : "";

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

export const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [user, setUser] = useState<UserData | null>(null);
  const [showLogout, setShowLogout] = useState(false);

  useEffect(() => {
    const savedUser = localStorage.getItem("robloxUser");
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }

    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");

    if (code) {
      handleDiscordCallback(code);
    }
  }, []);

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
      setIsOpen(false);
    }
  };

  const handleDiscordLogin = () => {
    const url = `https://discord.com/api/oauth2/authorize?client_id=${DISCORD_CLIENT_ID}&redirect_uri=${encodeURIComponent(
      DISCORD_REDIRECT_URI
    )}&response_type=code&scope=identify`;

    window.location.href = url;
  };

  const handleDiscordCallback = async (code: string) => {
    setIsLoading(true);
    setError("");

    try {

      const tokenResponse = await fetch("/api/auth/discord/exchange-token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });

      if (!tokenResponse.ok) throw new Error("Falha ao obter token");

      const { access_token } = await tokenResponse.json();

      const discordUserRes = await fetch("https://discord.com/api/users/@me", {
        headers: { Authorization: `Bearer ${access_token}` },
      });

      if (!discordUserRes.ok) throw new Error("Falha ao buscar usuário Discord");

      const discordUser = await discordUserRes.json();
      const discordId = discordUser.id;

      const discordAvatar = discordUser.avatar
        ? `https://cdn.discordapp.com/avatars/${discordId}/${discordUser.avatar}.png`
        : `https://ui-avatars.com/api/?name=${discordUser.username}&background=5865F2&color=fff`;

      const bloxResponse = await fetch(`/api/bloxlink/discord-to-roblox?discordId=${discordId}`);

      if (!bloxResponse.ok) {
        setError("Sua conta não está verificada no Bloxlink.");
        setIsLoginModalOpen(true);
        return;
      }

      const bloxData = await bloxResponse.json();
      const robloxId = bloxData.robloxID;

      let robloxUsername = `User_${robloxId}`;
      let robloxAvatar = `https://www.roblox.com/headshot-thumbnail/image?userId=${robloxId}&width=150&height=150&format=png`;

      const robloxRes = await fetch(`/api/roblox/${robloxId}`);

      if (robloxRes.ok) {
        const data = await robloxRes.json();
        robloxUsername = data.name || robloxUsername;
        robloxAvatar = data.avatar || robloxAvatar;
      }

      const userData: UserData = {
        id: robloxId,
        username: robloxUsername,
        avatar: robloxAvatar,
        discordId,
        discordUsername: discordUser.username,
        discordAvatar,
        verified: true,
        loginDate: new Date().toISOString(),
      };

      localStorage.setItem("robloxUser", JSON.stringify(userData));
      setUser(userData);
      window.history.replaceState({}, document.title, window.location.pathname);
    } catch (err) {
      console.error(err);
      setError("Erro no login.");
      setIsLoginModalOpen(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("robloxUser");
    setUser(null);
    setShowLogout(false);
  };
  
  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-md border-b border-border/50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <img
                src={EvoLogo}
                alt="EVO Group Logo"
                className="h-10 w-auto object-contain drop-shadow-lg hover:drop-shadow-xl transition-all duration-300"
              />
            </div>

            <div className="hidden md:flex items-center space-x-8">
              <button
                onClick={() => scrollToSection("inicio")}
                className="text-sm text-foreground/80 hover:text-primary transition-colors font-rajdhani font-semibold tracking-wider uppercase"
              >
                INÍCIO
              </button>
              <button
                onClick={() => scrollToSection("servidores")}
                className="text-sm text-foreground/80 hover:text-primary transition-colors font-rajdhani font-semibold tracking-wider uppercase"
              >
                CIDADES
              </button>
              <button
                onClick={() => scrollToSection("ranking")}
                className="text-sm text-foreground/80 hover:text-primary transition-colors font-rajdhani font-semibold tracking-wider uppercase"
              >
                RANKING
              </button>
              <button
                onClick={() => scrollToSection("como-jogar")}
                className="text-sm text-foreground/80 hover:text-primary transition-colors font-rajdhani font-semibold tracking-wider uppercase"
              >
                COMO JOGAR
              </button>
              <button
                onClick={() => scrollToSection("noticias")}
                className="text-sm text-foreground/80 hover:text-primary transition-colors font-rajdhani font-semibold tracking-wider uppercase"
              >
                NOTÍCIAS
              </button>
              <button
                onClick={() => scrollToSection("contato")}
                className="text-sm text-foreground/80 hover:text-primary transition-colors font-rajdhani font-semibold tracking-wider uppercase"
              >
                CONTATO
              </button>

              {!user ? (
                <button
                  onClick={() => setIsLoginModalOpen(true)}
                  className="flex items-center gap-2 text-white hover:text-green-400 transition-colors font-bold text-sm uppercase"
                >
                  <User className="w-4 h-4" /> Entrar
                </button>
              ) : (
                <div className="relative">
                  <button
                    onClick={() => setShowLogout(!showLogout)}
                    className="flex items-center gap-3 transition-all"
                  >
                    <img
                      src={user.avatar}
                      alt={user.username}
                      className="w-8 h-8 rounded-full border-2 border-green-400"
                      onError={(e) => {
                        e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.username)}&background=00ff41&color=000&bold=true`;
                      }}
                    />
                    <div className="text-left">
                      <p className="text-xs font-bold text-white leading-tight flex items-center gap-1">
                        {user.username}
                        <span className="text-green-400" title="Verificado via Discord">✓</span>
                      </p>
                      <p className="text-[10px] text-gray-400">
                        ID: {user.id}
                      </p>
                    </div>
                  </button>
                  
                  {showLogout && (
                    <div className="absolute top-full right-0 mt-2 bg-zinc-900 border border-zinc-800 rounded-lg shadow-xl p-2 min-w-[120px]">
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 rounded transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        Sair
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setIsOpen(!isOpen)}
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>

          {isOpen && (
            <div className="md:hidden py-4 space-y-4 border-t border-border/50">
              <button
                onClick={() => scrollToSection("inicio")}
                className="block w-full text-left px-4 py-2 text-foreground/80 hover:text-primary transition-colors font-rajdhani font-semibold tracking-wider uppercase"
              >
                INÍCIO
              </button>
              <button
                onClick={() => scrollToSection("servidores")}
                className="block w-full text-left px-4 py-2 text-foreground/80 hover:text-primary transition-colors font-rajdhani font-semibold tracking-wider uppercase"
              >
                CIDADES
              </button>
              <button
                onClick={() => scrollToSection("ranking")}
                className="block w-full text-left px-4 py-2 text-foreground/80 hover:text-primary transition-colors font-rajdhani font-semibold tracking-wider uppercase"
              >
                RANKING
              </button>
              <button
                onClick={() => scrollToSection("como-jogar")}
                className="block w-full text-left px-4 py-2 text-foreground/80 hover:text-primary transition-colors font-rajdhani font-semibold tracking-wider uppercase"
              >
                COMO JOGAR
              </button>
              <button
                onClick={() => scrollToSection("noticias")}
                className="block w-full text-left px-4 py-2 text-foreground/80 hover:text-primary transition-colors font-rajdhani font-semibold tracking-wider uppercase"
              >
                NOTÍCIAS
              </button>
              <button
                onClick={() => scrollToSection("contato")}
                className="block w-full text-left px-4 py-2 text-foreground/80 hover:text-primary transition-colors font-rajdhani font-semibold tracking-wider uppercase"
              >
                CONTATO
              </button>

              {!user ? (
                <button
                  onClick={() => {
                    setIsLoginModalOpen(true);
                    setIsOpen(false);
                  }}
                  className="flex items-center gap-2 w-full px-4 py-2 text-white hover:text-green-400 transition-colors font-bold text-sm uppercase"
                >
                  <User className="w-4 h-4" /> Entrar
                </button>
              ) : (
                <div className="px-4 py-2 space-y-2">
                  <div className="flex items-center gap-3">
                    <img
                      src={user.avatar}
                      alt={user.username}
                      className="w-10 h-10 rounded-full border-2 border-green-400"
                      onError={(e) => {
                        e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.username)}&background=00ff41&color=000&bold=true`;
                      }}
                    />
                    <div>
                      <p className="text-sm font-bold text-white flex items-center gap-1">
                        {user.username}
                        <span className="text-green-400">✓</span>
                      </p>
                      <p className="text-xs text-gray-400">
                        ID: {user.id}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="w-full bg-red-600 text-white px-4 py-2 rounded text-sm hover:bg-red-700 transition flex items-center justify-center gap-2"
                  >
                    <LogOut className="w-4 h-4" />
                    Sair
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </nav>

      {/* Modal de Login */}
      {isLoginModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 max-w-md w-full shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-white">
               Login
              </h3>
              <button
                onClick={() => {
                  setIsLoginModalOpen(false);
                  setError("");
                }}
                className="text-gray-400 hover:text-white transition"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              {error && (
                <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-3 text-red-400 text-sm">
                  {error}
                </div>
              )}

              {isLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-400 mx-auto mb-4"></div>
                  <p className="text-gray-400">Verificando suas contas...</p>
                </div>
              ) : (
                <>
                  <button
                    onClick={handleDiscordLogin}
                    
                    className="w-full bg-[#5865F2] hover:bg-[#4752C4] text-white font-bold py-4 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                  >
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
                    </svg>
                    Entrar com Discord
                  </button>

                  <div className="bg-blue-500/10 border border-blue-500/50 rounded-lg p-4">
                    <p className="text-blue-400 text-xs font-bold mb-2">
                      🔒 Login Seguro via Discord + Bloxlink
                    </p>
                    <ul className="text-blue-300 text-xs space-y-1">
                      <li>✓ Sua conta Discord precisa estar linkada com Roblox no Bloxlink</li>
                      <li>✓ Use o comando <code className="bg-blue-500/20 px-1 rounded">/verify</code> no servidor Discord</li>
                      <li>✓ Login 100% seguro via OAuth2</li>
                    </ul>
                  </div>

                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
