import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Prometeo - Asistente de Compras",
  description: "Prototipo de web app para conversar con un agente Prometeo local."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
