import type { Metadata } from "next";
import "./globals.css";
// import { Geist } from "next/font/google";

// const geistSans = Geist({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "SearchTrace | Evidence gap foundation",
  description:
    "A service-independent foundation for reviewing evidence gaps between opportunities and résumés.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  // return (
  //   <html lang="en" className={`h-full antialiased ${geistSans.className}`}>
  //     <body className={`min-h-full ${geistSans.className}`}>{children}</body>
  //   </html>
  // );

  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full">{children}</body>
    </html>
  );
}
