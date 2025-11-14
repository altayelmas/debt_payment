'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import ProtectedRoute from '@/components/ProtectedRoute';
import { CalculationResult } from '@/types';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import api from '@/lib/api';
import toast from 'react-hot-toast';

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { buttonVariants } from "@/components/ui/button";
import { ArrowLeft, Lightbulb, Loader2 } from "lucide-react";

import {formatCurrency} from "@/lib/utils";
import ResultCard from "@/app/results/ResultCard";

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