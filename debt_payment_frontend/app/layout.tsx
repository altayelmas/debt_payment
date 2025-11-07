import type { Metadata } from "next";
import { Geist, Geist_Mono, Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider} from "@/context/AuthContext";
import { Toaster } from 'react-hot-toast';

const inter = Inter({ subsets: ['latin'] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className={`${inter.className} antialiased`}
      >
      <AuthProvider>
          {children}
          <Toaster position="top-right"/>
      </AuthProvider>
      </body>
    </html>
  );
}
