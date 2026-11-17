export type Season = "classic" | "christmas" | "new-year" | "halloween";
export function getSeason(date: Date): Season {
  const month = date.getMonth();
  const day = date.getDate();
  if ((month === 11 && day === 31) || (month === 0 && day <= 5))
    return "new-year";
  if (month === 11 || (month === 10 && day >= 15)) return "christmas";
  if (month === 9 && day >= 15) return "halloween";
  return "classic";
}
