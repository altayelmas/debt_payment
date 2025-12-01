'use client';

import {useEffect, useState} from 'react';
import {Link} from '@/i18n/navigation';
import api from '@/lib/api';
import {CalculationHistoryDto} from '@/types';
import toast from 'react-hot-toast';
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import {Skeleton} from "@/components/ui/skeleton";
import {formatCurrency} from '@/lib/utils';
import {useAuth} from "@/context/AuthContext";
import {useTranslations, useLocale} from 'next-intl';
import {Button} from '@/components/ui/button';
import CalculationFormModal from '@/components/dashboard/CalculationFormModal';
import {Plus, Trash2, Loader2, History} from 'lucide-react';

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

interface CalculationHistoryCardProps {
    isCalculationDisabled: boolean;
}

export default function CalculationHistoryCard({isCalculationDisabled}: CalculationHistoryCardProps) {
    const t = useTranslations('DashboardPage.CalculationHistory');
    const t_formButton = useTranslations('DashboardPage.CalculationForm');

    const locale = useLocale();

    const [history, setHistory] = useState<CalculationHistoryDto[] | null>(null);
    const [loadingHistory, setLoadingHistory] = useState(true);
    const {isAuthenticated} = useAuth();
    const [isModalOpen, setIsModalOpen] = useState(false);

    const [deletingId, setDeletingId] = useState<string | null>(null);

    useEffect(() => {
        fetchHistory();
    }, []);

    const fetchHistory = async () => {
        setLoadingHistory(true);
        try {
            const response = await api.get<CalculationHistoryDto[]>('/api/calculation/history');
            setHistory(response.data);
        } catch (error) {
            toast.error(t('toasts.loadError'));
        } finally {
            setLoadingHistory(false);
        }
    };

    const handleCalculationComplete = () => {
        setIsModalOpen(false);
        fetchHistory();
    };

    const handleDeleteReport = async (reportId: string) => {
        setDeletingId(reportId);
        try {
            await api.delete(`/api/Calculation/${reportId}`);
            toast.success(t('toasts.deleteSuccess'));

            fetchHistory();
        } catch (error) {
            toast.error(t('toasts.deleteError'));
        } finally {
            setDeletingId(null);
        }
    };

    return (
        <Card className="lg:col-span-1 flex flex-col bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 h-full">
            <CardHeader className="p-4 pb-2">
                <div className="flex justify-between items-center gap-4">
                    <div>
                        <CardTitle className="text-lg font-bold text-gray-900 dark:text-gray-50">{t('title')}</CardTitle>
                        <CardDescription className="text-xs text-muted-foreground dark:text-gray-400 mt-0.5">
                            {t('description')}
                        </CardDescription>
                    </div>
                    <Button
                        onClick={() => setIsModalOpen(true)}
                        size="sm"
                        className="dark:bg-gray-100 dark:text-gray-900 dark:hover:bg-gray-200 h-8 text-xs"
                    >
                        <Plus className="h-3.5 w-3.5 mr-1.5"/>
                        {t_formButton('buttonShort')}
                    </Button>
                </div>
            </CardHeader>

            <CardContent className="p-4 flex-1">
                {loadingHistory ? (
                    <div className="space-y-2">
                        <Skeleton className="h-[60px] w-full rounded-md bg-gray-200 dark:bg-gray-800"/>
                        <Skeleton className="h-[60px] w-full rounded-md bg-gray-200 dark:bg-gray-800"/>
                    </div>
                ) : !history || history.length === 0 ? (
                    <div className="flex flex-col items-center justify-center gap-2 text-center py-10 min-h-[150px]">
                        <div className="h-10 w-10 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-1">
                            <History className="h-5 w-5 text-muted-foreground" />
                        </div>
                        <p className="text-sm text-muted-foreground dark:text-gray-400">{t('empty')}</p>
                    </div>
                ) : (
                    <div className="space-y-2">
                        {history.map(report => (
                            <div
                                key={report.reportId}
                                className="group relative flex items-start gap-2 border rounded-lg hover:border-blue-300 dark:hover:border-blue-700 transition-all
                                bg-gray-50 dark:bg-gray-800/40
                                border-gray-100 dark:border-gray-700/50"
                            >
                                <Link
                                    key={report.reportId}
                                    href={`/results/${report.reportId}`}
                                    className="flex-grow block p-3"
                                >
                                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-baseline gap-1 mb-1.5">
                                        <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                                            {new Date(report.createdAt).toLocaleString(locale, {
                                                day: '2-digit',
                                                month: 'short',
                                                year: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            })}
                                        </span>
                                        <span className="text-xs font-medium text-foreground dark:text-gray-300 bg-white dark:bg-gray-900/50 px-1.5 py-0.5 rounded border border-gray-200 dark:border-gray-700">
                                            {report.recommendedPayOffDate}
                                        </span>
                                    </div>

                                    <div className="text-xs text-muted-foreground flex flex-wrap gap-x-4 gap-y-1">
                                        <div className="flex items-center gap-1">
                                            <span>{t('details.totalDebt')}</span>
                                            <strong className="text-foreground dark:text-gray-200 font-semibold">
                                                {formatCurrency(report.totalDebt, locale)}
                                            </strong>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <span>{t('details.extraPayment')}</span>
                                            <strong className="text-foreground dark:text-gray-200 font-semibold">
                                                {formatCurrency(report.extraPayment, locale)}
                                            </strong>
                                        </div>
                                        {report.recommendedInterestSaved > 0 && (
                                            <div className="flex items-center gap-1">
                                                <span>{t('details.saved')}</span>
                                                <strong className="text-green-600 dark:text-green-400 font-semibold">
                                                    {formatCurrency(report.recommendedInterestSaved, locale)}
                                                </strong>
                                            </div>
                                        )}
                                    </div>
                                </Link>

                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="absolute top-2 right-2 h-7 w-7 text-gray-400 hover:text-destructive dark:hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity" // Sadece hover'da görünür yaparak temizlik sağlar
                                            disabled={deletingId === report.reportId}
                                        >
                                            {deletingId === report.reportId ? (
                                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                            ) : (
                                                <Trash2 className="h-3.5 w-3.5" />
                                            )}
                                        </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
                                        <AlertDialogHeader>
                                            <AlertDialogTitle className="text-gray-900 dark:text-gray-50">{t('dialogTitle')}</AlertDialogTitle>
                                            <AlertDialogDescription className="text-gray-500 dark:text-gray-400">
                                                {t('dialogDescription', {
                                                    date: new Date(report.createdAt).toLocaleDateString(locale)
                                                })}
                                            </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel className="dark:bg-gray-800 dark:text-gray-100 dark:hover:bg-gray-700 dark:border-gray-700">
                                                {t('dialogCancel')}
                                            </AlertDialogCancel>
                                            <AlertDialogAction
                                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90 dark:bg-red-900 dark:text-red-100 dark:hover:bg-red-800"
                                                onClick={() => handleDeleteReport(report.reportId)}
                                            >
                                                {t('dialogConfirm')}
                                            </AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
            <CalculationFormModal
                isOpen={isModalOpen}
                onOpenChange={setIsModalOpen}
                isCalculationDisabled={isCalculationDisabled}
                onCalculationComplete={handleCalculationComplete}
            />
        </Card>
    );
}