'use client';

import { useTranslations, useLocale } from 'next-intl';
import { useRouter, usePathname } from '@/i18n/navigation';
import { Languages } from 'lucide-react';


import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

export function LanguageSwitcher() {
    const t = useTranslations('Navbar');
    const locale = useLocale();
    const router = useRouter();
    const pathname = usePathname();

    const onLanguageChange = (newLocale: string) => {
        router.replace(pathname, { locale: newLocale });
    };

    return (
        <Select onValueChange={onLanguageChange} defaultValue={locale}>
            <SelectTrigger className="w-auto border border-border">
                <div className="flex items-center gap-2">
                    <Languages className="h-4 w-4 text-muted-foreground" />
                    <SelectValue placeholder={t('languageLabel')} />
                </div>
            </SelectTrigger>
            <SelectContent>
                <SelectItem value="tr">{t('turkish')}</SelectItem>
                <SelectItem value="en">{t('english')}</SelectItem>
            </SelectContent>
        </Select>
    );
}