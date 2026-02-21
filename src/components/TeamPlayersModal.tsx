import { useEffect } from "react";
import { X, Users, Wallet, Star } from "lucide-react";
import { Team, Player, formatCurrency } from "@/data/auctionData";

interface TeamPlayersModalProps {
    team: Team;
    players: Player[];
    onClose: () => void;
}

const positionColors: Record<string, { bg: string; text: string }> = {
    "Outside Hitter": { bg: "#DBEAFE", text: "#1D4ED8" },
    "Setter": { bg: "#EDE9FE", text: "#6D28D9" },
    "Libero": { bg: "#D1FAE5", text: "#065F46" },
    "Middle Blocker": { bg: "#FFEDD5", text: "#C2410C" },
    "Opposite": { bg: "#FEE2E2", text: "#B91C1C" },
    "Defensive Specialist": { bg: "#CCFBF1", text: "#0F766E" },
};

const TeamPlayersModal = ({ team, players, onClose }: TeamPlayersModalProps) => {
    // Close on Escape key
    useEffect(() => {
        const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
        window.addEventListener("keydown", handler);
        return () => window.removeEventListener("keydown", handler);
    }, [onClose]);

    // Prevent body scroll
    useEffect(() => {
        document.body.style.overflow = "hidden";
        return () => { document.body.style.overflow = ""; };
    }, []);

    const teamPlayers = players.filter(p => p.teamId === team.id);
    const budgetUsedPct = Math.round((team.spent / team.budget) * 100);
    const remaining = team.budget - team.spent;

    return (
        /* Backdrop */
        <div
            className="fixed inset-0 z-[100] flex items-center justify-center p-4"
            style={{ backgroundColor: "rgba(0,0,0,0.65)", backdropFilter: "blur(6px)" }}
            onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
        >
            {/* Modal */}
            <div
                className="relative w-full max-w-2xl max-h-[90vh] flex flex-col rounded-2xl border border-border bg-card shadow-2xl overflow-hidden"
                style={{ animation: "modalIn 0.22s cubic-bezier(.4,0,.2,1)" }}
            >
                {/* Header with team color */}
                <div
                    className="px-6 py-5 flex items-center justify-between"
                    style={{ background: `linear-gradient(135deg, ${team.color}22, ${team.color}08)`, borderBottom: `3px solid ${team.color}` }}
                >
                    <div className="flex items-center gap-4">
                        <div
                            className="flex h-16 w-16 items-center justify-center rounded-2xl text-3xl shadow"
                            style={{ backgroundColor: `${team.color}20`, border: `2px solid ${team.color}40` }}
                        >
                            {team.logo}
                        </div>
                        <div>
                            <h2 className="font-display text-2xl font-bold text-foreground">{team.name}</h2>
                            <div className="flex items-center gap-2 mt-1">
                                <span
                                    className="rounded-full px-2 py-0.5 text-xs font-bold"
                                    style={{ backgroundColor: `${team.color}20`, color: team.color }}
                                >
                                    {team.shortName}
                                </span>
                                <span className="text-sm text-muted-foreground">{team.city}</span>
                            </div>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="flex h-9 w-9 items-center justify-center rounded-full bg-secondary border border-border text-muted-foreground hover:text-foreground hover:bg-secondary/80 transition"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Team summary bar */}
                <div className="grid grid-cols-3 divide-x divide-border border-b border-border">
                    <div className="px-5 py-3 flex items-center gap-2">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <div>
                            <p className="text-xs text-muted-foreground">Players</p>
                            <p className="font-display font-bold text-lg text-foreground">{teamPlayers.length}</p>
                        </div>
                    </div>
                    <div className="px-5 py-3 flex items-center gap-2">
                        <Wallet className="h-4 w-4 text-muted-foreground" />
                        <div>
                            <p className="text-xs text-muted-foreground">Spent</p>
                            <p className="font-display font-bold text-lg" style={{ color: team.color }}>{formatCurrency(team.spent)}</p>
                        </div>
                    </div>
                    <div className="px-5 py-3 flex items-center gap-2">
                        <Star className="h-4 w-4 text-muted-foreground" />
                        <div>
                            <p className="text-xs text-muted-foreground">Remaining</p>
                            <p className="font-display font-bold text-lg text-foreground">{formatCurrency(remaining)}</p>
                        </div>
                    </div>
                </div>

                {/* Budget bar */}
                <div className="px-6 py-3 border-b border-border bg-secondary/20">
                    <div className="flex justify-between text-xs text-muted-foreground mb-1.5">
                        <span>Budget Used</span>
                        <span className="font-medium text-foreground">{budgetUsedPct}%</span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
                        <div
                            className="h-full rounded-full transition-all duration-700"
                            style={{ width: `${budgetUsedPct}%`, backgroundColor: team.color }}
                        />
                    </div>
                </div>

                {/* Players list — scrollable */}
                <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3">
                    {teamPlayers.length === 0 ? (
                        <div className="py-16 text-center text-muted-foreground">
                            <p className="text-5xl mb-3">🏐</p>
                            <p className="font-display text-lg font-semibold">No players yet</p>
                            <p className="text-sm mt-1">This team hasn't bought any players in the auction.</p>
                        </div>
                    ) : (
                        teamPlayers.map((player, idx) => {
                            const posStyle = positionColors[player.position] ?? { bg: "#F3F4F6", text: "#374151" };
                            return (
                                <div
                                    key={player.id}
                                    className="flex items-center gap-4 rounded-xl border border-border bg-background p-4 hover:bg-secondary/30 transition-colors"
                                    style={{ animationDelay: `${idx * 40}ms` }}
                                >
                                    {/* Rank */}
                                    <span className="text-xs text-muted-foreground font-mono w-5 text-center">#{idx + 1}</span>

                                    {/* Avatar */}
                                    <div
                                        className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl text-sm font-bold text-primary-foreground shadow-sm"
                                        style={{ backgroundColor: team.color }}
                                    >
                                        {player.avatar}
                                    </div>

                                    {/* Info */}
                                    <div className="flex-1 min-w-0">
                                        <p className="font-semibold text-foreground truncate">{player.name}</p>
                                        <p className="text-xs text-muted-foreground">{player.nationality} · Age {player.age}</p>
                                    </div>

                                    {/* Position */}
                                    <span
                                        className="hidden sm:inline-flex rounded-full px-2 py-0.5 text-xs font-medium flex-shrink-0"
                                        style={{ backgroundColor: posStyle.bg, color: posStyle.text }}
                                    >
                                        {player.position}
                                    </span>

                                    {/* Rating */}
                                    <div className="flex items-center gap-1 flex-shrink-0">
                                        <Star className="h-3.5 w-3.5 text-amber-400 fill-amber-400" />
                                        <span className={`font-display font-bold text-sm ${player.rating >= 90 ? "text-accent" : "text-foreground"}`}>
                                            {player.rating}
                                        </span>
                                    </div>

                                    {/* Sold price */}
                                    <div className="text-right flex-shrink-0">
                                        <p className="font-display font-bold text-sm" style={{ color: team.color }}>
                                            {player.soldPrice ? formatCurrency(player.soldPrice) : "—"}
                                        </p>
                                        <p className="text-[10px] text-muted-foreground">sold for</p>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>

                {/* Footer */}
                <div className="border-t border-border px-6 py-3 flex items-center justify-between bg-secondary/10">
                    <p className="text-xs text-muted-foreground">
                        {teamPlayers.length} player{teamPlayers.length !== 1 ? "s" : ""} · Total: {formatCurrency(team.budget)} budget
                    </p>
                    <button
                        onClick={onClose}
                        className="rounded-lg bg-secondary border border-border px-4 py-1.5 text-sm font-medium text-foreground hover:bg-secondary/80 transition"
                    >
                        Close
                    </button>
                </div>
            </div>

            <style>{`
        @keyframes modalIn {
          from { opacity: 0; transform: scale(0.95) translateY(10px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }
      `}</style>
        </div>
    );
};

export default TeamPlayersModal;
