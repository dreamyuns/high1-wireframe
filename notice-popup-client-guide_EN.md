# Notices and Front-End Popup - Functional Guide

| Item | Details |
|------|------|
| Module name | Notice / Announcement · Front-End Popup |
| Audience | Operations, Product, Business Acceptance |
| Status | **Implemented** (MVP), ready for business acceptance |
| Admin path | OP Admin → **Main Management → Notices** |
| Updated | 2026-07-28 |

---

## 1. What This Module Solves

Operations need a way to communicate site-wide updates such as construction notices, operating changes, and policy changes to customers.

This module supports:

1. **Notice board**: Customers can browse the notice list and details from My Page after login.
2. **Front-end popup**: A notice can pop up on selected pages when customers enter them. It can be suppressed for 24 hours.

**Important rule: one notice, two display surfaces.**  
The list and popup share the same title and body. There is no need to maintain them separately. The popup is not a standalone ad system.

---

## 2. Customer Experience

### 2.1 Notice Board (My Page)

| Item | Details |
|------|------|
| Entry point | Website header account menu / **Notices** in My Page |
| List | `/my-page/notices` - title + date; empty state shown when there are no notices |
| Detail | `/my-page/notices/{id}` - full title and body |
| Login | **Login required** to view; unauthenticated users are sent to the login flow |
| Body | Plain text only, line breaks preserved; HTML / rich-text editing is not supported |

### 2.2 Front-End Popup

| Item | Details |
|------|------|
| Login required | Can pop up **without login** |
| Eligible pages | Home page · Accommodation search results · Property detail page (selected by operations) |
| Content | Same title and body as the notice; scrollable |
| Actions | Close · "Do not show again for 24 hours" · "View more" (go to notice detail; unauthenticated users will log in first) |
| Multiple active notices | **Only one popup per page** (the most recently published notice), no stacking |

**Close rules:**

| Action | Effect |
|------|------|
| Close only (24-hour box unchecked) | Do not show again in the current browser session; **may appear again in a new browser session** |
| Close after checking "Do not show again for 24 hours" | Do not show that notice again for about 24 hours |
| Note | Suppression is applied per **notice**, **not per page**. If a user closes it on the home page, the same notice will not reappear on other target pages within the same session |

---

## 3. How Operations Use the Admin

Path: **Main Management → Notices**

Supported actions: create / edit / delete / list view.  
Admin UI language supports **English / Korean**; the **notice content body** follows the language rule described below.

### 3.1 Field Description and Relationships

#### A. Notice Content

| Field | Required | Description |
|------|----------|------|
| Title / Body | **Required** | Notice title and body. This version is maintained as single-language content (see language rules below) |

> **Language alignment for this version (No multi-language)**  
> - This version does **not** provide multilingual notice bodies (not maintained by language column, and not auto-switched by customer language).  
> - Admin content is **defaulted to English** for setup and display.  
> - During OP testing, **Korean or English** may be entered (the field accepts either language; a full multilingual set is not required).  
> - After the full site/module **multilingual development and testing** are complete, the content language strategy and field structure of this module will be updated in a later iteration.

#### B. Publish Settings (controls whether customers can see it)

| Field | Description |
|------|------|
| Published | Master switch. Unchecked = **draft**, visible only in admin; not shown in customer list or popup |
| Start | Effective start time. Empty = no start restriction |
| End | Effective end time. Empty = no end restriction |

**Customer visibility conditions (all must be met):**

- Published is checked
- Current time falls within the Start - End window (an empty side means no restriction)
- Belongs to the current sales channel

| Operational intent | Recommended setting |
|------------------|----------------------|
| Write first, do not publish yet | Do not check Published |
| Publish immediately | Check Published, leave Start / End empty |
| Schedule from a certain date | Check Published, fill in Start |
| Limited-time campaign notice | Check Published, fill in both Start and End |
| Take down immediately | Uncheck Published, or set End to a past time |

The system automatically records the publish time (`published_at`) at the moment of the first publish for sorting; operations do not need to fill it manually.

#### C. Front-End Popup (controls whether it pops up and where)

| Field | Description |
|------|------|
| Enable popup | When enabled, the notice can appear as a popup on selected pages |
| Target pages | Multi-select target pages: Home / Search Results / Property Detail. **At least one page must be selected when popup is enabled** |
| Version | Used to "force the popup to appear again". After a customer closes it, the browser remembers it; if operations increment the version by **+1**, previously dismissed customers can see it again |

**Popup conditions = valid publish + popup configuration:**

- Meets the customer visibility conditions above
- Enable popup is turned on
- The current page is within Target pages
- The customer has not dismissed this notice in the current session / 24-hour suppression state

| Operational intent | Recommended setting |
|------------------|----------------------|
| Notice board only, do not interrupt browsing | Publish normally, **do not** enable popup |
| Strong reminder on home page | Publish + Enable + select Main |
| Reminder on multiple pages | Publish + Enable + select multiple target pages |
| After editing, show again to previously dismissed users | Save the new body, or increment Version by +1 |
| Stop popup but keep the notice in the list | Disable popup only, keep Published |

### 3.2 Sorting Rules (no manual priority)

When multiple notices exist, display order is:

1. **Newer first** by initial publish time
2. If the same, the **more recently modified** one comes first
3. If still the same, the higher system ID comes first

When multiple notices match the popup conditions, only the latest one is shown based on the same rule.  
**This version does not provide a manual Sort order field**, to avoid conflict with the "latest first" strategy.

---

## 4. Typical Use Cases

| Scenario | Publish | Time window | Popup | Target pages |
|------|------|--------|------|--------|
| Internal draft | Off | Any | - | - |
| General policy notice (user checks proactively) | On | Optional | Off | - |
| Home page construction / important alert | On | Optional | On | Home |
| Search + detail synchronized reminder | On | Optional | On | Search + Property Detail |
| Auto take-down after campaign ends | On | Fill End | As needed | As needed |

---

## 5. Scope of This Version and Exclusions

### 5.1 Included in This Version

- OP notice create / read / update / delete and publish window
- C-end My Page notice list / detail (login required)
- Optional front-end popup (three pages, close behavior and 24-hour suppression, single-notice strategy)
- Content language for this version: **No multi-language** (Admin defaults to English; OP testing may use Korean / English; later iteration after multilingual development and testing)
- Data isolation by sales channel

### 5.2 Not Included in This Version (separate request if needed)

| Item | Description |
|----|------|
| Multilingual notice body | This version does not use language columns or auto-switch by language; later iteration after multilingual development and testing |
| Rich text / image HTML | Plain text only to reduce security and editing complexity |
| Standalone "pure ad popup" | Promotional popups that do not appear in the notice list require a separate design |
| Public notice board without login | The list is currently in My Page; there is no separate public unauthenticated notice channel |
| Rotating multiple popups / account-level server-side "once per day" | Suppression is only stored locally in the customer's browser |
| Push notifications / email notices | Belong to other modules |
| Dedicated notice for a specific ticket / package | This version is for site-wide operational notices |
