import "./globals.css";
import { ReactNode } from "react";
import { Metadata } from "next";
import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";

export const metadata: Metadata = {
  title: "Vath photography",
  description: "Vath photography portfolio",

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
        <main className="min-h-screen container mx-auto px-4">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
