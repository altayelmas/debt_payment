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
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogDescription
} from "@/components/ui/dialog";
import { Loader2 } from "lucide-react";
import {formatCurrency} from "@/lib/utils";

const MAX_CURRENCY_VALUE = 999999999999.99;

const calcFormSchema = z.object({
    extraPayment: z.coerce.number()
        .min(0, { message: "Cannot be negative" })
        .max(MAX_CURRENCY_VALUE, { message: `Value cannot exceed ${MAX_CURRENCY_VALUE}` })
        .optional()
        .default(0 as number),
});
type CalcFormInputs = z.infer<typeof calcFormSchema>;

interface CalculationFormModalProps {
    isOpen: boolean;
    onOpenChange: (isOpen: boolean) => void;
    isCalculationDisabled: boolean;
    onCalculationComplete: () => void;
}

export default function CalculationFormModal({
                                                 isOpen,
                                                 onOpenChange,
                                                 isCalculationDisabled,
                                                 onCalculationComplete
                                             }: CalculationFormModalProps) {
    const t = useTranslations('DashboardPage.CalculationForm');
    const tZod = useTranslations('DashboardPage.CalculationForm.zod');
    const tErrors = useTranslations('Errors');

    const locale = useLocale();
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
            console.error("Calculation error:", error);
            const errorData = error.response?.data;
            const code = errorData?.errorCode || errorData?.ErrorCode;

            if (code) {
                if (code === 'PAYMENT_INSUFFICIENT' && errorData.deficit) {
                    const deficitRaw = errorData.deficit;
                    const step = 50;
                    const roundedDeficit = Math.ceil(deficitRaw / step) * step;

                    const formattedAmount =  formatCurrency(roundedDeficit, locale);

                    toast.error(
                        <span>
                            {tErrors.rich('PAYMENT_INSUFFICIENT', {
                                amount: formattedAmount,
                                str: (chunks) => <strong className="font-bold">{chunks}</strong>
                            })}
                        </span>
                    );
                }
            } else if (errorData?.message || errorData?.Message) {
                toast.error(errorData.message || errorData.Message);
            }
            else {
                toast.error(tErrors('GENERIC_ERROR'));
            }
        } finally {
            setCalculating(false);
            calcForm.reset({ extraPayment: 0 });
        }
    };

    const handleOpenChange = (open: boolean) => {
        if (!open) {
            calcForm.reset({ extraPayment: 0 });
        }
        onOpenChange(open);
    };

    return (
        <Dialog
            open={isOpen}
            onOpenChange={handleOpenChange}
        >
            <DialogContent className="sm:max-w-[425px] bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
                <Form {...calcForm}>
                    <form onSubmit={calcForm.handleSubmit(onCalculateSubmit)}>
                        <DialogHeader>
                            <DialogTitle className="text-gray-900 dark:text-gray-50">{t('title')}</DialogTitle>
                            <DialogDescription className="text-muted-foreground dark:text-gray-400">{t('description')}</DialogDescription>
                        </DialogHeader>

                        <div className="pt-6 pb-4">
                            <FormField
                                control={calcForm.control}
                                name="extraPayment"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-gray-900 dark:text-gray-200">{t('label')}</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="number"
                                                step="50"
                                                min="0"
                                                max={MAX_CURRENCY_VALUE}
                                                placeholder="0"
                                                className="mt-1 bg-white dark:bg-gray-950 border-gray-200 dark:border-gray-800 dark:text-white dark:placeholder:text-gray-500"
                                                {...field}
                                                value={field.value ?? ''}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <DialogFooter>
                            <Button
                                type="submit"
                                size="lg"
                                disabled={calculating || isCalculationDisabled}
                                className="text-lg font-semibold w-full sm:w-auto"
                            >
                                {calculating && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
                                {calculating ? t('buttonLoading') : t('button')}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}