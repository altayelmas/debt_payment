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
import {Download} from "lucide-react";
import api from "@/lib/api";
import toast from "react-hot-toast";

import {useLocale, useTranslations} from "next-intl";

interface ResultCardProps {
    result: StrategyResult;
    isSnowball: boolean;
    isRecommended: boolean;
    reportId: string;
}

export default function ResultCard({result, isSnowball, isRecommended, reportId}: ResultCardProps) {
    const locale = useLocale();
    const t = useTranslations('ResultsPage.ResultCard');

    const formatDateString = (dateString: string | undefined) => {
        if (!dateString) return "";
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

    const handleDownloadPdf = async () => {
        const loadingToast = toast.loading(t('toastGeneratingPdf'));
        try {
            const response = await api.get(`/api/calculation/${reportId}/pdf`, {
                responseType: 'blob',
                headers: {
                    'Accept-Language': locale
                }
            });

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `${result.strategyName}-Plan.pdf`);
            document.body.appendChild(link);
            link.click();

            link.remove();
            window.URL.revokeObjectURL(url);

            toast.success(t('toastPdfDownloaded'), {id: loadingToast});
        } catch (error) {
            console.error(error);
            toast.error(t('toastPdfError'), {id: loadingToast});
        }
    };

    const borderColor = isRecommended ? 'border-blue-500' : (isSnowball ? 'border-green-500' : 'border-red-500');
    const titleColor = isRecommended ? 'text-blue-600' : (isSnowball ? 'text-green-600' : 'text-red-600');
    const description = isSnowball
        ? t('descriptionSnowball')
        : t('descriptionAvalanche');

    const milestoneMonths = new Set(result.milestones.map(m => m.month));

    const CustomMilestoneDot = (props: any) => {
        const {cx, cy, payload} = props;

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
                    <span className="font-semibold">{formatPayOffDate(result.payOffDate)}</span>
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
                    <div className={"w-full flex flex-col gap-2"}>
                        <Dialog>
                            <DialogTrigger asChild>
                                <Button variant="outline" size="sm" className="w-full">
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
                                                            monthYear: formatDateString(milestone.monthYear)
                                                        })
                                                        : t('actionPlanDateRange', {
                                                            startMonth: startMonth,
                                                            endMonth: milestone.month,
                                                            startDate: formatDateString(startDate),
                                                            endDate: formatDateString(milestone.monthYear)
                                                        });

                                                    return (
                                                        <li key={milestone.month + milestone.debtName} className="ml-4">
                                                            <div
                                                                className="absolute w-3 h-3 bg-gray-200 rounded-full mt-1.5 -left-1.5 border border-white dark:border-gray-900 dark:bg-gray-700"></div>
                                                            <time
                                                                className="mb-1 text-sm font-normal leading-none text-muted-foreground">
                                                                {dateRange}
                                                            </time>
                                                            <h3 className="text-md font-semibold text-foreground">
                                                                {t('actionPlanStep', {
                                                                    step: index + 1,
                                                                    debtName: milestone.debtName
                                                                })}
                                                            </h3>
                                                            <p className="text-sm font-normal text-muted-foreground">
                                                                {t.rich('actionPlanDescription', {
                                                                    debtName: milestone.debtName,
                                                                    str: (chunks) => <strong
                                                                        className="text-foreground">{chunks}</strong>
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
                                                            contentStyle={{
                                                                backgroundColor: "hsl(var(--background))",
                                                                borderColor: "hsl(var(--border))",
                                                                borderRadius: "var(--radius)",
                                                                color: "hsl(var(--foreground))"}}

                                                            labelStyle={{
                                                                color: "hsl(var(--foreground))",
                                                                fontWeight: "bold",
                                                                marginBottom: "0.25rem"
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
                                                        <Legend/>
                                                        <Line
                                                            type="monotone"
                                                            dataKey="endingBalance"
                                                            name={t('tooltipLabel')}
                                                            stroke="#0989FF"
                                                            strokeWidth={2}
                                                            dot={<CustomMilestoneDot/>}
                                                            activeDot={{r: 8, stroke: 'orange', fill: 'white'}}
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
                                                            <TableHead
                                                                className="w-[60px]">{t('tableHeadMonth')}</TableHead>
                                                            <TableHead>{t('tableHeadDate')}</TableHead>
                                                            <TableHead className="w-[150px] text-center text-xs text-muted-foreground">
                                                                {t('tableHeadDistribution')}
                                                            </TableHead>
                                                            <TableHead className="text-right">{t('tableHeadInterest')}</TableHead>
                                                            <TableHead className="text-right">{t('tableHeadPrincipal')}</TableHead>
                                                            <TableHead className="text-right font-bold text-blue-600">
                                                                {t('tableHeadPayment')}
                                                            </TableHead>
                                                            <TableHead className="text-right">{t('tableHeadBalance')}</TableHead>
                                                            <TableHead className="text-left pl-4">{t('tableHeadNotes')}</TableHead>
                                                        </TableRow>
                                                    </TableHeader>
                                                    <TableBody>
                                                        {result.paymentSchedule.map((month) => (
                                                            <TableRow key={month.month}>
                                                                <TableCell
                                                                    className="font-medium">{month.month}</TableCell>
                                                                <TableCell>{formatDateString(month.monthYear)}</TableCell>
                                                                <TableCell>
                                                                    <div className="flex flex-col gap-1">
                                                                        <div className="flex h-2 w-full overflow-hidden rounded-full bg-gray-100">
                                                                            <div
                                                                                className="bg-red-500"
                                                                                style={{ width: `${(month.interestPaid / month.totalPaymentAmount) * 100}%` }}
                                                                            />
                                                                            <div
                                                                                className="bg-green-500"
                                                                                style={{ width: `${(month.principalPaid / month.totalPaymentAmount) * 100}%` }}
                                                                            />
                                                                        </div>
                                                                        <div className="flex justify-between text-[10px] text-muted-foreground">
                                                                            <span className="text-red-600">{t('breakdownInterest')}: %{Math.round((month.interestPaid / month.totalPaymentAmount) * 100)}</span>
                                                                            <span className="text-green-600">{t('breakdownPrincipal')}: %{Math.round((month.principalPaid / month.totalPaymentAmount) * 100)}</span>
                                                                        </div>
                                                                    </div>
                                                                </TableCell>
                                                                <TableCell className="text-right text-red-600">
                                                                    {formatCurrency(month.interestPaid, locale)}
                                                                </TableCell>
                                                                <TableCell className="text-right text-green-600">
                                                                    {formatCurrency(month.principalPaid, locale)}
                                                                </TableCell>
                                                                <TableCell className="text-right font-bold text-blue-600">
                                                                    {formatCurrency(month.totalPaymentAmount, locale)}
                                                                </TableCell>
                                                                <TableCell className="text-right text-muted-foreground">
                                                                    {formatCurrency(month.endingBalance, locale)}
                                                                </TableCell>
                                                                <TableCell className="text-left pl-4">
                                                                    {month.paidOffDebts && month.paidOffDebts.length > 0 && (
                                                                        <Badge variant="outline" className="border-green-500 text-green-600 bg-green-50">
                                                                            🎉 {t('paidOffMessage', { debts: month.paidOffDebts.join(", ") })}
                                                                        </Badge>
                                                                    )}
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
                        <Button
                            variant="outline"
                            size="sm"
                            className="w-full mt-2"
                            onClick={handleDownloadPdf}
                        >
                            <Download className="mr-2 h-4 w-4" />
                            {t('downloadPdfButton')}
                        </Button>
                    </div>
                </div>
            </CardFooter>
        </Card>
    );
}