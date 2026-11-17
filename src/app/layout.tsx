import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";

import "./globals.css";

const geistSans = Geist({
  subsets: ["latin"],
  variable: "--font-sans",
});

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
});

export const metadata: Metadata = {
  description: "Write, import and share documents.",
  title: { default: "Docs", template: "%s · Docs" },
};

const RootLayout = ({ children }: LayoutProps<"/">) => (
  <html
    className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    lang="en"
  >
    <body className="flex min-h-full flex-col">
      <TooltipProvider>{children}</TooltipProvider>
      <Toaster position="bottom-center" />
    </body>
  </html>
);

export default RootLayout;
