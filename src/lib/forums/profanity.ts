const BLOCKLIST = [
  "asshole",
  "bastard",
  "bitch",
  "bollocks",
  "crap",
  "cunt",
  "damn",
  "dick",
  "douche",
  "dumbass",
  "fag",
  "faggot",
  "fuck",
  "goddamn",
  "hell",
  "jackass",
  "motherfucker",
  "nigga",
  "nigger",
  "piss",
  "prick",
  "pussy",
  "shit",
  "slut",
  "twat",
  "whore",
];

const SOCIETY_BLOCKLIST = [
  "anti hindu",
  "anti muslim",
  "anti sikh",
  "kill all",
  "gas the",
  "go back to",
  "dirty migrant",
  "terrorist",
  "jihadi",
  "casteist",
  "brahmin bashing",
  "dalit slur",
  "reservation free",
  "lynch",
];

function normalize(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function leetNormalize(text: string): string {
  return text
    .replace(/0/g, "o")
    .replace(/1/g, "i")
    .replace(/3/g, "e")
    .replace(/4/g, "a")
    .replace(/5/g, "s")
    .replace(/7/g, "t")
    .replace(/@/g, "a")
    .replace(/\$/g, "s")
    .replace(/\+/g, "t");
}

export function containsProfanity(text: string): boolean {
  const normalized = normalize(leetNormalize(text));

  for (const word of BLOCKLIST) {
    const pattern = new RegExp(`\\b${word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`);
    if (pattern.test(normalized)) return true;
  }

  for (const phrase of SOCIETY_BLOCKLIST) {
    if (normalized.includes(phrase)) return true;
  }

  return false;
}

export function sanitizeProfanity(text: string): string {
  let result = text;

  for (const word of BLOCKLIST) {
    const pattern = new RegExp(`\\b(${word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})\\b`, "gi");
    result = result.replace(pattern, (match) => "*".repeat(match.length));
  }

  for (const phrase of SOCIETY_BLOCKLIST) {
    const pattern = new RegExp(phrase.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "gi");
    result = result.replace(pattern, (match) => "*".repeat(match.length));
  }

  return result;
}
