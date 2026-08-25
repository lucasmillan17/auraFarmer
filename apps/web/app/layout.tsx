import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AURA Arena — 1v1 Face Duel",
  description: "1v1 face duels. Measure your aura. Climb the ranks.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-dvh bg-void text-text antialiased">
        {children}
      </body>
    </html>
  );
}
