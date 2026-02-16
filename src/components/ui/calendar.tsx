import * as React from "react";
import { format, isSameDay, isWithinInterval, startOfDay } from "date-fns";
import type { Locale } from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type CalendarMode = "single" | "range" | "multiple";
type CalendarRange = { from?: Date; to?: Date };
type CalendarSelected = Date | CalendarRange | Date[] | undefined;

type CalendarClassNames = Partial<
  Record<
    | "day_selected"
    | "day_today"
    | "day_disabled"
    | "day_range_middle"
    | "day_range_end"
    | "day_range_start",
    string
  >
>;

type DisabledDatesMatcher = Date[] | ((date: Date) => boolean);

export interface CalendarProps {
  className?: string;
  classNames?: CalendarClassNames;
  showOutsideDays?: boolean;
  mode?: CalendarMode;
  selected?: CalendarSelected;
  onSelect?: (value: CalendarSelected) => void;
  locale?: Locale;
  numberOfMonths?: number;
  disabled?: DisabledDatesMatcher;
}

function isRangeSelection(value: CalendarSelected): value is CalendarRange {
  return !!value && !Array.isArray(value) && !(value instanceof Date);
}

function Calendar({
  className,
  classNames,
  mode = "single",
  selected,
  onSelect,
  locale,
  numberOfMonths = 1,
  disabled,
}: CalendarProps) {
  const disabledDates = Array.isArray(disabled) ? disabled : [];
  const disabledMatcher = typeof disabled === "function" ? disabled : undefined;

  const disabledDatesSet = React.useMemo(
    () => new Set(disabledDates.map((date) => startOfDay(date).getTime())),
    [disabledDates]
  );

  const selectedRange =
    mode === "range" && isRangeSelection(selected) ? selected : undefined;
  const selectedMultiple =
    mode === "multiple" && Array.isArray(selected) ? selected : [];
  const selectedSingle =
    mode === "single" && selected instanceof Date ? selected : null;

  const isDateDisabled = React.useCallback(
    (date: Date) => {
      if (disabledMatcher?.(date)) {
        return true;
      }
      return disabledDatesSet.has(startOfDay(date).getTime());
    },
    [disabledMatcher, disabledDatesSet]
  );

  const dayClassName = React.useCallback(
    (date: Date) => {
      const classes = [cn(buttonVariants({ variant: "ghost" }), "h-10 w-10 p-0 text-sm")];

      if (isDateDisabled(date)) {
        classes.push(classNames?.day_disabled ?? "text-muted-foreground opacity-50");
      }

      if (isSameDay(date, new Date())) {
        classes.push(classNames?.day_today ?? "bg-accent text-accent-foreground");
      }

      if (mode === "range" && selectedRange?.from) {
        const from = selectedRange.from;
        const to = selectedRange.to;
        const selectedClass =
          classNames?.day_selected ??
          "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground";

        if (from && isSameDay(date, from)) {
          classes.push(classNames?.day_range_start ?? selectedClass);
        }

        if (to && isSameDay(date, to)) {
          classes.push(classNames?.day_range_end ?? selectedClass);
        }

        if (
          from &&
          to &&
          !isSameDay(date, from) &&
          !isSameDay(date, to) &&
          isWithinInterval(date, {
            start: from < to ? from : to,
            end: from < to ? to : from,
          })
        ) {
          classes.push(
            classNames?.day_range_middle ??
              "bg-accent text-accent-foreground hover:bg-accent"
          );
        }
      } else if (mode === "multiple") {
        if (selectedMultiple.some((selectedDate) => isSameDay(selectedDate, date))) {
          classes.push(
            classNames?.day_selected ??
              "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground"
          );
        }
      } else if (selectedSingle && isSameDay(selectedSingle, date)) {
        classes.push(
          classNames?.day_selected ??
            "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground"
        );
      }

      return cn(classes);
    },
    [classNames, isDateDisabled, mode, selectedMultiple, selectedRange, selectedSingle]
  );

  const renderCustomHeader = React.useCallback(
    ({
      date,
      decreaseMonth,
      increaseMonth,
      prevMonthButtonDisabled,
      nextMonthButtonDisabled,
    }: {
      date: Date;
      decreaseMonth: VoidFunction;
      increaseMonth: VoidFunction;
      prevMonthButtonDisabled: boolean;
      nextMonthButtonDisabled: boolean;
    }) => (
      <div className="flex items-center justify-between px-2 pt-2">
        <button
          type="button"
          onClick={decreaseMonth}
          disabled={prevMonthButtonDisabled}
          className={cn(
            buttonVariants({ variant: "outline" }),
            "h-8 w-8 bg-transparent p-0 opacity-50 hover:opacity-100"
          )}
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <span className="text-sm font-medium capitalize">
          {format(date, "LLLL yyyy", { locale })}
        </span>
        <button
          type="button"
          onClick={increaseMonth}
          disabled={nextMonthButtonDisabled}
          className={cn(
            buttonVariants({ variant: "outline" }),
            "h-8 w-8 bg-transparent p-0 opacity-50 hover:opacity-100"
          )}
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    ),
    [locale]
  );

  const sharedProps = {
    inline: true,
    locale,
    monthsShown: numberOfMonths,
    calendarClassName: "border-0 shadow-none",
    dayClassName,
    renderCustomHeader,
    filterDate: disabled ? (date: Date) => !isDateDisabled(date) : undefined,
  };

  if (mode === "range") {
    const startDate = selectedRange?.from ?? null;
    const endDate = selectedRange?.to ?? null;

    return (
      <div className={cn("p-3 px-2", className)}>
        <DatePicker
          {...sharedProps}
          selectsRange
          startDate={startDate}
          endDate={endDate}
          onChange={(value) => {
            const [from, to] = value;
            onSelect?.({ from: from ?? undefined, to: to ?? undefined });
          }}
        />
      </div>
    );
  }

  if (mode === "multiple") {
    return (
      <div className={cn("p-3 px-2", className)}>
        <DatePicker
          {...sharedProps}
          selectsMultiple
          selected={selectedMultiple[0] ?? null}
          selectedDates={selectedMultiple}
          onChange={(dates) => {
            onSelect?.(dates ?? []);
          }}
        />
      </div>
    );
  }

  return (
    <div className={cn("p-3 px-2", className)}>
      <DatePicker
        {...sharedProps}
        selected={selectedSingle}
        onChange={(date) => {
          onSelect?.(date ?? undefined);
        }}
      />
    </div>
  );
}

Calendar.displayName = "Calendar";

export { Calendar };
