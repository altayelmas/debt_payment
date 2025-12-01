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
            <Card className="shadow-sm bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
                <div className="px-3 py-2">
                    <div className="flex justify-between items-start gap-4">
                        <div className="flex-grow flex items-baseline gap-x-4 gap-y-1 flex-wrap min-w-0">
                            <h3 className="text-base font-semibold leading-tight truncate text-gray-900 dark:text-gray-50" title={debt.name}>
                                {debt.name}
                            </h3>
                            <div className="flex items-baseline gap-x-3 gap-y-1 flex-wrap">
                                <div>
                                    <span className="text-xs text-muted-foreground dark:text-gray-400 uppercase">
                                        {t('details.balance')}:
                                    </span>
                                    <span className="text-sm font-medium ml-1 text-gray-900 dark:text-gray-200">
                                        {formatCurrency(debt.currentBalance, locale)}
                                    </span>
                                </div>
                                <div>
                                    <span className="text-xs text-muted-foreground dark:text-gray-400 uppercase">
                                        {t('details.minPayment')}:
                                    </span>
                                    <span className="text-sm font-medium ml-1 text-gray-900 dark:text-gray-200">
                                        {formatCurrency(debt.minPayment, locale)}
                                    </span>
                                </div>
                                <div>
                                    <span className="text-xs text-muted-foreground dark:text-gray-400 uppercase">
                                        {t('details.interest')}:
                                    </span>
                                    <Badge variant="secondary" className="ml-1 text-xs bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 hover:bg-gray-200 dark:hover:bg-gray-700">
                                        %{debt.interestRate}
                                    </Badge>
                                </div>
                            </div>
                        </div>
                        <div className="flex-shrink-0">
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="text-muted-foreground hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 dark:hover:bg-gray-800 h-8 w-8"
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
                                                className="text-muted-foreground hover:text-destructive dark:text-gray-400 dark:hover:text-red-400 dark:hover:bg-gray-800 h-8 w-8"
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

                                <AlertDialogContent className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
                                    <AlertDialogHeader>
                                        <AlertDialogTitle className="text-gray-900 dark:text-gray-50">
                                            {t('dialogTitle')}
                                        </AlertDialogTitle>
                                        <AlertDialogDescription className="text-gray-500 dark:text-gray-400">
                                            {t('dialogDescription', {debtName: debt.name})}
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel className="dark:bg-gray-800 dark:text-gray-100 dark:hover:bg-gray-700 dark:border-gray-700">
                                            Cancel
                                        </AlertDialogCancel>
                                        <AlertDialogAction
                                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90 dark:bg-red-900 dark:text-red-100 dark:hover:bg-red-800"
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