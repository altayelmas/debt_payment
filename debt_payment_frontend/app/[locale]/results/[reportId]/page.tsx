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
                <div className="flex items-center justify-center min-h-screen bg-background">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground"/>
                    <p className="text-lg ml-3 text-muted-foreground">{t('loading')}</p>
                </div>
            </ProtectedRoute>
        );
    }

    if (!report) {
        return (
            <ProtectedRoute>
                <div className="flex flex-col items-center justify-center min-h-screen bg-background">
                    <h2 className="text-2xl font-semibold text-destructive">{t('notFoundTitle')}</h2>
                    <p className="text-muted-foreground mt-2">{t('notFoundDescription')}</p>
                    <Link
                        href="/dashboard"
                        className={buttonVariants({variant: "outline", className: "mt-4"})}
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
            <div className="min-h-screen bg-background">
                <Navbar/>

                <main className="container mx-auto p-4 md:p-8 max-w-5xl">
                    <header className="text-center mb-6">
                        <h1 className="text-3xl font-bold">{t('headerTitle')}</h1>
                        <p className="text-base text-muted-foreground mt-2">{t('headerSubtitle')}</p>

                        <div
                            className="text-base mt-3 inline-block rounded-lg border bg-muted p-3 text-muted-foreground">
                            <span
                                className="font-semibold text-foreground">{t('extraPaymentLabel')}</span> {formatCurrency(report.extraPayment, locale)}
                            <br/>
                            <span
                                className="font-semibold text-foreground">{t('initialDebtLabel')}</span> {formatCurrency(report.beginningDebt, locale)}
                        </div>
                    </header>

                    <Alert className="mb-6 max-w-3xl mx-auto p-3">
                        <Lightbulb className="h-4 w-4"/>
                        <AlertTitle className="font-semibold">{t('recommendationTitle')}</AlertTitle>
                        <AlertDescription>
                            <p className="text-sm leading-snug">
                                {(interestSaved > 0 && monthsSaved > 0) ? (
                                    t.rich('recommendationText', {
                                        strategyName: recommendedStrategy,
                                        interestSaved: formatCurrency(interestSaved, locale),
                                        monthsSaved: monthsSaved,
                                        str: (chunks) => <strong
                                            className="font-semibold text-foreground">{chunks}</strong>
                                    })
                                ) : (
                                    t.rich('recommendationText_noSavings', {
                                        strategyName: recommendedStrategy,
                                        str: (chunks) => <strong
                                            className="font-semibold text-foreground">{chunks}</strong>
                                    })
                                )}
                            </p>
                        </AlertDescription>
                    </Alert>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
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

                    <div className="text-center mt-8">
                        <Link
                            href="/dashboard"
                            className={buttonVariants({variant: "outline"})}
                        >
                            <ArrowLeft className="mr-2 h-4 w-4"/>
                            {t('newCalcButton')}
                        </Link>
                    </div>
                </main>
            </div>
        </ProtectedRoute>
    );
}