import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "MyWally — Mod Mudah",
  description: "Your wallet companion for confident financial participation",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body className="h-full bg-gray-300 flex justify-center items-start">
        {/*
          Mobile shell: on device/webview this fills the screen naturally.
          On desktop browser this renders as a centered phone-width card.
        */}
        <div className="w-full max-w-[430px] min-h-dvh bg-white shadow-2xl flex flex-col relative overflow-x-hidden">
          {children}
        </div>
      </body>
    </html>
  );
}
