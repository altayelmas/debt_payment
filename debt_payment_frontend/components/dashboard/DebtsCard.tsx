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
        <Card className="lg:col-span-1 flex flex-col">
            <CardHeader>
                <div className={"flex justify-between items-center gap-4"}>
                    <CardTitle className="text-2xl">{t('title')}</CardTitle>

                    <Button onClick={() => {
                        setEditingDebt(null);
                        setIsModalOpen(true);
                    }}>
                        {t('addButton')}
                    </Button>
                </div>
            </CardHeader>
            <CardContent className="flex-grow">
                <div className="h-[320px] overflow-y-auto pr-2 space-y-3">
                    {loadingDebts ? (
                        <div className="space-y-3">
                            <Skeleton className="h-[70px] w-full rounded-md" />
                            <Skeleton className="h-[70px] w-full rounded-md" />
                            <Skeleton className="h-[70px] w-full rounded-md" />
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
                                    <div
                                        className="flex flex-col items-center justify-center gap-3 text-center py-16">
                                        <Inbox className="h-16 w-16 text-muted-foreground" />
                                        <h3 className="text-xl font-semibold text-foreground">
                                            {t('emptyTitle')}
                                        </h3>
                                        <p className="text-muted-foreground">
                                            {t('emptyDescription')}
                                        </p>
                                    </div>
                                )}
                        </>
                    )}
                </div>
            </CardContent>
            {/* Pagination */}
            <CardFooter className="min-h-[70px] pt-4 border-t">
                {!loadingDebts && pagedData && pagedData.totalPages > 1 && (
                    <Pagination>
                        <PaginationContent>
                            <PaginationItem>
                                <PaginationPrevious
                                    href="#"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        handlePageChange(currentPage - 1);
                                    }}
                                    aria-disabled={currentPage === 1}
                                    className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
                                />
                            </PaginationItem>
                            <PaginationItem>
                                <span className="px-4 py-2 text-sm font-medium">
                                    {t('pagination', {currentPage: pagedData.currentPage, totalPages: pagedData.totalPages})}
                                </span>
                            </PaginationItem>
                            <PaginationItem>
                                <PaginationNext
                                    href="#"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        handlePageChange(currentPage + 1);
                                    }}
                                    aria-disabled={currentPage === pagedData.totalPages}
                                    className={currentPage === pagedData.totalPages ? "pointer-events-none opacity-50" : ""}
                                />
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