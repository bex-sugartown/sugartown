import type { Metadata } from "next";
import "./globals.css";
import "@sugartown/design-system/styles/tokens.css";
import "@sugartown/design-system/styles/theme.pink-moon.css";
import "@sugartown/design-system/styles.css";
import { getSiteSettings } from "@/lib/queries";
import { ThemeToggle } from "@/components/ThemeToggle";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();
  return {
    title: settings?.fields.siteTitle ?? "Sugartown Digital",
    description: settings?.fields.metaDescription ?? "",
  };
}

// Inline script runs before paint to apply persisted theme — prevents flash.
const noFlashScript = `
(function() {
  var stored = localStorage.getItem('st-poc-theme');
  if (stored === 'light-pink-moon' || stored === 'dark-pink-moon') {
    document.documentElement.setAttribute('data-theme', stored);
  }
})();
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-theme="light-pink-moon">
      <head>
        {/* eslint-disable-next-line react/no-danger */}
        <script dangerouslySetInnerHTML={{ __html: noFlashScript }} />
      </head>
      <body>
        {children}
        <ThemeToggle />
      </body>
    </html>
  );
}
