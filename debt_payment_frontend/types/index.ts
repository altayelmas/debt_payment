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
}

export interface CalculationResult {
    beginningDebt: number;
    snowballResult: StrategyResult;
    avalancheResult: StrategyResult;
    recommendation: string;
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
