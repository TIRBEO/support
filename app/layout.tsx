import type { Metadata } from "next";
import { TirbeoThemeProvider } from "@tirbeo/theme";
import { ErrorBoundary } from "../components/error-boundary";
import { SupportShell } from "./shell";
import "./globals.css";

export const metadata: Metadata = {
  title: "Support — Tirbeo",
  description: "Tirbeo support and contact",
};

// Theme script that reads from localStorage and applies the correct theme
// This runs before React to prevent flash of unstyled content (FOUC)
const themeScript = `
  (function() {
    try {
      var theme = localStorage.getItem('tirbeo-theme-mode') || 'dark';
      var root = document.documentElement;
      root.classList.remove('dark', 'light');
      root.classList.add(theme);
      root.setAttribute('data-theme', theme);
    } catch (e) {
      document.documentElement.classList.add('dark');
    }
  })();
`;

export default function SupportLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head><script dangerouslySetInnerHTML={{ __html: themeScript }} /></head>
      <body>
        <TirbeoThemeProvider>
          <ErrorBoundary>
            <SupportShell>{children}</SupportShell>
          </ErrorBoundary>
        </TirbeoThemeProvider>
      </body>
    </html>
  );
}
