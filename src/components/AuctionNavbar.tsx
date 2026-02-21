import { useState } from "react";
import { Trophy, Menu, X, Zap } from "lucide-react";

interface AuctionNavbarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const tabs = ["Dashboard", "Teams", "Players", "Live Auction"];

const AuctionNavbar = ({ activeTab, onTabChange }: AuctionNavbarProps) => {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="gradient-hero sticky top-0 z-50 shadow-md">
      <div className="container mx-auto flex items-center justify-between px-4 py-3">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent shadow-accent">
            <Trophy className="h-5 w-5 text-accent-foreground" />
          </div>
          <div>
            <span className="font-display text-xl font-bold tracking-wide text-primary-foreground">
              VOLLEY<span className="text-accent">BID</span>
            </span>
            <p className="text-xs text-primary-foreground/50 leading-none">Auction Platform</p>
          </div>
        </div>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-1">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => onTabChange(tab)}
              className={`relative px-4 py-2 font-display text-sm font-medium tracking-wide transition-all duration-200 rounded-md ${
                activeTab === tab
                  ? "text-accent"
                  : "text-primary-foreground/70 hover:text-primary-foreground"
              }`}
            >
              {activeTab === tab && (
                <span className="absolute inset-x-2 bottom-0 h-0.5 rounded-full bg-accent" />
              )}
              {tab === "Live Auction" && (
                <span className="mr-1.5 inline-flex h-2 w-2 rounded-full bg-destructive pulse-live" />
              )}
              {tab}
            </button>
          ))}
        </div>

        {/* Live Badge */}
        <div className="hidden md:flex items-center gap-2 rounded-full border border-accent/30 bg-accent/10 px-3 py-1.5">
          <Zap className="h-3.5 w-3.5 text-accent" />
          <span className="font-display text-xs font-semibold tracking-widest text-accent">LIVE</span>
          <span className="h-2 w-2 rounded-full bg-accent pulse-live" />
        </div>

        {/* Mobile menu button */}
        <button
          className="md:hidden text-primary-foreground/80 hover:text-primary-foreground"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden border-t border-primary-foreground/10 px-4 pb-3">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => { onTabChange(tab); setMenuOpen(false); }}
              className={`block w-full py-2.5 text-left font-display text-sm tracking-wide transition-colors ${
                activeTab === tab ? "text-accent" : "text-primary-foreground/70"
              }`}
            >
              {tab === "Live Auction" && (
                <span className="mr-2 inline-flex h-2 w-2 rounded-full bg-destructive pulse-live" />
              )}
              {tab}
            </button>
          ))}
        </div>
      )}
    </nav>
  );
};

export default AuctionNavbar;
