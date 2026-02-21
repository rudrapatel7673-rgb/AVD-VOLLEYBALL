interface StatCardProps {
  label: string;
  value: string | number;
  icon: string;
  sub?: string;
  accent?: boolean;
}

const StatCard = ({ label, value, icon, sub, accent }: StatCardProps) => (
  <div
    className={`relative overflow-hidden rounded-xl border p-5 shadow-card transition-all duration-300 hover:shadow-hover hover:-translate-y-0.5 ${
      accent
        ? "gradient-accent border-transparent text-accent-foreground"
        : "gradient-card border-border bg-card"
    }`}
  >
    <div className="flex items-start justify-between">
      <div>
        <p className={`text-xs font-medium uppercase tracking-widest ${accent ? "text-accent-foreground/70" : "text-muted-foreground"}`}>
          {label}
        </p>
        <p className={`font-display mt-1 text-3xl font-bold ${accent ? "text-accent-foreground" : "text-foreground"}`}>
          {value}
        </p>
        {sub && (
          <p className={`mt-1 text-xs ${accent ? "text-accent-foreground/70" : "text-muted-foreground"}`}>
            {sub}
          </p>
        )}
      </div>
      <span className="text-3xl">{icon}</span>
    </div>
    {accent && (
      <div className="absolute -right-4 -bottom-4 h-20 w-20 rounded-full bg-accent-foreground/10" />
    )}
  </div>
);

export default StatCard;
