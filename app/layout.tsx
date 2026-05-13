import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Dwarkesh Podcast Flashcards",
  description:
    "Flashcards for blackboard lectures of the Dwarkesh Podcast.",
  openGraph: {
    title: "Dwarkesh Podcast Flashcards",
    description:
      "Flashcards for blackboard lectures of the Dwarkesh Podcast.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Source+Serif+4:opsz,wght@8..60,400;8..60,500;8..60,600;8..60,700&family=JetBrains+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
