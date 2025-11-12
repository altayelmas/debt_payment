'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { CalculationResult } from '@/types';
import toast from 'react-hot-toast';
import { useForm } from 'react-hook-form';
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
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

const calcFormSchema = z.object({
    extraPayment: z.coerce.number()
        .min(0, { message: "Cannot be negative" })
        .max(MAX_CURRENCY_VALUE, { message: `Value cannot exceed ${MAX_CURRENCY_VALUE}` })
        .optional()
        .default(0 as number),
});

type CalcFormInputs = z.infer<typeof calcFormSchema>;

interface CalculationFormCardProps {
    isCalculationDisabled: boolean;
    onCalculationComplete: () => void;
}

export default function CalculationFormCard({
                                                isCalculationDisabled,
                                                onCalculationComplete
                                            }: CalculationFormCardProps) {

    // State'ler DashboardPage'den buraya taşındı
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
                throw new Error("Report ID was not returned from the server.");
            }

        } catch (error: any) {
            const errorMessage = error.response?.data?.message || error.response?.data || 'The calculation could not be performed. Please check your debts.';
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
                        <CardTitle className="text-2xl">Calculation</CardTitle>
                        <CardDescription>Enter an extra budget to speed up your debt
                            repayment.</CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-col sm:flex-row sm:items-end gap-4">
                        <FormField
                            control={calcForm.control}
                            name="extraPayment"
                            render={({ field }) => (
                                <FormItem className="flex-1 max-w-xs">
                                    <FormLabel>Monthly Extra Budget (TL)</FormLabel>
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
                            {calculating ? 'Calculating...' : 'Calculate'}
                        </Button>
                    </CardContent>
                    {isCalculationDisabled && !isCalculationDisabled && (
                        <CardFooter>
                            <p className="text-sm text-red-500">
                                To perform the calculation, you must first add the debt.
                            </p>
                        </CardFooter>
                    )}
                </form>
            </Form>
        </Card>
    );
}