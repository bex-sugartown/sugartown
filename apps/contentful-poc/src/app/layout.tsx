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
  var valid = ['light-pink-moon light-shop', 'dark-pink-moon dark-shop'];
  if (valid.indexOf(stored) !== -1) {
    document.documentElement.setAttribute('data-theme', stored);
  } else {
    localStorage.removeItem('st-poc-theme');
  }
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
    <html lang="en" data-theme="light-pink-moon light-shop">
      <head>
        {/* eslint-disable-next-line react/no-danger */}
        <script dangerouslySetInnerHTML={{ __html: noFlashScript }} />
      </head>
      <body>
        <SiteHeader settings={settings} />
        <main>{children}</main>
        <SiteFooter settings={settings} />
      </body>
    </html>
  );
}
