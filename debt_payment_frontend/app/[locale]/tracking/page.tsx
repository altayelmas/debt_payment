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
import {CheckCircle, Circle, ArrowRight, Calendar, PartyPopper, AlertTriangle} from "lucide-react";
import { formatCurrency } from '@/lib/utils';
import { useLocale } from 'next-intl';
import Link from 'next/link';
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import MakePaymentModal from "@/components/tracking/MakePaymentModal";
import {Alert, AlertDescription, AlertTitle} from "@/components/ui/alert";

export default function TrackingPage() {
    const locale = useLocale();

    const [activePlan, setActivePlan] = useState<CalculationResult | null>(null);
    const [loading, setLoading] = useState(true);

    const [selectedYearTab, setSelectedYearTab] = useState<string>("");

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

    const currentStrategyResult = activePlan
        ? (activePlan.recommendation.includes("Avalanche") ? activePlan.avalancheResult : activePlan.snowballResult)
        : null;

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

    const currentYear = new Date().getFullYear().toString();
    const defaultTab = years.includes(currentYear) ? currentYear : years[0];

    const currentReportId = activePlan?.calculationId || "";

    return (
        <ProtectedRoute>
            <div className="min-h-screen bg-gray-50">
                <Navbar />
                <main className="container mx-auto p-4 md:p-8 max-w-5xl">
                    {/*
                    {activePlan?.isPlanOutdated && (
                        <Alert variant="destructive" className="mb-6 border-yellow-600/50 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-200">
                            <AlertTriangle className="h-4 w-4 stroke-yellow-600" />
                            <AlertTitle className="text-yellow-700 dark:text-yellow-400 font-bold">Planınız Güncel Değil</AlertTitle>
                            <AlertDescription className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mt-2">
                                <p>
                                    Borçlarınızda değişiklik yaptığınız (ekleme/silme/güncelleme) tespit edildi.
                                    Mevcut planınız artık gerçek durumu yansıtmıyor olabilir.
                                </p>
                                <Link href="/dashboard">
                                    <Button variant="outline" size="sm" className="bg-white text-black border-yellow-600 hover:bg-yellow-100">
                                        Yeniden Hesapla
                                    </Button>
                                </Link>
                            </AlertDescription>
                        </Alert>
                    )}
                    */}
                    <div className="mb-8 text-center sm:text-left">
                        <h1 className="text-3xl font-bold text-gray-900">Your Debt Freedom Journey</h1>
                        <p className="text-muted-foreground">Track your progress month by month.</p>
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
                                <h2 className="text-xl font-semibold">No Active Plan Found</h2>
                                <p className="text-muted-foreground mb-6 max-w-md">
                                    You haven&#39;t started a debt payoff plan yet.
                                </p>
                                <Link href="/dashboard">
                                    <Button>Go to Dashboard</Button>
                                </Link>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="space-y-8">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <Card className="bg-blue-50 border-blue-200">
                                    <CardContent className="p-6">
                                        <p className="text-sm text-blue-600 font-medium">Target Date</p>
                                        <p className="text-2xl font-bold text-blue-900">{currentStrategyResult.payOffDate}</p>
                                    </CardContent>
                                </Card>
                                <Card>
                                    <CardContent className="p-6">
                                        <p className="text-sm text-muted-foreground font-medium">Total Remaining</p>
                                        <p className="text-2xl font-bold">
                                            {formatCurrency(activePlan.currentTotalDebt, locale)}
                                        </p>
                                    </CardContent>
                                </Card>
                                <Card>
                                    <CardContent className="p-6">
                                        <p className="text-sm text-muted-foreground font-medium">Progress</p>
                                        <div className="flex items-end gap-2">
                                            <p className="text-2xl font-bold text-green-600">
                                                {Math.round((currentStrategyResult.paymentSchedule.filter((m: any) => m.isPaid).length / currentStrategyResult.paymentSchedule.length) * 100)}%
                                            </p>
                                            <span className="text-sm text-muted-foreground mb-1">completed</span>
                                        </div>
                                    </CardContent>
                                </Card>
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
                                                        badge = <Badge className="bg-green-600 hover:bg-green-700">Completed ✅</Badge>;
                                                        break;
                                                    case "partial":
                                                        cardClass = "border-yellow-500 bg-yellow-50/40 shadow-sm";
                                                        badge = <Badge variant="secondary" className="bg-yellow-100 text-yellow-700 hover:bg-yellow-200">Partial Payment ⚠️</Badge>;
                                                        message = (
                                                            <div className="mt-2 text-xs text-yellow-700 bg-yellow-100 p-2 rounded flex items-center gap-2">
                                                                <span>⚠️ Under target by <strong>{formatCurrency(targetAmount - actualPaidAmount, locale)}</strong>.</span>
                                                            </div>
                                                        );
                                                        break;
                                                    case "current":
                                                        cardClass = "border-blue-500 shadow-md ring-1 ring-blue-100 bg-white";
                                                        badge = <Badge variant="secondary" className="text-blue-600 bg-blue-100">Current Goal</Badge>;
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
                                                                    <CardTitle className="text-lg">{month.monthYear.split(" ")[0]}</CardTitle>
                                                                    <p className="text-xs text-muted-foreground mt-1">Month {month.month}</p>
                                                                </div>
                                                                {badge}
                                                            </div>
                                                        </CardHeader>
                                                        <CardContent>
                                                            <div className="space-y-1 mb-4">
                                                                <div className="flex justify-between text-sm">
                                                                    <span>Target:</span>
                                                                    <span className="font-semibold">{formatCurrency(targetAmount, locale)}</span>
                                                                </div>

                                                                {(isPaid || actualPaidAmount > 0) && (
                                                                    <div className={`flex justify-between text-sm ${paymentStatus === 'partial' ? 'text-yellow-600 font-bold' : 'text-green-700'}`}>
                                                                        <span>Paid:</span>
                                                                        <span className="font-bold">{formatCurrency(actualPaidAmount, locale)}</span>
                                                                    </div>
                                                                )}
                                                            </div>

                                                            {message}

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
                                                                    Make Payment <ArrowRight className="h-3 w-3"/>
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
                                                                    Complete Payment <ArrowRight className="h-3 w-3"/>
                                                                </Button>
                                                            )}

                                                            {month.paidOffDebts && month.paidOffDebts.length > 0 && (
                                                                <div className="mt-2 pt-2 border-t border-green-200/50 text-xs font-medium text-green-700 flex items-center gap-1">
                                                                    <PartyPopper className="h-3 w-3" />
                                                                    Paid off: {month.paidOffDebts[0]} {month.paidOffDebts.length > 1 && `+${month.paidOffDebts.length - 1}`}
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