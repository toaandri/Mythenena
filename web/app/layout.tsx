import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Mythenena — Écoute & Soutien en Santé Mentale",
  description:
    "Plateforme de pré-dépistage, écoute IA et entraide en santé mentale à Madagascar.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  );
}
