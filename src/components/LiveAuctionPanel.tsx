import { useState } from "react";
import { useAuction } from "@/context/AuctionContext";
import { Gavel, Timer, TrendingUp, Users, Play, Pause, SkipForward, RotateCcw, CheckCircle, XCircle, Lock, Undo2, AlertTriangle } from "lucide-react";
import { formatCurrency } from "@/data/auctionData";
import SoldOverlay from "@/components/SoldOverlay";

// ── Confirmation Popup ─────────────────────────────────────────────────────

interface ConfirmAction {
  label: string;
  message: string;
  color: string;
  onConfirm: () => void;
}

const ConfirmPopup = ({ action, onClose }: { action: ConfirmAction; onClose: () => void }) => (
  <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in">
    <div className="bg-card border border-border rounded-2xl shadow-2xl p-6 w-full max-w-sm mx-4 animate-in zoom-in-95">
      <div className="flex items-center gap-3 mb-4">
        <div className="h-10 w-10 rounded-full flex items-center justify-center bg-amber-500/15">
          <AlertTriangle className="h-5 w-5 text-amber-500" />
        </div>
        <div>
          <h3 className="font-display font-bold text-lg">Confirm Action</h3>
          <p className="text-sm text-muted-foreground">This action cannot be undone</p>
        </div>
      </div>
      <p className="text-sm mb-6">{action.message}</p>
      <div className="flex gap-3">
        <button
          onClick={onClose}
          className="flex-1 rounded-lg border border-border bg-secondary px-4 py-2.5 text-sm font-medium hover:bg-secondary/80 transition"
        >
          Cancel
        </button>
        <button
          onClick={() => { action.onConfirm(); onClose(); }}
          className="flex-1 rounded-lg px-4 py-2.5 text-sm font-bold text-white transition hover:opacity-90"
          style={{ backgroundColor: action.color }}
        >
          {action.label}
        </button>
      </div>
    </div>
  </div>
);

// ── Live Auction Panel ─────────────────────────────────────────────────────

const LiveAuctionPanel = () => {
  const {
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
  } = useAuction();

  const [confirmAction, setConfirmAction] = useState<ConfirmAction | null>(null);

  const askConfirm = (action: ConfirmAction) => setConfirmAction(action);

  const timerPercent = biddingStarted ? (timeLeft / 180) * 100 : 100;
  const timerColor = !biddingStarted
    ? "#16A34A"
    : timeLeft > 90 ? "#16A34A" : timeLeft > 30 ? "#EAB308" : "#DC2626";

  if (!livePlayer) {
    return (
      <div className="rounded-xl border border-border bg-card shadow-card p-12 text-center">
        <p className="text-5xl mb-4">🏆</p>
        <h3 className="font-display text-2xl font-bold mb-2">Auction Complete!</h3>
        <p className="text-muted-foreground mb-6">All players have been auctioned.</p>
        <button
          onClick={resetAuction}
          className="inline-flex items-center gap-2 rounded-lg bg-primary text-primary-foreground px-6 py-2.5 font-display font-semibold hover:opacity-90 transition"
        >
          <RotateCcw className="h-4 w-4" /> Reset Auction
        </button>
      </div>
    );
  }

  return (
    <>
      {/* Confirmation popup */}
      {confirmAction && (
        <ConfirmPopup action={confirmAction} onClose={() => setConfirmAction(null)} />
      )}

      {/* Sold celebration overlay */}
      {lastSale && <SoldOverlay sale={lastSale} />}

      <div className="grid gap-6 lg:grid-cols-3">
        {/* ── Main auction card ── */}
        <div className="lg:col-span-2 rounded-xl overflow-hidden border border-border shadow-card">
          {/* Header */}
          <div className="gradient-hero px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-destructive pulse-live" />
              <span className="font-display font-semibold tracking-widest text-accent text-sm">
                LIVE AUCTION
              </span>
            </div>

            {/* Circular timer */}
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
                  <>
                    <span className="font-display font-bold text-white/60 text-[10px] leading-tight text-center">WAIT</span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Player spotlight */}
          <div className="bg-card p-6">
            <div className="flex flex-col sm:flex-row gap-6 items-center sm:items-start">
              {/* Avatar */}
              <div className="relative flex-shrink-0">
                <div className="h-28 w-28 rounded-2xl bg-primary flex items-center justify-center text-3xl font-display font-bold text-accent shadow-lg">
                  {livePlayer.avatar}
                </div>
                <div className="absolute -bottom-2 -right-2 rounded-full bg-accent px-2 py-0.5 text-xs font-bold text-accent-foreground shadow">
                  {livePlayer.rating}
                </div>
              </div>

              {/* Player info */}
              <div className="flex-1 text-center sm:text-left">
                <h2 className="font-display text-3xl font-bold text-foreground">{livePlayer.name}</h2>
                <p className="text-muted-foreground mt-1">{livePlayer.nationality} · Age {livePlayer.age}</p>
                <div className="mt-3 flex flex-wrap justify-center sm:justify-start gap-2">
                  <span className="rounded-full bg-secondary px-3 py-1 text-sm font-medium text-secondary-foreground">
                    {livePlayer.position}
                  </span>
                  <span className="rounded-full bg-accent/10 border border-accent/30 px-3 py-1 text-sm font-medium text-accent">
                    Base: {formatCurrency(livePlayer.basePrice)}
                  </span>
                </div>
              </div>

              {/* Current bid */}
              <div className="text-center sm:text-right">
                <p className="text-xs uppercase tracking-widest text-muted-foreground font-medium">Current Bid</p>
                <p className="font-display text-4xl font-bold text-accent mt-1">{formatCurrency(currentBid)}</p>
                {currentBidder ? (
                  <div className="mt-1 flex items-center justify-center sm:justify-end gap-1.5 text-sm text-muted-foreground">
                    <span className="text-base">{currentBidder.logo}</span>
                    <span style={{ color: currentBidder.color }}>{currentBidder.name}</span>
                  </div>
                ) : (
                  <p className="mt-1 text-xs text-muted-foreground italic">No bids yet</p>
                )}
              </div>
            </div>

            {/* Bid progress bar */}
            <div className="mt-6 rounded-xl bg-secondary/50 p-4">
              <div className="mb-2 flex justify-between text-xs text-muted-foreground">
                <span className="flex items-center gap-1"><TrendingUp className="h-3 w-3" /> Bid vs Base Price</span>
                <span className="font-medium text-foreground">
                  +{Math.round(((currentBid - livePlayer.basePrice) / livePlayer.basePrice) * 100)}%
                </span>
              </div>
              <div className="h-2.5 w-full rounded-full bg-border overflow-hidden">
                <div
                  className="gradient-accent h-full rounded-full transition-all duration-700"
                  style={{ width: `${Math.min(100, ((currentBid - livePlayer.basePrice) / livePlayer.basePrice) * 100)}%` }}
                />
              </div>
            </div>

            {/* Stats row */}
            <div className="mt-4 grid grid-cols-3 gap-3">
              <div className="rounded-lg bg-secondary/50 p-3 text-center">
                <Gavel className="h-4 w-4 text-accent mx-auto" />
                <p className="font-display text-lg font-bold mt-1">{bidsCount}</p>
                <p className="text-xs text-muted-foreground">Total Bids</p>
              </div>
              <div className="rounded-lg bg-secondary/50 p-3 text-center">
                <Users className="h-4 w-4 text-accent mx-auto" />
                <p className="font-display text-lg font-bold mt-1">{teams.length}</p>
                <p className="text-xs text-muted-foreground">Active Teams</p>
              </div>
              <div className="rounded-lg bg-secondary/50 p-3 text-center">
                <Timer className="h-4 w-4 text-accent mx-auto" />
                <p className="font-display text-lg font-bold mt-1" style={{ color: timerColor }}>{timeLeft}s</p>
                <p className="text-xs text-muted-foreground">Remaining</p>
              </div>
            </div>

            {/* ── BIDDING BUTTONS ── */}
            <div className="mt-5">
              {(() => {
                const bidIncrement = currentBid >= 3_000_000 ? 200_000 : 100_000;
                return (
                  <>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider mb-3 font-semibold">
                      Place Bid (+{formatCurrency(bidIncrement)})
                    </p>
                    <div className="flex flex-wrap gap-3">
                      {teams.map((team) => {
                        const canAfford = team.budget - team.spent >= bidIncrement;
                        const isLeading = currentBidder?.id === team.id;
                        const isDisabled = !auctionRunning || (biddingStarted && timeLeft === 0) || !canAfford || isLeading;

                        return (
                          <div key={team.id} className="relative group/btn">
                            <button
                              onClick={() => placeBid(team.id)}
                              disabled={isDisabled}
                              className={`flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium transition-all duration-200
                        hover:shadow-md hover:-translate-y-0.5 active:scale-95
                        disabled:cursor-not-allowed disabled:hover:translate-y-0
                        ${isLeading
                                  ? "opacity-50 ring-2 cursor-not-allowed"
                                  : !canAfford ? "opacity-40" : ""
                                }`}
                              style={{
                                borderColor: `${team.color}60`,
                                backgroundColor: isLeading ? `${team.color}15` : `${team.color}0d`,
                                color: team.color,
                              }}
                              title={
                                isLeading ? `${team.name} is already the highest bidder` :
                                  !canAfford ? "Insufficient budget" :
                                    `${team.name} bids ${formatCurrency(currentBid + 100000)}`
                              }
                            >
                              <span className="text-base">{team.logo}</span>
                              <span className="font-display">{team.shortName}</span>
                              {isLeading && (
                                <span className="inline-flex items-center gap-0.5 text-[10px] font-bold px-1 rounded bg-current/20 opacity-90">
                                  <Lock className="h-2.5 w-2.5" /> LEADING
                                </span>
                              )}
                              {!isLeading && <span className="text-xs opacity-60">Bid</span>}
                            </button>

                            {/* Tooltip for leading team */}
                            {isLeading && (
                              <div className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover/btn:flex
                        items-center gap-1 rounded-md bg-foreground/90 px-2.5 py-1.5 text-[11px] font-medium text-background
                        whitespace-nowrap shadow-lg z-10">
                                <Lock className="h-3 w-3" />
                                Already highest bidder
                                {/* Arrow */}
                                <span className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-foreground/90" />
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </>
                );
              })()}
            </div>

            {/* ── ADMIN CONTROLS ── */}
            <div className="mt-5 pt-4 border-t border-border flex flex-wrap gap-2 items-center">
              <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mr-1">Controls:</span>

              {
                auctionRunning ? (
                  <button
                    onClick={pauseAuction}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-secondary border border-border px-3 py-1.5 text-xs font-medium text-foreground hover:bg-secondary/80 transition"
                  >
                    <Pause className="h-3.5 w-3.5" /> Pause
                  </button>
                ) : (
                  <button
                    onClick={startAuction}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-accent text-accent-foreground px-3 py-1.5 text-xs font-bold hover:opacity-90 transition"
                  >
                    <Play className="h-3.5 w-3.5" /> Resume
                  </button>
                )
              }

              <button
                onClick={() => askConfirm({
                  label: "Sell Player",
                  message: `Sell ${livePlayer?.name} to ${currentBidder?.name} for ${formatCurrency(currentBid)}?`,
                  color: "#16a34a",
                  onConfirm: sellPlayer,
                })}
                disabled={!currentBidder}
                className="inline-flex items-center gap-1.5 rounded-lg bg-green-600 text-white px-3 py-1.5 text-xs font-bold hover:bg-green-700 transition disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <CheckCircle className="h-3.5 w-3.5" /> Sell
              </button>

              <button
                onClick={() => askConfirm({
                  label: "Mark Unsold",
                  message: `Mark ${livePlayer?.name} as unsold?`,
                  color: "#dc2626",
                  onConfirm: markUnsold,
                })}
                className="inline-flex items-center gap-1.5 rounded-lg bg-destructive text-destructive-foreground px-3 py-1.5 text-xs font-bold hover:opacity-90 transition"
              >
                <XCircle className="h-3.5 w-3.5" /> Unsold
              </button>

              <button
                onClick={() => askConfirm({
                  label: "Skip Player",
                  message: `Skip ${livePlayer?.name}? They will be re-auctioned in the next round.`,
                  color: "#6b7280",
                  onConfirm: nextPlayer,
                })}
                className="inline-flex items-center gap-1.5 rounded-lg bg-secondary border border-border px-3 py-1.5 text-xs font-medium text-foreground hover:bg-secondary/80 transition"
              >
                <SkipForward className="h-3.5 w-3.5" /> Skip
              </button>

              {/* ── UNDO LAST BID ── */}
              <button
                onClick={undoBid}
                disabled={bidHistory.length === 0}
                title={bidHistory.length === 0 ? "No bids to undo" : `Undo last bid (${bidHistory.length} bid${bidHistory.length > 1 ? "s" : ""} in history)`}
                className="inline-flex items-center gap-1.5 rounded-lg border border-amber-400/40 bg-amber-400/10 px-3 py-1.5 text-xs font-bold text-amber-600 hover:bg-amber-400/20 transition disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <Undo2 className="h-3.5 w-3.5" />
                Undo
                {bidHistory.length > 0 && (
                  <span className="ml-0.5 inline-flex items-center justify-center h-4 min-w-4 rounded-full bg-amber-500 text-white text-[10px] font-bold px-1">
                    {bidHistory.length}
                  </span>
                )}
              </button>

              <button
                onClick={() => askConfirm({
                  label: "Reset Auction",
                  message: "Reset the entire auction? All sold/unsold data will be lost.",
                  color: "#dc2626",
                  onConfirm: resetAuction,
                })}
                className="inline-flex items-center gap-1.5 rounded-lg bg-secondary border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition ml-auto"
              >
                <RotateCcw className="h-3.5 w-3.5" /> Reset
              </button>
            </div>
          </div>
        </div>

        {/* ── Bid History Sidebar ── */}
        <div className="rounded-xl border border-border bg-card shadow-card overflow-hidden flex flex-col">
          <div className="border-b border-border px-5 py-4">
            <h3 className="font-display text-lg font-bold">Bid History</h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              {bidHistory.length > 0 ? `${bidHistory.length} bids for ${livePlayer.name}` : "No bids yet"}
            </p>
          </div>

          {/* Bids list */}
          <div className="flex-1 overflow-y-auto divide-y divide-border" style={{ maxHeight: 260 }}>
            {bidHistory.length === 0 ? (
              <div className="py-10 text-center text-muted-foreground">
                <Gavel className="h-8 w-8 mx-auto mb-2 opacity-30" />
                <p className="text-sm">Waiting for first bid…</p>
              </div>
            ) : (
              bidHistory.map((bid, idx) => (
                <div
                  key={idx}
                  className={`flex items-center justify-between px-5 py-3.5 transition-colors ${idx === 0 ? "bg-accent/5" : "hover:bg-secondary/40"}`}
                >
                  <div className="flex items-center gap-3">
                    {idx === 0 && <span className="h-2 w-2 rounded-full bg-accent pulse-live" />}
                    <span className="text-xl">{bid.team.logo}</span>
                    <div>
                      <p className="text-sm font-medium" style={{ color: bid.team.color }}>{bid.team.shortName}</p>
                      <p className="text-xs text-muted-foreground">{bid.team.city}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-display font-bold ${idx === 0 ? "text-accent" : "text-foreground"}`}>
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
    </>
  );
};

export default LiveAuctionPanel;
