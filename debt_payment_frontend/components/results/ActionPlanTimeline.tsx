import { useTranslations } from "next-intl";
import { StrategyResult } from '@/types';

interface ActionPlanTimelineProps {
    milestones: StrategyResult['milestones'];
    paymentSchedule: StrategyResult['paymentSchedule'];
    formatDateString: (date: string) => string;
}

export default function ActionPlanTimeline({ milestones, paymentSchedule, formatDateString }: ActionPlanTimelineProps) {
    const t = useTranslations('ResultsPage.ResultCard');

    if (!milestones || milestones.length === 0) return null;

    return (
        <div className="mb-4 p-4 border rounded-lg">
            <h4 className="font-semibold text-lg mb-3">{t('actionPlanTitle')}</h4>
            <ol className="relative border-l border-gray-200 dark:border-gray-700 space-y-4">
                {milestones.map((milestone, index) => {
                    let startMonth: number;
                    let startDate: string | undefined;

                    if (index === 0) {
                        startMonth = 1;
                        startDate = paymentSchedule[0]?.monthYear;
                    } else {
                        const prevMilestone = milestones[index - 1];
                        if (milestone.month === prevMilestone.month) {
                            startMonth = milestone.month;
                            startDate = milestone.monthYear;
                        } else {
                            startMonth = prevMilestone.month + 1;
                            startDate = prevMilestone.monthYear;
                        }
                    }
                    const isSingleMonth = startMonth === milestone.month;

                    const safeFormat = (d: string | undefined) => d ? formatDateString(d) : "";

                    const dateRange = isSingleMonth
                        ? t('actionPlanDateSingle', {
                            month: milestone.month,
                            monthYear: safeFormat(milestone.monthYear)
                        })
                        : t('actionPlanDateRange', {
                            startMonth: startMonth,
                            endMonth: milestone.month,
                            startDate: safeFormat(startDate),
                            endDate: safeFormat(milestone.monthYear)
                        });

                    return (
                        <li key={milestone.month + milestone.debtName} className="ml-4">
                            <div className="absolute w-3 h-3 bg-gray-200 rounded-full mt-1.5 -left-1.5 border border-white dark:border-gray-900 dark:bg-gray-700"></div>
                            <time className="mb-1 text-sm font-normal leading-none text-muted-foreground">
                                {dateRange}
                            </time>
                            <h3 className="text-md font-semibold text-foreground">
                                {t('actionPlanStep', { step: index + 1, debtName: milestone.debtName })}
                            </h3>
                            <p className="text-sm font-normal text-muted-foreground">
                                {t.rich('actionPlanDescription', {
                                    debtName: milestone.debtName,
                                    str: (chunks) => <strong className="text-foreground">{chunks}</strong>
                                })}
                            </p>
                        </li>
                    );
                })}
            </ol>
        </div>
    );
}