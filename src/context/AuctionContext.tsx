import React, {
    createContext,
    useContext,
    useState,
    useEffect,
    useRef,
    useCallback,
} from "react";
import {
    Player,
    Team,
    BidEntry,
    initialPlayers,
    initialTeams,
} from "@/data/auctionData";
import { supabase } from "@/lib/supabase";

// ─── Context Shape ───────────────────────────────────────────────────────────

export interface SaleInfo {
    playerName: string;
    playerAvatar: string;
    teamName: string;
    teamLogo: string;
    teamColor: string;
    soldPrice: number;
}

interface AuctionContextType {
    // State
    players: Player[];
    teams: Team[];
    livePlayer: Player | null;
    currentBid: number;
    currentBidder: Team | null;
    timeLeft: number;
    bidHistory: BidEntry[];
    bidsCount: number;
    auctionRunning: boolean;
    biddingStarted: boolean;
    lastSale: SaleInfo | null;

    // Actions
    placeBid: (teamId: number) => void;
    undoBid: () => void;
    sellPlayer: () => void;
    markUnsold: () => void;
    nextPlayer: () => void;
    startAuction: () => void;
    pauseAuction: () => void;
    resetAuction: () => void;
}

// ─── Context ─────────────────────────────────────────────────────────────────

const AuctionContext = createContext<AuctionContextType | null>(null);

export const useAuction = (): AuctionContextType => {
    const ctx = useContext(AuctionContext);
    if (!ctx) throw new Error("useAuction must be used inside <AuctionProvider>");
    return ctx;
};

// ─── Provider ────────────────────────────────────────────────────────────────

const TIMER_SECONDS = 180;
const BID_INCREMENT = 100_000;

export const AuctionProvider: React.FC<{ children: React.ReactNode }> = ({
    children,
}) => {
    const [players, setPlayers] = useState<Player[]>(() =>
        initialPlayers.map((p) => ({ ...p }))
    );
    const [teams, setTeams] = useState<Team[]>(() =>
        initialTeams.map((t) => ({ ...t }))
    );

    // Queue: players that still need to be auctioned
    const [queue, setQueue] = useState<Player[]>(() =>
        initialPlayers.filter((p) => p.status === "available")
    );

    const [livePlayer, setLivePlayer] = useState<Player | null>(null);
    const [currentBid, setCurrentBid] = useState(0);
    const [currentBidder, setCurrentBidder] = useState<Team | null>(null);
    const [timeLeft, setTimeLeft] = useState(TIMER_SECONDS);
    const [bidHistory, setBidHistory] = useState<BidEntry[]>([]);
    const [bidsCount, setBidsCount] = useState(0);
    const [auctionRunning, setAuctionRunning] = useState(false);
    const [biddingStarted, setBiddingStarted] = useState(false);
    const [lastSale, setLastSale] = useState<SaleInfo | null>(null);

    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

    // ── Helpers ────────────────────────────────────────────────────────────────

    const stopTimer = useCallback(() => {
        if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
        }
    }, []);

    const startTimer = useCallback(() => {
        stopTimer();
        timerRef.current = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    stopTimer();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
    }, [stopTimer]);

    // Load the next player from the queue onto the live stage
    const loadNextPlayer = useCallback((q: Player[]) => {
        if (q.length === 0) {
            // Check if there are unsold players to re-auction
            setPlayers((prevPlayers) => {
                const unsold = prevPlayers.filter((p) => p.status === "unsold");
                if (unsold.length > 0) {
                    // Reset unsold players to "available" for the next round
                    const updated = prevPlayers.map((p) =>
                        p.status === "unsold" ? { ...p, status: "available" as const } : p
                    );
                    // Queue all unsold players
                    const [first, ...rest] = unsold.map((p) => ({
                        ...p,
                        status: "available" as const,
                    }));
                    setQueue(rest);

                    // Load the first unsold player onto the stage
                    setLivePlayer({ ...first, status: "live" });
                    setCurrentBid(first.basePrice);
                    setCurrentBidder(null);
                    setBidHistory([]);
                    setBidsCount(0);
                    setTimeLeft(TIMER_SECONDS);
                    setBiddingStarted(false);

                    return updated.map((p) =>
                        p.id === first.id ? { ...p, status: "live" as const } : p
                    );
                }

                // No unsold players — auction is truly complete
                setLivePlayer(null);
                setAuctionRunning(false);
                return prevPlayers;
            });
            return;
        }
        const [next, ...rest] = q;
        setQueue(rest);

        // Mark as live in the master list
        setPlayers((prev) =>
            prev.map((p) => (p.id === next.id ? { ...p, status: "live" } : p))
        );

        setLivePlayer({ ...next, status: "live" });
        setCurrentBid(next.basePrice);
        setCurrentBidder(null);
        setBidHistory([]);
        setBidsCount(0);
        setTimeLeft(TIMER_SECONDS);
        setBiddingStarted(false);
    }, []);

    // ── Actions ────────────────────────────────────────────────────────────────

    const startAuction = useCallback(() => {
        if (auctionRunning) return;

        // If nothing is loaded yet, load the first player
        if (!livePlayer) {
            const available = players.filter((p) => p.status === "available");
            if (available.length === 0) return;
            const [first, ...rest] = available;
            setQueue(rest);
            setPlayers((prev) =>
                prev.map((p) => (p.id === first.id ? { ...p, status: "live" } : p))
            );
            setLivePlayer({ ...first, status: "live" });
            setCurrentBid(first.basePrice);
            setCurrentBidder(null);
            setBidHistory([]);
            setBidsCount(0);
            setTimeLeft(TIMER_SECONDS);
            setBiddingStarted(false);
        }

        setAuctionRunning(true);
        // Timer does NOT start here — it starts on the first bid
    }, [auctionRunning, livePlayer, players]);

    const pauseAuction = useCallback(() => {
        setAuctionRunning(false);
        stopTimer();
    }, [stopTimer]);

    const placeBid = useCallback(
        (teamId: number) => {
            // Before first bid: only check auctionRunning (timer hasn't started yet)
            // After first bid: also check timeLeft > 0
            if (!auctionRunning || !livePlayer) return;
            if (biddingStarted && timeLeft === 0) return;

            const team = teams.find((t) => t.id === teamId);
            if (!team) return;

            const isFirstBid = bidHistory.length === 0;
            const increment = currentBid >= 3_000_000 ? 200_000 : BID_INCREMENT;
            const newBid = isFirstBid ? livePlayer.basePrice : currentBid + increment;

            const remaining = team.budget - team.spent;
            if (remaining < newBid) return;
            if (currentBidder?.id === teamId) return; // already leading

            setCurrentBid(newBid);
            setCurrentBidder(team);
            setBidHistory((prev) => [
                { team, amount: newBid, timestamp: new Date() },
                ...prev,
            ]);
            setBidsCount((c) => c + 1);
            setBiddingStarted(true);

            // Reset timer and start/restart the countdown
            setTimeLeft(TIMER_SECONDS);
            startTimer();
        },
        [auctionRunning, biddingStarted, timeLeft, livePlayer, teams, currentBid, currentBidder, startTimer]
    );

    const undoBid = useCallback(() => {
        if (!livePlayer || bidHistory.length === 0) return;

        // Drop the most-recent bid
        const [, ...remaining] = bidHistory;

        if (remaining.length === 0) {
            // No bids left — go back to base price, no bidder
            setCurrentBid(livePlayer.basePrice);
            setCurrentBidder(null);
            // All bids undone → stop timer, back to "waiting for first bid"
            setBiddingStarted(false);
            stopTimer();
            setTimeLeft(TIMER_SECONDS);
        } else {
            // Restore to the previous highest bid
            const prev = remaining[0];
            setCurrentBid(prev.amount);
            setCurrentBidder(prev.team);
            // Reset timer since bid state changed
            setTimeLeft(TIMER_SECONDS);
            if (auctionRunning) startTimer();
        }

        setBidHistory(remaining);
        setBidsCount((c) => Math.max(0, c - 1));
    }, [livePlayer, bidHistory, auctionRunning, startTimer, stopTimer]);

    const sellPlayer = useCallback(() => {
        if (!livePlayer || !currentBidder) return;
        stopTimer();

        const soldPrice = currentBid;
        const buyerTeam = currentBidder;

        // Show the sold overlay
        setLastSale({
            playerName: livePlayer.name,
            playerAvatar: livePlayer.avatar,
            teamName: buyerTeam.name,
            teamLogo: buyerTeam.logo,
            teamColor: buyerTeam.color,
            soldPrice,
        });

        // Update player
        setPlayers((prev) =>
            prev.map((p) =>
                p.id === livePlayer.id
                    ? {
                        ...p,
                        status: "sold",
                        soldPrice,
                        teamId: buyerTeam.id,
                    }
                    : p
            )
        );

        // Update team
        setTeams((prev) =>
            prev.map((t) =>
                t.id === buyerTeam.id
                    ? {
                        ...t,
                        spent: t.spent + soldPrice,
                        players: [...t.players, livePlayer.id],
                    }
                    : t
            )
        );

        // Delay next player so the 'SOLD' celebration is visible
        setAuctionRunning(false);
        setTimeout(() => {
            setLastSale(null);
            loadNextPlayer(queue);
            setAuctionRunning(true);
        }, 5000);
    }, [livePlayer, currentBidder, currentBid, queue, stopTimer, loadNextPlayer]);

    const markUnsold = useCallback(() => {
        if (!livePlayer) return;
        stopTimer();

        setPlayers((prev) =>
            prev.map((p) =>
                p.id === livePlayer.id ? { ...p, status: "unsold" } : p
            )
        );

        setAuctionRunning(false);
        loadNextPlayer(queue);
        setTimeout(() => {
            setAuctionRunning(true);
        }, 800);
    }, [livePlayer, queue, stopTimer, loadNextPlayer]);

    const nextPlayer = useCallback(() => {
        if (!livePlayer) return;
        stopTimer();

        // Mark skipped player as "unsold" — they'll be re-auctioned in the next round
        setPlayers((prev) =>
            prev.map((p) =>
                p.id === livePlayer.id ? { ...p, status: "unsold" } : p
            )
        );

        loadNextPlayer(queue);

        setTimeout(() => {
            setAuctionRunning(true);
        }, 800);
    }, [livePlayer, currentBidder, queue, stopTimer, loadNextPlayer]);

    const resetAuction = useCallback(() => {
        stopTimer();
        const freshPlayers = initialPlayers.map((p) => ({ ...p }));
        const freshTeams = initialTeams.map((t) => ({ ...t }));
        const freshQueue = freshPlayers.filter((p) => p.status === "available");

        setPlayers(freshPlayers);
        setTeams(freshTeams);
        setQueue(freshQueue.slice(1));
        setCurrentBid(0);
        setCurrentBidder(null);
        setBidHistory([]);
        setBidsCount(0);
        setTimeLeft(TIMER_SECONDS);
        setBiddingStarted(false);

        // Load first player — timer starts on first bid
        if (freshQueue.length > 0) {
            const first = freshQueue[0];
            setLivePlayer({ ...first, status: "live" });
            setCurrentBid(first.basePrice);
            setAuctionRunning(true);
        } else {
            setLivePlayer(null);
            setAuctionRunning(false);
        }
    }, [stopTimer]);

    // ── Auto-advance when timer hits 0 ────────────────────────────────────────

    useEffect(() => {
        // Only auto-advance if bidding has started (timer is active)
        if (timeLeft === 0 && auctionRunning && livePlayer && biddingStarted) {
            if (currentBidder) {
                sellPlayer();
            } else {
                markUnsold();
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [timeLeft]);

    // ── Cleanup on unmount ─────────────────────────────────────────────────────

    useEffect(() => () => stopTimer(), [stopTimer]);

    // ── Initialize first live player (timer waits for first bid) ────────────

    useEffect(() => {
        const available = initialPlayers.filter((p) => p.status === "available");
        if (available.length > 0) {
            const [first, ...rest] = available;
            setQueue(rest);
            setLivePlayer({ ...first, status: "live" });
            setCurrentBid(first.basePrice);
            setAuctionRunning(true);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // ── Sync state to Supabase for real-time team viewers ──────────────────

    const syncTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
        // Debounce: wait 150ms after last state change before pushing
        if (syncTimerRef.current) clearTimeout(syncTimerRef.current);
        syncTimerRef.current = setTimeout(() => {
            const snapshot = {
                players,
                teams,
                livePlayer,
                currentBid,
                currentBidder,
                timeLeft,
                bidHistory: bidHistory.map((b) => ({
                    teamId: b.team.id,
                    teamName: b.team.name,
                    teamShortName: b.team.shortName,
                    teamColor: b.team.color,
                    teamLogo: b.team.logo,
                    amount: b.amount,
                    timestamp: b.timestamp.toISOString(),
                })),
                bidsCount,
                auctionRunning,
                biddingStarted,
                lastSale,
            };
            supabase
                .from("auction_state")
                .upsert({ id: 1, state: snapshot, updated_at: new Date().toISOString() })
                .then();
        }, 150);

        return () => {
            if (syncTimerRef.current) clearTimeout(syncTimerRef.current);
        };
    }, [
        players, teams, livePlayer, currentBid, currentBidder,
        timeLeft, bidHistory, bidsCount, auctionRunning, biddingStarted, lastSale,
    ]);

    // ─────────────────────────────────────────────────────────────────────────

    return (
        <AuctionContext.Provider
            value={{
                players,
                teams,
                livePlayer,
                currentBid,
                currentBidder,
                timeLeft,
                bidHistory,
                bidsCount,
                auctionRunning,
                biddingStarted,
                lastSale,
                placeBid,
                undoBid,
                sellPlayer,
                markUnsold,
                nextPlayer,
                startAuction,
                pauseAuction,
                resetAuction,
            }}
        >
            {children}
        </AuctionContext.Provider>
    );
};
