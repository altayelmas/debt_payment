'use client';

import {useState} from 'react';
import api from '@/lib/api';
import {Debt} from '@/types';
import toast from 'react-hot-toast';
import {useTranslations, useLocale} from 'next-intl';

import {Button} from "@/components/ui/button";
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
import {Loader2, Pencil, Trash2, Wallet} from "lucide-react";
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
            <div className="group relative flex flex-col sm:flex-row justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700/50 hover:border-blue-300 dark:hover:border-blue-700 transition-all shadow-sm">

                <div className="flex justify-between items-start gap-3 w-full">
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                        <div className="hidden sm:flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                            <Wallet className="h-4 w-4" />
                        </div>

                        <div className="flex flex-col gap-0.5 min-w-0">
                            <h3 className="text-sm sm:text-base font-semibold leading-none truncate text-gray-900 dark:text-gray-50" title={debt.name}>
                                {debt.name}
                            </h3>

                            <div className="flex items-center gap-x-3 gap-y-1 flex-wrap text-xs sm:text-sm mt-1">
                                <div className="flex items-center gap-1">
                                    <span className="text-muted-foreground dark:text-gray-400 uppercase tracking-tight text-[10px] sm:text-xs">
                                        {t('details.balance')}:
                                    </span>
                                    <span className="font-semibold text-gray-900 dark:text-gray-100">
                                        {formatCurrency(debt.currentBalance, locale)}
                                    </span>
                                </div>

                                <div className="hidden sm:block w-px h-3 bg-gray-300 dark:bg-gray-700"></div>

                                <div className="flex items-center gap-1">
                                    <span className="text-muted-foreground dark:text-gray-400 uppercase tracking-tight text-[10px] sm:text-xs">
                                        {t('details.minPayment')}:
                                    </span>
                                    <span className="font-medium text-gray-900 dark:text-gray-200">
                                        {formatCurrency(debt.minPayment, locale)}
                                    </span>
                                </div>

                                <div className="hidden sm:block w-px h-3 bg-gray-300 dark:bg-gray-700"></div>

                                <div className="flex items-center gap-1">
                                    <span className="text-muted-foreground dark:text-gray-400 uppercase tracking-tight text-[10px] sm:text-xs">
                                        {t('details.interest')}:
                                    </span>
                                    <Badge variant="secondary" className="px-1.5 py-0 text-[10px] sm:text-xs font-mono bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 h-5">
                                        %{debt.interestRate}
                                    </Badge>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex-shrink-0 flex gap-0.5 items-center">
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7 text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 dark:hover:bg-gray-700/50"
                                    onClick={() => onEditClick(debt)}
                                >
                                    <Pencil className="h-3.5 w-3.5"/>
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
                                            className="h-7 w-7 text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400 dark:hover:bg-gray-700/50"
                                            disabled={isDeleting}
                                        >
                                            {isDeleting ? (
                                                <Loader2 className="h-3.5 w-3.5 animate-spin"/>
                                            ) : (
                                                <Trash2 className="h-3.5 w-3.5"/>
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
                                    <AlertDialogDescription className="text-gray-500 dark:text-gray-400 break-all">
                                        {t('dialogDescription', {debtName: debt.name})}
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel className="dark:bg-gray-800 dark:text-gray-100 dark:hover:bg-gray-700 dark:border-gray-700">
                                        {t('dialogCancel') || "Cancel"}
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
        </TooltipProvider>
    );
}