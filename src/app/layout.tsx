import type { Metadata } from "next";
import { Inter, Arima } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const arima = Arima({
  subsets: ["latin"],
  variable: "--font-arima",
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "MR Fancy Store | SaaS Retail POS",
  description: "Premium SaaS-based Inventory + POS + CRM for retail stores in Tamil Nadu.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${arima.variable} antialiased font-sans`}>
        {children}
      </body>
    </html>
  );
}
