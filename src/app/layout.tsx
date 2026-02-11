import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { VisualEditsMessenger } from "orchids-visual-edits";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Textura - Transform Images into Text Art",
  description:
    "Textura lets you transform any photo into a stunning text-based portrait. Upload an image, choose a font style, and generate beautiful typographic art in seconds.",
  keywords: [
    "text portrait",
    "text art",
    "typographic art",
    "image to text",
    "photo to text art",
    "ASCII art",
    "portrait generator",
    "typography",
  ],
  authors: [{ name: "Textura" }],
  openGraph: {
    title: "Textura - Transform Images into Text Art",
    description:
      "Upload any photo and turn it into a beautiful text-based portrait. Choose from signature, script, and elegant fonts.",
    type: "website",
    siteName: "Textura",
  },
  twitter: {
    card: "summary_large_image",
    title: "Textura - Transform Images into Text Art",
    description:
      "Upload any photo and turn it into a beautiful text-based portrait.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
    return (
      <html lang="en">
        <head>
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
          <link
            href="https://fonts.googleapis.com/css2?family=Dancing+Script:wght@400;700&family=Great+Vibes&family=Pacifico&family=Sacramento&family=Caveat:wght@400;700&family=Satisfy&family=Petit+Formal+Script&family=Playfair+Display:ital,wght@0,400;1,400&family=Cormorant+Garamond:ital,wght@0,400;1,400&family=Lobster&family=Raleway:wght@300;400&family=Indie+Flower&display=swap"
            rel="stylesheet"
          />
        </head>
        <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
        <VisualEditsMessenger />
      </body>
    </html>
  );
}
