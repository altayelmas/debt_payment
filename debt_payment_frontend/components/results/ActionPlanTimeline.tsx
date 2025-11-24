import { useTranslations } from "next-intl";
import { StrategyResult } from '@/types';
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, CalendarDays, Trophy, TrendingUp, ArrowDown } from "lucide-react";
import React from "react";

interface ActionPlanTimelineProps {
    milestones: StrategyResult['milestones'];
    paymentSchedule: StrategyResult['paymentSchedule'];
    formatDateString: (date: string) => string;
}

export default function ActionPlanTimeline({ milestones, paymentSchedule, formatDateString }: ActionPlanTimelineProps) {
    const t = useTranslations('ResultsPage.ResultCard');

    if (!milestones || milestones.length === 0) return null;

    const groupedMilestones = milestones.reduce((acc, milestone) => {
        const monthKey = milestone.month;
        if (!acc[monthKey]) {
            acc[monthKey] = [];
        }
        acc[monthKey].push(milestone);
        return acc;
    }, {} as Record<number, typeof milestones>);

    const sortedMonths = Object.keys(groupedMilestones)
        .map(Number)
        .sort((a, b) => a - b);

    return (
        <div className="mb-4 p-4 border rounded-lg bg-card text-card-foreground shadow-sm">
            <h4 className="font-semibold text-lg mb-4 flex items-center gap-2">
                <Trophy className="h-5 w-5 text-yellow-600" />
                {t('actionPlanTitle')}
            </h4>

            <Accordion type="single" collapsible className="w-full">
                {sortedMonths.map((monthNumber, index) => {
                    const monthMilestones = groupedMilestones[monthNumber];
                    const firstMilestone = monthMilestones[0];

                    const safeDate = firstMilestone.monthYear
                        ? formatDateString(firstMilestone.monthYear)
                        : "";

                    let gapElement = null;

                    if (index > 0) {
                        const prevMonthNumber = sortedMonths[index - 1];
                        if (monthNumber - prevMonthNumber > 1) {
                            const gapStart = prevMonthNumber + 1;
                            const gapEnd = monthNumber - 1;

                            const focusDebtName = firstMilestone.debtName;

                            gapElement = (
                                <div className="pl-4 py-3 flex gap-4 relative" key={`gap-${monthNumber}`}>
                                    <div className="absolute left-[27px] top-0 bottom-0 w-0.5 bg-border -z-10"></div>

                                    <div className="flex items-center justify-center w-6 h-6 rounded-full bg-muted text-muted-foreground shrink-0 mt-0.5 border bg-background">
                                        <TrendingUp className="h-3 w-3" />
                                    </div>

                                    <div className="text-sm text-muted-foreground bg-muted/30 p-2 rounded w-full border border-dashed">
                                        <span className="font-semibold text-foreground text-xs uppercase tracking-wider block mb-1">
                                            {t('gapFocusTitle')}
                                        </span>
                                        {t.rich('gapFocusDescription', {
                                            start: gapStart,
                                            end: gapEnd,
                                            debtName: focusDebtName,
                                            str: (chunks) => <strong className="text-foreground">{chunks}</strong>
                                        })}
                                    </div>
                                </div>
                            );
                        }
                    }

                    return (
                        <React.Fragment key={monthNumber}>
                            {gapElement}
                            <AccordionItem
                                value={`month-${monthNumber}`}
                                className="border-b-0 mb-2 border rounded-md px-3 bg-background relative z-10"
                            >
                                <AccordionTrigger className="hover:no-underline py-3">
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between w-full pr-4 gap-2">
                                        <div className="flex items-center gap-3">
                                            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-bold text-sm shrink-0 dark:bg-blue-900 dark:text-blue-100">
                                                {monthNumber}
                                            </div>

                                            <div className="flex flex-col text-left">
                                                <span className="font-semibold text-base">
                                                    {monthMilestones.length > 1
                                                        ? t('milestoneGroupTitleMultiple', { count: monthMilestones.length })
                                                        : t('milestoneGroupTitleSingle', { debtName: firstMilestone.debtName })
                                                    }
                                                </span>
                                                <span className="text-xs text-muted-foreground flex items-center gap-1">
                                                    <CalendarDays className="h-3 w-3" />
                                                    {safeDate}
                                                </span>
                                            </div>
                                        </div>

                                        {monthMilestones.length > 1 && (
                                            <div className="hidden sm:flex gap-1 flex-wrap justify-end max-w-[50%]">
                                                {monthMilestones.slice(0, 3).map((m, i) => (
                                                    <Badge key={i} variant="secondary" className="text-xs font-normal">
                                                        {m.debtName}
                                                    </Badge>
                                                ))}
                                                {monthMilestones.length > 3 && (
                                                    <Badge variant="outline" className="text-xs">+{monthMilestones.length - 3}</Badge>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </AccordionTrigger>

                                <AccordionContent className="pt-2 pb-4 px-1">
                                    <div className="pl-11 space-y-3">
                                        <p className="text-sm text-muted-foreground">
                                            {t('milestoneGroupDescription')}
                                        </p>
                                        <ul className="space-y-2">
                                            {monthMilestones.map((milestone) => (
                                                <li key={milestone.debtName} className="flex items-start gap-2 bg-muted/50 p-2 rounded-md">
                                                    <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5" />
                                                    <div className="text-sm">
                                                        <span className="font-semibold text-foreground">{milestone.debtName}</span>
                                                        <span className="text-muted-foreground mx-1">-</span>
                                                        <span className="text-muted-foreground">{t('milestoneItemPaid')}</span>
                                                    </div>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </AccordionContent>
                            </AccordionItem>
                            {index < sortedMonths.length - 1 && !gapElement && (
                                <div className="absolute left-[34px] h-2 w-0.5 bg-border -mt-2 -mb-2 z-0"></div>
                            )}
                        </React.Fragment>
                    );
                })}
            </Accordion>
        </div>
    );
}