'use client';

import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer
} from 'recharts';
import { useTranslations, useLocale } from "next-intl";
import { formatCurrency } from '@/lib/utils';
import { StrategyResult } from '@/types';

interface StrategyChartProps {
    data: StrategyResult['paymentSchedule'];
    milestones: StrategyResult['milestones'];
    formatDateString: (date: string) => string;
}

export default function StrategyChart({ data, milestones, formatDateString }: StrategyChartProps) {
    const t = useTranslations('ResultsPage.ResultCard');
    const locale = useLocale();

    const milestoneMonths = new Set(milestones.map(m => m.month));

    const CustomMilestoneDot = (props: any) => {
        const { cx, cy, payload } = props;
        if (milestoneMonths.has(payload.month)) {
            return (
                <circle
                    cx={cx}
                    cy={cy}
                    r={6}
                    stroke="#ff8c00"
                    strokeWidth={2}
                    fill="hsl(var(--background))"
                />
            );
        }
        return null;
    };

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
            const currentMonth = currentData.month;

            const debtsPaidThisMonth = milestones
                .filter(m => m.month === currentMonth)
                .map(m => m.debtName);

            return (
                <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg shadow-lg p-3 min-w-[200px] text-sm z-50">
                    <p className="font-semibold mb-2 border-b border-gray-100 dark:border-gray-800 pb-1 text-gray-900 dark:text-gray-100">
                        {t('tooltipTitle', {
                            label: currentMonth,
                            monthYear: formatDateString(currentData.monthYear)
                        })}
                    </p>

                    <div className="flex justify-between items-center mb-1 gap-4">
                        <span className="text-muted-foreground dark:text-gray-400">{t('chartTooltipBalance')}:</span>
                        <span className="font-bold text-blue-600 dark:text-blue-400">
                            {formatCurrency(currentData.endingBalance, locale)}
                        </span>
                    </div>

                    {debtsPaidThisMonth.length > 0 && (
                        <div className="mt-3 bg-green-50 dark:bg-green-900/20 p-2 rounded text-xs border border-green-100 dark:border-green-900/30">
                            <p className="font-semibold text-green-700 dark:text-green-400 mb-1">
                                {t('chartTooltipPaidOff')}
                            </p>
                            <ul className="list-disc list-inside space-y-0.5">
                                {debtsPaidThisMonth.map((debt, index) => (
                                    <li key={index} className="text-gray-700 dark:text-gray-300">
                                        {debt}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            );
        }
        return null;
    };

    return (
        <div className="h-[400px] w-full pt-4">
            <p className="text-sm text-muted-foreground dark:text-gray-400 mb-4">
                {t('chartDescription')}
            </p>

            <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 25 }}>
                    <CartesianGrid
                        strokeDasharray="3 3"
                        vertical={false}
                        stroke="hsl(var(--border))"
                    />

                    <XAxis
                        dataKey="month"
                        tick={<CustomXAxisTick />}
                        label={{
                            value: t('chartXAxis'),
                            position: 'insideBottomRight',
                            offset: -10,
                            fill: "hsl(var(--muted-foreground))"
                        }}
                        interval="preserveStartEnd"
                        minTickGap={30}
                    />

                    <YAxis
                        tick={<CustomYAxisTick />}
                        width={90}
                    />

                    <RechartsTooltip content={<CustomTooltip />} cursor={{ stroke: 'hsl(var(--muted-foreground))', strokeWidth: 1, strokeDasharray: '4 4' }} />

                    <Legend verticalAlign="top" height={36} formatter={(value) => <span className="text-gray-900 dark:text-gray-100">{value}</span>} />

                    <Line
                        type="monotone"
                        dataKey="endingBalance"
                        name={t('tooltipLabel')}
                        stroke="#0989FF"
                        strokeWidth={3}
                        dot={<CustomMilestoneDot />}
                        activeDot={{ r: 8, stroke: '#ff8c00', fill: 'hsl(var(--background))', strokeWidth: 2 }}
                        animationDuration={1500}
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
}