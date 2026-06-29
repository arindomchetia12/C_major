export function capitalizeTrade(trade: string): string {
  if (!trade) return "";
  return trade
    .split(" ")
    .map((word) => {
      const upper = word.toUpperCase();
      if (upper === "HVAC") return "HVAC";
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    })
    .join(" ");
}
