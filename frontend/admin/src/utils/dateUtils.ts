import * as NepaliDateConverterModule from 'nepali-date-converter';

const NepaliDateConverterClass: any =
  (NepaliDateConverterModule as any)?.NepaliDateConverter ??
  (NepaliDateConverterModule as any)?.default?.NepaliDateConverter ??
  (NepaliDateConverterModule as any)?.default ??
  NepaliDateConverterModule;

export type CalendarType = 'BS' | 'AD';

/**
 * Convert AD (Gregorian) date to BS (Bikram Sambat) date
 */
export const convertADToBS = (adDate: Date | string): { year: number; month: number; day: number } => {
  const date = typeof adDate === 'string' ? new Date(adDate) : adDate;
  const converter = new NepaliDateConverterClass(date);
  const bsDate = converter.getBS();
  return {
    year: bsDate.year,
    month: bsDate.month,
    day: bsDate.day,
  };
};

/**
 * Convert BS (Bikram Sambat) date to AD (Gregorian) date
 */
const ensureDate = (value: any): Date => {
  if (value instanceof Date) {
    return value;
  }
  if (value && typeof value === 'object') {
    const year = Number(value.year);
    const month = Number(value.month);
    const day = Number(value.day);
    if ([year, month, day].every((part) => !Number.isNaN(part))) {
      return new Date(year, month - 1, day);
    }
  }
  throw new Error('Invalid date returned from NepaliDateConverter');
};

export const convertBSToAD = (bsYear: number, bsMonth: number, bsDay: number): Date => {
  const converter = new NepaliDateConverterClass(bsYear, bsMonth, bsDay);
  return ensureDate(converter.getAD());
};

/**
 * Format date in BS format (e.g., "2081 Baisakh 15")
 */
export const formatBSDate = (adDate: Date | string, format: 'short' | 'long' = 'short'): string => {
  const date = typeof adDate === 'string' ? new Date(adDate) : adDate;
  const converter = new NepaliDateConverterClass(date);
  const bsDate = converter.getBS();
  
  const nepaliMonths = [
    'Baisakh', 'Jestha', 'Ashadh', 'Shrawan', 'Bhadra', 'Ashwin',
    'Kartik', 'Mangsir', 'Poush', 'Magh', 'Falgun', 'Chaitra'
  ];
  
  const monthName = nepaliMonths[bsDate.month - 1];
  
  if (format === 'long') {
    return `${bsDate.year} ${monthName} ${bsDate.day}`;
  }
  return `${bsDate.year}/${bsDate.month}/${bsDate.day}`;
};

/**
 * Format date in AD format (e.g., "2024 April 15")
 */
export const formatADDate = (date: Date | string, format: 'short' | 'long' = 'short'): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  
  if (format === 'long') {
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    return `${d.getFullYear()} ${months[d.getMonth()]} ${d.getDate()}`;
  }
  
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * Format date in both BS and AD formats
 */
export const formatDualDate = (
  date: Date | string,
  calendarType: CalendarType = 'AD',
  showBoth: boolean = true
): string => {
  const adDate = typeof date === 'string' ? new Date(date) : date;
  const adFormatted = formatADDate(adDate, 'short');
  const bsFormatted = formatBSDate(adDate, 'short');
  
  if (!showBoth) {
    return calendarType === 'BS' ? bsFormatted : adFormatted;
  }
  
  return `${adFormatted} (${bsFormatted} BS)`;
};

/**
 * Parse date string (supports both AD and BS formats)
 */
export const parseDate = (dateString: string, calendarType: CalendarType = 'AD'): Date | null => {
  if (!dateString) return null;
  
  if (calendarType === 'AD') {
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? null : date;
  } else {
    // BS format: YYYY/MM/DD or YYYY-MM-DD
    const parts = dateString.split(/[-\/]/).map(Number);
    if (parts.length === 3) {
      try {
        return convertBSToAD(parts[0], parts[1], parts[2]);
      } catch {
        return null;
      }
    }
    return null;
  }
};

/**
 * Get current date in both formats
 */
export const getCurrentDualDate = (): { ad: Date; bs: { year: number; month: number; day: number } } => {
  const now = new Date();
  return {
    ad: now,
    bs: convertADToBS(now),
  };
};
