'use client';

import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency } from '@/lib/utils';
import { useTranslations, useLocale } from 'next-intl';
import { StrategyResult, CalculationResult } from '@/types';

interface TrackingSummaryProps {
    activePlan: CalculationResult;
    currentStrategyResult: StrategyResult;
}

export default function TrackingSummary({ activePlan, currentStrategyResult }: TrackingSummaryProps) {
    const t = useTranslations('TrackingPage.page');
    const locale = useLocale();

    const totalObligation = currentStrategyResult.totalPaid;

    const totalPaidSoFar = currentStrategyResult.paymentSchedule.reduce((acc, month) => {
        return acc + (month.actualPaidAmount || 0);
    }, 0);

    let remainingTotal = totalObligation - totalPaidSoFar;
    if (remainingTotal < 0) remainingTotal = 0;

    let progressPercentage = 0;
    if (totalObligation > 0) {
        progressPercentage = Math.round((totalPaidSoFar / totalObligation) * 100);
    }
    if (progressPercentage > 100) progressPercentage = 100;


    const formatPayOffDate = (rawString: string) => {
        if (!rawString) return "";
        const regex = /^([a-zA-Z]+ \d{4}) \((\d+) Months\)$/;
        const match = rawString.match(regex);

        if (match) {
            const datePart = match[1];
            const monthsCount = match[2];

            try {
                const date = new Date(datePart);
                if (!isNaN(date.getTime())) {
                    const translatedDate = date.toLocaleDateString(locale === 'tr' ? 'tr-TR' : 'en-US', {
                        month: 'long',
                        year: 'numeric'
                    });
                    const monthsLabel = locale === 'tr' ? 'Ay' : 'Months';
                    return `${translatedDate} (${monthsCount} ${monthsLabel})`;
                }
            } catch (e) {
                return rawString;
            }
        }
        return rawString;
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
                <CardContent className="p-6">
                    <p className="text-sm text-blue-600 dark:text-blue-400 font-medium">{t('summary.targetDate')}</p>
                    <p className="text-2xl font-bold text-blue-900 dark:text-blue-50">
                        {formatPayOffDate(currentStrategyResult.payOffDate)}
                    </p>
                </CardContent>
            </Card>

            <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                <CardContent className="p-6">
                    <p className="text-sm text-muted-foreground font-medium">{t('summary.totalRemaining')}</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-gray-50">
                        {formatCurrency(remainingTotal, locale)}
                    </p>
                </CardContent>
            </Card>

            <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                <CardContent className="p-6">
                    <p className="text-sm text-muted-foreground font-medium">{t('summary.progress')}</p>
                    <div className="flex items-end gap-2">
                        <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                            {progressPercentage}%
                        </p>
                        <span className="text-sm text-muted-foreground mb-1">{t('summary.completed')}</span>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}