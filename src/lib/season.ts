import type { Theme } from "./gameStorage";
export function getSeason(
  date: Date,
  preference: Theme = "auto",
): Exclude<Theme, "auto"> {
  if (preference !== "auto") return preference;
  const month = date.getMonth();
  const day = date.getDate();
  if ((month === 11 && day === 31) || (month === 0 && day <= 5))
    return "new-year";
  if (month === 11) return "christmas";
  if (month === 9 && day >= 15) return "halloween";
  return "classic";
}
