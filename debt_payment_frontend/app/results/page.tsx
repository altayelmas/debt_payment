'use client'; // localStorage okuyacak, 'useEffect' kullanacak

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import ProtectedRoute from '@/components/ProtectedRoute'; // 1. Koruma kalkanı
import { CalculationResult, StrategyResult } from '@/types'; // Tiplerimiz
import Link from 'next/link';
import Navbar from '@/components/Navbar';

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
                <div className="flex items-center justify-center min-h-screen">
                    Loading results...
                </div>
            </ProtectedRoute>
        );
    }

    return (
        <ProtectedRoute>
            <div className="min-h-screen bg-gray-50">
                <Navbar />

                <main className="container mx-auto p-4 md:p-8 max-w-5xl">
                    <header className="text-center mb-8">
                        <h1 className="text-4xl text-gray-900 font-bold mb-2">Calculation results</h1>
                        <p className="text-lg text-gray-600">Strategy Comparison</p>

                        <div className="text-xl text-gray-800 font-semibold bg-gray-200 p-3 rounded-lg inline-block">
                            Monthly Extra Payment: {formatCurrency(data.extraPayment)}<br/>
                            Initial Debt: {formatCurrency(data.resultData.beginningDebt)}
                        </div>
                    </header>

                    <div className="bg-blue-100 border-l-4 border-blue-500 text-blue-800 p-6 rounded-lg shadow-md mb-8">
                        <h3 className="text-xl text-gray-400 font-semibold mb-2">Recommendation</h3>
                        <p className="text-lg">{data.resultData.recommendation}</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

                        <ResultCard result={data.resultData.snowballResult} isSnowball={true} />

                        <ResultCard result={data.resultData.avalancheResult} isSnowball={false} />

                    </div>

                    <div className="text-center mt-12">
                        <Link href="/dashboard" className="text-blue-600 hover:underline text-lg">
                            ← Perform new calculation
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
        <div className={`bg-white p-6 rounded-lg shadow-lg border-t-4 ${borderColor}`}>
            <h2 className={`text-2xl font-bold mb-4 ${textColor}`}>{result.strategyName}</h2>
            <ul className="space-y-3 text-gray-700">
                <li><strong>End date: {result.payOffDate}</strong></li>
                <li><strong>Total Interest Paid:</strong>
                    <span className="font-semibold text-lg ml-1">{formatCurrency(result.totalInterestPaid)}</span>
                </li>
                <li><strong>Total Paid:</strong>
                    <span className="font-semibold text-lg ml-1">{formatCurrency(result.totalPaid)}</span>
                </li>
            </ul>
            <p className="text-sm mt-4 text-gray-600">{description}</p>
        </div>
    );
}
