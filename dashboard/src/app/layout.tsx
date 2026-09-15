import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SENTINEL - Autonomous Cyber Defense Platform",
  description: "Real-time threat detection, correlation, and automated containment matrix.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-[#0a0d14] text-gray-100 antialiased">{children}</body>
    </html>
  );
}
