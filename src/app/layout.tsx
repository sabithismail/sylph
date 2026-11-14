import type { Metadata, Viewport } from "next";
import "@fontsource/dancing-script/600.css";
import "@fontsource/dancing-script/700.css";
import "@fontsource/caveat/500.css";
import "@fontsource/caveat/600.css";
import "@fontsource/dm-sans/400.css";
import "@fontsource/dm-sans/500.css";
import "@fontsource/dm-sans/600.css";
import "./globals.css";

export const metadata: Metadata = {
  title: "Sylph",
  description:
    "A garden spirit that turns your story into poems, stories and quotes.",
};

export const viewport: Viewport = {
  themeColor: "#0f1f17",
  colorScheme: "dark",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
