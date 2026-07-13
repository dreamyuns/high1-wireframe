# High1 Admin Wireframe — Developer Handoff (2026-07-10)

**Scope:** what changed since the previous handoff (`DEV-HANDOFF-2026-07-09.md`, v0.9.12).
**Wireframe set:** v0.9.12 → **v0.9.20**. **Ticket policy:** v0.8 → **v0.12**.
**Live:** https://dreamyuns.github.io/high1-wireframe/ (open `index.html`; each card links a screen).
**Source of truth for ticket rules:** `ticket-coupon-policy-v0.12.html` (left TOC, KO/EN toggle). This doc is a delta summary — the policy HTML is authoritative.

> Read this together with the 2026-07-09 handoff. Items below **supersede** the older doc where they conflict (esp. ticket margin, S17, S14 content).

---

## 0. TL;DR — biggest changes for implementation

1. **Ticket margin model changed** → category master (1st/2nd depth) + coupon-ID override, 4-tier priority. (was: per-coupon-ID single value)
2. **Content ownership split (A-plan)** → the **category (S17)** owns display content (hero, overview, detail, guide, policy, location); the **product (S14)** owns only the **thumbnail**. Per-product hero/detail tabs are removed.
3. **S17 moved** from 공통관리(Common) to **티켓관리(Ticket) GNB, top of LNB**, renamed "카테고리/컨텐츠 관리 (Category/Content)", and split into list (S17) + content editor (S17-B).
4. **New screen S18-A** email-template management (accommodation + ticket, 5 tabs).
5. **New screen S12-D** ticket recommendation section (main-page).
6. **Image storage** = upload to storage, **store URL only** (no base64). Prototype uses Cloudinary; production must implement **signed** upload.
7. **Front ticket screens reuse accommodation components** (search result / bridge / detail modal / main recommendation).

---

## 1. Ticket coupon state & order model (policy §5, §8, §9)

- **Coupon states: 3 only — `SOLD` / `USED` / `CANCELED`.** No `AVAILABLE`, no `VOID`.
  - Coupon number is generated **at purchase** (payment complete) and starts as `SOLD`. There is no pre-sale row.
- **Order status: 2 — `결제완료 (Paid)` / `취소완료 (Canceled)`.** No pending (PG payment issues coupons immediately).
- **Usage status (order-level aggregate): 3 — 미사용 / 일부사용 / 사용완료** (all SOLD / some USED / all USED). Independent filter from order status. (S15)
- **Cancellation = full order only** (partial cancel/refund abolished).
- **Open-type cancellation basis = use-period end date** (`use_end_date`): before end & unused (SOLD) → full refund; after end → no refund; USED → no refund. Use-date tiers on S14-B are kept only as a setting for a future switch to date-specific. (policy §8.2)
- Coupon API (WE implement the server, High1 calls it): `hiww_ent_search / use / usecancel`. Response codes `DBOK / DBER01(digits) / DBER02(not found) / DBER03(already used) / DBER04(canceled)`.

## 2. Ticket margin (policy §11) — REPLACES 2026-07-09 "per-coupon-ID" model

- Structure = **Category master + coupon-ID override**:
  - Set a **master margin** on a category (1st depth) or product-type (2nd depth). Coupon-IDs under it **inherit** it.
  - Override a specific coupon-ID individually when needed.
- **Priority (highest first): coupon-ID override > 2nd-depth master > 1st-depth master > global default (30,000 KRW fixed amount).**
- One coupon-ID's margin applies to **all its levels** (adult/child). Level is not a margin unit.
- Margin rate range **-49% ~ +100% (integers only)**, result **floored**. Amount type has no lower bound.
- **S11 screen (`s11-a-margin-list.html`)** = single inline screen with **[Accommodation] / [Ticket] tabs** (S11-B detail form abolished).
  - Ticket tab = **list UI** (like accommodation): a "category master margin" bar (category filter + type/value + apply) + a single coupon-ID table (columns: coupon-ID / category / pass name / inherited·override badge / margin type / value / sample selling price / override toggle).
- Storage key: `h1_ticket_margin_master_v1 = { categories: {...}, overrides: {...} }` (schema to be finalized — open issue).
- **S13 → S11 auto-linkage (policy §11.8):** on CSV upload, coupon-IDs are auto-reflected into the S11 ticket list. New = row added (inherited). Existing with changed category/product-type and **inherited** margin → recalculated against the new master, with a warning: *"N coupon-IDs had their category changed; inherited margins were recalculated."* Overridden coupon-IDs are unaffected.
- **S14-B shows margin read-only** (inherited from S11). No per-level margin editing on S14-B.

## 3. Ticket product (S14) — content redefined (policy §12.3)

- **S14 = 2 tabs:** S14-B master (basic info + margin read-only + cancellation) / S14-C date settings.
- **S14-B owns:** sale options (level·deposit), linked spec, **sales period**, **thumbnail**, exposure toggle. **No** per-product hero/sub-image/detail tabs (removed — content lives on the category, §12.6).
  - **Thumbnail**: representative image for list / search / bridge card / main recommendation (first image = representative). Stored as URL.
  - **Sales period** (`sale_start_date` / `sale_end_date`, both optional): start empty = sell immediately; end empty = toggle-only; past end date's midnight → auto-hidden on front. **Hide condition is OR**: (1) past sales-end (auto) (2) exposure toggle OFF (3) linked spec toggle OFF (cascade 🔒).
- **S14-C date:** open-type is the primary mode (date-specific kept but unused). **Cutoff is date-specific only** — for open-type the cutoff input is disabled (open-type has no use date).

## 4. Content ownership (A-plan) + S17 relocation (policy §12.1, §12.6)

- **Category (depth) owns content**, product owns only thumbnail. The category's content maps to the **front ticket bridge**.
- **S17 owns 6 content blocks per leaf depth:** hero image (URL) / overview / detail / usage guide / notice·policy / location. Text blocks are **EN required, ZH optional**.
- **S17 relocated** to Ticket GNB, LNB top; renamed **"카테고리/컨텐츠 관리"**. Two screens:
  - `s17-ticket-category.html` — list (card = 1st depth, row = 2nd depth). Each **leaf** depth has a **[Content] button** (2nd-depth row if children exist, else the 1st-depth header).
  - `s17-b-ticket-content.html` — content editor. Text blocks use a **rich editor** (bold / heading / list / image-upload / Ctrl+V paste).
- **NOTE (policy vs screen mismatch):** policy HTML §12.1 still lists S17 under **Common(공통관리)**; the wireframes place it under **Ticket(티켓관리)** per the prototype. The prototype is the standard; policy `.md` will be synced later.

## 5. Order management (S15 / S15-B)

- **S15 list:** order status (2) + usage status + order date column + filters (order status / usage status / order date). Cancel = full only. `[Detail]` → S15-B.
- **S15-B detail:** issued-coupon table = **7 columns** — coupon no. / coupon name·level / status / **deposit (hidden on front)** / **selling price** / use period / **used-at**. (added deposit·selling·used-at for settlement)

## 6. Email template management (S18-A, NEW — policy §12.7)

- Under **화면관리(Screen) LNB**. Manages emails by **send-type tabs (5):** ① Accommodation reservation-confirmed ② Accommodation waiting-notice (manual-only) ③ Accommodation cancel-complete ④ Ticket purchase-complete ⑤ Ticket cancel-complete *(pending — send-or-not undecided)*.
- Editable per tab = guidance text **EN required / ZH optional**. System auto-insert fields (reservation no., barcode, product name, etc.) are **not editable**.
- **Ticket purchase-complete tab only:** adds usage-guide + cancel/refund text with **per-category (1st depth) override**.
- **Front linkage:** only **Accommodation reservation-confirmed** and **Ticket purchase-complete** tabs also render on the front reservation/order detail. Other tabs are email-only.
- File: `s18-a-email-template.html`.

## 7. Main page management (S12) — recommendation section type

- **S12-A** recommendation list now has a **type column (Accommodation / Ticket)** and split buttons **[+ Accommodation section] / [+ Ticket section]**.
- **S12-D (NEW, `s12-d-ticket-section.html`)** ticket recommendation form (separate from accommodation S12-C): title·subtitle·exposure period·"view all" button + **selection mode auto (category filter + sort: lowest-price / name) or manual (pick products)**. Card = thumbnail·name·lowest price; click → category bridge.
  - ⚠️ Flag: prototype uses **KO/EN** for S12 titles, which conflicts with the global rule (admin text = EN required / ZH optional, no KO). To be reconciled.

## 8. Front ticket screens (REF docs — front data mapping)

Ticket front reuses accommodation components. Ticket mapping sections were **added** to existing REF docs:
- `front-view-search.html` (REF-8): ticket search result reuses `.product-card` + left filters. **Capacity info** on card (adult·child available / adult-only e.g. Gondola). **Use-date default = today + 7 days** (§13).
- `front-view-mapping.html` (REF-2): ticket **bridge** reuses accommodation components (2-depth dark bar, 460px hero, sticky nav: overview/select/detail/guide/policy/location). Product card footer: **"Total N tickets, ₩NN — Add"**, footer block right 50%, [Detail]:[Add] = 3:7.
- `front-view-rd.html` (REF-4): ticket **detail modal simplified** — top image & description removed → **use period + option prices table only**.
- `front-view-main.html` (REF-7): ticket recommendation section = **horizontal card strip**, click → category bridge.

## 9. Image storage policy (NEW — policy §14)

- **All admin image uploads: auto-resize → upload to storage → store URL only.** Base64 inline storage is forbidden.
- **Prototype:** Cloudinary (unsigned upload). **Production:** implement **server-signed upload** (dev to build). Applies to: category hero (S17), product thumbnail (S14), accommodation images (S02-3), room images (S04).

## 10. Front ticket search policy (NEW — policy §13)

- Ticket search-bar **use-date default = today + 7 days**. Result shows only tickets sellable & usable on that date: exposure ON **AND** spec toggle ON **AND** within sales period **AND** within use period.
- Open-type: shown if use-date within use period. Date-specific: shown if that date has quota > 0 and cutoff not passed.

## 11. Wireframe layout fix (non-functional)

- `.two-col` (wireframe + annotation panel) changed to `minmax(0,1.55fr) minmax(0,1fr)` and collapses to 1 column ≤900px — fixes right-panel clipping at narrow widths. No spec impact.

---

## 12. Open issues for dev awareness

| # | Item | Note |
|---|---|---|
| New-4 | Ticket margin storage-key schema (`h1_ticket_margin_master_v1`) | categories/overrides shape to be confirmed |
| New-5 | Ticket cancel-complete email — send or not | affects S18-A tab ⑤ |
| M-08 | Levels beyond adult/child (youth etc.) | spec-dependent |
| — | Deposit vs actual High1 settlement when date-level deposit is adjusted | peak season may be a separate coupon code |
| — | S12 title language KO/EN vs global EN/ZH rule | reconcile |

## 13. Reference

- Policy (KO/EN, authoritative): `ticket-coupon-policy-v0.12.html`
- Index of all screens: `index.html`
- Accommodation dual-ownership / margin / cancellation: see previous handoff `DEV-HANDOFF-2026-07-09.md` (still valid for accommodation).
- Multilingual rule: admin text fields = **EN required / ZH optional**, no Korean (foreigner-only site). ZH empty → falls back to EN.
