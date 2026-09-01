# High1 Project — Update & Clarification (2026-07-20)

**Date:** 2026-07-20  
**To:** Reotrip Development Team  
**From:** High1 (Isaac / Ryan / Jinwoo)  
**Purpose:** Feature changes, bug fix requests, and clarification items

---

## 1. Clarification Needed

### 1-A. Sync Schedule
Our current understanding of the synchronization flow is as follows. Please confirm or correct.

- **Trigger:** Admin manually runs sync once after initial product setup
- **Sync scope:**
  - Basic information sync: property (Place) · room (Room) · product (Product)
  - Inventory & rate sync: room-level inventory count and base price (입금가)
- Please clarify: after the initial manual sync, is there an automatic batch sync? If so, what is the interval?

### 1-B. Domain
Our preferred domain is:

```
www.high1-global.com
```

Please advise on the steps and timeline for domain setup.

### 1-C. Multi-language Support
Please confirm the current state of language support.

- **Default language:** English (EN)
- **Secondary language:** Chinese (ZH)

Let us know if any part of the storefront or admin is not yet covered.

---

## 2. Feature Changes & Removals

### 2-A. Remove: Inventory Alert (Dashboard)
The **inventory alert / low-stock warning feature is not required** for this phase.  
Please remove the inventory alert section from the admin dashboard.

Reference Figma (Dashboard):
https://www.figma.com/design/3ODU5jaQMcM0wANfLEAOsJ/High1_documnet?node-id=290-4887&t=juulSPzBkDXimgRb-1

### 2-B. Remove: Property-Level Margin Management (Common Settings)
The **property-level margin management screen under Common Settings is not needed.**  
Margin will be managed at the **product level, per date** (S06-B daily margin).

Reference Figma (Date-level Margin):
https://www.figma.com/design/3ODU5jaQMcM0wANfLEAOsJ/High1_documnet?node-id=292-5118&t=juulSPzBkDXimgRb-1

---

## 3. Bug Fixes

### 3-A. Stay Dates Reset on Page Navigation
**Issue:** When a guest sets check-in / check-out dates on the storefront and navigates to another page, the dates reset to the default value.  
**Expected behavior:** Selected stay dates should persist across all pages during the same session.

### 3-B. My Profile Button — Hide on My Booking Page
**Issue:** The "My Profile" button is currently visible on the My Booking page.  
**Expected behavior:** Please remove / hide the My Profile button from the My Booking page.

### 3-C. Add a Common Loading Screen on Page Navigation
**Issue:** When navigating between pages, raw text briefly flashes on screen before the page renders, giving the impression of an error.  
**Expected behavior:** Add a shared loading screen (spinner or skeleton) that displays during page transitions for a smooth, professional user experience.

---

## 4. New Feature Request

### 4-A. Notice Board (Announcement Feature)
**Purpose:** Allow High1 staff to share operational notices with guests (e.g., "Room XYZ is currently under renovation").

**Requirements:**
- Accessible from the **My Page menu** on the storefront (as a tab or submenu item)
- Admin: create / edit / delete announcements
- Storefront: guests can view announcements from My Page
- Multi-language: EN required · ZH optional

---

## 5. Figma Design

### 5-A. Overall Design Direction
The Figma designs shared by your team are approved — please proceed with the current design.

### 5-B. Email Template — Add Check-in Location Info
Please add a **property-specific check-in location section** to the email templates.  
We will provide the exact copy (location details per property) in a follow-up message.

---

## 6. FYI — High1 Internal Dev Team Request

For reference, we have requested the following from the High1 internal development team, with a deadline of **Wednesday, July 22**.

- Live PMS environment access credentials and configuration
- Sample products for live testing — approximately **2 products per case**:
  - Refundable (2 products)
  - Non-refundable (2 products)
  - Zero inventory / sold out (2 products)

We will schedule a joint smoke test once these are received.

---

## 7. Ticket / Coupon — Planning Review Request

The Ticket/Coupon domain requires a separate planning review from the development team. Please review the materials below.

### 7-A. Wireframe Review

**Wireframe Hub (Main Index):**
https://dreamyuns.github.io/high1-wireframe/index.html

> Please review the **Ticket / Coupon Management** section.

| Document | Link |
|----------|------|
| Coupon Policy Document | https://dreamyuns.github.io/high1-wireframe/ticket-coupon-policy-v0.12.html |
| Ticket Margin Management (S11) | https://dreamyuns.github.io/high1-wireframe/s11-a-margin-list.html |

**⚠️ Order List / Order Detail — Prototype Not Yet Built:**
- We have not been able to build prototypes for the Ticket Order List (S15-A) and Order Detail (S15-B) screens.
- Since the **Search / Use / UseCancel APIs** need to be built and owned by Reotrip, **we would like to request that Reotrip also handle the screen planning for these pages.**
- If you have any questions or revisions during the planning process, please feel free to reach out at any time.

### 7-C. Barcode Generation Requirement

After a successful payment, the issued coupon number must be **converted into a barcode image** for the customer.  
High1's on-site POS terminals (ski lift, water park, etc.) will scan this barcode to validate entry.

**Requirements:**

- Automatically generate a barcode from the 12-digit coupon number upon payment success
- Customer must be able to view and save the barcode from:
  - Order confirmation email
  - Storefront Order Detail screen (S15-B)
- Barcode format: Standard format readable by POS scanners (Code 128 or equivalent)
- Display: Barcode image + numeric coupon number shown together

---

### 7-B. Prototype & Spec Documents

**🌐 Prototypes**

| | Link |
|-|------|
| Frontend Prototype | https://high1-prototype.netlify.app/front/ |
| Admin Prototype | https://high1-prototype.netlify.app/admin/ |
| Seed Data (Reference) | https://high1-prototype.netlify.app/front/seed-data.html |

**📋 Wireframes & Spec Documents**

| | Link |
|-|------|
| UI/UX Wireframes (Main Hub) | https://dreamyuns.github.io/high1-wireframe/ |
| Accommodation Spec Document (v1.5) | https://github.com/dreamyuns/high1-wireframe/blob/main/High1-OTA-통합개발스펙-숙소-v1.5.md |
| Ticket Spec Document (v1.3) | https://github.com/dreamyuns/high1-wireframe/blob/main/High1-OTA-통합개발스펙-티켓-v1.3.md |

**🔄 Revision History**

| | Link |
|-|------|
| CHANGELOG | https://github.com/dreamyuns/high1-wireframe/blob/main/CHANGELOG.md |

---

*Please reply inline or reach out via email / Slack for any questions.*
