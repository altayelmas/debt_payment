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
        <div className="rounded-md border w-full">
            <Table>
                <TableHeader className="sticky top-0 bg-background z-10 shadow-sm">
                    <TableRow>
                        <TableHead className="w-[50px]">{t('tableHeadMonth')}</TableHead>
                        <TableHead className="w-[120px]">{t('tableHeadDate')}</TableHead>
                        <TableHead className="hidden xl:table-cell w-[140px] text-center text-xs text-muted-foreground">
                            {t('tableHeadDistribution')}
                        </TableHead>
                        <TableHead className="text-right text-xs px-2">{t('tableHeadInterest')}</TableHead>
                        <TableHead className="text-right text-xs px-2">{t('tableHeadPrincipal')}</TableHead>
                        <TableHead className="text-right font-bold text-blue-600 text-xs px-2">{t('tableHeadPayment')}</TableHead>
                        <TableHead className="text-right text-xs px-2">{t('tableHeadBalance')}</TableHead>

                        <TableHead className="text-right px-2 w-[120px]">{t('tableHeadNotes')}</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {data.map((month) => (
                        <TableRow key={month.month}>
                            <TableCell className="font-medium">{month.month}</TableCell>
                            <TableCell className="text-xs">{formatDateString(month.monthYear)}</TableCell>
                            <TableCell className="hidden xl:table-cell px-1 py-2">
                                <div className="flex flex-col gap-1">
                                    <div className="flex h-1 w-full overflow-hidden rounded-full bg-gray-100">
                                        <div className="bg-red-500" style={{ width: `${(month.interestPaid / month.totalPaymentAmount) * 100}%` }} />
                                        <div className="bg-green-500" style={{ width: `${(month.principalPaid / month.totalPaymentAmount) * 100}%` }} />
                                    </div>
                                    <div className="flex justify-between text-[9px] text-muted-foreground">
                                        <span className="text-red-600">%{Math.round((month.interestPaid / month.totalPaymentAmount) * 100)}</span>
                                        <span className="text-green-600">%{Math.round((month.principalPaid / month.totalPaymentAmount) * 100)}</span>
                                    </div>
                                </div>
                            </TableCell>
                            <TableCell className="text-right text-red-600 text-xs">{formatCurrency(month.interestPaid, locale)}</TableCell>
                            <TableCell className="text-right text-green-600 text-xs">{formatCurrency(month.principalPaid, locale)}</TableCell>
                            <TableCell className="text-right font-bold text-blue-600 text-xs">{formatCurrency(month.totalPaymentAmount, locale)}</TableCell>
                            <TableCell className="text-right text-muted-foreground text-xs">{formatCurrency(month.endingBalance, locale)}</TableCell>

                            <TableCell className="text-right pr-4">
                                {month.paidOffDebts && month.paidOffDebts.length > 0 && (
                                    <TooltipProvider delayDuration={0}>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <Badge
                                                    variant="outline"
                                                    className="border-green-500 text-green-700 bg-green-50 hover:bg-green-100 cursor-default whitespace-nowrap"
                                                >
                                                    {month.paidOffDebts.length > 1
                                                        ? t('paidOffMultiple', { count: month.paidOffDebts.length })
                                                        : t('paidOffSingle', { debtName: month.paidOffDebts[0] })
                                                    }
                                                </Badge>
                                            </TooltipTrigger>

                                            {month.paidOffDebts.length > 1 && (
                                                <TooltipContent className="bg-white border-green-200 text-green-900 shadow-md">
                                                    <p className="font-semibold mb-1 text-xs border-b border-green-100 pb-1">
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