'use client';

import {useEffect, useState} from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import Navbar from '@/components/Navbar';
import api from '@/lib/api';
import {CalculationResult} from '@/types';
import {Card, CardContent} from "@/components/ui/card";
import {Button} from "@/components/ui/button";
import {Skeleton} from "@/components/ui/skeleton";
import {
    Calendar,
    PartyPopper,
    AlertTriangle,
    Loader2,
    RefreshCw,
    LineChart,
    Wallet,
    CalendarCheck,
    FastForward
} from "lucide-react";

import {useLocale, useTranslations} from 'next-intl';
import {Link} from '@/i18n/navigation';
import {Alert, AlertDescription, AlertTitle} from "@/components/ui/alert";
import toast from "react-hot-toast";
import {Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/ui/tabs";


import TrackingSummary from "@/components/tracking/TrackingSummary";
import TrackingChart from "@/components/tracking/TrackingChart";
import TrackingTimeline from "@/components/tracking/TrackingTimeline";
import MakePaymentModal from "@/components/tracking/MakePaymentModal";
import TrackingDebtList from "@/components/tracking/TrackingDebtList";
import {formatCurrency} from "@/lib/utils";

export default function TrackingPage() {

    const t = useTranslations('TrackingPage.page');
    const locale = useLocale();

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
        const loadingToast = toast.loading(t('toasts.calculating'));

        try {
            const response = await api.post('/api/plan/recalculate');

            const { paymentIncreased, newMonthlyPayment } = response.data;

            if (paymentIncreased) {
                toast.success(
                    t('toasts.recalculateIncreased', {
                        amount: formatCurrency(newMonthlyPayment, locale)
                    }),
                    {
                        id: loadingToast,
                        duration: 6000,
                        icon: '⚠️',
                        style: { border: '1px solid #facc15', color: '#854d0e' }
                    }
                );
            } else {
                toast.success(t('toasts.recalculateSuccess'), {
                    id: loadingToast,
                    duration: 3000
                });
            }

            await fetchActivePlan();
        } catch (error) {
            toast.error(t('toasts.defaultError'), { id: loadingToast });
        } finally {
            setRecalculating(false);
        }
    };

    const handleNextMonth = async () => {
        const loadingToast = toast.loading("Faizler işleniyor ve yeni aya geçiliyor...");
        try {
            await api.post('/api/debt/next-month');

            toast.success("Yeni aya geçildi!", {id: loadingToast});

            await fetchActivePlan();
        } catch (error) {
            toast.error("İşlem başarısız oldu.", {id: loadingToast});
        }
    };

    const openPaymentModal = (monthYear: string, amount: number) => {
        setSelectedMonthStr(monthYear);
        setSelectedTargetAmount(amount);
        setPaymentModalOpen(true);
    };

    const currentStrategyResult = activePlan
        ? (
            (activePlan.selectedStrategy === "Avalanche" || (!activePlan.selectedStrategy && activePlan.recommendation.includes("Avalanche")))
                ? activePlan.avalancheResult
                : activePlan.snowballResult
        )
        : null;

    const strategyName = activePlan?.selectedStrategy
        ? activePlan.selectedStrategy
        : (activePlan?.recommendation.includes("Avalanche") ? "Avalanche" : "Snowball");
    const currentReportId = activePlan?.calculationId || "";
    const isDebtFullyPaid = activePlan && activePlan.currentTotalDebt <= 0;

    return (

        <ProtectedRoute>
            <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
                <Navbar/>
                <main className="container mx-auto p-4 md:p-8 max-w-5xl">
                    {isDebtFullyPaid && (
                        <div
                            className="mb-8 p-8 bg-green-100 dark:bg-green-900/20 border border-green-300 dark:border-green-800 rounded-xl text-center shadow-sm">
                            <PartyPopper className="h-16 w-16 text-green-600 mx-auto mb-4 animate-bounce"/>
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
                        <Alert className="mb-6 border-blue-200 bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200">

                            <RefreshCw className="h-4 w-4 stroke-blue-600" />

                            <AlertTitle className="text-blue-700 dark:text-blue-300 font-bold">
                                {t('outdatedAlert.title')}
                            </AlertTitle>

                            <AlertDescription className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mt-2">
                                <p>
                                    {t('outdatedAlert.description')}
                                </p>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={handleRecalculate}
                                    disabled={recalculating}
                                    className="bg-white text-blue-700 border-blue-200 hover:bg-blue-100 shrink-0 mt-2 sm:mt-0"
                                >
                                    {recalculating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
                                    {t('outdatedAlert.button')}
                                </Button>
                            </AlertDescription>
                        </Alert>
                    )}
                    <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div className="text-center sm:text-left">
                            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-50">{t('title')}</h1>
                            <p className="text-muted-foreground">{t('subtitle')}</p>
                        </div>
                        {!loading && activePlan && (
                            <Button
                                onClick={handleNextMonth}
                                className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm transition-all active:scale-95"
                            >
                                <FastForward className="mr-2 h-4 w-4"/>
                                {t('fastForward')}
                            </Button>
                        )}
                    </div>
                    {loading ? (
                        <div className="space-y-4">
                            <Skeleton className="h-32 w-full"/>
                            <Skeleton className="h-64 w-full"/>
                        </div>
                    ) : !activePlan || !currentStrategyResult ? (
                        <Card>
                            <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                                <Calendar className="h-16 w-16 text-muted-foreground mb-4"/>
                                <h2 className="text-xl font-semibold">{t('noPlan.title')}</h2>
                                <p className="text-muted-foreground mb-6 max-w-md">{t('noPlan.description')}</p>
                                <Link href="/dashboard">
                                    <Button>{t('noPlan.button')}</Button>
                                </Link>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="space-y-6">
                            <TrackingSummary
                                activePlan={activePlan}
                                currentStrategyResult={currentStrategyResult}
                            />
                            <Tabs defaultValue="timeline" className="w-full">
                                <div className="flex justify-center sm:justify-start">
                                    <TabsList
                                        className="grid w-full grid-cols-3 lg:w-[450px] bg-gray-100 dark:bg-gray-800">
                                        <TabsTrigger value="timeline"
                                                     className="flex items-center gap-2 text-xs sm:text-sm">
                                            <CalendarCheck className="h-4 w-4"/>
                                            <span>{t('tabs.plan')}</span>
                                        </TabsTrigger>
                                        <TabsTrigger value="chart"
                                                     className="flex items-center gap-2 text-xs sm:text-sm">
                                            <LineChart className="h-4 w-4"/>
                                            <span>{t('tabs.analysis')}</span>
                                        </TabsTrigger>
                                        <TabsTrigger value="debts"
                                                     className="flex items-center gap-2 text-xs sm:text-sm">
                                            <Wallet className="h-4 w-4"/>
                                            <span>{t('tabs.debts')}</span>
                                        </TabsTrigger>
                                    </TabsList>
                                </div>
                                <TabsContent value="timeline"
                                             className="mt-4 focus-visible:outline-none focus-visible:ring-0">
                                    <div
                                        className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-1 shadow-sm">
                                        <TrackingTimeline
                                            paymentSchedule={currentStrategyResult.paymentSchedule}
                                            currentStrategyResult={currentStrategyResult}
                                            isDebtFullyPaid={isDebtFullyPaid || false}
                                            onMakePayment={openPaymentModal}
                                        />
                                    </div>
                                </TabsContent>
                                <TabsContent value="chart"
                                             className="mt-4 focus-visible:outline-none focus-visible:ring-0">
                                    <div
                                        className="border border-gray-200 dark:border-gray-800 rounded-xl bg-white dark:bg-gray-900 p-4 shadow-sm min-h-[400px]">
                                        <h3 className="text-lg font-semibold mb-4 px-2">{t('chart.title')}</h3>
                                        <TrackingChart
                                            paymentSchedule={currentStrategyResult.paymentSchedule}
                                            totalLiability={currentStrategyResult.totalPaid}
                                        />
                                    </div>

                                </TabsContent>
                                <TabsContent value="debts"
                                             className="mt-4 focus-visible:outline-none focus-visible:ring-0">
                                    <div
                                        className="border border-gray-200 dark:border-gray-800 rounded-xl bg-white dark:bg-gray-900 p-4 shadow-sm">
                                        <div className="flex items-center gap-2 mb-4 px-2">
                                            <Wallet className="h-5 w-5 text-gray-500"/>
                                            <h3 className="text-lg font-semibold">{t('debtSectionTitle')}</h3>
                                        </div>
                                        <TrackingDebtList debtStatuses={activePlan.debtStatuses}/>
                                    </div>
                                </TabsContent>
                            </Tabs>
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