'use client';

import * as React from "react";
import { Contrast, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useTranslations } from "next-intl";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {useEffect, useState} from "react";

export function ThemeToggle() {
    const [mounted, setMounted] = useState(false);
    const { theme, setTheme } = useTheme();
    const t = useTranslations('Navbar');

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return (
            <Select disabled={true}>
                <SelectTrigger className="w-auto border border-border">
                    <div className="flex items-center gap-2">
                        <Contrast className="h-4 w-4 text-muted-foreground" />
                        <SelectValue placeholder={t('themeLabel') || 'Theme'} />
                    </div>
                </SelectTrigger>
            </Select>
        );
    }

    return (
        <Select onValueChange={setTheme} value={theme}>
            <SelectTrigger className="w-auto border border-border">
                <div className="flex items-center gap-2">
                    <SelectValue placeholder={t('themeLabel') || 'Theme'} />
                </div>
            </SelectTrigger>
            <SelectContent>
                <SelectItem value="light">
                    <div className="flex items-center gap-2">
                        <Sun className="h-4 w-4"/>
                        {t('lightMode') || 'Light'}
                    </div>
                </SelectItem>
                <SelectItem value="dark">
                    <div className="flex items-center gap-2">
                        <Moon className="h-4 w-4"/>
                        {t('darkMode') || 'Dark'}
                    </div>
                </SelectItem>
                <SelectItem value="system">
                    <div className="flex items-center gap-2">
                        <Contrast className="h-4 w-4"/>
                        {t('systemMode') || 'System'}
                    </div>
                </SelectItem>
            </SelectContent>
        </Select>
    );
}