import "./globals.css";

import type { Metadata } from "next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Analytics } from "@vercel/analytics/react";
import { Roboto_Mono } from "next/font/google";
import { ThemeProvider } from "next-themes";
import Header from "components/Header";
import Footer from "components/Footer";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL!;

const geistMono = Roboto_Mono({
  variable: "--font-roboto-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: "Silviu Glavan | Personal website",
    template: "%s | Silviu Glavan",
  },
  description:
    "I'm a self-taught developer from Romania 🇷🇴, sharing my thoughts on TypeScript, React, GraphQL, and Serverless.",
  openGraph: {
    title: "Silviu Glavan | Personal website",
    description:
      "I'm a self-taught developer from Romania 🇷🇴, sharing my thoughts on TypeScript, React, GraphQL, and Serverless.",
    url: BASE_URL,
    siteName: "silviu.dev",
    locale: "en_US",
    type: "website",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistMono.variable} antialiased`}
        suppressHydrationWarning
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <Header />
          {children}
          <Footer />
        </ThemeProvider>
        <SpeedInsights />
        <Analytics />
      </body>
    </html>
  );
}
