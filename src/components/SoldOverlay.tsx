import { useEffect, useState } from "react";
import { SaleInfo } from "@/context/AuctionContext";
import { formatCurrency } from "@/data/auctionData";

interface SoldOverlayProps {
    sale: SaleInfo;
}

const SoldOverlay = ({ sale }: SoldOverlayProps) => {
    const [phase, setPhase] = useState<"enter" | "show" | "exit">("enter");

    useEffect(() => {
        // enter → show after the entrance animation completes
        const t1 = setTimeout(() => setPhase("show"), 600);
        // show → exit before the overlay is removed
        const t2 = setTimeout(() => setPhase("exit"), 4300);
        return () => {
            clearTimeout(t1);
            clearTimeout(t2);
        };
    }, []);

    return (
        <div
            className={`sold-overlay ${phase}`}
            style={{ "--team-color": sale.teamColor } as React.CSSProperties}
        >
            {/* Background particles */}
            <div className="sold-particles">
                {Array.from({ length: 20 }).map((_, i) => (
                    <span
                        key={i}
                        className="sold-particle"
                        style={{
                            left: `${Math.random() * 100}%`,
                            animationDelay: `${Math.random() * 0.8}s`,
                            animationDuration: `${1.5 + Math.random() * 1.5}s`,
                            backgroundColor:
                                i % 3 === 0
                                    ? sale.teamColor
                                    : i % 3 === 1
                                        ? "#FFD700"
                                        : "#FFF",
                            width: `${4 + Math.random() * 8}px`,
                            height: `${4 + Math.random() * 8}px`,
                        }}
                    />
                ))}
            </div>

            {/* Center content */}
            <div className="sold-content">
                {/* SOLD banner */}
                <div className="sold-banner">
                    <span className="sold-banner-text">SOLD!</span>
                </div>

                {/* Team logo — big */}
                <div
                    className="sold-team-logo"
                    style={{ boxShadow: `0 0 60px ${sale.teamColor}80` }}
                >
                    <span className="sold-team-emoji">{sale.teamLogo}</span>
                </div>

                {/* Team name */}
                <h2 className="sold-team-name" style={{ color: sale.teamColor }}>
                    {sale.teamName}
                </h2>

                {/* Player name */}
                <p className="sold-player-name">
                    <span className="sold-player-avatar">{sale.playerAvatar}</span>
                    {sale.playerName}
                </p>

                {/* Price */}
                <div className="sold-price-badge">
                    <span className="sold-price-label">Sold for</span>
                    <span className="sold-price-value">
                        {formatCurrency(sale.soldPrice)}
                    </span>
                </div>
            </div>

            {/* Glow ring */}
            <div
                className="sold-glow-ring"
                style={{ borderColor: `${sale.teamColor}40` }}
            />
        </div>
    );
};

export default SoldOverlay;
