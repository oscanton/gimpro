import { registerSW } from "virtual:pwa-register";

export function registerServiceWorker() {
  const updateServiceWorker = registerSW({
    immediate: true,
    onNeedRefresh() {
      window.dispatchEvent(
        new CustomEvent("gimpro:update-available", {
          detail: { update: () => updateServiceWorker(true) }
        })
      );
    },
    onOfflineReady() {
      window.dispatchEvent(new CustomEvent("gimpro:offline-ready"));
    }
  });
}
