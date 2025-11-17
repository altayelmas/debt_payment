'use client';

import {useState} from 'react';
import api from '@/lib/api';
import {Debt} from '@/types';
import toast from 'react-hot-toast';
import {useTranslations, useLocale} from 'next-intl';

import {Button} from "@/components/ui/button";
import {Card} from "@/components/ui/card";
import {Badge} from "@/components/ui/badge";
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
import {Loader2, Pencil, Trash2} from "lucide-react";
import {formatCurrency} from '@/lib/utils';

interface DebtListItemProps {
    debt: Debt;
    onEditClick: (debt: Debt) => void;
    onDeleteComplete: () => void;
}

export default function DebtListItem({debt, onEditClick, onDeleteComplete}: DebtListItemProps) {
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
                <div className="px-3 py-2">
                    <div className="flex justify-between items-start gap-4">
                        <div className="flex-grow flex items-baseline gap-x-4 gap-y-1 flex-wrap min-w-0">
                            <h3 className="text-base font-semibold leading-tight truncate" title={debt.name}>
                                {debt.name}
                            </h3>
                            <div className="flex items-baseline gap-x-3 gap-y-1 flex-wrap">
                                <div>
                                    <span
                                        className="text-xs text-muted-foreground uppercase">{t('details.balance')}:</span>
                                    <span
                                        className="text-sm font-medium ml-1">{formatCurrency(debt.currentBalance, locale)}</span>
                                </div>
                                <div>
                                    <span
                                        className="text-xs text-muted-foreground uppercase">{t('details.minPayment')}:</span>
                                    <span
                                        className="text-sm font-medium ml-1">{formatCurrency(debt.minPayment, locale)}</span>
                                </div>
                                <div>
                                    <span
                                        className="text-xs text-muted-foreground uppercase">{t('details.interest')}:</span>
                                    <Badge variant="secondary" className="ml-1 text-xs">%{debt.interestRate}</Badge>
                                </div>
                            </div>
                        </div>
                        <div className="flex-shrink-0">
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="text-muted-foreground hover:text-blue-600 h-8 w-8"
                                        onClick={() => onEditClick(debt)}
                                    >
                                        <Pencil className="h-4 w-4"/>
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
                                                className="text-muted-foreground hover:text-destructive h-8 w-8"
                                                disabled={isDeleting}
                                            >
                                                {isDeleting ? (
                                                    <Loader2 className="h-4 w-4 animate-spin"/>
                                                ) : (
                                                    <Trash2 className="h-4 w-4"/>
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
                </div>
            </Card>
        </TooltipProvider>
    );
}