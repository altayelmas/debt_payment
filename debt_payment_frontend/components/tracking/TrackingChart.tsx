'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { useTranslations, useLocale } from 'next-intl';
import { formatCurrency } from '@/lib/utils';
import { MonthlyPaymentDetail } from '@/types';

interface TrackingChartProps {
    paymentSchedule: MonthlyPaymentDetail[];
    totalLiability: number;
}

export default function TrackingChart({ paymentSchedule,
                                        totalLiability
}: TrackingChartProps) {
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
            planned: plannedBalance,
            actual: actualBalance
        };
    });

    return (
        <Card>
            <CardHeader>
                <CardTitle>{t('chart.title')}</CardTitle>
                <CardDescription>{t('chart.description')}</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={data} margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                            <XAxis
                                dataKey="monthIndex"
                                tickLine={false}
                                axisLine={false}
                                tickMargin={10}
                                interval={11}
                            />
                            <YAxis
                                tickFormatter={(value) => formatCurrency(value, locale)}
                                tickLine={false}
                                axisLine={false}
                                width={80}
                                fontSize={12}
                            />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: "hsl(var(--background))",
                                    borderColor: "hsl(var(--border))",
                                    borderRadius: "var(--radius)",
                                    color: "hsl(var(--foreground))"
                                }}
                                formatter={(value: number, name: string) => [
                                    formatCurrency(value, locale),
                                    name === t('chart.planned') ? t('chart.plannedBalance') : t('chart.actualBalance')
                                ]}
                                labelFormatter={(label) => t('chart.monthLabel', {month: label})}
                            />
                            <Legend />

                            <Line
                                type="monotone"
                                dataKey="planned"
                                name={t('chart.planned')}
                                stroke="#94a3b8"
                                strokeWidth={2}
                                strokeDasharray="5 5"
                                dot={false}
                            />
                            <Line
                                type="monotone"
                                dataKey="actual"
                                name={t('chart.actual')}
                                stroke="#16a34a"
                                strokeWidth={3}
                                dot={{ r: 4, fill: "#16a34a" }}
                                activeDot={{ r: 6 }}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    );
}