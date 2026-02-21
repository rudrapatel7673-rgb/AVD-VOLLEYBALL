import { Team, formatCurrency } from "@/data/auctionData";
import { Users, Wallet, ChevronRight } from "lucide-react";

interface TeamCardProps {
  team: Team;
  onClick?: (team: Team) => void;
}

const TeamCard = ({ team, onClick }: TeamCardProps) => {
  const budgetUsedPct = Math.round((team.spent / team.budget) * 100);
  const remaining = team.budget - team.spent;

  return (
    <div
      className="group relative overflow-hidden rounded-xl border border-border bg-card shadow-card transition-all duration-300 hover:shadow-hover hover:-translate-y-1 cursor-pointer"
      onClick={() => onClick?.(team)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") onClick?.(team); }}
      aria-label={`View ${team.name} players`}
    >
      {/* Top accent bar */}
      <div className="h-1.5 w-full" style={{ backgroundColor: team.color }} />

      <div className="p-5">
        {/* Header */}
        <div className="flex items-center gap-4">
          <div
            className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-xl text-2xl shadow-sm"
            style={{ backgroundColor: `${team.color}18`, border: `2px solid ${team.color}30` }}
          >
            {team.logo}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-display text-lg font-bold text-foreground leading-tight">{team.name}</h3>
            <div className="flex items-center gap-2 mt-0.5">
              <span
                className="rounded-full px-2 py-0.5 text-xs font-bold"
                style={{ backgroundColor: `${team.color}20`, color: team.color }}
              >
                {team.shortName}
              </span>
              <span className="text-xs text-muted-foreground">{team.city}</span>
            </div>
          </div>
          {/* Arrow indicator */}
          <ChevronRight
            className="h-5 w-5 text-muted-foreground opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-200"
          />
        </div>

        {/* Stats */}
        <div className="mt-4 grid grid-cols-2 gap-3">
          <div className="rounded-lg bg-secondary/60 p-3">
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Users className="h-3.5 w-3.5" />
              <span className="text-xs">Players</span>
            </div>
            <p className="font-display mt-1 text-xl font-bold text-foreground">{team.players.length}</p>
          </div>
          <div className="rounded-lg bg-secondary/60 p-3">
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Wallet className="h-3.5 w-3.5" />
              <span className="text-xs">Remaining</span>
            </div>
            <p className="font-display mt-1 text-xl font-bold" style={{ color: team.color }}>
              {formatCurrency(remaining)}
            </p>
          </div>
        </div>

        {/* Budget Bar */}
        <div className="mt-4">
          <div className="mb-1.5 flex justify-between text-xs text-muted-foreground">
            <span>Budget Used</span>
            <span className="font-medium text-foreground">{budgetUsedPct}%</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{ width: `${budgetUsedPct}%`, backgroundColor: team.color }}
            />
          </div>
          <div className="mt-1.5 flex justify-between text-xs text-muted-foreground">
            <span>Spent: {formatCurrency(team.spent)}</span>
            <span>Total: {formatCurrency(team.budget)}</span>
          </div>
        </div>

        {/* Click hint */}
        <div
          className="mt-3 flex items-center gap-1.5 text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-200"
          style={{ color: team.color }}
        >
          <Users className="h-3 w-3" />
          <span>Click to view players</span>
        </div>
      </div>
    </div>
  );
};

export default TeamCard;
