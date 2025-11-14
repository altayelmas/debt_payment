'use client';

import {useEffect, useState} from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import Navbar from '@/components/Navbar';
import api from '@/lib/api';
import {Debt, PagedResult} from '@/types';
import toast from 'react-hot-toast';
import {useRouter} from 'next/navigation';
import {useAuth} from "@/context/AuthContext";

import CalculationHistoryCard from "@/app/dashboard/CalculationHistoryCard";
import CalculationFormCard from "@/app/dashboard/CalculationFormCard";
import OverviewCard from "@/app/dashboard/OverviewCard";
import DebtsCard from "@/app/dashboard/DebtsCard";


const PAGE_SIZE = 5;

export default function DashboardPage() {
    const [pagedData, setPagedData] = useState<PagedResult<Debt> | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [loadingDebts, setLoadingDebts] = useState(true);

    const [historyKey, setHistoryKey] = useState(0);

    const router = useRouter();
    const {isAuthenticated} = useAuth();

    useEffect(() => {
        if (isAuthenticated) {
            fetchDebts(currentPage);
        }
    }, [isAuthenticated, currentPage]);


    const fetchDebts = async (pageNumber: number) => {
        setLoadingDebts(true);
        try {
            const response = await api.get<PagedResult<Debt>>('/api/Debt', {
                params: {pageNumber: pageNumber, pageSize: PAGE_SIZE}
            });
            setPagedData(response.data);
        } catch (error) {
            toast.error('Debts could not be loaded.');
        } finally {
            setLoadingDebts(false);
        }
    };

    return (
        <ProtectedRoute>
            <div className="min-h-screen bg-gray-50">
                <Navbar/>
                <main className="container mx-auto p-4 md:p-8">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                        <OverviewCard pagedData={pagedData} loadingDebts={loadingDebts}/>
                        <DebtsCard
                            isAuthenticated={isAuthenticated}
                            onDebtsChange={(data) => {
                                setPagedData(data);
                                setLoadingDebts(false);
                            }}
                        />
                        <CalculationFormCard
                            isCalculationDisabled={!pagedData || pagedData.totalCount === 0}
                            onCalculationComplete={() => setHistoryKey(prevKey => prevKey + 1)}
                        />
                        <CalculationHistoryCard key={historyKey}/>
                    </div>
                </main>
            </div>
        </ProtectedRoute>
    )
}