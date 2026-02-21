// Re-export the hook from AuctionContext for Fast Refresh compatibility.
// Components should import from "@/hooks/useAuction" and the provider from "@/context/AuctionContext".
export { useAuction } from "@/context/AuctionContext";
