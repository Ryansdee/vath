import "./globals.css";
import { ReactNode } from "react";
import { Metadata, Viewport } from "next";
import { Providers } from "./providers";
import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";

// Métadonnées SEO optimales
export const metadata: Metadata = {
  metadataBase: new URL('https://vath-portofolio.netlify.app'), // Remplacez par votre vraie URL
  title: {
    default: "Vadim Thevelin - Photography Portfolio",
    template: "%s | Vadim Thevelin"
  },
  description:
    "Portfolio of Vadim Thevelin, photographer and videographer based in France. Explore stunning visuals and creative projects.",
  keywords: [
    "photography",
    "videography",
    "portfolio",
    "photographer",
    "France",
    "Vadim Thevelin",
    "creative photography",
    "visual arts"
  ],
  authors: [{ name: "Vadim Thevelin" }],
  creator: "Vadim Thevelin",
  publisher: "Vadim Thevelin",
  
  // Open Graph (Facebook, LinkedIn)
  openGraph: {
    type: "website",
    locale: "fr_FR",
    url: "https://vath-portofolio.netlify.app",
    siteName: "Vadim Thevelin Photography",
    title: "Vadim Thevelin - Photography Portfolio",
    description: "Portfolio of Vadim Thevelin, photographer and videographer based in France.",
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
    title: "Vadim Thevelin - Photography Portfolio",
    description: "Portfolio of Vadim Thevelin, photographer and videographer based in France.",
    images: ["/og-image.jpg"],
    creator: "@vadimthevelin" // Remplacez par votre handle Twitter
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
    google: "votre-code-google", // Ajoutez votre code de vérification Google
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
        color: "#090860"
      }
    ]
  },
  
  // Manifest
  manifest: "/site.webmanifest",
  
  // Autres métadonnées
  category: "photography",
  alternates: {
    canonical: "https://vath-portofolio.netlify.app",
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
    <html lang="fr" suppressHydrationWarning>
      <head>
        {/* Preconnect pour améliorer les performances */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        
        {/* DNS Prefetch pour les ressources externes */}
        <link rel="dns-prefetch" href="https://fonts.googleapis.com" />
        
        {/* Structured Data (JSON-LD) pour le SEO */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Person",
              "name": "Vadim Thevelin",
              "url": "https://vath-portofolio.netlify.app",
              "image": "https://vath-portofolio.netlify.app/profile.jpg",
              "jobTitle": "Photographer & Videographer",
              "description": "Professional photographer and videographer based in France",
              "address": {
                "@type": "PostalAddress",
                "addressCountry": "France"
              },
              "sameAs": [
                "https://instagram.com/vadimthevelin",
                "https://twitter.com/vadimthevelin",
                // Ajoutez vos autres réseaux sociaux
              ]
            })
          }}
        />
      </head>
      <body className="bg-white text-gray-900 transition-colors duration-300 dark:bg-black dark:text-gray-100 antialiased">
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