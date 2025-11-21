import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from "@/components/ui/table";
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/lib/utils';
import { useLocale, useTranslations } from "next-intl";
import { StrategyResult } from '@/types';

interface StrategyTableProps {
    data: StrategyResult['paymentSchedule'];
    formatDateString: (date: string) => string;
}

export default function StrategyTable({ data, formatDateString }: StrategyTableProps) {
    const t = useTranslations('ResultsPage.ResultCard');
    const locale = useLocale();

    return (
        <div className="overflow-y-auto pr-4 mt-2">
            <Table>
                <TableHeader className="sticky top-0 bg-background">
                    <TableRow>
                        <TableHead className="w-[60px]">{t('tableHeadMonth')}</TableHead>
                        <TableHead>{t('tableHeadDate')}</TableHead>
                        <TableHead className="w-[150px] text-center text-xs text-muted-foreground">
                            {t('tableHeadDistribution')}
                        </TableHead>
                        <TableHead className="text-right">{t('tableHeadInterest')}</TableHead>
                        <TableHead className="text-right">{t('tableHeadPrincipal')}</TableHead>
                        <TableHead className="text-right font-bold text-blue-600">{t('tableHeadPayment')}</TableHead>
                        <TableHead className="text-right">{t('tableHeadBalance')}</TableHead>
                        <TableHead className="text-left pl-4">{t('tableHeadNotes')}</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {data.map((month) => (
                        <TableRow key={month.month}>
                            <TableCell className="font-medium">{month.month}</TableCell>
                            <TableCell>{formatDateString(month.monthYear)}</TableCell>
                            <TableCell>
                                <div className="flex flex-col gap-1">
                                    <div className="flex h-2 w-full overflow-hidden rounded-full bg-gray-100">
                                        <div className="bg-red-500" style={{ width: `${(month.interestPaid / month.totalPaymentAmount) * 100}%` }} />
                                        <div className="bg-green-500" style={{ width: `${(month.principalPaid / month.totalPaymentAmount) * 100}%` }} />
                                    </div>
                                    <div className="flex justify-between text-[10px] text-muted-foreground">
                                        <span className="text-red-600">{t('breakdownInterest')}: %{Math.round((month.interestPaid / month.totalPaymentAmount) * 100)}</span>
                                        <span className="text-green-600">{t('breakdownPrincipal')}: %{Math.round((month.principalPaid / month.totalPaymentAmount) * 100)}</span>
                                    </div>
                                </div>
                            </TableCell>
                            <TableCell className="text-right text-red-600">{formatCurrency(month.interestPaid, locale)}</TableCell>
                            <TableCell className="text-right text-green-600">{formatCurrency(month.principalPaid, locale)}</TableCell>
                            <TableCell className="text-right font-bold text-blue-600">{formatCurrency(month.totalPaymentAmount, locale)}</TableCell>
                            <TableCell className="text-right text-muted-foreground">{formatCurrency(month.endingBalance, locale)}</TableCell>
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
    );
}