'use client';

import { useState } from 'react';
import { useRouter } from '@/i18n/navigation';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { useForm } from 'react-hook-form';
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from 'next-intl';

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

const MAX_CURRENCY_VALUE = 999999999999.99;

interface CalculationFormCardProps {
    isCalculationDisabled: boolean;
    onCalculationComplete: () => void;
}

export default function CalculationFormCard({
                                                isCalculationDisabled,
                                                onCalculationComplete
                                            }: CalculationFormCardProps) {
    const t = useTranslations('DashboardPage.CalculationForm');
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
            const errorMessage = error.response?.data?.message || error.response?.data || t('toasts.defaultError');
            toast.error(errorMessage);
        } finally {
            setCalculating(false);
        }
    };

    return (
        <Card className="lg:col-span-3">
            <Form {...calcForm}>
                <form onSubmit={calcForm.handleSubmit(onCalculateSubmit)}>
                    <CardHeader>
                        <CardTitle className="text-2xl">{t('title')}</CardTitle>
                        <CardDescription>{t('description')}</CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-col sm:flex-row sm:items-end gap-4">
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