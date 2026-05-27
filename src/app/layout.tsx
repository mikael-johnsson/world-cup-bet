import type { Metadata } from "next";
// @ts-ignore
import "./globals.css";
import Header from "@/components/Header";
import { AuthProvider } from "@/context/AuthContext";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Mickes VM-tips",
  description:
    "En betting-app för fotbolls-VM 2026 byggd med Next.js, React Hook Form, och MongoDB",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="sv">
      <body>
        <AuthProvider>
          <Header />
          {children}
        </AuthProvider>
        <Footer />
      </body>
    </html>
  );
}
