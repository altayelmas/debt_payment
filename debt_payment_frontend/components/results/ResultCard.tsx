'use client';

import {useRouter} from '@/i18n/navigation';
import {Card, CardContent, CardFooter, CardHeader, CardTitle} from "@/components/ui/card";
import {Badge} from '@/components/ui/badge';
import {Button} from "@/components/ui/button";
import {Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger} from "@/components/ui/dialog";
import {Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/ui/tabs";
import {Download} from "lucide-react";
import {formatCurrency} from '@/lib/utils';
import {StrategyResult} from '@/types';

import ActionPlanTimeline from "./ActionPlanTimeline";
import StrategyChart from "./StrategyChart";
import StrategyTable from "./StrategyTable";
import {useResultCardLogic} from "./useResultCardLogic";

import {Play} from "lucide-react";
import toast from "react-hot-toast";
import api from "@/lib/api";

interface ResultCardProps {
    result: StrategyResult;
    isSnowball: boolean;
    isRecommended: boolean;
    reportId: string;
}

export default function ResultCard({result, isSnowball, isRecommended, reportId}: ResultCardProps) {
    const {
        formatDateString,
        formatPayOffDate,
        handleDownloadPdf,
        isLoading,
        t,
        locale
    } = useResultCardLogic(reportId, isSnowball);
    const router = useRouter();

    const borderColor = isRecommended
        ? 'border-blue-500 dark:border-blue-500'
        : (isSnowball ? 'border-green-500 dark:border-green-500' : 'border-red-500 dark:border-red-500');

    const titleColor = isRecommended
        ? 'text-blue-600 dark:text-blue-400'
        : (isSnowball ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400');

    const description = isSnowball ? t('descriptionSnowball') : t('descriptionAvalanche');

    const handleActivatePlan = async () => {
        const loadingToast = toast.loading("Activating plan...");
        try {
            await api.post(`/api/plan/activate/${reportId}`);

            toast.success("Plan activated! Redirecting to tracking...", {id: loadingToast});

            setTimeout(() => router.push('/tracking'), 1000);

        } catch (error) {
            toast.error("Could not activate plan.", {id: loadingToast});
        }
    };

    return (
        <Card className={`border-t-4 ${borderColor} relative flex flex-col bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 shadow-sm`}>
            {isRecommended && (
                <Badge className="absolute -top-3 right-4 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 border-none">
                    {t('recommendedBadge')}
                </Badge>
            )}

            <CardHeader className="p-4">
                <CardTitle className={`text-xl font-bold ${titleColor}`}>
                    {result.strategyName}
                </CardTitle>
            </CardHeader>

            <CardContent className="p-4 space-y-2 text-base">
                <div className="flex justify-between items-baseline">
                    <span className="text-sm text-muted-foreground dark:text-gray-400">{t('endDate')}</span>
                    <span className="font-semibold text-gray-900 dark:text-gray-100">{formatPayOffDate(result.payOffDate)}</span>
                </div>
                <div className="flex justify-between items-baseline">
                    <span className="text-sm text-muted-foreground dark:text-gray-400">{t('totalInterest')}</span>
                    <span className="font-semibold text-gray-900 dark:text-gray-100">{formatCurrency(result.totalInterestPaid, locale)}</span>
                </div>
                <div className="flex justify-between items-baseline">
                    <span className="text-sm text-muted-foreground dark:text-gray-400">{t('totalPaid')}</span>
                    <span className="font-semibold text-gray-900 dark:text-gray-100">{formatCurrency(result.totalPaid, locale)}</span>
                </div>
            </CardContent>

            <CardFooter className="p-4 pt-0 mt-auto">
                <div className="flex flex-col items-start gap-4 w-full">
                    <p className="text-sm text-muted-foreground dark:text-gray-400 min-h-[40px]">{description}</p>
                    <div className={"w-full flex flex-col gap-2"}>
                        <Dialog>
                            <DialogTrigger asChild>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="w-full bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-200 border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800"
                                >
                                    {t('viewPlanButton')}
                                </Button>
                            </DialogTrigger>

                            <DialogContent className="sm:max-w-5xl flex flex-col max-h-[90vh] bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 text-gray-900 dark:text-gray-100">
                                <DialogHeader>
                                    <DialogTitle>{t('dialogTitle', {strategyName: result.strategyName})}</DialogTitle>
                                </DialogHeader>

                                <div className={"overflow-y-auto px-1"}>
                                    <ActionPlanTimeline
                                        milestones={result.milestones}
                                        paymentSchedule={result.paymentSchedule}
                                        formatDateString={formatDateString}
                                    />

                                    <Tabs defaultValue="chart" className="w-full">
                                        <TabsList className="grid w-full grid-cols-2 bg-gray-100 dark:bg-gray-800">
                                            <TabsTrigger
                                                value="chart"
                                                className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 dark:text-gray-200 dark:data-[state=active]:text-white"
                                            >
                                                {t('chartTab')}
                                            </TabsTrigger>
                                            <TabsTrigger
                                                value="table"
                                                className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 dark:text-gray-200 dark:data-[state=active]:text-white"
                                            >
                                                {t('tableTab')}
                                            </TabsTrigger>
                                        </TabsList>

                                        <TabsContent value="chart" className="w-full mt-4">
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
                            className="w-full mt-2 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-200 border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800"
                            onClick={handleDownloadPdf}
                            disabled={isLoading}
                        >
                            <Download className="mr-2 h-4 w-4"/>
                            {isLoading ? t('toastGeneratingPdf') : t('downloadPdfButton')}
                        </Button>

                        <Button
                            className={`w-full text-white ${isRecommended
                                ? "bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700"
                                : "bg-primary dark:bg-gray-100 dark:text-gray-900 dark:hover:bg-gray-200"}`}
                            onClick={handleActivatePlan}
                        >
                            <Play className="mr-2 h-4 w-4"/>
                            {t('startPlanButton')}
                        </Button>
                    </div>
                </div>
            </CardFooter>
        </Card>
    );
}