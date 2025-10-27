import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { ClerkProvider, SignedIn, SignedOut, SignIn } from "@clerk/nextjs";
import { Toaster } from "@/components/ui/sonner";
import { SpeedInsights } from "@vercel/speed-insights/next";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["cyrillic", "latin"],
  display: "swap",
});

const jetBrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["cyrillic", "latin"],
  display: "swap",
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider appearance={{ variables: { colorPrimary: "#fe5933" } }}>
      <html lang="en">
        <body
          className={`${inter.variable} ${jetBrainsMono.variable} antialiased`}
        >
          <SignedOut>
            <main>
              <section className="flex justify-center">
                <SignIn />
              </section>
            </main>
          </SignedOut>
          <SignedIn>
            {children}
            <SpeedInsights />
          </SignedIn>
          <Toaster />
        </body>
      </html>
    </ClerkProvider>
  );
}
