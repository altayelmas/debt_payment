'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency } from "@/lib/utils";
import { PagedResult, Debt } from "@/types";

interface OverviewCardProps {
    pagedData: PagedResult<Debt> | null;
    loadingDebts: boolean;
}

export default function OverviewCard({ pagedData, loadingDebts }: OverviewCardProps) {
    return (
        <Card className="lg:col-span-3">
            <CardHeader>
                <CardTitle className="text-xl">
                    Overview
                </CardTitle>
                <CardDescription>
                    A financial summary of all your debts.
                </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-3">
                <div className="p-4 bg-secondary rounded-lg">
                    <span className="text-sm text-muted-foreground block uppercase">Total Balance</span>
                    {loadingDebts ? (
                        <Skeleton className="h-8 w-[150px] mt-1"/>
                    ) : (
                        <span className="text-2xl font-semibold">
                            {formatCurrency(pagedData?.totalBalance || 0)}
                        </span>
                    )}
                </div>

                <div className="p-4 bg-secondary rounded-lg">
                    <span className="text-sm text-muted-foreground block uppercase">Total Min. Monthly Payment</span>
                    {loadingDebts ? (
                        <Skeleton className="h-8 w-[150px] mt-1"/>
                    ) : (
                        <span className="text-2xl font-semibold">
                            {formatCurrency(pagedData?.totalMonthlyMinPayment || 0)}
                        </span>
                    )}
                </div>

                <div className="p-4 bg-secondary rounded-lg">
                    <span
                        className="text-sm text-muted-foreground block uppercase">Total Debt Amount</span>
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