'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Loader2 } from "lucide-react";
import { formatCurrency } from '@/lib/utils';
import { useLocale, useTranslations } from 'next-intl';
import { NumericFormat } from 'react-number-format';

interface MakePaymentModalProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    targetAmount: number;
    monthYear: string;
    strategyName: string;
    onSuccess: () => void;
    reportId: string;
}

export default function MakePaymentModal({
                                             isOpen,
                                             onOpenChange,
                                             targetAmount,
                                             monthYear,
                                             strategyName,
                                             onSuccess,
                                             reportId
                                         }: MakePaymentModalProps) {
    const locale = useLocale();
    const t = useTranslations('TrackingPage.MakePaymentModal');
    const tZod = useTranslations('TrackingPage.MakePaymentModal.zod');

    const formatMonthYear = (dateString: string) => {
        try {
            const date = new Date(dateString);
            if (!isNaN(date.getTime())) {
                return date.toLocaleDateString(locale === 'tr' ? 'tr-TR' : 'en-US', {
                    month: 'long',
                    year: 'numeric'
                });
            }
            return dateString;
        } catch (e) {
            return dateString;
        }
    };

    const paymentSchema = z.object({
        amount: z.coerce.number().min(0.01, tZod('minAmount')),
    });

    type PaymentFormInputs = z.infer<typeof paymentSchema>;

    const form = useForm<PaymentFormInputs>({
        resolver: zodResolver(paymentSchema),
        defaultValues: {
            amount: targetAmount
        }
    });

    useEffect(() => {
        if (isOpen) {
            form.reset({ amount: targetAmount });
        }
    }, [isOpen, targetAmount, form]);

    const onSubmit = async (data: PaymentFormInputs) => {
        try {
            const d = new Date(monthYear)
            const safeDate = new Date(Date.UTC(d.getFullYear(), d.getMonth(), 15, 12, 0, 0));

            console.log("Gönderilen Strateji:", strategyName);

            await api.post('/api/payment/distribute', {
                amount: data.amount,
                strategy: strategyName,
                date: safeDate.toISOString(),
                calculationReportId: reportId
            });

            toast.success(t('toasts.success'));
            onSuccess();
            onOpenChange(false);
        } catch (error) {
            toast.error(t('toasts.error'));
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
                <DialogHeader>
                    <DialogTitle className="text-gray-900 dark:text-gray-50">{t('title', {monthYear: formatMonthYear(monthYear)})}</DialogTitle>
                    <DialogDescription className="text-muted-foreground dark:text-gray-400">
                        {t.rich('description', {
                            amount: formatCurrency(targetAmount, locale),
                            strategyName: strategyName,
                            str: (chunks) => <span className="font-bold text-primary">{chunks}</span>,
                            br: () => <br/>
                        })}
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

                        <FormField
                            control={form.control}
                            name="amount"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-gray-900 dark:text-gray-200">{t('labelAmount')}</FormLabel>
                                    <FormControl>
                                        <div className="relative">
                                            <span className="absolute left-3 top-[10px] text-muted-foreground z-10">
                                                {locale === 'tr' ? '₺' : '$'}
                                            </span>

                                            <NumericFormat
                                                value={field.value}
                                                onValueChange={(values) => {
                                                    field.onChange(values.floatValue);
                                                }}
                                                thousandSeparator="."
                                                decimalSeparator=","
                                                decimalScale={2}
                                                allowNegative={false}
                                                customInput={Input}
                                                className="pl-7 text-lg font-semibold bg-white dark:bg-gray-950 border-gray-200 dark:border-gray-800 dark:text-white dark:placeholder:text-gray-500"
                                            />
                                        </div>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="flex justify-end gap-2">
                            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="dark:bg-gray-800 dark:text-gray-100 dark:hover:bg-gray-700 dark:border-gray-700">
                                {t('buttonCancel')}
                            </Button>
                            <Button type="submit">
                                {form.formState.isSubmitting ? <Loader2 className="animate-spin" /> : t('buttonConfirm')}
                            </Button>
                        </div>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}