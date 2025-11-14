'use client';

import {useAuth} from "@/context/AuthContext";
import {useRouter, Link} from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react"
import { useTranslations } from 'next-intl';

import { LanguageSwitcher } from './LanguageSwitcher';

export default function Navbar() {
    const t = useTranslations('Navbar');
    const router = useRouter();
    const { logout, userEmail} = useAuth();

    const handleLogout = () => {
        logout();
        router.push("/login");
    };

    return (
        <nav className={"bg-background border-b w-full mb-8"}>
            <div className={"container mx-auto flex justify-between items-center p-4 gap-2"}>
                <Link href="/dashboard" className="text-xl font-bold text-primary hover:opacity-80 transition-colors">
                    {t('appTitle')}
                </Link>
                <div className={"flex items-center gap-2 sm:gap-4"}>
                    <span className={"text-sm text-muted-foreground hidden sm:block"}>
                        {userEmail}
                    </span>
                    <LanguageSwitcher />
                    <Button
                        variant="destructive"
                        onClick={handleLogout}
                        size="sm"
                        aria-label={t('logoutButton')}
                    >
                        <LogOut className="mr-0 sm:mr-2 h-4 w-4" />
                        <span className="hidden sm:inline">{t('logoutButton')}</span>
                    </Button>
                </div>
            </div>
        </nav>
    );
}