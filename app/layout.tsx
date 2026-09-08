import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SearchTrace | Evidence gap foundation",
  description:
    "A service-independent foundation for reviewing evidence gaps between opportunities and résumés.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full">{children}</body>
    </html>
  );
}
