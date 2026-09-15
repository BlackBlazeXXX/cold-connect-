import React, { useState } from 'react';
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  format,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
  isToday,
} from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from './Button';

export interface ActivityCalendarProps {
  selectedDate: Date | null;
  onDateSelect: (date: Date) => void;
  hasActivity?: (date: Date) => boolean;
}

export const ActivityCalendar: React.FC<ActivityCalendarProps> = ({
  selectedDate,
  onDateSelect,
  hasActivity,
}) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calStart = startOfWeek(monthStart);
  const calEnd = endOfWeek(monthEnd);
  const days = eachDayOfInterval({ start: calStart, end: calEnd });

  const weekdays = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

  return (
    <div className="bg-[#0c0c0c] border border-white/5 rounded-xl p-4">
      <div className="flex items-center justify-between mb-3">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
          leftIcon={<ChevronLeft className="w-3.5 h-3.5" />}
        />
        <span className="text-xs font-semibold text-white">{format(currentMonth, 'MMMM yyyy')}</span>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
          leftIcon={<ChevronRight className="w-3.5 h-3.5" />}
        />
      </div>

      <div className="grid grid-cols-7 gap-1 mb-1">
        {weekdays.map((day) => (
          <div key={day} className="text-center text-[10px] text-zinc-500 font-medium py-1">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {days.map((day) => {
          const inMonth = isSameMonth(day, currentMonth);
          const isSelected = selectedDate && isSameDay(day, selectedDate);
          const today = isToday(day);
          const hasData = hasActivity?.(day);

          return (
            <button
              key={day.toISOString()}
              type="button"
              onClick={() => onDateSelect(day)}
              className={`
                relative w-full aspect-square flex items-center justify-center rounded-lg text-xs font-mono transition-all
                ${!inMonth ? 'text-zinc-700' : 'text-zinc-400 hover:bg-white/5 hover:text-white'}
                ${isSelected ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : ''}
                ${today && !isSelected ? 'border border-white/10 text-white' : ''}
              `}
            >
              {format(day, 'd')}
              {hasData && inMonth && (
                <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-emerald-400" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};