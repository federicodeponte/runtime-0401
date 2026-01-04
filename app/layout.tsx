import type { Metadata } from "next";
import Nav from "@/components/Nav";
import "./globals.css";

export const metadata: Metadata = {
  title: "RunIt - FastAPI Runtime",
  description: "Run FastAPI apps instantly. Shareable. No setup.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <Nav />
        <main className="min-h-screen">
          {children}
        </main>
      </body>
    </html>
  );
}
