export interface Player {
  id: number;
  name: string;
  position: "Setter" | "Libero" | "Outside Hitter" | "Middle Blocker" | "Opposite" | "Defensive Specialist";
  nationality: string;
  age: number;
  basePrice: number;
  soldPrice?: number;
  teamId?: number;
  status: "sold" | "unsold" | "available" | "live";
  rating: number;
  avatar: string;
}

export interface Team {
  id: number;
  name: string;
  shortName: string;
  city: string;
  color: string;
  budget: number;
  spent: number;
  players: number[];
  logo: string;
}

export interface BidEntry {
  team: Team;
  amount: number;
  timestamp: Date;
}

export const initialTeams: Team[] = [
  { id: 1, name: "Sarvam Spikers", shortName: "SVS", city: "Mumbai", color: "#F97316", budget: 10000000, spent: 0, players: [], logo: "🏐" },
  { id: 2, name: "Samarpan Storm", shortName: "SMS", city: "Delhi", color: "#1E3A8A", budget: 10000000, spent: 0, players: [], logo: "🌪️" },
  { id: 3, name: "Prabodham Titans", shortName: "PBT", city: "Bangalore", color: "#EAB308", budget: 10000000, spent: 0, players: [], logo: "💪" },
  { id: 4, name: "Dazzling Das", shortName: "DZD", city: "Chennai", color: "#16A34A", budget: 10000000, spent: 0, players: [], logo: "✨" },
  { id: 5, name: "Satsangi Lions", shortName: "STL", city: "Kolkata", color: "#DC2626", budget: 10000000, spent: 0, players: [], logo: "🦁" },
  { id: 6, name: "Akshar Royals", shortName: "AKR", city: "Hyderabad", color: "#7C3AED", budget: 10000000, spent: 0, players: [], logo: "👑" },
];

export const initialPlayers: Player[] = [
  { id: 1, name: "Arjun Mehta", position: "Outside Hitter", nationality: "🇮🇳 India", age: 24, basePrice: 1500000, rating: 92, avatar: "AM", status: "available" },
  { id: 2, name: "Carlos Rivera", position: "Setter", nationality: "🇧🇷 Brazil", age: 27, basePrice: 1800000, rating: 95, avatar: "CR", status: "available" },
  { id: 3, name: "Yuki Tanaka", position: "Libero", nationality: "🇯🇵 Japan", age: 22, basePrice: 1200000, rating: 89, avatar: "YT", status: "available" },
  { id: 4, name: "Dmitri Volkov", position: "Middle Blocker", nationality: "🇷🇺 Russia", age: 29, basePrice: 2000000, rating: 97, avatar: "DV", status: "available" },
  { id: 5, name: "Ravi Sharma", position: "Opposite", nationality: "🇮🇳 India", age: 26, basePrice: 1600000, rating: 88, avatar: "RS", status: "available" },
  { id: 6, name: "Marco Rossi", position: "Outside Hitter", nationality: "🇮🇹 Italy", age: 25, basePrice: 1700000, rating: 90, avatar: "MR", status: "available" },
  { id: 7, name: "Chen Wei", position: "Setter", nationality: "🇨🇳 China", age: 28, basePrice: 1500000, rating: 91, avatar: "CW", status: "available" },
  { id: 8, name: "Priya Nair", position: "Defensive Specialist", nationality: "🇮🇳 India", age: 23, basePrice: 1000000, rating: 85, avatar: "PN", status: "available" },
  { id: 9, name: "Lucas Fernandez", position: "Middle Blocker", nationality: "🇦🇷 Argentina", age: 30, basePrice: 1900000, rating: 93, avatar: "LF", status: "available" },
  { id: 10, name: "Kim Ji-won", position: "Libero", nationality: "🇰🇷 South Korea", age: 24, basePrice: 1300000, rating: 87, avatar: "KJ", status: "available" },
  { id: 11, name: "Sven Larsson", position: "Opposite", nationality: "🇸🇪 Sweden", age: 26, basePrice: 1800000, rating: 94, avatar: "SL", status: "available" },
  { id: 12, name: "Amara Diallo", position: "Outside Hitter", nationality: "🇸🇳 Senegal", age: 25, basePrice: 1400000, rating: 86, avatar: "AD", status: "available" },
  { id: 13, name: "Rahul Gupta", position: "Setter", nationality: "🇮🇳 India", age: 27, basePrice: 1600000, rating: 89, avatar: "RG", status: "available" },
  { id: 14, name: "Pavel Novak", position: "Middle Blocker", nationality: "🇨🇿 Czech", age: 28, basePrice: 1700000, rating: 91, avatar: "PV", status: "available" },
  { id: 15, name: "Diego Santos", position: "Outside Hitter", nationality: "🇧🇷 Brazil", age: 23, basePrice: 1500000, rating: 88, avatar: "DS", status: "available" },
  { id: 16, name: "Kenji Yamamoto", position: "Libero", nationality: "🇯🇵 Japan", age: 26, basePrice: 1200000, rating: 84, avatar: "KY", status: "available" },
  { id: 17, name: "Vikram Singh", position: "Opposite", nationality: "🇮🇳 India", age: 24, basePrice: 1800000, rating: 90, avatar: "VS", status: "available" },
  { id: 18, name: "Sofia Petrov", position: "Outside Hitter", nationality: "🇧🇬 Bulgaria", age: 22, basePrice: 1400000, rating: 86, avatar: "SP", status: "available" },
  { id: 19, name: "Ahmed Hassan", position: "Middle Blocker", nationality: "🇪🇬 Egypt", age: 27, basePrice: 1600000, rating: 88, avatar: "AH", status: "available" },
  { id: 20, name: "Lena Mueller", position: "Setter", nationality: "🇩🇪 Germany", age: 25, basePrice: 1500000, rating: 83, avatar: "LM", status: "available" },
  { id: 21, name: "Jose Morales", position: "Defensive Specialist", nationality: "🇲🇽 Mexico", age: 23, basePrice: 900000, rating: 80, avatar: "JM", status: "available" },
  { id: 22, name: "Aiko Watanabe", position: "Outside Hitter", nationality: "🇯🇵 Japan", age: 26, basePrice: 1700000, rating: 85, avatar: "AW", status: "available" },
];

export const formatCurrency = (amount: number) => {
  if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(2)}Cr`;
  if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)}L`;
  return `₹${amount.toLocaleString()}`;
};
