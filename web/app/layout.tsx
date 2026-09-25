import type { Metadata, Viewport } from "next";
import "./globals.css";
import { LangProvider } from "@/lib/context/LangContext";
import { ThemeProvider } from "@/lib/context/ThemeContext";
import { AppHeader } from "@/components/layout/AppHeader";
import { AppFooter } from "@/components/layout/AppFooter";

export const metadata: Metadata = {
  title: "Mythenena — Écoute & soutien en santé mentale",
  description:
    "Plateforme d'écoute et de soutien en santé mentale à Madagascar : évaluation, entraide, assistant IA et annuaire de professionnels. Anonyme et gratuit.",
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f0f7f5" },
    { media: "(prefers-color-scheme: dark)", color: "#0c1817" },
  ],
};

/** Applique le thème avant le premier rendu pour éviter tout clignotement. */
const themeScript = `(function(){try{var t=localStorage.getItem("mythenena.theme");if(t!=="light"&&t!=="dark"){t=window.matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light"}if(t==="dark"){document.documentElement.classList.add("dark")}document.documentElement.style.colorScheme=t}catch(e){}})();`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="flex min-h-dvh flex-col">
        <ThemeProvider>
          <LangProvider>
            <a href="#contenu" className="skip-link">
              Aller au contenu principal
            </a>
            <AppHeader />
            <main id="contenu" className="flex flex-1 flex-col">
              {children}
            </main>
            <AppFooter />
          </LangProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
