# Dual Calendar Support (BS/AD) Implementation Guide

This document outlines where dates are used in the codebase and how to implement dual calendar support (Bikram Sambat / Gregorian).

## Overview

The application now supports both **BS (Bikram Sambat)** and **AD (Gregorian)** calendar formats. Users can:
- View dates in either format
- Input dates in either format
- See both formats simultaneously

## Date Utility Functions

### Admin Frontend (`frontend/admin/src/utils/dateUtils.ts`)
### User Frontend (`frontend/user/src/utils/dateUtils.js`)

Available functions:
- `convertADToBS(adDate)` - Convert AD date to BS
- `convertBSToAD(bsYear, bsMonth, bsDay)` - Convert BS date to AD
- `formatBSDate(date, format)` - Format as BS date
- `formatADDate(date, format)` - Format as AD date
- `formatDualDate(date, calendarType, showBoth)` - Show both formats
- `parseDate(dateString, calendarType)` - Parse date string
- `getCurrentDualDate()` - Get current date in both formats

## Date Usage Locations

### 1. **User Model** (`backend/model/userModel.js`)
Date fields:
- `dob` - Date of birth
- `serviceStartDate` - Service start date
- `serviceRetirementDate` - Service retirement date
- `dateOfFillUp` - Form fill-up date

**Status**: Stored as strings, need dual format support in forms

### 2. **Events** (`backend/model/eventModel.js`)
Date fields:
- `date` - Event date
- `time` - Event time

**Status**: Used in multiple places, needs dual format support

### 3. **Gallery** (`backend/model/galleryModel.js`)
Date fields:
- `date` - Gallery post date

**Status**: Display only, needs dual format display

### 4. **Committee Members** (`backend/model/committeeModel.js`)
Date fields:
- `startDate` - Committee start date
- `endDate` - Committee end date

**Status**: Used in AllCommittees.jsx, needs dual format

### 5. **Admin Dashboard** (`frontend/admin/src/pages/Dashboard.tsx`)
- Event dates displayed
- Calendar component (currently Gregorian only)

**Action Required**: Update to show both formats

### 6. **Admin Events Page** (`frontend/admin/src/pages/Events.tsx`)
- Date input for creating/editing events
- Date display in event list

**Action Required**: Add calendar type selector and dual format display

### 7. **User Events Page** (`frontend/user/src/pages/Events.jsx`)
- Event date display
- Date filtering

**Action Required**: Add dual format display

### 8. **User Membership Form** (`frontend/user/src/pages/Membership.jsx`)
- Date inputs: dob, serviceStartDate, serviceRetirementDate, dateOfFillUp
- Uses react-datepicker

**Action Required**: Add BS calendar option to date picker

### 9. **NepaliCalendar Component** (`frontend/admin/src/components/NepaliCalendar.tsx`)
- Currently shows Gregorian calendar
- Should show actual Nepali calendar

**Action Required**: Implement true Nepali calendar view

### 10. **User Profile** (`frontend/user/src/pages/profile.jsx`)
- Displays user dates (dob, service dates, etc.)

**Action Required**: Add dual format display

### 11. **AllCommittees** (`frontend/user/src/pages/AllCommittees.jsx`)
- Displays committee tenure dates

**Action Required**: Add dual format display

## Implementation Steps

### Step 1: Install Dependencies
```bash
# User frontend (already added to package.json)
cd frontend/user
npm install nepali-date-converter

# Admin frontend (already installed)
# nepali-date-converter is already in package.json
```

### Step 2: Create Calendar Type Context/State
Create a context or use localStorage to store user's preferred calendar type:

```typescript
// frontend/admin/src/context/CalendarContext.tsx
// frontend/user/src/context/CalendarContext.jsx
```

### Step 3: Update Date Inputs
For forms with date inputs:
1. Add calendar type toggle (BS/AD)
2. Update date picker to support BS dates
3. Convert dates before saving to backend

### Step 4: Update Date Displays
For all date displays:
1. Use `formatDualDate()` to show both formats
2. Or show format based on user preference
3. Add toggle to switch between formats

### Step 5: Update Calendar Component
The NepaliCalendar component should:
1. Show actual Nepali calendar months
2. Display both BS and AD dates
3. Allow navigation in both calendars

## Example Implementations

### Example 1: Dual Format Date Display
```jsx
import { formatDualDate } from '../utils/dateUtils';

// In component
<div>
  Event Date: {formatDualDate(event.date, 'AD', true)}
  {/* Shows: "2024-04-15 (2081-01-02 BS)" */}
</div>
```

### Example 2: Calendar Type Selector
```jsx
const [calendarType, setCalendarType] = useState('AD');

<select value={calendarType} onChange={(e) => setCalendarType(e.target.value)}>
  <option value="AD">Gregorian (AD)</option>
  <option value="BS">Bikram Sambat (BS)</option>
</select>
```

### Example 3: Date Input with BS Support
```jsx
import { parseDate, formatBSDate, formatADDate } from '../utils/dateUtils';

const [date, setDate] = useState(null);
const [calendarType, setCalendarType] = useState('AD');

// Display current date in selected format
const displayDate = date 
  ? (calendarType === 'BS' ? formatBSDate(date) : formatADDate(date))
  : '';

// Parse input based on calendar type
const handleDateChange = (value) => {
  const parsed = parseDate(value, calendarType);
  setDate(parsed);
};
```

## Files That Need Updates

### High Priority
1. `frontend/user/src/pages/Membership.jsx` - Date inputs
2. `frontend/admin/src/pages/Events.tsx` - Event date input/display
3. `frontend/admin/src/components/NepaliCalendar.tsx` - True Nepali calendar
4. `frontend/user/src/pages/Events.jsx` - Event date display
5. `frontend/user/src/pages/profile.jsx` - User date display

### Medium Priority
6. `frontend/admin/src/pages/Dashboard.tsx` - Event dates
7. `frontend/user/src/pages/AllCommittees.jsx` - Committee dates
8. `frontend/user/src/pages/Gallery.jsx` - Gallery dates

### Low Priority
9. `frontend/admin/src/pages/Members.tsx` - Member date display
10. `frontend/admin/src/pages/Committee.tsx` - Committee date inputs

## Backend Considerations

### Current State
- Dates are stored as **strings** in MongoDB
- No validation for date format
- Backend doesn't need changes (dates stored as strings)

### Recommendations
1. Keep storing dates as strings (ISO format: YYYY-MM-DD)
2. Frontend handles conversion between BS and AD
3. Backend can accept dates in either format and convert to ISO

## Testing Checklist

- [ ] Date inputs accept both BS and AD formats
- [ ] Date displays show both formats (or user preference)
- [ ] Calendar component shows Nepali calendar correctly
- [ ] Date conversions are accurate
- [ ] Form submissions work with both formats
- [ ] Date filtering works with both formats
- [ ] User preference is saved and persisted

## Notes

- **nepali-date-converter** package is required for BS date conversion
- Dates should be stored in ISO format (YYYY-MM-DD) in the backend
- Frontend handles all BS/AD conversions
- User preference for calendar type can be stored in localStorage or user profile

