import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import "./globals.css";
import { NextIntlClientProvider, hasLocale, useMessages } from "next-intl";
import { AuthProvider } from "@/context/AuthContext";
import { Toaster } from 'react-hot-toast';
import {routing} from "@/i18n/routing";
import {notFound} from "next/navigation";


export default async function RootLayout({
  children, params
}: {
  children: React.ReactNode;
    params: Promise<{ locale: string }>;
}) {
    const { locale } = await params;

    if (!hasLocale(routing.locales, locale)) {
        notFound();
    }

  return (
    <html lang="en">
      <body
        className={`${GeistSans.className} antialiased`}
      >
      <AuthProvider>
          <NextIntlClientProvider>
              {children}
              <Toaster position="top-right"/>
          </NextIntlClientProvider>
      </AuthProvider>
      </body>
    </html>
  );
}
