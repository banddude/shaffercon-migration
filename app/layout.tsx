import type { Metadata } from "next";
import "./globals.css";
import Header from "./components/Header";
import Footer from "./components/Footer";
import siteConfig from "@/data/site-config.json";
import type { SiteConfig } from "@/types";

const config = siteConfig as SiteConfig;

export const metadata: Metadata = {
  title: config.siteName,
  description: config.description,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="flex flex-col min-h-screen">
        <Header />

        <main className="flex-grow">
          <div className="container mx-auto px-4 py-8 max-w-6xl">
            {children}
          </div>
        </main>

        <Footer />
      </body>
    </html>
  );
}
