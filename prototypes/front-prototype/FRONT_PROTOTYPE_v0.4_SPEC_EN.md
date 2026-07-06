# High1 Front Prototype v0.4 — Feature Specification (English)

> **Document Version:** v0.4.0
> **Source Reference:** `front-prototype_v0.4/` (`index.html`, `app.js`, `styles.css`)
> **Storage:** `localStorage` read-only (shares identical keys with `admin-prototype-v0.4`). No backend API.
> **Purpose:** Developer-facing specification for front-end screen structure, features, and business logic.

---

## 1. File Structure

| File | Role |
|------|------|
| `index.html` | Shell layout: top bar, `#app` main area, place layer (`#placeLayer`), Room Detail modal (`#roomDetailModal`), backdrops |
| `styles.css` | Full design system: colors, typography, layout, cards, layer, modal, responsive breakpoints |
| `app.js` | Routing, data loading, rendering, search, pricing, availability evaluation, layer and modal control |

---

## 2. Routing (Hash)

| Hash | Screen |
|------|--------|
| `#/` or `#` | Home: HOTEL / CONDO category cards |
| `#/bridge/HOTEL` | Hotel bridge page |
| `#/bridge/CONDO` | Condo bridge page |

On `hashchange`, only the `#app` main area is re-rendered. The place layer and Room Detail modal are separate DOM elements, synchronized after `render()`.

---

## 3. Data Sources (`localStorage`, shared with admin)

Read-only access to the following keys:

| Key | Purpose |
|-----|---------|
| `high1_places_v1` | Properties (places) |
| `high1_facility_categories_v1` | Facility categories |
| `high1_facilities_v2` | Facility master data |
| `high1_rooms_v1` | Rooms |
| `high1_products_v1` | Products |
| `high1_room_master_room_type_v1` | Room type master |
| `high1_room_master_bed_type_v1` | Bed type master (for interpreting `bed_rows`) |

Front-end only key (not shared with admin):

| Key | Purpose |
|-----|---------|
| `high1_front_v02_lang` | UI language: `"ko"` / `"en"` (default: ko) |

---

## 4. Internationalization (i18n)

- UI strings: `I18N.ko` / `I18N.en` objects, accessed via `t(key)` function
- Language toggle: KO / EN buttons in the top bar. Selection persisted to `high1_front_v02_lang`
- Data field localization: `localizeField(obj, keyBase)` function
  - If value is a `{ ko, en }` object, returns current language
  - On English: falls back to legacy `field_en` suffix
- Sub-area labels (`SUBS.HOTEL`, `SUBS.CONDO`): multilingual `{ ko, en }` object support

---

## 5. Home Screen (`#/`)

- Two category cards: HOTEL / CONDO
- Each card: category name, visible property count (`hotelCount`), "Explore" → `#/bridge/{CATEGORY}`
- No visible properties: shows empty state message

---

## 6. Bridge Page (`#/bridge/HOTEL` | `#/bridge/CONDO`)

### 6.1 Page Structure Order

```
[Place Selector Tab Bar]
[Full-width Hero Image]
[Sticky Navigation Tab Bar]
[Content Wrapper]
  └─ [Overview Section]
  └─ [Rooms Section]
```

### 6.2 Place Selector Tab Bar (`.place-selector`)

- Lists all `visibility !== "HIDE"` places in the category, sorted by `updated_at` descending
- Clicking a tab switches the selected place and re-renders the hero and content
- Selected state persisted in `uiState.selectedPlaceByCategory[category]`

### 6.3 Full-width Hero (`.hero-fullwidth`)

- Displays the first image from the selected place's `image_meta` at full width
- **Carousel**: If 2+ images exist, shows left (`‹`) / right (`›`) arrow buttons. Click cycles through images.
- **Overlay**: Place name, sub-area name, "Place Info ↗" button
  - "Place Info ↗" click → opens place layer (Guide tab)

### 6.4 Sticky Navigation Tab Bar (`.place-nav`)

Remains fixed at the top during page scroll.

| Tab | Action |
|-----|--------|
| Overview | Smooth scroll to `#sec-overview` |
| Rooms | Smooth scroll to `#sec-rooms` |
| Detail | Open place layer (Guide tab) |
| Policies | Open place layer (Policy tab) |
| Location | Open place layer (Location tab) |

The clicked tab receives the `active` class. Scroll-position-based auto-activation is not implemented in v0.4.

### 6.5 Overview Section (`#sec-overview`)

- Check-in / Check-out times
- Featured facility chips (from `featured_facility_ids` → facility names)

### 6.6 Rooms Section (`#sec-rooms`)

- Section heading "Rooms"
- **Search bar**: Check-in date input, Check-out date input, "Search" button
- On "Search" click: saves dates to `uiState`, triggers full re-render
- Product card grid (3-column layout)

---

## 7. Product Cards (`.product-card`)

### 7.1 Card Layout (3 Columns)

| Area | Content |
|------|---------|
| Thumbnail (`.pc-thumb`) | Room image with prev/next navigation if multiple images |
| Content (`.pc-content`) | Sub-area label, room name, product name, bed info, occupancy, featured facility chips, cancel line, product description |
| Price Panel (`.pc-price-panel`) | "Enter dates" hint or member rate or unavailability reason + Room Detail button + Select Rooms button |

### 7.2 Thumbnail

- Displays valid images from `room.image_meta` (must have `data_url`)
- "No Image" placeholder when no images
- 2+ images: prev (`‹`) / next (`›`) buttons. Click updates `uiState.cardImgIdx[product.id]` and re-renders

### 7.3 Content Detail

| Element | Source |
|---------|--------|
| Sub-area label | `place.sub_place` → localized label from `SUBS` array |
| Room name | `room.room_name` |
| Product name | `product.name` |
| Bed info | `room.bed_rows` → bed type master name + count |
| Occupancy | `room.standard_occupancy` / `room.max_occupancy` |
| Featured facility chips | `room.featured_facility_ids` → facility names |
| Cancellation line | Result of `cancelSummaryLine()` |
| Product description | `product.description` (only if non-empty) |

### 7.4 Price Panel

| State | Display |
|-------|---------|
| No dates entered | Hint message ("Select check-in and check-out to see prices and availability.") |
| `ok` | "Member Rate" label + total price (multi-night sum, KRW format) |
| Any unavailable state | Unavailability reason text |

Select Rooms button: **active** only when `state === "ok"`. Otherwise renders as `disabled`.

Room Detail button: always clickable. Opens Room Detail modal.

### 7.5 Card ID

`id="pcard-{product.id}"` — used by the Room Detail modal's "Select Room" button as a scroll target.

---

## 8. Place Layer (`#placeLayer`)

### 8.1 Open / Close

- Open: hero "Place Info ↗" button, or navigation tabs Detail / Policies / Location
- Close: ✕ button, backdrop click

### 8.2 Layer Structure

- Title: selected place name
- **3 Tabs**:

| Tab ID | Label (KO / EN) | Content |
|--------|----------------|---------|
| `detail` | 안내정보 / Guide | Place guide HTML (`guide_html`) + divider + facility list grouped by category (`facility_ids`) |
| `policy` | 정책정보 / Policy | Place policy HTML (`policy_html`) |
| `location` | 장소정보 / Location | Address (`address`) + location detail (`location_detail`) |

### 8.3 Facility Group Rendering

`groupedFacilitiesHtml(facilityIds, maps)`:
- Groups `facility_ids` by their facility category
- Renders category name + facility name list for each group

### 8.4 Multilingual Content

All text fields rendered through `localizeField()` or `richTextOrParagraph()` for current language.

---

## 9. Room Detail Modal (`#roomDetailModal`)

### 9.1 Open / Close

- Open: product card "Room Detail →" button
- Close: ✕ button, backdrop click

### 9.2 Header

- Room name (`room.room_name`)
- Product name (`product.name`)
- ✕ Close button

### 9.3 Body — Gallery (Left, `.rd-gallery`)

Displays up to 5 valid images from `room.image_meta` in a CSS **grid**:
- No images: "No Image" placeholder
- `rd-gallery-grid` class: CSS grid layout (first image full-width, remaining in 2-column grid)

### 9.4 Body — Right Sidebar (`.rd-aside`)

#### ① Information (Fixed Area)

Always displayed. `<ul class="rd-info">` with 3 items:

| Label | Value |
|-------|-------|
| 인원 (Occupancy) | Standard N / Max N |
| 크기 (Size) | `room_size_sqm`㎡ |
| 침대 (Bed) | `bed_rows` → bed type master name + count |

#### ② Section Navigation Tabs (Sticky, `.rd-sections-nav`)

Only generates buttons for sections that have data. First button gets `active` class by default.
On click: `scrollIntoView({ behavior: "smooth" })` to the target section.

#### ③ 4 Conditional Sections (inside `.rd-services`)

| Order | Section ID | Section Name | Show Condition |
|-------|------------|--------------|----------------|
| ① | `rd-sec-product` | 상품안내/정책 (Product Guide/Policy) | `product.guide_policy_html` is non-empty |
| ② | `rd-sec-room-policy` | 객실정책 (Room Policy) | `room.policy_html` is non-empty, OR `extra_bed_enabled === true`, OR `occupant_extra_charge_enabled === true` |
| ③ | `rd-sec-room-guide` | 객실안내 (Room Guide) | `room.guide_html` is non-empty |
| ④ | `rd-sec-facilities` | 객실시설정보 (Room Facilities) | `room.facility_ids.length > 0` |

**Room Policy Section (②) — Detailed Structure:**

```
[room.policy_html content]
[rd-extra-charges block] (only when extra_bed_enabled OR occupant_extra_charge_enabled)
  ├─ [Occupant Extra Charge card] (occupant_extra_charge_enabled === true)
  │   ├─ Per person fee: formatWon(occupant_extra_charge_per_person)
  │   └─ Settlement: settlementLabel(occupant_extra_charge_settlement)
  └─ [Extra Bed card] (extra_bed_enabled === true)
      ├─ Per bed fee: formatWon(extra_bed_fee)
      └─ Settlement: settlementLabel(extra_bed_settlement)
```

**`settlementLabel()` mapping:**

| Code | Display (Korean) | Meaning |
|------|-----------------|---------|
| `AT_BOOKING` | 예약 시 결제 | Charged at booking / payment |
| `ON_SITE` | 현장 결제 | Charged on-site |

### 9.5 Footer

"Select Room" button: on click, closes modal and scrolls to `#pcard-{product.id}`.

---

## 10. Search, Nights, and Pricing (Business Logic)

### 10.1 Valid Date Condition

- Both check-in and check-out in `YYYY-MM-DD` format
- Check-in < check-out (same day not allowed)

### 10.2 Today's Date

`todayKstYmd()`: uses `Intl.DateTimeFormat` with **Asia/Seoul** timezone to get the current calendar date.

### 10.3 Stay Nights Array

`stayNightsYmd(checkin, checkout)`: returns an array of dates in `[checkin, checkout)` (checkout date excluded).

### 10.4 Sale Period Validation

`product.sale_start_date` ~ `sale_end_date` (end date inclusive). If today is outside range → `sale_out`.

### 10.5 Per-Night Inventory Evaluation (`evaluateProductForStay`)

Checks each night in order:

| Condition | State | Display |
|-----------|-------|---------|
| Missing / invalid dates | `bad_dates` | "Please check check-in and check-out dates." |
| Outside sale period | `sale_out` | "Outside sale period" |
| No inventory row for date | `no_inv` | "Not available (missing rate)" |
| `checkin_allowed` = false/N | `closed` | "Not available (check-in not allowed)" |
| Cutoff reached | `cutoff` | "Not available (cutoff)" |
| Stock ≤ 0 | `soldout` | "Fully booked" |
| All nights pass | `ok` | Total price (sum of each night's `price`) |

### 10.6 Cutoff Logic

`cutoff_days_before_checkin` = C (C=0 means no cutoff).
`blockStart = stay night − C days`. If `todayStr >= blockStart` → cutoff reached.

### 10.7 Price Formatting (`formatWon`)

- Korean: `N,NNN원`
- English: `₩N,NNN`

---

## 11. Cancellation Policy Summary (`cancelSummaryLine`)

| Condition | Display |
|-----------|---------|
| `NON_REFUNDABLE` or no policy | "취소 및 환불불가" (Non-refundable) |
| `FREE_N_DAYS` + N days | Last free cancellation date (`checkin − N − 1 day`) `23:59까지 무료취소 가능` |
| Last free date already passed | "취소 및 환불불가" |

---

## 12. Property & Product Filter Policy

### 12.1 Place Visibility

- `place.category` = current category (`HOTEL` / `CONDO`)
- `place.visibility !== "HIDE"`
- Sort: `updated_at` descending

### 12.2 Product Visibility (`productsForPlace`)

Room conditions:
- `room.place_id === selected place ID`
- `room.visibility !== "HIDE"`

Product conditions:
- `product.room_id` is in the qualified room set
- `product.visibility !== "N"`

### 12.3 Sub-area Tab Order

Follows `SUBS.HOTEL` / `SUBS.CONDO` array order. Only shows sub-areas that exist in actual data.

---

## 13. Out of Scope — Not Implemented in v0.4

- Actual booking, payment, or user authentication
- Scroll-position-based auto-activation of navigation tabs
- Front-end validation of `min_stay_nights` / `max_stay_nights`
- SEO and accessibility (focus trapping, screen reader labels) — minimal only

---

## 14. Key CSS Classes

| Class | Description |
|-------|-------------|
| `.place-selector` | Place selector tab bar (dark background) |
| `.hero-fullwidth` | Full-width hero image wrapper |
| `.hero-overlay` | Text overlay on hero image |
| `.hero-arrow` | Hero carousel arrow buttons |
| `.place-nav` | Sticky navigation tab bar |
| `.place-nav-btn` | Navigation tab button (`.active` state styled separately) |
| `.content-wrap` | Content sections wrapper |
| `.sec-overview` | Overview section |
| `.sec-rooms` | Rooms section |
| `.product-card` | Product card (3-column grid item) |
| `.pc-thumb` | Card thumbnail area |
| `.pc-content` | Card content area |
| `.pc-price-panel` | Card price and button panel |
| `.btn-room-detail` | Room Detail button |
| `.btn-cta` | Main CTA button (Book, Explore, etc.) |
| `.layer` | Place layer slide panel |
| `.layer-tabs` | Layer tab list |
| `.rd-modal` | Room Detail modal (hidden with `.hidden`) |
| `.rd-gallery-grid` | Modal gallery CSS grid |
| `.rd-sections-nav` | Modal right sidebar section navigation (sticky) |
| `.rd-sec-nav-btn` | Section navigation button (`.active` state) |
| `.rd-sec` | Individual section block |
| `.rd-extra-charges` | Extra charge cards wrapper |
| `.rd-extra-charge-item` | Individual extra charge card |
| `.backdrop` | Layer and modal backdrop overlay |

---

## 15. Related Documents

| Document | Role |
|----------|------|
| `admin-prototype-v0.4_ADMIN_POLICY_AND_FUNCTION_SPEC_EN.md` | Admin feature policy, entity schemas, booking availability matrix |
| `FRONT_PROTOTYPE_v0.4_SPEC_KO.md` | Korean version of this document |

---

*Document Version: v0.4.0 | Source: `front-prototype_v0.4/`*
