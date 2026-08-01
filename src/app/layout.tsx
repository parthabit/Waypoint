import type { Metadata } from "next";
import { Inter, Poppins, JetBrains_Mono } from "next/font/google";
import { Toaster } from "sonner";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { QueryProvider } from "@/components/providers/query-provider";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const poppins = Poppins({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-poppins",
});
const jbMono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-jbmono" });

export const metadata: Metadata = {
  title: "Waypoint — Multi-Stop Trip Planner",
  description:
    "Plan trips across multiple stops with automatically optimized routes, live weather, and turn-by-turn directions — powered entirely by free, open APIs.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${poppins.variable} ${jbMono.variable} antialiased`}>
        <ThemeProvider>
          <QueryProvider>
            <div className="flex min-h-screen flex-col">
              <Header />
              <main className="flex-1">{children}</main>
              <Footer />
            </div>
            <Toaster richColors position="top-center" />
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
