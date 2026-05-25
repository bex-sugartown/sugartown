import type { Metadata } from "next";
import "./globals.css";
import "@sugartown/design-system/styles/tokens.css";
import "@sugartown/design-system/styles/theme.pink-moon.css";
import "@sugartown/design-system/styles.css";
import { getSiteSettings } from "@/lib/queries";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();
  return {
    title: settings?.fields.siteTitle ?? "Sugartown Digital",
    description: settings?.fields.metaDescription ?? "",
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-theme="light-pink-moon">
      <body>{children}</body>
    </html>
  );
}
