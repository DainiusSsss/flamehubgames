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
    id: "crazygames",
    name: "CrazyGames",
    url: "https://www.crazygames.com",
    tagline: "Thousands of instant browser games",
    emoji: "🎮",
  },
  {
    id: "nowgg",
    name: "now.gg",
    url: "https://now.gg",
    tagline: "Cloud-streamed mobile games",
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
    url: "https://sites.google.com/view/drive-u-7-home/home",
    tagline: "The classic unblocked games drive",
    emoji: "🗂️",
  },
];

export const APPS: HubItem[] = [
  {
    id: "tiktok",
    name: "TikTok",
    url: "https://www.tiktok.com",
    tagline: "Short-form video feed",
    emoji: "🎵",
  },
  {
    id: "spotify",
    name: "Spotify",
    url: "https://open.spotify.com",
    tagline: "Music and podcasts",
    emoji: "🎧",
  },
  {
    id: "snapchat",
    name: "Snapchat",
    url: "https://web.snapchat.com",
    tagline: "Snaps and chats on the web",
    emoji: "👻",
  },
  {
    id: "youtube",
    name: "YouTube",
    url: "https://www.youtube.com",
    tagline: "Videos, music and live streams",
    emoji: "▶️",
  },
  {
    id: "chatgpt",
    name: "ChatGPT",
    url: "https://chatgpt.com",
    tagline: "AI homework and idea partner",
    emoji: "🤖",
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
