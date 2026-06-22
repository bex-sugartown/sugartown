import type { Metadata } from "next";
import "./globals.css";
import "@sugartown/design-system/styles/tokens.css";
import "@sugartown/design-system/styles/theme.pink-moon.css";
import "@sugartown/design-system/styles/theme.shop.css";
import "@sugartown/design-system/styles.css";
import { getSiteSettings } from "@/lib/queries";
import { normalizeSiteSettings } from "@/lib/normalizeSiteSettings";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { SpeedInsights } from "@vercel/speed-insights/next";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();
  return {
    title: settings?.fields.siteTitle ?? "Sugartown Digital",
    description: settings?.fields.metaDescription ?? "",
  };
}

// Inline script runs before paint to apply persisted theme — prevents flash.
// Theme toggle removed — always light-shop until a proper toggle is designed.
// Clears any stale dark-mode localStorage preference from prior dev sessions.
const noFlashScript = `
(function() {
  localStorage.removeItem('st-poc-theme');
})();
`;

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const rawSettings = await getSiteSettings();
  const settings = normalizeSiteSettings(rawSettings);

  return (
    <html lang="en" data-theme="light-pink-moon light-shop" suppressHydrationWarning>
      <head>
        {/* eslint-disable-next-line react/no-danger */}
        <script dangerouslySetInnerHTML={{ __html: noFlashScript }} />
      </head>
      <body>
        <SiteHeader settings={settings} />
        <main>{children}</main>
        <SiteFooter settings={settings} />
        <SpeedInsights />
      </body>
    </html>
  );
}
