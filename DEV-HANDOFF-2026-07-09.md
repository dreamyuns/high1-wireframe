# High1 Admin Wireframe — Developer Handoff (2026-07-09)

**Wireframe version:** v0.9.12
**Live (GitHub Pages):** https://dreamyuns.github.io/high1-wireframe/
**Repo:** `dreamyuns/high1-wireframe` (Public)
**Scope of this handoff:** changes since the previous delivery — (A) Accommodation screens aligned to prototype v0.6, (B) full Ticket/Coupon redesign, (C) policy documents.

> These are **wireframes** (layout, fields, behavior rules, front-end data mapping). Visual design is defined separately in Figma. Every screen has an annotated (CN) panel on the right explaining each element in plain language.

---

## 0. How to read the wireframes

- Open the **index page** (Pages URL). Screens are grouped: Policy Docs / Accommodation / Ticket / Screen Mgmt / Common / Reservation / Reference / Prototype.
- Each screen file (`sXX-*.html`) = left **wireframe** + right **CN annotations**. `CN` numbers on the layout map to the annotation list.
- **Policy docs** (`policy-decisions.html`, `s10-reservation-policy.html`, `ticket-coupon-policy-v0.7.html`) have a left TOC + **KO/EN toggle**.
- **Live prototypes** (`prototypes/admin-prototype`, `prototypes/front-prototype`) are runnable (localStorage-based) references.

---

## A. Accommodation (숙소) — aligned to prototype v0.6

### A-1. Inventory / Rate / Margin — dual ownership (IMPORTANT)
Stock & rate are owned by the **room type**; margin & sell price are owned by the **product**.

| Data | Owner screen | Unit | Notes |
|---|---|---|---|
| Base price (입금가), stock (3 values), sale ON/OFF | **S04-INV** | Room type (`RM_TYP_CD`) | From PMS. Read-only in product screens. |
| Margin (per date), sell price | **S06-B** | Product × date | Editable per row + range bulk. |

- **Stock 3 values:** `OPER_RM_CNT` (total) / `RSV_CNT` (reserved) / **`AVLB_RM_CNT` (available = OPER − RSV, the sold-out trigger)**.
- **Sale ON/OFF** (`closed` / `CLSE_YN`) replaces the old "check-in allowed" concept; managed in S04-INV, read-only in S06.
- **Sync:** one **[Stock·Rate Sync]** entry point, unified in **S04-INV** (removed from S06). Rate source = PMS **API 3** only; API 4 = stock only.

### A-2. Margin model — 2-tier
1. **Margin Master (S11, per `RM_TYP_CD`)** → injects the per-date **default**.
2. **Per-date margin (S06-B)** → per-row override (own / inherited badge); unset dates inherit master; if master unset → **global default = amount 30,000 KRW**.
- `sellPrice = base + floor(amount)` OR `floor(base × (1 + rate/100))`. Rate range **−49…+100 (integer)**, floor, min 0.
- **API 6 `SELL_AMT` = base price (원가), margin NOT included.** Margin is our revenue, kept in our DB only.
- Refund/penalty: penalty rate = API 10 `DLFT_APLY_AMT` ÷ `SELL_AMT`(base); customer penalty = rate × our sell price (round 1 decimal). ※ Actual PMS field name is misspelled **`DLFT`_APLY_AMT** (not DFLT).

### A-3. Cancellation policy
- **PMS-linked products:** API 9 7-tier policy shown **read-only**.
- **Manual products: simple 2-option** — `FREE_N_DAYS` (free cancel N days before) / `NON_REFUNDABLE`. (The former 7-tier manual input is discontinued.)

### A-4. Other confirmed items
- **Multilingual:** foreign-only site. All text fields = **EN (required) / ZH (optional)**; ZH falls back to EN; **no Korean (KO) input**. (`location_detail` is a single language-neutral field.)
- Product type = **ROOM_ONLY** only (PACKAGE removed from the flat product model).
- **Stay period** (`stay_start_date` / `stay_end_date`) is separate from sale period.
- Extra fees = **information-only notes at the property level** (`extra_fee_notes[]{en,zh}`), NOT payment-integrated (removed room `extra_charges` / `extra_bed_*`).
- Room "trait" (객실특징) removed.
- Property code kept as real PMS composite `H-01-1101`.

### A-5. Reference docs (front data mapping)
`data-mapping.html` (REF-1), `front-view-mapping.html` (REF-2, bridge), `front-view-layer.html` (REF-3, place layer), `front-view-rd.html` (REF-4, room detail modal), `pms-integration-guide.html` (REF-5), `s11-margin-policy.html` (REF-6), `front-view-main.html` (REF-7). All aligned to v0.6 keys (`high1_*_v1`), EN/ZH, dual inventory structure.

---

## B. Ticket / Coupon (티켓) — full redesign (policy v0.8, screen v0.9.12)

**Core axis:** `coupon_id` = management axis · `category` = filter/grouping · `level` (adult/child) = option.

### B-1. Coupon number & lifecycle
- **12 digits** = `coupon_id`(3) + `level`(1) + serial(6) + random(2). e.g. `DBO100000157`.
- **Minted at purchase (payment completion), NOT pre-generated.** Spec/product creation does NOT issue coupon numbers.
- **Status (3):** `SOLD` (issued/usable) → `USED` (used on site) ; `CANCELED` (order canceled, SOLD→CANCELED). `USED→SOLD` restore via cancel API.
  - **No `AVAILABLE` row** in the issue list (numbers exist only from purchase = SOLD onward). AVAILABLE is a spec/inventory concept only.
  - **No VOID** feature. Reversal is only via use-cancel (USED→SOLD) or order-cancel (SOLD→CANCELED).
  - `CANCELED` numbers are reusable; `USED` numbers are not.
- **1 coupon = 1 venue.** Buying multiple ticket types → a separate coupon number per type (barcode count = sum of quantities).

### B-2. Coupon API (WE implement the server; High1 calls it)
- **Direction: High1 POS/KIOSK → our server.** No authentication. Response = `BARCODE + RESULT + MSG`.
- Endpoints (spec-doc naming): `hiww_ent_search.jsp` / `hiww_ent_use.jsp` / `hiww_ent_usecancel.jsp` (param `BARCODE`).
- **Response codes:** `DBOK` (ok) / `DBER01` length error / `DBER02` not found / `DBER03` already used / `DBER04` canceled. **`DBER31/32` (date range) NOT emitted** — date validity check is intentionally not implemented (usage period is display-only).

### B-3. Screens
| Screen | Role | Key points |
|---|---|---|
| **S13** Coupon Spec | Register High1 spec via CSV | **Tab A** (upload & spec list) / **Tab B** (upload history, last 50, inline detail). **CSV = 10 KR columns** (see B-4). **S17 pre-validation** (category/product_type must exist in S17, else row fails). Conditional delete (0 linked products AND 0 issued coupons). Visibility ON/OFF cascade. |
| **S14-A** Product list | Products from specs | **coupon_id master-detail** (product master row + level option sub-rows). Columns: base price · margin · sell price. Category path **max 2 depth**. Visibility toggle **requires confirm popup**. 2-condition visibility (spec ON AND product ON). |
| **S14-B** Product master | Basic info + cancel policy | Margin is **read-only** here (shown from S11 ticket tab, per coupon_id). Category dropdown **2-depth** (Ski has product-type; Water Park etc. none). Cancel policy = tiered penalty-rate (≥1 tier required, no no-show fixed row). EN required / ZH optional. |
| **S14-C** Date settings | Open vs date-specified | **Open type is the primary/default** mode; date-specified kept as a feature but currently unused. Usage period display-only. Cutoff. |
| **S15** Order list | Ticket orders | **Order status = 2 only: 결제완료 (Paid) / 취소완료 (Canceled)** — no pending/request state (coupons issued instantly on payment). Columns incl. **order datetime** + **usage status** (unused / partly-used / fully-used, aggregated from linked coupons). Filters: order status, usage status, order date. **Cancel = full only** (no partial). [Detail] → S15-B. |
| **S15-B** Order detail (NEW) | Single order page | Order / customer (nationality; passport NOT collected) / **issued coupons (7 cols: number · name/level · status · base price (hidden from customer) · sell price · usage period · used-at [USED only])** / full-order cancel-refund (auto by policy or manual; no partial) / change history. |
| **S16** Coupon issue status | Coupon-level view | Status 3 (SOLD/USED/CANCELED); stats = issued / used / unused(SOLD). Coupon API info block + response codes. No AVAILABLE, no VOID. |
| **S17** Ticket category | Category tree | **Admin direct registration (add + edit display name/order; NO delete).** **Max 2 depth.** Levels (adult/child) are NOT categories (they are product options). S13 CSV validates against these categories (reverse dependency). |

### B-4. S13 CSV template (10 columns, Korean headers)
`카테고리`(req) · `상품유형`(opt) · `쿠폰코드`(req) · `이용권명`(req) · `레벨`(req) · `쿠폰명`(req) · `입금가`(req) · `할인대상내역`(opt) · `사용시작일`(req, YYYY-MM-DD) · `사용종료일`(req, YYYY-MM-DD).
- Removed vs earlier draft: `ticket_type`, `사용인원`. Added: `이용권명` (spec header id, 1:1 with coupon_id). Base price stays hidden from customers.

### B-5. Ticket margin
- **Per `coupon_id`** (all levels of a coupon_id share the same margin). Set in **S11 → Ticket tab** (pick category as filter → list coupon_ids → set margin). S14-B shows it read-only.
- Proposed storage key: `h1_ticket_margin_master_v1 = { [coupon_id]: {type, value} }` (to be confirmed).

### B-6. Package (RM + CPN) — future
- Package-only coupons have a separate (lower) base price (High1 provides spec).
- Package cancel: OTA must **notify High1 via API** (single-item cancel does not). Mapping/notify APIs are **not yet built (M-03)** — to be agreed after single-item integration.

---

## C. Policy documents (source of truth, KO/EN)
- `policy-decisions.html` — accommodation product policy (terminology, codes, integration mode, margin, cancellation, occupancy, extra-fee notes).
- `s10-reservation-policy.html` — reservation management (states, flows, penalty, S10-A/B/C).
- `ticket-coupon-policy-v0.7.html` — **ticket policy, HTML rendering of the v0.8 source** (architecture, coupon number, spec/CSV, API, states, cancel, margin per coupon_id, admin screens incl. S15-B, glossary). *(Filename says v0.7; content reflects the latest v0.8 decisions.)*

---

## D. Open issues for dev awareness
| # | Item |
|---|---|
| Ticket 신규-3 | Rule for **full-cancel of an order that contains USED coupons** — operations policy TBD. |
| Ticket 신규-4 | Ticket margin storage key name (`h1_ticket_margin_master_v1`) — to confirm. |
| Ticket M-01 | HTTPS/SSL requirement for our coupon API — awaiting High1. |
| Ticket M-02 | API response timeout threshold — awaiting High1. |
| Ticket M-03 | Package mapping / cancel-notify APIs — not built (both sides). |
| Ticket M-04 / M-07 | Our dedicated coupon ID(s) + ski season spec file — awaiting High1 marketing. |
| Accommodation | Occupancy 2-value vs 4-value (base/max vs adult/child split) — confirm with dev; relates to API 6 `STAY_ADLT/CHLD`. |
| Accommodation | `SELL_ITM_AMT` VAT inclusion — awaiting High1 PMS contact. |

---

## E. Multilingual note (applies to both domains)
All admin text fields: **EN required, ZH optional, KO not used** (foreign-only site). Front shows ZH when the viewer is in Chinese, else EN. Some prototype code still uses KO/EN toggles internally — the wireframes/policy represent the target (EN/ZH); prototype alignment is a follow-up.

---

*Change log detail: see `CHANGELOG.md` in the repo (entries v0.9.7 → v0.9.12).*
