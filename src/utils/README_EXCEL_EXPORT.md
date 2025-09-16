# Excel Export Functionality

This directory contains utilities for exporting attendance data to Excel format.

## Files

### `excelExport.js`

- **Main export utility** - Exports data as CSV format (compatible with Excel)
- **No external dependencies** required
- **Immediate download** functionality
- **Comprehensive data** including all attendance fields

### `excelExportAdvanced.js`

- **Advanced export utility** - Exports data as proper XLSX format
- **Requires `xlsx` library** - Install with `npm install xlsx`
- **Better formatting** with column widths and proper Excel structure
- **Currently disabled** - Uncomment code to use

## Usage

### Basic CSV Export (Current Implementation)

```javascript
import { exportAttendanceToExcel } from "./utils/excelExport";

// Export attendance data
exportAttendanceToExcel(attendanceData, selectedDate);
```

### Advanced XLSX Export (Optional)

```javascript
import { exportAttendanceToXLSX } from "./utils/excelExportAdvanced";

// Export to proper Excel format
exportAttendanceToXLSX(attendanceData, selectedDate);
```

## Features

### CSV Export (Current)

- ✅ **No dependencies** - Works out of the box
- ✅ **Excel compatible** - Opens in Excel, Google Sheets, etc.
- ✅ **Comprehensive data** - All attendance fields included
- ✅ **Proper formatting** - Times, durations, locations formatted correctly
- ✅ **Loading states** - Shows progress during export
- ✅ **Error handling** - Graceful error handling with user feedback

### XLSX Export (Optional)

- ✅ **Native Excel format** - True .xlsx files
- ✅ **Better formatting** - Column widths, proper data types
- ✅ **Multiple sheets** - Can create multiple worksheets
- ✅ **Advanced features** - Formulas, formatting, etc.

## Data Included in Export

1. **Employee Information**

   - Employee Name
   - Email
   - Position

2. **Time Tracking**

   - Clock In Time
   - Clock Out Time
   - Total Hours
   - Overtime Hours

3. **Status Information**

   - Status (checked-in, checked-out, etc.)
   - Approval Status
   - Is Late / Late By
   - Is Early Out / Early Out By

4. **Location Information**

   - Full address or coordinates
   - Work Description

5. **Metadata**
   - Report Date
   - Export timestamp

## Integration

The export functionality is integrated into the AttendanceHeader component:

```javascript
<AttendanceHeader
  attendanceData={attendanceData}
  selectedDate={selectedDate}
  onExportSuccess={handleExportSuccess}
  onExportError={handleExportError}
/>
```

## File Naming

Exported files are named with the following pattern:

- CSV: `attendance-report-YYYY-MM-DD.csv`
- XLSX: `attendance-report-YYYY-MM-DD.xlsx`

## Error Handling

- **No data**: Shows error if no attendance data available
- **Export failure**: Shows error message if export fails
- **Loading states**: Shows loading spinner during export
- **Success feedback**: Shows success message when export completes

## Future Enhancements

1. **Filtered exports** - Export only filtered/searched data
2. **Date range exports** - Export data for date ranges
3. **Custom templates** - Predefined Excel templates
4. **Scheduled exports** - Automatic daily/weekly exports
5. **Email integration** - Send exports via email
