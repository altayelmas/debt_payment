'use client';

import { useEffect, useState } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import Navbar from '@/components/Navbar';
import api from '@/lib/api';
import { CalculationResult } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowRight, Calendar, PartyPopper, AlertTriangle, Loader2, RefreshCw } from "lucide-react";
import { formatCurrency } from '@/lib/utils';
import { useLocale, useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import MakePaymentModal from "@/components/tracking/MakePaymentModal";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import TrackingChart from "@/components/tracking/TrackingChart";
import toast from "react-hot-toast";

export default function TrackingPage() {
    const locale = useLocale();
    const t = useTranslations('TrackingPage.page');

    const [activePlan, setActivePlan] = useState<CalculationResult | null>(null);
    const [loading, setLoading] = useState(true);

    const [selectedYearTab, setSelectedYearTab] = useState<string>("");

    const [isPaymentModalOpen, setPaymentModalOpen] = useState(false);
    const [selectedMonthStr, setSelectedMonthStr] = useState("");
    const [selectedTargetAmount, setSelectedTargetAmount] = useState(0);
    const [recalculating, setRecalculating] = useState(false);

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

    const currentStrategyResult = activePlan
        ? (activePlan.recommendation.includes("Avalanche") ? activePlan.avalancheResult : activePlan.snowballResult)
        : null;

    const totalPaidSoFar = currentStrategyResult?.paymentSchedule.reduce((sum, month) => {
        return sum + ((month as any).actualPaidAmount || 0);
    }, 0) || 0;

    const remainingLiability = Math.max(0, (currentStrategyResult?.totalPaid || 0) - totalPaidSoFar);

    const strategyName = activePlan?.recommendation.includes("Avalanche") ? "Avalanche" : "Snowball";

    const groupedSchedule = currentStrategyResult?.paymentSchedule.reduce((acc, month) => {
        const year = month.monthYear.split(" ")[1];
        if (!acc[year]) acc[year] = [];
        acc[year].push(month);
        return acc;
    }, {} as Record<string, typeof currentStrategyResult.paymentSchedule>);

    const years = groupedSchedule ? Object.keys(groupedSchedule) : [];

    useEffect(() => {
        if (years.length > 0 && selectedYearTab === "") {
            const currentYear = new Date().getFullYear().toString();
            const defaultTab = years.includes(currentYear) ? currentYear : years[0];
            setSelectedYearTab(defaultTab);
        }
    }, [years, selectedYearTab]);

    const formatDateString = (dateString: string) => {
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

    const formatMonthName = (dateString: string) => {
        try {
            const date = new Date(dateString);
            if (!isNaN(date.getTime())) {
                return date.toLocaleDateString(locale === 'tr' ? 'tr-TR' : 'en-US', {
                    month: 'long'
                });
            }
            return dateString.split(" ")[0];
        } catch (e) {
            return dateString.split(" ")[0];
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
                            <h2 className="text-3xl font-bold text-green-800 mb-2">
                                {t('success.title')}
                            </h2>
                            <p className="text-lg text-green-700 max-w-2xl mx-auto">
                                {t('success.description')}
                            </p>
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
                                <p>
                                    {t('outdatedAlert.description')}
                                </p>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={handleRecalculate}
                                    disabled={recalculating}
                                    className="bg-white text-black border-yellow-600 hover:bg-yellow-100 shrink-0 mt-2 sm:mt-0"
                                >
                                    {recalculating ? (
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    ) : (
                                        <RefreshCw className="mr-2 h-4 w-4" />
                                    )}
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
                    ) : !activePlan || !currentStrategyResult || !groupedSchedule ? (
                        <Card>
                            <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                                <Calendar className="h-16 w-16 text-muted-foreground mb-4" />
                                <h2 className="text-xl font-semibold">{t('noPlan.title')}</h2>
                                <p className="text-muted-foreground mb-6 max-w-md">
                                    {t('noPlan.description')}
                                </p>
                                <Link href="/dashboard">
                                    <Button>{t('noPlan.button')}</Button>
                                </Link>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="space-y-8">
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
                                            {formatCurrency(remainingLiability, locale)}
                                        </p>
                                    </CardContent>
                                </Card>
                                <Card>
                                    <CardContent className="p-6">
                                        <p className="text-sm text-muted-foreground font-medium">{t('summary.progress')}</p>
                                        <div className="flex items-end gap-2">
                                            <p className="text-2xl font-bold text-green-600">
                                                {Math.round((currentStrategyResult.paymentSchedule.filter((m: any) => m.isPaid).length / currentStrategyResult.paymentSchedule.length) * 100)}%
                                            </p>
                                            <span className="text-sm text-muted-foreground mb-1">{t('summary.completed')}</span>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>

                            <div className="mt-8">
                                <TrackingChart
                                    paymentSchedule={currentStrategyResult.paymentSchedule}
                                    totalLiability={currentStrategyResult.totalPaid}
                                />
                            </div>

                            <Tabs value={selectedYearTab}
                                  onValueChange={(val) => setSelectedYearTab(val)}
                                  className="w-full"
                            >
                                <div className="flex overflow-x-auto pb-2">
                                    <TabsList>
                                        {years.map(year => (
                                            <TabsTrigger key={year} value={year} className="px-6">
                                                {year}
                                            </TabsTrigger>
                                        ))}
                                    </TabsList>
                                </div>

                                {Object.entries(groupedSchedule).map(([year, months]) => (
                                    <TabsContent key={year} value={year} className="mt-6">
                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                            {months.map((month, index) => {
                                                const isPaid = (month as any).isPaid;
                                                const actualPaidAmount = (month as any).actualPaidAmount || 0;
                                                const targetAmount = month.totalPaymentAmount;

                                                const globalIndex = currentStrategyResult.paymentSchedule.findIndex(m => m.month === month.month);
                                                const isCurrentGoal = !isPaid && (globalIndex === 0 || (currentStrategyResult.paymentSchedule[globalIndex - 1] as any).isPaid);

                                                let paymentStatus = "pending";
                                                if (isPaid) {
                                                    if (actualPaidAmount >= targetAmount * 0.99) {
                                                        paymentStatus = "success";
                                                    } else {
                                                        paymentStatus = "partial";
                                                    }
                                                } else if (isCurrentGoal) {
                                                    paymentStatus = "current";
                                                }

                                                let cardClass = "border-gray-200 opacity-70";
                                                let badge = null;
                                                let message = null;

                                                switch (paymentStatus) {
                                                    case "success":
                                                        cardClass = "border-green-500 bg-green-50/40 shadow-sm";
                                                        badge = <Badge className="bg-green-600 hover:bg-green-700">{t('cards.completedBadge')}</Badge>;
                                                        break;
                                                    case "partial":
                                                        cardClass = "border-yellow-500 bg-yellow-50/40 shadow-sm";
                                                        badge = <Badge variant="secondary" className="bg-yellow-100 text-yellow-700 hover:bg-yellow-200">{t('cards.partialBadge')}</Badge>;
                                                        message = (
                                                            <div className="mt-2 text-xs text-yellow-700 bg-yellow-100 p-2 rounded flex items-center gap-2">
                                                                <span>
                                                                    {t.rich('cards.partialMessage', {
                                                                        amount: formatCurrency(targetAmount - actualPaidAmount, locale),
                                                                        str: (chunks) => <strong>{chunks}</strong>
                                                                    })}
                                                                </span>
                                                            </div>
                                                        );
                                                        break;
                                                    case "current":
                                                        cardClass = "border-blue-500 shadow-md ring-1 ring-blue-100 bg-white";
                                                        badge = <Badge variant="secondary" className="text-blue-600 bg-blue-100">{t('cards.currentGoalBadge')}</Badge>;
                                                        break;
                                                    default:
                                                        cardClass = "bg-gray-50 border-gray-200 text-gray-500";
                                                        break;
                                                }

                                                return (
                                                    <Card key={month.month} className={`flex flex-col justify-between transition-all ${cardClass}`}>
                                                        <CardHeader className="pb-2">
                                                            <div className="flex justify-between items-start">
                                                                <div>
                                                                    <CardTitle className="text-lg">
                                                                        {formatMonthName(month.monthYear)}
                                                                    </CardTitle>
                                                                    <p className="text-xs text-muted-foreground mt-1">{t('cards.month', {month: month.month})}</p>
                                                                </div>
                                                                {badge}
                                                            </div>
                                                        </CardHeader>
                                                        <CardContent>
                                                            <div className="space-y-1 mb-4">
                                                                <div className="flex justify-between text-sm">
                                                                    <span>{t('cards.target')}</span>
                                                                    <span className="font-semibold">{formatCurrency(targetAmount, locale)}</span>
                                                                </div>

                                                                {(isPaid || actualPaidAmount > 0) && (
                                                                    <div className={`flex justify-between text-sm ${paymentStatus === 'partial' ? 'text-yellow-600 font-bold' : 'text-green-700'}`}>
                                                                        <span>{t('cards.paid')}</span>
                                                                        <span className="font-bold">{formatCurrency(actualPaidAmount, locale)}</span>
                                                                    </div>
                                                                )}
                                                            </div>

                                                            {message}

                                                            {!isDebtFullyPaid && (
                                                                <>
                                                                    {isCurrentGoal && (
                                                                        <Button
                                                                            variant={isCurrentGoal ? "default" : "outline"}
                                                                            size="sm"
                                                                            className="w-full gap-2 mt-2"
                                                                            onClick={() => {
                                                                                setSelectedMonthStr(month.monthYear);
                                                                                setSelectedTargetAmount(month.totalPaymentAmount);
                                                                                setPaymentModalOpen(true);
                                                                            }}
                                                                        >
                                                                            {t('cards.makePaymentButton')} <ArrowRight className="h-3 w-3"/>
                                                                        </Button>
                                                                    )}

                                                                    {paymentStatus === 'partial' && (
                                                                        <Button
                                                                            variant="outline"
                                                                            size="sm"
                                                                            className="w-full gap-2 mt-2 border-yellow-500 text-yellow-700 hover:bg-yellow-50"
                                                                            onClick={() => {
                                                                                setSelectedMonthStr(month.monthYear);
                                                                                setSelectedTargetAmount(targetAmount - actualPaidAmount);
                                                                                setPaymentModalOpen(true);
                                                                            }}
                                                                        >
                                                                            {t('cards.completePaymentButton')} <ArrowRight className="h-3 w-3"/>
                                                                        </Button>
                                                                    )}
                                                                </>
                                                            )}

                                                            {month.paidOffDebts && month.paidOffDebts.length > 0 && (
                                                                <div className="mt-2 pt-2 border-t border-green-200/50 text-xs font-medium text-green-700 flex items-center gap-1">
                                                                    <PartyPopper className="h-3 w-3"/>
                                                                    {t('cards.paidOffMessage')} {month.paidOffDebts[0]} {month.paidOffDebts.length > 1 && `+${month.paidOffDebts.length - 1}`}
                                                                </div>
                                                            )}
                                                        </CardContent>
                                                    </Card>
                                                );
                                            })}
                                        </div>
                                    </TabsContent>
                                ))}
                            </Tabs>
                        </div>
                    )}

                    <MakePaymentModal
                        isOpen={isPaymentModalOpen}
                        onOpenChange={setPaymentModalOpen}
                        monthYear={selectedMonthStr}
                        targetAmount={selectedTargetAmount}
                        strategyName={strategyName}
                        onSuccess={() => {
                            fetchActivePlan();
                        }}
                        reportId={currentReportId}
                    />
                </main>
            </div>
        </ProtectedRoute>
    );
}