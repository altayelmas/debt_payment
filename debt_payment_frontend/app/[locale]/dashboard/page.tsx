'use client';

import {useEffect, useState} from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import Navbar from '@/components/Navbar';
import api from '@/lib/api';
import {Debt, PagedResult} from '@/types';
import toast from 'react-hot-toast';
import {useRouter} from '@/i18n/navigation';
import {useAuth} from "@/context/AuthContext";
import {useTranslations} from 'next-intl';

import CalculationHistoryCard from "@/components/dashboard/CalculationHistoryCard";
import OverviewCard from "@/components/dashboard/OverviewCard";
import DebtsCard from "@/components/dashboard/DebtsCard";


const PAGE_SIZE = 5;

export default function DashboardPage() {
    const t = useTranslations('DashboardPage.page');

    const [pagedData, setPagedData] = useState<PagedResult<Debt> | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [loadingDebts, setLoadingDebts] = useState(true);


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
            toast.error(t('toasts.loadError'));
        } finally {
            setLoadingDebts(false);
        }
    };

    return (
        <ProtectedRoute>
            <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-950">
                <Navbar/>
                <main className="container mx-auto p-4 flex-grow flex flex-col max-w-6xl">

                    <div className="mb-4">
                        <OverviewCard pagedData={pagedData} loadingDebts={loadingDebts}/>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 h-full items-start">
                        <DebtsCard
                            isAuthenticated={isAuthenticated}
                            onDebtsChange={(data) => {
                                setPagedData(data);
                                setLoadingDebts(false);
                            }}
                        />
                        <CalculationHistoryCard isCalculationDisabled={!pagedData || pagedData.totalCount === 0}/>
                    </div>
                </main>
            </div>
        </ProtectedRoute>
    );
}