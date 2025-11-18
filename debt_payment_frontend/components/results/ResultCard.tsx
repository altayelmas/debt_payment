'use client';

import {Card, CardContent, CardFooter, CardHeader, CardTitle} from "@/components/ui/card";
import {Badge} from '@/components/ui/badge';
import {Button} from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from "@/components/ui/dialog";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table";
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger
} from "@/components/ui/tabs";
import {StrategyResult} from '@/types';
import {formatCurrency} from '@/lib/utils';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip as RechartsTooltip,
    Legend,
    ResponsiveContainer,
    ReferenceLine
} from 'recharts';
import {useLocale, useTranslations} from "next-intl";

interface ResultCardProps {
    result: StrategyResult;
    isSnowball: boolean;
    isRecommended: boolean;
}

export default function ResultCard({result, isSnowball, isRecommended}: ResultCardProps) {
    const locale = useLocale();
    const t = useTranslations('ResultsPage.ResultCard');

    const borderColor = isRecommended ? 'border-blue-500' : (isSnowball ? 'border-green-500' : 'border-red-500');
    const titleColor = isRecommended ? 'text-blue-600' : (isSnowball ? 'text-green-600' : 'text-red-600');
    const description = isSnowball
        ? t('descriptionSnowball')
        : t('descriptionAvalanche');

    const milestoneMonths = new Set(result.milestones.map(m => m.month));

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
                    fill="white"
                />
            );
        }
        return null;
    };
    return (
        <Card className={`border-t-4 ${borderColor} relative flex flex-col`}>
            {isRecommended && (
                <Badge className="absolute -top-3 right-4">{t('recommendedBadge')}</Badge>
            )}
            <CardHeader className="p-3">
                <CardTitle className={`text-xl font-bold ${titleColor}`}>
                    {result.strategyName}
                </CardTitle>
            </CardHeader>
            <CardContent className="p-3 space-y-1.5 text-base">
                <div className="flex justify-between items-baseline">
                    <span className="text-sm text-muted-foreground">{t('endDate')}</span>
                    <span className="font-semibold">{result.payOffDate}</span>
                </div>
                <div className="flex justify-between items-baseline">
                    <span className="text-sm text-muted-foreground">{t('totalInterest')}</span>
                    <span className="font-semibold">{formatCurrency(result.totalInterestPaid, locale)}</span>
                </div>
                <div className="flex justify-between items-baseline">
                    <span className="text-sm text-muted-foreground">{t('totalPaid')}</span>
                    <span className="font-semibold">{formatCurrency(result.totalPaid, locale)}</span>
                </div>
            </CardContent>

            <CardFooter className="p-3">
                <div className="flex flex-col items-start gap-3 w-full">
                    <p className="text-sm text-muted-foreground">{description}</p>

                    <Dialog>
                        <DialogTrigger asChild>
                            <Button variant="outline" size="sm">
                                {t('viewPlanButton')}
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-4xl flex flex-col max-h-[90vh]">
                            <DialogHeader>
                                <DialogTitle>{t('dialogTitle', {strategyName: result.strategyName})}</DialogTitle>
                            </DialogHeader>
                            <div className={"overflow-y-auto pr-4"}>
                                {result.milestones && result.milestones.length > 0 && (
                                    <div className="mb-4 p-4 border rounded-lg">
                                        <h4 className="font-semibold text-lg mb-3">{t('actionPlanTitle')}</h4>

                                        <ol className="relative border-l border-gray-200 dark:border-gray-700 space-y-4">

                                            {result.milestones.map((milestone, index) => {

                                                let startMonth: number;
                                                let startDate: string | undefined;

                                                if (index === 0) {
                                                    startMonth = 1;
                                                    startDate = result.paymentSchedule[0]?.monthYear;
                                                } else {
                                                    const prevMilestone = result.milestones[index - 1];

                                                    if (milestone.month === prevMilestone.month) {
                                                        startMonth = milestone.month;
                                                        startDate = milestone.monthYear;
                                                    } else {
                                                        startMonth = prevMilestone.month + 1;
                                                        startDate = prevMilestone.monthYear;
                                                    }
                                                }
                                                const isSingleMonth = startMonth === milestone.month;
                                                const dateRange = isSingleMonth
                                                    ? t('actionPlanDateSingle', {
                                                        month: milestone.month,
                                                        monthYear: milestone.monthYear
                                                    })
                                                    : t('actionPlanDateRange', {
                                                        startMonth: startMonth,
                                                        endMonth: milestone.month,
                                                        startDate: startDate,
                                                        endDate: milestone.monthYear
                                                    });

                                                return (
                                                    <li key={milestone.month + milestone.debtName} className="ml-4">
                                                        <div className="absolute w-3 h-3 bg-gray-200 rounded-full mt-1.5 -left-1.5 border border-white dark:border-gray-900 dark:bg-gray-700"></div>
                                                        <time className="mb-1 text-sm font-normal leading-none text-muted-foreground">
                                                            {dateRange}
                                                        </time>
                                                        <h3 className="text-md font-semibold text-foreground">
                                                            {t('actionPlanStep', { step: index + 1, debtName: milestone.debtName })}
                                                        </h3>
                                                        <p className="text-sm font-normal text-muted-foreground">
                                                            {t.rich('actionPlanDescription', {
                                                                debtName: milestone.debtName,
                                                                str: (chunks) => <strong className="text-foreground">{chunks}</strong>
                                                            })}
                                                        </p>
                                                    </li>
                                                );
                                            })}
                                        </ol>
                                    </div>
                                )}
                                <Tabs defaultValue="chart" className="w-full">
                                    <TabsList className="grid w-full grid-cols-2">
                                        <TabsTrigger value="chart">{t('chartTab')}</TabsTrigger>
                                        <TabsTrigger value="table">{t('tableTab')}</TabsTrigger>
                                    </TabsList>

                                    <TabsContent value="chart">
                                        <div className="h-[400px] w-full pt-4">
                                            <p className="text-sm text-muted-foreground mb-4">
                                                {t('chartDescription')}
                                            </p>

                                            <ResponsiveContainer width="100%" height="100%">
                                                <LineChart
                                                    data={result.paymentSchedule}
                                                    margin={{top: 5, right: 30, left: 20, bottom: 5}}
                                                >
                                                    <CartesianGrid strokeDasharray="3 3"/>
                                                    <XAxis
                                                        dataKey="month"
                                                        label={{
                                                            value: t('chartXAxis'),
                                                            position: 'insideBottomRight',
                                                            offset: -10
                                                        }}
                                                        interval={11}
                                                    />
                                                    <YAxis
                                                        tickFormatter={(value) => formatCurrency(value, locale)}
                                                        width={100}
                                                    />
                                                    <RechartsTooltip
                                                        labelFormatter={(label, payload) => {
                                                            if (payload && payload.length > 0) {
                                                                const monthYear = payload[0].payload.monthYear;
                                                                return t('tooltipTitle', {label: label, monthYear: monthYear});
                                                            }
                                                            return `Month ${label}`;
                                                        }}
                                                        formatter={(value: number) => [formatCurrency(value, locale), t('tooltipLabel')]}
                                                    />
                                                    <Legend/>
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
                                    </TabsContent>

                                    <TabsContent value="table">
                                        <div className="overflow-y-auto pr-4 mt-2">
                                            <Table>
                                                <TableHeader className="sticky top-0 bg-background">
                                                    <TableRow>
                                                        <TableHead className="w-[60px]">{t('tableHeadMonth')}</TableHead>
                                                        <TableHead>{t('tableHeadDate')}</TableHead>
                                                        <TableHead className="text-right">{t('tableHeadInterest')}</TableHead>
                                                        <TableHead className="text-right">{t('tableHeadPrincipal')}</TableHead>
                                                        <TableHead className="text-right">{t('tableHeadBalance')}</TableHead>
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    {result.paymentSchedule.map((month) => (
                                                        <TableRow key={month.month}>
                                                            <TableCell className="font-medium">{month.month}</TableCell>
                                                            <TableCell>{month.monthYear}</TableCell>
                                                            <TableCell className="text-right text-red-600">
                                                                {formatCurrency(month.interestPaid, locale)}
                                                            </TableCell>
                                                            <TableCell className="text-right text-green-600">
                                                                {formatCurrency(month.principalPaid, locale)}
                                                            </TableCell>
                                                            <TableCell className="text-right font-medium">
                                                                {formatCurrency(month.endingBalance, locale)}
                                                            </TableCell>
                                                        </TableRow>
                                                    ))}
                                                </TableBody>
                                            </Table>
                                        </div>
                                    </TabsContent>
                                </Tabs>
                            </div>
                        </DialogContent>
                    </Dialog>
                </div>
            </CardFooter>
        </Card>
    );
}