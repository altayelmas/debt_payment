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
import {useLocale} from "next-intl";

interface ResultCardProps {
    result: StrategyResult;
    isSnowball: boolean;
    isRecommended: boolean;
}

export default function ResultCard({result, isSnowball, isRecommended}: ResultCardProps) {
    const locale = useLocale();

    console.log(`[${result.strategyName}] Milestones Verisi:`, result.milestones);

    const borderColor = isRecommended ? 'border-blue-500' : (isSnowball ? 'border-green-500' : 'border-red-500');
    const titleColor = isRecommended ? 'text-blue-600' : (isSnowball ? 'text-green-600' : 'text-red-600');
    const description = isSnowball
        ? "Motivation-based: It delivers quick wins by eliminating even the smallest debts."
        : "Mathematically the most efficient: Minimizes total interest.";

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
                <Badge className="absolute -top-3 right-4">Recommended</Badge>
            )}
            <CardHeader>
                <CardTitle className={`text-2xl font-bold ${titleColor}`}>
                    {result.strategyName}
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-lg flex-grow">
                <div className="flex justify-between items-baseline">
                    <span className="text-base text-muted-foreground">End Date</span>
                    <span className="font-semibold">{result.payOffDate}</span>
                </div>
                <div className="flex justify-between items-baseline">
                    <span className="text-base text-muted-foreground">Total Interest Paid</span>
                    <span className="font-semibold">{formatCurrency(result.totalInterestPaid, locale)}</span>
                </div>
                <div className="flex justify-between items-baseline">
                    <span className="text-base text-muted-foreground">Total Paid</span>
                    <span className="font-semibold">{formatCurrency(result.totalPaid, locale)}</span>
                </div>
            </CardContent>

            <CardFooter>
                <div className="flex flex-col items-start gap-4 w-full">
                    <p className="text-sm text-muted-foreground">{description}</p>

                    <Dialog>
                        <DialogTrigger asChild>
                            <Button variant="outline" size="sm">
                                View Monthly Plan
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-4xl flex flex-col max-h-[90vh]">
                            <DialogHeader>
                                <DialogTitle>{result.strategyName} - Payment Plan</DialogTitle>
                            </DialogHeader>
                            <div className={"overflow-y-auto pr-4"}>
                                {result.milestones && result.milestones.length > 0 && (
                                    <div className="mb-4 p-4 border rounded-lg bg-muted/50">
                                        <h4 className="font-semibold mb-2">Key Milestones</h4>
                                        <ul className="space-y-1 list-disc list-inside text-sm">
                                            {result.milestones.map((milestone) => (
                                                <li key={milestone.month}>
                                                    <strong>Month {milestone.month} ({milestone.monthYear}):</strong>
                                                    <span className="text-green-600 font-medium ml-1">
                                                    &#34;{milestone.debtName}&#34; debt paid off!
                                                </span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                                <Tabs defaultValue="chart" className="w-full">
                                    <TabsList className="grid w-full grid-cols-2">
                                        <TabsTrigger value="chart">Chart</TabsTrigger>
                                        <TabsTrigger value="table">Monthly Breakdown</TabsTrigger>
                                    </TabsList>

                                    <TabsContent value="chart">
                                        <div className="h-[450px] w-full pt-4">
                                            <p className="text-sm text-muted-foreground mb-4">
                                                This chart shows how your total debt balance decreases over time.
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
                                                            value: 'Month',
                                                            position: 'insideBottomRight',
                                                            offset: -10
                                                        }}
                                                        interval={11}
                                                    />
                                                    <YAxis
                                                        tickFormatter={(value) => formatCurrency(value, locale)}
                                                        width={130}
                                                    />
                                                    <RechartsTooltip
                                                        labelFormatter={(label, payload) => {
                                                            if (payload && payload.length > 0) {
                                                                const monthYear = payload[0].payload.monthYear;
                                                                return `Month ${label} (${monthYear})`;
                                                            }
                                                            return `Month ${label}`;
                                                        }}
                                                        formatter={(value: number) => [formatCurrency(value, locale), "Ending Balance"]}
                                                    />
                                                    <Legend/>
                                                    <Line
                                                        type="monotone"
                                                        dataKey="endingBalance"
                                                        name="Ending Balance"
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
                                        <div className="overflow-y-auto pr-4 mt-4">
                                            <Table>
                                                <TableHeader className="sticky top-0 bg-background">
                                                    <TableRow>
                                                        <TableHead className="w-[60px]">Month</TableHead>
                                                        <TableHead>Date</TableHead>
                                                        <TableHead className="text-right">Interest Paid</TableHead>
                                                        <TableHead className="text-right">Principal Paid</TableHead>
                                                        <TableHead className="text-right">Ending Balance</TableHead>
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