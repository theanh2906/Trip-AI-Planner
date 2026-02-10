import React, { useState, useMemo } from 'react';
import * as Popover from '@radix-ui/react-popover';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useAppStore } from '../../stores/appStore';

interface DatePickerProps {
  value: string;
  onChange: (date: string) => void;
  minDate?: string;
  placeholder?: string;
  className?: string;
}

const WEEKDAYS_VI = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
const WEEKDAYS_EN = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

const MONTHS_VI = [
  'Tháng 1',
  'Tháng 2',
  'Tháng 3',
  'Tháng 4',
  'Tháng 5',
  'Tháng 6',
  'Tháng 7',
  'Tháng 8',
  'Tháng 9',
  'Tháng 10',
  'Tháng 11',
  'Tháng 12',
];

const MONTHS_EN = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

export const DatePicker: React.FC<DatePickerProps> = ({
  value,
  onChange,
  minDate,
  placeholder = 'Select date',
  className,
}) => {
  const { language } = useAppStore();
  const [open, setOpen] = useState(false);

  // Parse value to Date object
  const selectedDate = value ? new Date(value) : null;

  // Current viewing month/year
  const [viewMonth, setViewMonth] = useState(() => {
    const d = selectedDate || new Date();
    return d.getMonth();
  });
  const [viewYear, setViewYear] = useState(() => {
    const d = selectedDate || new Date();
    return d.getFullYear();
  });

  const weekdays = language === 'vi' ? WEEKDAYS_VI : WEEKDAYS_EN;
  const months = language === 'vi' ? MONTHS_VI : MONTHS_EN;

  // Min date parsed
  const minDateObj = minDate ? new Date(minDate) : null;

  // Get days in month
  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  // Get first day of month (0 = Sunday)
  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay();
  };

  // Generate calendar days
  const calendarDays = useMemo(() => {
    const daysInMonth = getDaysInMonth(viewYear, viewMonth);
    const firstDay = getFirstDayOfMonth(viewYear, viewMonth);
    const prevMonthDays = getDaysInMonth(viewYear, viewMonth - 1);

    const days: { day: number; month: 'prev' | 'current' | 'next'; date: Date }[] = [];

    // Previous month days
    for (let i = firstDay - 1; i >= 0; i--) {
      const day = prevMonthDays - i;
      days.push({
        day,
        month: 'prev',
        date: new Date(viewYear, viewMonth - 1, day),
      });
    }

    // Current month days
    for (let i = 1; i <= daysInMonth; i++) {
      days.push({
        day: i,
        month: 'current',
        date: new Date(viewYear, viewMonth, i),
      });
    }

    // Next month days to fill grid
    const remaining = 42 - days.length;
    for (let i = 1; i <= remaining; i++) {
      days.push({
        day: i,
        month: 'next',
        date: new Date(viewYear, viewMonth + 1, i),
      });
    }

    return days;
  }, [viewYear, viewMonth]);

  const isToday = (date: Date) => {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  const isSelected = (date: Date) => {
    if (!selectedDate) return false;
    return (
      date.getDate() === selectedDate.getDate() &&
      date.getMonth() === selectedDate.getMonth() &&
      date.getFullYear() === selectedDate.getFullYear()
    );
  };

  const isDisabled = (date: Date) => {
    if (!minDateObj) return false;
    // Compare dates without time
    const dateOnly = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const minDateOnly = new Date(
      minDateObj.getFullYear(),
      minDateObj.getMonth(),
      minDateObj.getDate()
    );
    return dateOnly < minDateOnly;
  };

  const handlePrevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear(viewYear - 1);
    } else {
      setViewMonth(viewMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear(viewYear + 1);
    } else {
      setViewMonth(viewMonth + 1);
    }
  };

  const handleSelectDate = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    onChange(`${year}-${month}-${day}`);
    setOpen(false);
  };

  const handleGoToToday = () => {
    const today = new Date();
    setViewMonth(today.getMonth());
    setViewYear(today.getFullYear());
  };

  // Format display value
  const displayValue = useMemo(() => {
    if (!selectedDate) return '';
    const options: Intl.DateTimeFormatOptions = {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    };
    return selectedDate.toLocaleDateString(language === 'vi' ? 'vi-VN' : 'en-US', options);
  }, [selectedDate, language]);

  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Popover.Trigger asChild>
        <button
          type="button"
          className={cn(
            'w-full flex items-center gap-3 px-3.5 py-3 bg-slate-50 border border-slate-200 rounded-xl',
            'hover:border-blue-300 hover:bg-slate-50/80 transition-all duration-200',
            'focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500',
            'group',
            className
          )}
        >
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-sm shadow-blue-500/25">
            <Calendar className="w-4.5 h-4.5 text-white" />
          </div>
          <div className="flex-1 text-left">
            {displayValue ? (
              <span className="text-sm font-medium text-slate-700">{displayValue}</span>
            ) : (
              <span className="text-sm text-slate-400">{placeholder}</span>
            )}
          </div>
          <ChevronRight
            className={cn(
              'w-4 h-4 text-slate-400 transition-transform duration-200',
              open && 'rotate-90'
            )}
          />
        </button>
      </Popover.Trigger>

      <AnimatePresence>
        {open && (
          <Popover.Portal forceMount>
            <Popover.Content
              asChild
              sideOffset={8}
              align="start"
              className="z-50"
              onOpenAutoFocus={(e) => e.preventDefault()}
            >
              <motion.div
                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                transition={{ duration: 0.15, ease: 'easeOut' }}
                className="w-[300px] bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden"
              >
                {/* Header */}
                <div className="p-4 border-b border-slate-100">
                  <div className="flex items-center justify-between">
                    <button
                      type="button"
                      onClick={handlePrevMonth}
                      className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center transition-colors"
                    >
                      <ChevronLeft className="w-4 h-4 text-slate-600" />
                    </button>
                    <span className="text-sm font-semibold text-slate-800">
                      {months[viewMonth]} {viewYear}
                    </span>
                    <button
                      type="button"
                      onClick={handleNextMonth}
                      className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center transition-colors"
                    >
                      <ChevronRight className="w-4 h-4 text-slate-600" />
                    </button>
                  </div>
                </div>

                {/* Calendar Grid */}
                <div className="p-3">
                  {/* Weekdays */}
                  <div className="grid grid-cols-7 mb-2">
                    {weekdays.map((day) => (
                      <div
                        key={day}
                        className="h-8 flex items-center justify-center text-xs font-medium text-slate-400"
                      >
                        {day}
                      </div>
                    ))}
                  </div>

                  {/* Days */}
                  <div className="grid grid-cols-7 gap-0.5">
                    {calendarDays.map((item, idx) => {
                      const disabled = isDisabled(item.date);
                      const selected = isSelected(item.date);
                      const today = isToday(item.date);
                      const isCurrentMonth = item.month === 'current';

                      return (
                        <button
                          key={idx}
                          type="button"
                          disabled={disabled || !isCurrentMonth}
                          onClick={() => !disabled && isCurrentMonth && handleSelectDate(item.date)}
                          className={cn(
                            'h-9 w-full rounded-lg text-sm font-medium transition-all duration-150',
                            'flex items-center justify-center relative',
                            // Not current month
                            !isCurrentMonth && 'text-slate-300 cursor-default',
                            // Current month normal
                            isCurrentMonth &&
                              !selected &&
                              !disabled &&
                              'text-slate-700 hover:bg-blue-50 hover:text-blue-600',
                            // Selected
                            selected &&
                              'bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-sm shadow-blue-500/30',
                            // Today (not selected)
                            today &&
                              !selected &&
                              isCurrentMonth &&
                              'ring-2 ring-blue-500/30 ring-inset',
                            // Disabled
                            disabled && isCurrentMonth && 'text-slate-300 cursor-not-allowed'
                          )}
                        >
                          {item.day}
                          {today && !selected && isCurrentMonth && (
                            <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-blue-500" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Footer */}
                <div className="px-4 py-3 border-t border-slate-100 flex items-center justify-between bg-slate-50/50">
                  <button
                    type="button"
                    onClick={handleGoToToday}
                    className="text-xs font-medium text-blue-600 hover:text-blue-700 transition-colors"
                  >
                    {language === 'vi' ? 'Hôm nay' : 'Today'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setOpen(false)}
                    className="px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
                  >
                    {language === 'vi' ? 'Đóng' : 'Close'}
                  </button>
                </div>
              </motion.div>
            </Popover.Content>
          </Popover.Portal>
        )}
      </AnimatePresence>
    </Popover.Root>
  );
};

export default DatePicker;
