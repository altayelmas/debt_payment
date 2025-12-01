'use client';

import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency } from "@/lib/utils";
import { PagedResult, Debt } from "@/types";
import { useLocale, useTranslations } from 'next-intl';
import { Wallet, CreditCard, Hash } from "lucide-react";

interface OverviewCardProps {
    pagedData: PagedResult<Debt> | null;
    loadingDebts: boolean;
}

export default function OverviewCard({ pagedData, loadingDebts }: OverviewCardProps) {
    const t = useTranslations('DashboardPage.OverviewCard');
    const locale = useLocale();

    const totalBalance = pagedData?.totalBalance || 0;
    const totalMinPayment = pagedData?.totalMonthlyMinPayment || 0;
    const totalCount = pagedData?.totalCount || 0;

    const StatCard = ({ title, value, icon: Icon }: any) => (
        <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 shadow-sm">
            <CardContent className="p-4 flex flex-row items-center justify-between space-y-0">
                <div className="space-y-1">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        {title}
                    </p>
                    {loadingDebts ? (
                        <Skeleton className="h-6 w-20 bg-gray-200 dark:bg-gray-800" />
                    ) : (
                        <div className="text-2xl font-bold text-gray-900 dark:text-gray-50">
                            {value}
                        </div>
                    )}
                </div>
                <div className="h-10 w-10 bg-gray-50 dark:bg-gray-800 rounded-full flex items-center justify-center text-blue-600 dark:text-blue-400">
                    <Icon className="h-5 w-5" />
                </div>
            </CardContent>
        </Card>
    );

    return (
        <div className="grid gap-4 md:grid-cols-3 lg:col-span-2">
            <StatCard
                title={t('totalBalance')}
                value={formatCurrency(totalBalance, locale)}
                icon={Wallet}
            />
            <StatCard
                title={t('totalMinPayment')}
                value={formatCurrency(totalMinPayment, locale)}
                icon={CreditCard}
            />
            <StatCard
                title={t('totalDebtCount')}
                value={totalCount}
                icon={Hash}
            />
        </div>
    );
}