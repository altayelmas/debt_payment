'use client';

import { useEffect, useState } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import Navbar from '@/components/Navbar';
import api from '@/lib/api';
import { CalculationResult } from '@/types';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar, PartyPopper, AlertTriangle, Loader2, RefreshCw } from "lucide-react";
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import toast from "react-hot-toast";

import TrackingSummary from "@/components/tracking/TrackingSummary";
import TrackingChart from "@/components/tracking/TrackingChart";
import TrackingTimeline from "@/components/tracking/TrackingTimeline";
import MakePaymentModal from "@/components/tracking/MakePaymentModal";

export default function TrackingPage() {
    const t = useTranslations('TrackingPage.page');

    const [activePlan, setActivePlan] = useState<CalculationResult | null>(null);
    const [loading, setLoading] = useState(true);
    const [recalculating, setRecalculating] = useState(false);

    const [isPaymentModalOpen, setPaymentModalOpen] = useState(false);
    const [selectedMonthStr, setSelectedMonthStr] = useState("");
    const [selectedTargetAmount, setSelectedTargetAmount] = useState(0);

    const fetchActivePlan = async () => {
        try {
            const response = await api.get<CalculationResult>('/api/plan/active');
            if (response.status === 204) {
                setActivePlan(null);
            } else {
                setActivePlan(response.data);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchActivePlan();
    }, []);

    const handleRecalculate = async () => {
        setRecalculating(true);
        const loadingToast = toast.loading("Recalculating plan based on current debts...");
        try {
            await api.post('/api/plan/recalculate');
            toast.success("Plan updated successfully!", { id: loadingToast });
            await fetchActivePlan();
        } catch (error) {
            toast.error("Could not recalculate plan.", { id: loadingToast });
        } finally {
            setRecalculating(false);
        }
    };

    const openPaymentModal = (monthYear: string, amount: number) => {
        setSelectedMonthStr(monthYear);
        setSelectedTargetAmount(amount);
        setPaymentModalOpen(true);
    };

    const currentStrategyResult = activePlan
        ? (activePlan.recommendation.includes("Avalanche") ? activePlan.avalancheResult : activePlan.snowballResult)
        : null;

    const strategyName = activePlan?.recommendation.includes("Avalanche") ? "Avalanche" : "Snowball";
    const currentReportId = activePlan?.calculationId || "";
    const isDebtFullyPaid = activePlan && activePlan.currentTotalDebt <= 0;

    return (
        <ProtectedRoute>
            <div className="min-h-screen bg-gray-50">
                <Navbar />
                <main className="container mx-auto p-4 md:p-8 max-w-5xl">
                    {isDebtFullyPaid && (
                        <div className="mb-8 p-8 bg-green-100 border border-green-300 rounded-xl text-center shadow-sm">
                            <PartyPopper className="h-16 w-16 text-green-600 mx-auto mb-4 animate-bounce" />
                            <h2 className="text-3xl font-bold text-green-800 mb-2">{t('success.title')}</h2>
                            <p className="text-lg text-green-700 max-w-2xl mx-auto">{t('success.description')}</p>
                            <Link href="/dashboard" className="mt-6 inline-block">
                                <Button className="bg-green-600 hover:bg-green-700 text-white font-semibold px-6 py-2">
                                    {t('success.button')}
                                </Button>
                            </Link>
                        </div>
                    )}

                    {activePlan?.isPlanOutdated && !isDebtFullyPaid && (
                        <Alert variant="destructive" className="mb-6 border-yellow-600/50 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-200">
                            <AlertTriangle className="h-4 w-4 stroke-yellow-600" />
                            <AlertTitle className="text-yellow-700 dark:text-yellow-400 font-bold">
                                {t('outdatedAlert.title')}
                            </AlertTitle>
                            <AlertDescription className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mt-2">
                                <p>{t('outdatedAlert.description')}</p>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={handleRecalculate}
                                    disabled={recalculating}
                                    className="bg-white text-black border-yellow-600 hover:bg-yellow-100 shrink-0 mt-2 sm:mt-0"
                                >
                                    {recalculating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
                                    {t('outdatedAlert.button')}
                                </Button>
                            </AlertDescription>
                        </Alert>
                    )}

                    <div className="mb-8 text-center sm:text-left">
                        <h1 className="text-3xl font-bold text-gray-900">{t('title')}</h1>
                        <p className="text-muted-foreground">{t('subtitle')}</p>
                    </div>

                    {loading ? (
                        <div className="space-y-4">
                            <Skeleton className="h-32 w-full" />
                            <Skeleton className="h-64 w-full" />
                        </div>
                    ) : !activePlan || !currentStrategyResult ? (
                        <Card>
                            <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                                <Calendar className="h-16 w-16 text-muted-foreground mb-4" />
                                <h2 className="text-xl font-semibold">{t('noPlan.title')}</h2>
                                <p className="text-muted-foreground mb-6 max-w-md">{t('noPlan.description')}</p>
                                <Link href="/dashboard">
                                    <Button>{t('noPlan.button')}</Button>
                                </Link>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="space-y-8">

                            <TrackingSummary
                                activePlan={activePlan}
                                currentStrategyResult={currentStrategyResult}
                            />

                            <div className="mt-8">
                                <TrackingChart
                                    paymentSchedule={currentStrategyResult.paymentSchedule}
                                    totalLiability={currentStrategyResult.totalPaid}
                                />
                            </div>

                            <TrackingTimeline
                                paymentSchedule={currentStrategyResult.paymentSchedule}
                                currentStrategyResult={currentStrategyResult}
                                isDebtFullyPaid={isDebtFullyPaid || false}
                                onMakePayment={openPaymentModal}
                            />
                        </div>
                    )}

                    <MakePaymentModal
                        isOpen={isPaymentModalOpen}
                        onOpenChange={setPaymentModalOpen}
                        monthYear={selectedMonthStr}
                        targetAmount={selectedTargetAmount}
                        strategyName={strategyName}
                        onSuccess={() => fetchActivePlan()}
                        reportId={currentReportId}
                    />
                </main>
            </div>
        </ProtectedRoute>
    );
}