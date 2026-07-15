# High1 Admin — Additional Feature Development Request (Accommodation Live Scope)

**Date:** 2026-07-15
**Purpose:** Request for planning, wireframe design, and development of additional admin features required for the accommodation service live launch.
**Scope:** Accommodation-related features only. Ticket-related features will be requested separately at a later date.
**Planning owner:** Development team (full planning and screen design expected from the development team side).

---

## 1. Member Management

### Purpose
Provide admin-side visibility into foreign customer accounts.

### Requirements

Member list view
- Columns: name, email, nationality, registration date, number of accommodation bookings
- Keyword search: name or email
- Filters: nationality, registration date range
- Sort: by registration date, by booking count

Member detail view
- Basic info: name, email, nationality, registration date
- Accommodation booking history: booking number, room name, check-in / check-out date, booking status, payment amount

Member data is read-only. No direct edit functionality is required in the admin.

---

## 2. Email Template Management

### Purpose
Allow administrators to edit the body copy of emails that are automatically sent to customers.

### Requirements

GNB: Screen Management (화면관리)
LNB: Email Template Management (이메일 템플릿 관리)

Tab structure — accommodation (3 tabs)
- Tab 1: Booking Confirmed — sent when an accommodation booking is confirmed
- Tab 2: Booking Pending Notice — sent to inform the customer of a pending status before manual booking is processed (manual booking only)
- Tab 3: Booking Canceled — sent when an accommodation booking is canceled

Editable fields (common across tabs)
- Body copy EN (English, required)
- Body copy ZH (Chinese, optional; falls back to EN if not entered)

Non-editable fields (system auto-inserted)
- Booking number, guest name, check-in / check-out date, room name, payment amount, and other booking data are inserted automatically by the system and must not be editable by the administrator.

Delivery channels
- Automatic email delivery: triggered automatically when each event occurs
- Front-end booking detail page: the same body copy is displayed on the customer-facing booking detail screen

---

## 3. Admin Account Management

### Purpose
Create and manage administrator accounts that have access to the admin system.

### Requirements

Account list view
- Columns: name, email, permission level, account status (active / inactive), last login date

Account management functions
- Create new account
- Edit account info (name, email, permission level)
- Deactivate account (deactivate instead of delete)
- Reset password

Permission levels (2-tier)
- Master: full access to all menus, including the ability to create and manage other admin accounts
- Sub: restricted menu access; specific accessible menus to be defined separately at a later stage

---

## 4. Dashboard

### Purpose
Provide a main screen that gives administrators an at-a-glance view of key operational metrics.

### Requirements

Booking overview (period selector: Today / This Week / This Month)
- New booking count
- Booking count by status: confirmed, pending, canceled
- Recent booking list: latest N bookings, click to navigate to booking detail

Revenue statistics (period selector: Daily / Weekly / Monthly)
- Total revenue for the selected period
- Revenue breakdown by room type
- Period-over-period change (vs. previous month / week / day)

Inventory status
- Alert display for rooms with low remaining inventory (below threshold)
- Proposed threshold value is expected from the development team

---

## Notes

All technical stack decisions and integration approach should follow existing admin development specs.
Screen designs (wireframes) for each feature are to be proposed by the development team.
Proposed wireframes will be reviewed and confirmed by our team before development begins.
