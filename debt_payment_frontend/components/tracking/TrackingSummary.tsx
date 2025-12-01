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

    const initialDebt = activePlan.beginningDebt;
    const currentDebt = activePlan.currentTotalDebt;
    let progressPercentage = 0;
    if (initialDebt > 0) {
        if (currentDebt <= 0) {
            progressPercentage = 100;
        } else {
            const paidAmount = initialDebt - currentDebt;
            progressPercentage = Math.round((paidAmount / initialDebt) * 100);
        }
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
            <Card className="bg-blue-50 border-blue-200">
                <CardContent className="p-6">
                    <p className="text-sm text-blue-600 font-medium">{t('summary.targetDate')}</p>
                    <p className="text-2xl font-bold text-blue-900">
                        {formatPayOffDate(currentStrategyResult.payOffDate)}
                    </p>
                </CardContent>
            </Card>

            <Card>
                <CardContent className="p-6">
                    <p className="text-sm text-muted-foreground font-medium">{t('summary.totalRemaining')}</p>
                    <p className="text-2xl font-bold">
                        {formatCurrency(activePlan.currentTotalDebt, locale)}
                    </p>
                </CardContent>
            </Card>

            <Card>
                <CardContent className="p-6">
                    <p className="text-sm text-muted-foreground font-medium">{t('summary.progress')}</p>
                    <div className="flex items-end gap-2">
                        <p className="text-2xl font-bold text-green-600">
                            {progressPercentage}%
                        </p>
                        <span className="text-sm text-muted-foreground mb-1">{t('summary.completed')}</span>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}