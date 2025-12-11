'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { Debt, PagedResult } from '@/types';
import toast from 'react-hot-toast';
import { useTranslations } from 'next-intl';

import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
    CardTitle
} from "@/components/ui/card";
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination";

import { Skeleton } from "@/components/ui/skeleton";
import { Inbox } from "lucide-react";
import DebtFormModal from "@/components/dashboard/DebtFormModal";
import DebtListItem from "@/components/dashboard/DebtListItem";

const PAGE_SIZE = 5;

interface DebtsCardProps {
    onDebtsChange: (data: PagedResult<Debt> | null) => void;
    isAuthenticated: boolean;
}

export default function DebtsCard({ isAuthenticated, onDebtsChange }: DebtsCardProps) {
    const t = useTranslations('DashboardPage.DebtsCard');

    const [pagedData, setPagedData] = useState<PagedResult<Debt> | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [loadingDebts, setLoadingDebts] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingDebt, setEditingDebt] = useState<Debt | null>(null);

    useEffect(() => {
        if (isAuthenticated) {
            fetchDebts(currentPage);
        }
    }, [isAuthenticated, currentPage]);

    const fetchDebts = async (pageNumber: number) => {
        setLoadingDebts(true);
        try {
            const response = await api.get<PagedResult<Debt>>('/api/Debt', {
                params: { pageNumber: pageNumber, pageSize: PAGE_SIZE }
            });
            setPagedData(response.data);
            onDebtsChange(response.data);
        } catch (error) {
            toast.error(t('toasts.loadError'));
            onDebtsChange(null);
        } finally {
            setLoadingDebts(false);
        }
    };

    const handlePageChange = (page: number) => {
        if (page < 1 || (pagedData && page > pagedData.totalPages)) {
            return;
        }
        setCurrentPage(page);
    };

    const handleSaveComplete = (isEdit: boolean) => {
        setIsModalOpen(false);
        setEditingDebt(null);

        if (isEdit) {
            fetchDebts(currentPage);
        } else {
            if (currentPage !== 1) {
                setCurrentPage(1);
            } else {
                fetchDebts(1);
            }
        }
    };

    return (
        <Card className="lg:col-span-1 flex flex-col bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 h-full">
            <CardHeader className="p-4 pb-2">
                <div className={"flex justify-between items-center gap-4"}>
                    <CardTitle className="text-lg font-bold text-gray-900 dark:text-gray-50">{t('title')}</CardTitle>

                    <Button
                        size="sm"
                        onClick={() => {
                            setEditingDebt(null);
                            setIsModalOpen(true);
                        }}
                        className="dark:bg-gray-100 dark:text-gray-900 dark:hover:bg-gray-200 h-8 text-xs"
                    >
                        {t('addButton')}
                    </Button>
                </div>
            </CardHeader>

            <CardContent className="p-4 flex-1">
                <div className="space-y-2">
                    {loadingDebts ? (
                        <div className="space-y-2">
                            <Skeleton className="h-[60px] w-full rounded-md bg-gray-200 dark:bg-gray-800" />
                            <Skeleton className="h-[60px] w-full rounded-md bg-gray-200 dark:bg-gray-800" />
                            <Skeleton className="h-[60px] w-full rounded-md bg-gray-200 dark:bg-gray-800" />
                        </div>
                    ) : (
                        <>
                            {pagedData && pagedData.items.length > 0 ? (
                                pagedData.items.map(debt => (
                                    <DebtListItem
                                        key={debt.debtId}
                                        debt={debt}
                                        onEditClick={(debtToEdit) => {
                                            setEditingDebt(debtToEdit);
                                            setIsModalOpen(true);
                                        }}
                                        onDeleteComplete={() => {
                                            if (pagedData && pagedData.items.length === 1 && currentPage > 1) {
                                                setCurrentPage(currentPage - 1);
                                            } else {
                                                fetchDebts(currentPage);
                                            }
                                        }}
                                    />
                                ))
                            ) : (
                                <div className="flex flex-col items-center justify-center gap-2 text-center py-10 min-h-[200px]">
                                    <div className="h-12 w-12 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-1">
                                        <Inbox className="h-6 w-6 text-muted-foreground" />
                                    </div>
                                    <h3 className="text-base font-semibold text-foreground dark:text-gray-200">
                                        {t('emptyTitle')}
                                    </h3>
                                    <p className="text-sm text-muted-foreground dark:text-gray-400 max-w-[250px]">
                                        {t('emptyDescription')}
                                    </p>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </CardContent>

            <CardFooter className="p-2 border-t border-gray-100 dark:border-gray-800 mt-auto">
                {!loadingDebts && pagedData && pagedData.totalPages > 1 && (
                    <Pagination className="justify-center">
                        <PaginationContent>
                            <PaginationItem>
                                <PaginationPrevious
                                    href="#"
                                    size="sm"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        handlePageChange(currentPage - 1);
                                    }}
                                    aria-disabled={currentPage === 1}
                                    className={`h-8 text-xs ${currentPage === 1 ? "pointer-events-none opacity-50" : "dark:text-gray-300 dark:hover:bg-gray-800"}`}
                                >
                                    {t('previous')}
                                </PaginationPrevious>
                            </PaginationItem>
                            <PaginationItem>
                                <span className="px-4 py-2 text-xs font-medium dark:text-gray-300">
                                    {t('pagination', {currentPage: pagedData.currentPage, totalPages: pagedData.totalPages})}
                                </span>
                            </PaginationItem>
                            <PaginationItem>
                                <PaginationNext
                                    href="#"
                                    size="sm"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        handlePageChange(currentPage + 1);
                                    }}
                                    aria-disabled={currentPage === pagedData.totalPages}
                                    className={`h-8 text-xs ${currentPage === pagedData.totalPages ? "pointer-events-none opacity-50" : "dark:text-gray-300 dark:hover:bg-gray-800"}`}
                                >
                                    {t('next')}
                                </PaginationNext>
                            </PaginationItem>
                        </PaginationContent>
                    </Pagination>
                )}
            </CardFooter>
            <DebtFormModal
                isOpen={isModalOpen}
                onOpenChange={setIsModalOpen}
                editingDebt={editingDebt}
                onSaveComplete={handleSaveComplete}
            />
        </Card>
    );
}