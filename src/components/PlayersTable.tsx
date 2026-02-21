import { Player, Team, formatCurrency } from "@/data/auctionData";
import { useState } from "react";
import { Search, ChevronUp, ChevronDown } from "lucide-react";

interface PlayersTableProps {
  players: Player[];
  teams: Team[];
}

const positionColors: Record<string, string> = {
  "Outside Hitter": "bg-blue-100 text-blue-700",
  "Setter": "bg-purple-100 text-purple-700",
  "Libero": "bg-green-100 text-green-700",
  "Middle Blocker": "bg-orange-100 text-orange-700",
  "Opposite": "bg-red-100 text-red-700",
  "Defensive Specialist": "bg-teal-100 text-teal-700",
};

type SortKey = "name" | "rating" | "basePrice" | "soldPrice";

const PlayersTable = ({ players, teams }: PlayersTableProps) => {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<string>("all");
  const [sortKey, setSortKey] = useState<SortKey>("rating");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  const getTeam = (teamId?: number) => teams.find(t => t.id === teamId);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortKey(key); setSortDir("desc"); }
  };

  const filtered = players
    .filter(p => {
      const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.position.toLowerCase().includes(search.toLowerCase()) ||
        p.nationality.toLowerCase().includes(search.toLowerCase());
      const matchFilter = filter === "all" || p.status === filter;
      return matchSearch && matchFilter;
    })
    .sort((a, b) => {
      let aVal: number = 0, bVal: number = 0;
      if (sortKey === "name") return sortDir === "asc" ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name);
      if (sortKey === "rating") { aVal = a.rating; bVal = b.rating; }
      if (sortKey === "basePrice") { aVal = a.basePrice; bVal = b.basePrice; }
      if (sortKey === "soldPrice") { aVal = a.soldPrice ?? 0; bVal = b.soldPrice ?? 0; }
      return sortDir === "asc" ? aVal - bVal : bVal - aVal;
    });

  const SortIcon = ({ col }: { col: SortKey }) => (
    <span className="ml-1 inline-flex flex-col opacity-40">
      <ChevronUp className={`h-2.5 w-2.5 ${sortKey === col && sortDir === "asc" ? "opacity-100 text-accent" : ""}`} />
      <ChevronDown className={`h-2.5 w-2.5 -mt-0.5 ${sortKey === col && sortDir === "desc" ? "opacity-100 text-accent" : ""}`} />
    </span>
  );

  return (
    <div className="rounded-xl border border-border bg-card shadow-card overflow-hidden">
      {/* Toolbar */}
      <div className="flex flex-col gap-3 border-b border-border p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search players..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full rounded-lg border border-border bg-secondary/50 py-2 pl-9 pr-3 text-sm outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-colors"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {["all", "sold", "available", "unsold", "live"].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`rounded-full px-3 py-1 text-xs font-medium capitalize transition-colors ${
                filter === f
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-muted-foreground hover:text-foreground"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-secondary/30">
              <th className="px-4 py-3 text-left">
                <button onClick={() => handleSort("name")} className="flex items-center font-display text-xs font-semibold uppercase tracking-wider text-muted-foreground hover:text-foreground">
                  Player <SortIcon col="name" />
                </button>
              </th>
              <th className="px-4 py-3 text-left hidden sm:table-cell">
                <span className="font-display text-xs font-semibold uppercase tracking-wider text-muted-foreground">Position</span>
              </th>
              <th className="px-4 py-3 text-center">
                <button onClick={() => handleSort("rating")} className="flex items-center font-display text-xs font-semibold uppercase tracking-wider text-muted-foreground hover:text-foreground">
                  Rating <SortIcon col="rating" />
                </button>
              </th>
              <th className="px-4 py-3 text-right hidden md:table-cell">
                <button onClick={() => handleSort("basePrice")} className="flex items-center ml-auto font-display text-xs font-semibold uppercase tracking-wider text-muted-foreground hover:text-foreground">
                  Base <SortIcon col="basePrice" />
                </button>
              </th>
              <th className="px-4 py-3 text-right">
                <button onClick={() => handleSort("soldPrice")} className="flex items-center ml-auto font-display text-xs font-semibold uppercase tracking-wider text-muted-foreground hover:text-foreground">
                  Sold For <SortIcon col="soldPrice" />
                </button>
              </th>
              <th className="px-4 py-3 text-center">
                <span className="font-display text-xs font-semibold uppercase tracking-wider text-muted-foreground">Status</span>
              </th>
              <th className="px-4 py-3 text-left hidden lg:table-cell">
                <span className="font-display text-xs font-semibold uppercase tracking-wider text-muted-foreground">Team</span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filtered.map((player) => {
              const team = getTeam(player.teamId);
              return (
                <tr key={player.id} className="group transition-colors hover:bg-secondary/30">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                        {player.avatar}
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{player.name}</p>
                        <p className="text-xs text-muted-foreground">{player.nationality}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 hidden sm:table-cell">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${positionColors[player.position] ?? "bg-secondary text-secondary-foreground"}`}>
                      {player.position}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <div className={`h-1.5 w-1.5 rounded-full ${player.rating >= 90 ? "bg-accent" : player.rating >= 85 ? "bg-gold" : "bg-muted-foreground"}`} />
                      <span className={`font-display font-bold ${player.rating >= 90 ? "text-accent" : player.rating >= 85 ? "text-gold" : "text-foreground"}`}>
                        {player.rating}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right hidden md:table-cell">
                    <span className="text-muted-foreground">{formatCurrency(player.basePrice)}</span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className={`font-display font-semibold ${player.soldPrice ? "text-foreground" : "text-muted-foreground"}`}>
                      {player.soldPrice ? formatCurrency(player.soldPrice) : "—"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-semibold capitalize ${
                      player.status === "live" ? "status-live" :
                      player.status === "sold" ? "status-sold" :
                      player.status === "unsold" ? "status-unsold" :
                      "status-available"
                    }`}>
                      {player.status === "live" && <span className="h-1.5 w-1.5 rounded-full bg-destructive pulse-live" />}
                      {player.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 hidden lg:table-cell">
                    {team ? (
                      <div className="flex items-center gap-2">
                        <span className="text-base">{team.logo}</span>
                        <span className="text-xs font-medium" style={{ color: team.color }}>{team.shortName}</span>
                      </div>
                    ) : (
                      <span className="text-xs text-muted-foreground">—</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {filtered.length === 0 && (
          <div className="py-12 text-center text-muted-foreground">
            <p className="text-4xl mb-2">🏐</p>
            <p className="font-display">No players found</p>
          </div>
        )}
      </div>

      <div className="border-t border-border px-4 py-2.5 text-xs text-muted-foreground">
        Showing {filtered.length} of {players.length} players
      </div>
    </div>
  );
};

export default PlayersTable;
