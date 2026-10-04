/** Drop a stale share hash once the user changes something, so reloads show their latest work. */
export function clearHash(): void {
  if (location.hash) history.replaceState(null, '', location.pathname + location.search)
}
