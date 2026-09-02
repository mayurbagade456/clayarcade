"use client";

import * as React from "react";
import { BUILTIN_GAMES, type Game, type GameHelp } from "@/lib/games";

const KEYS = {
  custom: "arcade.customGames",
  favs: "arcade.favorites",
  plays: "arcade.playCounts",
  recents: "arcade.recents",
};

function read<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const v = window.localStorage.getItem(key);
    return v ? (JSON.parse(v) as T) : fallback;
  } catch {
    return fallback;
  }
}
function write(key: string, val: unknown): boolean {
  try {
    window.localStorage.setItem(key, JSON.stringify(val));
    return true;
  } catch {
    return false; // storage full / unavailable
  }
}

interface StoreState {
  custom: Game[];
  favorites: string[];
  plays: Record<string, number>;
  recents: string[];
}

interface StoreContextValue extends StoreState {
  ready: boolean;
  allGames: Game[];
  categories: string[];
  getGame: (id: string) => Game | undefined;
  isFavorite: (id: string) => boolean;
  toggleFavorite: (id: string) => boolean;
  playCount: (id: string) => number;
  recordPlay: (id: string) => void;
  totalPlays: number;
  addCustomGame: (game: Omit<Game, "id" | "builtin" | "createdAt">) => Game;
  updateCustomGame: (id: string, patch: Partial<Game>) => void;
  removeCustomGame: (id: string) => void;
}

const StoreContext = React.createContext<StoreContextValue | null>(null);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = React.useState<StoreState>({
    custom: [],
    favorites: [],
    plays: {},
    recents: [],
  });
  const [ready, setReady] = React.useState(false);

  React.useEffect(() => {
    setState({
      custom: read<Game[]>(KEYS.custom, []),
      favorites: read<string[]>(KEYS.favs, []),
      plays: read<Record<string, number>>(KEYS.plays, {}),
      recents: read<string[]>(KEYS.recents, []),
    });
    setReady(true);
  }, []);

  const allGames = React.useMemo(
    () => [...BUILTIN_GAMES, ...state.custom],
    [state.custom]
  );

  const categories = React.useMemo(() => {
    const set = new Set<string>();
    allGames.forEach((g) => g.category && set.add(g.category));
    return Array.from(set).sort();
  }, [allGames]);

  const value: StoreContextValue = {
    ...state,
    ready,
    allGames,
    categories,
    getGame: (id) => allGames.find((g) => g.id === id),
    isFavorite: (id) => state.favorites.includes(id),
    toggleFavorite: (id) => {
      let added = false;
      setState((s) => {
        const has = s.favorites.includes(id);
        added = !has;
        const favorites = has
          ? s.favorites.filter((x) => x !== id)
          : [...s.favorites, id];
        write(KEYS.favs, favorites);
        return { ...s, favorites };
      });
      return added;
    },
    playCount: (id) => state.plays[id] ?? 0,
    totalPlays: Object.values(state.plays).reduce((a, b) => a + b, 0),
    recordPlay: (id) => {
      setState((s) => {
        const plays = { ...s.plays, [id]: (s.plays[id] ?? 0) + 1 };
        const recents = [id, ...s.recents.filter((x) => x !== id)].slice(0, 8);
        write(KEYS.plays, plays);
        write(KEYS.recents, recents);
        return { ...s, plays, recents };
      });
    },
    addCustomGame: (game) => {
      const created: Game = {
        ...game,
        id: `game-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`,
        builtin: false,
        createdAt: Date.now(),
      };
      const custom = [...state.custom, created];
      if (!write(KEYS.custom, custom)) {
        throw new Error("Storage full — game was not saved");
      }
      setState((s) => ({ ...s, custom }));
      return created;
    },
    updateCustomGame: (id, patch) => {
      const custom = state.custom.map((g) =>
        g.id === id ? { ...g, ...patch, id, builtin: false } : g
      );
      if (!write(KEYS.custom, custom)) {
        throw new Error("Storage full — changes were not saved");
      }
      setState((s) => ({ ...s, custom }));
    },
    removeCustomGame: (id) => {
      setState((s) => {
        const custom = s.custom.filter((g) => g.id !== id);
        write(KEYS.custom, custom);
        return { ...s, custom };
      });
    },
  };

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = React.useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used within <StoreProvider>");
  return ctx;
}

/** Resolve a playable URL: inline HTML -> blob URL, else src path. */
export function resolveGameSrc(game: Game): string | null {
  if (game.html && game.html.trim()) {
    const blob = new Blob([game.html], { type: "text/html" });
    return URL.createObjectURL(blob);
  }
  return game.src ?? null;
}

/**
 * Parse a `<script type="application/json" id="game-help">` block out of a
 * game's HTML. Scripts are never executed (DOMParser doesn't run them), and
 * the shape is validated, so this is safe for untrusted uploaded games.
 */
export function parseHelpFromHtml(html: string): GameHelp | null {
  try {
    const doc = new DOMParser().parseFromString(html, "text/html");
    const el = doc.getElementById("game-help");
    if (!el || !el.textContent) return null;
    const data = JSON.parse(el.textContent) as Record<string, unknown>;
    const help: GameHelp = {};
    if (typeof data.goal === "string") help.goal = data.goal;
    if (Array.isArray(data.controls)) {
      help.controls = data.controls
        .filter(
          (c): c is { keys: string; action: string } =>
            !!c &&
            typeof (c as Record<string, unknown>).keys === "string" &&
            typeof (c as Record<string, unknown>).action === "string"
        )
        .map((c) => ({ keys: String(c.keys), action: String(c.action) }));
    }
    if (Array.isArray(data.tips)) {
      help.tips = data.tips.filter((t): t is string => typeof t === "string");
    }
    return help.goal || help.controls?.length || help.tips?.length ? help : null;
  } catch {
    return null;
  }
}

/**
 * Resolve a game's how-to-play rules. Rules embedded in the game's own HTML
 * win, so admins never need to touch code — otherwise fall back to any rules
 * stored on the game record.
 */
export async function loadGameHelp(game: Game): Promise<GameHelp | null> {
  let htmlText: string | null = null;
  if (game.html && game.html.trim()) {
    htmlText = game.html;
  } else if (game.src) {
    try {
      const res = await fetch(game.src);
      if (res.ok) htmlText = await res.text();
    } catch {
      /* network / cross-origin — fall back below */
    }
  }

  const fromHtml = htmlText ? parseHelpFromHtml(htmlText) : null;
  if (fromHtml) return fromHtml;

  // fall back to rules stored on the record (admin-typed tips, overrides)
  if (
    game.help &&
    (game.help.goal || game.help.controls?.length || game.help.tips?.length)
  ) {
    return game.help;
  }
  return null;
}
