import { useState, useEffect } from "react";
import { formatCurrency, Team, Player } from "@/data/auctionData";
import { Gavel, Timer, TrendingUp, Users, Eye, Wifi, WifiOff } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { SaleInfo } from "@/context/AuctionContext";
import SoldOverlay from "@/components/SoldOverlay";
import { initialTeams } from "@/data/auctionData";

// ── Types for the synced state from Supabase ─────────────────────────────────

interface SyncedBidEntry {
    teamId: number;
    teamName: string;
    teamShortName: string;
    teamColor: string;
    teamLogo: string;
    amount: number;
    timestamp: string;
}

interface SyncedAuctionState {
    players: Player[];
    teams: Team[];
    livePlayer: Player | null;
    currentBid: number;
    currentBidder: Team | null;
    timeLeft: number;
    bidHistory: SyncedBidEntry[];
    bidsCount: number;
    auctionRunning: boolean;
    biddingStarted: boolean;
    lastSale: SaleInfo | null;
}

// ── Hook to subscribe to real-time auction state ─────────────────────────────

const useRealtimeAuction = () => {
    const [state, setState] = useState<SyncedAuctionState | null>(null);
    const [connected, setConnected] = useState(false);

    useEffect(() => {
        // 1. Fetch initial state
        const fetchInitial = async () => {
            const { data } = await supabase
                .from("auction_state")
                .select("state")
                .eq("id", 1)
                .single();
            if (data?.state) {
                setState(data.state as SyncedAuctionState);
            }
            setConnected(true);
        };
        fetchInitial();

        // 2. Subscribe to realtime changes
        const channel = supabase
            .channel("auction-realtime")
            .on(
                "postgres_changes",
                { event: "UPDATE", schema: "public", table: "auction_state", filter: "id=eq.1" },
                (payload) => {
                    if (payload.new?.state) {
                        setState(payload.new.state as SyncedAuctionState);
                    }
                }
            )
            .subscribe((status) => {
                setConnected(status === "SUBSCRIBED");
            });

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    return { state, connected };
};

// ── Team Login ───────────────────────────────────────────────────────────────

const TeamLogin = ({ onLogin, teams }: { onLogin: (team: Team) => void; teams: Team[] }) => {
    return (
        <div className="min-h-screen bg-background flex items-center justify-center px-4">
            <div className="w-full max-w-lg">
                <div className="text-center mb-8">
                    <span className="text-5xl mb-4 block">🏐</span>
                    <h1 className="font-display text-3xl font-bold">Team Login</h1>
                    <p className="text-muted-foreground mt-2">Select your team to view the live auction</p>
                </div>

                <div className="grid gap-3">
                    {teams.map((team) => (
                        <button
                            key={team.id}
                            onClick={() => onLogin(team)}
                            className="flex items-center gap-4 p-4 rounded-xl border border-border bg-card hover:bg-card/80 transition-all hover:scale-[1.02] hover:shadow-lg group"
                        >
                            <div
                                className="h-14 w-14 rounded-xl flex items-center justify-center text-2xl shrink-0"
                                style={{ backgroundColor: `${team.color}20`, border: `2px solid ${team.color}40` }}
                            >
                                {team.logo}
                            </div>
                            <div className="text-left flex-1">
                                <h3 className="font-display font-bold text-lg" style={{ color: team.color }}>
                                    {team.name}
                                </h3>
                                <p className="text-xs text-muted-foreground">{team.shortName} · {team.city}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-xs text-muted-foreground">Budget</p>
                                <p className="font-display font-bold text-sm">{formatCurrency(team.budget)}</p>
                            </div>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};

// ── Team Live Viewer ─────────────────────────────────────────────────────────

const TeamLiveView = ({ teamId, auctionState, connected }: {
    teamId: number;
    auctionState: SyncedAuctionState;
    connected: boolean;
}) => {
    const {
        teams,
        players,
        livePlayer,
        currentBid,
        currentBidder,
        timeLeft,
        bidHistory,
        bidsCount,
        biddingStarted,
        lastSale,
    } = auctionState;

    const team = teams.find((t) => t.id === teamId) || initialTeams.find((t) => t.id === teamId)!;
    const teamPlayers = players.filter((p) => p.teamId === team.id && p.status === "sold");

    const timerPercent = biddingStarted ? (timeLeft / 180) * 100 : 100;
    const timerColor = !biddingStarted
        ? "#16A34A"
        : timeLeft > 90 ? "#16A34A" : timeLeft > 30 ? "#EAB308" : "#DC2626";

    const isMyBid = currentBidder?.id === team.id;

    return (
        <div className="min-h-screen bg-background">
            {lastSale && <SoldOverlay sale={lastSale} />}

            {/* Team header */}
            <div className="gradient-hero px-6 py-4">
                <div className="container mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div
                            className="h-10 w-10 rounded-lg flex items-center justify-center text-xl"
                            style={{ backgroundColor: `${team.color}30`, border: `2px solid ${team.color}50` }}
                        >
                            {team.logo}
                        </div>
                        <div>
                            <h1 className="font-display font-bold text-primary-foreground text-lg">{team.name}</h1>
                            <p className="text-primary-foreground/50 text-xs">{team.shortName} · Viewer Mode</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        {/* Connection indicator */}
                        <div className="flex items-center gap-1.5">
                            {connected ? (
                                <Wifi className="h-4 w-4 text-green-400" />
                            ) : (
                                <WifiOff className="h-4 w-4 text-red-400 animate-pulse" />
                            )}
                            <span className="text-[10px] text-primary-foreground/50">
                                {connected ? "LIVE" : "Connecting..."}
                            </span>
                        </div>
                        <div className="text-right">
                            <p className="text-primary-foreground/50 text-[10px] uppercase tracking-wider">Remaining</p>
                            <p className="font-display font-bold text-primary-foreground">{formatCurrency(team.budget - team.spent)}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-primary-foreground/50 text-[10px] uppercase tracking-wider">Players</p>
                            <p className="font-display font-bold text-primary-foreground">{teamPlayers.length}</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 py-6 space-y-6">
                {/* Live status */}
                <div className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full bg-destructive pulse-live" />
                    <span className="font-display text-sm font-semibold tracking-widest text-accent uppercase">
                        LIVE AUCTION
                    </span>
                    <Eye className="h-4 w-4 text-muted-foreground ml-1" />
                    <span className="text-xs text-muted-foreground">Viewing Only</span>
                </div>

                {!livePlayer ? (
                    <div className="rounded-xl border border-border bg-card shadow-card p-12 text-center">
                        <p className="text-5xl mb-4">🏆</p>
                        <h3 className="font-display text-2xl font-bold mb-2">Auction Complete!</h3>
                        <p className="text-muted-foreground">All players have been auctioned.</p>
                    </div>
                ) : (
                    <div className="grid gap-6 lg:grid-cols-3">
                        {/* Main auction card */}
                        <div className="lg:col-span-2 rounded-xl overflow-hidden border border-border shadow-card">
                            <div className="gradient-hero px-6 py-4 flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Gavel className="h-4 w-4 text-accent" />
                                    <span className="font-display font-semibold text-primary-foreground text-sm">
                                        Current Player
                                    </span>
                                </div>

                                {/* Timer */}
                                <div className="relative flex items-center justify-center h-14 w-14">
                                    <svg className="absolute inset-0 h-14 w-14 -rotate-90" viewBox="0 0 56 56">
                                        <circle cx="28" cy="28" r="24" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="4" />
                                        <circle
                                            cx="28" cy="28" r="24"
                                            fill="none"
                                            stroke={timerColor}
                                            strokeWidth="4"
                                            strokeDasharray={`${2 * Math.PI * 24}`}
                                            strokeDashoffset={`${2 * Math.PI * 24 * (1 - timerPercent / 100)}`}
                                            strokeLinecap="round"
                                            style={{ transition: "stroke-dashoffset 1s linear, stroke 0.5s" }}
                                        />
                                    </svg>
                                    <div className="flex flex-col items-center">
                                        {biddingStarted ? (
                                            <>
                                                <span className="font-display font-bold text-white text-lg leading-none">{timeLeft}</span>
                                                <span className="text-white/50 text-[9px]">sec</span>
                                            </>
                                        ) : (
                                            <span className="font-display font-bold text-white/60 text-[10px] leading-tight text-center">WAIT</span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Player info */}
                            <div className="bg-card p-6">
                                <div className="flex items-start gap-5">
                                    <div className="h-20 w-20 rounded-xl flex items-center justify-center text-2xl font-display font-bold bg-secondary text-foreground shrink-0">
                                        {livePlayer.avatar}
                                    </div>
                                    <div className="flex-1">
                                        <h2 className="font-display text-2xl font-bold">{livePlayer.name}</h2>
                                        <p className="text-sm text-muted-foreground mt-1">
                                            {livePlayer.position} · {livePlayer.nationality} · Age {livePlayer.age}
                                        </p>
                                        <div className="flex items-center gap-1 mt-2">
                                            <span className="text-xs text-muted-foreground">Rating</span>
                                            <span className="font-display font-bold text-accent text-sm">{livePlayer.rating}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Bid stats */}
                                <div className="grid grid-cols-3 gap-3 mt-6">
                                    <div className="rounded-lg bg-secondary/50 p-3 text-center">
                                        <TrendingUp className="h-4 w-4 text-accent mx-auto" />
                                        <p className="font-display text-lg font-bold text-accent mt-1">{formatCurrency(currentBid)}</p>
                                        <p className="text-xs text-muted-foreground">Current Bid</p>
                                    </div>
                                    <div className="rounded-lg bg-secondary/50 p-3 text-center">
                                        <Users className="h-4 w-4 text-accent mx-auto" />
                                        <p className="font-display text-lg font-bold mt-1" style={currentBidder ? { color: currentBidder.color } : {}}>
                                            {currentBidder ? currentBidder.shortName : "—"}
                                        </p>
                                        <p className="text-xs text-muted-foreground">Leading</p>
                                    </div>
                                    <div className="rounded-lg bg-secondary/50 p-3 text-center">
                                        <Timer className="h-4 w-4 text-accent mx-auto" />
                                        <p className="font-display text-lg font-bold mt-1" style={{ color: timerColor }}>{timeLeft}s</p>
                                        <p className="text-xs text-muted-foreground">Remaining</p>
                                    </div>
                                </div>

                                {/* My team status */}
                                {isMyBid && (
                                    <div
                                        className="mt-4 rounded-lg p-3 text-center font-display font-bold text-sm animate-pulse"
                                        style={{ backgroundColor: `${team.color}20`, color: team.color, border: `2px solid ${team.color}40` }}
                                    >
                                        🎯 Your team is the HIGHEST BIDDER!
                                    </div>
                                )}

                                {/* Base price info */}
                                <div className="mt-4 text-center">
                                    <span className="text-xs text-muted-foreground">Base Price: </span>
                                    <span className="text-xs font-bold">{formatCurrency(livePlayer.basePrice)}</span>
                                    <span className="text-xs text-muted-foreground ml-3">Bids: </span>
                                    <span className="text-xs font-bold">{bidsCount}</span>
                                </div>
                            </div>
                        </div>

                        {/* Bid history sidebar */}
                        <div className="rounded-xl border border-border bg-card shadow-card overflow-hidden flex flex-col">
                            <div className="px-5 py-3 border-b border-border bg-secondary/30">
                                <h3 className="font-display text-sm font-semibold uppercase tracking-wider">Bid History</h3>
                            </div>
                            <div className="flex-1 overflow-y-auto max-h-[400px] divide-y divide-border">
                                {bidHistory.length === 0 ? (
                                    <div className="p-6 text-center text-sm text-muted-foreground">
                                        Waiting for first bid…
                                    </div>
                                ) : (
                                    bidHistory.map((bid, idx) => (
                                        <div
                                            key={idx}
                                            className={`px-5 py-3 flex items-center gap-3 ${idx === 0 ? "bg-accent/5" : ""}`}
                                        >
                                            <div
                                                className="h-8 w-8 rounded-lg flex items-center justify-center text-xs font-bold shrink-0"
                                                style={{
                                                    backgroundColor: `${bid.teamColor}20`,
                                                    color: bid.teamColor,
                                                    border: `1.5px solid ${bid.teamColor}50`,
                                                }}
                                            >
                                                {bid.teamShortName}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-semibold truncate">{bid.teamName}</p>
                                                <p className="text-[10px] text-muted-foreground">
                                                    {new Date(bid.timestamp).toLocaleTimeString()}
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-sm font-display font-bold text-accent">
                                                    {formatCurrency(bid.amount)}
                                                </p>
                                                {idx === 0 && <p className="text-xs text-accent">Highest</p>}
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* My squad */}
                {teamPlayers.length > 0 && (
                    <section>
                        <h2 className="font-display text-xl font-bold mb-3">My Squad ({teamPlayers.length})</h2>
                        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                            {teamPlayers.map((p) => (
                                <div
                                    key={p.id}
                                    className="rounded-xl border p-4 flex items-center gap-3"
                                    style={{ borderColor: `${team.color}30`, backgroundColor: `${team.color}08` }}
                                >
                                    <div className="h-10 w-10 rounded-lg bg-secondary flex items-center justify-center font-display font-bold text-sm">
                                        {p.avatar}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-semibold text-sm truncate">{p.name}</p>
                                        <p className="text-xs text-muted-foreground">{p.position}</p>
                                    </div>
                                    <p className="font-display font-bold text-sm text-accent">{formatCurrency(p.soldPrice || 0)}</p>
                                </div>
                            ))}
                        </div>
                    </section>
                )}
            </div>
        </div>
    );
};

// ── Loading state ────────────────────────────────────────────────────────────

const LoadingScreen = () => (
    <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
            <div className="h-12 w-12 border-4 border-accent/30 border-t-accent rounded-full animate-spin mx-auto mb-4" />
            <p className="font-display text-lg font-semibold">Connecting to Live Auction...</p>
            <p className="text-sm text-muted-foreground mt-1">Syncing with Supabase Realtime</p>
        </div>
    </div>
);

// ── Main TeamPage ────────────────────────────────────────────────────────────

const TeamPage = () => {
    const { state: auctionState, connected } = useRealtimeAuction();
    const [loggedInTeamId, setLoggedInTeamId] = useState<number | null>(null);

    // Use teams from synced state, or fallback to initial data
    const teams = auctionState?.teams || initialTeams;

    if (!auctionState) {
        return <LoadingScreen />;
    }

    if (loggedInTeamId === null) {
        return (
            <TeamLogin
                teams={teams}
                onLogin={(team) => setLoggedInTeamId(team.id)}
            />
        );
    }

    return (
        <TeamLiveView
            teamId={loggedInTeamId}
            auctionState={auctionState}
            connected={connected}
        />
    );
};

export default TeamPage;
