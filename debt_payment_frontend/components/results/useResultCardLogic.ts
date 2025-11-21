import { useState } from 'react';
import { useLocale, useTranslations } from "next-intl";
import api from "@/lib/api";
import toast from "react-hot-toast";

export const useResultCardLogic = (reportId: string, isSnowball: boolean) => {
    const locale = useLocale();
    const t = useTranslations('ResultsPage.ResultCard');
    const [isLoading, setIsLoading] = useState(false);

    const formatDateString = (dateString: string | undefined) => {
        if (!dateString) return "";
        try {
            const date = new Date(dateString);
            if (!isNaN(date.getTime())) {
                return date.toLocaleDateString(locale === 'tr' ? 'tr-TR' : 'en-US', {
                    month: 'long',
                    year: 'numeric'
                });
            }
            return dateString;
        } catch (e) {
            return dateString;
        }
    };

    const formatPayOffDate = (rawString: string) => {
        if (!rawString) return "";
        const regex = /^([a-zA-Z]+ \d{4}) \((\d+) Months\)$/;
        const match = rawString.match(regex);

        if (match) {
            const datePart = match[1];
            const monthsCount = match[2];
            const translatedDate = formatDateString(datePart);
            const monthsLabel = locale === 'tr' ? 'Ay' : 'Months';
            return `${translatedDate} (${monthsCount} ${monthsLabel})`;
        }
        return rawString;
    };

    const handleDownloadPdf = async () => {
        const loadingToast = toast.loading(t('toastGeneratingPdf'));
        setIsLoading(true);
        try {
            const strategyParam = isSnowball ? 'Snowball' : 'Avalanche';
            const response = await api.get(`/api/calculation/${reportId}/pdf`, {
                responseType: 'blob',
                headers: { 'Accept-Language': locale },
                params: { strategy: strategyParam }
            });

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `${strategyParam}-Plan.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);

            toast.success(t('toastPdfDownloaded'), { id: loadingToast });
        } catch (error) {
            console.error(error);
            toast.error(t('toastPdfError'), { id: loadingToast });
        } finally {
            setIsLoading(false);
        }
    };

    return {
        formatDateString,
        formatPayOffDate,
        handleDownloadPdf,
        isLoading,
        locale,
        t
    };
};