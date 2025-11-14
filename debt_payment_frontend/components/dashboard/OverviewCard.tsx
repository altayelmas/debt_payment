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
        <Card className="lg:col-span-3">
            <CardHeader>
                <CardTitle className="text-xl">
                    {t('title')}
                </CardTitle>
                <CardDescription>
                    {t('description')}
                </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-3">
                <div className="p-4 bg-secondary rounded-lg">
                    <span className="text-sm text-muted-foreground block uppercase">{t('totalBalance')}</span>
                    {loadingDebts ? (
                        <Skeleton className="h-8 w-[150px] mt-1"/>
                    ) : (
                        <span className="text-2xl font-semibold">
                            {formatCurrency(pagedData?.totalBalance || 0, locale)}
                        </span>
                    )}
                </div>

                <div className="p-4 bg-secondary rounded-lg">
                    <span className="text-sm text-muted-foreground block uppercase">{t('totalMinPayment')}</span>
                    {loadingDebts ? (
                        <Skeleton className="h-8 w-[150px] mt-1"/>
                    ) : (
                        <span className="text-2xl font-semibold">
                            {formatCurrency(pagedData?.totalMonthlyMinPayment || 0, locale)}
                        </span>
                    )}
                </div>

                <div className="p-4 bg-secondary rounded-lg">
                    <span
                        className="text-sm text-muted-foreground block uppercase">{t('totalDebtCount')}</span>
                    {loadingDebts ? (
                        <Skeleton className="h-8 w-[50px] mt-1"/>
                    ) : (
                        <span className="text-2xl font-semibold">
                            {pagedData?.totalCount || 0}
                        </span>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}