# Calendar Task Carrying Feature

## Overview

This feature implements visual indicators for tasks that are "carried" to today when there are fewer than 3 tasks scheduled for the current day.

## How It Works

### Backend Logic (API)

When the user requests calendar data for a month:

1. The API checks if today has fewer than 3 active tasks
2. If yes, it pulls tasks from the next 5 days to reach a minimum of 3
3. These "carried" tasks are duplicated and shown on both dates with special flags

### Visual Indicators

#### 📌 Carried Tasks (Orange)

Tasks shown on **today** that were originally due on a **future date**:

- **Orange background** (`bg-orange-50`)
- **Orange border** with thick left border (`border-orange-400 border-l-4`)
- **Orange badge** with pin icon: `📌 From [date]`
- **Orange dot** indicator

**Example**: Today is Oct 8, task is due Oct 10 → Shows on Oct 8 with orange highlighting

#### ⚡ Being Carried Tasks (Blue)

Tasks on their **original date** that are **also shown on today**:

- **Blue background** (`bg-blue-50`)
- **Blue dashed border** (`border-blue-400 border-dashed`)
- **Blue badge** with lightning icon: `⚡ Also on [date]`
- **Blue dot** indicator

**Example**: Today is Oct 8, task is due Oct 10 → Shows on Oct 10 with blue highlighting

## API Response Flags

### For Carried Tasks (shown on today)

```json
{
  "_id": "task123",
  "title": "Task from 10th",
  "dueDate": "2025-10-08", // Changed to today
  "originalDueDate": "2025-10-10", // Original date
  "isCarriedTask": true, // 🔑 Key flag
  "displayDate": "2025-10-08",
  "carriedTaskId": "task123_carried"
}
```

### For Original Date Tasks (also on today)

```json
{
  "_id": "task123",
  "title": "Task from 10th",
  "dueDate": "2025-10-10", // Original date
  "isBeingCarriedToToday": true, // 🔑 Key flag
  "carriedToDate": "2025-10-08" // Date it's carried to
}
```

## Frontend Implementation

### Files Modified

1. **Backend**: `crm-api/controllers/calendarController.js`

   - Added task carrying logic
   - Created duplicate entries for carried tasks
   - Added flags to original tasks

2. **Frontend**: `zigzag-crm/src/features/calender/components/CalendarEventItem.jsx`

   - Added visual highlighting for TaskItem
   - Added visual highlighting for SubtaskItem
   - Added badges and color coding
   - Enhanced badges for modal view (larger, more prominent)
   - Added colored rings to project avatars in modal

3. **Modal**: `zigzag-crm/src/features/calender/components/EventsModal.jsx`
   - Already using CalendarEventItem with `showExtraDetails={true}`
   - Automatically displays all highlighting features
   - Enhanced visibility with larger badges and ring indicators

### Visual Design

#### Calendar Grid View (Compact)

```
┌─────────────────────────────────────┐
│ 📌 From Oct 10                      │ ← Small orange badge (9px)
│ ─────────────────────────────────   │
│ 🟠 Task Title            In Progress│ ← Small orange dot + text
└─────────────────────────────────────┘
   ↑ Orange background with thick left border

┌─────────────────────────────────────┐
│ ⚡ Also on Oct 8                    │ ← Small blue badge (9px)
│ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ │
│ 🔵 Task Title            In Progress│ ← Small blue dot + text
└─────────────────────────────────────┘
   ↑ Blue background with dashed border
```

#### Modal View (Detailed)

```
┌─────────────────────────────────────────────┐
│ 📌 Carried from Oct 10                      │ ← Larger badge (10px) with shadow
│ ─────────────────────────────────────────── │
│  ⚪ PROJECT NAME            In Progress     │ ← Project avatar with ring
│ ◉ Task Title                                │ ← Full details with assignees
│   Project: Project Name                     │
│   👤👤                                       │ ← Assignee avatars
└─────────────────────────────────────────────┘
   ↑ Orange background + orange ring on avatar

┌─────────────────────────────────────────────┐
│ ⚡ Also showing on Oct 8                    │ ← Larger badge (10px) with shadow
│ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ │
│  ⚪ PROJECT NAME            In Progress     │ ← Project avatar with ring
│ ◉ Task Title                                │ ← Full details with assignees
│   Project: Project Name                     │
│   👤👤                                       │ ← Assignee avatars
└─────────────────────────────────────────────┘
   ↑ Blue background + blue ring on avatar
```

## Color Scheme

| Element        | Color                    | Usage                          |
| -------------- | ------------------------ | ------------------------------ |
| **Orange**     | `#ff9800`, `orange-500`  | Carried tasks on today         |
| **Blue**       | `#2196f3`, `blue-500`    | Original date tasks            |
| **Background** | `orange-50`, `blue-50`   | Light tint backgrounds         |
| **Borders**    | `orange-400`, `blue-400` | Colored borders                |
| **Ring**       | `orange-300`, `blue-300` | Avatar rings in modal (ring-2) |

## Modal Enhancements

The modal view provides **enhanced visibility** for carried tasks:

### 1. **Larger Badges**

- Calendar grid: `text-[9px]` with `px-1.5 py-0.5`
- Modal view: `text-[10px]` with `px-2 py-1`
- Added `shadow-sm` for depth

### 2. **Colored Avatar Rings**

- Carried tasks: Orange avatar with `ring-2 ring-orange-300`
- Being carried tasks: Blue avatar with `ring-2 ring-blue-300`
- Makes it instantly recognizable in detailed view

### 3. **Better Text Labels**

- Grid: "From Oct 10" / "Also on Oct 8"
- Modal: "Carried from Oct 10" / "Also showing on Oct 8"
- More descriptive for clarity

### 4. **Full Task Details**

When you click on a day, the modal shows:

- Project thumbnails with colored rings
- Full task titles
- Project names
- Status indicators
- Assignee avatars
- All highlighting is preserved and enhanced

## User Experience

### Example Scenario

**Today: October 8th**

1. **User has 1 task on Oct 8**
2. **System needs 2 more tasks** (minimum 3)
3. **System finds 2 tasks on Oct 10**

**Result:**

- **Oct 8 shows 3 tasks:**
  - 1 regular task (normal styling)
  - 2 carried tasks with 📌 orange badges
- **Oct 10 shows 2 tasks:**
  - Both with ⚡ blue badges indicating they're also on Oct 8

## Benefits

1. ✅ **Better Task Visibility**: Users always see at least 3 tasks on today
2. ✅ **Clear Visual Cues**: Orange and blue indicators make it obvious which tasks are carried
3. ✅ **Maintains Context**: Tasks still appear on their original dates
4. ✅ **Improved Planning**: Users can see upcoming tasks earlier
5. ✅ **Consistent with Dashboard**: Same logic as dashboard statistics

## Future Enhancements

- [ ] Add hover tooltip with more details
- [ ] Allow users to configure minimum task count
- [ ] Add animation when tasks are carried
- [ ] Create a legend/help section explaining the colors
- [ ] Add filter to show/hide carried tasks
