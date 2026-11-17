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
export const seasonCopy = {
  classic: {
    label: "Good music. Great company.",
    title: "Your next night in,",
    accent: "on the record.",
    subtitle: "A little soul. A little nostalgia. A lot of “I know this one!”",
    sticker: "Made for\ngood company",
    edition: "The original listening party",
  },
  christmas: {
    label: "The Christmas edition",
    title: "All is calm.",
    accent: "Until the chorus.",
    subtitle:
      "Gather your favourite people. Put a little soul in the festive season.",
    sticker: "Merry\nmixmas!",
    edition: "A very merry listening party",
  },
  "new-year": {
    label: "The New Year edition",
    title: "New year.",
    accent: "Timeless tracks.",
    subtitle:
      "One more round with your favourite people. Start the year on a high note.",
    sticker: "Hello,\nnew year!",
    edition: "The after-midnight listening party",
  },
  halloween: {
    label: "The Halloween edition",
    title: "Familiar sounds.",
    accent: "Hauntingly good.",
    subtitle:
      "Gather your crew for a little musical mischief. No tricks, just tracks.",
    sticker: "Spooky\ngood tunes",
    edition: "The after-dark listening party",
  },
};
