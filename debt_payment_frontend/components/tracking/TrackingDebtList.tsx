import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2, Wallet } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { useLocale } from "next-intl";
import { ActiveDebtStatusDto } from "@/types";

export default function TrackingDebtList({ debtStatuses }: { debtStatuses: ActiveDebtStatusDto[] }) {
    const locale = useLocale();

    return (
        <Card className="border-none shadow-sm bg-transparent">
            <CardHeader className="pl-2 pt-0 mb-6">
                <CardTitle className="text-xl font-semibold text-gray-900 dark:text-gray-50">Borç Portföyü</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 px-0">
                {debtStatuses.map((debt) => {
                    const percentPaid = debt.startingBalance > 0
                        ? Math.round(((debt.startingBalance - debt.currentBalance) / debt.startingBalance) * 100)
                        : 100;
                    const isPaidOff = debt.currentBalance <= 0;

                    return (
                        <div
                            key={debt.debtId}
                            className="group flex flex-col gap-3 p-4 bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-xl hover:border-blue-300 dark:hover:border-blue-700 transition-colors shadow-sm"
                        >
                            <div className="flex justify-between items-center">
                                <div className="flex items-center gap-3">
                                    <div className={`h-10 w-10 rounded-full flex items-center justify-center 
                                        ${isPaidOff
                                        ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400'
                                        : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                                    }`}
                                    >
                                        {isPaidOff ? <CheckCircle2 className="h-5 w-5" /> : <Wallet className="h-5 w-5" />}
                                    </div>
                                    <div>
                                        <h4 className="font-medium text-gray-900 dark:text-gray-100">{debt.debtName}</h4>
                                        <span className="text-xs text-muted-foreground block">
                                            Toplam: {formatCurrency(debt.startingBalance, locale)}
                                        </span>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <span className={`text-lg font-bold 
                                        ${isPaidOff
                                        ? 'text-green-600 dark:text-green-400'
                                        : 'text-gray-900 dark:text-gray-50'
                                    }`}
                                    >
                                        {formatCurrency(debt.currentBalance, locale)}
                                    </span>
                                    <span className="text-xs text-muted-foreground block">Kalan</span>
                                </div>
                            </div>

                            <div className="relative w-full">
                                <Progress
                                    value={percentPaid}
                                    className="h-2 bg-gray-100 dark:bg-gray-700"
                                    indicatorClassName={isPaidOff ? "bg-green-500" : "bg-indigo-600 dark:bg-indigo-500"}
                                />
                            </div>
                        </div>
                    );
                })}
            </CardContent>
        </Card>
    );
}