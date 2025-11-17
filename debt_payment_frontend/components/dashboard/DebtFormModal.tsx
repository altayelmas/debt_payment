'use client';

import { useEffect } from 'react';
import api from '@/lib/api';
import { Debt } from '@/types';
import toast from 'react-hot-toast';
import { useForm } from 'react-hook-form';
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from 'next-intl';

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
} from "@/components/ui/dialog";
import { Loader2 } from "lucide-react";

const MAX_CURRENCY_VALUE = 999999999999.99;
const MAX_INTEREST_RATE = 100;

const defaultFormValues = {
    name: "",
    currentBalance: undefined,
    interestRate: undefined,
    minPayment: undefined,
};

interface DebtFormModalProps {
    isOpen: boolean;
    onOpenChange: (isOpen: boolean) => void;
    editingDebt: Debt | null;
    onSaveComplete: (isEdit: boolean) => void;
}

export default function DebtFormModal({
                                          isOpen,
                                          onOpenChange,
                                          editingDebt,
                                          onSaveComplete
                                      }: DebtFormModalProps) {
    const t = useTranslations('DashboardPage.DebtFormModal');
    const tZod = useTranslations('DashboardPage.DebtFormModal.zod');

    const debtFormSchema = z.object({
        name: z.string().min(1, { message: "This field is required" }),
        currentBalance: z.coerce.number()
            .min(0.01, { message: "Must be at least 0.01" })
            .max(MAX_CURRENCY_VALUE, { message: `Value cannot exceed ${MAX_CURRENCY_VALUE}` }),
        interestRate: z.coerce.number()
            .min(0, { message: "Cannot be negative" })
            .max(MAX_INTEREST_RATE, { message: `Value cannot exceed ${MAX_INTEREST_RATE}` }),
        minPayment: z.coerce.number()
            .min(0.01, { message: "Must be at least 0.01" })
            .max(MAX_CURRENCY_VALUE, { message: `Value cannot exceed ${MAX_CURRENCY_VALUE}` }),
    }).refine(data => {
        if (data.currentBalance && data.minPayment > data.currentBalance) {
            return false;
        }
        return true;
    }, {
        message: tZod("minPaymentGreater"),
        path: ["minPayment"],
    });

    type DebtFormInputs = z.infer<typeof debtFormSchema>;

    const form = useForm<DebtFormInputs>({
        resolver: zodResolver(debtFormSchema),
        defaultValues: defaultFormValues
    });

    useEffect(() => {
        if (isOpen) {
            if (editingDebt) {
                form.reset(editingDebt);
            } else {
                form.reset(defaultFormValues);
            }
        }
    }, [isOpen, editingDebt, form]);

    const onSubmitDebt = async (data: DebtFormInputs) => {
        try {
            const isEdit = !!editingDebt;

            if (isEdit) {
                await api.put(`/api/Debt/${editingDebt.debtId}`, data);
                toast.success(t('toasts.updateSuccess'));
            } else {
                await api.post('/api/Debt', data);
                toast.success(t('toasts.addSuccess'));
            }

            form.reset(defaultFormValues);
            onSaveComplete(isEdit);

        } catch (error) {
            if (editingDebt) {
                toast.error(t('toasts.updateError'));
            } else {
                toast.error(t('toasts.addError'));
            }
        }
    };

    return (
        <Dialog
            open={isOpen}
            onOpenChange={onOpenChange}
        >
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>{editingDebt ? t('titleEdit') : t('titleAdd')}</DialogTitle>
                </DialogHeader>
                <div className="pt-4">
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmitDebt)}
                              className="space-y-4">

                            {/* FormField'lar (Name, Balance, Interest, MinPayment) */}
                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>{t('labels.name')}</FormLabel>
                                        <FormControl>
                                            <Input placeholder={t('labels.namePlaceholder')} {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="currentBalance"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>{t('labels.balance')}</FormLabel>
                                        <FormControl>
                                            <Input type="number" min="0" step="0.01" placeholder="1500" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="interestRate"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>{t('labels.interest')}</FormLabel>
                                        <FormControl>
                                            <Input type="number" min="0" step="0.01" placeholder={t('labels.interestPlaceholder')} {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="minPayment"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>{t('labels.minPayment')}</FormLabel>
                                        <FormControl>
                                            <Input type="number" min="0" step="0.01" placeholder={t('labels.minPaymentPlaceholder')} {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
                                {form.formState.isSubmitting ? <Loader2
                                    className="mr-2 h-4 w-4 animate-spin" /> : (editingDebt ? t('buttonSave') : t('buttonAdd'))}
                            </Button>
                        </form>
                    </Form>
                </div>
            </DialogContent>
        </Dialog>
    );
}