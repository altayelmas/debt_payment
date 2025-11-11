'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import ProtectedRoute from '@/components/ProtectedRoute';
import { CalculationResult, StrategyResult } from '@/types';
import Link from 'next/link';
import Navbar from '@/components/Navbar';

import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { buttonVariants } from "@/components/ui/button";
import { ArrowLeft, Lightbulb, Loader2 } from "lucide-react";

interface ResultsState {
    resultData: CalculationResult;
    extraPayment: number;
    beginningDebt: number;
}

export default function ResultsPage() {
    const [data, setData] = useState<ResultsState | null>(null);
    const router = useRouter();

    useEffect(() => {
        const storedResult = localStorage.getItem('calculationResult');

        if (storedResult) {
            const parsedData: ResultsState = JSON.parse(storedResult);

            if (parsedData.resultData && parsedData.extraPayment !== undefined) {
                setData(parsedData);
            } else {
                router.replace('/dashboard');
            }
        } else {
            router.replace('/dashboard');
        }
    }, [router]);

    const formatCurrency = (value: number) =>
        (value || 0).toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' });

    if (!data) {
        return (
            <ProtectedRoute>
                <div className="flex items-center justify-center min-h-screen bg-background">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground"/>
                    <p className="text-lg ml-3 text-muted-foreground">Loading results...</p>
                </div>
            </ProtectedRoute>
        );
    }

    return (
        <ProtectedRoute>
            <div className="min-h-screen bg-background">
                <Navbar />

                <main className="container mx-auto p-4 md:p-8 max-w-5xl">
                    <header className="text-center mb-8">
                        <h1 className="text-4xl font-bold">Calculation Results</h1>
                        <p className="text-lg text-muted-foreground mt-2">Strategy Comparison</p>

                        <div className="text-lg mt-4 inline-block rounded-lg border bg-muted p-4 text-muted-foreground">
                            <span className="font-semibold text-foreground">Monthly Extra Payment:</span> {formatCurrency(data.extraPayment)}
                            <br/>
                            <span className="font-semibold text-foreground">Initial Debt:</span> {formatCurrency(data.resultData.beginningDebt)}
                        </div>
                    </header>

                    <Alert className="mb-8 max-w-3xl mx-auto">
                        <Lightbulb className="h-4 w-4" />
                        <AlertTitle className="font-semibold">Recommendation</AlertTitle>
                        <AlertDescription>
                            {data.resultData.recommendation}
                        </AlertDescription>
                    </Alert>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <ResultCard result={data.resultData.snowballResult} isSnowball={true} />
                        <ResultCard result={data.resultData.avalancheResult} isSnowball={false} />
                    </div>

                    <div className="text-center mt-12">
                        <Link
                            href="/dashboard"
                            className={buttonVariants({ variant: "outline" })}
                        >
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Perform new calculation
                        </Link>
                    </div>
                </main>
            </div>
        </ProtectedRoute>
    );
}

function ResultCard({ result, isSnowball }: { result: StrategyResult; isSnowball: boolean }) {
    const formatCurrency = (value: number) =>
        (value || 0).toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' });

    const borderColor = isSnowball ? 'border-green-500' : 'border-red-500';
    const textColor = isSnowball ? 'text-green-600' : 'text-red-600';
    const description = isSnowball
        ? "Motivation-based: It delivers quick wins by eliminating even the smallest debts."
        : "Mathematically the most efficient: Minimizes total interest.";

    return (
        <Card className={`border-t-4 ${borderColor}`}>
            <CardHeader>
                <CardTitle className={`text-2xl font-bold ${textColor}`}>
                    {result.strategyName}
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-lg">
                <div className="flex justify-between items-baseline">
                    <span className="text-base text-muted-foreground">End Date</span>
                    <span className="font-semibold">{result.payOffDate}</span>
                </div>
                <div className="flex justify-between items-baseline">
                    <span className="text-base text-muted-foreground">Total Interest Paid</span>
                    <span className="font-semibold">{formatCurrency(result.totalInterestPaid)}</span>
                </div>
                <div className="flex justify-between items-baseline">
                    <span className="text-base text-muted-foreground">Total Paid</span>
                    <span className="font-semibold">{formatCurrency(result.totalPaid)}</span>
                </div>
            </CardContent>

            <CardFooter>
                <p className="text-sm text-muted-foreground">{description}</p>
            </CardFooter>
        </Card>
    );
}
