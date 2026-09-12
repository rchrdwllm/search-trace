import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { AppProviders } from "@/app/providers";
import { TRPCClientProvider } from "@/trpc/client";

const geistSans = localFont({
  src: "./fonts/geist-latin.woff2",
  variable: "--font-geist-sans",
});

const geistMono = localFont({
  src: "./fonts/geist-mono-latin.woff2",
  variable: "--font-geist-mono",
});

export const metadata: Metadata = {
  title: "SearchTrace | Evidence gap foundation",
  description:
    "A service-independent foundation for reviewing evidence gaps between opportunities and résumés.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`h-full antialiased ${geistSans.variable} ${geistMono.variable}`}
    >
      <body className={`min-h-full ${geistSans.className}`}>
        <AppProviders>
          <TRPCClientProvider>{children}</TRPCClientProvider>
        </AppProviders>
      </body>
    </html>
  );
}
