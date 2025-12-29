// Date utility functions for dual calendar support (BS/AD)
// Requires: npm install nepali-date-converter
import * as NepaliDateConverterModule from 'nepali-date-converter';

const NepaliDateConverter =
  NepaliDateConverterModule?.NepaliDateConverter ||
  NepaliDateConverterModule?.default?.NepaliDateConverter ||
  NepaliDateConverterModule?.default ||
  NepaliDateConverterModule;

/**
 * Convert AD (Gregorian) date to BS (Bikram Sambat) date
 * @param {Date|string} adDate - AD date to convert
 * @returns {Object|null} {year, month, day} in BS or null if conversion fails
 */
export const convertADToBS = (adDate) => {
  if (!NepaliDateConverter) {
    return null;
  }
  
  try {
    const date = typeof adDate === 'string' ? new Date(adDate) : adDate;
    if (isNaN(date.getTime())) {
      return null;
    }
    const converter = new NepaliDateConverter(date);
    const bsDate = converter.getBS();
    return {
      year: bsDate.year,
      month: bsDate.month,
      day: bsDate.day,
    };
  } catch (e) {
    console.error('Error converting AD to BS:', e);
    return null;
  }
};

/**
 * Convert BS (Bikram Sambat) date to AD (Gregorian) date
 * @param {number} bsYear - BS year
 * @param {number} bsMonth - BS month (1-12)
 * @param {number} bsDay - BS day
 * @returns {Date|null} AD date or null if conversion fails
 */
const ensureDate = (value) => {
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
  return null;
};

export const convertBSToAD = (bsYear, bsMonth, bsDay) => {
  if (!NepaliDateConverter) {
    return null;
  }
  
  try {
    const converter = new NepaliDateConverter(bsYear, bsMonth, bsDay);
    const adValue = converter.getAD();
    const date = ensureDate(adValue);
    if (!date) {
      throw new Error('Invalid AD date returned from converter');
    }
    return date;
  } catch (e) {
    console.error('Error converting BS to AD:', e);
    return null;
  }
};

/**
 * Format date in BS format
 * @param {Date|string} adDate - AD date to format
 * @param {string} format - 'short' (YYYY/MM/DD) or 'long' (YYYY Month DD)
 * @returns {string} Formatted BS date
 */
export const formatBSDate = (adDate, format = 'short') => {
  const bsDate = convertADToBS(adDate);
  if (!bsDate) {
    // Fallback to AD format if conversion fails
    return formatADDate(adDate, format);
  }
  
  const nepaliMonths = [
    'Baisakh', 'Jestha', 'Ashadh', 'Shrawan', 'Bhadra', 'Ashwin',
    'Kartik', 'Mangsir', 'Poush', 'Magh', 'Falgun', 'Chaitra'
  ];
  
  const monthName = nepaliMonths[bsDate.month - 1];
  
  if (format === 'long') {
    return `${bsDate.year} ${monthName} ${bsDate.day}`;
  }
  return `${bsDate.year}/${String(bsDate.month).padStart(2, '0')}/${String(bsDate.day).padStart(2, '0')}`;
};

/**
 * Format date in AD format
 * @param {Date|string} date - Date to format
 * @param {string} format - 'short' (YYYY-MM-DD) or 'long' (YYYY Month DD)
 * @returns {string} Formatted AD date
 */
export const formatADDate = (date, format = 'short') => {
  const d = typeof date === 'string' ? new Date(date) : date;
  
  if (isNaN(d.getTime())) {
    return '';
  }
  
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
 * @param {Date|string} date - Date to format
 * @param {string} calendarType - 'AD' or 'BS' (primary format)
 * @param {boolean} showBoth - Whether to show both formats
 * @returns {string} Formatted date string
 */
export const formatDualDate = (date, calendarType = 'AD', showBoth = true) => {
  const adDate = typeof date === 'string' ? new Date(date) : date;
  
  if (isNaN(adDate.getTime())) {
    return '';
  }
  
  const adFormatted = formatADDate(adDate, 'short');
  const bsFormatted = formatBSDate(adDate, 'short');
  
  if (!showBoth) {
    return calendarType === 'BS' ? bsFormatted : adFormatted;
  }
  
  return `${adFormatted} (${bsFormatted} BS)`;
};

/**
 * Parse date string (supports both AD and BS formats)
 * @param {string} dateString - Date string to parse
 * @param {string} calendarType - 'AD' or 'BS'
 * @returns {Date|null} Parsed date or null
 */
export const parseDate = (dateString, calendarType = 'AD') => {
  if (!dateString) return null;
  
  if (calendarType === 'AD') {
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? null : date;
  } else {
    // BS format: YYYY/MM/DD or YYYY-MM-DD
    const parts = dateString.split(/[-\/]/).map(Number);
    if (parts.length === 3 && parts.every(p => !isNaN(p))) {
      const adDate = convertBSToAD(parts[0], parts[1], parts[2]);
      return adDate;
    }
    return null;
  }
};

/**
 * Get current date in both formats
 * @returns {Object} {ad: Date, bs: {year, month, day}}
 */
export const getCurrentDualDate = () => {
  const now = new Date();
  return {
    ad: now,
    bs: convertADToBS(now),
  };
};
