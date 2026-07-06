/**
 * High1 Front Bridge v0.5
 * - admin-prototype localStorage와 동일 키 사용 (읽기 전용)
 * - 비즈니스 로직(evaluateProductForStay, cancelSummaryLine 등) 유지
 * - 렌더링 구조 전면 개선: 풀와이드 히어로 · 스티키 내비 탭 · 3컬럼 카드
 */

/* ─── Storage keys ─── */
const STORAGE_PLACES     = "high1_places_v1";
const STORAGE_FACILITY_CATEGORIES = "high1_facility_categories_v1";
const STORAGE_FACILITIES = "high1_facilities_v2";
const STORAGE_ROOMS      = "high1_rooms_v1";
const STORAGE_PRODUCTS   = "high1_products_v1";
const STORAGE_ROOM_TYPES = "high1_room_master_room_type_v1";
const STORAGE_BED_TYPES  = "high1_room_master_bed_type_v1";

const PRODUCT_CANCEL_POLICY = {
  FREE_N_DAYS:    "FREE_N_DAYS",
  NON_REFUNDABLE: "NON_REFUNDABLE",
};

/* 서브 구역 순서 정의 */
const SUBS = {
  HOTEL: [
    { value: "grand_main",       label: { ko: "그랜드 메인",      en: "Grand Main" } },
    { value: "grand_convention", label: { ko: "그랜드 컨벤션",    en: "Grand Convention" } },
    { value: "palace",           label: { ko: "팰리스",           en: "Palace" } },
  ],
  CONDO: [
    { value: "valley",   label: { ko: "밸리",   en: "Valley" } },
    { value: "hill",     label: { ko: "힐",     en: "Hill" } },
    { value: "mountain", label: { ko: "마운틴", en: "Mountain" } },
  ],
};

const CATEGORY_LABEL = {
  HOTEL: { ko: "호텔", en: "Hotel" },
  CONDO: { ko: "콘도", en: "Condo" },
};

/* ─── i18n ─── */
const I18N = {
  ko: {
    homeTitle: "high1 resort",
    homeDesc: "숙소 정보 및 상품을 확인하고 예약하세요.",
    open: "둘러보기",
    noVisibleData: "노출 가능한 숙소가 없습니다.",
    noData: "데이터가 없습니다.",
    backHome: "홈으로",
    select: "선택",
    openLayer: "숙소 안내 ↗",
    checkinOut: "체크인 / 체크아웃",
    featured: "대표 시설",
    noFeatured: "대표 시설 없음",
    tabDetail: "안내정보",
    tabPolicy: "정책정보",
    tabLocation: "장소정보",
    navOverview: "Overview",
    navRooms: "Rooms",
    navDetail: "Detail",
    navPolicies: "Policies",
    navLocation: "Location",
    guideTitle: "숙소 안내",
    noGuide: "안내 없음",
    facilityTitle: "숙소 시설",
    noFacility: "시설 없음",
    policyTitle: "정책 안내",
    noPolicy: "정책 없음",
    locationTitle: "위치",
    address: "주소",
    noLocation: "위치 상세 없음",
    searchCheckin: "체크인",
    searchCheckout: "퇴실일",
    searchApply: "검색",
    searchNeedCheckout: "체크인·퇴실일을 선택하면 가격과 예약 가능 여부를 확인할 수 있습니다.",
    productListTitle: "Rooms",
    noProductsPlace: "이 숙소에 노출된 상품이 없습니다.",
    noProductsSearch: "해당 날짜에 예약 가능한 상품이 없습니다. 다른 날짜로 검색해 보세요.",
    roomDetail: "Room Detail →",
    selectRoom: "Select Rooms",
    memberRate: "회원가",
    saleClosed: "판매 기간 외",
    noInv: "예약 불가 (일자 요금 없음)",
    closed: "예약 불가 (체크인 불가)",
    cutoff: "예약 불가 (컷오프)",
    soldout: "예약마감",
    badDates: "체크인·퇴실일을 확인해 주세요.",
    hotelCount: "{count}개 숙소",
  },
  en: {
    homeTitle: "high1 resort",
    homeDesc: "Find and book your perfect stay.",
    open: "Explore",
    noVisibleData: "No visible places.",
    noData: "No data.",
    backHome: "Home",
    select: "Select",
    openLayer: "Place Info ↗",
    checkinOut: "Check-in / Check-out",
    featured: "Featured",
    noFeatured: "No featured facilities",
    tabDetail: "Guide",
    tabPolicy: "Policy",
    tabLocation: "Location",
    navOverview: "Overview",
    navRooms: "Rooms",
    navDetail: "Detail",
    navPolicies: "Policies",
    navLocation: "Location",
    guideTitle: "Guide",
    noGuide: "No guide",
    facilityTitle: "Facilities",
    noFacility: "No facilities",
    policyTitle: "Policy",
    noPolicy: "No policy",
    locationTitle: "Location",
    address: "Address",
    noLocation: "No location detail",
    searchCheckin: "Check-in",
    searchCheckout: "Check-out",
    searchApply: "Search",
    searchNeedCheckout: "Select check-in and check-out to see prices and availability.",
    productListTitle: "Rooms",
    noProductsPlace: "No visible products for this property.",
    noProductsSearch: "No available rooms for the selected dates. Try different dates.",
    roomDetail: "Room Detail →",
    selectRoom: "Select Rooms",
    memberRate: "Member Rate",
    saleClosed: "Outside sale period",
    noInv: "Not available (missing rate)",
    closed: "Not available (check-in not allowed)",
    cutoff: "Not available (cutoff)",
    soldout: "Fully booked",
    badDates: "Please check check-in and check-out dates.",
    hotelCount: "{count} properties",
  },
};

/* ─── UI state ─── */
const uiState = {
  selectedPlaceByCategory: {},   // category -> placeId (v0.3: flat place selection)
  heroIndexByPlace: {},
  lang: localStorage.getItem("high1_front_v02_lang") === "en" ? "en" : "ko",
  searchCheckin: "",
  searchCheckout: "",
  cardImgIdx: {},
  placeLayer: { open: false, placeId: "", tab: "detail" },
  roomDetail: { open: false, productId: "" },
};

/* ─── i18n helpers ─── */
function t(key, vars = {}) {
  const dict = I18N[uiState.lang] || I18N.ko;
  let msg = dict[key] || I18N.ko[key] || key;
  Object.entries(vars).forEach(([k, v]) => { msg = msg.replace(`{${k}}`, String(v)); });
  return msg;
}

function localizeField(obj, keyBase) {
  if (!obj) return "";
  const v = obj[keyBase];
  if (v && typeof v === "object" && !Array.isArray(v)) return v[uiState.lang] || v.ko || v.en || "";
  if (uiState.lang === "en") {
    const legacy = obj[`${keyBase}_en`];
    if (legacy) return legacy;
  }
  return v || "";
}

/* ─── Utility ─── */
function loadJson(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch { return fallback; }
}

function escapeHtml(v) {
  return String(v ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function parseHash() {
  const h = (location.hash || "#/").replace(/^#\//, "");
  const parts = h.split("/");
  return { path: h, parts };
}

function todayKstYmd() {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Seoul",
    year: "numeric", month: "2-digit", day: "2-digit",
  }).formatToParts(new Date());
  const y = parts.find((p) => p.type === "year")?.value;
  const m = parts.find((p) => p.type === "month")?.value;
  const d = parts.find((p) => p.type === "day")?.value;
  return `${y}-${m}-${d}`;
}

function parseYmd(s) {
  const m = String(s).match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!m) return null;
  return new Date(parseInt(m[1], 10), parseInt(m[2], 10) - 1, parseInt(m[3], 10));
}

function ymdFromDate(d) {
  const y = d.getFullYear();
  const mo = String(d.getMonth() + 1).padStart(2, "0");
  const da = String(d.getDate()).padStart(2, "0");
  return `${y}-${mo}-${da}`;
}

function addCalendarDaysYmd(ymd, delta) {
  const d = parseYmd(ymd);
  if (!d) return null;
  d.setDate(d.getDate() + delta);
  return ymdFromDate(d);
}

function stayNightsYmd(checkin, checkout) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(checkin) || !/^\d{4}-\d{2}-\d{2}$/.test(checkout)) return [];
  const out = [];
  let cur = checkin;
  let guard = 0;
  while (cur < checkout) {
    out.push(cur);
    cur = addCalendarDaysYmd(cur, 1);
    if (!cur || ++guard > 400) break;
  }
  return out;
}

/* ─── Data helpers ─── */
function visiblePlacesByCategory(category) {
  const places = loadJson(STORAGE_PLACES, []);
  return places
    .filter((p) => p.category === category && p.visibility !== "HIDE")
    .sort((a, b) => (b.updated_at || "").localeCompare(a.updated_at || ""));
}

function subLabel(category, subValue) {
  const list = SUBS[category] || [];
  const item = list.find((x) => x.value === subValue);
  if (!item) return subValue || "-";
  if (typeof item.label === "string") return item.label;
  return item.label?.[uiState.lang] || item.label?.ko || item.label?.en || subValue || "-";
}

function facilityMaps() {
  const categories = loadJson(STORAGE_FACILITY_CATEGORIES, []);
  const facilities  = loadJson(STORAGE_FACILITIES, []);
  return {
    catById: new Map(categories.map((c) => [c.id, c])),
    facById: new Map(facilities.map((f) => [f.id, f])),
  };
}

function localizeFacilityName(fac) {
  return localizeField(fac, "name") || fac?.name || "-";
}

function featuredChipHtml(place, maps) {
  const ids = Array.isArray(place.featured_facility_ids) ? place.featured_facility_ids : [];
  if (!ids.length) return `<span class="empty">${escapeHtml(t("noFeatured"))}</span>`;
  return ids
    .map((id) => {
      const fac = maps.facById.get(id);
      if (!fac) return "";
      return `<span class="chip">${escapeHtml(localizeFacilityName(fac))}</span>`;
    })
    .filter(Boolean)
    .join("");
}

function settlementLabel(code) {
  if (code === "AT_BOOKING") return "예약 시 결제";
  if (code === "ON_SITE")    return "현장 결제";
  return String(code || "-");
}

function groupedFacilitiesHtml(facilityIds, maps) {
  const ids = Array.isArray(facilityIds) ? facilityIds : [];
  if (!ids.length) return `<p class="empty">${escapeHtml(t("noFacility"))}</p>`;
  const grouped = new Map();
  ids.forEach((id) => {
    const fac = maps.facById.get(id);
    if (!fac) return;
    const cat = maps.catById.get(fac.category_id) || { id: "_", name: "-" };
    const key = cat.id || "_";
    if (!grouped.has(key)) grouped.set(key, { cat, facs: [] });
    grouped.get(key).facs.push(fac);
  });
  return [...grouped.values()]
    .map(({ cat, facs }) => {
      const items = facs.map((f) => `<li>${escapeHtml(localizeFacilityName(f))}</li>`).join("");
      return `<section class="fac-group">
        <h4>${escapeHtml(localizeField(cat, "name") || cat.name || "-")}</h4>
        <ul>${items}</ul>
      </section>`;
    })
    .join("");
}

function placeImages(place) {
  const list = Array.isArray(place.image_meta) ? place.image_meta : [];
  return list.filter((x) => x?.data_url && typeof x.data_url === "string");
}

function roomImages(room) {
  const list = Array.isArray(room?.image_meta) ? room.image_meta : [];
  return list.filter((x) => x?.data_url && typeof x.data_url === "string");
}

function richTextOrParagraph(raw, emptyText) {
  const txt = String(raw || "").trim();
  if (!txt) return `<p class="empty">${escapeHtml(emptyText)}</p>`;
  if (/<[a-z][\s\S]*>/i.test(txt)) return txt;
  return `<p>${escapeHtml(txt).replace(/\n/g, "<br>")}</p>`;
}

function formatWon(n) {
  const v = Math.max(0, Number(n) || 0);
  return uiState.lang === "ko"
    ? `${v.toLocaleString("ko-KR")}원`
    : `₩${v.toLocaleString("en-US")}`;
}

function loadBedMap() {
  const beds = loadJson(STORAGE_BED_TYPES, []);
  return new Map(beds.map((b) => [b.id, b]));
}

function bedLine(room, bedById) {
  const rows = Array.isArray(room?.bed_rows) ? room.bed_rows : [];
  if (!rows.length) return "-";
  return rows
    .map((r) => {
      const bt = bedById.get(r.bed_type_id);
      const name = localizeField(bt, "name") || bt?.name || "?";
      const c = Math.max(1, parseInt(r.count, 10) || 1);
      return `${name} ${c}개`;
    })
    .join(", ");
}

function roomFeaturedChips(room, maps) {
  const ids = Array.isArray(room?.featured_facility_ids) ? room.featured_facility_ids : [];
  if (!ids.length) return "";
  return ids
    .map((id) => {
      const fac = maps.facById.get(id);
      if (!fac) return "";
      return `<span class="pc-chip">${escapeHtml(localizeFacilityName(fac))}</span>`;
    })
    .filter(Boolean)
    .join("");
}

/* ─── 인벤토리 / 예약 가능 여부 (비즈니스 로직 — 변경 없음) ─── */
/** 실판매가 = 입금가 + 마진 (마진율: floor(base×(1+율/100)) · 마진금액: base+금액). 소수점 버림. */
function computeSellPriceFront(basePrice, marginType, marginValue) {
  const base = Math.max(0, parseInt(String(basePrice).replace(/\D/g, ""), 10) || 0);
  const v = parseFloat(marginValue);
  if (marginType === "rate" && !Number.isNaN(v)) return Math.max(0, Math.floor(base * (1 + v / 100)));
  if (marginType === "amount" && !Number.isNaN(v)) return Math.max(0, base + Math.floor(v));
  return base;
}

function inventoryRow(product, ymd) {
  const prodInv = Array.isArray(product.inventory) ? product.inventory : [];
  const prodRow = prodInv.find((r) => String(r.date || "").trim() === ymd) || null;
  // 재고·요금·마감(closed)은 객실(room.inventory)에서 실시간 참조, 예약조건은 상품에서
  const rooms = loadJson(STORAGE_ROOMS);
  const room = (Array.isArray(rooms) ? rooms : []).find((r) => r.id === product.room_id);
  const roomInv = Array.isArray(room?.inventory) ? room.inventory : [];
  const roomRow = roomInv.find((r) => String(r.date || "").trim() === ymd) || null;
  if (!roomRow) return prodRow; // 객실 재고·요금 미동기화 시 하위호환(상품 스냅샷)
  const avlb = roomRow.avlb_cnt != null ? roomRow.avlb_cnt : roomRow.stock != null ? roomRow.stock : 0;
  return {
    date: ymd,
    price: roomRow.price,
    stock: avlb,
    closed: roomRow.closed === true,
    checkin_allowed: prodRow ? prodRow.checkin_allowed : true,
    cutoff_days_before_checkin: prodRow ? prodRow.cutoff_days_before_checkin : 0,
    min_stay_nights: prodRow ? prodRow.min_stay_nights : 1,
    max_stay_nights: prodRow ? prodRow.max_stay_nights : 30,
    margin_type: prodRow ? prodRow.margin_type : "", // 일자별 마진(상품 inventory)
    margin_value: prodRow ? prodRow.margin_value : "",
  };
}

function cancelSummaryLine(product, firstNightYmd, todayStr) {
  const pol = product.cancel_policy_type;
  if (pol === PRODUCT_CANCEL_POLICY.NON_REFUNDABLE || !pol) return "취소 및 환불불가";
  const N = Math.max(0, parseInt(product.cancel_free_days_before, 10) || 0);
  const firstBlocked = addCalendarDaysYmd(firstNightYmd, -N);
  if (!firstBlocked) return "취소 및 환불불가";
  if (todayStr >= firstBlocked) return "취소 및 환불불가";
  const lastFree = addCalendarDaysYmd(firstBlocked, -1);
  if (!lastFree) return "취소 및 환불불가";
  return `${lastFree} 23:59까지 무료취소 가능`;
}

function cutoffBlocksBooking(stayNightYmd, cutoffDays, todayStr) {
  const C = Math.max(0, parseInt(cutoffDays, 10) || 0);
  if (C === 0) return false;
  const blockStart = addCalendarDaysYmd(stayNightYmd, -C);
  if (!blockStart) return false;
  return todayStr >= blockStart;
}

function evaluateProductForStay(product, checkin, checkout) {
  const todayStr = todayKstYmd();
  const nights = stayNightsYmd(checkin, checkout);
  const first = nights[0] || "";
  const base = { nights, state: "need_dates", totalPrice: 0, cancelLine: "", priceLabel: "" };
  if (!nights.length) { base.state = "bad_dates"; return base; }
  base.cancelLine = cancelSummaryLine(product, first, todayStr);

  const s0 = String(product.sale_start_date || "").slice(0, 10);
  const s1 = String(product.sale_end_date   || "").slice(0, 10);
  const saleOk = /^\d{4}-\d{2}-\d{2}$/.test(s0) && /^\d{4}-\d{2}-\d{2}$/.test(s1)
    && todayStr >= s0 && todayStr <= s1;
  if (!saleOk) { base.state = "sale_out"; return base; }

  // 투숙 가능 기간: 체크인일(first)이 stay 범위를 벗어나면 예약 불가
  const stayS = String(product.stay_start_date || "").slice(0, 10);
  const stayE = String(product.stay_end_date || "").slice(0, 10);
  if (/^\d{4}-\d{2}-\d{2}$/.test(stayS) && first < stayS) { base.state = "no_inv"; return base; }
  if (/^\d{4}-\d{2}-\d{2}$/.test(stayE) && first > stayE) { base.state = "no_inv"; return base; }

  let sum = 0;
  for (const ymd of nights) {
    const row = inventoryRow(product, ymd);
    if (!row) { base.state = "no_inv"; return base; }
    if (row.checkin_allowed === false || row.checkin_allowed === "N" || row.checkin_allowed === "n") {
      base.state = "closed"; return base;
    }
    if (row.closed === true) { base.state = "soldout"; return base; } // 객실 재고·요금 강제 마감(CLSE_YN)
    if (cutoffBlocksBooking(ymd, row.cutoff_days_before_checkin, todayStr)) {
      base.state = "cutoff"; return base;
    }
    const stock = Math.max(0, parseInt(String(row.stock).replace(/\D/g, ""), 10) || 0);
    if (stock <= 0) { base.state = "soldout"; return base; }
    sum += computeSellPriceFront(row.price, row.margin_type, row.margin_value);
  }
  base.totalPrice = sum;
  base.state = "ok";
  base.priceLabel = `${t("memberRate")} ${formatWon(sum)}`;
  return base;
}

function productsForPlace(placeId) {
  const rooms    = loadJson(STORAGE_ROOMS, []);
  const products = loadJson(STORAGE_PRODUCTS, []);
  const roomIds  = new Set(
    rooms.filter((r) => r.place_id === placeId && r.visibility !== "HIDE").map((r) => r.id)
  );
  return products.filter((p) => roomIds.has(p.room_id) && p.visibility !== "N");
}

/* ─── Hero (full width) ─── */
function heroFullwidthHtml(place) {
  const images  = placeImages(place);
  const current = Math.min(uiState.heroIndexByPlace[place.id] || 0, Math.max(0, images.length - 1));
  uiState.heroIndexByPlace[place.id] = current;

  const placeName = escapeHtml(localizeField(place, "place_name") || place.place_name || "");
  const sub       = escapeHtml(subLabel(String(place.category || "HOTEL").toUpperCase(), place.sub_place));

  const imgHtml = images.length
    ? `<img src="${escapeHtml(images[current].data_url)}" alt="${placeName}" />`
    : `<div class="hero-placeholder"></div>`;

  const arrows = images.length > 1
    ? `<button type="button" class="hero-arrow left" data-hero-dir="-1" aria-label="이전">&#8249;</button>
       <button type="button" class="hero-arrow right" data-hero-dir="1" aria-label="다음">&#8250;</button>`
    : "";

  return `<div class="hero-fullwidth" data-hero-place="${escapeHtml(place.id)}">
    ${imgHtml}
    <div class="hero-overlay">
      <div class="hero-text">
        <div class="hero-place-name">${placeName}</div>
        <div class="hero-sub-name">${sub}</div>
        <button type="button" class="hero-open-layer-btn js-open-place-layer" data-place="${escapeHtml(place.id)}">
          ${escapeHtml(t("openLayer"))}
        </button>
      </div>
    </div>
    ${arrows}
  </div>`;
}

function wireHero(place) {
  const images = placeImages(place);
  if (images.length <= 1) return;
  const root = document.querySelector(`[data-hero-place="${place.id}"]`);
  if (!root) return;
  const img = root.querySelector("img");
  const move = (delta) => {
    const cur  = uiState.heroIndexByPlace[place.id] || 0;
    const next = (cur + delta + images.length) % images.length;
    uiState.heroIndexByPlace[place.id] = next;
    if (img) img.src = images[next].data_url;
  };
  root.querySelectorAll("[data-hero-dir]").forEach((btn) => {
    btn.addEventListener("click", () => move(parseInt(btn.getAttribute("data-hero-dir"), 10)));
  });
}

/* ─── Product card (3-column) ─── */
function productCardHtml(place, room, product, maps, bedById) {
  const ci = uiState.searchCheckin;
  const co = uiState.searchCheckout;
  const hasDates = /^\d{4}-\d{2}-\d{2}$/.test(ci) && /^\d{4}-\d{2}-\d{2}$/.test(co) && ci < co;
  const ev = hasDates
    ? evaluateProductForStay(product, ci, co)
    : { state: "need_dates", cancelLine: "", priceLabel: "", nights: [] };

  /* Thumbnail */
  const imgs = roomImages(room);
  let imgIdx = uiState.cardImgIdx[product.id] || 0;
  if (imgIdx >= imgs.length) imgIdx = 0;
  uiState.cardImgIdx[product.id] = imgIdx;

  const thumbHtml = imgs.length === 0
    ? `<div class="pc-thumb pc-no-image">No Image</div>`
    : `<div class="pc-thumb" data-pc-thumb="${escapeHtml(product.id)}">
        <img src="${escapeHtml(imgs[imgIdx].data_url)}" alt="" />
        ${imgs.length > 1
          ? `<div class="pc-thumb-nav">
              <button type="button" data-pc-prev="${escapeHtml(product.id)}">&#8249;</button>
              <button type="button" data-pc-next="${escapeHtml(product.id)}">&#8250;</button>
             </div>`
          : ""}
       </div>`;

  /* Content */
  const desc = String((uiState.lang === "zh" && product.description_zh) || product.description_en || product.description || "").trim();
  const descBlock = desc ? `<div class="pc-desc">${escapeHtml(desc)}</div>` : "";
  const cancelText = ev.cancelLine || (hasDates ? "" : "");

  const contentHtml = `<div class="pc-content">
    <div class="pc-sub-label">${escapeHtml(subLabel(String(place.category || "HOTEL").toUpperCase(), place.sub_place))}</div>
    <div class="pc-room-name">${escapeHtml(room.room_name || room.room_code || "-")}</div>
    <div class="pc-product-name">${escapeHtml((uiState.lang === "zh" && product.name_zh) || product.name_en || product.name || "-")}</div>
    <div class="pc-info-line">
      침대: ${escapeHtml(bedLine(room, bedById))}
      &nbsp;·&nbsp;
      기준 ${escapeHtml(String(room.standard_occupancy ?? "-"))}명 / 최대 ${escapeHtml(String(room.max_occupancy ?? "-"))}명
    </div>
    <div class="pc-chips">${roomFeaturedChips(room, maps)}</div>
    ${cancelText ? `<div class="pc-cancel">${escapeHtml(cancelText)}</div>` : ""}
    ${descBlock}
  </div>`;

  /* Price panel */
  let priceTopHtml;
  if (!hasDates) {
    priceTopHtml = `<div class="pc-state muted">${escapeHtml(t("searchNeedCheckout"))}</div>`;
  } else if (ev.state === "ok") {
    priceTopHtml = `
      <div class="pc-member-label">${escapeHtml(t("memberRate"))}</div>
      <div class="pc-price">${escapeHtml(formatWon(ev.totalPrice))}</div>`;
  } else {
    const label = {
      sale_out:  t("saleClosed"),
      no_inv:    t("noInv"),
      closed:    t("closed"),
      cutoff:    t("cutoff"),
      soldout:   t("soldout"),
      bad_dates: t("badDates"),
    }[ev.state] || "";
    priceTopHtml = `<div class="pc-state">${escapeHtml(label)}</div>`;
  }

  const canBook   = hasDates && ev.state === "ok";
  const selectBtn = canBook
    ? `<button type="button" class="btn-cta">${escapeHtml(t("selectRoom"))}</button>`
    : `<button type="button" class="btn-cta" disabled>${escapeHtml(t("selectRoom"))}</button>`;

  const pricePanelHtml = `<div class="pc-price-panel">
    <div class="pc-price-top">${priceTopHtml}</div>
    <div class="pc-price-bottom">
      <button type="button" class="btn-room-detail js-open-rd" data-product-id="${escapeHtml(product.id)}">
        ${escapeHtml(t("roomDetail"))}
      </button>
      ${selectBtn}
    </div>
  </div>`;

  return `<article class="product-card" id="pcard-${escapeHtml(product.id)}">
    ${thumbHtml}
    ${contentHtml}
    ${pricePanelHtml}
  </article>`;
}

/* ─── Product cards block ─── */
function productCardsHtml(place, maps, bedById) {
  const list = productsForPlace(place.id);
  if (!list.length) {
    return `<div class="empty-state">${escapeHtml(t("noProductsPlace"))}</div>`;
  }
  const rooms   = loadJson(STORAGE_ROOMS, []);
  const roomById = new Map(rooms.map((r) => [r.id, r]));
  const ci = uiState.searchCheckin;
  const co = uiState.searchCheckout;
  const hasDates = /^\d{4}-\d{2}-\d{2}$/.test(ci) && /^\d{4}-\d{2}-\d{2}$/.test(co) && ci < co;

  const cards = list
    .map((p) => {
      const room = roomById.get(p.room_id);
      if (!room) return "";
      return productCardHtml(place, room, p, maps, bedById);
    })
    .join("");

  const allUnavailable = hasDates && list.every((p) => {
    const room = roomById.get(p.room_id);
    if (!room) return true;
    return evaluateProductForStay(p, ci, co).state !== "ok";
  });

  const notice = allUnavailable
    ? `<div class="search-notice">${escapeHtml(t("noProductsSearch"))}</div>`
    : "";

  return notice + cards;
}

/* ─── Home ─── */
function renderHome(app) {
  const hotel = visiblePlacesByCategory("HOTEL");
  const condo = visiblePlacesByCategory("CONDO");

  const catCard = (category, places) => {
    const catLabel = CATEGORY_LABEL[category]?.[uiState.lang] || category;
    if (!places.length) {
      return `<article class="home-card">
        <div class="home-card-category">${escapeHtml(catLabel)}</div>
        <h2>${escapeHtml(catLabel)}</h2>
        <p class="home-card-count">${escapeHtml(t("noVisibleData"))}</p>
      </article>`;
    }
    return `<article class="home-card">
      <div class="home-card-category">${escapeHtml(catLabel)}</div>
      <h2>${escapeHtml(catLabel)}</h2>
      <p class="home-card-count">${escapeHtml(t("hotelCount", { count: places.length }))}</p>
      <a class="btn-cta" href="#/bridge/${category}">${escapeHtml(t("open"))}</a>
    </article>`;
  };

  app.innerHTML = `<div class="home-wrap">
    <div class="home-hero">
      <h1 class="home-title">high<span>1</span></h1>
      <p class="home-desc">${escapeHtml(t("homeDesc"))}</p>
    </div>
    <div class="home-grid">
      ${catCard("HOTEL", hotel)}
      ${catCard("CONDO", condo)}
    </div>
  </div>`;
}

/* ─── Bridge page ─── */
function renderBridge(app, category) {
  const places = visiblePlacesByCategory(category);
  if (!places.length) {
    app.innerHTML = `<div class="home-wrap">
      <p class="home-desc">${escapeHtml(t("noData"))}</p>
      <a href="#/" style="color:var(--link);font-size:14px;">${escapeHtml(t("backHome"))}</a>
    </div>`;
    return;
  }

  /* 선택된 숙소 결정 */
  const savedId     = uiState.selectedPlaceByCategory[category];
  const selectedPlace = places.find((p) => p.id === savedId) || places[0];
  uiState.selectedPlaceByCategory[category] = selectedPlace.id;

  const maps   = facilityMaps();
  const bedById = loadBedMap();

  /* 숙소 탭 */
  const placeTabsHtml = places
    .map((p) => {
      const name = escapeHtml(localizeField(p, "place_name") || p.place_name || "-");
      const active = p.id === selectedPlace.id ? "active" : "";
      return `<button type="button" class="place-tab-btn ${active}" data-place="${escapeHtml(p.id)}">${name}</button>`;
    })
    .join("");

  /* 체크인/아웃 & 대표시설 */
  const checkinOutVal = `${escapeHtml(selectedPlace.check_in_time || "-")} / ${escapeHtml(selectedPlace.check_out_time || "-")}`;

  /* 검색 바 */
  const searchBarHtml = `<div class="search-bar">
    <div class="search-field">
      <label for="fSearchCi">${escapeHtml(t("searchCheckin"))}</label>
      <input type="date" id="fSearchCi" value="${escapeHtml(uiState.searchCheckin)}" />
    </div>
    <div class="search-field">
      <label for="fSearchCo">${escapeHtml(t("searchCheckout"))}</label>
      <input type="date" id="fSearchCo" value="${escapeHtml(uiState.searchCheckout)}" />
    </div>
    <button type="button" class="btn-search" id="fSearchApply">${escapeHtml(t("searchApply"))}</button>
  </div>`;

  app.innerHTML = `
    <!-- 숙소 선택 탭 -->
    <div class="place-selector">
      <div class="place-selector-inner">${placeTabsHtml}</div>
    </div>

    <!-- 히어로 (풀와이드) -->
    ${heroFullwidthHtml(selectedPlace)}

    <!-- 내비 탭 (스티키) -->
    <nav class="place-nav">
      <div class="place-nav-inner">
        <button type="button" class="place-nav-btn active" data-nav="overview">${escapeHtml(t("navOverview"))}</button>
        <button type="button" class="place-nav-btn" data-nav="rooms">${escapeHtml(t("navRooms"))}</button>
        <button type="button" class="place-nav-btn" data-nav="detail">${escapeHtml(t("navDetail"))}</button>
        <button type="button" class="place-nav-btn" data-nav="policies">${escapeHtml(t("navPolicies"))}</button>
        <button type="button" class="place-nav-btn" data-nav="location">${escapeHtml(t("navLocation"))}</button>
      </div>
    </nav>

    <!-- 콘텐츠 래퍼 -->
    <div class="content-wrap">

      <!-- Overview 섹션 -->
      <section id="sec-overview" class="sec-overview">
        <div class="overview-grid">
          <div>
            <div class="overview-item-label">${escapeHtml(t("checkinOut"))}</div>
            <div class="overview-item-value">${checkinOutVal}</div>
          </div>
          <div>
            <div class="overview-item-label">${escapeHtml(t("featured"))}</div>
            <div class="overview-chips">${featuredChipHtml(selectedPlace, maps)}</div>
          </div>
        </div>
      </section>

      <!-- Rooms 섹션 -->
      <section id="sec-rooms" class="sec-rooms">
        <div class="rooms-header">
          <h2 class="rooms-title">${escapeHtml(t("productListTitle"))}</h2>
          ${searchBarHtml}
        </div>
        <p class="search-hint">${escapeHtml(t("searchNeedCheckout"))}</p>
        ${productCardsHtml(selectedPlace, maps, bedById)}
      </section>

    </div>
  `;

  /* ── 이벤트 바인딩 ── */

  /* 숙소 탭 선택 */
  app.querySelectorAll(".place-tab-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      uiState.selectedPlaceByCategory[category] = btn.getAttribute("data-place");
      render();
    });
  });

  /* 내비 탭 */
  const navTabMap = { detail: "detail", policies: "policy", location: "location" };
  app.querySelectorAll("[data-nav]").forEach((btn) => {
    btn.addEventListener("click", () => {
      app.querySelectorAll("[data-nav]").forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      const nav = btn.getAttribute("data-nav");
      if (nav === "overview") {
        document.getElementById("sec-overview")?.scrollIntoView({ behavior: "smooth" });
      } else if (nav === "rooms") {
        document.getElementById("sec-rooms")?.scrollIntoView({ behavior: "smooth" });
      } else if (navTabMap[nav]) {
        uiState.placeLayer.open = true;
        uiState.placeLayer.placeId = selectedPlace.id;
        uiState.placeLayer.tab = navTabMap[nav];
        renderPlaceLayer();
      }
    });
  });

  /* 히어로 숙소 안내 버튼 */
  app.querySelectorAll(".js-open-place-layer").forEach((btn) => {
    btn.addEventListener("click", () => {
      uiState.placeLayer.open = true;
      uiState.placeLayer.placeId = btn.getAttribute("data-place");
      uiState.placeLayer.tab = "detail";
      renderPlaceLayer();
    });
  });

  /* 검색 */
  document.getElementById("fSearchApply")?.addEventListener("click", () => {
    uiState.searchCheckin  = document.getElementById("fSearchCi")?.value || "";
    uiState.searchCheckout = document.getElementById("fSearchCo")?.value || "";
    render();
  });

  /* Room Detail 열기 */
  app.querySelectorAll(".js-open-rd").forEach((btn) => {
    btn.addEventListener("click", () => openRoomDetail(btn.getAttribute("data-product-id")));
  });

  /* 카드 이미지 이전/다음 */
  app.querySelectorAll("[data-pc-prev]").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const id = btn.getAttribute("data-pc-prev");
      const cur = uiState.cardImgIdx[id] || 0;
      const rooms    = loadJson(STORAGE_ROOMS, []);
      const products = loadJson(STORAGE_PRODUCTS, []);
      const pr   = products.find((x) => x.id === id);
      const room = rooms.find((r) => r.id === pr?.room_id);
      const n = roomImages(room).length;
      if (!n) return;
      uiState.cardImgIdx[id] = (cur - 1 + n) % n;
      render();
    });
  });

  app.querySelectorAll("[data-pc-next]").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const id = btn.getAttribute("data-pc-next");
      const cur = uiState.cardImgIdx[id] || 0;
      const rooms    = loadJson(STORAGE_ROOMS, []);
      const products = loadJson(STORAGE_PRODUCTS, []);
      const pr   = products.find((x) => x.id === id);
      const room = rooms.find((r) => r.id === pr?.room_id);
      const n = roomImages(room).length;
      if (!n) return;
      uiState.cardImgIdx[id] = (cur + 1) % n;
      render();
    });
  });

  wireHero(selectedPlace);
}

/* ─── Place Layer ─── */
function renderPlaceLayer() {
  const layer   = document.getElementById("placeLayer");
  const backdrop = document.getElementById("placeLayerBackdrop");
  const title   = document.getElementById("placeLayerTitle");
  const tabsHost = document.getElementById("placeLayerTabs");
  const body    = document.getElementById("placeLayerBody");
  if (!layer || !backdrop || !title || !tabsHost || !body) return;

  if (!uiState.placeLayer.open) {
    layer.classList.add("hidden");
    backdrop.classList.add("hidden");
    layer.setAttribute("aria-hidden", "true");
    return;
  }

  const places = loadJson(STORAGE_PLACES, []);
  const place  = places.find((p) => p.id === uiState.placeLayer.placeId);
  if (!place) {
    uiState.placeLayer.open = false;
    renderPlaceLayer();
    return;
  }

  const maps = facilityMaps();
  title.textContent = localizeField(place, "place_name") || place.place_name || "";

  const tabs = [
    { id: "detail",   label: t("tabDetail") },
    { id: "policy",   label: t("tabPolicy") },
    { id: "location", label: t("tabLocation") },
  ];

  tabsHost.innerHTML = tabs
    .map((x) => `<button type="button" class="layer-tab ${uiState.placeLayer.tab === x.id ? "active" : ""}" data-pltab="${x.id}">${escapeHtml(x.label)}</button>`)
    .join("");

  if (uiState.placeLayer.tab === "detail") {
    body.innerHTML = `
      <h3>${escapeHtml(t("guideTitle"))}</h3>
      ${richTextOrParagraph(localizeField(place, "guide_html") || place.guide_html, t("noGuide"))}
      <hr />
      <h3>${escapeHtml(t("facilityTitle"))}</h3>
      ${groupedFacilitiesHtml(place.facility_ids, maps)}`;
  } else if (uiState.placeLayer.tab === "policy") {
    const feeNotes = Array.isArray(place.extra_fee_notes)
      ? place.extra_fee_notes.filter((n) => n && (n.en || n.zh))
      : [];
    const feeTitle = uiState.lang === "en" ? "Extra Fees" : "추가요금";
    const feeHtml = feeNotes.length
      ? `<hr /><h3>${escapeHtml(feeTitle)}</h3><ul class="ft-extra-fee">${feeNotes
          .map((n) => `<li>${escapeHtml(n.en || n.zh)}</li>`)
          .join("")}</ul>`
      : "";
    body.innerHTML = `
      <h3>${escapeHtml(t("policyTitle"))}</h3>
      ${richTextOrParagraph(localizeField(place, "policy_html") || place.policy_html, t("noPolicy"))}
      ${feeHtml}`;
  } else {
    body.innerHTML = `
      <h3>${escapeHtml(t("locationTitle"))}</h3>
      <p><strong>${escapeHtml(t("address"))}</strong><br>${escapeHtml(localizeField(place, "address") || place.address || "-")}</p>
      ${richTextOrParagraph(localizeField(place, "location_detail") || place.location_detail, t("noLocation"))}`;
  }

  tabsHost.querySelectorAll("[data-pltab]").forEach((btn) => {
    btn.addEventListener("click", () => {
      uiState.placeLayer.tab = btn.getAttribute("data-pltab");
      renderPlaceLayer();
    });
  });

  layer.classList.remove("hidden");
  backdrop.classList.remove("hidden");
  layer.setAttribute("aria-hidden", "false");
}

/* ─── Room Detail Modal ─── */
function openRoomDetail(productId) {
  uiState.roomDetail.open = true;
  uiState.roomDetail.productId = productId || "";
  renderRoomDetailModal();
}

function renderRoomDetailModal() {
  const modal   = document.getElementById("roomDetailModal");
  const backdrop = document.getElementById("roomDetailBackdrop");
  if (!modal || !backdrop) return;

  if (!uiState.roomDetail.open) {
    modal.classList.add("hidden");
    backdrop.classList.add("hidden");
    modal.setAttribute("aria-hidden", "true");
    return;
  }

  const products = loadJson(STORAGE_PRODUCTS, []);
  const rooms    = loadJson(STORAGE_ROOMS, []);
  const product  = products.find((p) => p.id === uiState.roomDetail.productId);
  const room     = product ? rooms.find((r) => r.id === product.room_id) : null;

  if (!product || !room) {
    uiState.roomDetail.open = false;
    renderRoomDetailModal();
    return;
  }

  const bedById = loadBedMap();
  const maps    = facilityMaps();

  document.getElementById("rdRoomName").textContent    = room.room_name || room.room_code || "";
  document.getElementById("rdProductName").textContent = (uiState.lang === "zh" && product.name_zh) || product.name_en || product.name || "";

  /* 갤러리: 첫 장 풀와이드 + 나머지 2열 그리드 */
  const imgs = roomImages(room);
  const gal  = document.getElementById("rdGallery");
  if (imgs.length) {
    const gridImgs = imgs.slice(0, 5)
      .map((im) => `<img src="${escapeHtml(im.data_url)}" alt="" />`)
      .join("");
    gal.innerHTML = `<div class="rd-gallery-grid">${gridImgs}</div>`;
  } else {
    gal.innerHTML = `<div class="rd-gallery-empty">No Image</div>`;
  }

  /* 기본 정보 (Information) */
  const info = document.getElementById("rdInfo");
  const sizeText = room.room_size_sqm != null && room.room_size_sqm !== ""
    ? `${room.room_size_sqm}㎡`
    : "-";
  info.innerHTML = `
    <li>
      <span class="rd-info-label">인원</span>
      기준 ${escapeHtml(String(room.standard_occupancy ?? "-"))}명 / 최대 ${escapeHtml(String(room.max_occupancy ?? "-"))}명
    </li>
    <li>
      <span class="rd-info-label">크기</span>
      ${escapeHtml(sizeText)}
    </li>
    <li>
      <span class="rd-info-label">침대</span>
      ${escapeHtml(bedLine(room, bedById))}
    </li>
  `;

  /* ─ 섹션 목록 구성 (데이터 없으면 섹션 자체 미생성) ─ */
  const rdSections = [];

  // ① 상품안내/정책
  const productGuideHtml =
    (uiState.lang === "zh" && product.guide_policy_html_zh) || product.guide_policy_html_en || product.guide_policy_html || "";
  if (String(productGuideHtml).trim()) {
    rdSections.push({
      id: "rd-sec-product",
      label: "상품안내/정책",
      html: richTextOrParagraph(productGuideHtml, ""),
    });
  }

  // ② 객실정책 (v0.5: 부가요금 표시 제거 · 국문 미사용 — 중문 접속 시 중문, 없으면 영문. 구버전 policy_html 폴백)
  const roomPolicyHtml =
    (uiState.lang === "zh" && room.policy_html_zh) || room.policy_html_en || room.policy_html_zh || room.policy_html || "";
  if (String(roomPolicyHtml || "").trim()) {
    rdSections.push({
      id: "rd-sec-room-policy",
      label: "객실정책",
      html: richTextOrParagraph(roomPolicyHtml, ""),
    });
  }

  // ③ 객실안내 (국문 미사용 · 영문 우선)
  const roomGuideHtml =
    (uiState.lang === "zh" && room.guide_html_zh) || room.guide_html_en || room.guide_html_zh || room.guide_html || "";
  if (String(roomGuideHtml || "").trim()) {
    rdSections.push({
      id: "rd-sec-room-guide",
      label: "객실안내",
      html: richTextOrParagraph(roomGuideHtml, ""),
    });
  }

  // ④ 객실시설정보
  const roomFacIds = Array.isArray(room.facility_ids) ? room.facility_ids : [];
  if (roomFacIds.length) {
    rdSections.push({
      id: "rd-sec-facilities",
      label: "객실시설정보",
      html: groupedFacilitiesHtml(roomFacIds, maps),
    });
  }

  /* ─ 내비 탭 ─ */
  const nav = document.getElementById("rdSectionsNav");
  if (nav) {
    nav.innerHTML = rdSections
      .map((s, i) =>
        `<button type="button" class="rd-sec-nav-btn${i === 0 ? " active" : ""}" data-rd-sec="${escapeHtml(s.id)}">${escapeHtml(s.label)}</button>`
      )
      .join("");
    nav.querySelectorAll("[data-rd-sec]").forEach((btn) => {
      btn.addEventListener("click", () => {
        nav.querySelectorAll(".rd-sec-nav-btn").forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");
        document.getElementById(btn.getAttribute("data-rd-sec"))
          ?.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    });
  }

  /* ─ 섹션 콘텐츠 ─ */
  const svc = document.getElementById("rdServices");
  svc.innerHTML = rdSections
    .map((s) =>
      `<section id="${escapeHtml(s.id)}" class="rd-sec">
        <h4 class="rd-sec-title">${escapeHtml(s.label)}</h4>
        ${s.html}
      </section>`
    )
    .join("");

  modal.classList.remove("hidden");
  backdrop.classList.remove("hidden");
  modal.setAttribute("aria-hidden", "false");

  const close = () => {
    uiState.roomDetail.open = false;
    renderRoomDetailModal();
  };
  document.getElementById("rdClose").onclick   = close;
  backdrop.onclick = close;
  document.getElementById("rdSelectRoom").onclick = () => {
    close();
    document.getElementById(`pcard-${product.id}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
  };
}

/* ─── Main render ─── */
function render() {
  const app = document.getElementById("app");
  if (!app) return;

  document.documentElement.lang = uiState.lang === "en" ? "en" : "ko";
  document.getElementById("langKo")?.classList.toggle("active", uiState.lang === "ko");
  document.getElementById("langEn")?.classList.toggle("active", uiState.lang === "en");

  const { parts } = parseHash();
  if (parts[0] === "bridge" && (parts[1] === "HOTEL" || parts[1] === "CONDO")) {
    renderBridge(app, parts[1]);
  } else {
    renderHome(app);
  }

  renderPlaceLayer();
  renderRoomDetailModal();
}

/* ─── Init ─── */
window.addEventListener("DOMContentLoaded", () => {
  document.getElementById("placeLayerClose")?.addEventListener("click", () => {
    uiState.placeLayer.open = false;
    renderPlaceLayer();
  });
  document.getElementById("placeLayerBackdrop")?.addEventListener("click", () => {
    uiState.placeLayer.open = false;
    renderPlaceLayer();
  });
  document.getElementById("rdClose")?.addEventListener("click", () => {
    uiState.roomDetail.open = false;
    renderRoomDetailModal();
  });
  document.getElementById("roomDetailBackdrop")?.addEventListener("click", () => {
    uiState.roomDetail.open = false;
    renderRoomDetailModal();
  });
  document.getElementById("langKo")?.addEventListener("click", () => {
    uiState.lang = "ko";
    localStorage.setItem("high1_front_v02_lang", "ko");
    render();
  });
  document.getElementById("langEn")?.addEventListener("click", () => {
    uiState.lang = "en";
    localStorage.setItem("high1_front_v02_lang", "en");
    render();
  });
  window.addEventListener("hashchange", render);
  render();
});
