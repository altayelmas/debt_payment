import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import "./globals.css";
import { AuthProvider} from "@/context/AuthContext";
import { Toaster } from 'react-hot-toast';

import { NextIntlClientProvider, useMessages } from 'next-intl';

export default function RootLayout({
  children,
    params: { lang }
}: {
  children: React.ReactNode;
    params: { lang: string };
}) {
    const messages = useMessages();

  return (
    <html lang="en">
      <body
        className={`${GeistSans.className} antialiased`}
      >
      <AuthProvider>
          <NextIntlClientProvider locale={lang} messages={messages}>
              {children}
              <Toaster position="top-right"/>
          </NextIntlClientProvider>
      </AuthProvider>
      </body>
    </html>
  );
}
