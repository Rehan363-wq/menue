import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MenuQR — Create Animated Digital Menus",
  description:
    "Turn your paper menu into an interactive experience. QR code menus with animations for restaurants.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="h-full antialiased">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-full flex flex-col bg-background text-foreground">
        {children}
      </body>
    </html>
  );
}
