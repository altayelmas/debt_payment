'use client';

import {useEffect, useState} from 'react';
import {useRouter} from '@/i18n/navigation';
import ProtectedRoute from '@/components/ProtectedRoute';
import {CalculationResult} from '@/types';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import api from '@/lib/api';
import toast from 'react-hot-toast';

import {Alert, AlertDescription, AlertTitle} from "@/components/ui/alert";
import {buttonVariants} from "@/components/ui/button";
import {ArrowLeft, Lightbulb, Loader2} from "lucide-react";

import {formatCurrency} from "@/lib/utils";
import ResultCard from "@/components/results/ResultCard";
import {useLocale, useTranslations} from "next-intl";

export default function ResultsPage({params}: { params: { reportId: string } }) {
    const locale = useLocale();
    const t = useTranslations('ResultsPage.page');

    const [report, setReport] = useState<CalculationResult | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();
    const {reportId} = params;

    useEffect(() => {
        if (!reportId) {
            setLoading(false);
            return;
        }
        const fetchReport = async () => {
            try {
                const response = await api.get<CalculationResult>(`/api/Calculation/${reportId}`);
                setReport(response.data);
            } catch (error) {
                toast.error(t('toasts.loadError'));
                router.replace('/dashboard');
            } finally {
                setLoading(false);
            }
        };
        fetchReport();
    }, [reportId, router]);

    if (loading) {
        return (
            <ProtectedRoute>
                <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-950">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground"/>
                    <p className="text-lg ml-3 text-muted-foreground">{t('loading')}</p>
                </div>
            </ProtectedRoute>
        );
    }

    if (!report) {
        return (
            <ProtectedRoute>
                <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-950">
                    <h2 className="text-2xl font-semibold text-destructive">{t('notFoundTitle')}</h2>
                    <p className="text-muted-foreground mt-2">{t('notFoundDescription')}</p>
                    <Link
                        href="/dashboard"
                        className={buttonVariants({variant: "outline", className: "mt-4 dark:bg-gray-800 dark:text-gray-100 dark:hover:bg-gray-700"})}
                    >
                        <ArrowLeft className="mr-2 h-4 w-4"/>
                        {t('backButton')}
                    </Link>
                </div>
            </ProtectedRoute>
        );
    }

    const recommendedStrategy = report.recommendation.includes("Avalanche") ? "Avalanche" : "Snowball";
    const interestSaved = Math.abs(report.snowballResult.totalInterestPaid - report.avalancheResult.totalInterestPaid);
    const monthsSaved = Math.abs(report.snowballResult.totalMonths - report.avalancheResult.totalMonths);

    return (
        <ProtectedRoute>
            <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
                <Navbar/>
                <main className="container mx-auto p-3 max-w-3xl">

                    <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-4 pb-3 border-b border-gray-200 dark:border-gray-800">
                        <div>
                            <h1 className="text-xl font-bold text-gray-900 dark:text-gray-50 leading-tight">{t('headerTitle')}</h1>
                            <p className="text-xs text-muted-foreground dark:text-gray-400 mt-0.5">{t('headerSubtitle')}</p>
                        </div>

                        <div className="flex flex-wrap gap-2 text-xs">
                            <div className="px-2.5 py-1 rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-sm text-gray-600 dark:text-gray-300">
                                <span className="font-semibold text-gray-900 dark:text-gray-100 mr-1.5">
                                    {t('extraPaymentLabel')}
                                </span>
                                {formatCurrency(report.extraPayment, locale)}
                            </div>
                            <div className="px-2.5 py-1 rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-sm text-gray-600 dark:text-gray-300">
                                <span className="font-semibold text-gray-900 dark:text-gray-100 mr-1.5">
                                    {t('initialDebtLabel')}
                                </span>
                                {formatCurrency(report.beginningDebt, locale)}
                            </div>
                        </div>
                    </header>

                    <Alert className="mb-4 p-3 bg-white dark:bg-gray-900 border-blue-200 dark:border-blue-900/50 shadow-sm flex items-start">
                        <Lightbulb className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 shrink-0"/>
                        <div className="ml-3 flex-1">
                            <AlertTitle className="font-semibold text-gray-900 dark:text-gray-100 text-sm mb-1">
                                {t('recommendationTitle')}
                            </AlertTitle>
                            <AlertDescription className="text-gray-600 dark:text-gray-300 text-xs leading-relaxed inline-block">
                                {(interestSaved > 0 && monthsSaved > 0) ? (
                                    t.rich('recommendationText', {
                                        strategyName: recommendedStrategy,
                                        interestSaved: formatCurrency(interestSaved, locale),
                                        monthsSaved: monthsSaved,
                                        str: (chunks) => <span className="font-bold text-gray-900 dark:text-white">{chunks}</span>
                                    })
                                ) : (
                                    t.rich('recommendationText_noSavings', {
                                        strategyName: recommendedStrategy,
                                        str: (chunks) => <span className="font-bold text-gray-900 dark:text-white">{chunks}</span>
                                    })
                                )}
                            </AlertDescription>
                        </div>
                    </Alert>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <ResultCard
                            result={report.snowballResult}
                            isSnowball={true}
                            isRecommended={recommendedStrategy === "Snowball"}
                            reportId={reportId}
                        />
                        <ResultCard
                            result={report.avalancheResult}
                            isSnowball={false}
                            isRecommended={recommendedStrategy === "Avalanche"}
                            reportId={reportId}
                        />
                    </div>

                    <div className="text-center mt-6">
                        <Link
                            href="/dashboard"
                            className={buttonVariants({
                                variant: "outline",
                                size: "sm",
                                className: "bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 border-gray-200 dark:border-gray-800 hover:bg-gray-100 dark:hover:bg-gray-800 text-xs h-8"
                            })}
                        >
                            <ArrowLeft className="mr-2 h-3.5 w-3.5"/>
                            {t('newCalcButton')}
                        </Link>
                    </div>
                </main>
            </div>
        </ProtectedRoute>
    );
}