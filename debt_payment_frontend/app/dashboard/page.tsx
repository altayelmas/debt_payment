'use client';

import {useEffect, useState} from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import Navbar from '@/components/Navbar';
import api from '@/lib/api';
import {CalculationResult, Debt, PagedResult} from '@/types';
import toast from 'react-hot-toast';
import {useForm} from 'react-hook-form';
import {useRouter} from 'next/navigation';
import {useAuth} from "@/context/AuthContext";
import {z} from "zod";
import {zodResolver} from "@hookform/resolvers/zod";

import {Button} from "@/components/ui/button";
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
import {Input} from "@/components/ui/input";
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination";
import {Skeleton} from "@/components/ui/skeleton";
import {Loader2, Trash2} from "lucide-react";
const MAX_CURRENCY_VALUE = 999999999999.99;
const MAX_INTEREST_RATE = 100;

const debtFormSchema = z.object({
    name: z.string().min(1, {message: "This field is required"}),
    currentBalance: z.coerce.number() // 'valueAsNumber' yerine 'coerce.number()'
        .min(0.01, {message: "Must be at least 0.01"})
        .max(MAX_CURRENCY_VALUE, {message: `Value cannot exceed ${MAX_CURRENCY_VALUE}`}),
    interestRate: z.coerce.number()
        .min(0, {message: "Cannot be negative"})
        .max(MAX_INTEREST_RATE, {message: `Value cannot exceed ${MAX_INTEREST_RATE}`}),
    minPayment: z.coerce.number()
        .min(0.01, {message: "Must be at least 0.01"})
        .max(MAX_CURRENCY_VALUE, {message: `Value cannot exceed ${MAX_CURRENCY_VALUE}`}),
}).refine(data => {
    if (data.currentBalance && data.minPayment > data.currentBalance) {
        return false;
    }
    return true;
}, {
    message: "Min. payment cannot be greater than the balance",
    path: ["minPayment"],
});

type DebtFormInputs = z.infer<typeof debtFormSchema>;

const PAGE_SIZE = 5;

export default function DashboardPage() {
    const [pagedData, setPagedData] = useState<PagedResult<Debt> | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [loadingDebts, setLoadingDebts] = useState(true);
    const [calculating, setCalculating] = useState(false);
    const [extraPayment, setExtraPayment] = useState('0');

    const router = useRouter();
    const {isAuthenticated} = useAuth();

    const form = useForm<DebtFormInputs>({
        resolver: zodResolver(debtFormSchema),
        defaultValues: {
            name: "",
            currentBalance: undefined,
            interestRate: undefined,
            minPayment: undefined,
        }
    });

    useEffect(() => {
        if (isAuthenticated) {
            fetchDebts(currentPage);
        }
    }, [isAuthenticated, currentPage]);

    const fetchDebts = async (pageNumber: number) => {
        setLoadingDebts(true);
        try {
            const response = await api.get<PagedResult<Debt>>('/api/Debt', {
                params: {pageNumber: pageNumber, pageSize: PAGE_SIZE}
            });
            setPagedData(response.data);
        } catch (error) {
            toast.error('Debts could not be loaded.');
        } finally {
            setLoadingDebts(false);
        }
    };

    const onAddDebt = async (data: DebtFormInputs) => {
        try {
            await api.post('/api/Debt', data);
            toast.success('The debt has been successfully added.');
            if (currentPage !== 1) {
                setCurrentPage(1);
            } else {
                fetchDebts(1);
            }
            form.reset();
        } catch (error) {
            toast.error('An error occurred while adding the debt.');
        }
    };

    const handleDeleteDebt = async (id: number) => {
        if (!confirm('Are you sure you want to delete this debt?')) return;

        try {
            await api.delete(`/api/Debt/${id}`);
            toast.success('Debt deleted.');
            if (pagedData && pagedData.items.length === 1 && currentPage > 1) {
                setCurrentPage(currentPage - 1);
            } else {
                fetchDebts(currentPage);
            }
        } catch (error) {
            toast.error('Could not delete debt.');
        }
    };

    const handleCalculate = async () => {
        setCalculating(true);
        try {
            const extraPaymentValue = parseFloat(extraPayment) || 0;
            const requestData = {extraMonthlyPayment: extraPaymentValue};
            const response = await api.post<CalculationResult>('/api/calculation/calculate', requestData);
            const payloadToStore = {
                resultData: response.data,
                extraPayment: extraPaymentValue
            }
            localStorage.setItem('calculationResult', JSON.stringify(payloadToStore));
            router.push('/results');
        } catch (error: any) {
            const errorMessage = error.response?.data || 'The calculation could not be performed. Please check your debts.';
            toast.error(errorMessage);
        } finally {
            setCalculating(false);
        }
    };

    const formatCurrency = (value: number) =>
        (value || 0).toLocaleString('tr-TR', {style: 'currency', currency: 'TRY'});

    const handlePageChange = (page: number) => {
        if (page < 1 || (pagedData && page > pagedData.totalPages)) {
            return;
        }
        setCurrentPage(page);
    };

    return (
        <ProtectedRoute>
            <div className="min-h-screen bg-gray-50">
                <Navbar/>
                <main className="container mx-auto p-4 md:p-8">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                        <Card className="lg:col-span-1">
                            <CardHeader>
                                <CardTitle className="text-2xl">Add new debt</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <Form {...form}>
                                    <form onSubmit={form.handleSubmit(onAddDebt)} className="space-y-4">

                                        <FormField
                                            control={form.control}
                                            name="name"
                                            render={({field}) => (
                                                <FormItem>
                                                    <FormLabel>Debt Name</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="E.g. Credit Card" {...field} />
                                                    </FormControl>
                                                    <FormMessage/>
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={form.control}
                                            name="currentBalance"
                                            render={({field}) => (
                                                <FormItem>
                                                    <FormLabel>Current Balance (TL)</FormLabel>
                                                    <FormControl>
                                                        <Input type="number" min="0" step="0.01" placeholder="1500" {...field} />
                                                    </FormControl>
                                                    <FormMessage/>
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={form.control}
                                            name="interestRate"
                                            render={({field}) => (
                                                <FormItem>
                                                    <FormLabel>Annual Interest Rate (%)</FormLabel>
                                                    <FormControl>
                                                        <Input type="number" min="0" step="0.01" placeholder="24.5" {...field} />
                                                    </FormControl>
                                                    <FormMessage/>
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={form.control}
                                            name="minPayment"
                                            render={({field}) => (
                                                <FormItem>
                                                    <FormLabel>Min. Monthly Payment (TL)</FormLabel>
                                                    <FormControl>
                                                        <Input type="number" min="0" step="0.01" placeholder="150" {...field} />
                                                    </FormControl>
                                                    <FormMessage/>
                                                </FormItem>
                                            )}
                                        />

                                        <Button type="submit" className="w-full">
                                            Add Debt
                                        </Button>
                                    </form>
                                </Form>
                            </CardContent>
                        </Card>
                        <Card className="lg:col-span-2 flex flex-col">
                            <CardHeader>
                                <CardTitle className="text-2xl">Current Debts</CardTitle>
                                <CardDescription>Total debts: {pagedData?.totalCount || 0}</CardDescription>
                            </CardHeader>
                            <CardContent className="flex-grow">
                                <div className="h-[320px] overflow-y-auto pr-2 space-y-3">
                                    {loadingDebts ? (
                                        <div className="space-y-3">
                                            <Skeleton className="h-[70px] w-full rounded-md"/>
                                            <Skeleton className="h-[70px] w-full rounded-md"/>
                                            <Skeleton className="h-[70px] w-full rounded-md"/>
                                        </div>
                                    ) : (
                                        <>
                                            {pagedData && pagedData.items.length > 0 ? (
                                                pagedData.items.map(debt => (
                                                    <div key={debt.debtId}
                                                         className="p-3 border rounded-md flex justify-between items-center flex-wrap">
                                                        <div>
                                                            <p className="font-semibold text-gray-700">{debt.name}</p>
                                                            <p className="text-sm text-gray-600">
                                                                Balance: {formatCurrency(debt.currentBalance)} |
                                                                Interest: %{debt.interestRate} |
                                                                Min. Payment: {formatCurrency(debt.minPayment)}
                                                            </p>
                                                        </div>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            className="text-red-500 hover:text-red-700"
                                                            onClick={() => handleDeleteDebt(debt.debtId)}>
                                                            <Trash2 className="h-4 w-4 mr-1"/>
                                                            Delete
                                                        </Button>
                                                    </div>
                                                ))
                                            ) : (
                                                <p className="text-gray-500">You have no outstanding debt.</p>
                                            )}
                                        </>
                                    )}
                                </div>
                            </CardContent>
                            <CardFooter className="min-h-[70px] pt-4 border-t">
                                {!loadingDebts && pagedData && pagedData.totalPages > 1 && (
                                    <Pagination>
                                        <PaginationContent>
                                            <PaginationItem>
                                                <PaginationPrevious
                                                    href="#"
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        handlePageChange(currentPage - 1);
                                                    }}
                                                    aria-disabled={currentPage === 1}
                                                    className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
                                                />
                                            </PaginationItem>

                                            <PaginationItem>
                                                <span className="px-4 py-2 text-sm font-medium">
                                                    Page {pagedData.currentPage} of {pagedData.totalPages}
                                                </span>
                                            </PaginationItem>

                                            <PaginationItem>
                                                <PaginationNext
                                                    href="#"
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        handlePageChange(currentPage + 1);
                                                    }}
                                                    aria-disabled={currentPage === pagedData.totalPages}
                                                    className={currentPage === pagedData.totalPages ? "pointer-events-none opacity-50" : ""}
                                                />
                                            </PaginationItem>
                                        </PaginationContent>
                                    </Pagination>
                                )}
                            </CardFooter>
                        </Card>

                        <Card className="lg:col-span-3">
                            <CardHeader>
                                <CardTitle className="text-2xl">Calculation</CardTitle>
                                <CardDescription>Enter an extra budget to speed up your debt repayment.</CardDescription>
                            </CardHeader>
                            <CardContent className="flex flex-col sm:flex-row sm:items-end gap-4">
                                <div className="flex-1 max-w-xs">
                                    <Label>Monthly Extra Budget (TL)</Label>
                                    <Input
                                        type="number"
                                        step="50"
                                        min={"0"}
                                        max={MAX_CURRENCY_VALUE}
                                        value={extraPayment}
                                        onChange={(e) => {
                                            const value = e.target.value;
                                            if (value === '' || (parseFloat(value) >= 0 && parseFloat(value) <= MAX_CURRENCY_VALUE)) {
                                                setExtraPayment(value);
                                            }
                                        }}
                                        className="mt-1"
                                        placeholder="Ex: 500"
                                    />
                                </div>
                                <Button
                                    size="lg"
                                    onClick={handleCalculate}
                                    disabled={calculating || !pagedData || pagedData.totalCount === 0}
                                    className="text-lg font-semibold"
                                >
                                    {calculating && <Loader2 className="mr-2 h-5 w-5 animate-spin"/>}
                                    {calculating ? 'Calculating...' : 'Calculate'}
                                </Button>
                            </CardContent>
                            {(!pagedData || pagedData.totalCount === 0) && !loadingDebts && (
                                <CardFooter>
                                    <p className="text-sm text-red-500">
                                        To perform the calculation, you must first add the debt.
                                    </p>
                                </CardFooter>
                            )}
                        </Card>
                    </div>
                </main>
            </div>
        </ProtectedRoute>
    )
}