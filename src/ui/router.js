export function currentRoute() {
  const value = window.location.hash.replace(/^#/, "") || "/home";
  return value.startsWith("/") ? value : `/${value}`;
}

/** @param {string} route */
export function navigate(route) {
  const normalized = route.startsWith("/") ? route : `/${route}`;
  if (currentRoute() === normalized) {
    window.dispatchEvent(new HashChangeEvent("hashchange"));
    return;
  }
  window.location.hash = normalized;
}

/** @param {() => void} callback */
export function watchRoute(callback) {
  window.addEventListener("hashchange", callback);
  return () => window.removeEventListener("hashchange", callback);
}
