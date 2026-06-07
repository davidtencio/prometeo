import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Prometeo - Asistente de Compras",
    short_name: "Prometeo",
    description: "Asistente de compras institucionales.",
    start_url: "/",
    display: "standalone",
    background_color: "#0c1117",
    theme_color: "#0c1117",
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any"
      }
    ]
  };
}
