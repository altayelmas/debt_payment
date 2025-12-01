'use client';

import { useState, useEffect } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, PartyPopper, Calendar } from "lucide-react";
import { formatCurrency } from '@/lib/utils';
import { useTranslations, useLocale } from 'next-intl';
import { StrategyResult } from '@/types';

interface TrackingTimelineProps {
    paymentSchedule: StrategyResult['paymentSchedule'];
    currentStrategyResult: StrategyResult;
    isDebtFullyPaid: boolean;
    onMakePayment: (monthYear: string, amount: number) => void;
}

export default function TrackingTimeline({
                                             paymentSchedule,
                                             currentStrategyResult,
                                             isDebtFullyPaid,
                                             onMakePayment
                                         }: TrackingTimelineProps) {
    const t = useTranslations('TrackingPage.page');
    const locale = useLocale();
    const [selectedYearTab, setSelectedYearTab] = useState<string>("");

    const groupedSchedule = paymentSchedule.reduce((acc, month) => {
        const year = month.monthYear.split(" ")[1];
        if (!acc[year]) acc[year] = [];
        acc[year].push(month);
        return acc;
    }, {} as Record<string, typeof paymentSchedule>);

    const years = Object.keys(groupedSchedule);

    useEffect(() => {
        if (years.length > 0 && selectedYearTab === "") {
            const currentYear = new Date().getFullYear().toString();
            const defaultTab = years.includes(currentYear) ? currentYear : years[0];
            setSelectedYearTab(defaultTab);
        }
    }, [years, selectedYearTab]);

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

    return (
        <Tabs value={selectedYearTab} onValueChange={setSelectedYearTab} className="w-full">
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
                            const isCurrentGoal = !isDebtFullyPaid && !isPaid && (globalIndex === 0 || (currentStrategyResult.paymentSchedule[globalIndex - 1] as any).isPaid);

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

                            let cardClass = "border-gray-200 dark:border-gray-700 opacity-70 bg-gray-50 dark:bg-gray-800/50";
                            let badge = null;
                            let message = null;

                            switch (paymentStatus) {
                                case "success":
                                    cardClass = "border-green-500 bg-green-50/40 dark:bg-green-900/20 shadow-sm opacity-100";
                                    badge = <Badge className="bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:text-white">{t('cards.completedBadge')}</Badge>;
                                    break;
                                case "partial":
                                    cardClass = "border-yellow-500 bg-yellow-50/40 dark:bg-yellow-900/20 shadow-sm opacity-100";
                                    badge = <Badge variant="secondary" className="bg-yellow-100 text-yellow-700 dark:bg-yellow-900/50 dark:text-yellow-400 hover:bg-yellow-200 dark:hover:bg-yellow-900/70">{t('cards.partialBadge')}</Badge>;
                                    message = (
                                        <div className="mt-2 text-xs text-yellow-700 dark:text-yellow-300 bg-yellow-100 dark:bg-yellow-900/40 p-2 rounded flex items-center gap-2">
                                            <span>
                                                {t.rich('cards.partialMessage', {
                                                    amount: formatCurrency(targetAmount - actualPaidAmount, locale),
                                                    str: (chunks) => <strong className="font-bold">{chunks}</strong>
                                                })}
                                            </span>
                                        </div>
                                    );
                                    break;
                                case "current":
                                    cardClass = "border-blue-500 shadow-md ring-1 ring-blue-100 dark:ring-blue-900 bg-white dark:bg-gray-800 opacity-100";
                                    badge = <Badge variant="secondary" className="text-blue-600 dark:text-blue-300 bg-blue-100 dark:bg-blue-900/50">{t('cards.currentGoalBadge')}</Badge>;
                                    break;
                                default:
                                    cardClass = "bg-gray-50 dark:bg-gray-900/40 border-gray-200 dark:border-gray-800 text-gray-500 dark:text-gray-500";
                                    break;
                            }

                            return (
                                <Card key={month.month} className={`flex flex-col justify-between transition-all ${cardClass}`}>
                                    <CardHeader className="pb-2">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <CardTitle className="text-lg text-gray-900 dark:text-gray-100">
                                                    {formatMonthName(month.monthYear)}
                                                </CardTitle>
                                                <p className="text-xs text-muted-foreground mt-1">{t('cards.month', {month: month.month})}</p>
                                            </div>
                                            {badge}
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-1 mb-4">
                                            <div className="flex justify-between text-sm text-gray-700 dark:text-gray-300">
                                                <span>{t('cards.target')}</span>
                                                <span className="font-semibold">{formatCurrency(targetAmount, locale)}</span>
                                            </div>

                                            {(isPaid || actualPaidAmount > 0) && (
                                                <div className={`flex justify-between text-sm 
                                                    ${paymentStatus === 'partial'
                                                    ? 'text-yellow-600 dark:text-yellow-400 font-bold'
                                                    : 'text-green-700 dark:text-green-400'
                                                }`}>
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
                                                        onClick={() => onMakePayment(month.monthYear, month.totalPaymentAmount)}
                                                    >
                                                        {t('cards.makePaymentButton')} <ArrowRight className="h-3 w-3"/>
                                                    </Button>
                                                )}

                                                {paymentStatus === 'partial' && (
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        className="w-full gap-2 mt-2 border-yellow-500 text-yellow-700 dark:text-yellow-400 hover:bg-yellow-50 dark:hover:bg-yellow-900/20"
                                                        onClick={() => onMakePayment(month.monthYear, targetAmount - actualPaidAmount)}
                                                    >
                                                        {t('cards.completePaymentButton')} <ArrowRight className="h-3 w-3"/>
                                                    </Button>
                                                )}
                                            </>
                                        )}

                                        {month.paidOffDebts && month.paidOffDebts.length > 0 && (
                                            <div className={`mt-2 pt-2 border-t text-xs font-medium flex items-center gap-1 
                                                ${isPaid
                                                ? "border-green-200/50 dark:border-green-900/50 text-green-700 dark:text-green-400"
                                                : "border-dashed border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400"
                                            }`}>

                                                {isPaid ? (
                                                    <>
                                                        <PartyPopper className="h-3 w-3"/>
                                                        <span>
                                                            {t('cards.paidOffMessage')} {month.paidOffDebts[0]}
                                                            {month.paidOffDebts.length > 1 && ` +${month.paidOffDebts.length - 1}`}
                                                        </span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <Calendar className="h-3 w-3"/>
                                                        <span>
                                                            {t('cards.targetPayoffMessage', { debts: month.paidOffDebts.join(", ") })}
                                                        </span>
                                                    </>
                                                )}
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
    );
}