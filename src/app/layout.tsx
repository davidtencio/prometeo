import type { Metadata, Viewport } from "next";
import { ServiceWorkerRegister } from "@/components/ServiceWorkerRegister";
import "./globals.css";

export const metadata: Metadata = {
  title: "Prometeo - Asistente de Compras",
  description: "Asistente de compras institucionales.",
  appleWebApp: {
    capable: true,
    title: "Prometeo",
    statusBarStyle: "black-translucent"
  }
};

export const viewport: Viewport = {
  themeColor: "#0c1117"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body>
        {children}
        <ServiceWorkerRegister />
      </body>
    </html>
  );
}
