import { useState } from "react";
import AuctionNavbar from "@/components/AuctionNavbar";
import StatCard from "@/components/StatCard";
import TeamCard from "@/components/TeamCard";
import PlayersTable from "@/components/PlayersTable";
import LiveAuctionPanel from "@/components/LiveAuctionPanel";
import TeamPlayersModal from "@/components/TeamPlayersModal";
import { useAuction } from "@/context/AuctionContext";
import { formatCurrency, Team } from "@/data/auctionData";
import heroBanner from "@/assets/hero-banner.jpg";

const Dashboard = () => {
  const { teams, players } = useAuction();
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);

  const totalSpent = teams.reduce((s, t) => s + t.spent, 0);
  const soldCount = players.filter(p => p.status === "sold").length;
  const unsoldCount = players.filter(p => p.status === "unsold").length;
  const availableCount = players.filter(p => p.status === "available" || p.status === "live").length;

  return (
    <>
      {/* Hero */}
      <div className="relative h-56 overflow-hidden">
        <img src={heroBanner} alt="Volleyball Auction" className="h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-primary/80 via-primary/60 to-transparent" />
        <div className="absolute inset-0 flex flex-col justify-center px-6 sm:px-10">
          <p className="font-display text-xs font-semibold tracking-widest text-accent uppercase">Season 2025</p>
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-primary-foreground mt-1">
            Volleyball Mega Auction
          </h1>
          <p className="text-primary-foreground/70 mt-2 text-sm max-w-md">
            {teams.length} teams · {players.length} players · Live bidding in progress
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 space-y-10">
        {/* Stats */}
        <section>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <StatCard label="Total Teams" value={teams.length} icon="🏆" sub="Active bidders" accent />
            <StatCard label="Total Players" value={players.length} icon="🏐" sub={`${availableCount} remaining`} />
            <StatCard label="Players Sold" value={soldCount} icon="🔨" sub={`${unsoldCount} unsold`} />
            <StatCard label="Total Spent" value={formatCurrency(totalSpent)} icon="💰" sub="Across all teams" />
          </div>
        </section>

        {/* Live Auction */}
        <section>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-2xl font-bold">
              <span className="h-2.5 w-2.5 inline-block rounded-full bg-destructive mr-2 pulse-live" />
              Live Now
            </h2>
          </div>
          <LiveAuctionPanel />
        </section>

        {/* Teams */}
        <section>
          <h2 className="font-display text-2xl font-bold mb-4">All Teams</h2>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {teams.map(team => (
              <TeamCard key={team.id} team={team} onClick={setSelectedTeam} />
            ))}
          </div>
        </section>

        {/* Team Players Modal */}
        {selectedTeam && (
          <TeamPlayersModal
            team={selectedTeam}
            players={players}
            onClose={() => setSelectedTeam(null)}
          />
        )}

        {/* Players */}
        <section>
          <h2 className="font-display text-2xl font-bold mb-4">Players</h2>
          <PlayersTable players={players} teams={teams} />
        </section>
      </div>
    </>
  );
};

const TeamsView = () => {
  const { teams, players } = useAuction();
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  return (
    <div className="container mx-auto px-4 py-8">
      <h2 className="font-display text-3xl font-bold mb-6">All Teams</h2>
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {teams.map(team => (
          <TeamCard key={team.id} team={team} onClick={setSelectedTeam} />
        ))}
      </div>
      {selectedTeam && (
        <TeamPlayersModal
          team={selectedTeam}
          players={players}
          onClose={() => setSelectedTeam(null)}
        />
      )}
    </div>
  );
};

const PlayersView = () => {
  const { players, teams } = useAuction();
  return (
    <div className="container mx-auto px-4 py-8">
      <h2 className="font-display text-3xl font-bold mb-6">All Players</h2>
      <PlayersTable players={players} teams={teams} />
    </div>
  );
};

const LiveAuctionView = () => (
  <div className="container mx-auto px-4 py-8">
    <div className="mb-6 flex items-center gap-2">
      <span className="h-3 w-3 rounded-full bg-destructive pulse-live" />
      <h2 className="font-display text-3xl font-bold">Live Auction</h2>
    </div>
    <LiveAuctionPanel />
  </div>
);

const Index = () => {
  const [activeTab, setActiveTab] = useState("Dashboard");

  const renderContent = () => {
    switch (activeTab) {
      case "Teams": return <TeamsView />;
      case "Players": return <PlayersView />;
      case "Live Auction": return <LiveAuctionView />;
      default: return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <AuctionNavbar activeTab={activeTab} onTabChange={setActiveTab} />
      <main>{renderContent()}</main>
      <footer className="mt-16 gradient-hero py-8 text-center">
        <p className="font-display text-sm text-primary-foreground/60 tracking-widest uppercase">
          VolleyBid © 2025 · Volleyball Auction Platform
        </p>
      </footer>
    </div>
  );
};

export default Index;
