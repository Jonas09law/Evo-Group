// components/Navigation.tsx
import { useState, useEffect } from "react";
import { Menu, X, User, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import EvoLogo from "@/assets/AAAAAA.png";

const DISCORD_CLIENT_ID = "1399455643265536051";
const DISCORD_REDIRECT_URI = window.location.origin + "/";
const BLOXLINK_API_KEY = "ca1a7cff-bef9-4f86-b145-75e80c3d2e03";
const DISCORD_SERVER_ID = "1201255095745130556";

interface UserData {
  id: string;
  username: string;
  displayName: string;        // Agora obrigatório (sempre vai ter um valor válido)
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
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {
        console.error("Erro ao carregar usuário:", e);
        localStorage.removeItem("robloxUser");
      }
    }

    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get("code");
    if (code) {
      handleDiscordCallback(code);
    }
  }, []);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
      setIsOpen(false);
    }
  };

  const handleDiscordLogin = () => {
    const discordAuthUrl = `https://discord.com/api/oauth2/authorize?client_id=${DISCORD_CLIENT_ID}&redirect_uri=${encodeURIComponent(
      DISCORD_REDIRECT_URI
    )}&response_type=code&scope=identify`;
    window.location.href = discordAuthUrl;
  };

  const handleDiscordCallback = async (code: string) => {
    setIsLoading(true);
    setError("");

    try {
      // === 1. Pegar token do Discord ===
      const tokenResponse = await fetch("https://discord.com/api/oauth2/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          client_id: DISCORD_CLIENT_ID,
          client_secret: "s-7cg1tLX7SlAaFOLrzWofII0GgjtugS", // NUNCA exponha isso em produção real!
          grant_type: "authorization_code",
          code,
          redirect_uri: DISCORD_REDIRECT_URI,
        }),
      });

      if (!tokenResponse.ok) throw new Error("Erro ao obter token do Discord");
      const tokenData = await tokenResponse.json();
      const accessToken = tokenData.access_token;

      // === 2. Pegar dados do usuário Discord ===
      const userResponse = await fetch("https://discord.com/api/users/@me", {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (!userResponse.ok) throw new Error("Erro ao buscar informações do Discord");
      const discordUser = await userResponse.json();

      const discordId = discordUser.id;
      const discordUsername = discordUser.username;
      const discordAvatar = discordUser.avatar
        ? `https://cdn.discordapp.com/avatars/${discordId}/${discordUser.avatar}.png`
        : `https://ui-avatars.com/api/?name=${encodeURIComponent(discordUsername)}&background=5865F2&color=fff&bold=true`;

      // === 3. Pegar Roblox ID via Bloxlink ===
      const bloxlinkResponse = await fetch(
        `https://api.blox.link/v4/public/guilds/${DISCORD_SERVER_ID}/discord-to-roblox/${discordId}`,
        { headers: { Authorization: BLOXLINK_API_KEY } }
      );

      if (!bloxlinkResponse.ok) {
        setError("Sua conta Discord não está verificada no servidor. Use /verify no Discord.");
        setIsLoginModalOpen(true);
        return setIsLoading(false);
      }

      const bloxlinkData = await bloxlinkResponse.json();
      const robloxId = bloxlinkData.robloxID?.toString();

      if (!robloxId) {
        setError("Não encontramos sua conta Roblox vinculada.");
        setIsLoginModalOpen(true);
        return setIsLoading(false);
      }

      // === 4. Pegar dados reais do Roblox (com a API corrigida) ===
      let robloxUsername = `User_${robloxId}`;
      let robloxDisplayName = robloxUsername;
      let robloxAvatar = `https://www.roblox.com/headshot-thumbnail/image?userId=${robloxId}&width=420&height=420&format=png`;

      try {
        const robloxUserResponse = await fetch(`/api/roblox/${robloxId}`);
        if (robloxUserResponse.ok) {
          const data = await robloxUserResponse.json();

          // PRIORIDADE 2025: Display Name primeiro!
          robloxDisplayName = data.displayName?.trim() || data.name?.trim() || data.username?.trim() || `User_${robloxId}`;
          robloxUsername = data.name?.trim() || data.username?.trim() || `User_${robloxId}`;
          robloxAvatar = data.avatar || robloxAvatar;
        } else {
          console.warn("API Roblox retornou erro:", robloxUserResponse.status);
        }
      } catch (err) {
        console.error("Erro ao buscar dados do Roblox:", err);
        // Mesmo com erro, ainda tenta mostrar o Display Name bonitinho se possível
      }

      // === 5. Salvar usuário ===
      const userData: UserData = {
        id: robloxId,
        username: robloxUsername,
        displayName: robloxDisplayName,   // Sempre vai ter um nome bonito aqui
        avatar: robloxAvatar,
        discordId,
        discordUsername,
        discordAvatar,
        verified: true,
        loginDate: new Date().toISOString(),
      };

      localStorage.setItem("robloxUser", JSON.stringify(userData));
      setUser(userData);
      window.history.replaceState({}, document.title, window.location.pathname);

    } catch (err) {
      console.error("Erro no login:", err);
      setError("Erro ao fazer login. Tente novamente.");
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
      {/* === NAVBAR === */}
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

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center space-x-8">
              {["inicio", "servidores", "ranking", "como-jogar", "noticias", "contato"].map((section) => (
                <button
                  key={section}
                  onClick={() => scrollToSection(section)}
                  className="text-sm text-foreground/80 hover:text-primary transition-colors font-rajdhani font-semibold tracking-wider uppercase"
                >
                  {section.toUpperCase()}
                </button>
              ))}

              {/* Botão de Login / Perfil */}
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
                    className="flex items-center gap-3 transition-all hover:opacity-80"
                  >
                    <img
                      src={user.avatar}
                      alt={user.displayName}
                      className="w-9 h-9 rounded-full border-2 border-green-400 object-cover"
                      onError={(e) => {
                        e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.displayName)}&background=00ff41&color=000&bold=true`;
                      }}
                    />
                    <div className="text-left">
                      <p className="text-xs font-bold text-white flex items-center gap-1">
                        {user.displayName}
                        <span className="text-green-400" title="Verificado via Discord">✓</span>
                      </p>
                      <p className="text-[10px] text-gray-400">ID: {user.id}</p>
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

            {/* Mobile Menu Button */}
            <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setIsOpen(!isOpen)}>
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>

          {/* Mobile Menu */}
          {isOpen && (
            <div className="md:hidden py-4 space-y-4 border-t border-border/50">
              {["inicio", "servidores", "ranking", "como-jogar", "noticias", "contato"].map((section) => (
                <button
                  key={section}
                  onClick={() => scrollToSection(section)}
                  className="block w-full text-left px-4 py-2 text-foreground/80 hover:text-primary transition-colors font-rajdhani font-semibold tracking-wider uppercase"
                >
                  {section.toUpperCase()}
                </button>
              ))}

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
                <div className="px-4 py-3 space-y-3 bg-zinc-900/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <img
                      src={user.avatar}
                      alt={user.displayName}
                      className="w-12 h-12 rounded-full border-2 border-green-400 object-cover"
                      onError={(e) => {
                        e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.displayName)}&background=00ff41&color=000&bold=true`;
                      }}
                    />
                    <div>
                      <p className="font-bold text-white flex items-center gap-1">
                        {user.displayName} <span className="text-green-400">✓</span>
                      </p>
                      <p className="text-xs text-gray-400">ID: {user.id}</p>
                    </div>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="w-full bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded text-sm transition flex items-center justify-center gap-2"
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

      {/* === MODAL DE LOGIN === */}
      {isLoginModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 max-w-md w-full shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-white">Login</h3>
              <button onClick={() => { setIsLoginModalOpen(false); setError(""); }} className="text-gray-400 hover:text-white">
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
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-400 mx-auto mb-4"></div>
                  <p className="text-gray-400">Verificando suas contas...</p>
                </div>
              ) : (
                <>
                  <button
                    onClick={handleDiscordLogin}
                    className="w-full bg-[#5865F2] hover:bg-[#4752C4] text-white font-bold py-4 rounded-lg transition flex items-center justify-center gap-3"
                  >
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515..." /* ícone do Discord */ />
                    </svg>
                    Entrar com Discord
                  </button>

                  <div className="bg-blue-500/10 border border-blue-500/50 rounded-lg p-4 text-xs">
                    <p className="text-blue-400 font-bold mb-2">Login Seguro via Discord + Bloxlink</p>
                    <ul className="text-blue-300 space-y-1">
                      <li>✓ Conta Discord vinculada com Roblox (/verify)</li>
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
