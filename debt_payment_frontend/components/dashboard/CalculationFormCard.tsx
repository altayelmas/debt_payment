'use client';

import { useState } from 'react';
import { useRouter } from '@/i18n/navigation';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { useForm } from 'react-hook-form';
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {useLocale, useTranslations} from 'next-intl';

import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle
} from "@/components/ui/card";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";
import {formatCurrency} from "@/lib/utils";

const MAX_CURRENCY_VALUE = 999999999999.99;

interface CalculationFormCardProps {
    isCalculationDisabled: boolean;
    onCalculationComplete: () => void;
    totalMinPayment: number;
}

export default function CalculationFormCard({
                                                isCalculationDisabled,
                                                onCalculationComplete,
                                                totalMinPayment
                                            }: CalculationFormCardProps) {
    const t = useTranslations('DashboardPage.CalculationForm');
    const locale = useLocale();
    const tZod = useTranslations('DashboardPage.CalculationForm.zod');

    const calcFormSchema = z.object({
        extraPayment: z.coerce.number()
            .min(0, { message: "Cannot be negative" })
            .max(MAX_CURRENCY_VALUE, { message: `Value cannot exceed ${MAX_CURRENCY_VALUE}` })
            .optional()
            .default(0 as number),
    });

    type CalcFormInputs = z.infer<typeof calcFormSchema>;

    const [calculating, setCalculating] = useState(false);
    const router = useRouter();

    const calcForm = useForm<CalcFormInputs>({
        resolver: zodResolver(calcFormSchema),
        defaultValues: { extraPayment: 0 }
    });

    const onCalculateSubmit = async (data: CalcFormInputs) => {
        setCalculating(true);
        try {
            const extraPaymentValue = data.extraPayment || 0;
            const requestData = { extraMonthlyPayment: extraPaymentValue };

            const response = await api.post<{ reportId: string }>('/api/calculation/calculate', requestData);

            const { reportId } = response.data;

            if (reportId) {
                router.push(`/results/${reportId}`);
                onCalculationComplete();
            } else {
                throw new Error(t('toasts.noReportId'));
            }

        } catch (error: any) {
            console.log("RAW ERROR:", error);

            if (!error.response) {
                console.log("No error.response mevcut → yani hata API’den gelmiyor. Muhtemelen Network Error.");
                toast.error("Network error veya CORS hatası!");
                return;
            }

            console.log("Error response:", error.response.data);

            const errorData = error.response?.data;

            if (errorData?.errorCode === "PAYMENT_INSUFFICIENT") {
                const deficitAmount = errorData.deficit || 0;
                const formattedAmount = formatCurrency(deficitAmount, locale);

                // TODO - Payment Insufficient doesn't show the correct amount.
                toast.error(
                    <span>
                        {tZod.rich('PAYMENT_INSUFFICIENT', {
                            amount: formattedAmount,
                            str: (chunks) => <strong className="font-bold">{chunks}</strong>
                        })}
                    </span>
                );
            } else {
                const errorMessage = errorData?.message || t('toasts.defaultError');
                toast.error(errorMessage);
            }
        } finally {
            setCalculating(false);
        }
    };

    return (
        <Card className="lg:col-span-2">
            <Form {...calcForm}>
                <form onSubmit={calcForm.handleSubmit(onCalculateSubmit)}>
                    <CardHeader>
                        <CardTitle className="text-2xl">{t('title')}</CardTitle>
                        <CardDescription>{t('description')}</CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-col gap-4">
                        <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-md border border-blue-100 dark:border-blue-800 text-sm text-blue-800 dark:text-blue-200">
                            <p>
                                {t('infoTotalMin')} <strong>{formatCurrency(totalMinPayment, locale)}</strong>
                            </p>
                            <p className="text-xs text-blue-600 dark:text-blue-300 mt-1 opacity-80">
                                {t('infoTotalMinDesc')}
                            </p>
                        </div>

                        <div className="flex flex-col sm:flex-row sm:items-end gap-4">
                            <FormField
                                control={calcForm.control}
                                name="extraPayment"
                                render={({ field }) => (
                                    <FormItem className="flex-1 max-w-xs">
                                        <FormLabel>{t('label')}</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="number"
                                                step="50"
                                                min="0"
                                                max={MAX_CURRENCY_VALUE}
                                                placeholder="0"
                                                className="mt-1"
                                                {...field}
                                                value={field.value ?? ''}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <Button
                                type="submit"
                                size="lg"
                                disabled={calculating || isCalculationDisabled}
                                className="text-lg font-semibold"
                            >
                                {calculating && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
                                {calculating ? t('buttonLoading') : t('button')}
                            </Button>
                        </div>
                    </CardContent>
                    {isCalculationDisabled && !isCalculationDisabled && (
                        <CardFooter>
                            <p className="text-sm text-red-500">
                                {t('footerWarning')}
                            </p>
                        </CardFooter>
                    )}
                </form>
            </Form>
        </Card>
    );
}