import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Providers from "./providers"; // Import the new provider component

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "invitree.id",
  description: "Beautiful digital invitations",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {/* Wrap the entire application with our session provider */}
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
