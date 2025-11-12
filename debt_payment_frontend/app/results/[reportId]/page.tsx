'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import ProtectedRoute from '@/components/ProtectedRoute';
import { CalculationResult, StrategyResult } from '@/types';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import api from '@/lib/api';
import toast from 'react-hot-toast';

import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {Button, buttonVariants} from "@/components/ui/button";
import { ArrowLeft, Lightbulb, Loader2 } from "lucide-react";
import { Badge } from '@/components/ui/badge';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from "@/components/ui/dialog";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table";

const formatCurrency = (value: number) =>
    (value || 0).toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' });

function ResultCard({ result, isSnowball, isRecommended }: {
    result: StrategyResult;
    isSnowball: boolean;
    isRecommended: boolean;
}) {
    const borderColor = isRecommended ? 'border-blue-500' : (isSnowball ? 'border-green-500' : 'border-red-500');
    const titleColor = isRecommended ? 'text-blue-600' : (isSnowball ? 'text-green-600' : 'text-red-600');
    const description = isSnowball
        ? "Motivation-based: It delivers quick wins by eliminating even the smallest debts."
        : "Mathematically the most efficient: Minimizes total interest.";

    return (
        <Card className={`border-t-4 ${borderColor} relative flex flex-col`}>
            {isRecommended && (
                <Badge className="absolute -top-3 right-4">Recommended</Badge>
            )}
            <CardHeader>
                <CardTitle className={`text-2xl font-bold ${titleColor}`}>
                    {result.strategyName}
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-lg flex-grow">
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
                <div className="flex flex-col items-start gap-4 w-full">
                    <p className="text-sm text-muted-foreground">{description}</p>

                    <Dialog>
                        <DialogTrigger asChild>
                            <Button variant="outline" size="sm">
                                View Monthly Plan
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-3xl">
                            <DialogHeader>
                                <DialogTitle>{result.strategyName} - Payment Plan</DialogTitle>
                            </DialogHeader>

                            <div className="max-h-[60vh] overflow-y-auto pr-4">
                                <Table>
                                    <TableHeader className="sticky top-0 bg-background">
                                        <TableRow>
                                            <TableHead className="w-[60px]">Month</TableHead>
                                            <TableHead>Date</TableHead>
                                            <TableHead className="text-right">Interest Paid</TableHead>
                                            <TableHead className="text-right">Principal Paid</TableHead>
                                            <TableHead className="text-right">Ending Balance</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {result.paymentSchedule.map((month) => (
                                            <TableRow key={month.month}>
                                                <TableCell className="font-medium">{month.month}</TableCell>
                                                <TableCell>{month.monthYear}</TableCell>
                                                <TableCell className="text-right text-red-600">
                                                    {formatCurrency(month.interestPaid)}
                                                </TableCell>
                                                <TableCell className="text-right text-green-600">
                                                    {formatCurrency(month.principalPaid)}
                                                </TableCell>
                                                <TableCell className="text-right font-medium">
                                                    {formatCurrency(month.endingBalance)}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        </DialogContent>
                    </Dialog>
                </div>
            </CardFooter>
        </Card>
    );
}

export default function ResultsPage({ params }: { params: { reportId: string } }) {
    const [report, setReport] = useState<CalculationResult | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();
    const { reportId } = params;

    useEffect(() => {

        if (!reportId) {
            setLoading(false);
            return;
        }

        const fetchReport = async () => {
            try {
                const response = await api.get<CalculationResult>(`/api/Calculation/${reportId}`);
                setReport(response.data);
            } catch (error) {
                toast.error('Could not load calculation results.');
                router.replace('/dashboard');
            } finally {
                setLoading(false);
            }
        };

        fetchReport();

    }, [reportId, router]);

    if (loading) {
        return (
            <ProtectedRoute>
                <div className="flex items-center justify-center min-h-screen bg-background">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground"/>
                    <p className="text-lg ml-3 text-muted-foreground">Loading results...</p>
                </div>
            </ProtectedRoute>
        );
    }

    if (!report) {
        return (
            <ProtectedRoute>
                <div className="flex flex-col items-center justify-center min-h-screen bg-background">
                    <h2 className="text-2xl font-semibold text-destructive">Report Not Found</h2>
                    <p className="text-muted-foreground mt-2">The report you are looking for does not exist or has been deleted.</p>
                    <Link
                        href="/dashboard"
                        className={buttonVariants({ variant: "outline", className: "mt-4" })}
                    >
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Dashboard
                    </Link>
                </div>
            </ProtectedRoute>
        );
    }

    const recommendedStrategy = report.recommendation.includes("Avalanche") ? "Avalanche" : "Snowball";
    const interestSaved = Math.abs(report.snowballResult.totalInterestPaid - report.avalancheResult.totalInterestPaid);
    const monthsSaved = Math.abs(report.snowballResult.totalMonths - report.avalancheResult.totalMonths);

    return (
        <ProtectedRoute>
            <div className="min-h-screen bg-background">
                <Navbar />

                <main className="container mx-auto p-4 md:p-8 max-w-5xl">
                    <header className="text-center mb-8">
                        <h1 className="text-4xl font-bold">Calculation Results</h1>
                        <p className="text-lg text-muted-foreground mt-2">Strategy Comparison</p>

                        <div className="text-lg mt-4 inline-block rounded-lg border bg-muted p-4 text-muted-foreground">
                            <span className="font-semibold text-foreground">Monthly Extra Payment:</span> {formatCurrency(report.extraPayment)}
                            <br/>
                            <span className="font-semibold text-foreground">Initial Debt:</span> {formatCurrency(report.beginningDebt)}
                        </div>
                    </header>

                    <Alert className="mb-8 max-w-3xl mx-auto">
                        <Lightbulb className="h-4 w-4" />
                        <AlertTitle className="font-semibold">Recommendation</AlertTitle>
                        <AlertDescription>
                            We recommend the <strong>{recommendedStrategy}</strong> method.
                            {interestSaved > 0 && monthsSaved > 0 && (
                                <>
                                    {' '}By choosing this, you&#39;ll save <strong>{formatCurrency(interestSaved)}</strong> in interest and pay off your debt <strong>{monthsSaved} months</strong> sooner.
                                </>
                            )}
                        </AlertDescription>
                    </Alert>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <ResultCard
                            result={report.snowballResult}
                            isSnowball={true}
                            isRecommended={recommendedStrategy === "Snowball"}
                        />
                        <ResultCard
                            result={report.avalancheResult}
                            isSnowball={false}
                            isRecommended={recommendedStrategy === "Avalanche"}
                        />
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