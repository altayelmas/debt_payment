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
import {Label} from "@/components/ui/label";
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
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
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
import {Skeleton} from "@/components/ui/skeleton";
import {Loader2, Pencil, Trash2, Inbox} from "lucide-react";

const MAX_CURRENCY_VALUE = 999999999999.99;
const MAX_INTEREST_RATE = 100;

const debtFormSchema = z.object({
    name: z.string().min(1, {message: "This field is required"}),
    currentBalance: z.coerce.number()
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

const calcFormSchema = z.object({
    extraPayment: z.coerce.number()
        .min(0, {message: "Cannot be negative"})
        .max(MAX_CURRENCY_VALUE, {message: `Value cannot exceed ${MAX_CURRENCY_VALUE}`})
        .optional()
        .default(0 as number),
});

type CalcFormInputs = z.infer<typeof calcFormSchema>;

const defaultFormValues = {
    name: "",
    currentBalance: undefined,
    interestRate: undefined,
    minPayment: undefined,
};

const PAGE_SIZE = 5;

export default function DashboardPage() {
    const [pagedData, setPagedData] = useState<PagedResult<Debt> | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [loadingDebts, setLoadingDebts] = useState(true);
    const [calculating, setCalculating] = useState(false);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingDebt, setEditingDebt] = useState<Debt | null>(null);

    const router = useRouter();
    const {isAuthenticated} = useAuth();

    const form = useForm<DebtFormInputs>({
        resolver: zodResolver(debtFormSchema),
        defaultValues: defaultFormValues
    });

    const calcForm = useForm<CalcFormInputs>({
        resolver: zodResolver(calcFormSchema),
        defaultValues: {extraPayment: 0}
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

    const onSubmitDebt = async (data: DebtFormInputs) => {
        try {
            if (editingDebt) {
                await api.put(`/api/Debt/${editingDebt.debtId}`, data);
                toast.success('The debt has been successfully updated.');
            } else {
                await api.post('/api/Debt', data);
                toast.success('The debt has been successfully added.');
            }

            form.reset(defaultFormValues);
            setIsModalOpen(false);
            setEditingDebt(null);

            if (editingDebt) {
                fetchDebts(currentPage);
            } else {
                if (currentPage !== 1) {
                    setCurrentPage(1);
                } else {
                    fetchDebts(1);
                }
            }

        } catch (error) {
            if (editingDebt) {
                toast.error('An error occurred while updating the debt.');
            } else {
                toast.error('An error occurred while adding the debt.');
            }
        }
    };

    const handleDeleteDebt = async (id: number) => {
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

    const onCalculateSubmit = async (data: CalcFormInputs) => {
        setCalculating(true);
        try {
            const extraPaymentValue = data.extraPayment || 0;

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
                        <Card className="lg:col-span-3">
                            <CardHeader>
                                <CardTitle className="text-xl">
                                    Overview
                                </CardTitle>
                                <CardDescription>
                                    A financial summary of all your debts.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="grid gap-4 sm:grid-cols-3">
                                <div className="p-4 bg-secondary rounded-lg">
                                    <span className="text-sm text-muted-foreground block uppercase">Total Balance</span>
                                    {loadingDebts ? (
                                        <Skeleton className="h-8 w-[150px] mt-1"/>
                                    ) : (
                                        <span className="text-2xl font-semibold">
                                        {formatCurrency(pagedData?.totalBalance || 0)}
                                    </span>
                                    )}
                                </div>

                                <div className="p-4 bg-secondary rounded-lg">
                                    <span className="text-sm text-muted-foreground block uppercase">Total Min. Monthly Payment</span>
                                    {loadingDebts ? (
                                        <Skeleton className="h-8 w-[150px] mt-1"/>
                                    ) : (
                                        <span className="text-2xl font-semibold">
                                        {formatCurrency(pagedData?.totalMonthlyMinPayment || 0)}
                                    </span>
                                    )}
                                </div>

                                <div className="p-4 bg-secondary rounded-lg">
                                    <span
                                        className="text-sm text-muted-foreground block uppercase">Total Debt Amount</span>
                                    {loadingDebts ? (
                                        <Skeleton className="h-8 w-[50px] mt-1"/>
                                    ) : (
                                        <span className="text-2xl font-semibold">
                                        {pagedData?.totalCount || 0}
                                    </span>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                        <Card className="lg:col-span-3 flex flex-col">
                            <CardHeader>
                                <div className={"flex justify-between items-center gap-4"}>
                                    <CardTitle className="text-2xl">Current Debts</CardTitle>

                                    <Dialog
                                        open={isModalOpen}
                                        onOpenChange={(open) => {
                                            setIsModalOpen(open);
                                            if (!open) {
                                                setEditingDebt(null);
                                                form.reset(defaultFormValues);
                                            }
                                        }}
                                    >
                                        <DialogTrigger asChild onClick={() => {
                                            setEditingDebt(null)
                                            form.reset(defaultFormValues);
                                        }}>
                                            <Button>+ Add Debt</Button>
                                        </DialogTrigger>
                                        <DialogContent className="sm:max-w-[425px]">
                                            <DialogHeader>
                                                <DialogTitle>{editingDebt ? 'Edit Debt' : 'Add new debt'}</DialogTitle>
                                            </DialogHeader>
                                            <div className="pt-4">
                                                <Form {...form}>
                                                    <form onSubmit={form.handleSubmit(onSubmitDebt)}
                                                          className="space-y-4">

                                                        <FormField
                                                            control={form.control}
                                                            name="name"
                                                            render={({field}) => (
                                                                <FormItem>
                                                                    <FormLabel>Debt Name</FormLabel>
                                                                    <FormControl>
                                                                        <Input
                                                                            placeholder="E.g. Credit Card" {...field} />
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
                                                                        <Input type="number" min="0" step="0.01"
                                                                               placeholder="1500" {...field} />
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
                                                                        <Input type="number" min="0" step="0.01"
                                                                               placeholder="24.5" {...field} />
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
                                                                        <Input type="number" min="0" step="0.01"
                                                                               placeholder="150" {...field} />
                                                                    </FormControl>
                                                                    <FormMessage/>
                                                                </FormItem>
                                                            )}
                                                        />

                                                        <Button type="submit" className="w-full">
                                                            {form.formState.isSubmitting ? <Loader2
                                                                className="mr-2 h-4 w-4 animate-spin"/> : (editingDebt ? 'Save Changes' : 'Add Debt')}
                                                        </Button>
                                                    </form>
                                                </Form>
                                            </div>
                                        </DialogContent>
                                    </Dialog>
                                </div>
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
                                            <TooltipProvider>
                                                {pagedData && pagedData.items.length > 0 ? (
                                                    pagedData.items.map(debt => (
                                                        <Card key={debt.debtId} className="shadow-sm">
                                                            <div className="p-4">
                                                                <div className="flex justify-between items-start gap-4">
                                                                    <h3 className="text-lg font-semibold leading-tight"
                                                                        title={debt.name}>
                                                                        {debt.name}
                                                                    </h3>


                                                                    <div className="flex-shrink-0 -mt-2 -mr-1">
                                                                        <Tooltip>
                                                                            <TooltipTrigger asChild>
                                                                                <Button
                                                                                    variant="ghost"
                                                                                    size="icon"
                                                                                    className="text-muted-foreground hover:text-blue-600"
                                                                                    onClick={() => {
                                                                                        setEditingDebt(debt);
                                                                                        form.reset(debt);
                                                                                        setIsModalOpen(true);
                                                                                    }}>
                                                                                    <Pencil className="h-5 w-5"/>
                                                                                    <span
                                                                                        className="sr-only">Edit</span>
                                                                                </Button>
                                                                            </TooltipTrigger>
                                                                            <TooltipContent>
                                                                                <p>Edit debt</p>
                                                                            </TooltipContent>
                                                                        </Tooltip>
                                                                        <AlertDialog>
                                                                            <Tooltip>
                                                                                <TooltipTrigger asChild>
                                                                                    <AlertDialogTrigger asChild>
                                                                                        <Button
                                                                                            variant="ghost"
                                                                                            size="icon"
                                                                                            className="text-muted-foreground hover:text-destructive"
                                                                                        >
                                                                                            <Trash2
                                                                                                className="h-5 w-5"/>
                                                                                            <span
                                                                                                className="sr-only">Delete</span>
                                                                                        </Button>
                                                                                    </AlertDialogTrigger>
                                                                                </TooltipTrigger>
                                                                                <TooltipContent>
                                                                                    <p>Delete debt</p>
                                                                                </TooltipContent>
                                                                            </Tooltip>
                                                                            <AlertDialogContent>
                                                                                <AlertDialogHeader>
                                                                                    <AlertDialogTitle>Are you
                                                                                        sure?</AlertDialogTitle>
                                                                                    <AlertDialogDescription>
                                                                                        This action cannot be undone.
                                                                                        You will permanently
                                                                                        delete <strong
                                                                                        className="px-1">{debt.name}</strong>.
                                                                                    </AlertDialogDescription>
                                                                                </AlertDialogHeader>
                                                                                <AlertDialogFooter>
                                                                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                                                    <AlertDialogAction
                                                                                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                                                                        onClick={() => handleDeleteDebt(debt.debtId)}
                                                                                    >
                                                                                        Delete
                                                                                    </AlertDialogAction>
                                                                                </AlertDialogFooter>
                                                                            </AlertDialogContent>
                                                                        </AlertDialog>
                                                                    </div>
                                                                </div>

                                                                <div className="flex flex-wrap gap-x-6 gap-y-1 pt-2">
                                                                    <div>
                                                                        <span
                                                                            className="text-xs text-muted-foreground block uppercase">Balance</span>
                                                                        <span
                                                                            className="text-sm font-medium">{formatCurrency(debt.currentBalance)}</span>
                                                                    </div>
                                                                    <div>
                                                                        <span
                                                                            className="text-xs text-muted-foreground block uppercase">Min. Payment</span>
                                                                        <span
                                                                            className="text-sm font-medium">{formatCurrency(debt.minPayment)}</span>
                                                                    </div>
                                                                    <div>
                                                                        <span
                                                                            className="text-xs text-muted-foreground block uppercase mb-1">Interest</span>
                                                                        <Badge
                                                                            variant="secondary">%{debt.interestRate}</Badge>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </Card>
                                                    ))
                                                ) : (
                                                    <div
                                                        className="flex flex-col items-center justify-center gap-3 text-center py-16">
                                                        <Inbox className="h-16 w-16 text-muted-foreground"/>
                                                        <h3 className="text-xl font-semibold text-foreground">
                                                            No debts added yet
                                                        </h3>
                                                        <p className="text-muted-foreground">
                                                            Click the + Add Debt button above to get started.
                                                        </p>
                                                    </div>
                                                )}
                                            </TooltipProvider>
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
                                            render={({field}) => (
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
                                                    <FormMessage/>
                                                </FormItem>
                                            )}
                                        />

                                        <Button
                                            type="submit"
                                            size="lg"
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
                                </form>
                            </Form>
                        </Card>
                    </div>
                </main>
            </div>
        </ProtectedRoute>
    )
}