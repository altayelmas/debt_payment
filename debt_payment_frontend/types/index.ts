export interface Debt {
    debtId: number;
    name: string;
    currentBalance: number;
    interestRate: number;
    minPayment: number;
    createdAt: string;
}

export interface StrategyResult {
    strategyName: string;
    totalInterestPaid: number;
    totalMonths: number;
    totalPaid: number;
    payOffDate: string;
    paymentSchedule: MonthlyPaymentDetail[];
}

export interface CalculationResult {
    beginningDebt: number;
    snowballResult: StrategyResult;
    avalancheResult: StrategyResult;
    recommendation: string;
    extraPayment: number;
}

export interface PagedResult<T> {
    items: T[];
    totalCount: number;
    currentPage: number;
    pageSize: number;
    totalPages: number;
    totalBalance: number;
    totalMonthlyMinPayment: number;
}

export interface MonthlyPaymentDetail {
    month: number;
    monthYear: string;
    interestPaid: number;
    principalPaid: number;
    endingBalance: number;
}
