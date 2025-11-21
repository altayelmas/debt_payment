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
                <circle cx={cx} cy={cy} r={6} stroke="#ff8c00" strokeWidth={2} fill="white" />
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
                <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                        dataKey="month"
                        label={{ value: t('chartXAxis'), position: 'insideBottomRight', offset: -10 }}
                        interval={11}
                    />
                    <YAxis
                        tickFormatter={(value) => formatCurrency(value, locale)}
                        width={100}
                    />
                    <RechartsTooltip
                        contentStyle={{
                            backgroundColor: "hsl(var(--background))",
                            borderColor: "hsl(var(--border))",
                            borderRadius: "var(--radius)",
                            color: "hsl(var(--foreground))"
                        }}
                        labelFormatter={(label, payload) => {
                            if (payload && payload.length > 0) {
                                const rawMonthYear = payload[0].payload.monthYear;
                                return t('tooltipTitle', {
                                    label: label,
                                    monthYear: formatDateString(rawMonthYear)
                                });
                            }
                            return `Month ${label}`;
                        }}
                        formatter={(value: number) => [formatCurrency(value, locale), t('tooltipLabel')]}
                    />
                    <Legend />
                    <Line
                        type="monotone"
                        dataKey="endingBalance"
                        name={t('tooltipLabel')}
                        stroke="#0989FF"
                        strokeWidth={2}
                        dot={<CustomMilestoneDot />}
                        activeDot={{ r: 8, stroke: 'orange', fill: 'white' }}
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
}