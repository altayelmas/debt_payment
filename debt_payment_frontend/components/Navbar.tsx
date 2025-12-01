'use client';

import {useAuth} from "@/context/AuthContext";
import {useRouter, Link} from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { LogOut, LineChart, LayoutDashboard } from "lucide-react"
import { useTranslations } from 'next-intl';

import { LanguageSwitcher } from './LanguageSwitcher';
import {ThemeToggle} from "@/components/theme-toggle";

export default function Navbar() {
    const t = useTranslations('Navbar');
    const router = useRouter();
    const { logout, userEmail} = useAuth();

    const handleLogout = () => {
        logout();
        router.push("/login");
    };

    return (
        <nav className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 w-full mb-8 sticky top-0 z-50">
            <div className="container mx-auto flex justify-between items-center p-4">

                <div className="flex items-center gap-6 md:gap-8">
                    <Link href="/dashboard" className="text-xl font-bold text-gray-900 dark:text-white hover:opacity-80 transition-colors flex items-center gap-2">
                        {t('appTitle')}
                    </Link>

                    <div className="hidden md:flex items-center gap-6">
                        <Link
                            href="/dashboard"
                            className="text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors flex items-center gap-2"
                        >
                            <LayoutDashboard className="h-4 w-4" />
                            Dashboard
                        </Link>

                        <Link
                            href="/tracking"
                            className="text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors flex items-center gap-2"
                        >
                            <LineChart className="h-4 w-4" />
                            {t('trackingLink')}
                        </Link>
                    </div>
                </div>

                <div className="flex items-center gap-2 sm:gap-4">
                    {/* Email Rengi */}
                    <span className="text-sm text-gray-500 dark:text-gray-400 hidden sm:block font-medium">
                        {userEmail}
                    </span>

                    <LanguageSwitcher />
                    <ThemeToggle />

                    <Button
                        variant="destructive"
                        onClick={handleLogout}
                        size="sm"
                        aria-label={t('logoutButton')}
                        className="dark:bg-red-900/30 dark:text-red-400 dark:hover:bg-red-900/50 border border-transparent dark:border-red-900/50"
                    >
                        <LogOut className="mr-0 sm:mr-2 h-4 w-4" />
                        <span className="hidden sm:inline">{t('logoutButton')}</span>
                    </Button>
                </div>
            </div>
        </nav>
    );
}