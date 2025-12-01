'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency } from "@/lib/utils";
import { PagedResult, Debt } from "@/types";
import {useLocale, useTranslations} from 'next-intl';

interface OverviewCardProps {
    pagedData: PagedResult<Debt> | null;
    loadingDebts: boolean;
}

export default function OverviewCard({ pagedData, loadingDebts }: OverviewCardProps) {
    const t = useTranslations('DashboardPage.OverviewCard');
    const locale = useLocale();

    return (
        <Card className="lg:col-span-2 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
            <CardHeader>
                <CardTitle className="text-xl text-gray-900 dark:text-gray-50">
                    {t('title')}
                </CardTitle>
                <CardDescription className="text-muted-foreground dark:text-gray-400">
                    {t('description')}
                </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-6 sm:grid-cols-3">
                <div className="p-4 rounded-lg border border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                    <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider block">
                        {t('totalBalance')}
                    </span>
                    {loadingDebts ? (
                        <Skeleton className="h-7 w-[150px] mt-1 bg-gray-200 dark:bg-gray-700"/>
                    ) : (
                        <span className="text-2xl font-bold text-gray-900 dark:text-white mt-1 block">
                            {formatCurrency(pagedData?.totalBalance || 0, locale)}
                        </span>
                    )}
                </div>

                <div className="p-4 rounded-lg border border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                    <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider block">
                        {t('totalMinPayment')}
                    </span>
                    {loadingDebts ? (
                        <Skeleton className="h-7 w-[150px] mt-1 bg-gray-200 dark:bg-gray-700"/>
                    ) : (
                        <span className="text-2xl font-bold text-gray-900 dark:text-white mt-1 block">
                            {formatCurrency(pagedData?.totalMonthlyMinPayment || 0, locale)}
                        </span>
                    )}
                </div>

                <div className="p-4 rounded-lg border border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                    <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider block">
                        {t('totalDebtCount')}
                    </span>
                    {loadingDebts ? (
                        <Skeleton className="h-7 w-[50px] mt-1 bg-gray-200 dark:bg-gray-700"/>
                    ) : (
                        <span className="text-2xl font-bold text-gray-900 dark:text-white mt-1 block">
                            {pagedData?.totalCount || 0}
                        </span>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}