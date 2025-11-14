'use client';

import {useEffect, useState} from 'react';
import {Link} from '@/i18n/navigation';
import api from '@/lib/api';
import {CalculationHistoryDto} from '@/types';
import toast from 'react-hot-toast';
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import {Skeleton} from "@/components/ui/skeleton";
import {formatCurrency} from '@/lib/utils';
import {useAuth} from "@/context/AuthContext";
import {useTranslations, useLocale} from 'next-intl';

export default function CalculationHistoryCard() {
    const t = useTranslations('DashboardPage.CalculationHistory');
    const locale = useLocale();

    const [history, setHistory] = useState<CalculationHistoryDto[] | null>(null);
    const [loadingHistory, setLoadingHistory] = useState(true);
    const {isAuthenticated} = useAuth();

    useEffect(() => {
        fetchHistory();
    }, []);

    const fetchHistory = async () => {
        setLoadingHistory(true);
        try {
            const response = await api.get<CalculationHistoryDto[]>('/api/calculation/history');
            setHistory(response.data);
        } catch (error) {
            toast.error(t('toasts.loadError'));
        } finally {
            setLoadingHistory(false);
        }
    };

    return (
        <Card className="lg:col-span-3">
            <CardHeader>
                <CardTitle className="text-2xl">{t('title')}</CardTitle>
                <CardDescription>
                    {t('description')}
                </CardDescription>
            </CardHeader>
            <CardContent>
                {loadingHistory ? (
                    <div className="space-y-3">
                        <Skeleton className="h-[60px] w-full rounded-md"/>
                        <Skeleton className="h-[60px] w-full rounded-md"/>
                    </div>
                ) : !history || history.length === 0 ? (
                    <p className="text-muted-foreground">{t('empty')}</p>
                ) : (
                    <div className="space-y-3">
                        {history.map(report => (
                            <Link
                                key={report.reportId}
                                href={`/results/${report.reportId}`}
                                className="block p-4 border rounded-lg hover:bg-muted transition-colors"
                            >
                                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1">
                                    <span className="font-semibold text-blue-600">
                                        {new Date(report.createdAt).toLocaleString(locale, {
                                            day: '2-digit',
                                            month: 'long',
                                            year: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        })}
                                    </span>
                                    <span className="text-sm font-semibold text-foreground">
                                        {report.recommendedPayOffDate}
                                    </span>
                                </div>
                                <div
                                    className="text-sm text-muted-foreground mt-2 grid grid-cols-2 sm:grid-cols-3 gap-2">
                                    <div>
                                        {t('details.totalDebt')} <strong
                                        className="text-foreground">{formatCurrency(report.totalDebt, locale)}</strong>
                                    </div>
                                    <div>
                                        {t('details.extraPayment')} <strong
                                        className="text-foreground">{formatCurrency(report.extraPayment, locale)}</strong>
                                    </div>
                                    <div>
                                        {t('details.saved')} <strong
                                        className="text-green-600">{formatCurrency(report.recommendedInterestSaved, locale)}</strong>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}