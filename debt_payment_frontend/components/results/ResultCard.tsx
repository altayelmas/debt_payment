'use client';

import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from '@/components/ui/badge';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Download } from "lucide-react";
import { formatCurrency } from '@/lib/utils';
import { StrategyResult } from '@/types';

import ActionPlanTimeline from "./ActionPlanTimeline";
import StrategyChart from "./StrategyChart";
import StrategyTable from "./StrategyTable";
import { useResultCardLogic } from "./useResultCardLogic";

interface ResultCardProps {
    result: StrategyResult;
    isSnowball: boolean;
    isRecommended: boolean;
    reportId: string;
}

export default function ResultCard({ result, isSnowball, isRecommended, reportId }: ResultCardProps) {
    const { formatDateString, formatPayOffDate, handleDownloadPdf, isLoading, t, locale } = useResultCardLogic(reportId, isSnowball);

    const borderColor = isRecommended ? 'border-blue-500' : (isSnowball ? 'border-green-500' : 'border-red-500');
    const titleColor = isRecommended ? 'text-blue-600' : (isSnowball ? 'text-green-600' : 'text-red-600');
    const description = isSnowball ? t('descriptionSnowball') : t('descriptionAvalanche');

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
                                    <DialogTitle>{t('dialogTitle', { strategyName: result.strategyName })}</DialogTitle>
                                </DialogHeader>

                                <div className={"overflow-y-auto pr-4"}>
                                    <ActionPlanTimeline
                                        milestones={result.milestones}
                                        paymentSchedule={result.paymentSchedule}
                                        formatDateString={formatDateString}
                                    />

                                    <Tabs defaultValue="chart" className="w-full">
                                        <TabsList className="grid w-full grid-cols-2">
                                            <TabsTrigger value="chart">{t('chartTab')}</TabsTrigger>
                                            <TabsTrigger value="table">{t('tableTab')}</TabsTrigger>
                                        </TabsList>

                                        <TabsContent value="chart">
                                            <StrategyChart
                                                data={result.paymentSchedule}
                                                milestones={result.milestones}
                                                formatDateString={formatDateString}
                                            />
                                        </TabsContent>

                                        <TabsContent value="table">
                                            <StrategyTable
                                                data={result.paymentSchedule}
                                                formatDateString={formatDateString}
                                            />
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
                            disabled={isLoading}
                        >
                            <Download className="mr-2 h-4 w-4" />
                            {isLoading ? t('toastGeneratingPdf') : t('downloadPdfButton')}
                        </Button>
                    </div>
                </div>
            </CardFooter>
        </Card>
    );
}