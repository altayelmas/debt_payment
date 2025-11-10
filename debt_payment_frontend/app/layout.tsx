import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import "./globals.css";
import { AuthProvider} from "@/context/AuthContext";
import { Toaster } from 'react-hot-toast';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className={`${GeistSans.className} antialiased`}
      >
      <AuthProvider>
          {children}
          <Toaster position="top-right"/>
      </AuthProvider>
      </body>
    </html>
  );
}
