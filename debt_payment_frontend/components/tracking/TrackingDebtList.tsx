import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2, Wallet, TrendingUp } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { useLocale, useTranslations } from "next-intl";
import { ActiveDebtStatusDto } from "@/types";

export default function TrackingDebtList({ debtStatuses }: { debtStatuses: ActiveDebtStatusDto[] }) {
    const locale = useLocale();
    const t = useTranslations('TrackingPage.DebtList');

    return (
        <Card className="border-none shadow-none bg-transparent">
            <CardContent className="space-y-2 px-0 pt-0">
                {debtStatuses.map((debt) => {
                    const isDebtIncreased = debt.currentBalance > debt.startingBalance;

                    const percentPaid = debt.startingBalance > 0
                        ? Math.max(0, Math.round(((debt.startingBalance - debt.currentBalance) / debt.startingBalance) * 100))
                        : 100;

                    const isPaidOff = debt.currentBalance <= 0;

                    return (
                        <div
                            key={debt.debtId}
                            className="group flex items-center gap-4 p-3 bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-lg hover:border-blue-300 dark:hover:border-blue-700 transition-all shadow-sm"
                        >
                            <div className={`h-10 w-10 shrink-0 rounded-full flex items-center justify-center 
                                ${isPaidOff
                                ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400'
                                : (isDebtIncreased
                                    ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'
                                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300')
                            }`}
                            >
                                {isPaidOff ? <CheckCircle2 className="h-5 w-5" /> : (isDebtIncreased ? <TrendingUp className="h-5 w-5"/> : <Wallet className="h-5 w-5" />)}
                            </div>

                            <div className="flex-1 min-w-0 grid gap-1.5">
                                <div className="flex justify-between items-baseline">
                                    <h4 className="font-semibold text-sm text-gray-900 dark:text-gray-100 truncate">
                                        {debt.debtName}
                                    </h4>
                                    <span className={`text-xs ${isDebtIncreased ? 'text-red-500 font-medium' : 'text-muted-foreground'}`}>
                                        {isDebtIncreased
                                            ? t('debtIncreased', { amount: formatCurrency(debt.currentBalance - debt.startingBalance, locale) })
                                            : t('paidPercentage', { percent: percentPaid })
                                        }
                                    </span>
                                </div>

                                <Progress
                                    value={percentPaid}
                                    className="h-1.5 bg-gray-100 dark:bg-gray-700"
                                    indicatorClassName={isPaidOff ? "bg-green-500" : (isDebtIncreased ? "bg-red-500" : "bg-blue-600 dark:bg-blue-500")}
                                />
                            </div>

                            <div className="text-right shrink-0 min-w-[80px]">
                                <span className={`block text-sm font-bold 
                                    ${isPaidOff
                                    ? 'text-green-600 dark:text-green-400'
                                    : 'text-gray-900 dark:text-gray-50'
                                }`}
                                >
                                    {formatCurrency(debt.currentBalance, locale)}
                                </span>
                                <span className="text-[10px] text-muted-foreground uppercase tracking-wider">
                                    {t('starting')} {formatCurrency(debt.startingBalance, locale)}
                                </span>
                            </div>
                        </div>
                    );
                })}
            </CardContent>
        </Card>
    );
}