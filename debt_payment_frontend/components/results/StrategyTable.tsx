import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from "@/components/ui/table";
import { Badge } from '@/components/ui/badge';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { formatCurrency } from '@/lib/utils';
import { useLocale, useTranslations } from "next-intl";
import { StrategyResult } from '@/types';
import { Info } from "lucide-react";

interface StrategyTableProps {
    data: StrategyResult['paymentSchedule'];
    formatDateString: (date: string) => string;
}

export default function StrategyTable({ data, formatDateString }: StrategyTableProps) {
    const t = useTranslations('ResultsPage.ResultCard');
    const locale = useLocale();

    return (
        <div className="rounded-md border border-gray-200 dark:border-gray-800 w-full bg-white dark:bg-gray-900">
            <Table>
                <TableHeader className="sticky top-0 bg-white dark:bg-gray-900 z-10 shadow-sm border-b border-gray-200 dark:border-gray-800">
                    <TableRow className="border-gray-200 dark:border-gray-800 hover:bg-transparent">
                        <TableHead className="w-[50px] text-gray-700 dark:text-gray-300">{t('tableHeadMonth')}</TableHead>
                        <TableHead className="w-[120px] text-gray-700 dark:text-gray-300">{t('tableHeadDate')}</TableHead>
                        <TableHead className="hidden xl:table-cell w-[140px] text-center text-xs text-muted-foreground dark:text-gray-400">
                            {t('tableHeadDistribution')}
                        </TableHead>
                        <TableHead className="text-right text-xs px-2 text-gray-700 dark:text-gray-300">{t('tableHeadInterest')}</TableHead>
                        <TableHead className="text-right text-xs px-2 text-gray-700 dark:text-gray-300">{t('tableHeadPrincipal')}</TableHead>
                        <TableHead className="text-right font-bold text-blue-600 dark:text-blue-400 text-xs px-2">{t('tableHeadPayment')}</TableHead>
                        <TableHead className="text-right text-xs px-2 text-gray-700 dark:text-gray-300">{t('tableHeadBalance')}</TableHead>

                        <TableHead className="text-right px-2 w-[120px] text-gray-700 dark:text-gray-300">{t('tableHeadNotes')}</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {data.map((month) => (
                        <TableRow key={month.month} className="border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                            <TableCell className="font-medium text-gray-900 dark:text-gray-200">{month.month}</TableCell>
                            <TableCell className="text-xs text-gray-600 dark:text-gray-400">{formatDateString(month.monthYear)}</TableCell>
                            <TableCell className="hidden xl:table-cell px-1 py-2">
                                <div className="flex flex-col gap-1">
                                    <div className="flex h-1 w-full overflow-hidden rounded-full bg-gray-100 dark:bg-gray-700">
                                        <div className="bg-red-500" style={{ width: `${(month.interestPaid / month.totalPaymentAmount) * 100}%` }} />
                                        <div className="bg-green-500" style={{ width: `${(month.principalPaid / month.totalPaymentAmount) * 100}%` }} />
                                    </div>
                                    <div className="flex justify-between text-[9px] text-muted-foreground">
                                        <span className="text-red-600 dark:text-red-400">%{Math.round((month.interestPaid / month.totalPaymentAmount) * 100)}</span>
                                        <span className="text-green-600 dark:text-green-400">%{Math.round((month.principalPaid / month.totalPaymentAmount) * 100)}</span>
                                    </div>
                                </div>
                            </TableCell>

                            <TableCell className="text-right text-red-600 dark:text-red-400 text-xs">{formatCurrency(month.interestPaid, locale)}</TableCell>
                            <TableCell className="text-right text-green-600 dark:text-green-400 text-xs">{formatCurrency(month.principalPaid, locale)}</TableCell>
                            <TableCell className="text-right font-bold text-blue-600 dark:text-blue-400 text-xs">{formatCurrency(month.totalPaymentAmount, locale)}</TableCell>
                            <TableCell className="text-right text-muted-foreground dark:text-gray-500 text-xs">{formatCurrency(month.endingBalance, locale)}</TableCell>

                            <TableCell className="text-right pr-4">
                                {month.paidOffDebts && month.paidOffDebts.length > 0 && (
                                    <TooltipProvider delayDuration={0}>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <Badge
                                                    variant="outline"
                                                    className="border-green-500 dark:border-green-600 text-green-700 dark:text-green-300 bg-green-50 dark:bg-green-900/30 hover:bg-green-100 dark:hover:bg-green-900/50 cursor-default whitespace-nowrap"
                                                >
                                                    {month.paidOffDebts.length > 1
                                                        ? t('paidOffMultiple', { count: month.paidOffDebts.length })
                                                        : t('paidOffSingle', { debtName: month.paidOffDebts[0] })
                                                    }
                                                </Badge>
                                            </TooltipTrigger>

                                            {month.paidOffDebts.length > 1 && (
                                                <TooltipContent className="bg-white dark:bg-gray-900 border-green-200 dark:border-green-800 text-green-900 dark:text-green-100 shadow-md">
                                                    <p className="font-semibold mb-1 text-xs border-b border-green-100 dark:border-green-800 pb-1">
                                                        {t('chartTooltipPaidOff')}
                                                    </p>
                                                    <ul className="list-disc list-inside text-xs">
                                                        {month.paidOffDebts.map((debt, idx) => (
                                                            <li key={idx}>{debt}</li>
                                                        ))}
                                                    </ul>
                                                </TooltipContent>
                                            )}
                                        </Tooltip>
                                    </TooltipProvider>
                                )}
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}