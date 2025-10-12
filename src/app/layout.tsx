import "./globals.css";
import { ReactNode } from "react";
import { Metadata, Viewport } from "next";
import { Providers } from "./providers";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

// Métadonnées SEO optimales
export const metadata: Metadata = {
  metadataBase: new URL('https://vadimthevelin.com'), // Remplacez par votre vraie URL
  title: {
    default: "Vadim Thevelin - Photographer, Videographer & Director",
    template: "%s | Vadim Thevelin"
  },
  description:
    "Portfolio of Vadim Thevelin, photographer, videographer and director based in Brussels. Explore stunning visuals and creative projects.",
  keywords: [
    "photography",
    "videography",
    "director",
    "portfolio",
    "photographer",
    "Brussels",
    "Belgium",
    "Vadim Thevelin",
    "creative photography",
    "visual arts",
    "Main d'Oeuvre"
  ],
  authors: [{ name: "Vadim Thevelin" }],
  creator: "Vadim Thevelin",
  publisher: "Vadim Thevelin",
  
  // Open Graph (Facebook, LinkedIn)
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://vadimthevelin.com",
    siteName: "Vadim Thevelin Photography",
    title: "Vadim Thevelin - Photographer, Videographer & Director",
    description: "Portfolio of Vadim Thevelin, photographer, videographer and director based in Brussels.",
    images: [
      {
        url: "/og-image.jpg", // Créez une image 1200x630px
        width: 1200,
        height: 630,
        alt: "Vadim Thevelin Photography Portfolio"
      }
    ]
  },
  
  // Twitter
  twitter: {
    card: "summary_large_image",
    title: "Vadim Thevelin - Photographer, Videographer & Director",
    description: "Portfolio of Vadim Thevelin, photographer, videographer and director based in Brussels.",
    images: ["/og-image.jpg"],
    creator: "@vadimthevelin"
  },
  
  // Robots
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  
  // Vérification
  verification: {
    google: "votre-code-google", // Ajoutez votre code de vérification Google Search Console
    // yandex: "votre-code-yandex",
    // bing: "votre-code-bing"
  },
  
  // Icônes optimisées
  icons: {
    icon: [
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }
    ],
    other: [
      {
        rel: "mask-icon",
        url: "/safari-pinned-tab.svg",
        color: "#000000"
      }
    ]
  },
  
  // Manifest
  manifest: "/site.webmanifest",
  
  // Autres métadonnées
  category: "photography",
  alternates: {
    canonical: "https://vadimthevelin.com",
  }
};

// Viewport optimisé
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#000000' }
  ]
};

export default function RootLayout({ children }: { children: ReactNode }) {

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Preconnect pour améliorer les performances */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://firebasestorage.googleapis.com" />
        
        {/* DNS Prefetch pour les ressources externes */}
        <link rel="dns-prefetch" href="https://fonts.googleapis.com" />
        <link rel="dns-prefetch" href="https://firebasestorage.googleapis.com" />
        
        {/* Structured Data (JSON-LD) pour le SEO */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Person",
              "name": "Vadim Thevelin",
              "url": "https://vadimthevelin.com",
              "image": "https://vadimthevelin.com/profile.jpg",
              "jobTitle": "Photographer, Videographer & Director",
              "description": "Professional photographer, videographer and director based in Brussels, Belgium",
              "address": {
                "@type": "PostalAddress",
                "addressLocality": "Brussels",
                "addressCountry": "Belgium"
              },
              "sameAs": [
                "https://instagram.com/vadimthevelin",
                "https://instagram.com/maindoeuvre.productions"
              ]
            })
          }}
        />
      </head>
      <body className="bg-white text-gray-900 antialiased">
        <Providers>
          <Navbar />
          <main className="min-h-screen" id="main-content">
            {children}
          </main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}