import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer
} from 'recharts';
import { useTranslations, useLocale } from "next-intl";
import { formatCurrency } from '@/lib/utils';
import { StrategyResult } from '@/types';
import { Card } from "@/components/ui/card";

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
                <circle cx={cx} cy={cy} r={6} stroke="#ff8c00" strokeWidth={2} fill="white" />
            );
        }
        return null;
    };

    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            const currentData = payload[0].payload;
            const currentMonth = currentData.month;

            const debtsPaidThisMonth = milestones
                .filter(m => m.month === currentMonth)
                .map(m => m.debtName);

            return (
                <div className="bg-background border rounded-lg shadow-lg p-3 min-w-[200px] text-sm z-50">
                    <p className="font-semibold mb-2 border-b pb-1">
                        {t('tooltipTitle', {
                            label: currentMonth,
                            monthYear: formatDateString(currentData.monthYear)
                        })}
                    </p>

                    <div className="flex justify-between items-center mb-1 gap-4">
                        <span className="text-muted-foreground">{t('chartTooltipBalance')}:</span>
                        <span className="font-bold text-blue-600">
                            {formatCurrency(currentData.endingBalance, locale)}
                        </span>
                    </div>

                    {debtsPaidThisMonth.length > 0 && (
                        <div className="mt-3 bg-green-50 dark:bg-green-900/20 p-2 rounded text-xs">
                            <p className="font-semibold text-green-700 dark:text-green-400 mb-1">
                                {t('chartTooltipPaidOff')}
                            </p>
                            <ul className="list-disc list-inside space-y-0.5">
                                {debtsPaidThisMonth.map((debt, index) => (
                                    <li key={index} className="text-foreground">
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
            <p className="text-sm text-muted-foreground mb-4">
                {t('chartDescription')}
            </p>

            <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 25 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                    <XAxis
                        dataKey="month"
                        label={{ value: t('chartXAxis'), position: 'insideBottomRight', offset: -10 }}
                        interval="preserveStartEnd"
                        minTickGap={30}
                        tick={{ fontSize: 12 }}
                    />
                    <YAxis
                        tickFormatter={(value) => formatCurrency(value, locale)}
                        width={90}
                        tick={{ fontSize: 12 }}
                    />

                    <RechartsTooltip content={<CustomTooltip />} />

                    <Legend verticalAlign="top" height={36} />

                    <Line
                        type="monotone"
                        dataKey="endingBalance"
                        name={t('tooltipLabel')}
                        stroke="#0989FF"
                        strokeWidth={3}
                        dot={<CustomMilestoneDot />}
                        activeDot={{ r: 8, stroke: 'orange', fill: 'white', strokeWidth: 2 }}
                        animationDuration={1500}
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
}