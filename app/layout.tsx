import type { Metadata } from "next";
import Script from "next/script";
import { Geist, Geist_Mono, Inconsolata, Lora, Newsreader, Permanent_Marker } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Monospaced lettering for the "Project Snapshots" heading.
const inconsolata = Inconsolata({
  variable: "--font-inconsolata",
  subsets: ["latin"],
});

// Serif for the hero's description paragraph.
const lora = Lora({
  variable: "--font-lora",
  subsets: ["latin"],
});

// Reading serif for the bio paragraph.
const newsreader = Newsreader({
  variable: "--font-newsreader",
  subsets: ["latin"],
});

// Marker lettering for the hero's "from raw ideas -> real impact" line.
const permanentMarker = Permanent_Marker({
  variable: "--font-marker",
  weight: "400",
  subsets: ["latin"],
});

const siteTitle = "Nethra Prabhu: Product & Product Marketing, Healthtech";
const siteDescription =
  "Healthtech product & product marketing. I find the real problem, then build the fix, like the clinical evidence hub I researched and shipped for sales reps.";

// Link previews need full URLs. On Vercel this is the site's production domain (including a custom domain once added);
// running locally it's localhost.
const siteUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL
  ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
  : `http://localhost:${process.env.PORT ?? 3000}`;

// The preview image itself comes from app/opengraph-image.tsx.
export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: siteTitle,
    // Future pages, e.g. title: "Clinical Education Hub" -> "Clinical Education Hub · Nethra Prabhu"
    template: "%s · Nethra Prabhu",
  },
  description: siteDescription,
  authors: [{ name: "Nethra Prabhu" }],
  openGraph: {
    type: "website",
    siteName: "Nethra Prabhu",
    title: siteTitle,
    description: siteDescription,
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: siteTitle,
    description: siteDescription,
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      // The desktop-scale script below sets inline styles on <html> before React loads.
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} ${inconsolata.variable} ${lora.variable} ${newsreader.variable} ${permanentMarker.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {/* Laptops and desktops (1024px+ wide): lay the page out at a 1440x900 design size and scale it to the screen's
            width, so it looks exactly the same on every laptop, just larger or smaller. Phones and tablets keep their
            own layouts. */}
        <Script id="desktop-scale" strategy="beforeInteractive">{`
          (function () {
            var root = document.documentElement;
            function fit() {
              // The page's width without the scrollbar (unaffected by the zoom itself).
              var width = root.clientWidth || window.innerWidth;
              if (window.innerWidth >= 1024) {
                root.style.zoom = String(width / 1440);
                root.style.setProperty("--vw", "14.4px");
                root.style.setProperty("--vh", "9px");
              } else {
                root.style.zoom = "";
                root.style.removeProperty("--vw");
                root.style.removeProperty("--vh");
              }
            }
            fit();
            window.addEventListener("resize", fit);
            window.addEventListener("load", fit);
            // Re-fit once the page has content (a scrollbar may have appeared, narrowing the page).
            new ResizeObserver(fit).observe(root);
          })();
        `}</Script>
        {children}
      </body>
    </html>
  );
}
