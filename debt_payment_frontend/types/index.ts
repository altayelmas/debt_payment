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
    milestones: DebtPayoffMilestone[];
}

export interface CalculationResult {
    beginningDebt: number;
    snowballResult: StrategyResult;
    avalancheResult: StrategyResult;
    recommendation: string;
    extraPayment: number;
    currentTotalDebt: number;
    calculationId: string;
    isPlanOutdated: boolean;
    debtStatuses: ActiveDebtStatusDto[];
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
    totalPaymentAmount: number;
    monthlyNote: string;
    principalPaid: number;
    endingBalance: number;
    paidOffDebts: string[];
    isPaid: boolean;
    actualPaidAmount: number;
    paymentDate?: string;
}

export interface CalculationHistoryDto {
    reportId: string;
    createdAt: string;
    totalDebt: number;
    extraPayment: number;
    recommendedPayOffDate: string;
    recommendedInterestSaved: number;
}

export interface DebtPayoffMilestone {
    month: number;
    monthYear: string;
    debtName: string;
}

export interface ActiveDebtStatusDto {
    debtId: number;
    debtName: string;
    currentBalance: number;
    startingBalance: number;
    isPaidOff: boolean;
}
