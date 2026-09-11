export type HubItem = {
  id: string;
  name: string;
  url: string;
  tagline: string;
  emoji: string;
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
  {
    id: "poki",
    name: "Poki",
    url: "https://poki.com",
    tagline: "Huge library of instant web games",
    emoji: "🕹️",
  },
  {
    id: "fnaf",
    name: "Five Nights at Freddy's",
    url: "https://fivenightsatfreddysgame.io",
    tagline: "Survive the night shift",
    emoji: "🐻",
  },
];

export const APPS: HubItem[] = [
  {
    id: "tiktok",
    name: "TikTok",
    url: "https://www.tiktok.com",
    tagline: "Short-form video feed",
    emoji: "🎵",
    translateProxy: true,
  },
  {
    id: "spotify",
    name: "Spotify",
    url: "https://open.spotify.com",
    tagline: "Music and podcasts",
    emoji: "🎧",
    translateProxy: true,
  },
  {
    id: "snapchat",
    name: "Snapchat",
    url: "https://web.snapchat.com",
    tagline: "Snaps and chats on the web",
    emoji: "👻",
    translateProxy: true,
  },
  {
    id: "youtube",
    name: "YouTube",
    url: "https://www.youtube.com",
    tagline: "Videos, music and live streams",
    emoji: "▶️",
    translateProxy: true,
  },
  {
    id: "chatgpt",
    name: "ChatGPT",
    url: "https://chatgpt.com",
    tagline: "AI homework and idea partner",
    emoji: "🤖",
    translateProxy: true,
  },
  {
    id: "croxyproxy",
    name: "CroxyProxy",
    url: "https://www.croxyproxy.com",
    tagline: "Free web proxy for blocked sites",
    emoji: "🛡️",
  },
  {
    id: "xboxcloud",
    name: "Xbox Cloud Gaming",
    url: "https://www.xbox.com/en-us/play",
    tagline: "Stream console games in the browser",
    emoji: "🎯",
  },
  {
    id: "twitch",
    name: "Twitch",
    url: "https://twitch.tv",
    tagline: "Live streams and esports",
    emoji: "🟣",
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
