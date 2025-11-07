'use client';

import {useEffect, useState} from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import Navbar from '@/components/Navbar';
import api from '@/lib/api';
import {CalculationResult, Debt, PagedResult} from '@/types';
import toast from 'react-hot-toast';
import {useForm} from 'react-hook-form';
import {useRouter} from 'next/navigation';
import Pagination from '@/components/Pagination';
import {useAuth} from "@/context/AuthContext";

type DebtFormInputs = {
    name: string;
    currentBalance: number;
    interestRate: number;
    minPayment: number;
};

const PAGE_SIZE = 5;
const MAX_CURRENCY_VALUE = 999999999999.99;
const MAX_INTEREST_RATE = 100;

export default function DashboardPage() {
    const [pagedData, setPagedData] = useState<PagedResult<Debt> | null>(null);
    const [currentPage, setCurrentPage] = useState(1);

    const [loadingDebts, setLoadingDebts] = useState(true);
    const [calculating, setCalculating] = useState(false);
    const [extraPayment, setExtraPayment] = useState('0');
    const router = useRouter();

    const {isAuthenticated} = useAuth();

    const {register, handleSubmit, reset, formState: {errors}, watch} = useForm<DebtFormInputs>();

    const currentBalanceValue = watch('currentBalance');

    useEffect(() => {
        if (isAuthenticated) {
            fetchDebts(currentPage);
        }
    }, [isAuthenticated, currentPage]);


    const fetchDebts = async (pageNumber: number) => {
        setLoadingDebts(true);
        try {

            const response = await api.get<PagedResult<Debt>>('/api/Debt', {
                params: {
                    pageNumber: pageNumber,
                    pageSize: PAGE_SIZE
                }
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
            reset();
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
                setCurrentPage(currentPage - 1); //
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
            const requestData = {
                extraMonthlyPayment: extraPaymentValue
            };

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
        setCurrentPage(page);
    };

    return (
        <ProtectedRoute>
            <div className="min-h-screen bg-gray-50">
                <Navbar/>

                <main className="container mx-auto p-4 md:p-8">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                        <div className="lg:col-span-1 bg-white p-6 rounded-lg shadow-md">
                            <h2 className="text-2xl text-gray-600 font-semibold mb-4">Add new debt</h2>
                            <form onSubmit={handleSubmit(onAddDebt)} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Debt Name</label>
                                    <input type="text" {...register('name', {required: 'This field is required'})}
                                           className="mt-1 w-full px-3 py-2 border text-gray-700 rounded-md focus:outline-none focus:ring focus:ring-blue-200"/>
                                    {errors.name && <p className="text-red-500 text-sm">{errors.name.message}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Current Balance
                                        (TL)</label>
                                    <input type="number" min="0" step="0.01" max={MAX_CURRENCY_VALUE} {...register('currentBalance', {
                                        required: 'This field is required',
                                        min: { value: 0.01, message: 'Must be at least 0.01' },
                                        max: { value: MAX_CURRENCY_VALUE, message: `Value cannot exceed ${MAX_CURRENCY_VALUE}` },
                                        valueAsNumber: true
                                    })}
                                           className="mt-1 w-full px-3 py-2 border text-gray-700 rounded-md focus:outline-none focus:ring focus:ring-blue-200"/>
                                    {errors.currentBalance &&
                                        <p className="text-red-500 text-sm">{errors.currentBalance.message}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Annual Interest Rate
                                        (%)</label>
                                    <input type="number" min="0" max={MAX_INTEREST_RATE} step="0.01" {...register('interestRate', {
                                        required: 'This field is required',
                                        min: { value: 0, message: 'Cannot be negative' },
                                        max: { value: MAX_INTEREST_RATE, message: `Value cannot exceed ${MAX_INTEREST_RATE}` },
                                        valueAsNumber: true
                                    })}
                                           className="mt-1 w-full px-3 py-2 border text-gray-700 rounded-md focus:outline-none focus:ring focus:ring-blue-200"/>
                                    {errors.interestRate &&
                                        <p className="text-red-500 text-sm">{errors.interestRate.message}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Min. Monthly Payment
                                        (TL)</label>
                                    <input type="number" min="0" step="0.01" {...register('minPayment', {
                                        required: 'This field is required',
                                        min: { value: 0.01, message: 'Must be at least 0.01' },
                                        max: { value: MAX_CURRENCY_VALUE, message: `Value cannot exceed ${MAX_CURRENCY_VALUE}` },
                                        valueAsNumber: true,
                                        validate: (value) => {
                                            if (currentBalanceValue && value > currentBalanceValue) {
                                                return 'Min. payment cannot be greater than the balance';
                                            }
                                            return true;
                                        }
                                    })}
                                           className="mt-1 w-full px-3 py-2 border text-gray-700 rounded-md focus:outline-none focus:ring focus:ring-blue-200"/>
                                    {errors.minPayment &&
                                        <p className="text-red-500 text-sm">{errors.minPayment.message}</p>}
                                </div>
                                <button type="submit"
                                        className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition-colors">
                                    Add Debt
                                </button>
                            </form>
                        </div>

                        <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-md flex flex-col">
                            <h2 className="text-2xl text-gray-600 font-semibold mb-4">Current Debts</h2>
                            <div className="mb-6">
                                <div className="h-[320px] overflow-y-auto pr-2">
                                    {loadingDebts ? (
                                        <p>Loading...</p>
                                    ) : (
                                        <>
                                            {pagedData && pagedData.items.length > 0 ? (
                                                <div className="space-y-3">
                                                    {pagedData.items.map(debt => (
                                                        <div key={debt.debtId}
                                                             className="p-3 border rounded-md flex justify-between items-center flex-wrap">
                                                            <div>
                                                                <p className="font-semibold text-gray-600">{debt.name}</p>
                                                                <p className="text-sm text-gray-600">
                                                                    Balance: {formatCurrency(debt.currentBalance)} |
                                                                    Interest: %{debt.interestRate} |
                                                                    Min. Payment: {formatCurrency(debt.minPayment)}
                                                                </p>
                                                            </div>
                                                            <button onClick={() => handleDeleteDebt(debt.debtId)}
                                                                    className="text-red-500 hover:text-red-700 text-sm font-medium">
                                                                Delete
                                                            </button>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <p>You have no outstanding debt.</p>
                                            )}
                                        </>
                                    )}
                                </div>
                            </div>
                            <div className="min-h-[50px] pt-4">
                                {!loadingDebts && pagedData && pagedData.totalPages > 0 && (
                                    <Pagination
                                        currentPage={pagedData.currentPage}
                                        totalPages={pagedData.totalPages}
                                        onPageChange={handlePageChange}
                                    />
                                )}
                            </div>
                        </div>
                        <div className="border-t pt-6">
                            <h2 className="text-2xl text-gray-600 font-semibold mb-4">Calculation</h2>
                            <div className="mb-4 max-w-xs">
                                <label className="block text-sm font-medium text-gray-700">Monthly Extra Budget
                                    (TL)</label>
                                <input
                                    type="number"
                                    step="50"
                                    min={"0"}
                                    max={MAX_CURRENCY_VALUE}
                                    value={extraPayment}
                                    onChange={(e) =>  {
                                        const value = e.target.value;
                                        if (value === '' || parseFloat(value) >= 0) {
                                            setExtraPayment(value);
                                        }
                                        const numValue = parseFloat(value);
                                        if (!isNaN(numValue) && numValue >= 0 && numValue <= MAX_CURRENCY_VALUE) {
                                            setExtraPayment(value);
                                        }
                                    }}
                                    className="mt-1 w-full px-3 py-2 text-gray-700 border rounded-md focus:outline-none focus:ring focus:ring-blue-200"
                                    placeholder="Ex: 500"
                                />
                            </div>
                            <button
                                onClick={handleCalculate}
                                disabled={calculating || !pagedData || pagedData.totalCount === 0}
                                className="bg-blue-600 text-white px-6 py-3 rounded-lg text-lg font-semibold hover:bg-blue-700 disabled:bg-blue-300 transition-colors"
                            >
                                {calculating ? 'Calculating...' : 'Calculate'}
                            </button>
                            {(!pagedData || pagedData.totalCount === 0) && !loadingDebts && (
                                <p className="text-sm text-red-500 mt-2">To perform the calculation, you must first
                                    add the debt.</p>
                            )}
                        </div>
                    </div>
                </main>
            </div>
        </ProtectedRoute>
    )
}

