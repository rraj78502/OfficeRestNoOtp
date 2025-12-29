import React, { useState } from 'react';
import { format, addMonths, subMonths, getDaysInMonth, startOfMonth, getDay, differenceInCalendarDays } from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CalendarType, convertADToBS, convertBSToAD } from '@/utils/dateUtils';

// Interface for events (matches Dashboard's Event interface)
interface Event {
  _id: string;
  title: string;
  date?: string;
  time?: string;
  location?: string;
  description: string;
  files?: { url: string; type: string }[];
}

// Props interface for NepaliCalendar
interface NepaliCalendarProps {
  events: Event[];
  onDateClick: (date: string) => Promise<void>;
}

const bsMonthNames = [
  'Baisakh',
  'Jestha',
  'Ashadh',
  'Shrawan',
  'Bhadra',
  'Ashwin',
  'Kartik',
  'Mangsir',
  'Poush',
  'Magh',
  'Falgun',
  'Chaitra',
];

const NepaliCalendar: React.FC<NepaliCalendarProps> = ({ events, onDateClick }) => {
  const initialDate = new Date();
  const [calendarType, setCalendarType] = useState<CalendarType>('AD');
  const [currentAdDate, setCurrentAdDate] = useState(initialDate);
  const [currentBsDate, setCurrentBsDate] = useState(() => {
    const bs = convertADToBS(initialDate);
    return { ...bs, day: 1 };
  });

  // Navigation handlers
  const syncBsWithAd = (date: Date) => {
    const bs = convertADToBS(date);
    setCurrentBsDate({ ...bs, day: 1 });
  };

  const syncAdWithBs = (year: number, month: number) => {
    const ad = convertBSToAD(year, month, 1);
    setCurrentAdDate(ad);
  };

  const goToPreviousMonth = () => {
    if (calendarType === 'AD') {
      const newDate = subMonths(currentAdDate, 1);
      setCurrentAdDate(newDate);
      syncBsWithAd(newDate);
    } else {
      setCurrentBsDate((prev) => {
        let month = prev.month - 1;
        let year = prev.year;
        if (month < 1) {
          month = 12;
          year -= 1;
        }
        syncAdWithBs(year, month);
        return { year, month, day: 1 };
      });
    }
  };

  const goToNextMonth = () => {
    if (calendarType === 'AD') {
      const newDate = addMonths(currentAdDate, 1);
      setCurrentAdDate(newDate);
      syncBsWithAd(newDate);
    } else {
      setCurrentBsDate((prev) => {
        let month = prev.month + 1;
        let year = prev.year;
        if (month > 12) {
          month = 1;
          year += 1;
        }
        syncAdWithBs(year, month);
        return { year, month, day: 1 };
      });
    }
  };

  const handleCalendarSwitch = (type: CalendarType) => {
    setCalendarType(type);
    if (type === 'AD') {
      syncAdWithBs(currentBsDate.year, currentBsDate.month);
    } else {
      syncBsWithAd(currentAdDate);
    }
  };

  // Helper to check if a date has events
  const hasEventOnDate = (date: Date) => {
    const formattedDate = format(date, 'yyyy-MM-dd');
    return events.some(
      (event) => event.date && format(new Date(event.date), 'yyyy-MM-dd') === formattedDate
    );
  };

  const getBsMonthDays = (year: number, month: number) => {
    const startAd = convertBSToAD(year, month, 1);
    let nextMonth = month + 1;
    let nextYear = year;
    if (nextMonth > 12) {
      nextMonth = 1;
      nextYear += 1;
    }
    const startNextAd = convertBSToAD(nextYear, nextMonth, 1);
    return differenceInCalendarDays(startNextAd, startAd);
  };

  const renderAdCalendar = () => {
    const calendarDays = [];
    const year = currentAdDate.getFullYear();
    const month = currentAdDate.getMonth();
    const daysInMonth = getDaysInMonth(currentAdDate);
    const firstDayOfMonth = startOfMonth(currentAdDate);
    const startingDay = getDay(firstDayOfMonth);

    for (let i = 0; i < startingDay; i++) {
      calendarDays.push(<div key={`ad-empty-${i}`} className="h-10"></div>);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const currentDay = new Date(year, month, day);
      const isEventDay = hasEventOnDate(currentDay);
      calendarDays.push(
        <div
          key={`ad-${day}`}
          className={`h-12 flex flex-col items-center justify-center cursor-pointer rounded-md ${
            isEventDay ? 'bg-blue-100 text-blue-800 font-semibold' : 'hover:bg-gray-100'
          }`}
          onClick={() => onDateClick(currentDay.toISOString())}
        >
          <span>{day}</span>
          <span className="text-xs text-gray-500">{format(currentDay, 'EEE')}</span>
        </div>
      );
    }
    return calendarDays;
  };

  const renderBsCalendar = () => {
    const calendarDays = [];
    const { year, month } = currentBsDate;
    const firstAdDay = convertBSToAD(year, month, 1);
    const startingDay = getDay(firstAdDay);
    const daysInMonth = getBsMonthDays(year, month);

    for (let i = 0; i < startingDay; i++) {
      calendarDays.push(<div key={`bs-empty-${i}`} className="h-10"></div>);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const adEquivalent = convertBSToAD(year, month, day);
      const isEventDay = hasEventOnDate(adEquivalent);
      calendarDays.push(
        <div
          key={`bs-${day}`}
          className={`h-12 flex flex-col items-center justify-center cursor-pointer rounded-md ${
            isEventDay ? 'bg-blue-100 text-blue-800 font-semibold' : 'hover:bg-gray-100'
          }`}
          onClick={() => onDateClick(adEquivalent.toISOString())}
        >
          <span>{day}</span>
          <span className="text-xs text-gray-500">{format(adEquivalent, 'MMM d')}</span>
        </div>
      );
    }
    return calendarDays;
  };

  const calendarDays = calendarType === 'AD' ? renderAdCalendar() : renderBsCalendar();

  const headerLabel =
    calendarType === 'AD'
      ? format(currentAdDate, 'MMMM yyyy')
      : `${bsMonthNames[currentBsDate.month - 1]} ${currentBsDate.year} BS`;

  return (
    <div className="p-4 border rounded-lg bg-white shadow">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
        <Button variant="outline" size="icon" onClick={goToPreviousMonth}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <h2 className="text-lg font-semibold flex-1 text-center">{headerLabel}</h2>
        <div className="flex items-center gap-2">
          <Button
            variant={calendarType === 'AD' ? 'default' : 'outline'}
            size="sm"
            onClick={() => handleCalendarSwitch('AD')}
          >
            AD
          </Button>
          <Button
            variant={calendarType === 'BS' ? 'default' : 'outline'}
            size="sm"
            onClick={() => handleCalendarSwitch('BS')}
          >
            BS
          </Button>
        </div>
        <Button variant="outline" size="icon" onClick={goToNextMonth}>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
      <div className="grid grid-cols-7 gap-2 text-center">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
          <div key={day} className="font-medium text-gray-700">
            {day}
          </div>
        ))}
        {calendarDays}
      </div>
    </div>
  );
};

export default NepaliCalendar;
