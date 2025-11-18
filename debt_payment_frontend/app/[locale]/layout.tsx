import type {Metadata} from "next";
import {GeistSans} from "geist/font/sans";
import {GeistMono} from "geist/font/mono";
import "./globals.css";
import {NextIntlClientProvider, hasLocale, useMessages} from "next-intl";
import {AuthProvider} from "@/context/AuthContext";
import {Toaster} from 'react-hot-toast';
import {routing} from "@/i18n/routing";
import {notFound} from "next/navigation";
import {ThemeProvider} from "@/components/theme-provider";
import {getMessages} from "next-intl/server";


export default async function RootLayout({
                                             children, params
                                         }: {
    children: React.ReactNode;
    params: { locale: string };
}) {
    const {locale} = params;

    if (!hasLocale(routing.locales, locale)) {
        notFound();
    }

    const messages = await getMessages();

    return (
        <html lang={locale} suppressHydrationWarning>
        <body
            className={`${GeistSans.className} antialiased`}
        >
        <ThemeProvider
            attribute="class"
            defaultTheme="light"
            enableSystem
            disableTransitionOnChange
        >
            <AuthProvider>
                <NextIntlClientProvider locale={locale} messages={messages}>
                    {children}
                    <Toaster position="top-right"/>
                </NextIntlClientProvider>
            </AuthProvider>
        </ThemeProvider>
        </body>
        </html>
    );
}
