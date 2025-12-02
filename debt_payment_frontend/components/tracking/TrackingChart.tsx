'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Legend
} from 'recharts';
import { useTranslations, useLocale } from 'next-intl';
import { formatCurrency } from '@/lib/utils';
import { MonthlyPaymentDetail } from '@/types';

interface TrackingChartProps {
    paymentSchedule: MonthlyPaymentDetail[];
    totalLiability: number;
}

export default function TrackingChart({ paymentSchedule, totalLiability }: TrackingChartProps) {
    const t = useTranslations('TrackingPage.page');
    const locale = useLocale();

    let cumulativePlannedPayment = 0;
    let cumulativeActualPayment = 0;

    const data = paymentSchedule.map((month) => {
        const label = month.monthYear.split(" ")[0].slice(0, 3) + " " + month.monthYear.split(" ")[1].slice(2);

        cumulativePlannedPayment += month.totalPaymentAmount;

        const plannedBalance = Math.max(0, totalLiability - cumulativePlannedPayment);
        let actualBalance = null;

        if (month.isPaid) {
            cumulativeActualPayment += (month.actualPaidAmount || 0);
            actualBalance = Math.max(0, totalLiability - cumulativeActualPayment);
        }

        return {
            name: label,
            monthIndex: month.month,
            fullMonthYear: month.monthYear,
            planned: plannedBalance,
            actual: actualBalance
        };
    });

    const CustomXAxisTick = ({ x, y, payload }: any) => {
        return (
            <text x={x} y={y + 12} textAnchor="middle" className="fill-gray-600 dark:fill-gray-400 text-xs font-medium">
                {payload.value}
            </text>
        );
    };

    const CustomYAxisTick = ({ x, y, payload }: any) => {
        return (
            <text x={x} y={y + 4} textAnchor="end" className="fill-gray-600 dark:fill-gray-400 text-xs font-medium">
                {formatCurrency(payload.value, locale)}
            </text>
        );
    };

    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            const currentData = payload[0].payload;

            return (
                <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg shadow-lg p-3 min-w-[200px] text-sm z-50">
                    <p className="font-semibold mb-2 border-b border-gray-100 dark:border-gray-800 pb-1 text-gray-900 dark:text-gray-100">
                        {t('chart.monthLabel', { month: currentData.monthIndex })} ({currentData.fullMonthYear})
                    </p>

                    <div className="flex justify-between items-center mb-1 gap-4">
                        <span className="text-muted-foreground dark:text-gray-400 flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-blue-400"></span>
                            {t('chart.plannedBalance')}:
                        </span>
                        <span className="font-bold text-gray-900 dark:text-gray-100">
                            {formatCurrency(currentData.planned, locale)}
                        </span>
                    </div>

                    {currentData.actual !== null && (
                        <div className="flex justify-between items-center gap-4">
                            <span className="text-muted-foreground dark:text-gray-400 flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-green-500"></span>
                                {t('chart.actualBalance')}:
                            </span>
                            <span className="font-bold text-green-600 dark:text-green-400">
                                {formatCurrency(currentData.actual, locale)}
                            </span>
                        </div>
                    )}
                </div>
            );
        }
        return null;
    };

    return (
        <Card className="border-none shadow-none bg-transparent pt-0">
            <CardHeader className="px-0 pt-0">
                <CardDescription>{t('chart.description')}</CardDescription>
            </CardHeader>
            <CardContent className="px-0">
                <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={data} margin={{ top: 5, right: 30, left: 10, bottom: 5 }}>
                            <CartesianGrid
                                strokeDasharray="3 3"
                                vertical={false}
                                stroke="hsl(var(--border))"
                            />

                            <XAxis
                                dataKey="monthIndex"
                                tick={<CustomXAxisTick />}
                                tickLine={false}
                                axisLine={false}
                                tickMargin={10}
                                interval={11}
                            />

                            <YAxis
                                tick={<CustomYAxisTick />}
                                tickLine={false}
                                axisLine={false}
                                width={85}
                            />

                            <RechartsTooltip
                                content={<CustomTooltip />}
                                cursor={{ stroke: 'hsl(var(--muted-foreground))', strokeWidth: 1, strokeDasharray: '4 4' }}
                            />

                            <Legend
                                verticalAlign="top"
                                height={36}
                                formatter={(value) => <span className="text-gray-700 dark:text-gray-300 font-medium text-sm">{value}</span>}
                            />

                            <Line
                                type="monotone"
                                dataKey="planned"
                                name={t('chart.planned')}
                                stroke="#60a5fa"
                                strokeWidth={2}
                                strokeDasharray="5 5"
                                dot={false}
                                activeDot={{ r: 4, stroke: '#60a5fa', fill: 'hsl(var(--background))', strokeWidth: 2 }}
                            />

                            <Line
                                type="monotone"
                                dataKey="actual"
                                name={t('chart.actual')}
                                stroke="#10b981"
                                strokeWidth={3}
                                dot={{ r: 4, fill: "#10b981", strokeWidth: 0 }}
                                activeDot={{ r: 6, fill: "#10b981", strokeWidth: 0 }}
                                animationDuration={1500}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    );
}