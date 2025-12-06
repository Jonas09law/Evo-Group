import { useState, useEffect } from "react";
import { Menu, X, User, LogOut, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAdminCheck } from "@/components/hooks/useAdminCheck";

import EvoLogo from "@/assets/AAAAAA.png"; 

const DISCORD_CLIENT_ID = "1399455643265536051"; 
const DISCORD_REDIRECT_URI = "https://evo-group.vercel.app/"; 

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
    
    // Admin check
    const adminStatus = useAdminCheck(user?.discordId || null);

    const handleDiscordCallback = async (code: string) => {
        setIsLoading(true);
        setError("");

        try {
            const tokenResponse = await fetch("/api/discord/exchange-token", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ code }),
            });

            if (!tokenResponse.ok) {
                throw new Error("Falha ao obter token do Discord.");
            }

            const { access_token } = await tokenResponse.json();

            const discordUserRes = await fetch("https://discord.com/api/users/@me", {
                headers: { Authorization: `Bearer ${access_token}` },
            });

            if (!discordUserRes.ok) {
                throw new Error("Falha ao buscar usuário Discord.");
            }

            const discordUser = await discordUserRes.json();
            const discordId = discordUser.id;

            const discordAvatar = discordUser.avatar
                ? `https://cdn.discordapp.com/avatars/${discordId}/${discordUser.avatar}.png`
                : `https://ui-avatars.com/api/?name=${encodeURIComponent(discordUser.username)}&background=5865F2&color=fff`;

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

            try {
                const robloxRes = await fetch(`/api/roblox/${robloxId}`);
                if (robloxRes.ok) {
                    const data = await robloxRes.json();
                    robloxUsername = data.displayname || data.name || robloxUsername;
                    robloxAvatar = data.avatar || robloxAvatar;
                }
            } catch (err) {

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
        } catch (err: any) {
            setError(err.message || "Erro no login.");
            setIsLoginModalOpen(true);
            window.history.replaceState({}, document.title, window.location.pathname);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        const savedUser = localStorage.getItem("robloxUser");
        if (savedUser) setUser(JSON.parse(savedUser));

        const params = new URLSearchParams(window.location.search);
        const code = params.get("code");
        const urlState = params.get("state");
        const savedState = localStorage.getItem("oauth_state");

        if (code) {
            if (!urlState || urlState !== savedState || !savedState) {
                setError("Erro no processo de autenticação (Violação de segurança).");
                setIsLoginModalOpen(true);
                window.history.replaceState({}, document.title, window.location.pathname);
            } else {
                handleDiscordCallback(code);
            }
            localStorage.removeItem("oauth_state"); 
        }
    }, []);

    const scrollToSection = (id: string) => {
        const el = document.getElementById(id);
        if (el) {
            el.scrollIntoView({ behavior: "smooth" });
            setIsOpen(false);
        }
    };

    const navigateToAdmin = () => {
        window.location.href = '/admin';
        setIsOpen(false);
    };

    const handleDiscordLogin = () => {
        const state = Math.random().toString(36).substring(2); 
        localStorage.setItem("oauth_state", state);

        const url = `https://discord.com/api/oauth2/authorize?client_id=${DISCORD_CLIENT_ID}&redirect_uri=${encodeURIComponent(DISCORD_REDIRECT_URI)}&response_type=code&scope=identify&state=${state}`;
        window.location.href = url;
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
                            {["inicio","servidores","ranking","como-jogar","noticias","contato"].map(section => (
                                <button
                                    key={section}
                                    onClick={() => scrollToSection(section)}
                                    className="text-sm text-foreground/80 hover:text-primary transition-colors font-rajdhani font-semibold tracking-wider uppercase"
                                >
                                    {section.toUpperCase()}
                                </button>
                            ))}

                            {/* Admin Link - Only show if user is admin */}
                            {adminStatus.isAdmin && !adminStatus.loading && (
                                <button
                                    onClick={navigateToAdmin}
                                    className="text-sm text-red-400 hover:text-red-300 transition-colors font-rajdhani font-semibold tracking-wider uppercase flex items-center gap-2"
                                >
                                    <Shield className="w-4 h-4" />
                                    ADMIN
                                </button>
                            )}

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
                                                e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.username)}&background=00ff41&color=000&bold=true`;
                                            }}
                                        />
                                        <div className="text-left">
                                            <p className="text-xs font-bold text-white leading-tight flex items-center gap-1">
                                                {user.username}
                                                <span className="text-green-400" title="Verificado via Discord">✓</span>
                                                {adminStatus.isAdmin && (
                                                    <span className="text-red-400 ml-1" title="Admin">
                                                        <Shield className="w-3 h-3 inline" />
                                                    </span>
                                                )}
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
                                                <LogOut className="w-4 h-4" /> Sair
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
                            {["inicio","servidores","ranking","como-jogar","noticias","contato"].map(section => (
                                <button
                                    key={section}
                                    onClick={() => scrollToSection(section)}
                                    className="block w-full text-left px-4 py-2 text-foreground/80 hover:text-primary transition-colors font-rajdhani font-semibold tracking-wider uppercase"
                                >
                                    {section.toUpperCase()}
                                </button>
                            ))}

                            {/* Admin Link Mobile */}
                            {adminStatus.isAdmin && !adminStatus.loading && (
                                <button
                                    onClick={navigateToAdmin}
                                    className="block w-full text-left px-4 py-2 text-red-400 hover:text-red-300 transition-colors font-rajdhani font-semibold tracking-wider uppercase"
                                >
                                    <Shield className="w-4 h-4 inline mr-2" />
                                    ADMIN
                                </button>
                            )}

                            {!user ? (
                                <button
                                    onClick={() => { setIsLoginModalOpen(true); setIsOpen(false); }}
                                    className="flex items-center gap-2 w-full px-4 py-2 text-white hover:text-green-400 transition font-bold text-sm uppercase"
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
                                                e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.username)}&background=00ff41&color=000&bold=true`;
                                            }}
                                        />
                                        <div>
                                            <p className="text-sm font-bold text-white flex items-center gap-1">
                                                {user.username} 
                                                <span className="text-green-400">✓</span>
                                                {adminStatus.isAdmin && (
                                                    <span className="text-red-400 ml-1">
                                                        <Shield className="w-3 h-3 inline" />
                                                    </span>
                                                )}
                                            </p>
                                            <p className="text-xs text-gray-400">ID: {user.id}</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={handleLogout}
                                        className="w-full bg-red-600 text-white px-4 py-2 rounded text-sm hover:bg-red-700 transition flex items-center justify-center gap-2"
                                    >
                                        <LogOut className="w-4 h-4" /> Sair
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
                            <h3 className="text-2xl font-bold text-white">Login</h3>
                            <button
                                onClick={() => { setIsLoginModalOpen(false); setError(""); }}
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
                                <button
                                    onClick={handleDiscordLogin}
                                    className="w-full bg-[#5865F2] hover:bg-[#4752C4] text-white font-bold py-4 rounded-lg transition flex items-center justify-center gap-3"
                                >
                                    Entrar com Discord
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};
