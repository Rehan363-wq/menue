import type { Metadata } from "next";
import "./globals.css";
import { ToastProvider } from "@/components/Toast";

export const metadata: Metadata = {
  title: "MenuQR — Create Animated Digital Menus",
  description:
    "Turn your paper menu into an interactive experience. QR code menus with animations for restaurants.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="antialiased scroll-smooth" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Manrope:wght@300;400;500;600;700;800&family=Inter:wght@300;400;500;600;700;800&family=Poppins:wght@300;400;500;600;700;800&family=Montserrat:wght@300;400;500;600;700;800&family=Playfair+Display:wght@400;500;600;700;800&family=Outfit:wght@300;400;500;600;700;800&family=Nunito:wght@300;400;500;600;700;800&family=Raleway:wght@300;400;500;600;700;800&family=Lora:wght@400;500;600;700&family=DM+Sans:wght@300;400;500;600;700;800&family=Quicksand:wght@300;400;500;600;700&family=Rubik:wght@300;400;500;600;700;800&family=Josefin+Sans:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-sans antialiased bg-background text-foreground min-h-screen flex flex-col" suppressHydrationWarning>
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}
