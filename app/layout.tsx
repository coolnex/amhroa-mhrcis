// app/layout.tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { ChatProvider } from "@/providers/ChatProvider";
import { Suspense } from "react";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "AMHROA - African Mental Health Rights & Advocacy",
  description: "African Mental Health Rights & Advocacy Organization",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
      </head>
      <body className={`${inter.variable} antialiased`}>
        <Providers>
          <ChatProvider>
            <Suspense fallback={
              <div className="min-h-screen flex items-center justify-center bg-slate-900">
                <div className="w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
            }>
              {children}
            </Suspense>
          </ChatProvider>
        </Providers>
      </body>
    </html>
  );
}