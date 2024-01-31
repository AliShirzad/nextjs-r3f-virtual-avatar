import React from "react";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ChatProvider } from "../hooks/useChat";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "AI Avatar",
  description: "Avatar that can talk",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className} suppressHydrationWarning>
        <ChatProvider>{children}</ChatProvider>
      </body>
    </html>
  );
}
