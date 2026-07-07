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
const STORAGE_MAIN_HERO     = "high1_main_hero_v1";
const STORAGE_MAIN_HERO_CFG = "high1_main_hero_cfg_v1";
const STORAGE_MAIN_SECTION  = "high1_main_section_v1";

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
  const lang = uiState.lang;
  const nameLocal = (obj, base) => (obj ? ((lang === "zh" && obj[base + "_zh"]) || obj[base + "_en"] || obj[base] || "") : "");
  const ci = uiState.searchCheckin;
  const co = uiState.searchCheckout;
  const hasDates = /^\d{4}-\d{2}-\d{2}$/.test(ci) && /^\d{4}-\d{2}-\d{2}$/.test(co) && ci < co;
  const ev = hasDates
    ? evaluateProductForStay(product, ci, co)
    : { state: "need_dates", cancelLine: "", totalPrice: 0 };

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

  /* 인원추가요금: 검색 요청 객실 중 최대 인원 > 객실 기준 인원 */
  const reqMax = paxTotals(uiState.search || {}).maxRoom;
  const overStd = reqMax > 0 && room.standard_occupancy != null && reqMax > Number(room.standard_occupancy);
  const extraWarn = overStd
    ? `<div class="pc-extra-warn">⚠ ${escapeHtml(lang === "en" ? "Additional per-person charges may apply." : "인원추가요금이 발생할 수 있습니다.")}</div>`
    : "";

  /* Content — 뱃지=숙소명 / 객실명 / 상품명 / 데이터(📐크기·🛏침대·👥인원) / 대표시설 */
  const placeName = nameLocal(place, "place_name") || place.place_name || "-";
  const roomName = nameLocal(room, "room_name") || room.rm_typ_cd || "-";
  const productName = nameLocal(product, "name") || "-";
  const sizeLine = room.room_size_sqm
    ? `<div class="pc-info-line">📐 ${escapeHtml(lang === "en" ? "Size" : "객실크기")} ${escapeHtml(String(room.room_size_sqm))}㎡</div>`
    : "";
  const bedLineHtml = `<div class="pc-info-line">🛏 ${escapeHtml(lang === "en" ? "Bed" : "침대")} ${escapeHtml(bedLine(room, bedById))}</div>`;
  const occLineHtml = `<div class="pc-info-line">👥 ${escapeHtml(lang === "en" ? "Guests" : "인원")} ${escapeHtml(lang === "en" ? "Base" : "기준")} ${escapeHtml(String(room.standard_occupancy ?? "-"))} / ${escapeHtml(lang === "en" ? "Max" : "최대")} ${escapeHtml(String(room.max_occupancy ?? "-"))}</div>`;

  const contentHtml = `<div class="pc-content">
    <div class="pc-place-badge">${escapeHtml(placeName)}</div>
    <div class="pc-room-name">${escapeHtml(roomName)}</div>
    <div class="pc-product-name">${escapeHtml(productName)}</div>
    <div class="pc-data">
      ${sizeLine}
      ${bedLineHtml}
      ${occLineHtml}
    </div>
    <div class="pc-chips">${roomFeaturedChips(room, maps)}</div>
    ${extraWarn}
  </div>`;

  /* Price panel — 상세보기 / 취소정책(무료=파랑·불가=빨강) / 회원가 */
  const cancelText = ev.cancelLine || "";
  const isFree = /무료취소/.test(cancelText);
  const cancelHtml = cancelText
    ? `<div class="pc-cancel ${isFree ? "pc-cancel-free" : "pc-cancel-no"}">${escapeHtml(cancelText)}</div>`
    : "";
  let priceHtml;
  if (!hasDates) {
    priceHtml = `<div class="pc-state muted">${escapeHtml(t("searchNeedCheckout"))}</div>`;
  } else if (ev.state === "ok") {
    priceHtml = `<div class="pc-price-box"><div class="pc-member-label">${escapeHtml(t("memberRate"))}</div><div class="pc-price">${escapeHtml(formatWon(ev.totalPrice))}</div></div>`;
  } else {
    const label = {
      sale_out:  t("saleClosed"),
      no_inv:    t("noInv"),
      closed:    t("closed"),
      cutoff:    t("cutoff"),
      soldout:   t("soldout"),
      bad_dates: t("badDates"),
    }[ev.state] || "";
    priceHtml = `<div class="pc-state">${escapeHtml(label)}</div>`;
  }

  const pricePanelHtml = `<div class="pc-price-panel">
    <button type="button" class="btn-room-detail js-open-rd" data-product-id="${escapeHtml(product.id)}">${escapeHtml(t("roomDetail"))} →</button>
    ${cancelHtml}
    ${priceHtml}
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

/* ─── Main (히어로 + 서치바 + 추천 섹션) ─── */
function heroOn(h, todayStr) {
  if (h.force_off) return false;
  const s = String(h.period_start || "").slice(0, 10);
  const e = String(h.period_end || "").slice(0, 10);
  if (s && todayStr < s) return false;
  if (e && todayStr > e) return false;
  return true;
}

/* ─── 메인 추천 섹션 ─── */
function sectionOn(s, todayStr) {
  if (s.visible === false) return false;
  const st = String(s.period_start || "").slice(0, 10);
  const en = String(s.period_end || "").slice(0, 10);
  if (st && todayStr < st) return false;
  if (en && todayStr > en) return false;
  return true;
}

/** 객실의 '최저가부터' 판매가 + 대표 상품 id (재고 있고 마감 아닌 최저 판매가) */
function roomStartingPrice(room, allProducts) {
  const products = allProducts.filter((p) => p.room_id === room.id && p.visibility !== "N");
  const roomInv = Array.isArray(room.inventory) ? room.inventory : [];
  const byDate = new Map(roomInv.map((r) => [String(r.date || "").trim(), r]));
  let min = null;
  let productId = products[0] ? products[0].id : null;
  for (const p of products) {
    const pinv = Array.isArray(p.inventory) ? p.inventory : [];
    for (const pr of pinv) {
      const rr = byDate.get(String(pr.date || "").trim());
      if (!rr || rr.closed === true) continue;
      const stockRaw = rr.avlb_cnt != null ? rr.avlb_cnt : rr.stock;
      if ((parseInt(String(stockRaw).replace(/\D/g, ""), 10) || 0) <= 0) continue;
      const price = computeSellPriceFront(rr.price, pr.margin_type, pr.margin_value);
      if (price > 0 && (min === null || price < min)) { min = price; productId = p.id; }
    }
  }
  return { min, productId, hasProduct: products.length > 0 };
}

/** 섹션 대상 객실 목록 (필터·정렬 반영) */
function sectionRooms(section, tabKey, placeById, allRooms, allProducts) {
  const catOf = (p) => (String(p?.category || "").toUpperCase() === "CONDO" ? "condo" : "hotel");
  const visibleRoom = (r) => {
    if (r.visibility === "HIDE") return false;
    const pl = placeById.get(r.place_id);
    return pl && pl.visibility !== "HIDE";
  };
  if (section.room_mode === "manual") {
    // 수동 선택: 지정 순서 유지
    const order = section.room_ids || [];
    const roomById = new Map(allRooms.map((r) => [r.id, r]));
    return order.map((id) => roomById.get(id)).filter((r) => r && visibleRoom(r));
  }
  // 자동: 카테고리·숙소 필터 + 정렬
  const cats = Array.isArray(section.cat_1depth) && section.cat_1depth.length ? section.cat_1depth : ["hotel", "condo"];
  const activeCats = tabKey && tabKey !== "__all__" && cats.includes(tabKey) ? [tabKey] : cats;
  const placeIds = section.place_ids && section.place_ids.length ? new Set(section.place_ids) : null;
  let rooms = allRooms.filter((r) => {
    if (!visibleRoom(r)) return false;
    const pl = placeById.get(r.place_id);
    if (!activeCats.includes(catOf(pl))) return false;
    if (placeIds && !placeIds.has(r.place_id)) return false;
    return true;
  });
  const priceOf = (r) => { const s = roomStartingPrice(r, allProducts); return s.min == null ? Infinity : s.min; };
  const nameOf = (r) => (r.room_name_en || r.room_name || r.rm_typ_cd || "").toLowerCase();
  if (section.sort_type === "price") rooms.sort((a, b) => priceOf(a) - priceOf(b));
  else if (section.sort_type === "az") rooms.sort((a, b) => nameOf(a).localeCompare(nameOf(b)));
  else if (section.sort_type === "za") rooms.sort((a, b) => nameOf(b).localeCompare(nameOf(a)));
  // popular: 등록 순 유지
  return rooms.slice(0, 12);
}

function roomCardHtml(room, placeById, allProducts, L) {
  const pl = placeById.get(room.place_id);
  const placeName = pl ? (localizeField(pl, "place_name") || pl.place_name || "") : "";
  const roomName = room.room_name_en || room.room_name || room.rm_typ_cd || "Room";
  const imgs = roomImages(room);
  const thumb = imgs.length
    ? `<img src="${escapeHtml(imgs[0].data_url)}" alt="" style="width:100%;height:100%;object-fit:cover">`
    : `<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;color:#bbb;font-size:12px;background:#f1f1ee">No Image</div>`;
  const occ = room.standard_occupancy != null
    ? `${L("기준", "Base")} ${room.standard_occupancy} / ${L("최대", "Max")} ${room.max_occupancy ?? "?"}`
    : "";
  const size = room.room_size_sqm ? `${room.room_size_sqm}m²` : "";
  const sp = roomStartingPrice(room, allProducts);
  const priceHtml = sp.min != null
    ? `<span style="font-size:15px;font-weight:800;color:#1a1f2e">${formatWon(sp.min)} ~</span>`
    : `<span style="font-size:12px;color:#aaa">${L("요금 문의", "Ask price")}</span>`;
  const canOpen = sp.hasProduct && sp.productId;
  return `<div class="rec-card" style="flex:0 0 240px;width:240px;border:1px solid #ececec;border-radius:10px;overflow:hidden;background:#fff;display:flex;flex-direction:column">
      <div style="width:100%;aspect-ratio:4/3;background:#f1f1ee">${thumb}</div>
      <div style="padding:11px 12px 13px;display:flex;flex-direction:column;gap:5px;flex:1">
        <div style="font-size:11px;color:#8a8a8a">${escapeHtml(placeName)}</div>
        <div style="font-size:14px;font-weight:700;color:#222;line-height:1.35;min-height:38px">${escapeHtml(roomName)}</div>
        <div style="font-size:11px;color:#666;display:flex;flex-direction:column;gap:2px">
          ${occ ? `<span>👥 ${escapeHtml(occ)}</span>` : ""}
          ${size ? `<span>▭ ${escapeHtml(size)}</span>` : ""}
        </div>
        <div style="text-align:right;margin-top:auto;padding-top:6px">${priceHtml}</div>
        <button class="rec-cta" ${canOpen ? `data-open-product="${escapeHtml(sp.productId)}"` : "disabled"} style="width:100%;margin-top:6px;background:${canOpen ? "#1a1f2e" : "#ccc"};color:#fff;border:none;border-radius:6px;padding:9px;font-size:12.5px;font-weight:600;cursor:${canOpen ? "pointer" : "not-allowed"}">${L("예약 확인", "Check Availability")}</button>
      </div>
    </div>`;
}

function mainSectionsHtml(app, L, todayStr) {
  const sections = loadJson(STORAGE_MAIN_SECTION, [])
    .filter((s) => sectionOn(s, todayStr))
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  if (!sections.length) return "";
  const allPlaces = loadJson(STORAGE_PLACES, []);
  const placeById = new Map(allPlaces.map((p) => [p.id, p]));
  const allRooms = loadJson(STORAGE_ROOMS, []);
  const allProducts = loadJson(STORAGE_PRODUCTS, []);
  if (!uiState.sectionTab) uiState.sectionTab = {};

  const blocks = sections.map((s) => {
    const title = L(s.title_ko, s.title_en) || L("추천", "Recommended");
    const subtitle = L(s.subtitle_ko, s.subtitle_en);
    // 탭: 자동 모드 + cat_1depth 2개 이상일 때 카테고리 탭
    const cats = Array.isArray(s.cat_1depth) ? s.cat_1depth : [];
    const showTabs = s.room_mode !== "manual" && cats.length >= 2;
    const activeTab = uiState.sectionTab[s.id] || (showTabs ? cats[0] : "__all__");
    const tabsHtml = showTabs
      ? `<div style="display:flex;gap:8px;margin:14px 0 4px">${cats
          .map((c) => {
            const on = c === activeTab;
            const label = c === "condo" ? L("콘도", "Condominium") : L("호텔", "Hotel");
            return `<button class="rec-tab" data-section="${escapeHtml(s.id)}" data-tab="${c}" style="border:none;border-radius:16px;padding:6px 16px;font-size:12.5px;cursor:pointer;font-weight:600;background:${on ? "#a68a5b" : "transparent"};color:${on ? "#fff" : "#666"}">${label}</button>`;
          })
          .join("")}</div>`
      : "";
    const rooms = sectionRooms(s, activeTab, placeById, allRooms, allProducts);
    const cards = rooms.length
      ? rooms.map((r) => roomCardHtml(r, placeById, allProducts, L)).join("")
      : `<div style="color:#aaa;font-size:13px;padding:24px 0">${L("표시할 객실이 없습니다.", "No rooms to show.")}</div>`;
    const viewAll = s.viewall_use
      ? `<a href="${escapeHtml(s.viewall_url || "#/")}" style="font-size:13px;color:#1a1f2e;font-weight:600;text-decoration:underline">${escapeHtml(L(s.viewall_label_ko, s.viewall_label_en) || L("전체 보기", "View All"))} →</a>`
      : "";
    // 4개까지는 한 줄, 5개 이상일 때만 좌우 화살표(슬라이드) 노출
    const hasSlide = rooms.length > 4;
    const arrows = hasSlide
      ? `<button class="rec-arrow rec-prev" data-dir="-1" style="position:absolute;left:-14px;top:38%;z-index:3;width:34px;height:34px;border-radius:50%;border:1px solid #e2e2e2;background:#fff;box-shadow:0 2px 8px rgba(0,0,0,.12);cursor:pointer;font-size:16px">‹</button>
          <button class="rec-arrow rec-next" data-dir="1" style="position:absolute;right:-14px;top:38%;z-index:3;width:34px;height:34px;border-radius:50%;border:1px solid #e2e2e2;background:#fff;box-shadow:0 2px 8px rgba(0,0,0,.12);cursor:pointer;font-size:16px">›</button>`
      : "";
    return `<section style="max-width:1100px;margin:34px auto 0;padding:0 24px">
        <div style="display:flex;align-items:center;justify-content:space-between">
          <div>
            <h2 style="font-size:20px;font-weight:800;color:#1a1f2e;margin:0">${escapeHtml(title)}</h2>
            ${subtitle ? `<div style="font-size:13px;color:#888;margin-top:3px">${escapeHtml(subtitle)}</div>` : ""}
          </div>
          ${viewAll}
        </div>
        ${tabsHtml}
        <div style="position:relative;margin-top:12px">
          ${arrows}
          <div class="rec-strip" style="display:flex;gap:16px;overflow-x:${hasSlide ? "auto" : "hidden"};scroll-behavior:smooth;padding:4px 2px 8px;scrollbar-width:none">${cards}</div>
        </div>
      </section>`;
  });
  return `<div style="padding-bottom:40px">${blocks.join("")}</div>`;
}

function wireMainSections(app) {
  // 탭 전환
  app.querySelectorAll(".rec-tab").forEach((btn) => btn.addEventListener("click", () => {
    uiState.sectionTab[btn.dataset.section] = btn.dataset.tab;
    renderMain(app);
  }));
  // 좌우 스크롤
  app.querySelectorAll(".rec-arrow").forEach((btn) => btn.addEventListener("click", () => {
    const strip = btn.parentElement.querySelector(".rec-strip");
    if (strip) strip.scrollBy({ left: (parseInt(btn.dataset.dir, 10) || 1) * 520, behavior: "smooth" });
  }));
  // 예약 확인 → 객실 상세
  app.querySelectorAll(".rec-cta[data-open-product]").forEach((btn) => btn.addEventListener("click", () => {
    openRoomDetail(btn.dataset.openProduct);
  }));
}

/* ─── 인원(객실별) 모델 ─── */
function defaultPax() { return { rooms: [{ adults: 2, children: 0, childAges: [] }] }; }
function normalizePax() {
  if (!uiState.pax || !Array.isArray(uiState.pax.rooms) || !uiState.pax.rooms.length) uiState.pax = defaultPax();
  return uiState.pax;
}
/** 총 인원·최대 객실 인원(가장 인원 많은 객실)·객실 수 */
function paxTotals(pax) {
  const rooms = (pax && pax.rooms) || [];
  let total = 0, maxRoom = 0;
  rooms.forEach((r) => { const g = (r.adults || 0) + (r.children || 0); total += g; if (g > maxRoom) maxRoom = g; });
  return { total, maxRoom, roomCount: rooms.length };
}

/* ─── 듀얼 캘린더 ─── */
function calYmdParts(ymd) { const p = String(ymd || "").split("-"); return { y: +p[0], m: +p[1], d: +p[2] }; }
function calFirstOfMonth(ymd) { const { y, m } = calYmdParts(ymd); return `${y}-${String(m).padStart(2, "0")}-01`; }
function calAddMonths(ymd, delta) { const { y, m } = calYmdParts(ymd); const dt = new Date(y, (m - 1) + delta, 1); return `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, "0")}-01`; }

function calMonthHtml(monthFirstYmd, ci, co, minYmd, lang) {
  const { y, m } = calYmdParts(monthFirstYmd);
  const firstDow = new Date(y, m - 1, 1).getDay();
  const dim = new Date(y, m, 0).getDate();
  const monthLabel = lang === "en" ? new Date(y, m - 1, 1).toLocaleString("en-US", { month: "short", year: "numeric" }) : `${y}년 ${m}월`;
  const dows = lang === "en" ? ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"] : ["일", "월", "화", "수", "목", "금", "토"];
  let cells = "";
  for (let i = 0; i < firstDow; i++) cells += `<div></div>`;
  for (let d = 1; d <= dim; d++) {
    const ymd = `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    const disabled = minYmd && ymd < minYmd;
    const isEnd = ymd === ci || ymd === co;
    const inRange = ci && co && ymd > ci && ymd < co;
    let bg = "transparent", col = "#333", fw = "400", rad = "50%";
    if (inRange) { bg = "#ede9fe"; rad = "4px"; }
    if (isEnd) { bg = "#7c3aed"; col = "#fff"; fw = "700"; rad = "50%"; }
    const base = `height:32px;display:flex;align-items:center;justify-content:center;font-size:12px;`;
    if (disabled) { cells += `<div style="${base}color:#ccc">${d}</div>`; continue; }
    cells += `<div class="cal-day" data-day="${ymd}" style="${base}border-radius:${rad};background:${bg};color:${col};font-weight:${fw};cursor:pointer">${d}</div>`;
  }
  return `<div style="flex:1;min-width:220px">
      <div style="text-align:center;font-size:13px;font-weight:700;margin-bottom:8px">${monthLabel}</div>
      <div style="display:grid;grid-template-columns:repeat(7,1fr);gap:2px;margin-bottom:4px">${dows.map((w, i) => `<div style="text-align:center;font-size:10px;color:${i === 0 ? "#e11d48" : i === 6 ? "#3667c9" : "#999"}">${w}</div>`).join("")}</div>
      <div style="display:grid;grid-template-columns:repeat(7,1fr);gap:2px">${cells}</div>
    </div>`;
}

function calendarPopoverHtml(ci, co, minYmd, L, lang) {
  const leftMonth = uiState.calMonth || calFirstOfMonth(ci || minYmd);
  const rightMonth = calAddMonths(leftMonth, 1);
  const canPrev = leftMonth > calFirstOfMonth(minYmd);
  return `<div class="cal-pop" style="position:absolute;top:100%;left:0;margin-top:8px;background:#fff;border:1px solid #ddd;border-radius:10px;box-shadow:0 8px 28px rgba(0,0,0,.2);padding:16px;z-index:40;color:#333;width:560px;max-width:92vw">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px">
        <button class="cal-prev" ${canPrev ? "" : "disabled"} style="border:none;background:#f2f2ee;border-radius:6px;width:30px;height:30px;cursor:${canPrev ? "pointer" : "not-allowed"};opacity:${canPrev ? 1 : 0.4}">‹</button>
        <span style="font-size:12px;color:#666">${escapeHtml(ci || L("체크인", "Check-in"))} → ${escapeHtml(co || L("체크아웃", "Check-out"))}</span>
        <button class="cal-next" style="border:none;background:#f2f2ee;border-radius:6px;width:30px;height:30px;cursor:pointer">›</button>
      </div>
      <div style="display:flex;gap:24px">${calMonthHtml(leftMonth, ci, co, minYmd, lang)}${calMonthHtml(rightMonth, ci, co, minYmd, lang)}</div>
      <div style="text-align:right;margin-top:12px"><button id="calDone" style="background:#7c3aed;color:#fff;border:none;border-radius:6px;padding:8px 20px;cursor:pointer;font-size:12.5px">${L("적용", "Apply")}</button></div>
    </div>`;
}

/* ─── 인원 팝오버(객실별) ─── */
function paxPopoverHtml(pax, L) {
  const tt = paxTotals(pax);
  const stepBtn = (label, dis, data) => `<button class="pax-step" ${data} ${dis ? "disabled" : ""} style="width:26px;height:26px;border-radius:50%;border:1px solid #ccc;background:#fff;font-size:15px;line-height:1;${dis ? "opacity:.35;cursor:not-allowed" : "cursor:pointer"}">${label}</button>`;
  const roomsHtml = pax.rooms.map((r, ri) => {
    const g = (r.adults || 0) + (r.children || 0);
    const ages = r.children > 0
      ? `<div style="margin:8px 0 2px">${r.childAges.map((a, ci) => `<div style="display:flex;align-items:center;gap:6px;margin-bottom:4px"><span style="font-size:11px;width:52px">${L("아동", "Child")} ${ci + 1}</span><select class="pax-age" data-room="${ri}" data-i="${ci}" style="flex:1;padding:4px"><option value="">${L("나이 선택", "Select age")}</option>${Array.from({ length: 18 }, (_, n) => `<option value="${n}" ${String(a) === String(n) ? "selected" : ""}>${L("만 " + n + "세", "Age " + n)}</option>`).join("")}</select></div>`).join("")}</div>`
      : "";
    return `<div style="border:1px solid #eee;border-radius:8px;padding:10px 12px;margin-bottom:10px">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px"><span style="font-size:13px;font-weight:700">${L("객실", "Room")} ${ri + 1}</span>${pax.rooms.length > 1 ? `<button class="pax-room-del" data-room="${ri}" style="border:none;background:none;color:#c0392b;font-size:11px;cursor:pointer">${L("삭제", "Remove")}</button>` : ""}</div>
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px"><div><div style="font-size:12.5px;font-weight:600">${L("성인", "Adults")}</div><div style="font-size:10px;color:#888">${L("최소 1명", "Min 1")}</div></div><div style="display:flex;align-items:center;gap:10px">${stepBtn("−", r.adults <= 1, `data-room="${ri}" data-field="adults" data-dir="-1"`)}<span style="min-width:16px;text-align:center">${r.adults}</span>${stepBtn("+", g >= 8, `data-room="${ri}" data-field="adults" data-dir="1"`)}</div></div>
        <div style="display:flex;justify-content:space-between;align-items:center"><div><div style="font-size:12.5px;font-weight:600">${L("아동", "Children")}</div><div style="font-size:10px;color:#888">${L("만 0~17세", "Age 0-17")}</div></div><div style="display:flex;align-items:center;gap:10px">${stepBtn("−", r.children <= 0, `data-room="${ri}" data-field="children" data-dir="-1"`)}<span style="min-width:16px;text-align:center">${r.children}</span>${stepBtn("+", g >= 8, `data-room="${ri}" data-field="children" data-dir="1"`)}</div></div>
        ${ages}
        <div style="font-size:10px;color:#aaa;margin-top:6px">${L("1객실 최대 8명", "Max 8 per room")}</div>
      </div>`;
  }).join("");
  const addBtn = pax.rooms.length < 5 ? `<button class="pax-room-add" style="width:100%;border:1px dashed #bbb;background:#fafafa;border-radius:8px;padding:8px;cursor:pointer;font-size:12.5px;color:#555;margin-bottom:8px">+ ${L("객실 추가", "Add room")}</button>` : "";
  return `<div class="pax-pop" style="position:absolute;top:100%;right:0;margin-top:8px;background:#fff;border:1px solid #ddd;border-radius:10px;box-shadow:0 8px 28px rgba(0,0,0,.2);padding:14px;width:300px;max-width:92vw;z-index:40;color:#333;max-height:70vh;overflow-y:auto">
      ${roomsHtml}${addBtn}
      <div style="font-size:11px;color:#888;border-top:1px solid #eee;padding-top:8px">${L("총", "Total")} ${tt.total}${L("명", "")} · ${tt.roomCount}${L("객실", " rooms")}</div>
      <button id="paxDone" style="width:100%;margin-top:10px;background:#7c3aed;color:#fff;border:none;border-radius:6px;padding:9px;cursor:pointer">${L("적용", "Apply")}</button>
    </div>`;
}

/* ─── 로딩 오버레이 ─── */
function showLoadingOverlay(text) {
  let ov = document.getElementById("loadingOverlay");
  if (!ov) { ov = document.createElement("div"); ov.id = "loadingOverlay"; document.body.appendChild(ov); }
  ov.style.cssText = "position:fixed;inset:0;z-index:9999;background:rgba(26,31,46,.72);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:16px;color:#fff";
  ov.innerHTML = `<div class="ld-spin"></div><div style="font-size:14px">${escapeHtml(text)}</div>`;
}
function hideLoadingOverlay() { const ov = document.getElementById("loadingOverlay"); if (ov) ov.remove(); }

/* ─── 공용 검색바 (메인·검색결과 공유) ─── */
function renderSearchBar(pax, draft, minYmd, L, topMargin) {
  const tt = paxTotals(pax);
  const dateLabel = `${draft.ci || L("체크인", "Check-in")}  →  ${draft.co || L("체크아웃", "Check-out")}`;
  const fieldLabel = (txt) => `<div style="color:rgba(255,255,255,.6);font-size:11px;margin-bottom:4px">${txt}</div>`;
  const calPopover = uiState.calOpen ? calendarPopoverHtml(draft.ci, draft.co, minYmd, L, uiState.lang) : "";
  const paxPopover = uiState.paxOpen ? paxPopoverHtml(pax, L) : "";
  return `<div style="max-width:1100px;margin:${topMargin};position:relative;z-index:20;background:#1a1f2e;border-radius:12px;padding:18px 26px;display:flex;align-items:flex-end;justify-content:center;gap:22px;flex-wrap:wrap;box-shadow:0 8px 26px rgba(0,0,0,.25)">
      <div style="color:#fff;font-size:13px;font-weight:700;padding-bottom:9px">Accommodation</div>
      <div class="cal-wrap" style="position:relative;flex:1;min-width:280px;max-width:440px">
        ${fieldLabel(L("일정 (체크인 → 체크아웃)", "Dates (check-in → check-out)"))}
        <button id="dateBtn" style="width:100%;text-align:left;background:#fff;border:none;border-radius:6px;padding:10px 14px;font-size:13px;cursor:pointer">📅 ${escapeHtml(dateLabel)}</button>
        ${calPopover}
      </div>
      <div class="pax-wrap" style="position:relative;flex:0 0 auto;min-width:180px">
        ${fieldLabel(L("인원 · 객실", "Guests · Rooms"))}
        <button id="paxBtn" style="width:100%;text-align:left;background:#fff;border:none;border-radius:6px;padding:10px 14px;font-size:13px;cursor:pointer">👥 ${L("총", "")} ${tt.total}${L("명", " guests")} · ${tt.roomCount}${L("객실", " rooms")} ▾</button>
        ${paxPopover}
      </div>
      <button id="mainSearch" style="background:#7c3aed;color:#fff;border:none;border-radius:6px;padding:12px 30px;font-size:14px;font-weight:600;cursor:pointer">${L("검색", "Search")}</button>
    </div>`;
}

function commitSearch(pax, draft) {
  uiState.search = { ci: draft.ci, co: draft.co, rooms: pax.rooms.map((r) => ({ adults: r.adults, children: r.children, childAges: [...r.childAges] })) };
  uiState.searchCheckin = draft.ci;
  uiState.searchCheckout = draft.co;
}

function wireSearchBar(app, ctx) {
  const { pax, draft, minYmd, L, rerender, onSearch } = ctx;
  app.querySelector("#dateBtn")?.addEventListener("click", () => {
    uiState.calOpen = !uiState.calOpen; uiState.paxOpen = false;
    if (uiState.calOpen) uiState.calMonth = calFirstOfMonth(draft.ci || minYmd);
    rerender();
  });
  app.querySelector(".cal-prev")?.addEventListener("click", () => { uiState.calMonth = calAddMonths(uiState.calMonth, -1); rerender(); });
  app.querySelector(".cal-next")?.addEventListener("click", () => { uiState.calMonth = calAddMonths(uiState.calMonth, 1); rerender(); });
  app.querySelectorAll(".cal-day").forEach((el) => el.addEventListener("click", () => {
    const day = el.dataset.day;
    if (!draft.ci || (draft.ci && draft.co) || day <= draft.ci) { draft.ci = day; draft.co = ""; }
    else { draft.co = day; }
    rerender();
  }));
  app.querySelector("#calDone")?.addEventListener("click", () => {
    if (draft.ci && !draft.co) draft.co = addCalendarDaysYmd(draft.ci, 1) || draft.ci;
    uiState.calOpen = false; rerender();
  });
  app.querySelector("#paxBtn")?.addEventListener("click", () => { uiState.paxOpen = !uiState.paxOpen; uiState.calOpen = false; rerender(); });
  app.querySelectorAll(".pax-step").forEach((btn) => btn.addEventListener("click", () => {
    const ri = parseInt(btn.dataset.room, 10); const field = btn.dataset.field; const dir = parseInt(btn.dataset.dir, 10);
    const room = pax.rooms[ri]; if (!room) return;
    const g = room.adults + room.children;
    if (field === "adults") { if (dir > 0) { if (g < 8) room.adults++; } else if (room.adults > 1) room.adults--; }
    else { if (dir > 0) { if (g < 8) { room.children++; room.childAges.push(""); } } else if (room.children > 0) { room.children--; room.childAges.pop(); } }
    rerender();
  }));
  app.querySelectorAll(".pax-age").forEach((sel) => sel.addEventListener("change", (e) => {
    const ri = parseInt(e.target.dataset.room, 10); const i = parseInt(e.target.dataset.i, 10);
    if (pax.rooms[ri]) pax.rooms[ri].childAges[i] = e.target.value;
  }));
  app.querySelector(".pax-room-add")?.addEventListener("click", () => { if (pax.rooms.length < 5) pax.rooms.push({ adults: 2, children: 0, childAges: [] }); rerender(); });
  app.querySelectorAll(".pax-room-del").forEach((btn) => btn.addEventListener("click", () => { const ri = parseInt(btn.dataset.room, 10); if (pax.rooms.length > 1) pax.rooms.splice(ri, 1); rerender(); }));
  app.querySelector("#paxDone")?.addEventListener("click", () => { uiState.paxOpen = false; rerender(); });
  app.querySelector("#mainSearch")?.addEventListener("click", () => {
    const badAges = pax.rooms.some((r) => r.children > 0 && r.childAges.some((a) => a === "" || a == null));
    if (badAges) { alert(L("아동 나이를 모두 선택하세요.", "Please select all child ages.")); uiState.paxOpen = true; rerender(); return; }
    if (!draft.co) draft.co = addCalendarDaysYmd(draft.ci, 1) || draft.ci;
    onSearch();
  });
}

function renderMain(app) {
  if (window.__heroTimer) { clearInterval(window.__heroTimer); window.__heroTimer = null; }
  const today = todayKstYmd();
  const L = (ko, en) => (uiState.lang === "en" ? en || ko || "" : ko || en || "");
  const pax = normalizePax();
  if (!uiState.searchDraft) {
    const ci0 = addCalendarDaysYmd(today, 7) || today;
    uiState.searchDraft = { ci: ci0, co: addCalendarDaysYmd(ci0, 1) || ci0 }; // 최초 1회만 기본 1박
  }
  const minYmd = today;
  const heroes = loadJson(STORAGE_MAIN_HERO, [])
    .filter((h) => h.media_type !== "video" && heroOn(h, today)) // 동영상은 프런트 미연동
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  const cfg = loadJson(STORAGE_MAIN_HERO_CFG, { autoplay: true, interval_sec: 5 });
  if (typeof uiState.heroIdx !== "number") uiState.heroIdx = 0;
  if (uiState.heroIdx >= heroes.length) uiState.heroIdx = 0;
  const cur = heroes[uiState.heroIdx];

  const heroInner = cur
    ? `${cur.pc_image ? `<img src="${escapeHtml(cur.pc_image)}" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover" onerror="this.style.display='none'">` : ""}
       <div style="position:absolute;inset:0;background:linear-gradient(rgba(0,0,0,.12),rgba(0,0,0,.5))"></div>
       <div style="position:relative;z-index:2;max-width:1100px;margin:0 auto;padding:64px 24px 90px;color:#fff">
         ${cur.subtitle_ko || cur.subtitle_en ? `<div style="font-size:14px;opacity:.9;margin-bottom:8px">${escapeHtml(L(cur.subtitle_ko, cur.subtitle_en))}</div>` : ""}
         <div style="font-size:32px;font-weight:800;line-height:1.25;white-space:pre-line">${escapeHtml(L(cur.title_ko, cur.title_en))}</div>
         ${cur.cta_use && (cur.cta_label_ko || cur.cta_label_en) ? `<a href="${escapeHtml(cur.cta_url || "#")}" ${String(cur.cta_url || "").startsWith("http") ? 'target="_blank" rel="noopener"' : ""} style="display:inline-block;margin-top:16px;background:rgba(255,255,255,.2);border:1px solid rgba(255,255,255,.65);color:#fff;padding:8px 18px;border-radius:4px;font-size:13px;text-decoration:none">${escapeHtml(L(cur.cta_label_ko, cur.cta_label_en))}</a>` : ""}
       </div>
       ${heroes.length > 1 ? `
         <button class="hero-prev" style="position:absolute;left:12px;top:44%;transform:translateY(-50%);z-index:3;background:rgba(0,0,0,.4);color:#fff;border:none;border-radius:50%;width:34px;height:34px;cursor:pointer;font-size:18px">‹</button>
         <button class="hero-next" style="position:absolute;right:12px;top:44%;transform:translateY(-50%);z-index:3;background:rgba(0,0,0,.4);color:#fff;border:none;border-radius:50%;width:34px;height:34px;cursor:pointer;font-size:18px">›</button>
         <div style="position:absolute;bottom:74px;left:50%;transform:translateX(-50%);z-index:3;display:flex;gap:6px">${heroes.map((_, i) => `<span style="width:8px;height:8px;border-radius:50%;background:${i === uiState.heroIdx ? "#fff" : "rgba(255,255,255,.4)"}"></span>`).join("")}</div>` : ""}`
    : `<div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;color:rgba(255,255,255,.55);font-size:13px">등록된 히어로 슬라이드가 없습니다 — 어드민 &gt; 화면관리 &gt; 메인관리</div>`;

  const heroHtml = `<div class="main-hero" style="position:relative;height:${cur ? "440px" : "220px"};background:#2b3245;overflow:hidden">${heroInner}</div>`;

  const searchBar = renderSearchBar(pax, uiState.searchDraft, minYmd, L, "-44px auto 0");

  const sectionsHtml = mainSectionsHtml(app, L, today);

  app.innerHTML = heroHtml + searchBar + sectionsHtml;
  wireMainSections(app);

  // 히어로 슬라이더 이벤트
  app.querySelector(".hero-prev")?.addEventListener("click", () => { uiState.heroIdx = (uiState.heroIdx - 1 + heroes.length) % heroes.length; renderMain(app); });
  app.querySelector(".hero-next")?.addEventListener("click", () => { uiState.heroIdx = (uiState.heroIdx + 1) % heroes.length; renderMain(app); });
  if (cfg.autoplay && heroes.length > 1) {
    window.__heroTimer = setInterval(() => { uiState.heroIdx = (uiState.heroIdx + 1) % heroes.length; renderMain(app); }, Math.max(1, cfg.interval_sec) * 1000);
  }

  // 검색바 (공용) — 검색 시 로딩 2초 후 검색결과로 이동
  wireSearchBar(app, {
    pax, draft: uiState.searchDraft, minYmd, L,
    rerender: () => renderMain(app),
    onSearch: () => {
      commitSearch(pax, uiState.searchDraft);
      showLoadingOverlay(L("검색 중…", "Searching…"));
      setTimeout(() => { location.hash = "#/search"; hideLoadingOverlay(); }, 2000);
    },
  });
}

/** 공용 리스팅 — 검색결과(mode="search") / 전체 둘러보기(mode="bridge") */
function renderListing(app, mode) {
  const L = (ko, en) => (uiState.lang === "en" ? en || ko || "" : ko || en || "");
  const today = todayKstYmd();
  const minYmd = today;
  const pax = normalizePax();
  if (!uiState.searchDraft) uiState.searchDraft = { ci: addCalendarDaysYmd(today, 7) || today, co: "" };
  if (mode === "bridge" && !uiState.searchDraft.co) uiState.searchDraft.co = addCalendarDaysYmd(uiState.searchDraft.ci, 1) || uiState.searchDraft.ci;

  const fKey = mode === "bridge" ? "bridgeFilter" : "searchFilter";
  if (!uiState[fKey]) uiState[fKey] = { order: "low", places: [], roomTypes: [] };
  const f = uiState[fKey];

  const rerender = () => renderListing(app, mode);
  const doSearch = () => {
    commitSearch(pax, uiState.searchDraft);
    uiState.calOpen = false; uiState.paxOpen = false;
    showLoadingOverlay(L("검색 중…", "Searching…"));
    setTimeout(() => { hideLoadingOverlay(); renderListing(app, mode); }, 2000);
  };
  const topBar = `<div style="padding:20px 24px 0">${renderSearchBar(pax, uiState.searchDraft, minYmd, L, "0 auto")}</div>`;
  const wireTop = () => wireSearchBar(app, { pax, draft: uiState.searchDraft, minYmd, L, rerender, onSearch: doSearch });

  // 조회 기준 (uiState.search). 브릿지는 검색 전이면 기본 조건으로 자동 조회
  const isValid = (x) => /^\d{4}-\d{2}-\d{2}$/.test(x.ci || "") && /^\d{4}-\d{2}-\d{2}$/.test(x.co || "") && (x.ci || "") < (x.co || "");
  let s = uiState.search || {};
  if (mode === "bridge" && !isValid(s)) { commitSearch(pax, uiState.searchDraft); s = uiState.search; }
  const ci = s.ci || "", co = s.co || "";
  const reqMax = paxTotals(s).maxRoom;

  if (!isValid(s)) {
    app.innerHTML = topBar + `<div style="max-width:1100px;margin:40px auto;padding:0 24px"><p style="color:#888">${L("검색 조건을 선택하고 검색을 눌러 주세요.", "Set your search and press Search.")}</p></div>`;
    wireTop();
    return;
  }

  // 대상: 노출 숙소의 노출 객실 → 예약가능(ok) 상품 중 최저가
  const allPlaces = loadJson(STORAGE_PLACES, []);
  const placeById = new Map(allPlaces.map((p) => [p.id, p]));
  const allRooms = loadJson(STORAGE_ROOMS, []);
  const allProducts = loadJson(STORAGE_PRODUCTS, []);
  const roomTypes = loadJson(STORAGE_ROOM_TYPES, []);
  const roomTypeName = new Map(roomTypes.map((rt) => [rt.id, rt.name]));

  const results = [];
  for (const room of allRooms) {
    if (room.visibility === "HIDE") continue;
    const pl = placeById.get(room.place_id);
    if (!pl || pl.visibility === "HIDE") continue;
    // 수용 필터: 요청 객실 중 최대 인원이 객실 최대 인원 초과 시 제외
    if (reqMax > 0 && room.max_occupancy != null && reqMax > Number(room.max_occupancy)) continue;
    const products = allProducts.filter((p) => p.room_id === room.id && p.visibility !== "N");
    let best = null;
    for (const p of products) {
      const ev = evaluateProductForStay(p, ci, co);
      if (ev.state !== "ok") continue;
      if (!best || ev.totalPrice < best.totalPrice) best = { product: p, ev };
    }
    if (!best) continue;
    results.push({ room, place: pl, product: best.product, price: best.ev.totalPrice });
  }

  const placeOptions = [...new Map(results.map((r) => [r.place.id, r.place])).values()];
  const typeOptions = [...new Set(results.map((r) => r.room.room_type_id).filter(Boolean))];

  let filtered = results.filter((r) => {
    if (f.places.length && !f.places.includes(r.place.id)) return false;
    if (f.roomTypes.length && !f.roomTypes.includes(r.room.room_type_id)) return false;
    return true;
  });
  filtered.sort((a, b) => (f.order === "high" ? b.price - a.price : a.price - b.price));

  // 좌측 필터 — search: 정렬+숙소+룸타입 / bridge: 룸타입만
  const orderPanel = `
    <div style="margin-bottom:22px">
      <div style="font-size:13px;font-weight:700;margin-bottom:8px">${L("정렬", "Order")}</div>
      ${[["low", L("낮은 가격순", "Low cost")], ["high", L("높은 가격순", "High cost")]]
        .map(([v, lb]) => `<label style="display:flex;align-items:center;gap:7px;font-size:12.5px;margin-bottom:6px;cursor:pointer"><input type="radio" name="ordf" class="sf-order" value="${v}" ${f.order === v ? "checked" : ""}>${lb}</label>`)
        .join("")}
    </div>`;
  const placePanel = `
    <div style="margin-bottom:22px">
      <div style="font-size:13px;font-weight:700;margin-bottom:8px">${L("숙소", "Place")}</div>
      <label style="display:flex;align-items:center;gap:7px;font-size:12.5px;margin-bottom:6px;cursor:pointer"><input type="checkbox" class="sf-place-all" ${f.places.length === 0 ? "checked" : ""}>${L("전체", "All")}</label>
      ${placeOptions
        .map((p) => `<label style="display:flex;align-items:center;gap:7px;font-size:12.5px;margin-bottom:6px;cursor:pointer"><input type="checkbox" class="sf-place" value="${escapeHtml(p.id)}" ${f.places.includes(p.id) ? "checked" : ""}>${escapeHtml(localizeField(p, "place_name") || p.place_name || "")}</label>`)
        .join("")}
    </div>`;
  const typePanel = `
    <div style="margin-bottom:22px">
      <div style="font-size:13px;font-weight:700;margin-bottom:8px">${L("룸타입", "Room Type")}</div>
      <div style="display:flex;flex-wrap:wrap;gap:6px">
        <button class="sf-type-all" style="border:none;border-radius:14px;padding:6px 13px;font-size:12px;cursor:pointer;font-weight:600;background:${f.roomTypes.length === 0 ? "#1a1f2e" : "#f0f0ec"};color:${f.roomTypes.length === 0 ? "#fff" : "#555"}">${L("전체", "All")}</button>
        ${typeOptions
          .map((tid) => { const on = f.roomTypes.includes(tid); return `<button class="sf-type" data-id="${escapeHtml(tid)}" style="border:none;border-radius:14px;padding:6px 13px;font-size:12px;cursor:pointer;font-weight:600;background:${on ? "#a68a5b" : "#f0f0ec"};color:${on ? "#fff" : "#555"}">${escapeHtml(roomTypeName.get(tid) || tid)}</button>`; })
          .join("")}
      </div>
    </div>`;
  const resetBtn = `<button id="sfReset" style="width:100%;border:1px solid #ddd;background:#fff;border-radius:6px;padding:9px;font-size:12.5px;cursor:pointer;color:#666">${L("초기화", "Reset")}</button>`;
  const filterPanel = `<aside style="flex:0 0 216px;width:216px;border:1px solid #ececec;border-radius:10px;padding:18px 16px;align-self:flex-start">${mode === "search" ? orderPanel + placePanel : ""}${typePanel}${resetBtn}</aside>`;

  // 결과 카드 — canonical 카드(productCardHtml)
  const maps = facilityMaps();
  const bedById = loadBedMap();
  const listHtml = filtered.length
    ? filtered.map((r) => productCardHtml(r.place, r.room, r.product, maps, bedById)).join("")
    : `<div style="border:1px solid #ececec;border-radius:12px;padding:48px;text-align:center;color:#999;font-size:14px">${L("조건에 맞는 예약 가능한 객실이 없습니다.", "No available rooms match your search.")}</div>`;

  const title = mode === "bridge" ? L("전체 숙소", "Accommodation") : L("검색 결과", "Search Result");
  app.innerHTML = topBar + `
    <div style="max-width:1100px;margin:24px auto 60px;padding:0 24px">
      <h1 style="font-size:22px;font-weight:800;color:#1a1f2e;margin:0 0 4px">${escapeHtml(title)}</h1>
      <p style="font-size:12.5px;color:#7c3aed;margin:0 0 20px">${L("로그인 회원은 회원 전용가로 예약할 수 있습니다.", "Signed-in members get member-only rates.")}</p>
      <div style="display:flex;gap:24px;align-items:flex-start">
        ${filterPanel}
        <div style="flex:1;display:flex;flex-direction:column;gap:16px;min-width:0">
          <div style="font-size:13px;color:#888">${L("총", "Total")} ${filtered.length}${L("건", "")}</div>
          ${listHtml}
        </div>
      </div>
    </div>`;

  // 이벤트
  wireTop();
  app.querySelectorAll(".sf-order").forEach((el) => el.addEventListener("change", () => { f.order = el.value; rerender(); }));
  app.querySelector(".sf-place-all")?.addEventListener("change", () => { f.places = []; rerender(); });
  app.querySelectorAll(".sf-place").forEach((el) => el.addEventListener("change", () => {
    const id = el.value;
    if (el.checked) f.places = [...f.places, id];
    else f.places = f.places.filter((x) => x !== id);
    rerender();
  }));
  app.querySelector(".sf-type-all")?.addEventListener("click", () => { f.roomTypes = []; rerender(); });
  app.querySelectorAll(".sf-type").forEach((el) => el.addEventListener("click", () => {
    const id = el.dataset.id;
    if (f.roomTypes.includes(id)) f.roomTypes = f.roomTypes.filter((x) => x !== id);
    else f.roomTypes = [...f.roomTypes, id];
    rerender();
  }));
  app.querySelector("#sfReset")?.addEventListener("click", () => { uiState[fKey] = { order: "low", places: [], roomTypes: [] }; rerender(); });
  // canonical 카드 이벤트: 상세보기 + 이미지 이전/다음
  app.querySelectorAll(".js-open-rd").forEach((btn) => btn.addEventListener("click", () => openRoomDetail(btn.getAttribute("data-product-id"))));
  const cardImgStep = (id, delta) => {
    const products = loadJson(STORAGE_PRODUCTS, []); const rooms = loadJson(STORAGE_ROOMS, []);
    const pr = products.find((x) => x.id === id); const room = rooms.find((r) => r.id === pr?.room_id);
    const n = roomImages(room).length; if (!n) return;
    uiState.cardImgIdx[id] = ((uiState.cardImgIdx[id] || 0) + delta + n) % n; rerender();
  };
  app.querySelectorAll("[data-pc-prev]").forEach((btn) => btn.addEventListener("click", (e) => { e.stopPropagation(); cardImgStep(btn.getAttribute("data-pc-prev"), -1); }));
  app.querySelectorAll("[data-pc-next]").forEach((btn) => btn.addEventListener("click", (e) => { e.stopPropagation(); cardImgStep(btn.getAttribute("data-pc-next"), 1); }));
}

function renderSearch(app) { renderListing(app, "search"); }

/* ─── Bridge page — 숙소별 리치 페이지 (숙소탭 + 히어로 + Overview + StickyNav + Rooms) ─── */
function renderBridge(app, category) {
  const L = (ko, en) => (uiState.lang === "en" ? en || ko || "" : ko || en || "");
  const today = todayKstYmd();
  const minYmd = today;
  const pax = normalizePax();
  if (!uiState.searchDraft) { const ci0 = addCalendarDaysYmd(today, 7) || today; uiState.searchDraft = { ci: ci0, co: addCalendarDaysYmd(ci0, 1) || ci0 }; }
  const isValid = (x) => /^\d{4}-\d{2}-\d{2}$/.test(x.ci || "") && /^\d{4}-\d{2}-\d{2}$/.test(x.co || "") && (x.ci || "") < (x.co || "");
  if (!isValid(uiState.search || {})) commitSearch(pax, uiState.searchDraft);
  const s = uiState.search;
  const ci = s.ci, co = s.co;

  const places = visiblePlacesByCategory(category);
  if (!places.length) {
    app.innerHTML = `<div class="home-wrap"><p class="home-desc">${escapeHtml(t("noData"))}</p><a href="#/" style="color:var(--link);font-size:14px">${escapeHtml(t("backHome"))}</a></div>`;
    return;
  }
  if (!uiState.selectedPlaceByCategory) uiState.selectedPlaceByCategory = {};
  const savedId = uiState.selectedPlaceByCategory[category];
  const selectedPlace = places.find((p) => p.id === savedId) || places[0];
  uiState.selectedPlaceByCategory[category] = selectedPlace.id;

  const maps = facilityMaps();
  const bedById = loadBedMap();

  // 숙소 탭
  const placeTabs = places.map((p) => {
    const name = escapeHtml(localizeField(p, "place_name") || p.place_name || "-");
    return `<button type="button" class="place-tab-btn ${p.id === selectedPlace.id ? "active" : ""}" data-place="${escapeHtml(p.id)}">${name}</button>`;
  }).join("");

  // Overview
  const checkinOut = `${escapeHtml(selectedPlace.check_in_time || "-")} / ${escapeHtml(selectedPlace.check_out_time || "-")}`;
  const desc = String(localizeField(selectedPlace, "description") || selectedPlace.description || "").trim();

  // Rooms — 선택 숙소 상품 → 예약가능 최저가 + Order/RoomType 필터
  const roomTypes = loadJson(STORAGE_ROOM_TYPES, []);
  const roomTypeName = new Map(roomTypes.map((rt) => [rt.id, rt.name]));
  if (!uiState.bridgeFilter) uiState.bridgeFilter = { order: "low", roomTypes: [] };
  const bf = uiState.bridgeFilter;
  const allRooms = loadJson(STORAGE_ROOMS, []);
  const allProducts = loadJson(STORAGE_PRODUCTS, []);
  const reqMax = paxTotals(s).maxRoom;
  const results = [];
  for (const room of allRooms) {
    if (room.place_id !== selectedPlace.id || room.visibility === "HIDE") continue;
    if (reqMax > 0 && room.max_occupancy != null && reqMax > Number(room.max_occupancy)) continue;
    const products = allProducts.filter((p) => p.room_id === room.id && p.visibility !== "N");
    let best = null;
    for (const p of products) {
      const ev = evaluateProductForStay(p, ci, co);
      if (ev.state !== "ok") continue;
      if (!best || ev.totalPrice < best.totalPrice) best = { product: p, ev };
    }
    if (!best) continue;
    results.push({ room, place: selectedPlace, product: best.product });
  }
  const typeOptions = [...new Set(results.map((r) => r.room.room_type_id).filter(Boolean))];
  let filtered = results.filter((r) => !bf.roomTypes.length || bf.roomTypes.includes(r.room.room_type_id));
  const priceOf = (r) => evaluateProductForStay(r.product, ci, co).totalPrice;
  filtered.sort((a, b) => (bf.order === "high" ? priceOf(b) - priceOf(a) : priceOf(a) - priceOf(b)));

  const orderPanel = `
    <div style="margin-bottom:22px">
      <div style="font-size:13px;font-weight:700;margin-bottom:8px">${L("정렬", "Order")}</div>
      ${[["low", L("낮은 가격순", "Low cost")], ["high", L("높은 가격순", "High cost")]]
        .map(([v, lb]) => `<label style="display:flex;align-items:center;gap:7px;font-size:12.5px;margin-bottom:6px;cursor:pointer"><input type="radio" name="bordf" class="bf-order" value="${v}" ${bf.order === v ? "checked" : ""}>${lb}</label>`).join("")}
    </div>`;
  const typePanel = `
    <div style="margin-bottom:22px">
      <div style="font-size:13px;font-weight:700;margin-bottom:8px">${L("룸타입", "Room Type")}</div>
      <div style="display:flex;flex-wrap:wrap;gap:6px">
        <button class="bf-type-all" style="border:none;border-radius:14px;padding:6px 13px;font-size:12px;cursor:pointer;font-weight:600;background:${bf.roomTypes.length === 0 ? "#1a1f2e" : "#f0f0ec"};color:${bf.roomTypes.length === 0 ? "#fff" : "#555"}">${L("전체", "All")}</button>
        ${typeOptions.map((tid) => { const on = bf.roomTypes.includes(tid); return `<button class="bf-type" data-id="${escapeHtml(tid)}" style="border:none;border-radius:14px;padding:6px 13px;font-size:12px;cursor:pointer;font-weight:600;background:${on ? "#a68a5b" : "#f0f0ec"};color:${on ? "#fff" : "#555"}">${escapeHtml(roomTypeName.get(tid) || tid)}</button>`; }).join("")}
      </div>
    </div>`;
  const filterPanel = `<aside style="flex:0 0 200px;width:200px;border:1px solid #ececec;border-radius:10px;padding:18px 16px;align-self:flex-start">${orderPanel}${typePanel}<button id="bfReset" style="width:100%;border:1px solid #ddd;background:#fff;border-radius:6px;padding:9px;font-size:12.5px;cursor:pointer;color:#666">${L("초기화", "Reset")}</button></aside>`;
  const listHtml = filtered.length
    ? filtered.map((r) => productCardHtml(r.place, r.room, r.product, maps, bedById)).join("")
    : `<div style="border:1px solid #ececec;border-radius:12px;padding:48px;text-align:center;color:#999;font-size:14px">${L("조건에 맞는 예약 가능한 객실이 없습니다.", "No available rooms match your search.")}</div>`;

  app.innerHTML = `
    <div class="place-selector"><div class="place-selector-inner">${placeTabs}</div></div>
    ${heroFullwidthHtml(selectedPlace)}
    <nav class="place-nav">
      <div class="place-nav-inner">
        <button type="button" class="place-nav-btn active" data-nav="overview">${escapeHtml(t("navOverview"))}</button>
        <button type="button" class="place-nav-btn" data-nav="rooms">${escapeHtml(t("navRooms"))}</button>
        <button type="button" class="place-nav-btn" data-nav="detail">${escapeHtml(t("navDetail"))}</button>
        <button type="button" class="place-nav-btn" data-nav="policies">${escapeHtml(t("navPolicies"))}</button>
        <button type="button" class="place-nav-btn" data-nav="location">${escapeHtml(t("navLocation"))}</button>
      </div>
    </nav>
    <div class="content-wrap">
      <section id="sec-overview" class="sec-overview">
        <div class="overview-grid">
          <div><div class="overview-item-label">${escapeHtml(t("checkinOut"))}</div><div class="overview-item-value">${checkinOut}</div></div>
          <div><div class="overview-item-label">${escapeHtml(t("featured"))}</div><div class="overview-chips">${featuredChipHtml(selectedPlace, maps)}</div></div>
        </div>
        ${desc ? `<div style="margin-top:12px;padding-top:12px;border-top:1px solid #f0f0ea;font-size:13px;color:#666;line-height:1.6">${escapeHtml(desc)}</div>` : ""}
      </section>
      <section id="sec-rooms" class="sec-rooms">
        <div style="padding:16px 0 4px"><h2 style="font-size:20px;font-weight:800;color:#1a1f2e;margin:0">${escapeHtml(t("navRooms"))}</h2></div>
        ${renderSearchBar(pax, uiState.searchDraft, minYmd, L, "8px 0 0")}
        <div style="display:flex;gap:24px;align-items:flex-start;margin-top:20px">
          ${filterPanel}
          <div style="flex:1;display:flex;flex-direction:column;gap:16px;min-width:0">
            <div style="font-size:13px;color:#888">${L("총", "Total")} ${filtered.length}${L("건", "")}</div>
            ${listHtml}
          </div>
        </div>
      </section>
    </div>`;

  /* 이벤트 */
  // 숙소 탭
  app.querySelectorAll(".place-tab-btn").forEach((btn) => btn.addEventListener("click", () => {
    uiState.selectedPlaceByCategory[category] = btn.getAttribute("data-place");
    renderBridge(app, category);
  }));
  // Sticky Nav
  const navTabMap = { detail: "detail", policies: "policy", location: "location" };
  app.querySelectorAll("[data-nav]").forEach((btn) => btn.addEventListener("click", () => {
    const nav = btn.getAttribute("data-nav");
    if (nav === "overview") document.getElementById("sec-overview")?.scrollIntoView({ behavior: "smooth" });
    else if (nav === "rooms") document.getElementById("sec-rooms")?.scrollIntoView({ behavior: "smooth" });
    else if (navTabMap[nav]) { uiState.placeLayer.open = true; uiState.placeLayer.placeId = selectedPlace.id; uiState.placeLayer.tab = navTabMap[nav]; renderPlaceLayer(); }
  }));
  // 히어로 숙소 안내 버튼
  app.querySelectorAll(".js-open-place-layer").forEach((btn) => btn.addEventListener("click", () => {
    uiState.placeLayer.open = true; uiState.placeLayer.placeId = btn.getAttribute("data-place"); uiState.placeLayer.tab = "detail"; renderPlaceLayer();
  }));
  wireHero(selectedPlace);
  // 공용 검색바
  wireSearchBar(app, {
    pax, draft: uiState.searchDraft, minYmd, L,
    rerender: () => renderBridge(app, category),
    onSearch: () => { commitSearch(pax, uiState.searchDraft); uiState.calOpen = false; uiState.paxOpen = false; showLoadingOverlay(L("검색 중…", "Searching…")); setTimeout(() => { hideLoadingOverlay(); renderBridge(app, category); }, 2000); },
  });
  // Rooms 필터
  app.querySelectorAll(".bf-order").forEach((el) => el.addEventListener("change", () => { bf.order = el.value; renderBridge(app, category); }));
  app.querySelector(".bf-type-all")?.addEventListener("click", () => { bf.roomTypes = []; renderBridge(app, category); });
  app.querySelectorAll(".bf-type").forEach((el) => el.addEventListener("click", () => {
    const id = el.dataset.id;
    if (bf.roomTypes.includes(id)) bf.roomTypes = bf.roomTypes.filter((x) => x !== id);
    else bf.roomTypes = [...bf.roomTypes, id];
    renderBridge(app, category);
  }));
  app.querySelector("#bfReset")?.addEventListener("click", () => { uiState.bridgeFilter = { order: "low", roomTypes: [] }; renderBridge(app, category); });
  // 카드 이벤트
  app.querySelectorAll(".js-open-rd").forEach((btn) => btn.addEventListener("click", () => openRoomDetail(btn.getAttribute("data-product-id"))));
  const cardImgStep = (id, delta) => {
    const products = loadJson(STORAGE_PRODUCTS, []); const rooms = loadJson(STORAGE_ROOMS, []);
    const pr = products.find((x) => x.id === id); const room = rooms.find((r) => r.id === pr?.room_id);
    const n = roomImages(room).length; if (!n) return;
    uiState.cardImgIdx[id] = ((uiState.cardImgIdx[id] || 0) + delta + n) % n; renderBridge(app, category);
  };
  app.querySelectorAll("[data-pc-prev]").forEach((btn) => btn.addEventListener("click", (e) => { e.stopPropagation(); cardImgStep(btn.getAttribute("data-pc-prev"), -1); }));
  app.querySelectorAll("[data-pc-next]").forEach((btn) => btn.addEventListener("click", (e) => { e.stopPropagation(); cardImgStep(btn.getAttribute("data-pc-next"), 1); }));
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

  /* 기본 정보 (Information) — 객실유형 · 인원 · 크기 · 침대 (객실특징·엑스트라베드 폐기) */
  const info = document.getElementById("rdInfo");
  const sizeText = room.room_size_sqm != null && room.room_size_sqm !== ""
    ? `${room.room_size_sqm}㎡`
    : "-";
  const rtName = (loadJson(STORAGE_ROOM_TYPES, []).find((rt) => rt.id === room.room_type_id) || {}).name || "";
  info.innerHTML = `
    ${rtName ? `<li>
      <span class="rd-info-label">객실유형</span>
      ${escapeHtml(rtName)}
    </li>` : ""}
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

  if (window.__heroTimer) { clearInterval(window.__heroTimer); window.__heroTimer = null; }
  const { parts } = parseHash();
  if (parts[0] === "bridge") {
    renderBridge(app, parts[1] === "CONDO" ? "CONDO" : "HOTEL");
  } else if (parts[0] === "search") {
    renderSearch(app);
  } else {
    renderMain(app);
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
  document.getElementById("signinBtn")?.addEventListener("click", () => {
    alert("로그인 / 회원가입은 프로토타입 범위 밖입니다. (목업 버튼)");
  });
  // 팝오버(캘린더·인원) 바깥 클릭 시 닫힘 — 메인·검색결과·브릿지
  document.addEventListener("click", (e) => {
    const { parts } = parseHash();
    let changed = false;
    if (uiState.paxOpen && !e.target.closest(".pax-wrap")) { uiState.paxOpen = false; changed = true; }
    if (uiState.calOpen && !e.target.closest(".cal-wrap")) { uiState.calOpen = false; changed = true; }
    if (changed) {
      const app = document.getElementById("app"); if (!app) return;
      if (parts[0] === "bridge") renderBridge(app, parts[1] === "CONDO" ? "CONDO" : "HOTEL");
      else if (parts[0] === "search") renderSearch(app);
      else renderMain(app);
    }
  });
  window.addEventListener("hashchange", render);
  render();
});
