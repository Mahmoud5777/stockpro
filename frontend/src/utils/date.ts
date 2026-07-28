export function formatDate(value?: string | Date | null, withTime = false): string {
  if (!value) return "-";
  const date = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) return "-";

  const opts: Intl.DateTimeFormatOptions = withTime
    ? { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" }
    : { day: "2-digit", month: "2-digit", year: "numeric" };

  return new Intl.DateTimeFormat("fr-FR", opts).format(date);
}

export function timeAgo(value?: string | Date | null): string {
  if (!value) return "-";
  const date = typeof value === "string" ? new Date(value) : value;
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);

  const ranges: [number, string][] = [
    [60, "seconde"],
    [60, "minute"],
    [24, "heure"],
    [30, "jour"],
    [12, "mois"],
  ];
  let unitSeconds = seconds;
  let label = "seconde";
  let divisor = 1;
  for (const [range, unit] of ranges) {
    if (unitSeconds < range) {
      label = unit;
      break;
    }
    unitSeconds = Math.floor(unitSeconds / range);
    divisor *= range;
  }
  const val = Math.floor(seconds / divisor);
  return `il y a ${val} ${label}${val > 1 ? "s" : ""}`;
}
