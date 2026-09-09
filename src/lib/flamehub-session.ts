export type Member = {
  id: string;
  first_name: string;
  last_name: string;
  avatar_url: string | null;
  created_at: string;
  last_seen_at: string;
};

const MEMBER_KEY = "flamehub.member_id";
const TOKEN_KEY = "flamehub.session_token";
const UNLOCK_KEY = "flamehub.unlocked";

export function readStoredMemberId(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(MEMBER_KEY);
}

export function readStoredToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(TOKEN_KEY);
}

export function storeSession(id: string, token: string) {
  window.localStorage.setItem(MEMBER_KEY, id);
  window.localStorage.setItem(TOKEN_KEY, token);
}

export function clearSession() {
  window.localStorage.removeItem(MEMBER_KEY);
  window.localStorage.removeItem(TOKEN_KEY);
  window.sessionStorage.removeItem(UNLOCK_KEY);
}

export function readUnlocked(): boolean {
  if (typeof window === "undefined") return false;
  return window.sessionStorage.getItem(UNLOCK_KEY) === "1";
}

export function storeUnlocked() {
  window.sessionStorage.setItem(UNLOCK_KEY, "1");
}

/** Downscales a picked image to a small square data URL so it fits in the profile row. */
export async function fileToAvatarDataUrl(file: File, size = 192): Promise<string> {
  const bitmap = await createImageBitmap(file);
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas unavailable");
  const side = Math.min(bitmap.width, bitmap.height);
  ctx.drawImage(
    bitmap,
    (bitmap.width - side) / 2,
    (bitmap.height - side) / 2,
    side,
    side,
    0,
    0,
    size,
    size,
  );
  return canvas.toDataURL("image/jpeg", 0.82);
}

export function initials(member: Pick<Member, "first_name" | "last_name">) {
  return `${member.first_name.charAt(0)}${member.last_name.charAt(0)}`.toUpperCase();
}

export function proxyUrl(url: string) {
  return `/stream-application?url=${encodeURIComponent(url)}`;
}
