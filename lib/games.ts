export type PastelTone = "lilac" | "mint" | "peach" | "sky" | "blush" | "butter";

export interface GameHelp {
  goal?: string;
  controls?: { keys: string; action: string }[];
  tips?: string[];
}

export interface Game {
  id: string;
  title: string;
  description: string;
  category: string;
  emoji: string;
  tone: PastelTone;
  /** path (public/games/..) or external URL */
  src?: string;
  /** inline HTML for uploaded/pasted games */
  html?: string;
  /** how-to-play rules shown in the player */
  help?: GameHelp;
  builtin?: boolean;
  createdAt?: number;
}

// Built-in games shipped with the site (served from /public/games).
// How-to-play rules live INSIDE each game's HTML (a `<script id="game-help">`
// block), so adding a game never requires touching this file.
export const BUILTIN_GAMES: Game[] = [
  {
    id: "endless-runner",
    title: "Endless Runner",
    description:
      "Sprint through a neon tunnel, dodge obstacles and chase a new high score.",
    category: "Arcade",
    emoji: "🏃",
    tone: "sky",
    src: "/games/endlessrunner.html",
    builtin: true,
  },
  {
    id: "sand-simulator",
    title: "Sand & Fluid Sim",
    description:
      "A calm falling-sand sandbox. Paint sand, water, fire, oil & smoke and just watch.",
    category: "Sandbox",
    emoji: "🌊",
    tone: "mint",
    src: "/games/sandsiulator.html",
    builtin: true,
  },
  {
    id: "neon-racer",
    title: "Neon Racer",
    description:
      "A Three.js racer down a glowing highway. Weave through traffic and go turbo.",
    category: "Racing",
    emoji: "🏎️",
    tone: "blush",
    src: "/games/spacecraftracing.html",
    builtin: true,
  },
  {
    id: "city-builder",
    title: "City Builder",
    description:
      "Zone roads, houses, shops and parks on a 3D grid. Grow a tiny town, bulldoze, and watch it come alive.",
    category: "Simulation",
    emoji: "🏙️",
    tone: "peach",
    src: "/games/city_builder.html",
    builtin: true,
  },
  {
    id: "tower-defense",
    title: "Tower Defense",
    description:
      "Place towers along the path and defend your base through 10 escalating waves of enemies.",
    category: "Strategy",
    emoji: "🧱",
    tone: "lilac",
    src: "/games/tower_defence.html",
    builtin: true,
  },
  {
    id: "bubble-shooter",
    title: "Bubble Shooter",
    description:
      "Aim, bounce and pop clusters of 3+ matching bubbles before they pile to the bottom.",
    category: "Puzzle",
    emoji: "🫧",
    tone: "butter",
    src: "/games/bubble_shooter.html",
    builtin: true,
  },
  {
    id: "chess",
    title: "Chess vs Stockfish",
    description:
      "Play chess against the Stockfish engine. Pick your level from Beginner all the way up to Magnus.",
    category: "Board",
    emoji: "♟️",
    tone: "sky",
    src: "/games/chess.html",
    builtin: true,
  },
  {
    id: "neon-2048",
    title: "2048 Neon",
    description:
      "Slide and merge the numbered tiles to build your way up to 2048 — and beyond. A chill number puzzle.",
    category: "Puzzle",
    emoji: "🔢",
    tone: "mint",
    src: "/games/2048.html",
    builtin: true,
  },
  {
    id: "circuit-puzzle",
    title: "Circuit Puzzle",
    description:
      "Rotate wire tiles to route power from the source to every bulb across 10 handcrafted levels.",
    category: "Puzzle",
    emoji: "⚡",
    tone: "sky",
    src: "/games/circuit_puzzle.html",
    builtin: true,
  },
];

export const TONE_CLASSES: Record<
  PastelTone,
  { bg: string; ring: string; chip: string; text: string }
> = {
  lilac: { bg: "bg-lilac", ring: "ring-lilac", chip: "bg-lilac/60", text: "text-[hsl(258_50%_38%)]" },
  mint: { bg: "bg-mint", ring: "ring-mint", chip: "bg-mint/60", text: "text-[hsl(152_45%_30%)]" },
  peach: { bg: "bg-peach", ring: "ring-peach", chip: "bg-peach/60", text: "text-[hsl(25_60%_38%)]" },
  sky: { bg: "bg-sky", ring: "ring-sky", chip: "bg-sky/60", text: "text-[hsl(205_55%_34%)]" },
  blush: { bg: "bg-blush", ring: "ring-blush", chip: "bg-blush/60", text: "text-[hsl(330_50%_38%)]" },
  butter: { bg: "bg-butter", ring: "ring-butter", chip: "bg-butter/60", text: "text-[hsl(45_60%_32%)]" },
};

export const TONES: PastelTone[] = ["lilac", "mint", "peach", "sky", "blush", "butter"];

export const EMOJIS = [
  "🎮","🕹️","🏎️","🏃","🌊","🚀","👾","🛸","🎯","🧩",
  "⚡","🔥","💎","🏀","⚽","🎲","🐍","🍄","🗡️","🛡️","🌈","🍭",
];

// Client-side admin gate (convenience only — not real security).
export const ADMIN_PASSWORD = "arcade";
