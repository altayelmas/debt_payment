'use client';

import { useState } from 'react';
import api from '@/lib/api';
import { Debt } from '@/types';
import toast from 'react-hot-toast';
import { useTranslations, useLocale } from 'next-intl';

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger
} from "@/components/ui/tooltip";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Loader2, Pencil, Trash2 } from "lucide-react";
import { formatCurrency } from '@/lib/utils';

interface DebtListItemProps {
    debt: Debt;
    onEditClick: (debt: Debt) => void;
    onDeleteComplete: () => void;
}

export default function DebtListItem({ debt, onEditClick, onDeleteComplete }: DebtListItemProps) {
    const t = useTranslations('DashboardPage.DebtListItem');
    const locale = useLocale();

    const [isDeleting, setIsDeleting] = useState(false);

    const handleDelete = async () => {
        setIsDeleting(true);
        try {
            await api.delete(`/api/Debt/${debt.debtId}`);
            toast.success('Debt deleted.');
            onDeleteComplete();
        } catch (error) {
            toast.error('Could not delete debt.');
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <TooltipProvider>
            <Card className="shadow-sm">
                <div className="p-3">
                    <div className="flex justify-between items-start gap-4">
                        <h3 className="text-lg font-semibold leading-tight" title={debt.name}>
                            {debt.name}
                        </h3>
                        <div className="flex-shrink-0 -mt-2 -mr-1">
                            {/* Edit Butonu */}
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="text-muted-foreground hover:text-blue-600"
                                        onClick={() => onEditClick(debt)}
                                    >
                                        <Pencil className="h-5 w-5" />
                                        <span className="sr-only">{t('editLabel')}</span>
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>{t('editTooltip')}</p>
                                </TooltipContent>
                            </Tooltip>

                            <AlertDialog>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <AlertDialogTrigger asChild>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="text-muted-foreground hover:text-destructive"
                                                disabled={isDeleting}
                                            >
                                                {isDeleting ? (
                                                    <Loader2 className="h-5 w-5 animate-spin" />
                                                ) : (
                                                    <Trash2 className="h-5 w-5" />
                                                )}
                                                <span className="sr-only">{t('deleteLabel')}</span>
                                            </Button>
                                        </AlertDialogTrigger>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>{t('deleteTooltip')}</p>
                                    </TooltipContent>
                                </Tooltip>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>{t('dialogTitle')}</AlertDialogTitle>
                                        <AlertDialogDescription>
                                            {t('dialogDescription', {debtName: debt.name})}
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                        <AlertDialogAction
                                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                            onClick={handleDelete}
                                        >
                                            {t('dialogConfirm')}
                                        </AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        </div>
                    </div>
                    {/* Borç Detayları */}
                    <div className="flex flex-wrap gap-x-4 gap-y-1 pt-1.5">
                        <div>
                            <span className="text-xs text-muted-foreground block uppercase">{t('details.balance')}</span>
                            <span className="text-sm font-medium">{formatCurrency(debt.currentBalance, locale)}</span>
                        </div>
                        <div>
                            <span className="text-xs text-muted-foreground block uppercase">{t('details.minPayment')}</span>
                            <span className="text-sm font-medium">{formatCurrency(debt.minPayment, locale)}</span>
                        </div>
                        <div>
                            <span className="text-xs text-muted-foreground block uppercase mb-1">{t('details.interest')}</span>
                            <Badge variant="secondary">%{debt.interestRate}</Badge>
                        </div>
                    </div>
                </div>
            </Card>
        </TooltipProvider>
    );
}