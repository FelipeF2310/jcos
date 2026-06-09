import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Jersey City Operating System",
  description: "Citywide performance management platform",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
