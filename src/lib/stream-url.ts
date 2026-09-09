/** Builds the in-hub streaming URL for any external site. */
export function streamUrl(url: string) {
  return `/stream-application?url=${encodeURIComponent(url)}`;
}
