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
import {Plus, Trash2, Loader2} from 'lucide-react';

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

    // ... (state ve fonksiyonlar aynı)
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
        <Card className="lg:col-span-1 flex flex-col bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
            <CardHeader>
                <div className="flex justify-between items-center gap-4">
                    <div>
                        <CardTitle className="text-2xl text-gray-900 dark:text-gray-50">{t('title')}</CardTitle>
                        <CardDescription className="text-muted-foreground dark:text-gray-400">
                            {t('description')}
                        </CardDescription>
                    </div>
                    <Button
                        onClick={() => setIsModalOpen(true)}
                        size="sm"
                        className="dark:bg-gray-100 dark:text-gray-900 dark:hover:bg-gray-200"
                    >
                        <Plus className="h-4 w-4 mr-2"/>
                        {t_formButton('buttonShort')}
                    </Button>
                </div>
            </CardHeader>

            <CardContent>
                {loadingHistory ? (
                    <div className="space-y-3">
                        <Skeleton className="h-[60px] w-full rounded-md bg-gray-200 dark:bg-gray-800"/>
                        <Skeleton className="h-[60px] w-full rounded-md bg-gray-200 dark:bg-gray-800"/>
                    </div>
                ) : !history || history.length === 0 ? (
                    <p className="text-muted-foreground">{t('empty')}</p>
                ) : (
                    <div className="space-y-3">
                        {history.map(report => (
                            <div
                                key={report.reportId}
                                className="flex items-center gap-2 border rounded-lg pr-2 transition-colors
                                bg-gray-50 dark:bg-gray-800/40
                                border-gray-100 dark:border-gray-700/50
                                hover:border-blue-300 dark:hover:border-blue-700"
                            >
                                <Link
                                    key={report.reportId}
                                    href={`/results/${report.reportId}`}
                                    className="flex-grow block p-4"
                                >
                                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1">
                                    <span className="font-semibold text-blue-600 dark:text-blue-400">
                                        {new Date(report.createdAt).toLocaleString(locale, {
                                            day: '2-digit',
                                            month: 'long',
                                            year: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        })}
                                    </span>
                                        <span className="text-sm font-semibold text-foreground dark:text-gray-200">
                                        {report.recommendedPayOffDate}
                                    </span>
                                    </div>
                                    <div
                                        className="text-sm text-muted-foreground mt-2 grid grid-cols-2 sm:grid-cols-3 gap-2">
                                        <div>
                                            {t('details.totalDebt')} <strong
                                            className="text-foreground dark:text-gray-300">{formatCurrency(report.totalDebt, locale)}</strong>
                                        </div>
                                        <div>
                                            {t('details.extraPayment')} <strong
                                            className="text-foreground dark:text-gray-300">{formatCurrency(report.extraPayment, locale)}</strong>
                                        </div>
                                        <div>
                                            {t('details.saved')} <strong
                                            className="text-green-600 dark:text-green-400">{formatCurrency(report.recommendedInterestSaved, locale)}</strong>
                                        </div>
                                    </div>
                                </Link>
                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="text-muted-foreground hover:text-destructive dark:hover:text-red-400"
                                            disabled={deletingId === report.reportId}
                                        >
                                            {deletingId === report.reportId ? (
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                            ) : (
                                                <Trash2 className="h-4 w-4" />
                                            )}
                                        </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogHeader>
                                            <AlertDialogTitle>{t('dialogTitle')}</AlertDialogTitle>
                                            <AlertDialogDescription>
                                                {t('dialogDescription', {
                                                    date: new Date(report.createdAt).toLocaleDateString(locale)
                                                })}
                                            </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel>{t('dialogCancel')}</AlertDialogCancel>
                                            <AlertDialogAction
                                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
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