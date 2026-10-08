// Deterministic gradient generator for 0x addresses

const GRADIENT_PAIRS = [
  ["#E5007D", "#7928CA"], // Pink to Purple
  ["#FF4B4B", "#FF8533"], // Coral to Orange
  ["#0070F3", "#00DFD8"], // Blue to Cyan
  ["#7928CA", "#FF0080"], // Purple to Neon Pink
  ["#10B981", "#059669"], // Emerald
  ["#F59E0B", "#D97706"], // Amber
  ["#6366F1", "#A855F7"], // Indigo to Violet
  ["#EC4899", "#F43F5E"], // Rose
];

export function getAddressGradient(address: string): { background: string; text: string } {
  if (!address || !address.startsWith("0x")) {
    return {
      background: "linear-gradient(135deg, #E5007D 0%, #7928CA 100%)",
      text: "#FFFFFF",
    };
  }

  // Hash the address to select a deterministic pair
  let hash = 0;
  for (let i = 2; i < address.length; i++) {
    hash = (hash << 5) - hash + address.charCodeAt(i);
    hash |= 0;
  }

  const index = Math.abs(hash) % GRADIENT_PAIRS.length;
  const [c1, c2] = GRADIENT_PAIRS[index];

  return {
    background: `linear-gradient(135deg, ${c1} 0%, ${c2} 100%)`,
    text: "#FFFFFF",
  };
}

export function formatShortAddress(address: string): string {
  if (!address || address.length < 10) return address || "";
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}
