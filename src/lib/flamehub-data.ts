export type HubItem = {
  id: string;
  name: string;
  url: string;
  tagline: string;
  emoji: string;
  /** Sites that hard-block embedding — they open in their own tab instead. */
  directOnly?: boolean;
  /** Load straight into the iframe instead of routing through /render-site. */
  direct?: boolean;
  note?: string;
};

export const GAMES: HubItem[] = [
  {
    id: "html5games",
    name: "HTML5 Games",
    url: "https://html5games.com",
    tagline: "Big embed-friendly browser game portal",
    emoji: "🎮",
  },
  {
    id: "cloudgames",
    name: "Cloud Games",
    url: "https://gamesnacks.com",
    tagline: "Instant-play HTML5 games, no streaming engine needed",
    emoji: "☁️",
  },
  {
    id: "slope",
    name: "Slope",
    url: "https://slope-play.com",
    tagline: "The endless neon downhill run",
    emoji: "🟢",
  },
  {
    id: "driveu7",
    name: "Drive U 7",
    url: "https://3kh0.github.io/",
    direct: true,
    note: "Loads raw from a GitHub Pages game drive",
    tagline: "Unblocked games drive, hosted on GitHub Pages",
    emoji: "🗂️",
  },
];

export const APPS: HubItem[] = [
  {
    id: "tiktok",
    name: "TikTok (ProxiTok)",
    url: "https://pabloferreiro.xyz",
    tagline: "Short-form video feed, mirror frontend",
    emoji: "🎵",
  },
  {
    id: "spotify",
    name: "Music (Piped)",
    url: "https://piped.video",
    tagline: "Stream music with no DRM walls",
    emoji: "🎧",
  },
  {
    id: "youtube",
    name: "YouTube (Invidious)",
    url: "https://yewtu.be",
    tagline: "Videos and music, lightweight mirror",
    emoji: "▶️",
  },
  {
    id: "chatgpt",
    name: "AI Chat (DuckDuckGo)",
    url: "https://duckduckgo.com/?q=DuckDuckGo+AI+Chat&ia=chat",
    tagline: "AI homework and idea partner",
    emoji: "🤖",
  },
];

export const UTILITIES: HubItem[] = [
  {
    id: "sketchpad",
    name: "Drawing Pad",
    url: "https://sketch.io/sketchpad/",
    tagline: "Full drawing canvas in the browser",
    emoji: "🎨",
  },
  {
    id: "calculator",
    name: "Retro Calculator",
    url: "https://www.online-calculator.com/full-screen-calculator/",
    tagline: "Classic full-screen calculator",
    emoji: "🧮",
  },
];

export const SOUNDBOARDS: HubItem[] = [
  {
    id: "myinstants",
    name: "MyInstants Soundboard",
    url: "https://www.myinstants.com",
    tagline: "The biggest instant sound button board",
    emoji: "🔊",
  },
  {
    id: "myinstants-trending",
    name: "MyInstants Trending",
    url: "https://www.myinstants.com/en/index/us/",
    tagline: "What everyone is spamming right now",
    emoji: "📈",
  },
];

export const ACCESS_CODE = "flamehub1243";
// The owner code lives only in server code (src/lib/flamehub-codes.server.ts)
// so it never ships to the browser.
