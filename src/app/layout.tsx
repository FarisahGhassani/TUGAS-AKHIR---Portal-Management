import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/store/Providers";

export const metadata: Metadata = {
  title: "PORTAL MANAGEMENT · Agency Modelling & Talent",
  description:
    "Portal Management mengelola roster talent, batch kelas modelling, dan inquiry client dalam satu website terpusat yang modern",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="antialiased">
      <head>
        <link
          rel="preconnect"
          href="https://api.fontshare.com"
          crossOrigin=""
        />
        <link
          rel="stylesheet"
          href="https://api.fontshare.com/v2/css?f[]=satoshi@400,500,700&f[]=clash-display@500,600,700&display=swap"
        />
      </head>
      <body className="bg-background text-on-background min-h-screen">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
