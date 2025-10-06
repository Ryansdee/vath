import "./globals.css";
import { ReactNode } from "react";
import { Metadata } from "next";
import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";

export const metadata: Metadata = {
  title: "Vadim Thevelin - Photography Portfolio",
  description: "Portfolio of Vadim Thevelin, photographer and videographer based in France. Explore stunning visuals and creative projects.",

};


export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="fr">
      <head>
        <link rel="icon" href="/logo.jpg" sizes="any" />
        <link rel="icon" href="/logo.jpg" type="image/png" />
      </head>
      <body className="bg-white text-gray-900 w-full">
        <Navbar />
        <main className="min-h-screen container mx-auto">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
