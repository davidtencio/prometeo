// Service worker mínimo: habilita la instalación (PWA) sin cachear.
// No interceptamos las respuestas, así que todo va a la red con normalidad.
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (event) => event.waitUntil(self.clients.claim()));
self.addEventListener("fetch", () => {
  // Passthrough intencional: la presencia del handler ayuda a la instalabilidad.
});
