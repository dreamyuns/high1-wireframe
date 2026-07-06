# High1 Admin Prototype v0.4 — Feature Policy & Function Specification (English)

> **Document Version:** v0.4.0
> **Source Reference:** `admin-prototype-v0.4/` (`index.html`, `app.js`, `styles.css`)
> **Storage:** Browser `localStorage` only. No server API, authentication, or draft-save.
> **Purpose:** Developer-facing specification for admin feature policies and screen definitions.

---

## 1. System Prerequisites & Non-functional Policy

| Item | Policy |
|------|--------|
| Client | Single-page app, hash-based routing `#/…` |
| Auth / Authorization | None (prototype limitation) |
| Language | Korean-centric UI |
| Persistence | All changes immediately written to `localStorage`. No rollback or versioning. |
| Concurrency | Single browser profile only. No cross-tab synchronization. |

### 1.1 Prototype Limitations (to be re-defined before production)

- Images are stored as **file metadata + Data URL** directly in `localStorage`. Production requires upload URL, CDN, size limits, MIME validation, and privacy policies.
- HTML fields with pasted images can significantly increase storage size. A warning UI is shown in image upload areas.
- No authentication or audit trail. `updated_by` is hardcoded to `"admin"` or `"seed"`.

---

## 2. Data Storage Keys and Responsibility

| Key | Constant | Content | Initialized By |
|-----|----------|---------|----------------|
| `high1_places_v1` | `STORAGE_PLACES` | Properties (Places) | Admin user input |
| `high1_facility_categories_v1` | `STORAGE_FACILITY_CATEGORIES` | Facility categories (domain: PLACE \| ROOM) | Auto-seed on app open |
| `high1_facilities_v2` | `STORAGE_FACILITIES` | Facility master data | Auto-seed on app open |
| `high1_room_master_room_type_v1` | `STORAGE_ROOM_TYPES` | Room type master | Auto-seed on app open |
| `high1_room_master_trait_v1` | `STORAGE_ROOM_TRAITS` | Room trait master | Auto-seed on app open |
| `high1_room_master_bed_type_v1` | `STORAGE_BED_TYPES` | Bed type master | Auto-seed on app open |
| `high1_rooms_v1` | `STORAGE_ROOMS` | Rooms (place_id dependent) | Admin user input |
| `high1_products_v1` | `STORAGE_PRODUCTS` | Product master + `inventory[]` | Admin user input |

### 2.1 Master Data Auto-Seed Policy (New in v0.4)

When the admin app opens for the first time, common management master data is automatically initialized.

| Auto-seed Function | Domain | Content | Flag Key |
|-------------------|--------|---------|----------|
| `ensureRoomMasters()` | ROOM | Default room types, traits, bed types | (none — inferred from key existence) |
| `ensureRoomFacilitySeed()` | ROOM | 5 room facility categories + facility list | `high1_room_facility_seed_done_v1` |
| `ensurePlaceFacilitySeed()` | PLACE | 3 place facility categories + facility list | `high1_place_facility_seed_done_v1` |

**`ensurePlaceFacilitySeed()` seed content:**

| Category | Facilities |
|---------|------------|
| 편의시설 (Amenities) | 주차장 (Parking), 컨시어지 (Concierge), 수하물 보관 (Luggage Storage), 세탁 서비스 (Laundry Service) |
| 식음료 (F&B) | 레스토랑 (Restaurant), 바·라운지 (Bar & Lounge), 카페 (Café), 룸서비스 (Room Service) |
| 레저·스포츠 (Leisure & Sports) | 수영장 (Pool), 피트니스센터 (Fitness Center), 스파 (Spa), 스키장 연계 (Ski Slope Access) |

> **Important:** All master data `name` fields are **plain strings** (not `{ ko, en }` multilingual objects). The admin stores and manages Korean-language single strings only.

---

## 3. Menu & Route — Feature Overview

| Menu Group | Screen | Hash | Summary |
|-----------|--------|------|---------|
| Property / Room Mgmt | Property List | `#/places` | List, edit entry, room count, product link count |
| Property / Room Mgmt | Property Create/Edit | `#/places/new`, `#/places/edit/:id` | 5-step wizard |
| Property / Room Mgmt | Room List | `#/rooms`, `#/rooms/place/:placeId` | List, filter by property, create/edit |
| Property / Room Mgmt | Product List | `#/products`, `#/products/place/:placeId` | List, create/edit, inventory |
| Product | Product Create/Edit | `#/products/new`, `#/products/edit/:id` | Master info + inventory management |
| Common Mgmt | Place Facility Categories | `#/categories/place` | CRUD for place facility categories |
| Common Mgmt | Room Facility Categories | `#/categories/room` | CRUD for room facility categories |
| Common Mgmt | Place Facilities | `#/facilities/place` | Place facility master CRUD |
| Common Mgmt | Room Facilities | `#/facilities/room` | Room facility master CRUD |
| Common Mgmt | Room Type Management | `#/room-masters` | Room types, traits, bed types CRUD |

---

## 4. Business & Screen Policy

### 4.1 Visibility Policy

- Places / Rooms: `visibility` — `SHOW` / `HIDE`
- Products: `visibility` — `Y` (visible) / `N` (hidden)

### 4.2 Property Image Policy

- **1 representative image required** (wizard validation: `image_meta.length >= 1`)
- Up to 9 additional images
- Max file size: `PLACE_IMAGE_MAX_MB (2MB)` — rejected if exceeded
- Storage format: `{ name, size, type, data_url }` object array in `image_meta`
- On Quota exceeded: redirect to step 3 (Images) + warning block + `#wiz_err` summary

### 4.3 Room Image Policy

- Same pattern as property: 1 hero + up to 9 additional
- **No required validation for representative image** (backward compatibility)

### 4.4 Room Extra Charges & Extra Bed Policy

| Field | Description |
|-------|-------------|
| `occupant_extra_charge_enabled` | Enables per-person extra charge |
| `occupant_extra_charge_per_person` | Fee per person above standard occupancy |
| `occupant_extra_charge_settlement` | Settlement timing code |
| `extra_bed_enabled` | Enables extra bed option |
| `extra_bed_max_count` | Max number of extra beds |
| `extra_bed_fee` | Fee per extra bed |
| `extra_bed_settlement` | Settlement timing code |

**Settlement timing codes:**

| Code | Display Meaning |
|------|-----------------|
| `AT_BOOKING` | Charged at booking / payment |
| `ON_SITE` | Charged on-site |

### 4.5 Facility & Featured Facility Policy (Place & Room)

- Applied facilities: `facility_ids`
- Featured facilities: `featured_facility_ids` — subset of `facility_ids`, max 10
- Category picker: check "Apply" then optionally mark "Featured". Unchecking Apply also removes Featured.
- Auto-merge to `state` on: category switch, checkbox change, wizard step navigation, and save

### 4.6 Auto Room Name Fill

"Fill room name from masters": combines selected room type, traits, bed type, and bed count to overwrite the room name field.

### 4.7 Product Policy

#### 4.7.1 Product Master Fields

| Field | Policy |
|-------|--------|
| Room | Required (`room_id` → room `id`) |
| Product type | `ROOM_ONLY` \| `PACKAGE` |
| Product name | Required |
| Visibility | `Y` / `N` |
| Sale period | Start date ~ End date (end date inclusive) |
| Sale status | Not a separate field — derived from visibility + stock + `checkin_allowed` + cutoff + sale period |
| Cancellation policy | `FREE_N_DAYS` (free cancellation until N days before check-in) \| `NON_REFUNDABLE` |

#### 4.7.2 Inventory Fields (Per-date, per 1 night)

| Field | Description |
|-------|-------------|
| `date` | YYYY-MM-DD (check-in date) |
| `price` | Sale price |
| `stock` | Inventory count |
| `checkin_allowed` | Y: this date can be booked as check-in / N: blocked |
| `min_stay_nights` | Minimum nights (default: 1) |
| `max_stay_nights` | Maximum nights (default: 30) |
| `cutoff_days_before_checkin` | Booking blocked from N days before check-in (today 00:00 KST) |

#### 4.7.3 Booking Availability (`book_ok`)

All of the following must be true:

1. Product `visibility = Y`
2. Today is within sale period `[start_date, end_date]`
3. `stock >= 1`
4. `checkin_allowed = Y`
5. Cutoff not yet reached (today < check-in date − C days)

---

## 5. Feature Definition — Per Screen

### 5.1 Property List (`#/places`)

| ID | Requirement |
|----|-------------|
| PL-LIST-01 | Sort by `updated_at` descending |
| PL-LIST-02 | Columns: property code, name, primary category, sub, visibility, check-in/out, room count (link), product link count, updated at, updated by, edit button |
| PL-LIST-03 | Room count click → `#/rooms/place/:placeId` |
| PL-LIST-04 | Product count click → `#/products/place/:placeId` |

### 5.2 Property Create/Edit Wizard

| ID | Requirement |
|----|-------------|
| PL-WIZ-01 | 5 steps: ① Category & Basic & Operations ② Location ③ Images ④ Guide & Policy ⑤ Facilities |
| PL-WIZ-02 | No draft save. Save button visible at all steps. |
| PL-WIZ-03 | On save: sync current step fields then validate all steps |
| PL-WIZ-04 | On save at step 5: facility picker DOM merge runs first |

### 5.3 Room List (`#/rooms`)

| ID | Requirement |
|----|-------------|
| RM-LIST-01 | Property filter select: All / specific property |
| RM-LIST-02 | Columns: room code, property, room name, standard/max occupancy, extra bed Y/N, occupant charge Y/N, product link count, updated at, edit |

### 5.4 Room Create/Edit Form

| ID | Requirement |
|----|-------------|
| RM-FORM-01 | Required: property, ≥1 room type, ≥1 bed type (count ≥1), room name, max occupancy ≥ standard |
| RM-FORM-02 | Room code auto-generated (`RM-####`), read-only on edit |
| RM-FORM-03 | Facility picker: ROOM domain categories, max 10 featured |
| RM-FORM-04 | Extra charge fields: disabled when toggle is off |
| RM-FORM-05 | Images: upload hero + additional, delete individually, Quota warning on bottom of card |
| RM-FORM-06 | On save success: navigate to `#/rooms/place/:place_id` |

### 5.5 Product Management (`#/products`)

| ID | Requirement |
|----|-------------|
| PR-LIST-01 | Columns: product code (auto `PR-####`), property, room, type, name, visibility, sale period, cancel summary, inventory row count, updated at, edit/delete |
| PR-FORM-01 | Tab 1 = product master + cancel policy / Tab 2 = bulk range + daily inventory |
| PR-FORM-02 | Daily view: list mode (table edit) / monthly calendar (cell select → right panel edit) |
| PR-FORM-03 | DOM → state merge before tab switch or cancel type change (preserves input) |
| PR-FORM-04 | Validate no duplicate dates on save |

### 5.6 Common Management (Categories & Facilities)

| ID | Requirement |
|----|-------------|
| CM-CAT-01 | Category domain PLACE \| ROOM, separate code schemes (`plc#####` / `rmc#####`) |
| CM-FAC-01 | Facility list and form split by domain path (`#/facilities/place`, `…/room`) |
| CM-AUTO-01 | On app init: `ensurePlaceFacilitySeed()` + `ensureRoomFacilitySeed()` auto-run |

### 5.7 Room Type Management (`#/room-masters`)

| ID | Requirement |
|----|-------------|
| RM-MST-01 | Tabs: Room Types / Room Traits / Bed Types |
| RM-MST-02 | On empty storage: `ensureRoomMasters()` generates seed data automatically |

---

## 6. Error & Message Policy

| Situation | Handling |
|-----------|---------|
| Missing required field | Single-line message identifying step and field |
| Image file size exceeded | Rejection message including filename |
| localStorage Quota exceeded | Warning at image block + global error area summary |
| Featured facilities exceed 10 | Apply/save halted with count shown |

---

## 7. Entity Field Summary

### 7.1 Place (`high1_places_v1`)

```
id, place_code, place_name, place_name_en, category(HOTEL|CONDO),
sub_place, visibility(SHOW|HIDE), check_in_time, check_out_time,
address, location_detail, image_meta[], guide_html, policy_html,
facility_ids[], featured_facility_ids[], updated_at, updated_by
```

### 7.2 Room (`high1_rooms_v1`)

```
id, room_code, place_id, room_name, room_type_ids[], trait_ids[],
bed_rows[{bed_type_id, count}], standard_occupancy, max_occupancy,
room_size_sqm, visibility(SHOW|HIDE), image_meta[], guide_html, policy_html,
facility_ids[], featured_facility_ids[],
extra_bed_enabled, extra_bed_max_count, extra_bed_fee, extra_bed_settlement,
occupant_extra_charge_enabled, occupant_extra_charge_per_person,
occupant_extra_charge_settlement, updated_at, updated_by
```

### 7.3 Product (`high1_products_v1`)

```
id, product_code, room_id, product_type(ROOM_ONLY|PACKAGE),
name, description, guide_policy_html, visibility(Y|N),
sale_start_date, sale_end_date,
cancel_policy_type(FREE_N_DAYS|NON_REFUNDABLE), cancel_free_days_before,
inventory[{date, price, stock, checkin_allowed, min_stay_nights,
           max_stay_nights, cutoff_days_before_checkin}],
created_at, updated_at, updated_by
```

### 7.4 FacilityCategory (`high1_facility_categories_v1`)

```
id, domain(PLACE|ROOM), code(plc##### | rmc#####),
name (plain string — Korean), pictogram_meta[], visible, updatedAt
```

### 7.5 Facility (`high1_facilities_v2`)

```
id, code, name (plain string — Korean), category_id, visible, updatedAt
```

---

## 8. Future Tasks

| Task | Description |
|------|-------------|
| Authentication & Audit | Login, role-based field access, auto-populated updated_by |
| Image Architecture | Upload pipeline, CDN, thumbnails, deletion permissions |
| Multilingual Master Data | Support `{ ko, en }` structure for facility names / categories |
| Front-end `book_ok` integration | Apply §4.7.3 matrix to actual booking flow |

---

## 9. Change History

| Date | Version | Changes |
|------|---------|---------|
| 2026-05-15 | v0.2.0~v0.2.7 | Initial admin implementation (places, rooms, products, common management) |
| 2026-05-19 | v0.4.0 | Added `ensurePlaceFacilitySeed()` — auto-seeds place facility categories (Amenities, F&B, Leisure & Sports). Confirmed plain string policy for all master data name fields. |

---

*This document is based on `admin-prototype-v0.4/` source. Update alongside any code changes.*
