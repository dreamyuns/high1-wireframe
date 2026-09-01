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
/* 티켓 도메인 (어드민과 공유) */
const STORAGE_TICKET_CATEGORIES = "high1_ticket_categories_v1";
const STORAGE_COUPON_SPECS      = "high1_coupon_specs_v1";
const STORAGE_TICKET_PRODUCTS   = "high1_ticket_products_v1";
const STORAGE_TICKET_MARGIN     = "high1_ticket_margin_master_v1";
const STORAGE_TICKET_ORDERS     = "high1_ticket_orders_v1";   // 구매 주문(프런트 쓰기)
const STORAGE_TICKET_COUPONS    = "high1_coupons_v1";          // 발급 쿠폰(프런트 쓰기)
const DEFAULT_TICKET_MARGIN_FRONT = { type: "amount", value: "30000" }; // 전역 디폴트 (정책 v0.11 §11)
/* 로그인/회원 (프로토타입 목업) */
const STORAGE_MEMBERS = "high1_members_v1";   // [{email, password}]
const DEMO_LOGIN = { email: "demo@high1.com", password: "demo" }; // 로그인 화면 기본 프리필(데모 계정)
const STORAGE_SESSION = "high1_session_v1";    // { email } 로그인 세션
const STORAGE_RESV    = "high1_reservations_v1"; // 숙소 예약(프런트 쓰기)
const STORAGE_PROFILE = "high1_profile_v1";      // 회원 프로필(이메일별)

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
  lang: ["en", "zh", "ko"].includes(localStorage.getItem("high1_front_v02_lang")) ? localStorage.getItem("high1_front_v02_lang") : "ko",
  searchCheckin: "",
  searchCheckout: "",
  cardImgIdx: {},
  placeLayer: { open: false, placeId: "", tab: "detail" },
  roomDetail: { open: false, productId: "" },
  searchDomain: "acc",       // acc | ticket (검색바 도메인 토글)
  ticketUseDate: "",          // 티켓 검색 사용일(하루)
  ticketDetailTab: "select",  // 티켓 상세 탭
  ticketQty: {},              // 상세: coupon level별 수량 { level: n }
  auth: { step: "email", email: DEMO_LOGIN.email, isNew: false, next: "", err: "" }, // 로그인 흐름 상태(데모 계정 기본 프리필)
  booking: null,              // 숙소 예약 진행 컨텍스트 {productId,ci,co,pax,guest,agree,holdUntil,result}
  myFilter: { domain: "all", tab: "current" }, // 마이페이지 목록 필터
  pwVerified: false,          // 비밀번호 변경 세션 인증 여부
};

/* ─── 로그인/회원 (프로토타입 목업) ─── */
function loadMembers() { return ldJson(STORAGE_MEMBERS, []); }
function saveMembers(v) { localStorage.setItem(STORAGE_MEMBERS, JSON.stringify(v || [])); }
function findMember(email) { const e = String(email || "").trim().toLowerCase(); return loadMembers().find((m) => String(m.email || "").toLowerCase() === e) || null; }
function currentUser() { const s = ldJson(STORAGE_SESSION, null); return s && s.email ? s : null; }
function setSession(email) { localStorage.setItem(STORAGE_SESSION, JSON.stringify({ email })); }
function logout() { localStorage.removeItem(STORAGE_SESSION); }
/** 로그인 필요 화면 진입 시 호출 — 미로그인이면 로그인으로 유도(next 저장) */
function requireLogin(nextHash) {
  if (currentUser()) return true;
  uiState.auth = { step: "email", email: DEMO_LOGIN.email, isNew: false, next: nextHash || location.hash, err: "" };
  location.hash = "#/login";
  return false;
}

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

  return `<article class="product-card js-book-card" id="pcard-${escapeHtml(product.id)}" data-product-id="${escapeHtml(product.id)}">
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

/* 티켓 추천 섹션 — 대상 상품 (수동/자동) */
function ticketSectionProducts(s, gmap) {
  let list = loadTicketProducts().filter((p) => ticketVisibleNow(p, gmap));
  if (s.ticket_mode === "manual") {
    const ids = Array.isArray(s.ticket_product_ids) ? s.ticket_product_ids : [];
    const byId = new Map(list.map((p) => [p.id, p]));
    return ids.map((id) => byId.get(id)).filter(Boolean); // 지정 순서 유지
  }
  const cats = Array.isArray(s.ticket_cats) ? s.ticket_cats : [];
  if (cats.length) list = list.filter((p) => cats.includes(p.category_1));
  if (s.ticket_sort === "name") list.sort((a, b) => a.name_en.localeCompare(b.name_en));
  else list.sort((a, b) => ticketMinPrice(a, gmap) - ticketMinPrice(b, gmap));
  return list.slice(0, 12);
}
/* 티켓 추천 카드 — 숙소 추천 카드(.rec-card)와 동일 규격 */
function ticketRecCardHtml(p, gmap, L) {
  const img = ticketImg(p);
  const thumb = img
    ? `<img src="${escapeHtml(img)}" alt="" style="width:100%;height:100%;object-fit:cover">`
    : `<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;color:#bbb;font-size:12px;background:#f1f1ee">No Image</div>`;
  const min = ticketMinPrice(p, gmap);
  const g = gmap.get(p.spec_coupon_id);
  const cat = ticketCatByKo(p.category_1) || {};
  const catLabel = ticketCatEnLabel(p);
  const priceHtml = `<span style="font-size:15px;font-weight:800;color:#1a1f2e">${formatWon(min)} ~</span>`;
  return `<div class="rec-card js-tkrec-card" data-cat="${escapeHtml(p.category_1)}" data-pid="${escapeHtml(p.id)}" style="flex:0 0 240px;width:240px;border:1px solid #ececec;border-radius:10px;overflow:hidden;background:#fff;display:flex;flex-direction:column;cursor:pointer">
      <div style="width:100%;aspect-ratio:4/3;background:#f1f1ee">${thumb}</div>
      <div style="padding:11px 12px 13px;display:flex;flex-direction:column;gap:5px;flex:1">
        <div style="font-size:11px;color:#8a8a8a">${escapeHtml(catLabel)}</div>
        <div style="font-size:14px;font-weight:700;color:#222;line-height:1.35;min-height:38px">${escapeHtml(p.name_en)}</div>
        <div style="font-size:11px;color:#666;display:flex;flex-direction:column;gap:2px"><span>🎫 ${L("오픈형", "Open")}</span><span>👥 ${ticketPaxLabel(g, L)}</span></div>
        <div style="text-align:right;margin-top:auto;padding-top:6px"><span style="font-size:11px;color:#888">${L("최저", "From")}</span> ${priceHtml}</div>
        <button class="rec-cta" style="width:100%;margin-top:6px;background:#1a1f2e;color:#fff;border:none;border-radius:6px;padding:9px;font-size:12.5px;font-weight:600;cursor:pointer">${L("예약하기", "Book")}</button>
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
  const gmapT = specGroupsMap();
  if (!uiState.sectionTab) uiState.sectionTab = {};

  const blocks = sections.map((s) => {
    // ── 티켓 전용 섹션 분기 ──
    if (s.type === "ticket") {
      const tTitle = L(s.title_ko, s.title_en) || L("추천 티켓", "Recommended Tickets");
      const tSub = L(s.subtitle_ko, s.subtitle_en);
      const tProds = ticketSectionProducts(s, gmapT);
      const tCards = tProds.length
        ? tProds.map((p) => ticketRecCardHtml(p, gmapT, L)).join("")
        : `<div style="color:#aaa;font-size:13px;padding:24px 0">${L("표시할 티켓이 없습니다.", "No tickets to show.")}</div>`;
      const tViewAll = s.viewall_use
        ? `<a href="#/ticket/search" style="font-size:13px;color:#1a1f2e;font-weight:600;text-decoration:underline">${escapeHtml(L(s.viewall_label_ko, s.viewall_label_en) || L("전체 보기", "View All"))} →</a>`
        : "";
      const tSlide = tProds.length > 4;
      const tArrows = tSlide
        ? `<button class="rec-arrow rec-prev" data-dir="-1" style="position:absolute;left:-14px;top:38%;z-index:3;width:34px;height:34px;border-radius:50%;border:1px solid #e2e2e2;background:#fff;box-shadow:0 2px 8px rgba(0,0,0,.12);cursor:pointer;font-size:16px">‹</button><button class="rec-arrow rec-next" data-dir="1" style="position:absolute;right:-14px;top:38%;z-index:3;width:34px;height:34px;border-radius:50%;border:1px solid #e2e2e2;background:#fff;box-shadow:0 2px 8px rgba(0,0,0,.12);cursor:pointer;font-size:16px">›</button>`
        : "";
      return `<section style="max-width:1100px;margin:34px auto 0;padding:0 24px">
        <div style="display:flex;align-items:center;justify-content:space-between">
          <div><h2 style="font-size:20px;font-weight:800;color:#1a1f2e;margin:0">${escapeHtml(tTitle)}</h2>${tSub ? `<div style="font-size:13px;color:#888;margin-top:3px">${escapeHtml(tSub)}</div>` : ""}</div>
          ${tViewAll}
        </div>
        <div style="position:relative;margin-top:12px">${tArrows}<div class="rec-strip" style="display:flex;gap:16px;overflow-x:${tSlide ? "auto" : "hidden"};scroll-behavior:smooth;padding:4px 2px 8px;scrollbar-width:none">${tCards}</div></div>
      </section>`;
    }
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
  // 티켓 추천 카드 → 해당 카테고리 브릿지
  app.querySelectorAll(".js-tkrec-card").forEach((c) => c.addEventListener("click", () => {
    uiState.ticketFocusId = c.dataset.pid;
    location.hash = "#/ticket/bridge/" + encodeURIComponent(c.dataset.cat);
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
function renderSearchBar(pax, draft, minYmd, L, topMargin, opts) {
  const tt = paxTotals(pax);
  const dateLabel = `${draft.ci || L("체크인", "Check-in")}  →  ${draft.co || L("체크아웃", "Check-out")}`;
  const fieldLabel = (txt) => `<div style="color:rgba(255,255,255,.6);font-size:11px;margin-bottom:4px">${txt}</div>`;
  const calPopover = uiState.calOpen ? calendarPopoverHtml(draft.ci, draft.co, minYmd, L, uiState.lang) : "";
  const paxPopover = uiState.paxOpen ? paxPopoverHtml(pax, L) : "";
  const isTicket = uiState.searchDomain === "ticket";
  // 브릿지(숙소 상세)는 도메인 고정이므로 셀렉트 숨김
  const domainSel = (opts && opts.hideDomain) ? "" : `<div style="flex:0 0 auto">
      ${fieldLabel(L("구분", "Domain"))}
      <select id="domainSel" style="background:#fff;border:none;border-radius:6px;padding:10px 12px;font-size:13px;font-weight:700;cursor:pointer">
        <option value="acc" ${!isTicket ? "selected" : ""}>Accommodation</option>
        <option value="ticket" ${isTicket ? "selected" : ""}>Ticket</option>
      </select>
    </div>`;
  if (isTicket) {
    if (!uiState.ticketUseDate) uiState.ticketUseDate = addCalendarDaysYmd(minYmd, 7) || minYmd; // 사용일 디폴트 = 오늘+7일
    return `<div style="max-width:1100px;margin:${topMargin};position:relative;z-index:20;background:#1a1f2e;border-radius:12px;padding:18px 26px;display:flex;align-items:flex-end;justify-content:center;gap:22px;flex-wrap:wrap;box-shadow:0 8px 26px rgba(0,0,0,.25)">
      ${domainSel}
      <div style="flex:1;min-width:280px;max-width:440px">
        ${fieldLabel(L("사용일 (하루 선택)", "Usage date (single day)"))}
        <input type="date" id="tUseDate" min="${minYmd || ""}" value="${escapeHtml(uiState.ticketUseDate || "")}" style="width:100%;background:#fff;border:none;border-radius:6px;padding:10px 14px;font-size:13px;cursor:pointer">
      </div>
      <button id="mainSearch" style="background:#7c3aed;color:#fff;border:none;border-radius:6px;padding:12px 30px;font-size:14px;font-weight:600;cursor:pointer">${L("검색", "Search")}</button>
    </div>`;
  }
  return `<div style="max-width:1100px;margin:${topMargin};position:relative;z-index:20;background:#1a1f2e;border-radius:12px;padding:18px 26px;display:flex;align-items:flex-end;justify-content:center;gap:22px;flex-wrap:wrap;box-shadow:0 8px 26px rgba(0,0,0,.25)">
      ${domainSel}
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
  // 도메인 토글(Accommodation/Ticket) + 티켓 사용일
  app.querySelector("#domainSel")?.addEventListener("change", (e) => {
    const toTicket = e.target.value === "ticket";
    uiState.searchDomain = toTicket ? "ticket" : "acc";
    uiState.calOpen = false; uiState.paxOpen = false;
    const onTicketRoute = parseHash().parts[0] === "ticket";
    // 티켓 선택 시 검색결과로 자동 이동하지 않음 — 검색바만 티켓 모드로 전환(검색 버튼으로만 이동)
    if (!toTicket && onTicketRoute) { location.hash = "#/"; return; }
    rerender();
  });
  app.querySelector("#tUseDate")?.addEventListener("change", (e) => { uiState.ticketUseDate = e.target.value; });
  if (uiState.searchDomain === "ticket") {
    app.querySelector("#mainSearch")?.addEventListener("click", () => {
      const d = app.querySelector("#tUseDate");
      uiState.ticketUseDate = d ? d.value : uiState.ticketUseDate;
      showLoadingOverlay(L("티켓 검색 중…", "Searching tickets…"));
      setTimeout(() => { hideLoadingOverlay(); location.hash = "#/ticket/search"; render(); }, 400);
    });
    return; // 티켓 모드는 날짜/인원 팝오버 배선 불필요
  }
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
  app.querySelectorAll(".js-open-rd").forEach((btn) => btn.addEventListener("click", (e) => { e.stopPropagation(); openRoomDetail(btn.getAttribute("data-product-id")); }));
  app.querySelectorAll(".js-book-card").forEach((card) => card.addEventListener("click", () => startBooking(card.getAttribute("data-product-id"), { loading: true })));
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
        ${desc ? `<div class="place-desc" style="margin-top:16px;padding-top:16px;border-top:1px solid #f0f0ea">
          <div class="overview-item-label">Description</div>
          <div class="place-desc-html" style="font-size:13px;color:#666;line-height:1.6">${richTextOrParagraph(desc, "")}</div>
        </div>` : ""}
      </section>
      <section id="sec-rooms" class="sec-rooms">
        <div style="padding:16px 0 4px"><h2 style="font-size:20px;font-weight:800;color:#1a1f2e;margin:0">${escapeHtml(t("navRooms"))}</h2></div>
        ${renderSearchBar(pax, uiState.searchDraft, minYmd, L, "8px 0 0", { hideDomain: true })}
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
  app.querySelectorAll(".js-open-rd").forEach((btn) => btn.addEventListener("click", (e) => { e.stopPropagation(); openRoomDetail(btn.getAttribute("data-product-id")); }));
  app.querySelectorAll(".js-book-card").forEach((card) => card.addEventListener("click", () => startBooking(card.getAttribute("data-product-id"), { loading: true })));
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

  /* ─ 객실 설명 (최상단, 콘텐츠=객실 통일 v1.3) — INFORMATION 위에 렌더 ─ */
  const roomDescHtml =
    (uiState.lang === "zh" && room.description_zh) || room.description_en || room.description_zh || "";
  const descEl = document.getElementById("rdDesc");
  if (descEl) {
    if (String(roomDescHtml).trim()) {
      descEl.innerHTML = `<h3 class="rd-section-title">Room Description</h3><div class="rd-desc-body">${richTextOrParagraph(roomDescHtml, "")}</div>`;
      descEl.style.display = "";
    } else { descEl.innerHTML = ""; descEl.style.display = "none"; }
  }

  /* ─ 섹션 목록 구성 (데이터 없으면 섹션 자체 미생성) — 상품 콘텐츠 폐지, 모두 객실에서 ─ */
  const rdSections = [];

  // ① 객실정책 (국문 미사용 — 중문 접속 시 중문, 없으면 영문. 구버전 policy_html 폴백)
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

  /* ─ 섹션 콘텐츠 ─ (섹션 점프 내비게이션은 제거 — 콘텐츠가 아래 전부 노출됨) */
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
    startBooking(product.id);
  };
}

/* ═══════════════════ 티켓 도메인 (프런트) ═══════════════════ */
function ldJson(k, f) { try { const r = localStorage.getItem(k); return r ? JSON.parse(r) : f; } catch { return f; } }
function loadTicketCategories() { return ldJson(STORAGE_TICKET_CATEGORIES, []); }
function loadCouponSpecs() { return ldJson(STORAGE_COUPON_SPECS, []); }
function loadTicketProducts() { return ldJson(STORAGE_TICKET_PRODUCTS, []); }
function normalizeTicketMarginF(raw) {
  const r = raw && typeof raw === "object" ? raw : {};
  if (r.categories || r.overrides) return { categories: r.categories || {}, overrides: r.overrides || {} };
  return { categories: {}, overrides: { ...r } }; // 레거시 flat → overrides
}
function loadTicketMargin() { return normalizeTicketMarginF(ldJson(STORAGE_TICKET_MARGIN, {})); }
function loadTicketOrders() { return ldJson(STORAGE_TICKET_ORDERS, []); }
function saveTicketOrders(v) { localStorage.setItem(STORAGE_TICKET_ORDERS, JSON.stringify(v || [])); }
function loadTicketCoupons() { return ldJson(STORAGE_TICKET_COUPONS, []); }
function saveTicketCoupons(v) { localStorage.setItem(STORAGE_TICKET_COUPONS, JSON.stringify(v || [])); }

const isMarginEntryF = (e) => e && (e.type === "amount" || e.type === "rate");
/** 쿠폰ID 적용 마진 (우선순위: 쿠폰ID 개별 > 2뎁스 > 1뎁스 > 전역) — 어드민 getTicketMargin과 동일 (정책 v0.11 §11.3) */
function getTicketMarginFront(couponId) {
  const m = loadTicketMargin();
  const ov = couponId && m.overrides[couponId];
  if (isMarginEntryF(ov)) return { type: ov.type, value: String(ov.value ?? "") };
  const g = specGroupsMap().get(couponId);
  const cat1 = g ? g.category || "" : "", cat2 = g ? g.product_type || "" : "";
  const k2 = cat1 && cat2 ? `${cat1}>${cat2}` : "";
  if (k2 && isMarginEntryF(m.categories[k2])) return { type: m.categories[k2].type, value: String(m.categories[k2].value ?? "") };
  if (cat1 && isMarginEntryF(m.categories[cat1])) return { type: m.categories[cat1].type, value: String(m.categories[cat1].value ?? "") };
  return { ...DEFAULT_TICKET_MARGIN_FRONT };
}
/** 프런트 단독 데모용 티켓 더미 시드 — 어드민 데이터가 없을 때만 주입(어드민과 동일 셋). */
function svgPh(label, bg) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="640" height="384"><rect width="640" height="384" fill="${bg}"/><text x="320" y="205" font-family="sans-serif" font-size="30" fill="#fff" text-anchor="middle">${label}</text></svg>`;
  return "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg);
}
function ensureTicketFrontSeed() {
  if (localStorage.getItem(STORAGE_TICKET_PRODUCTS) || localStorage.getItem(STORAGE_TICKET_CATEGORIES)) return; // 어드민/기존 데이터 보존
  const T = "2026-07-09T00:00:00.000Z";
  const ADDR = "265, High1-gil, Gohan-eup, Jeongseon-gun, Gangwon-do, Korea";
  const catC = (label, color, ov) => ({
    hero_image_meta: [{ data_url: svgPh(label, color) }], overview_en: ov, overview_zh: "",
    detail_html_en: `<h3>${label}</h3><p>${label} 상세 소개(프로토타입 더미).</p><img src="${svgPh(label + " Detail", color)}" style="max-width:100%;height:auto;display:block;border-radius:8px;margin-top:8px" />`, detail_html_zh: "",
    guide_html_en: `<ul><li>Show the issued 12-digit coupon barcode at the on-site POS/KIOSK.</li><li>Open ticket — free entry within the valid period.</li><li>One coupon per person.</li></ul>`, guide_html_zh: "",
    policy_html_en: `<ul><li>Cancellation follows the valid end date — full refund if unused before the end date.</li><li>No refund after on-site use.</li></ul>`, policy_html_zh: "",
    address_en: ADDR, address_zh: "",
  });
  localStorage.setItem(STORAGE_TICKET_CATEGORIES, JSON.stringify([
    { id: "tc_waterpark", code: "TC-001", name_ko: "워터파크", name_en: "Water Park", name_zh: "水上乐园", parent_id: null, order: 1, ...catC("Water Park", "#38bdf8", "High1 Water World — open-type tickets, free use within the valid period.") },
    { id: "tc_ski", code: "TC-002", name_ko: "스키", name_en: "Ski", name_zh: "滑雪", parent_id: null, order: 2, hero_image_meta: [{ data_url: svgPh("Ski", "#6366f1") }] },
    { id: "tc_ski_lift", code: "TC-003", name_ko: "리프트권", name_en: "Lift Pass", name_zh: "缆车票", parent_id: "tc_ski", order: 1, ...catC("Ski Lift Pass", "#6366f1", "High1 ski lift pass. 4-hour / 7-hour / day.") },
    { id: "tc_ski_rental", code: "TC-004", name_ko: "장비렌탈", name_en: "Equipment Rental", name_zh: "器材租赁", parent_id: "tc_ski", order: 2, ...catC("Ski Equipment Rental", "#8b5cf6", "Ski/board equipment rental.") },
    { id: "tc_meal", code: "TC-005", name_ko: "식사권", name_en: "Meal Voucher", name_zh: "餐券", parent_id: null, order: 3, ...catC("Meal Voucher", "#f59e0b", "Resort dining meal vouchers.") },
    { id: "tc_gondola", code: "TC-006", name_ko: "곤돌라", name_en: "Gondola", name_zh: "观光缆车", parent_id: null, order: 4, ...catC("Gondola", "#10b981", "Sightseeing gondola round-trip.") },
  ]));
  const WW = { s: "2026-07-10", e: "2026-08-30" }, SKI = { s: "2026-12-01", e: "2027-02-28" };
  const specs = [];
  const add = (cid, pass, cat, ptype, base, aPrice, cPrice, use) => specs.push(
    { id: "s_" + cid + "1", coupon_id: cid, pass_name: pass, category: cat, product_type: ptype, level: 1, level_name: "대인", coupon_name: `${base}(대인)`, price: aPrice, discount_target: "", use_start_date: use.s, use_end_date: use.e, active: true },
    { id: "s_" + cid + "2", coupon_id: cid, pass_name: pass, category: cat, product_type: ptype, level: 2, level_name: "소인", coupon_name: `${base}(소인)`, price: cPrice, discount_target: "", use_start_date: use.s, use_end_date: use.e, active: true });
  add("DBO", "OAT_26성수기_얼리_워터월드(플레이스토리)", "워터파크", "", "워터월드 종일권_성수기", 40000, 35000, WW);
  add("DBR", "OAT_26성수기_얼리_워터월드(티브리지)", "워터파크", "", "워터월드 종일권_성수기", 40000, 35000, WW);
  add("DBT", "OAT_26성수기_얼리_워터월드(스마트인피니)", "워터파크", "", "워터월드 종일권_성수기", 40000, 35000, WW);
  add("DBQ", "OAT_26성수기_워터월드_4시간권", "워터파크", "", "워터월드 4시간권", 30000, 26000, WW);
  add("DBW", "OAT_26성수기_워터월드_7시간권", "워터파크", "", "워터월드 7시간권", 36000, 31000, WW);
  add("SVC", "OAT_26시즌_스키리프트_4시간권", "스키", "리프트권", "스키 리프트 4시간권", 45000, 34000, SKI);
  add("SVZ", "OAT_26시즌_스키리프트_7시간권", "스키", "리프트권", "스키 리프트 7시간권", 55000, 40000, SKI);
  add("SVA", "OAT_26시즌_스키리프트_종일권", "스키", "리프트권", "스키 리프트 종일권", 65000, 48000, SKI);
  add("RSA", "OAT_26시즌_장비렌탈_4시간권", "스키", "장비렌탈", "스키 장비렌탈 4시간권", 25000, 20000, SKI);
  add("RSC", "OAT_26시즌_장비렌탈_7시간권", "스키", "장비렌탈", "스키 장비렌탈 7시간권", 30000, 24000, SKI);
  add("RSF", "OAT_26시즌_장비렌탈_종일권", "스키", "장비렌탈", "스키 장비렌탈 종일권", 38000, 30000, SKI);
  // 곤돌라 왕복권 — 성인(대인) 전용 티켓 (아동 레벨 없음)
  specs.push({ id: "s_GDO1", coupon_id: "GDO", pass_name: "OAT_곤돌라_왕복권", category: "곤돌라", product_type: "", level: 1, level_name: "대인", coupon_name: "곤돌라 왕복권(대인)", price: 18000, discount_target: "", use_start_date: "2026-07-01", use_end_date: "2026-12-31", active: true });
  localStorage.setItem(STORAGE_COUPON_SPECS, JSON.stringify(specs));
  localStorage.setItem(STORAGE_TICKET_MARGIN, JSON.stringify({
    categories: {
      "워터파크": { type: "amount", value: "4000" },
      "스키>리프트권": { type: "rate", value: "10" },
      "스키>장비렌탈": { type: "amount", value: "3000" },
      "곤돌라": { type: "amount", value: "2000" },
    },
    overrides: { DBQ: { type: "amount", value: "3000" } },
  }));
  const SW = { sale_start_date: "2026-07-01", sale_end_date: "2026-08-25" }, SS = { sale_start_date: "2026-07-01", sale_end_date: "2027-02-20" };
  // 상품 이미지 = 썸네일만. 히어로·상세는 뎁스(S17) 소유.
  const pimg = (label, color) => ({ thumb_meta: [{ data_url: svgPh(label, color) }] });
  const mk = (o) => Object.assign({ id: "p_" + o.product_code, visibility: "Y", date_mode: "open", cancel_policy: [{ base: "3plus", penalty: 0 }, { base: "today", penalty: 100 }], created_at: T, updated_at: T }, o);
  localStorage.setItem(STORAGE_TICKET_PRODUCTS, JSON.stringify([
    mk({ product_code: "PR-T0001", name_en: "Water World Day Pass (Peak/Early)", name_zh: "水世界一日通票（旺季/早鸟）", category_1: "워터파크", category_2: "", spec_coupon_id: "DBO", ...SW, cutoff: { n: 1, unit: "day", time: "23:59" }, ...pimg("Water World Day Pass", "#38bdf8") }),
    mk({ product_code: "PR-T0002", name_en: "Water World 4-Hour Pass", name_zh: "水世界4小时票", category_1: "워터파크", category_2: "", spec_coupon_id: "DBQ", ...SW, cutoff: { n: 0, unit: "hour", time: "23:59" }, ...pimg("Water World 4-Hour", "#0ea5e9") }),
    mk({ product_code: "PR-T0003", name_en: "Ski Lift Day Pass", name_zh: "滑雪缆车一日券", category_1: "스키", category_2: "리프트권", spec_coupon_id: "SVA", ...SS, cutoff: { n: 1, unit: "day", time: "18:00" }, ...pimg("Ski Lift Day Pass", "#6366f1") }),
    mk({ product_code: "PR-T0004", name_en: "Ski Equipment Rental (Day)", name_zh: "滑雪装备租赁（全日）", category_1: "스키", category_2: "장비렌탈", spec_coupon_id: "RSF", ...SS, cutoff: { n: 1, unit: "day", time: "18:00" }, ...pimg("Ski Equipment Rental", "#8b5cf6") }),
    mk({ product_code: "PR-T0005", name_en: "Gondola Round Trip", name_zh: "观光缆车往返", category_1: "곤돌라", category_2: "", spec_coupon_id: "GDO", sale_start_date: "2026-07-01", sale_end_date: "2026-12-31", cutoff: { n: 0, unit: "hour", time: "23:59" }, ...pimg("Gondola Round Trip", "#10b981") }),
  ]));
  // 데모 티켓 추천 섹션(메인) — 티켓 섹션이 없을 때만
  try {
    const secs = JSON.parse(localStorage.getItem(STORAGE_MAIN_SECTION) || "[]");
    if (!secs.some((s) => s.type === "ticket")) {
      secs.push({ id: "sec_ticket_demo", type: "ticket", title_ko: "인기 티켓", title_en: "Popular Tickets", subtitle_ko: "워터파크·스키 추천 상품", subtitle_en: "Water Park & Ski picks", visible: true, viewall_use: true, ticket_mode: "auto", ticket_sort: "price", ticket_cats: [], ticket_product_ids: [], order: 90 });
      localStorage.setItem(STORAGE_MAIN_SECTION, JSON.stringify(secs));
    }
  } catch (e) {}
}

/** coupon_id별 스펙 묶음 */
function specGroupsMap() {
  const map = new Map();
  loadCouponSpecs().forEach((s) => {
    if (!map.has(s.coupon_id)) map.set(s.coupon_id, { coupon_id: s.coupon_id, pass_name: s.pass_name, category: s.category, product_type: s.product_type, active: s.active !== false, rows: [] });
    const g = map.get(s.coupon_id); g.rows.push(s); if (s.active === false) g.active = false;
  });
  map.forEach((g) => g.rows.sort((a, b) => (a.level || 0) - (b.level || 0)));
  return map;
}
function ticketTopCats() { return loadTicketCategories().filter((c) => !c.parent_id).sort((a, b) => (a.order || 0) - (b.order || 0)); }
function ticketCatByKo(ko) { return loadTicketCategories().find((c) => c.name_ko === ko && !c.parent_id); }
/** 판매기간·노출·스펙 Cascade 기준 노출 여부 (오늘 기준) */
function ticketVisibleNow(p, gmap) {
  const g = gmap.get(p.spec_coupon_id); if (!g || !g.active) return false;
  if (p.visibility === "N") return false;
  const today = todayKstYmd();
  if (p.sale_start_date && today < p.sale_start_date) return false;
  if (p.sale_end_date && today > p.sale_end_date) return false;
  return true;
}
/** 선택 사용일이 상품 사용기간에 포함되는지 (사용일 미선택이면 통과) */
function ticketUsableOn(p, gmap, date) {
  if (!date) return true;
  const g = gmap.get(p.spec_coupon_id); if (!g || !g.rows.length) return false;
  const r = g.rows[0];
  return (!r.use_start_date || date >= r.use_start_date) && (!r.use_end_date || date <= r.use_end_date);
}
/** 레벨별 판매가 = 입금가 + 쿠폰ID 마진 */
function ticketLevelSell(spec, margin) { return computeSellPriceFront(spec.price, margin.type, margin.value); }
function ticketMinPrice(p, gmap) {
  const g = gmap.get(p.spec_coupon_id); if (!g || !g.rows.length) return 0;
  const margin = getTicketMarginFront(p.spec_coupon_id);
  return Math.min(...g.rows.map((r) => ticketLevelSell(r, margin)));
}
function ticketImg(p) { const pk = (a) => (a && a[0] && a[0].data_url) || ""; return pk(p.thumb_meta) || pk(p.hero_meta) || pk(p.hero_image_meta) || pk(p.image_meta) || ""; }
/** 예약 가능 인원 라벨 — 스펙 레벨(1=성인·2=아동)로 판단. 성인 전용 티켓도 있음. */
function ticketPaxLabel(g, L) {
  const lv = new Set((g && g.rows ? g.rows : []).map((r) => r.level));
  const parts = [];
  if (lv.has(1)) parts.push(L("성인", "Adult"));
  if (lv.has(2)) parts.push(L("아동", "Child"));
  return `${parts.join("·") || L("성인", "Adult")} ${L("예약가능", "available")}`;
}
function ticketGallery(p) { const a = []; (p.hero_meta || []).forEach((m) => m.data_url && a.push(m.data_url)); (p.thumb_meta || []).forEach((m) => m.data_url && a.push(m.data_url)); (p.image_meta || []).forEach((m) => m.data_url && a.push(m.data_url)); return a.length ? a : ((p.hero_image_meta || []).map((m) => m.data_url).filter(Boolean)); }
function ticketCatImgFront(c) { return (c && c.hero_image_meta && c.hero_image_meta[0] && c.hero_image_meta[0].data_url) || ""; }
/** 뎁스 콘텐츠 localized (EN 우선, ko는 en fallback) */
function catField(c, base) { if (!c) return ""; return (uiState.lang === "en" ? c[base + "_en"] : (c[base + "_en"] || c[base + "_zh"])) || c[base + "_en"] || c[base + "_zh"] || ""; }
/** 카드 카테고리 뱃지 라벨 — 숙소 카드와 동일하게 항상 영어(name_en) 표기 (외국인 전용) */
function ticketCatEnLabel(p) {
  const cats = loadTicketCategories();
  const c1 = cats.find((c) => !c.parent_id && c.name_ko === p.category_1);
  const cat1en = (c1 && c1.name_en) || p.category_1 || "";
  if (!p.category_2) return cat1en;
  const c2 = cats.find((c) => c.parent_id === (c1 && c1.id) && c.name_ko === p.category_2);
  return cat1en + " › " + ((c2 && c2.name_en) || p.category_2);
}
/** 상품 상세 소개(리치 HTML) — 상세보기 모달용. 상품 소유(S14 탭4) */
function ticketProductDetail(p) { if (!p) return ""; return (uiState.lang === "en" ? p.detail_html_en : (p.detail_html_en || p.detail_html_zh)) || p.detail_html_en || p.detail_html_zh || ""; }

/** 가로형 canonical 티켓 카드 (숙소 검색결과·브릿지 카드와 유사) */
function ticketCardHtml(p, gmap, L) {
  const g = gmap.get(p.spec_coupon_id);
  const cat = (ticketCatByKo(p.category_1) || {});
  const catLabel = cat.name_en || p.category_1;
  const img = ticketImg(p);
  const min = ticketMinPrice(p, gmap);
  const useP = g && g.rows.length ? `${g.rows[0].use_start_date} ~ ${g.rows[0].use_end_date}` : "";
  const lvls = g ? g.rows.map((r) => escapeHtml(r.level_name)).join(" · ") : "";
  return `<article class="tkf-hcard" data-tid="${escapeHtml(p.id)}">
    <div class="tkf-hcard-img">${img ? `<img src="${escapeHtml(img)}" alt="">` : `<div class="tkf-noimg">No Image</div>`}</div>
    <div class="tkf-hcard-body">
      <div class="tkf-card-cat">${escapeHtml(catLabel)}${p.category_2 ? " › " + escapeHtml(p.category_2) : ""}</div>
      <div class="tkf-hcard-title">${escapeHtml(p.name_en)}</div>
${/* ZH(name_zh) 미노출 — 개발단계 KO-EN. 추후 EN-ZH 전환 시 name_zh 노출로 복원 */ ""}
      ${useP ? `<div class="tkf-card-use">🗓 ${L("사용기간", "Valid")} ${escapeHtml(useP)}</div>` : ""}
      ${lvls ? `<div class="tkf-card-use">🎫 ${lvls}</div>` : ""}
    </div>
    <div class="tkf-hcard-price">
      <button type="button" class="tkf-hcard-detail">${L("상세보기", "Detail")} →</button>
      <div><span class="tkf-hcard-from">${L("최저", "from")}</span> <strong class="tkf-hcard-amt">${formatWon(min)}</strong></div>
    </div>
  </article>`;
}

/** GNB Ticket 드롭다운 — 1뎁스 카테고리 목록 */
function renderTicketGnb() {
  const menu = document.getElementById("ticketNavMenu"); if (!menu) return;
  const cats = ticketTopCats();
  menu.innerHTML = cats.map((c) => `<a href="#/ticket/bridge/${encodeURIComponent(c.name_ko)}">${escapeHtml(c.name_en || c.name_ko)}</a>`).join("");
  // Ticket 글자 클릭 → 첫 카테고리 브릿지
  const btn = document.querySelector("#ticketNav .gnb-acc-btn");
  if (btn && cats.length) btn.setAttribute("href", "#/ticket/bridge/" + encodeURIComponent(cats[0].name_ko));
}

function ticketSearchBarTop(L, note) {
  uiState.searchDomain = "ticket";
  const minYmd = todayKstYmd();
  const bar = renderSearchBar(defaultPax(), { ci: "", co: "" }, minYmd, L, "24px auto 8px");
  return `<div style="background:#0f1220;padding:26px 16px 18px">${bar}${note ? `<div style="max-width:1100px;margin:6px auto 0;color:rgba(255,255,255,.6);font-size:12px;text-align:center">${note}</div>` : ""}</div>`;
}
function wireTicketSearchBar(app) {
  wireSearchBar(app, { pax: defaultPax(), draft: { ci: "", co: "" }, minYmd: todayKstYmd(), L: (ko, en) => (uiState.lang === "en" ? en : ko), rerender: () => render(), onSearch: () => {} });
}

/* ─── 티켓 검색결과 (#/ticket/search) — 숙소 검색결과와 100% 동일 UI (좌 필터 + canonical 카드) ─── */
/** 티켓 canonical 카드 — 숙소 productCardHtml과 동일한 .product-card 구조 */
function ticketProductCardHtml(p, gmap, L) {
  const lang = uiState.lang;
  const g = gmap.get(p.spec_coupon_id);
  const rows = g ? g.rows : [];
  const margin = getTicketMarginFront(p.spec_coupon_id);
  const cat = ticketCatByKo(p.category_1) || {};
  const catLabel = ticketCatEnLabel(p);
  const useP = rows.length ? `${rows[0].use_start_date} ~ ${rows[0].use_end_date}` : "-";
  // 썸네일 (이미지 여러 장이면 이전/다음)
  const imgs = ticketGallery(p);
  let idx = uiState.cardImgIdx[p.id] || 0; if (idx >= imgs.length) idx = 0; uiState.cardImgIdx[p.id] = idx;
  const thumbHtml = imgs.length === 0
    ? `<div class="pc-thumb pc-no-image">No Image</div>`
    : `<div class="pc-thumb"><img src="${escapeHtml(imgs[idx])}" alt="" />${imgs.length > 1 ? `<div class="pc-thumb-nav"><button type="button" data-tpc-prev="${escapeHtml(p.id)}">&#8249;</button><button type="button" data-tpc-next="${escapeHtml(p.id)}">&#8250;</button></div>` : ""}</div>`;
  const optLines = rows.map((r) => `<div class="pc-info-line">👤 ${ticketLevelLabel(r.level, r.level_name, L)} ${formatWon(ticketLevelSell(r, margin))}</div>`).join("");
  const contentHtml = `<div class="pc-content">
    <div class="pc-place-badge">${escapeHtml(catLabel)}</div>
    <div class="pc-room-name">${escapeHtml(p.name_en)}</div>
    <div class="pc-product-name">${/* ZH(name_zh) 미노출 — 개발단계 KO-EN. 추후 EN-ZH 시 복원 */ ""}</div>
    <div class="pc-data">
      <div class="pc-info-line">🗓 ${L("사용기간", "Valid")} ${escapeHtml(useP)}</div>
      <div class="pc-info-line">👥 ${ticketPaxLabel(g, L)}</div>
      ${optLines}
    </div>
    <div class="pc-chips"><span class="pc-chip">${L("오픈형 · 사용기간 내 자유이용", "Open ticket")}</span></div>
  </div>`;
  const min = ticketMinPrice(p, gmap);
  const pricePanelHtml = `<div class="pc-price-panel">
    <button type="button" class="btn-room-detail js-tk-detail" data-pid="${escapeHtml(p.id)}">${L("상세보기", "Detail")} →</button>
    <div class="pc-cancel pc-cancel-free">${L("사용종료일 이전 무료취소", "Free cancel before end date")}</div>
    <div class="pc-price-box"><div class="pc-member-label">${L("최저가", "From")}</div><div class="pc-price">${formatWon(min)}</div></div>
  </div>`;
  return `<article class="product-card js-tk-card" data-cat="${escapeHtml(p.category_1)}" data-pid="${escapeHtml(p.id)}">${thumbHtml}${contentHtml}${pricePanelHtml}</article>`;
}

function renderTicketSearch(app) {
  const L = (ko, en) => (uiState.lang === "en" ? en || ko || "" : ko || en || "");
  uiState.searchDomain = "ticket";
  const gmap = specGroupsMap();
  const minYmd = todayKstYmd();
  if (!uiState.ticketUseDate) uiState.ticketUseDate = addCalendarDaysYmd(minYmd, 7) || minYmd; // 사용일 디폴트 = 오늘+7일
  const date = uiState.ticketUseDate;
  const pax = defaultPax();
  const f = uiState.ticketFilter || (uiState.ticketFilter = { order: "price_asc", cats: [] });
  let list = loadTicketProducts().filter((p) => ticketVisibleNow(p, gmap) && ticketUsableOn(p, gmap, date));
  if (f.cats.length) list = list.filter((p) => f.cats.includes(p.category_1));
  list = list.map((p) => ({ p, min: ticketMinPrice(p, gmap) }));
  if (f.order === "price_desc") list.sort((a, b) => b.min - a.min);
  else if (f.order === "name") list.sort((a, b) => a.p.name_en.localeCompare(b.p.name_en));
  else list.sort((a, b) => a.min - b.min);

  const cats = ticketTopCats();
  // 서치바 (숙소 검색결과와 동일한 topBar)
  const topBar = `<div style="padding:20px 24px 0">${renderSearchBar(pax, { ci: "", co: "" }, minYmd, L, "0 auto")}</div>`;
  // 좌측 필터 — 숙소식(정렬 라디오 + 카테고리 체크박스 + 초기화)
  const orderPanel = `
    <div style="margin-bottom:22px">
      <div style="font-size:13px;font-weight:700;margin-bottom:8px">${L("정렬", "Order")}</div>
      ${[["price_asc", L("낮은 가격순", "Low cost")], ["price_desc", L("높은 가격순", "High cost")]]
        .map(([v, lb]) => `<label style="display:flex;align-items:center;gap:7px;font-size:12.5px;margin-bottom:6px;cursor:pointer"><input type="radio" name="tkord" class="tk-order" value="${v}" ${f.order === v ? "checked" : ""}>${lb}</label>`).join("")}
    </div>`;
  const catPanel = `
    <div style="margin-bottom:22px">
      <div style="font-size:13px;font-weight:700;margin-bottom:8px">${L("카테고리", "Category")}</div>
      <label style="display:flex;align-items:center;gap:7px;font-size:12.5px;margin-bottom:6px;cursor:pointer"><input type="checkbox" class="tk-cat-all" ${f.cats.length === 0 ? "checked" : ""}>${L("전체", "All")}</label>
      ${cats.map((c) => `<label style="display:flex;align-items:center;gap:7px;font-size:12.5px;margin-bottom:6px;cursor:pointer"><input type="checkbox" class="tk-cat" value="${escapeHtml(c.name_ko)}" ${f.cats.includes(c.name_ko) ? "checked" : ""}>${escapeHtml(uiState.lang === "en" ? (c.name_en || c.name_ko) : c.name_ko)}</label>`).join("")}
    </div>`;
  const resetBtn = `<button id="tkReset" style="width:100%;border:1px solid #ddd;background:#fff;border-radius:6px;padding:9px;font-size:12.5px;cursor:pointer;color:#666">${L("초기화", "Reset")}</button>`;
  const filterPanel = `<aside style="flex:0 0 216px;width:216px;border:1px solid #ececec;border-radius:10px;padding:18px 16px;align-self:flex-start">${orderPanel}${catPanel}${resetBtn}</aside>`;
  const listHtml = list.length
    ? list.map((r) => ticketProductCardHtml(r.p, gmap, L)).join("")
    : `<div style="border:1px solid #ececec;border-radius:12px;padding:48px;text-align:center;color:#999;font-size:14px">${L("조건에 맞는 티켓이 없습니다.", "No tickets match.")}</div>`;

  app.innerHTML = topBar + `
    <div style="max-width:1100px;margin:24px auto 60px;padding:0 24px">
      <h1 style="font-size:22px;font-weight:800;color:#1a1f2e;margin:0 0 4px">${L("검색 결과", "Search Result")}</h1>
      <p style="font-size:12.5px;color:#7c3aed;margin:0 0 20px">${date ? L(`사용일 ${date} 기준 · 그날 사용 가능한 판매중 티켓`, `Usable on ${date}`) : L("사용일을 선택하면 그날 사용 가능한 티켓만 표시됩니다.", "Pick a usage date to filter.")}</p>
      <div style="display:flex;gap:24px;align-items:flex-start">
        ${filterPanel}
        <div style="flex:1;display:flex;flex-direction:column;gap:16px;min-width:0">
          <div style="font-size:13px;color:#888">${L("총", "Total")} ${list.length}${L("건", "")}</div>
          ${listHtml}
        </div>
      </div>
    </div>`;
  wireTicketSearchBar(app);
  app.querySelectorAll(".tk-order").forEach((r) => r.addEventListener("change", () => { f.order = r.value; render(); }));
  app.querySelector(".tk-cat-all")?.addEventListener("change", () => { f.cats = []; render(); });
  app.querySelectorAll(".tk-cat").forEach((c) => c.addEventListener("change", () => { f.cats = Array.from(app.querySelectorAll(".tk-cat:checked")).map((x) => x.value); render(); }));
  app.querySelector("#tkReset")?.addEventListener("click", () => { uiState.ticketFilter = { order: "price_asc", cats: [] }; render(); });
  // 카드 클릭 → 브릿지 / 상세보기 버튼 → 모달 / 이미지 이전·다음
  app.querySelectorAll(".js-tk-detail").forEach((b) => b.addEventListener("click", (e) => { e.stopPropagation(); openTicketModal(b.dataset.pid); }));
  app.querySelectorAll(".js-tk-card").forEach((c) => c.addEventListener("click", () => { uiState.ticketFocusId = c.dataset.pid; location.hash = "#/ticket/bridge/" + encodeURIComponent(c.dataset.cat); }));
  const step = (id, delta) => { const p = loadTicketProducts().find((x) => x.id === id); const n = ticketGallery(p).length; if (!n) return; uiState.cardImgIdx[id] = ((uiState.cardImgIdx[id] || 0) + delta + n) % n; render(); };
  app.querySelectorAll("[data-tpc-prev]").forEach((b) => b.addEventListener("click", (e) => { e.stopPropagation(); step(b.getAttribute("data-tpc-prev"), -1); }));
  app.querySelectorAll("[data-tpc-next]").forEach((b) => b.addEventListener("click", (e) => { e.stopPropagation(); step(b.getAttribute("data-tpc-next"), 1); }));
}

/* ─── 티켓 브릿지 (#/ticket/bridge/:catKo) — 숙소식 리치 랜딩 ─── */
function ticketLevelLabel(level, name, L) { return level === 1 ? L("성인", "Adult") : level === 2 ? L("아동", "Child") : name; }
/* ─ 장바구니 수량 헬퍼 (스테퍼 = 장바구니, 단일 소스) ─ */
function tkfCartQty(pid, level) {
  const items = (uiState.ticketCart && uiState.ticketCart.items) || [];
  const it = items.find((x) => x.product_id === pid && x.level === level);
  return it ? it.qty : 0;
}
function tkfSetQty(pid, level, delta) {
  if (!uiState.ticketCart) return;
  const items = uiState.ticketCart.items;
  const it = items.find((x) => x.product_id === pid && x.level === level);
  const cur = it ? it.qty : 0;
  const next = Math.max(0, Math.min(20, cur + delta));
  if (next === 0) { if (it) items.splice(items.indexOf(it), 1); }
  else if (it) it.qty = next;
  else items.push({ product_id: pid, level, qty: next });
}
/** 브릿지 상품 행 — Add 버튼 없음. +/- 스테퍼가 곧 장바구니 수량(자동 담기) */
function ticketBridgeProductRow(p, gmap, L) {
  const g = gmap.get(p.spec_coupon_id); const margin = getTicketMarginFront(p.spec_coupon_id);
  const img = ticketImg(p); const rows = g ? g.rows : [];
  const useP = rows.length ? `${rows[0].use_start_date} ~ ${rows[0].use_end_date}` : "";
  const opt = rows.map((r) => {
    const sell = ticketLevelSell(r, margin); const q = tkfCartQty(p.id, r.level);
    return `<div class="tkf-optrow${q > 0 ? " in-cart" : ""}"><span class="tkf-optlabel">${ticketLevelLabel(r.level, r.level_name, L)} <span style="color:#888">${escapeHtml(r.coupon_name)}</span></span><span class="tkf-optprice">${formatWon(sell)}</span><span class="tkf-step"><button type="button" class="tkf-pqbtn" data-pid="${escapeHtml(p.id)}" data-lv="${r.level}" data-d="-1" ${q <= 0 ? "disabled" : ""}>−</button><span>${q}</span><button type="button" class="tkf-pqbtn" data-pid="${escapeHtml(p.id)}" data-lv="${r.level}" data-d="1">+</button></span></div>`;
  }).join("");
  return `<div class="tkf-pcard" data-pid="${escapeHtml(p.id)}">
    <div class="tkf-pcard-img">${img ? `<img src="${escapeHtml(img)}" alt="">` : `<div class="tkf-noimg">No Image</div>`}</div>
    <div class="tkf-pcard-main">
      <div class="tkf-hcard-title">${escapeHtml(p.name_en)}</div>
${/* ZH(name_zh) 미노출 — 개발단계 KO-EN. 추후 EN-ZH 전환 시 name_zh 노출로 복원 */ ""}
      ${useP ? `<div class="tkf-card-use">🗓 ${L("사용기간", "Valid")} ${escapeHtml(useP)}</div>` : ""}
      <div class="tkf-optbox">${opt || `<div class="tkf-empty" style="padding:10px 0">${L("연결 스펙 없음", "No spec")}</div>`}</div>
      <div class="tkf-pcard-foot">
        <div class="tkf-foot-btns">
          <button type="button" class="tkf-detailbtn" data-pid="${escapeHtml(p.id)}">${L("상세보기", "Detail")}</button>
        </div>
      </div>
    </div>
  </div>`;
}
/** 우측 선택 내역(장바구니) — 상품별 그룹, 라인=단가×수량=금액 + [✕] */
function ticketCartHtml(gmap, L) {
  const items = (uiState.ticketCart && uiState.ticketCart.items) || [];
  if (!items.length) return `<div class="tkf-cart"><h3>🧾 ${L("선택 내역", "Cart")}</h3><div class="tkf-cart-empty">${L("담긴 상품이 없습니다.", "Cart is empty.")}<br>${L("상품에서 수량(+)을 올리면 담깁니다.", "Increase quantity to add.")}</div></div>`;
  const order = []; const byP = new Map();
  items.forEach((it) => { if (!byP.has(it.product_id)) { byP.set(it.product_id, []); order.push(it.product_id); } byP.get(it.product_id).push(it); });
  let total = 0, cnt = 0;
  const groups = order.map((pid) => {
    const p = loadTicketProducts().find((x) => x.id === pid); if (!p) return "";
    const g = gmap.get(p.spec_coupon_id); const margin = getTicketMarginFront(p.spec_coupon_id);
    const lines = byP.get(pid).slice().sort((a, b) => a.level - b.level).map((it) => {
      const r = g && g.rows.find((x) => x.level === it.level); if (!r) return "";
      const unit = ticketLevelSell(r, margin); const sum = unit * it.qty; total += sum; cnt += it.qty;
      return `<div class="tkf-cart-line"><div class="tkf-cart-l"><span class="tkf-cart-lv">${ticketLevelLabel(it.level, r.level_name, L)}</span> <span class="tkf-cart-calc">${formatWon(unit)} × ${it.qty}</span></div><div class="tkf-cart-r">${formatWon(sum)}<button type="button" class="tkf-cart-x" data-pid="${escapeHtml(pid)}" data-lv="${it.level}">✕</button></div></div>`;
    }).join("");
    return `<div class="tkf-cart-group"><div class="tkf-cart-pname">${escapeHtml(p.name_en)}</div>${lines}</div>`;
  }).join("");
  return `<div class="tkf-cart"><h3>🧾 ${L("선택 내역", "Cart")}</h3>${groups}<div class="tkf-cart-total"><span>${L("총", "Total")} ${cnt}${L("매", "")}</span><strong>${formatWon(total)}</strong></div><button type="button" id="tkfReserve" class="btn-cta" style="width:100%;margin-top:10px">Booking</button></div>`;
}

/* ─── 티켓 브릿지 (#/ticket/bridge/:catKo) — 뎁스 콘텐츠 + 상품선택(담기·장바구니) + 2뎁스 서브탭 ─── */
function renderTicketBridge(app, catKo) {
  const L = (ko, en) => (uiState.lang === "en" ? en : ko);
  const gmap = specGroupsMap();
  const cat = ticketCatByKo(catKo);
  const catLabel = cat ? (cat.name_en || cat.name_ko) : catKo;
  const allCats = loadTicketCategories();
  const subs = cat ? allCats.filter((c) => c.parent_id === cat.id).sort((a, b) => (a.order || 0) - (b.order || 0)) : [];
  // 활성 서브탭(2뎁스). 없으면 1뎁스가 콘텐츠 소유.
  let activeSub = null;
  if (subs.length) { activeSub = subs.find((s) => s.name_ko === uiState.ticketSubTab) || subs[0]; }
  const contentCat = activeSub || cat; // 콘텐츠 소유 뎁스
  // 장바구니 범위 = 1뎁스 브릿지(catKo). 다른 1뎁스로 오면 초기화.
  if (!uiState.ticketCart || uiState.ticketCart.deptKey !== catKo) { uiState.ticketCart = { deptKey: catKo, items: [] }; uiState.ticketPending = {}; }
  // 상품 = 1뎁스 일치 AND (서브탭 있으면 2뎁스 일치)
  const list = loadTicketProducts().filter((p) => ticketVisibleNow(p, gmap) && p.category_1 === catKo && (activeSub ? p.category_2 === activeSub.name_ko : true));
  const heroImg = ticketCatImgFront(cat) || ticketCatImgFront(contentCat) || (list.map((p) => ticketImg(p)).find(Boolean) || "");
  const localizedC = (base) => catField(contentCat, base);
  const addr = localizedC("address") || "265, High1-gil, Gohan-eup, Jeongseon-gun, Gangwon-do, Korea";
  const productRows = list.length ? list.map((p) => ticketBridgeProductRow(p, gmap, L)).join("") : `<div class="tkf-empty">${L("판매중인 티켓이 없습니다.", "No tickets on sale.")}</div>`;
  // 2뎁스 = 숙소 place-selector 동일 클래스(우측 정렬은 CSS로). 없으면 미표시.
  const subTabBar = subs.length ? `<div class="place-selector"><div class="place-selector-inner">${subs.map((s) => `<button type="button" class="place-tab-btn ${activeSub && activeSub.id === s.id ? "active" : ""}" data-sub="${escapeHtml(s.name_ko)}">${escapeHtml(uiState.lang === "en" ? (s.name_en || s.name_ko) : s.name_ko)}</button>`).join("")}</div></div>` : "";
  const heroName = escapeHtml(uiState.lang === "en" ? catLabel : (cat ? cat.name_ko : catKo)) + (activeSub ? " · " + escapeHtml(uiState.lang === "en" ? (activeSub.name_en || activeSub.name_ko) : activeSub.name_ko) : "");
  // 히어로 서브 = 숙소식(보조 라벨). KO일 때만 영문 액센트, EN일 때 생략. (중국어 고정 제거)
  const heroSub = uiState.lang === "en" ? "" : escapeHtml(cat && cat.name_en ? cat.name_en : "");
  const heroHtml = `<div class="hero-fullwidth">
    ${heroImg ? `<img src="${escapeHtml(heroImg)}" alt="" />` : `<div class="hero-placeholder"></div>`}
    <div class="hero-overlay"><div class="hero-text">
      <div class="hero-place-name">${heroName}</div>
      <div class="hero-sub-name">${heroSub}</div>
      <button type="button" class="hero-open-layer-btn js-tk-hero-detail">${L("상세 안내", "Details")} ↗</button>
    </div></div>
  </div>`;

  app.innerHTML = `
    ${subTabBar}
    ${heroHtml}
    <nav class="place-nav"><div class="place-nav-inner">
      <button type="button" class="place-nav-btn active" data-sec="overview">Overview</button>
      <button type="button" class="place-nav-btn" data-sec="select">Select</button>
      <button type="button" class="place-nav-btn" data-sec="detail">Detail</button>
      <button type="button" class="place-nav-btn" data-sec="guide">Guide</button>
      <button type="button" class="place-nav-btn" data-sec="policy">Policy</button>
      <button type="button" class="place-nav-btn" data-sec="loc">Location</button>
    </div></nav>
    <div class="content-wrap">
      <section id="sec-overview" class="sec-overview">
        <div class="overview-grid"><div><div class="overview-item-label">Overview</div><div class="tkf-detail-html" style="font-size:14px;color:#555;line-height:1.7;margin-top:6px">${localizedC("overview") || escapeHtml(catLabel + " — open ticket.")}</div></div></div>
      </section>
      <section id="sec-select" class="tkf-sec">
        <h2>Select tickets</h2>
        <div class="tkf-selwrap">
          <div class="tkf-sellist">${productRows}</div>
          <div class="tkf-sellcart" id="tkfCartWrap">${ticketCartHtml(gmap, L)}</div>
        </div>
      </section>
      <section id="sec-detail" class="tkf-sec"><h2>Detail</h2><div class="tkf-detail-html">${localizedC("detail_html") || `<div class="tkf-empty">${L("상세설명 없음", "No detail")}</div>`}</div></section>
      <section id="sec-guide" class="tkf-sec"><h2>Guide</h2><div class="tkf-detail-html">${localizedC("guide_html") || `<div class="tkf-empty">${L("이용안내 없음", "No guide")}</div>`}</div></section>
      <section id="sec-policy" class="tkf-sec"><h2>Policy</h2>
        <table class="tkf-info" style="margin-bottom:10px"><tr><th>${L("취소·환불(오픈형)", "Cancellation")}</th><td>${L("사용종료일 이전 미사용=전액환불 / 이후·사용완료=환불불가", "Full refund if unused before end date; otherwise no refund")}</td></tr></table>
        <div class="tkf-detail-html">${localizedC("policy_html") || ""}</div></section>
      <section id="sec-loc" class="tkf-sec"><h2>Location</h2><div class="tkf-map">🗺️ ${L("지도 (프로토타입)", "Map (prototype)")}</div><p style="color:#555;font-size:13px;margin-top:8px">📍 ${escapeHtml(addr)}</p></section>
    </div>`;

  app.querySelectorAll(".place-tab-btn").forEach((b) => b.addEventListener("click", () => { uiState.ticketSubTab = b.dataset.sub; render(); }));
  app.querySelectorAll(".place-nav-btn[data-sec]").forEach((a) => a.addEventListener("click", () => {
    app.querySelectorAll(".place-nav-btn").forEach((x) => x.classList.remove("active")); a.classList.add("active");
    document.getElementById("sec-" + a.dataset.sec)?.scrollIntoView({ behavior: "smooth", block: "start" });
  }));
  app.querySelector(".js-tk-hero-detail")?.addEventListener("click", () => document.getElementById("sec-detail")?.scrollIntoView({ behavior: "smooth", block: "start" }));
  // 수량 스테퍼 = 장바구니 직접 반영 (자동 담기)
  app.querySelectorAll(".tkf-pqbtn").forEach((b) => b.addEventListener("click", () => {
    tkfSetQty(b.dataset.pid, parseInt(b.dataset.lv, 10), parseInt(b.dataset.d, 10));
    render();
  }));
  app.querySelectorAll(".tkf-detailbtn").forEach((b) => b.addEventListener("click", (e) => { e.stopPropagation(); openTicketModal(b.dataset.pid); }));
  // 장바구니 라인 삭제(✕) — 상품+레벨 기준
  app.querySelectorAll(".tkf-cart-x").forEach((b) => b.addEventListener("click", () => {
    tkfSetQty(b.dataset.pid, parseInt(b.dataset.lv, 10), -9999);
    render();
  }));
  app.querySelector("#tkfReserve")?.addEventListener("click", () => {
    if (!uiState.ticketCart.items.length) { alert(L("담긴 상품이 없습니다.", "Cart is empty.")); return; }
    location.hash = "#/ticket/checkout";
  });
  if (uiState.ticketFocusId) { const el = app.querySelector(`.tkf-pcard[data-pid="${uiState.ticketFocusId}"]`); if (el) el.classList.add("tkf-focus"); uiState.ticketFocusId = ""; }
}

/* ─── 상세보기 모달 (A안) — 이미지 갤러리 + 기본정보만 ─── */
function openTicketModal(id) { uiState.ticketModal = { open: true, productId: id }; renderTicketModal(); }
function closeTicketModal() { uiState.ticketModal = { open: false, productId: "" }; renderTicketModal(); }
function renderTicketModal() {
  let root = document.getElementById("tkfModalRoot");
  const st = uiState.ticketModal || { open: false };
  if (!st.open) { if (root) root.remove(); return; }
  if (!root) { root = document.createElement("div"); root.id = "tkfModalRoot"; document.body.appendChild(root); }
  const L = (ko, en) => (uiState.lang === "en" ? en : ko);
  const gmap = specGroupsMap();
  const p = loadTicketProducts().find((x) => x.id === st.productId);
  if (!p) { root.remove(); return; }
  const g = gmap.get(p.spec_coupon_id); const margin = getTicketMarginFront(p.spec_coupon_id);
  const cat = ticketCatByKo(p.category_1) || {};
  const rows = g ? g.rows : [];
  const useP = rows.length ? `${rows[0].use_start_date} ~ ${rows[0].use_end_date}` : "-";
  const gallery = ticketGallery(p);
  const priceRows = rows.map((r) => `<tr><td>${ticketLevelLabel(r.level, r.level_name, L)} · ${escapeHtml(r.coupon_name)}</td><td style="text-align:right">${formatWon(ticketLevelSell(r, margin))}</td></tr>`).join("");
  root.innerHTML = `
    <div class="tkf-modal-backdrop"></div>
    <div class="tkf-modal" role="dialog" aria-modal="true">
      <div class="tkf-modal-head">
        <div><div class="tkf-detail-cat">${escapeHtml(cat.name_en || p.category_1)}${p.category_2 ? " › " + escapeHtml(p.category_2) : ""}</div><div class="tkf-modal-title">${escapeHtml(p.name_en)}</div></div>
        <button type="button" class="tkf-modal-close" aria-label="close">✕</button>
      </div>
      <div class="tkf-modal-body">
        <table class="tkf-info"><tr><th>${L("사용기간", "Valid")}</th><td>${escapeHtml(useP)}</td></tr><tr><th>${L("유형", "Type")}</th><td>${L("오픈형 (사용기간 내 자유 이용)", "Open ticket")}</td></tr></table>
        <table class="tkf-info" style="margin-top:8px"><thead><tr><th>${L("옵션", "Option")}</th><th style="text-align:right">${L("판매가", "Price")}</th></tr></thead><tbody>${priceRows}</tbody></table>
        <p style="color:#888;font-size:12px;margin-top:10px">${L("상세설명·이용안내·정책·위치는 브릿지 페이지에서 확인하세요. 수량 +/- 를 올리면 바로 장바구니에 담깁니다.", "See detail/guide/policy/location on the bridge page; use +/- to add to the cart instantly.")}</p>
      </div>
    </div>`;
  root.querySelector(".tkf-modal-backdrop").addEventListener("click", closeTicketModal);
  root.querySelector(".tkf-modal-close").addEventListener("click", closeTicketModal);
}

/* ─── 구매 → 주문 생성 + 12자리 쿠폰 발급 (결제 목업) ─── */
function genCouponNo(couponId, level, serialInt) {
  const cid = (couponId + "XXX").slice(0, 3).toUpperCase();
  const serial = String(serialInt).padStart(6, "0").slice(-6);
  const rand = String(Math.floor(Math.random() * 100)).padStart(2, "0");
  return `${cid}${level}${serial}${rand}`;
}
/* ─── 결제 페이지 (#/ticket/checkout) — 다상품 장바구니 ─── */
function renderTicketCheckout(app) {
  const L = (ko, en) => (uiState.lang === "en" ? en : ko);
  const cart = uiState.ticketCart;
  const gmap = specGroupsMap();
  const items = (cart && cart.items) || [];
  if (!items.length) { app.innerHTML = `<div class="content-wrap" style="max-width:760px;margin:40px auto;padding:0 16px"><div class="tkf-empty">${L("선택된 상품이 없습니다.", "No selection.")}</div><div style="text-align:center;margin-top:14px"><a href="#/ticket/search" class="btn-cta" style="text-decoration:none">${L("티켓 목록", "Tickets")}</a></div></div>`; return; }
  const lines = items.map((it) => {
    const p = loadTicketProducts().find((x) => x.id === it.product_id); const g = gmap.get(p.spec_coupon_id); const r = g.rows.find((x) => x.level === it.level);
    const sell = ticketLevelSell(r, getTicketMarginFront(p.spec_coupon_id));
    return { pname: p.name_en, opt: `${ticketLevelLabel(it.level, r.level_name, L)} · ${r.coupon_name}`, qty: it.qty, sum: sell * it.qty };
  });
  const total = lines.reduce((s, l) => s + l.sum, 0);
  const b = uiState.ticketBuyer || (uiState.ticketBuyer = { last: "Hong", first: "Gildong", email: "guest@example.com", phone: "010-1234-5678", nationality: "KR" });
  const _u = currentUser(); if (_u && _u.email) b.email = _u.email; // 로그인 사용자 이메일로 프리필 → 마이페이지 주문 연동 보장
  const inp = "width:100%;padding:9px;border:1px solid #ddd;border-radius:6px";
  app.innerHTML = `<div class="content-wrap" style="max-width:860px;margin:24px auto;padding:0 16px 60px">
    <h2 style="font-size:22px;margin:0 0 16px">${L("결제", "Checkout")}</h2>
    <div class="tkf-co-grid">
      <div>
        <div class="tkf-co-card"><h3>${L("주문 상품", "Order")} <span style="color:#888;font-size:13px;font-weight:400">${items.length}${L("종", "")}</span></h3>
          <table class="tkf-info">${lines.map((l) => `<tr><th>${escapeHtml(l.pname)}<br><span style="font-weight:400;color:#888">${escapeHtml(l.opt)} × ${l.qty}</span></th><td style="text-align:right;vertical-align:top">${formatWon(l.sum)}</td></tr>`).join("")}</table>
        </div>
        <div class="tkf-co-card"><h3>${L("구매자 정보", "Buyer")}</h3>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">
            <label style="font-size:13px">${L("성(Last)", "Last name")}<br><input id="co_last" value="${escapeHtml(b.last)}" style="${inp}"></label>
            <label style="font-size:13px">${L("이름(First)", "First name")}<br><input id="co_first" value="${escapeHtml(b.first)}" style="${inp}"></label>
            <label style="font-size:13px">${L("이메일", "Email")}<br><input id="co_email" value="${escapeHtml(b.email)}" style="${inp}"></label>
            <label style="font-size:13px">${L("전화", "Phone")}<br><input id="co_phone" value="${escapeHtml(b.phone)}" style="${inp}"></label>
            <label style="font-size:13px">${L("국적", "Nationality")}<br><input id="co_nat" value="${escapeHtml(b.nationality)}" style="${inp}"></label>
          </div>
        </div>
        <div class="tkf-co-card"><h3>${L("결제수단", "Payment")}</h3><label class="tkf-fopt"><input type="radio" checked> ${L("신용카드 (목업)", "Credit card (mock)")}</label></div>
      </div>
      <div>
        <div class="tkf-co-card tkf-co-sum"><h3>${L("결제 요약", "Summary")}</h3>
          <div class="tkf-co-total"><span>${L("총 결제금액", "Total")}</span><strong>${formatWon(total)}</strong></div>
          <button type="button" id="co_pay" class="btn-cta" style="width:100%;margin-top:12px">${L("결제하기", "Pay")}</button>
          <a href="javascript:history.back()" style="display:block;text-align:center;margin-top:8px;font-size:13px;color:#888;text-decoration:none">${L("← 뒤로", "← Back")}</a>
        </div>
      </div>
    </div>
  </div>`;
  app.querySelector("#co_pay").addEventListener("click", () => {
    ["last", "first", "email", "phone", "nationality"].forEach((k, i) => { const id = ["co_last", "co_first", "co_email", "co_phone", "co_nat"][i]; b[k] = app.querySelector("#" + id).value; });
    if (!b.email.trim()) { alert(L("이메일을 입력하세요.", "Enter email.")); return; }
    showLoadingOverlay(L("결제 처리 중…", "Processing…"));
    setTimeout(() => {
      hideLoadingOverlay();
      const res = createTicketOrder(items, b);
      uiState.ticketCart = null;
      uiState.ticketLastOrder = res;
      location.hash = "#/ticket/done"; render();
    }, 700);
  });
}

/* ─── 주문 생성 + 12자리 쿠폰 발급 (다상품 장바구니) ─── */
function createTicketOrder(cartItems, buyer) {
  const gmap = specGroupsMap();
  const orders = loadTicketOrders(); const coupons = loadTicketCoupons();
  const ymd = todayKstYmd().replace(/-/g, "");
  const orderNo = `ORD-${ymd}-${String(orders.length + 1).padStart(5, "0")}`;
  const nowIso = new Date().toISOString();
  const orderItems = []; const issued = []; let total = 0;
  cartItems.forEach((it) => {
    const p = loadTicketProducts().find((x) => x.id === it.product_id); const g = gmap.get(p.spec_coupon_id); const r = g.rows.find((x) => x.level === it.level);
    const margin = getTicketMarginFront(p.spec_coupon_id); const sell = ticketLevelSell(r, margin);
    total += sell * it.qty;
    orderItems.push({ product_id: p.id, product_name: p.name_en, coupon_id: p.spec_coupon_id, level: it.level, level_name: r.level_name, coupon_name: r.coupon_name, qty: it.qty, unit_deposit: r.price, unit_sell: sell, use_start_date: r.use_start_date, use_end_date: r.use_end_date });
    for (let i = 0; i < it.qty; i++) {
      const serialSeed = coupons.filter((c) => c.coupon_id === p.spec_coupon_id && c.level === it.level).length + issued.filter((x) => x.coupon_id === p.spec_coupon_id && x.level === it.level).length + 1;
      issued.push({ id: "id_" + Math.random().toString(36).slice(2, 10), coupon_no: genCouponNo(p.spec_coupon_id, it.level, serialSeed), order_no: orderNo, product_id: p.id, product_name: p.name_en, coupon_id: p.spec_coupon_id, level: it.level, level_name: r.level_name, coupon_name: r.coupon_name, deposit: r.price, sell, status: "SOLD", use_start_date: r.use_start_date, use_end_date: r.use_end_date, created_at: nowIso });
    }
  });
  const order = { id: "id_" + Math.random().toString(36).slice(2, 10), order_no: orderNo, items: orderItems, total, pay_method: "CARD(mock)", status: "결제완료", buyer: { name: `${buyer.first} ${buyer.last}`, phone: buyer.phone, email: buyer.email, nationality: buyer.nationality }, use_date: uiState.ticketUseDate || "", created_at: nowIso };
  orders.push(order); saveTicketOrders(orders);
  coupons.push(...issued); saveTicketCoupons(coupons);
  return { order, issued };
}

/* ─── 예약완료 (#/ticket/done) ─── */
function renderTicketDone(app) {
  const L = (ko, en) => (uiState.lang === "en" ? en : ko);
  const res = uiState.ticketLastOrder;
  if (!res) { location.hash = "#/ticket/search"; return; }
  const { order, issued } = res;
  const rows = issued.map((c) => `<tr><td style="font-family:monospace">${escapeHtml(c.coupon_no)}</td><td>${escapeHtml(c.coupon_name)}</td><td>${formatWon(c.sell)}</td><td>${escapeHtml(c.use_start_date)}~${escapeHtml(c.use_end_date)}</td></tr>`).join("");
  app.innerHTML = `<div class="content-wrap" style="max-width:780px;margin:30px auto;padding:0 16px 60px">
    <div style="background:#ecfdf5;border:1px solid #a7f3d0;border-radius:12px;padding:28px;text-align:center;margin-bottom:18px">
      <div style="font-size:44px">🎫</div>
      <h2 style="margin:8px 0 4px">${L("예약이 완료되었습니다", "Reservation complete")}</h2>
      <div style="color:#065f46">${L("주문번호", "Order")} <strong>${escapeHtml(order.order_no)}</strong> · ${L("결제금액", "Paid")} <strong>${formatWon(order.total)}</strong> · ${L("결제완료(목업)", "Paid (mock)")}</div>
    </div>
    <h3 style="font-size:16px;margin:0 0 8px">${L("발급된 쿠폰", "Issued coupons")} (${issued.length})</h3>
    <table class="tkf-info tkf-issued"><thead><tr><th>${L("쿠폰번호(12자리)", "Coupon No.")}</th><th>${L("쿠폰명", "Coupon")}</th><th>${L("판매가", "Price")}</th><th>${L("사용기간", "Valid")}</th></tr></thead><tbody>${rows}</tbody></table>
    <div style="margin-top:8px;color:#888;font-size:12px">${L("발급 쿠폰은 어드민 예약·발급현황(S15/S16)에서 조회되고, 현장에서 바코드로 사용 처리됩니다.", "Coupons appear in admin S15/S16 and are used on-site.")}</div>
    <div style="margin-top:20px;text-align:center"><a href="#/ticket/search" class="btn-cta" style="text-decoration:none">${L("티켓 더 보기", "More tickets")}</a></div>
  </div>`;
}

/* ─── 로그인 (프로토타입 목업) — 이메일 → 인증번호(신규)/패스워드(기존) → 로그인 ─── */
function renderLogin(app) {
  const L = (ko, en) => (uiState.lang === "en" ? en || ko : ko || en);
  const a = uiState.auth || (uiState.auth = { step: "email", email: DEMO_LOGIN.email, isNew: false, next: "", err: "" });
  const emailOk = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(v || "").trim());
  const box = (inner) => `<div class="login-wrap"><div class="login-card">${inner}</div></div>`;
  const errHtml = a.err ? `<p class="login-err">${escapeHtml(a.err)}</p>` : "";

  if (a.step === "verify") {
    app.innerHTML = box(`
      <h2 class="login-title">${L("이메일 인증", "Verify your email")}</h2>
      <p class="login-sub">${L("인증번호를 이메일로 보냈습니다.", "We sent a verification code to your email.")}<br><span style="color:#7c3aed">${escapeHtml(a.email)}</span></p>
      <div class="login-note">${L("프로토타입: 아무 6자리 숫자나 입력하면 통과합니다.", "Prototype: enter any 6 digits.")}</div>
      <input id="lg_code" class="login-input" inputmode="numeric" maxlength="6" placeholder="000000" style="letter-spacing:8px;text-align:center;font-size:18px">
      ${errHtml}
      <button id="lg_verify" class="btn-cta login-btn">${L("인증하기", "Verify email")}</button>
      <div class="login-links"><a id="lg_back" href="javascript:void(0)">${L("← 이메일 다시 입력", "← Back to sign in")}</a></div>`);
    app.querySelector("#lg_verify").addEventListener("click", () => {
      const code = (app.querySelector("#lg_code").value || "").trim();
      if (!/^\d{6}$/.test(code)) { a.err = L("6자리 숫자를 입력하세요.", "Enter 6 digits."); render(); return; }
      a.err = ""; a.step = "password"; render();
    });
    app.querySelector("#lg_back").addEventListener("click", () => { a.step = "email"; a.err = ""; render(); });
    return;
  }

  if (a.step === "password") {
    const heading = a.isNew ? L("비밀번호 설정", "Set your password") : L("비밀번호 입력", "Enter your password");
    app.innerHTML = box(`
      <h2 class="login-title">${heading}</h2>
      <label class="login-label">${L("이메일", "Email")}</label>
      <input class="login-input" value="${escapeHtml(a.email)}" readonly style="background:#f5f5f2;color:#888">
      <label class="login-label">${a.isNew ? L("새 비밀번호 (8자 이상)", "New password (8+ chars)") : L("비밀번호", "Password")}</label>
      <input id="lg_pw" class="login-input" type="password" placeholder="Password" value="${a.email === DEMO_LOGIN.email ? DEMO_LOGIN.password : ""}">
      ${a.email === DEMO_LOGIN.email ? `<p class="login-note" style="margin-top:6px">${L("데모 계정 기본값이 입력되어 있습니다. 바로 로그인하세요.", "Demo account is pre-filled. Just sign in.")}</p>` : ""}
      ${errHtml}
      <button id="lg_submit" class="btn-cta login-btn">${a.isNew ? L("가입하고 로그인", "Register and sign in") : L("로그인", "Sign in")}</button>
      <div class="login-links"><a id="lg_back" href="javascript:void(0)">${L("← 이메일 다시 입력", "← Back to sign in")}</a></div>`);
    app.querySelector("#lg_submit").addEventListener("click", () => {
      const pw = app.querySelector("#lg_pw").value || "";
      if (a.isNew) {
        if (pw.length < 8) { a.err = L("비밀번호는 8자 이상이어야 합니다.", "Password must be at least 8 characters."); render(); return; }
        const members = loadMembers(); members.push({ email: a.email, password: pw }); saveMembers(members);
      } else {
        const m = findMember(a.email);
        if (m && m.password && m.password !== pw) { a.err = L("비밀번호가 일치하지 않습니다.", "Incorrect password."); render(); return; }
      }
      loginSuccess(a.email);
    });
    app.querySelector("#lg_back").addEventListener("click", () => { a.step = "email"; a.err = ""; render(); });
    return;
  }

  // step: email
  app.innerHTML = box(`
    <h2 class="login-title">${L("로그인 또는 회원가입", "Sign in or create an account")}</h2>
    <label class="login-label">${L("이메일", "Email")}</label>
    <input id="lg_email" class="login-input" type="email" value="${escapeHtml(a.email)}" placeholder="you@example.com">
    ${errHtml}
    <button id="lg_continue" class="btn-cta login-btn">${L("이메일로 계속하기", "Continue with email")}</button>
    <p class="login-terms">${L("로그인·가입 시 High1 이용약관 및 개인정보처리방침에 동의하는 것으로 간주됩니다.", "By continuing you agree to High1's Terms and Privacy Policy.")}</p>`);
  const go = () => {
    const email = (app.querySelector("#lg_email").value || "").trim();
    if (!emailOk(email)) { a.err = L("올바른 이메일을 입력하세요.", "Enter a valid email."); render(); return; }
    a.email = email; a.err = "";
    a.isNew = !findMember(email);
    a.step = a.isNew ? "verify" : "password";
    render();
  };
  app.querySelector("#lg_continue").addEventListener("click", go);
  app.querySelector("#lg_email").addEventListener("keydown", (e) => { if (e.key === "Enter") go(); });
}

function loginSuccess(email) {
  setSession(email);
  const next = (uiState.auth && uiState.auth.next) || "#/";
  uiState.auth = { step: "email", email: DEMO_LOGIN.email, isNew: false, next: "", err: "" };
  location.hash = next && next !== "#/login" ? next : "#/";
  render();
}

/** GNB 상태 반영 — 로그인 시 Sign in/up 버튼 미노출(Figma), Mypage의 Log out 노출 */
function renderAuthGnb() {
  const u = currentUser();
  const btn = document.getElementById("signinBtn");
  if (btn) btn.style.display = u ? "none" : "";           // 로그인 완료 시 버튼 미노출
  const logoutItem = document.getElementById("myLogout");
  if (logoutItem) logoutItem.style.display = u ? "block" : "none"; // Log out은 로그인 시만
}

/* ═══════════════════ 숙소 예약 흐름 (프런트) — 로그인 필수 ═══════════════════ */
const NATIONALITIES = ["Korea", "China", "Japan", "United States", "Taiwan", "Hong Kong", "Singapore", "Thailand", "Vietnam", "Philippines", "Malaysia", "Indonesia", "Other"];
const PHONE_CCS = ["+82", "+86", "+81", "+886", "+852", "+65", "+66", "+84", "+63", "+60", "+62", "+1", "+44"];
const RESV_HOLD_MINUTES = 10;

/* 회원 프로필(이메일별) */
function loadProfiles() { return ldJson(STORAGE_PROFILE, {}); }
function loadProfile(email) { const all = loadProfiles(); return (email && all[email]) || null; }
function saveProfile(email, p) { const all = loadProfiles(); all[email] = p; localStorage.setItem(STORAGE_PROFILE, JSON.stringify(all)); }
/** 투숙자 전체 이름 (First Middle Last) */
function guestFullName(g) { return [g && g.firstName, g && g.middleName, g && g.lastName].filter(Boolean).join(" "); }

/** 예약 컨텍스트(상품/객실/숙소/요금/취소정책) 계산 */
function bookingContext(b) {
  if (!b || !b.productId) return null;
  const products = loadJson(STORAGE_PRODUCTS, []);
  const rooms    = loadJson(STORAGE_ROOMS, []);
  const places   = loadJson(STORAGE_PLACES, []);
  const product  = products.find((p) => p.id === b.productId);
  if (!product) return null;
  const room  = rooms.find((r) => r.id === product.room_id) || null;
  const place = room ? places.find((pl) => pl.id === room.place_id) : null;
  const ev = evaluateProductForStay(product, b.ci, b.co);
  let deposit = 0; // 입금가(원가) 합계 — 판매가와 별도 집계
  for (const ymd of (ev.nights || [])) {
    const row = inventoryRow(product, ymd);
    if (row) deposit += Math.max(0, parseInt(String(row.price).replace(/\D/g, ""), 10) || 0);
  }
  return { product, room, place, ev, deposit, nights: (ev.nights || []).length };
}

/** 카드/[Select Room] → 예약 진입(날짜·재고 확인 + 로그인 필수 + 선택적 로딩) */
function startBooking(productId, opts) {
  const ci = uiState.searchDraft && uiState.searchDraft.ci;
  const co = uiState.searchDraft && uiState.searchDraft.co;
  if (!ci || !co) { alert("체크인·체크아웃 날짜를 먼저 선택해 주세요."); return; }
  const pax = JSON.parse(JSON.stringify(normalizePax()));
  const b = { productId, ci, co, pax, guest: null, agree: false, holdUntil: null, result: null };
  const ctx = bookingContext(b);
  if (!ctx) { alert("상품 정보를 찾을 수 없습니다."); return; }
  if (ctx.ev.state !== "ok") { alert("현재 예약할 수 없는 상품입니다. (마감·재고·판매기간 확인)"); return; }
  uiState.booking = b;
  if (!requireLogin("#/booking")) return; // 미로그인 → 로그인 후 #/booking 복귀
  if (opts && opts.loading) {
    const L = (ko, en) => (uiState.lang === "en" ? en : ko);
    showLoadingOverlay(L("예약 페이지로 이동 중…", "Opening booking…"));
    setTimeout(() => { hideLoadingOverlay(); location.hash = "#/booking"; }, 1000);
  } else {
    location.hash = "#/booking";
  }
}

/** 예약 요약 카드 (booking / payment 공용) */
function bookingSummaryHtml(ctx, b, L) {
  const placeName = escapeHtml(ctx.place ? (localizeField(ctx.place, "place_name") || ctx.place.place_name || "") : "");
  const roomName  = escapeHtml(ctx.room ? (ctx.room.room_name || ctx.room.room_code || "") : "");
  const prodName  = escapeHtml((uiState.lang === "zh" && ctx.product.name_zh) || ctx.product.name_en || ctx.product.name || "");
  const rooms = (b.pax && b.pax.rooms) || [];
  const adults = rooms.reduce((s, r) => s + (r.adults || 0), 0);
  const children = rooms.reduce((s, r) => s + (r.children || 0), 0);
  const paxLine = `${L("성인", "Adults")} ${adults} · ${L("아동", "Children")} ${children} · ${rooms.length} ${L("객실", "room(s)")}`;
  const cancel = ctx.ev.cancelLine || "";
  const isFree = /무료취소/.test(cancel);
  return `<div class="bk-summary">
    <div class="bk-sum-head">${placeName}</div>
    <div class="bk-sum-room">${roomName} · ${prodName}</div>
    <table class="bk-sum-tbl">
      <tr><th>${L("체크인", "Check-in")}</th><td>${escapeHtml(b.ci)}</td></tr>
      <tr><th>${L("체크아웃", "Check-out")}</th><td>${escapeHtml(b.co)}</td></tr>
      <tr><th>${L("숙박", "Nights")}</th><td>${ctx.nights} ${L("박", "night(s)")}</td></tr>
      <tr><th>${L("인원", "Guests")}</th><td>${paxLine}</td></tr>
    </table>
    <div class="bk-cancel ${isFree ? "free" : "no"}">${escapeHtml(cancel || L("취소 및 환불불가", "Non-refundable"))}</div>
    <div class="bk-total"><span>${L("결제 금액", "Total")}</span><strong>${formatWon(ctx.ev.totalPrice)}</strong></div>
  </div>`;
}

/** 1. 예약 (Who's staying) — 투숙자만 입력 */
function renderBooking(app) {
  const L = (ko, en) => (uiState.lang === "en" ? en || ko : ko || en);
  if (!requireLogin("#/booking")) return;
  const b = uiState.booking;
  const ctx = b && bookingContext(b);
  if (!ctx) { location.hash = "#/"; return; }
  if (ctx.ev.state !== "ok") { alert(L("예약할 수 없는 상품입니다.", "This product is not bookable.")); location.hash = "#/"; return; }
  window.scrollTo(0, 0);
  const u = currentUser();
  // 프로필 기본 투숙객 정보 자동채움 (토글 ON) — 이미 입력 중이면 그 값 우선
  const prof = (u && loadProfile(u.email)) || null;
  const auto = (prof && prof.useAsDefault) ? prof : null;
  const g = b.guest || {
    nationality: (auto && auto.nationality) || "Korea",
    firstName: (auto && auto.firstName) || "",
    middleName: (auto && auto.middleName) || "",
    lastName: (auto && auto.lastName) || "",
    email: (auto && auto.email) || (u && u.email) || "",
    phoneCc: (auto && auto.phoneCc) || "+82",
    phone: (auto && auto.phone) || "",
  };
  const natOpts = NATIONALITIES.map((n) => `<option value="${escapeHtml(n)}" ${g.nationality === n ? "selected" : ""}>${escapeHtml(n)}</option>`).join("");
  const ccOpts = PHONE_CCS.map((c) => `<option value="${escapeHtml(c)}" ${g.phoneCc === c ? "selected" : ""}>${escapeHtml(c)}</option>`).join("");
  const autoNote = auto ? `<div class="bk-autofill">✓ ${L("프로필의 기본 투숙객 정보를 불러왔습니다. 필요 시 수정하세요.", "Loaded default guest info from your profile. Edit if needed.")}</div>` : "";

  app.innerHTML = `<div class="bk-wrap">
    <div class="bk-steps"><span class="on">1 ${L("투숙자 정보", "Guest")}</span><span>2 ${L("결제", "Payment")}</span><span>3 ${L("완료", "Done")}</span></div>
    <div class="bk-grid">
      <div class="bk-main">
        <h2 class="bk-title">${L("투숙자 정보", "Who's staying?")}</h2>
        <p class="bk-note">${L("예약자와 투숙자는 동일하게 처리됩니다. 여권 표기와 동일하게 영문으로 입력해 주세요.", "The booker is the guest. Please enter your name in English as shown on your passport.")}</p>
        ${autoNote}
        <label class="bk-label">${L("국적", "Nationality")}</label>
        <select id="bk_nat" class="bk-input">${natOpts}</select>
        <div class="bk-row3">
          <div><label class="bk-label">${L("영문 이름 (First)", "First name")}</label><input id="bk_first" class="bk-input" value="${escapeHtml(g.firstName)}" placeholder="GILDONG"></div>
          <div><label class="bk-label">${L("미들네임 (선택)", "Middle name")}</label><input id="bk_middle" class="bk-input" value="${escapeHtml(g.middleName || "")}" placeholder="—"></div>
          <div><label class="bk-label">${L("영문 성 (Last)", "Last name")}</label><input id="bk_last" class="bk-input" value="${escapeHtml(g.lastName)}" placeholder="HONG"></div>
        </div>
        <label class="bk-label">${L("이메일", "Email")}</label>
        <input id="bk_email" class="bk-input" type="email" value="${escapeHtml(g.email)}" placeholder="you@example.com">
        <label class="bk-label">${L("휴대폰 번호 (선택)", "Mobile (optional)")}</label>
        <div class="bk-phone"><select id="bk_cc" class="bk-input bk-cc">${ccOpts}</select><input id="bk_phone" class="bk-input" inputmode="tel" value="${escapeHtml(g.phone)}" placeholder="10-0000-0000"></div>
        <label class="bk-agree"><input type="checkbox" id="bk_agree" ${b.agree ? "checked" : ""}> ${L("예약 조건 및 취소·환불 정책에 동의합니다.", "I agree to the booking terms and cancellation policy.")}</label>
        <p class="bk-err" id="bk_err" style="display:none"></p>
        <button id="bk_next" class="btn-cta bk-btn">${L("결제하기", "Continue to payment")}</button>
      </div>
      <aside class="bk-side">${bookingSummaryHtml(ctx, b, L)}</aside>
    </div>
  </div>`;

  app.querySelector("#bk_next").addEventListener("click", () => {
    const guest = {
      nationality: app.querySelector("#bk_nat").value,
      firstName: (app.querySelector("#bk_first").value || "").trim(),
      middleName: (app.querySelector("#bk_middle").value || "").trim(),
      lastName: (app.querySelector("#bk_last").value || "").trim(),
      email: (app.querySelector("#bk_email").value || "").trim(),
      phoneCc: app.querySelector("#bk_cc").value,
      phone: (app.querySelector("#bk_phone").value || "").trim(),
    };
    b.agree = app.querySelector("#bk_agree").checked;
    const errEl = app.querySelector("#bk_err");
    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(guest.email);
    let msg = "";
    if (!guest.firstName || !guest.lastName) msg = L("영문 이름과 성을 입력하세요.", "Enter first and last name.");
    else if (!emailOk) msg = L("올바른 이메일을 입력하세요.", "Enter a valid email.");
    else if (!b.agree) msg = L("예약 조건에 동의해 주세요.", "Please agree to the terms.");
    if (msg) { errEl.textContent = msg; errEl.style.display = "block"; return; }
    b.guest = guest;
    b.holdUntil = Date.now() + RESV_HOLD_MINUTES * 60 * 1000;
    location.hash = "#/payment";
  });
}

/** 2. 결제 (홀딩 타이머 + 카드정보 목업) */
function renderPayment(app) {
  const L = (ko, en) => (uiState.lang === "en" ? en || ko : ko || en);
  if (!requireLogin("#/payment")) return;
  const b = uiState.booking;
  const ctx = b && b.guest && bookingContext(b);
  if (!ctx) { location.hash = "#/"; return; }
  if (!b.holdUntil) b.holdUntil = Date.now() + RESV_HOLD_MINUTES * 60 * 1000;
  window.scrollTo(0, 0);

  app.innerHTML = `<div class="bk-wrap">
    <div class="bk-steps"><span class="done">1 ${L("투숙자 정보", "Guest")}</span><span class="on">2 ${L("결제", "Payment")}</span><span>3 ${L("완료", "Done")}</span></div>
    <div class="bk-hold" id="bk_hold"></div>
    <div class="bk-grid">
      <div class="bk-main">
        <h2 class="bk-title">${L("결제", "Payment")}</h2>
        <div class="bk-note">${L("프로토타입입니다. 실제로 결제되지 않습니다 (PG 목업).", "Prototype only — no real charge (PG mock).")}</div>
        <label class="bk-label">${L("카드 번호", "Card number")}</label>
        <input id="pay_card" class="bk-input" inputmode="numeric" placeholder="0000 0000 0000 0000" maxlength="19">
        <div class="bk-row2">
          <div><label class="bk-label">${L("유효기간", "Expiry")}</label><input id="pay_exp" class="bk-input" placeholder="MM/YY" maxlength="5"></div>
          <div><label class="bk-label">CVC</label><input id="pay_cvc" class="bk-input" inputmode="numeric" placeholder="000" maxlength="4"></div>
        </div>
        <label class="bk-label">${L("카드 소유자명", "Cardholder name")}</label>
        <input id="pay_name" class="bk-input" placeholder="GILDONG HONG" value="${escapeHtml(guestFullName(b.guest))}">
        <p class="bk-err" id="pay_err" style="display:none"></p>
        <button id="pay_do" class="btn-cta bk-btn">${L("결제하기", "Pay")} ${formatWon(ctx.ev.totalPrice)}</button>
        <div class="bk-links"><a href="javascript:void(0)" id="pay_back">${L("← 투숙자 정보로", "← Back to guest info")}</a></div>
      </div>
      <aside class="bk-side">${bookingSummaryHtml(ctx, b, L)}</aside>
    </div>
  </div>`;

  const holdEl = app.querySelector("#bk_hold");
  const tick = () => {
    const remain = Math.max(0, (b.holdUntil || 0) - Date.now());
    const mm = String(Math.floor(remain / 60000)).padStart(2, "0");
    const ss = String(Math.floor((remain % 60000) / 1000)).padStart(2, "0");
    if (holdEl) holdEl.innerHTML = `⏳ ${L("재고 확보 시간", "Hold time")} <strong>${mm}:${ss}</strong> — ${L("시간 내 결제를 완료해 주세요.", "Please complete payment within the time.")}`;
    if (remain <= 0) {
      if (window.__holdTimer) { clearInterval(window.__holdTimer); window.__holdTimer = null; }
      alert(L("홀딩 시간이 만료되어 예약이 해제되었습니다. 다시 시도해 주세요.", "Hold time expired. The reservation was released. Please try again."));
      uiState.booking = null;
      location.hash = "#/search";
    }
  };
  tick();
  window.__holdTimer = setInterval(tick, 1000);

  app.querySelector("#pay_card").addEventListener("input", (e) => {
    const v = e.target.value.replace(/\D/g, "").slice(0, 16);
    e.target.value = v.replace(/(.{4})/g, "$1 ").trim();
  });
  app.querySelector("#pay_exp").addEventListener("input", (e) => {
    const v = e.target.value.replace(/\D/g, "").slice(0, 4);
    e.target.value = v.length > 2 ? v.slice(0, 2) + "/" + v.slice(2) : v;
  });
  app.querySelector("#pay_back").addEventListener("click", () => { location.hash = "#/booking"; });
  app.querySelector("#pay_do").addEventListener("click", () => {
    const card = (app.querySelector("#pay_card").value || "").replace(/\s/g, "");
    const exp = app.querySelector("#pay_exp").value || "";
    const cvc = app.querySelector("#pay_cvc").value || "";
    const errEl = app.querySelector("#pay_err");
    let msg = "";
    if (card.length < 15) msg = L("카드 번호를 입력하세요.", "Enter a valid card number.");
    else if (!/^\d{2}\/\d{2}$/.test(exp)) msg = L("유효기간(MM/YY)을 입력하세요.", "Enter expiry (MM/YY).");
    else if (cvc.length < 3) msg = L("CVC를 입력하세요.", "Enter CVC.");
    if (msg) { errEl.textContent = msg; errEl.style.display = "block"; return; }
    if (window.__holdTimer) { clearInterval(window.__holdTimer); window.__holdTimer = null; }
    b.result = createReservation(b, ctx);
    location.hash = "#/booking-done";
  });
}

/** 예약 레코드 생성 (예약번호 BK-YYYYMMDD-NNNNN / 거래번호 TEST-xxxxxxxxxxxx) */
function createReservation(b, ctx) {
  const list = loadJson(STORAGE_RESV, []);
  const ymd = todayKstYmd().replace(/-/g, "");
  const seq = String(list.filter((r) => String(r.code || "").startsWith("BK-" + ymd)).length + 1).padStart(5, "0");
  const code = `BK-${ymd}-${seq}`;
  const hex = () => Math.floor(Math.random() * 16).toString(16).toUpperCase();
  const txnId = "TEST-" + Array.from({ length: 12 }, hex).join("");
  const pmsLinked = ctx.product.pms_linked === true;
  const rec = {
    code, txn_id: txnId,
    member_email: (currentUser() || {}).email || "",
    domain: "acc",
    place_name: ctx.place ? (ctx.place.place_name || "") : "",
    room_name: ctx.room ? (ctx.room.room_name || ctx.room.room_code || "") : "",
    room_image: (roomImages(ctx.room)[0] || {}).data_url || "",
    product_id: ctx.product.id,
    product_name: ctx.product.name_en || ctx.product.name || "",
    checkin: b.ci, checkout: b.co, nights: ctx.nights,
    pax: b.pax,
    guest: b.guest,
    amount_deposit: ctx.deposit,        // 입금가 합계(원가, 내부)
    amount_sell: ctx.ev.totalPrice,     // 판매가 합계(고객 청구)
    cancel_policy_type: ctx.product.cancel_policy_type || "NON_REFUNDABLE",
    cancel_free_days_before: ctx.product.cancel_free_days_before != null ? ctx.product.cancel_free_days_before : null,
    source_mode: pmsLinked ? "PMS" : "MANUAL",
    status: pmsLinked ? "CONFIRMED" : "PENDING",   // PMS 연동=확정 / 수기=대기
    created_at: new Date().toISOString(),
  };
  list.push(rec);
  localStorage.setItem(STORAGE_RESV, JSON.stringify(list));
  return rec;
}

/** 3. 예약완료 (확정/대기 상태 + 예약번호) */
function renderBookingDone(app) {
  const L = (ko, en) => (uiState.lang === "en" ? en || ko : ko || en);
  const b = uiState.booking;
  const rec = b && b.result;
  if (!rec) { location.hash = "#/"; return; }
  window.scrollTo(0, 0);
  const confirmed = rec.status === "CONFIRMED";
  const badge = confirmed
    ? `<span class="bk-badge ok">${L("예약 확정", "Confirmed")}</span>`
    : `<span class="bk-badge wait">${L("예약 대기", "Pending")}</span>`;
  const stateNote = confirmed
    ? L("예약이 확정되었습니다.", "Your reservation is confirmed.")
    : L("수기 상품은 호텔 확인 후 확정됩니다. 확정 시 이메일로 안내드립니다.", "This is a manually managed product. It will be confirmed after the hotel checks availability. You'll be notified by email.");
  const guestName = escapeHtml(guestFullName(rec.guest));
  app.innerHTML = `<div class="bk-wrap bk-done">
    <div class="bk-steps"><span class="done">1</span><span class="done">2</span><span class="on">3 ${L("완료", "Done")}</span></div>
    <div class="bk-done-card ${confirmed ? "ok" : "wait"}">
      <div class="bk-done-emoji">${confirmed ? "✅" : "🕓"}</div>
      <h2>${L("예약이 접수되었습니다", "Reservation received")}</h2>
      <div class="bk-done-badge">${badge}</div>
      <div class="bk-done-code">${L("예약번호", "Reservation No.")} <strong>${escapeHtml(rec.code)}</strong></div>
      <div class="bk-done-note">${stateNote}</div>
    </div>
    <table class="bk-sum-tbl bk-done-tbl">
      <tr><th>${L("숙소", "Accommodation")}</th><td>${escapeHtml(rec.place_name)}</td></tr>
      <tr><th>${L("객실·상품", "Room · Product")}</th><td>${escapeHtml(rec.room_name)} · ${escapeHtml(rec.product_name)}</td></tr>
      <tr><th>${L("일정", "Dates")}</th><td>${escapeHtml(rec.checkin)} → ${escapeHtml(rec.checkout)} (${rec.nights}${L("박", "N")})</td></tr>
      <tr><th>${L("투숙자", "Guest")}</th><td>${guestName} · ${escapeHtml(rec.guest.email)}</td></tr>
      <tr><th>${L("결제 금액", "Paid")}</th><td><strong>${formatWon(rec.amount_sell)}</strong> · <span style="font-family:monospace;font-size:11px">${escapeHtml(rec.txn_id)}</span></td></tr>
    </table>
    <div class="bk-done-actions">
      <a href="#/" class="btn-cta" style="text-decoration:none">${L("홈으로", "Home")}</a>
      <a href="javascript:void(0)" id="bk_my" class="btn-outline">${L("예약확인", "View booking")}</a>
    </div>
  </div>`;
  app.querySelector("#bk_my").addEventListener("click", () => {
    location.hash = "#/mypage";
  });
}

/* ═══════════════════ 마이페이지 (예약 통합 목록·상세·취소) — 로그인 필수 ═══════════════════ */
/** 고객센터 정보 (프로토타입 — 실제 값은 정책 확정 후 반영) */
const SUPPORT_INFO = { phone: "1588-7789", email: "help@high1.com", hours_ko: "연중무휴 09:00 ~ 18:00", hours_en: "Daily 09:00 – 18:00" };

function fmtDateTime(iso) {
  if (!iso) return "-";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return String(iso).slice(0, 16).replace("T", " ");
  const p = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`;
}
function daysBetweenYmd(fromYmd, toYmd) {
  const ok = (s) => /^\d{4}-\d{2}-\d{2}$/.test(s);
  if (!ok(fromYmd) || !ok(toYmd)) return null;
  const p = (s) => { const a = s.split("-"); return Date.UTC(+a[0], (+a[1]) - 1, +a[2]); };
  return Math.round((p(toYmd) - p(fromYmd)) / 86400000);
}
/** 체크인 D-day 뱃지 텍스트 (오늘 이후만) */
function checkinDdayLabel(checkin, L) {
  const dd = daysBetweenYmd(todayKstYmd(), checkin);
  if (dd == null || dd < 0) return "";
  if (dd === 0) return L("체크인 D-DAY", "Check-in D-DAY");
  return L(`체크인 D-${dd}`, `Check-in D-${dd}`);
}
function paxSummary(pax, L) {
  const rooms = (pax && pax.rooms) || [];
  const a = rooms.reduce((s, r) => s + (r.adults || 0), 0);
  const c = rooms.reduce((s, r) => s + (r.children || 0), 0);
  return `${L("성인", "Adults")} ${a}${c ? ` · ${L("아동", "Children")} ${c}` : ""} · ${rooms.length} ${L("객실", "room")}`;
}
/** 예약 객실 이미지 (스냅샷 우선, 없으면 상품→객실 조회) */
function accResvImage(r) {
  if (r.room_image) return r.room_image;
  const p = loadJson(STORAGE_PRODUCTS, []).find((x) => x.id === r.product_id);
  if (!p) return "";
  const room = loadJson(STORAGE_ROOMS, []).find((x) => x.id === p.room_id);
  return (roomImages(room)[0] || {}).data_url || "";
}
/** 티켓 주문 썸네일 — 대표상품(items[0]) 썸네일 → 카테고리 히어로(S17) → No Image */
function ticketResvImage(o) {
  const pid = (o.items && o.items[0] && o.items[0].product_id) || "";
  const p = loadTicketProducts().find((x) => x.id === pid);
  let img = p ? ticketImg(p) : "";
  if (!img && p) { const cat = ticketCatByKo(p.category_1); img = ticketCatImgFront(cat); }
  return img || "";
}

/** 회원 예약(숙소+티켓) 통합 아이템 목록 */
function myBookingItems(email) {
  const today = todayKstYmd();
  const resv = loadJson(STORAGE_RESV, []).filter((r) => r.demo || (r.member_email || "") === email);
  const orders = loadTicketOrders().filter((o) => o.demo || ((o.buyer && o.buyer.email) || "") === email);
  const coupons = loadTicketCoupons();
  const items = [];
  resv.forEach((r) => {
    const tab = r.status === "CANCELLED" ? "cancelled" : ((r.checkout && r.checkout >= today) ? "current" : "past");
    const rooms = (r.pax && r.pax.rooms) || [];
    const a = rooms.reduce((s, x) => s + (x.adults || 0), 0);
    const c = rooms.reduce((s, x) => s + (x.children || 0), 0);
    items.push({ kind: "acc", id: r.code, tab, status: r.status,
      title: r.place_name || "-", sub: `${r.room_name || ""} · ${r.product_name || ""}`,
      dateLabel: `${r.checkin} → ${r.checkout}`, amount: r.amount_sell, created: r.created_at || "",
      img: accResvImage(r), adults: a, children: c, roomCount: rooms.length, checkin: r.checkin });
  });
  orders.forEach((o) => {
    const ocs = coupons.filter((c) => c.order_no === o.order_no);
    // 탭 분류: 취소 쿠폰 제외 후 '사용 가능한 미사용 잔여' 기준
    const active = ocs.filter((c) => c.status !== "CANCELLED");
    const allCancelled = ocs.length > 0 && active.length === 0;
    const usable = active.some((c) => c.status === "SOLD" && (!c.use_end_date || c.use_end_date >= today));
    const tab = allCancelled ? "cancelled" : (usable ? "current" : "past");
    const first = (o.items && o.items[0]) || {};
    const nMore = (o.items ? o.items.length : 0) - 1;
    const more = nMore > 0 ? (uiState.lang === "en" ? ` +${nMore} more` : ` 외 ${nMore}종`) : "";
    items.push({ kind: "ticket", id: o.order_no, tab, status: o.status,
      title: (first.product_name || "티켓 주문") + more, sub: "",
      amount: o.total, created: o.created_at || "",
      img: ticketResvImage(o), qty: ocs.length, checkin: "" });
  });
  items.sort((a, b) => (b.created || "").localeCompare(a.created || ""));
  return items;
}

function renderMyPage(app, parts) {
  const L = (ko, en) => (uiState.lang === "en" ? en || ko : ko || en);
  if (!requireLogin("#/mypage")) return;
  window.scrollTo(0, 0);
  if (parts[1] === "profile") { renderMyProfile(app); return; }
  if (parts[1] === "acc")    { renderMyAccDetail(app, decodeURIComponent(parts[2] || "")); return; }
  if (parts[1] === "ticket") { renderMyTicketDetail(app, decodeURIComponent(parts[2] || "")); return; }

  const email = (currentUser() || {}).email || "";
  const f = uiState.myFilter || (uiState.myFilter = { domain: "all", tab: "current" });
  let items = myBookingItems(email);
  if (f.domain !== "all") items = items.filter((it) => it.kind === f.domain);
  const counts = { current: 0, past: 0, cancelled: 0 };
  items.forEach((it) => { counts[it.tab]++; });
  const tabItems = items.filter((it) => it.tab === f.tab);

  const domBtn = (v, label) => `<button type="button" class="my-dom ${f.domain === v ? "on" : ""}" data-dom="${v}">${label}</button>`;
  const tabBtn = (v, label) => `<button type="button" class="my-tab ${f.tab === v ? "on" : ""}" data-tab="${v}">${label} (${counts[v]})</button>`;
  const badge = (it) => {
    if (it.kind === "acc") {
      if (it.status === "CANCELLED") return `<span class="my-badge cx">${L("취소완료", "Cancelled")}</span>`;
      if (it.status === "PENDING") return `<span class="my-badge wait">${L("대기", "Pending")}</span>`;
      return `<span class="my-badge ok">${L("확정", "Confirmed")}</span>`;
    }
    if (it.status === "취소완료") return `<span class="my-badge cx">${L("취소완료", "Cancelled")}</span>`;
    if (it.status === "부분취소") return `<span class="my-badge part">${L("부분취소", "Partly cancelled")}</span>`;
    return `<span class="my-badge ok">${L("결제완료", "Paid")}</span>`;
  };
  const cards = tabItems.length ? tabItems.map((it) => {
    const dday = (it.kind === "acc" && f.tab === "current") ? checkinDdayLabel(it.checkin, L) : "";
    const paxLine = it.kind === "acc"
      ? `👥 ${L("성인", "Adults")} ${it.adults}${it.children ? ` · ${L("아동", "Children")} ${it.children}` : ""} · ${it.roomCount} ${L("객실", "room")}`
      : `🎫 ${L("총", "Total")} ${it.qty}${L("매", " tickets")}`;
    const thumb = it.img
      ? `<div class="my-card-thumb"><img src="${escapeHtml(it.img)}" alt="" />${dday ? `<span class="my-dday">${dday}</span>` : ""}</div>`
      : `<div class="my-card-thumb my-no-img">No Image${dday ? `<span class="my-dday">${dday}</span>` : ""}</div>`;
    const noLabel = it.kind === "acc" ? L("예약번호", "Booking no.") : L("주문번호", "Order no.");
    return `
    <a class="my-card" href="#/mypage/${it.kind}/${encodeURIComponent(it.id)}">
      <div class="my-card-head"><span class="my-kind ${it.kind}">${it.kind === "acc" ? L("숙소", "Stay") : L("티켓", "Ticket")}</span>${badge(it)}<span class="my-card-more">${L("상세", "Details")} ›</span></div>
      <div class="my-card-order">${noLabel} <b>${escapeHtml(it.id)}</b> · ${escapeHtml(fmtDateTime(it.created))}</div>
      <div class="my-card-body">
        ${thumb}
        <div class="my-card-info">
          <div class="my-card-title">${escapeHtml(it.title)}</div>
          ${it.sub ? `<div class="my-card-sub">${escapeHtml(it.sub)}</div>` : ""}
          <div class="my-card-meta">${paxLine}</div>
          ${it.kind === "acc" ? `<div class="my-card-meta">📅 ${escapeHtml(it.dateLabel)}</div>` : ""}
        </div>
      </div>
    </a>`;
  }).join("") : `<div class="my-empty">${L("해당 내역이 없습니다.", "No bookings here.")}</div>`;

  app.innerHTML = `<div class="my-wrap">
    <h2 class="my-title">${L("나의 예약", "My Bookings")}</h2>
    <div class="my-doms">${domBtn("all", L("전체", "All"))}${domBtn("acc", L("숙소", "Stay"))}${domBtn("ticket", L("티켓", "Ticket"))}</div>
    <div class="my-tabs">${tabBtn("current", L("예정", "Current"))}${tabBtn("past", L("지난", "Past"))}${tabBtn("cancelled", L("취소", "Cancelled"))}</div>
    <div class="my-list">${cards}</div>
  </div>`;

  app.querySelectorAll(".my-dom").forEach((b) => b.addEventListener("click", () => { uiState.myFilter.domain = b.getAttribute("data-dom"); render(); }));
  app.querySelectorAll(".my-tab").forEach((b) => b.addEventListener("click", () => { uiState.myFilter.tab = b.getAttribute("data-tab"); render(); }));
}

/** 고객센터 안내 블록 (숙소·티켓 상세 공용) */
function supportBlockHtml(L) {
  return `<div class="my-support">
    <h3 class="my-sec-title">${L("고객센터", "Customer Support")}</h3>
    <div class="my-support-grid">
      <div><span>${L("전화", "Phone")}</span><strong>${SUPPORT_INFO.phone}</strong></div>
      <div><span>${L("이메일", "E-mail")}</span><strong>${SUPPORT_INFO.email}</strong></div>
      <div><span>${L("운영시간", "Hours")}</span><strong>${L(SUPPORT_INFO.hours_ko, SUPPORT_INFO.hours_en)}</strong></div>
    </div>
  </div>`;
}
/** 숙소 취소규정 상세(무료취소 기한 날짜 또는 환불불가) */
function accCancelPolicyDetail(r, L) {
  if (r.cancel_policy_type === PRODUCT_CANCEL_POLICY.FREE_N_DAYS) {
    const N = Math.max(0, parseInt(r.cancel_free_days_before, 10) || 0);
    const firstBlocked = addCalendarDaysYmd(r.checkin, -N);
    const lastFree = firstBlocked ? addCalendarDaysYmd(firstBlocked, -1) : "";
    if (lastFree) return { free: true, text: L(`${lastFree} 23:59까지 무료취소 가능 (전액 환불) · 이후 환불불가`, `Free cancellation until ${lastFree} 23:59 (full refund); non-refundable after.`) };
  }
  return { free: false, text: L("환불 불가 상품입니다.", "This booking is non-refundable.") };
}

/** 숙소 환불액 = 무료취소 기한 이내 전액 / 이후·환불불가 0 */
function computeAccRefund(r) {
  if (r.status === "CANCELLED") return r.refund_amount || 0;
  if (r.cancel_policy_type === PRODUCT_CANCEL_POLICY.FREE_N_DAYS) {
    const N = Math.max(0, parseInt(r.cancel_free_days_before, 10) || 0);
    const freeBlock = addCalendarDaysYmd(r.checkin, -N); // 이 날짜부터 환불불가
    if (freeBlock && todayKstYmd() < freeBlock) return r.amount_sell || 0;
  }
  return 0;
}

function renderMyAccDetail(app, code) {
  const L = (ko, en) => (uiState.lang === "en" ? en || ko : ko || en);
  const email = (currentUser() || {}).email || "";
  const list = loadJson(STORAGE_RESV, []);
  const r = list.find((x) => x.code === code && (x.demo || (x.member_email || "") === email));
  if (!r) { location.hash = "#/mypage"; return; }
  const cancelled = r.status === "CANCELLED";
  const canCancel = !cancelled && r.checkout >= todayKstYmd();
  const refund = computeAccRefund(r);
  const g = r.guest || {};
  const statusBadge = cancelled ? `<span class="my-badge cx">${L("취소완료", "Cancelled")}</span>`
    : (r.status === "PENDING" ? `<span class="my-badge wait">${L("예약 대기", "Pending")}</span>` : `<span class="my-badge ok">${L("예약 확정", "Confirmed")}</span>`);
  const img = accResvImage(r);
  const dday = (!cancelled && r.checkout >= todayKstYmd()) ? checkinDdayLabel(r.checkin, L) : "";
  const pol = accCancelPolicyDetail(r, L);
  const metaLine = `${L("예약번호", "Booking no.")} <strong>${escapeHtml(r.code)}</strong>`
    + ` &nbsp;|&nbsp; ${L("예약일", "Booked")} ${escapeHtml(fmtDateTime(r.created_at))}`
    + (cancelled ? ` &nbsp;|&nbsp; ${L("취소일", "Cancelled")} ${escapeHtml(fmtDateTime(r.cancelled_at))}` : "");
  app.innerHTML = `<div class="my-wrap my-detail">
    <a class="my-back" href="#/mypage">← ${L("목록으로", "Back to list")}</a>
    <div class="my-det-head"><h2>${escapeHtml(r.place_name || "")}</h2>${statusBadge}</div>
    <div class="my-det-meta">${metaLine}</div>
    ${cancelled ? `<div class="my-cancelled-box">${L("취소완료", "Cancelled")} · ${L("환불액", "Refund")} <strong>${formatWon(r.refund_amount || 0)}</strong></div>` : ""}
    <div class="my-det-card">
      ${img ? `<div class="my-det-thumb"><img src="${escapeHtml(img)}" alt="" />${dday ? `<span class="my-dday">${dday}</span>` : ""}</div>` : `<div class="my-det-thumb my-no-img">No Image${dday ? `<span class="my-dday">${dday}</span>` : ""}</div>`}
      <div class="my-det-sum">
        <div class="my-det-room">${escapeHtml(r.room_name || "")} · ${escapeHtml(r.product_name || "")}</div>
        <div class="my-det-line">📅 ${escapeHtml(r.checkin)} → ${escapeHtml(r.checkout)} (${r.nights}${L("박", "N")})</div>
        <div class="my-det-line">👥 ${escapeHtml(paxSummary(r.pax, L))}</div>
        <div class="my-det-line">💳 <strong>${formatWon(r.amount_sell)}</strong></div>
      </div>
    </div>
    <h3 class="my-sec-title">${L("투숙자 정보", "Guest info")}</h3>
    <table class="bk-sum-tbl bk-done-tbl">
      <tr><th>${L("성명", "Name")}</th><td>${escapeHtml(guestFullName(g))}</td></tr>
      <tr><th>${L("이메일", "E-mail")}</th><td>${escapeHtml(g.email || "")}</td></tr>
      <tr><th>${L("휴대폰", "Mobile")}</th><td>${escapeHtml(g.phone ? ((g.phoneCc ? g.phoneCc + " " : "") + g.phone) : "-")}</td></tr>
      <tr><th>${L("국적", "Nationality")}</th><td>${escapeHtml(g.nationality || "-")}</td></tr>
    </table>
    ${supportBlockHtml(L)}
    <h3 class="my-sec-title">${L("취소 규정", "Cancellation policy")}</h3>
    <div class="my-cancel-policy ${pol.free ? "free" : "no"}">${escapeHtml(pol.text)}</div>
    ${canCancel ? `<button id="my_cancel" class="btn-outline my-cancel-btn">${L("예약 취소", "Cancel reservation")}</button>` : ""}
  </div>`;
  if (canCancel) {
    document.getElementById("my_cancel").addEventListener("click", () => {
      showCancelModal({
        title: L("예약을 취소하시겠습니까?", "Cancel this reservation?"),
        refund,
        note: refund > 0 ? L("무료취소 기한 이내 — 전액 환불됩니다.", "Within free-cancel period — full refund.")
                         : L("환불 불가 대상 — 환불액은 0원입니다.", "Non-refundable — no refund."),
      }, L, () => {
        r.status = "CANCELLED"; r.refund_amount = refund; r.cancelled_at = new Date().toISOString();
        localStorage.setItem(STORAGE_RESV, JSON.stringify(list));
        render();
      });
    });
  }
}

/** 티켓 환불액 = 사용기간 종료 전 미사용(SOLD) 쿠폰 판매가 합 */
function computeTicketRefund(order, coupons) {
  const today = todayKstYmd();
  let refund = 0;
  coupons.filter((c) => c.order_no === order.order_no).forEach((c) => {
    if (c.status === "SOLD" && c.use_end_date && today <= c.use_end_date) refund += (c.sell || 0);
  });
  return refund;
}

/** 국적 코드/이름 → 국가명·국가번호 매핑 (프로토타입 표시용) */
function natInfo(v) {
  const raw = String(v || "").trim(); if (!raw) return null;
  const key = raw.toUpperCase();
  const M = {
    KR: { ko: "대한민국", en: "Korea", dial: "+82" }, CN: { ko: "중국", en: "China", dial: "+86" },
    JP: { ko: "일본", en: "Japan", dial: "+81" }, US: { ko: "미국", en: "USA", dial: "+1" },
    TW: { ko: "대만", en: "Taiwan", dial: "+886" }, HK: { ko: "홍콩", en: "Hong Kong", dial: "+852" },
    SG: { ko: "싱가포르", en: "Singapore", dial: "+65" }, TH: { ko: "태국", en: "Thailand", dial: "+66" },
    VN: { ko: "베트남", en: "Vietnam", dial: "+84" }, MY: { ko: "말레이시아", en: "Malaysia", dial: "+60" },
    ID: { ko: "인도네시아", en: "Indonesia", dial: "+62" }, PH: { ko: "필리핀", en: "Philippines", dial: "+63" },
  };
  const byName = { KOREA: "KR", "대한민국": "KR", CHINA: "CN", "중국": "CN", JAPAN: "JP", "일본": "JP", USA: "US", "UNITED STATES": "US", "미국": "US", TAIWAN: "TW", "대만": "TW" };
  const code = M[key] ? key : (byName[key] || "");
  return M[code] || null;
}
function renderMyTicketDetail(app, orderNo) {
  const L = (ko, en) => (uiState.lang === "en" ? en || ko : ko || en);
  const email = (currentUser() || {}).email || "";
  const orders = loadTicketOrders();
  const o = orders.find((x) => x.order_no === orderNo && (x.demo || ((x.buyer && x.buyer.email) || "") === email));
  if (!o) { location.hash = "#/mypage"; return; }
  const coupons = loadTicketCoupons();
  const ocs = coupons.filter((c) => c.order_no === o.order_no);
  const today = todayKstYmd();
  const cpLabel = (s) => ({ SOLD: L("미사용", "Unused"), USED: L("사용완료", "Used"), CANCELLED: L("취소", "Cancelled") }[s] || s);
  const allCancelled = ocs.length > 0 && ocs.every((c) => c.status === "CANCELLED");
  const anyCancelled = ocs.some((c) => c.status === "CANCELLED");
  const statusBadge = allCancelled
    ? `<span class="my-badge cx">${L("취소완료", "Cancelled")}</span>`
    : (anyCancelled ? `<span class="my-badge part">${L("부분취소", "Partly cancelled")}</span>` : `<span class="my-badge ok">${L("결제완료", "Paid")}</span>`);
  // 취소 가능 = 미사용(SOLD) + 사용종료일 이전 쿠폰 존재
  const canCancel = ocs.some((c) => c.status === "SOLD" && c.use_end_date && today <= c.use_end_date);

  // 상태 탭 (미사용 기본 / 사용완료 / 취소) — 항상 3탭 + 건수
  const byStatus = { SOLD: [], USED: [], CANCELLED: [] };
  ocs.forEach((c) => { (byStatus[c.status] || (byStatus[c.status] = [])).push(c); });
  let tab = uiState.myTicketTab; if (!["SOLD", "USED", "CANCELLED"].includes(tab)) tab = "SOLD";
  const TAB_DEF = [["SOLD", L("미사용", "Unused")], ["USED", L("사용완료", "Used")], ["CANCELLED", L("취소", "Cancelled")]];
  const tabsHtml = TAB_DEF.map(([k, label]) => `<button type="button" class="tkd-tab ${tab === k ? "on" : ""}" data-tkt="${k}">${label} <span class="tkd-tab-n">${(byStatus[k] || []).length}</span></button>`).join("");
  const isUnused = tab === "SOLD";
  const list = byStatus[tab] || [];

  // 활성 탭 쿠폰 → 상품(권종)별 그룹. 미사용=바코드보기 버튼 / 사용완료·취소=쿠폰번호만
  let groupsHtml;
  if (!list.length) {
    groupsHtml = `<div class="my-empty">${L("해당 상태의 쿠폰이 없습니다.", "No coupons in this status.")}</div>`;
  } else {
    const pOrder = []; const byP = new Map();
    list.forEach((c) => { if (!byP.has(c.product_id)) { byP.set(c.product_id, []); pOrder.push(c.product_id); } byP.get(c.product_id).push(c); });
    groupsHtml = pOrder.map((pid) => {
      const cs = byP.get(pid).slice().sort((a, b) => (a.level - b.level) || (a.coupon_no || "").localeCompare(b.coupon_no || ""));
      const rows = cs.map((c) => {
        const info = `<div class="tkd-cp-nm">${escapeHtml(ticketLevelLabel(c.level, c.level_name, L))} · ${escapeHtml(c.coupon_name || "")}</div>
          <div class="tkd-cp-sub"><span class="tkd-cp-no">${escapeHtml(c.coupon_no)}</span> · <span class="tkd-cp-vl">🗓 ${escapeHtml(c.use_start_date || "")}~${escapeHtml(c.use_end_date || "")}</span>${c.status === "USED" && c.used_at ? ` · ${L("사용", "Used")} ${escapeHtml(fmtDateTime(c.used_at))}` : ""}</div>`;
        const action = isUnused
          ? `<button type="button" class="tkd-bc-btn" data-bc="${escapeHtml(c.coupon_no)}" data-pid="${escapeHtml(c.product_id)}">${L("바코드 보기", "Barcode")}</button>`
          : `<span class="tkd-cp-stlabel st-${c.status}">${cpLabel(c.status)}</span>`;
        return `<div class="tkd-cp"><div class="tkd-cp-info">${info}</div>${action}</div>`;
      }).join("");
      return `<div class="my-cp-group"><div class="my-cp-gname">${escapeHtml(cs[0].product_name || "")} <span class="my-cp-cnt">${cs.length}${L("매", "ea")}</span></div>${rows}</div>`;
    }).join("");
  }
  // 취소 가능 = 미사용 탭 + 사용종료일 이전 미사용 쿠폰 존재
  const canCancelNow = isUnused && list.some((c) => c.use_end_date && today <= c.use_end_date);

  const img = ticketResvImage(o);
  const first = (o.items && o.items[0]) || {};
  const more = (o.items && o.items.length > 1) ? L(` 외 ${o.items.length - 1}종`, ` +${o.items.length - 1} more`) : "";
  const buyer = o.buyer || {};
  const _nat = natInfo(buyer.nationality);
  const buyerCountry = _nat ? (uiState.lang === "en" ? _nat.en : _nat.ko) : (buyer.nationality || "-");
  const _rawPhone = (buyer.phone || "").trim();
  const buyerPhone = !_rawPhone ? "-" : (_rawPhone.startsWith("+") ? _rawPhone : (_nat ? `${_nat.dial} ${_rawPhone.replace(/^0/, "")}` : _rawPhone));
  const metaLine = `${L("주문번호", "Order no.")} <strong>${escapeHtml(o.order_no)}</strong>`
    + ` &nbsp;|&nbsp; ${L("주문일", "Ordered")} ${escapeHtml(fmtDateTime(o.created_at))}`
    + (anyCancelled && o.cancelled_at ? ` &nbsp;|&nbsp; ${L("최근 취소", "Last cancel")} ${escapeHtml(fmtDateTime(o.cancelled_at))}` : "");
  // 결제 내역 — 상품별 성인/아동 수 + 금액(원 주문 기준 = 발급 쿠폰 전체)
  const payOrder = []; const payMap = new Map();
  ocs.forEach((c) => { if (!payMap.has(c.product_id)) { payMap.set(c.product_id, { name: c.product_name, adult: 0, child: 0, amount: 0 }); payOrder.push(c.product_id); } const g = payMap.get(c.product_id); if (c.level === 2) g.child++; else g.adult++; g.amount += (c.sell || 0); });
  const payRows = payOrder.map((pid) => { const g = payMap.get(pid); const parts = []; if (g.adult) parts.push(`${L("성인", "Adult")} ${g.adult}`); if (g.child) parts.push(`${L("아동", "Child")} ${g.child}`); return `<div class="tkpay-row"><div class="tkpay-l"><span class="tkpay-nm">${escapeHtml(g.name || "")}</span><span class="tkpay-cnt">${parts.join(" · ")}</span></div><div class="tkpay-amt">${formatWon(g.amount)}</div></div>`; }).join("");
  const grossTotal = ocs.reduce((s, c) => s + (c.sell || 0), 0);
  const refunded = o.refund_amount || 0;
  const refundLabel = allCancelled ? L("전체취소", "full") : L("부분취소", "partial");
  app.innerHTML = `<div class="my-wrap my-detail">
    <a class="my-back" href="#/mypage">← ${L("목록으로", "Back to list")}</a>
    <div class="my-det-head"><h2>${L("티켓 주문", "Ticket order")}</h2>${statusBadge}</div>
    <div class="my-det-meta">${metaLine}</div>

    <section class="tk-sec">
      <h3 class="tk-sec-h">${L("구매자 정보", "Buyer info")}</h3>
      <table class="bk-sum-tbl bk-done-tbl">
        <tr><th>${L("성명", "Name")}</th><td>${escapeHtml(buyer.name || "-")}</td></tr>
        <tr><th>${L("국가", "Country")}</th><td>${escapeHtml(buyerCountry)}</td></tr>
        <tr><th>${L("이메일", "E-mail")}</th><td>${escapeHtml(buyer.email || "")}</td></tr>
        <tr><th>${L("휴대폰", "Mobile")}</th><td>${escapeHtml(buyerPhone)}</td></tr>
      </table>
    </section>

    <section class="tk-sec">
      <h3 class="tk-sec-h">${L("발급 쿠폰", "Coupons")} <span class="tk-sec-cnt">(${ocs.length})</span></h3>
      <div class="tkd-tabs">${tabsHtml}</div>
      <div class="my-cp-groups">${groupsHtml}</div>
      ${isUnused && list.length ? `<p class="my-cp-guide">${L("‘바코드 보기’를 눌러 현장 POS/KIOSK에서 스캔하세요. 쿠폰 1장 = 1인 1영업장.", "Tap ‘Barcode’ to scan at the on-site POS/KIOSK. One coupon = one person, one venue.")}</p>` : ""}
    </section>

    <section class="tk-sec">
      <h3 class="tk-sec-h">${L("결제 내역", "Payment")}</h3>
      <div class="tkpay-card tkpay-flush">
        ${payRows}
        <div class="tkpay-sep"></div>
        <div class="tkpay-row tkpay-total"><div class="tkpay-l"><span class="tkpay-nm">${L("총 결제금액", "Total paid")}</span></div><div class="tkpay-amt">${formatWon(grossTotal)}</div></div>
        ${refunded ? `<div class="tkpay-row tkpay-refund"><div class="tkpay-l"><span class="tkpay-nm">${L("환불액", "Refunded")} (${refundLabel})</span></div><div class="tkpay-amt">−${formatWon(refunded)}</div></div>
        <div class="tkpay-row tkpay-net"><div class="tkpay-l"><span class="tkpay-nm">${L("실 결제금액", "Net paid")}</span></div><div class="tkpay-amt">${formatWon(grossTotal - refunded)}</div></div>` : ""}
        <div class="tkpay-method">${L("결제수단", "Payment method")} · ${L("신용카드 (목업)", "Credit card (mock)")}</div>
      </div>
    </section>

    <section class="tk-sec">
      <h3 class="tk-sec-h">${L("고객센터", "Customer Support")}</h3>
      <div class="my-support-grid">
        <div><span>${L("전화", "Phone")}</span><strong>${SUPPORT_INFO.phone}</strong></div>
        <div><span>${L("이메일", "E-mail")}</span><strong>${SUPPORT_INFO.email}</strong></div>
        <div><span>${L("운영시간", "Hours")}</span><strong>${L(SUPPORT_INFO.hours_ko, SUPPORT_INFO.hours_en)}</strong></div>
      </div>
    </section>

    <section class="tk-sec">
      <h3 class="tk-sec-h">${L("취소 규정", "Cancellation policy")}</h3>
      <div class="my-cancel-policy free">${L("오픈형 — 사용기간 종료 전 미사용 쿠폰은 상품(권종)·수량 단위로 부분취소 가능(전액 환불). 사용완료·기간 경과분은 환불불가.", "Open ticket — unused coupons can be partially cancelled by product and quantity before the valid period ends (full refund). Used/expired are non-refundable.")}</div>
      ${canCancelNow ? `<button id="my_cancel" class="btn-outline my-cancel-btn">${L("부분취소 / 취소", "Cancel tickets")}</button>` : ""}
    </section>
  </div>`;
  app.querySelectorAll(".tkd-tab").forEach((b) => b.addEventListener("click", () => { uiState.myTicketTab = b.dataset.tkt; render(); }));
  app.querySelectorAll(".tkd-bc-btn").forEach((b) => b.addEventListener("click", () => openTicketBarcodePopup(o.order_no, b.dataset.bc, L, b.dataset.pid)));
  if (canCancelNow) document.getElementById("my_cancel").addEventListener("click", () => openTicketPartialCancel(o.order_no, L));
}

/** 쿠폰별 바코드 팝업 — 큰 Code128 + 상품·레벨·사용기간·상태 */
/** 토스트 (하단 중앙, 2초 자동) */
function tkToast(msg) {
  const old = document.getElementById("tkToast"); if (old) old.remove();
  const t = document.createElement("div"); t.id = "tkToast"; t.className = "tk-toast"; t.textContent = msg;
  document.body.appendChild(t);
  requestAnimationFrame(() => t.classList.add("show"));
  clearTimeout(window._tkToastT);
  window._tkToastT = setTimeout(() => { t.classList.remove("show"); setTimeout(() => t.remove(), 300); }, 2000);
}

/** 바코드 팝업 — 미사용 쿠폰 전체 좌우 스와이프 캐러셀 + 현장 사용처리(데모) */
function openTicketBarcodePopup(orderNo, focusNo, L, productId) {
  if (!orderNo) return;
  const wrap = document.createElement("div");
  wrap.className = "my-modal-back";
  document.body.appendChild(wrap);
  const close = () => wrap.remove();
  wrap.addEventListener("click", (e) => { if (e.target === wrap) close(); });
  // productId 지정 시 해당 상품(권종) 쿠폰만 스코프 — 장소별(스키리프트/장비렌탈 등) 오사용 방지
  const unusedList = () => loadTicketCoupons().filter((c) => c.order_no === orderNo && c.status === "SOLD" && (!productId || c.product_id === productId));

  function paint(focusNo) {
    const list = unusedList();
    if (!list.length) { close(); return; }
    const slides = list.map((c) => `
      <div class="tkbc-slide" data-cn="${escapeHtml(c.coupon_no)}">
        <div class="tkbc-prod">${escapeHtml(c.product_name || "")}</div>
        <div class="tkbc-lvrow"><span class="tkbc-lvpill ${c.level === 2 ? "child" : "adult"}">${escapeHtml(ticketLevelLabel(c.level, c.level_name, L))}</span><span class="tkbc-cpn">${escapeHtml(c.coupon_name || "")}</span></div>
        <svg class="tkbc-svg js-bc" data-code="${escapeHtml(c.coupon_no)}"></svg>
        <div class="tkbc-no">${escapeHtml(c.coupon_no)}</div>
        <div class="tkbc-meta">🗓 ${L("사용기간", "Valid")} ${escapeHtml(c.use_start_date || "")} ~ ${escapeHtml(c.use_end_date || "")}</div>
        <div class="tkbc-meta">${L("판매가", "Price")} ${formatWon(c.sell)} · <span class="tkd-cp-stlabel st-SOLD">${L("미사용", "Unused")}</span></div>
        <button type="button" class="tkbc-use" data-use="${escapeHtml(c.coupon_no)}">${L("현장 사용 처리 (데모)", "Use on-site (demo)")}</button>
      </div>`).join("");
    const dots = list.map((_, i) => `<i class="tkbc-dot" data-i="${i}"></i>`).join("");
    wrap.innerHTML = `<div class="my-modal tkbc-modal tkbc-carousel">
      <div class="tkbc-head">
        <div class="tkbc-count"><span id="tkbc_cur">1</span> / ${list.length} ${L("매", "")}</div>
        <button type="button" class="tkbc-x" id="tkbc_close" aria-label="close">✕</button>
      </div>
      <div class="tkbc-track" id="tkbc_track">${slides}</div>
      ${list.length > 1 ? `<button type="button" class="tkbc-arrow tkbc-prev" id="tkbc_prev" aria-label="prev">‹</button><button type="button" class="tkbc-arrow tkbc-next" id="tkbc_next" aria-label="next">›</button>` : ""}
      <div class="tkbc-dots">${dots}</div>
      <p class="tkbc-guide">${L("좌우로 넘겨 미사용 티켓 바코드를 확인하세요. 현장 POS/KIOSK에서 스캔합니다.", "Swipe to view unused ticket barcodes. Scan at the on-site POS/KIOSK.")}</p>
    </div>`;
    if (window.JsBarcode) wrap.querySelectorAll(".js-bc").forEach((el) => { try { JsBarcode(el, el.dataset.code, { format: "CODE128", width: 2.4, height: 90, displayValue: false, margin: 0 }); } catch (e) {} });
    const track = wrap.querySelector("#tkbc_track");
    const slideEls = [...track.querySelectorAll(".tkbc-slide")];
    const dotsEls = [...wrap.querySelectorAll(".tkbc-dot")];
    const curEl = wrap.querySelector("#tkbc_cur");
    const updateIdx = () => { const i = Math.min(slideEls.length - 1, Math.max(0, Math.round(track.scrollLeft / track.clientWidth))); curEl.textContent = i + 1; dotsEls.forEach((d, k) => d.classList.toggle("on", k === i)); };
    track.addEventListener("scroll", updateIdx);
    let startIdx = slideEls.findIndex((s) => s.dataset.cn === focusNo); if (startIdx < 0) startIdx = 0;
    track.scrollLeft = startIdx * track.clientWidth; updateIdx();
    const prev = wrap.querySelector("#tkbc_prev"), next = wrap.querySelector("#tkbc_next");
    if (prev) prev.onclick = () => track.scrollBy({ left: -track.clientWidth, behavior: "smooth" });
    if (next) next.onclick = () => track.scrollBy({ left: track.clientWidth, behavior: "smooth" });
    dotsEls.forEach((dt, k) => dt.onclick = () => track.scrollTo({ left: k * track.clientWidth, behavior: "smooth" }));
    // 마우스 드래그 스와이프 (데스크톱)
    let drag = null;
    track.addEventListener("pointerdown", (e) => { if (e.target.closest(".tkbc-use, .tkbc-arrow")) return; drag = { x: e.clientX, left: track.scrollLeft, moved: false }; });
    track.addEventListener("pointermove", (e) => { if (!drag) return; const dx = e.clientX - drag.x; if (Math.abs(dx) > 3) drag.moved = true; track.scrollLeft = drag.left - dx; });
    const endDrag = () => { if (!drag) return; const w = track.clientWidth; track.scrollTo({ left: Math.round(track.scrollLeft / w) * w, behavior: "smooth" }); drag = null; };
    track.addEventListener("pointerup", endDrag);
    track.addEventListener("pointerleave", endDrag);
    track.style.cursor = slideEls.length > 1 ? "grab" : "default";
    wrap.querySelector("#tkbc_close").onclick = close;
    wrap.querySelectorAll(".tkbc-use").forEach((b) => b.onclick = () => {
      const cn = b.dataset.use; const all = loadTicketCoupons(); const cc = all.find((x) => x.coupon_no === cn);
      if (!cc || cc.status !== "SOLD") return;
      cc.status = "USED"; cc.used_at = new Date().toISOString();
      saveTicketCoupons(all);
      tkToast(L("사용 처리되었습니다.", "Marked as used."));
      render();      // 뒤 상세(미사용 목록·탭 카운트) 갱신
      paint(cn);     // 캐러셀 재구성(사용된 슬라이드 제거, 없으면 닫힘)
    });
  }
  paint(focusNo);
}

/** 수량단위 부분취소 모달 — 상품(권종)별 그룹, 레벨별 수량 선택(미사용·기간 내만) */
function openTicketPartialCancel(orderNo, L) {
  const today = todayKstYmd();
  const cancellable = (c) => c.order_no === orderNo && c.status === "SOLD" && c.use_end_date && today <= c.use_end_date;
  const lineKey = (c) => c.product_id + "|" + c.level;
  const cs = loadTicketCoupons().filter(cancellable);
  if (!cs.length) { alert(L("취소 가능한 쿠폰이 없습니다.", "No cancellable coupons.")); return; }
  const order = []; const map = new Map();
  cs.forEach((c) => { const k = lineKey(c); if (!map.has(k)) { map.set(k, { product_id: c.product_id, product_name: c.product_name, level: c.level, level_name: c.level_name, unit: c.sell, max: 0 }); order.push(k); } map.get(k).max++; });
  const lines = order.map((k) => map.get(k));
  const sel = {}; lines.forEach((l) => sel[lineKey(l)] = 0);
  const lineByKey = (k) => lines.find((l) => lineKey(l) === k);

  const pOrder = []; const pMap = new Map();
  lines.forEach((l) => { if (!pMap.has(l.product_id)) { pMap.set(l.product_id, []); pOrder.push(l.product_id); } pMap.get(l.product_id).push(l); });
  const rowHtml = (l) => `<div class="tpc-line" data-key="${lineKey(l)}">
      <div class="tpc-l"><span class="tpc-lv">${escapeHtml(ticketLevelLabel(l.level, l.level_name, L))}</span><span class="tpc-unit">${formatWon(l.unit)} · ${L("미사용", "unused")} ${l.max}</span></div>
      <div class="tpc-step"><button type="button" class="tpc-dec" aria-label="-">−</button><span class="tpc-q">0</span><button type="button" class="tpc-inc" aria-label="+">+</button></div>
    </div>`;
  const body = pOrder.map((pid) => `<div class="tpc-group"><div class="tpc-gname">${escapeHtml(pMap.get(pid)[0].product_name || "")}</div>${pMap.get(pid).map(rowHtml).join("")}</div>`).join("");

  const wrap = document.createElement("div");
  wrap.className = "my-modal-back";
  wrap.innerHTML = `<div class="my-modal tpc-modal">
    <h3>${L("취소할 티켓 선택", "Select tickets to cancel")}</h3>
    <p class="my-modal-note">${L("미사용 쿠폰만 수량 단위로 취소합니다. 취소 후 되돌릴 수 없습니다.", "Only unused coupons can be cancelled by quantity. This cannot be undone.")}</p>
    <div class="tpc-body">${body}</div>
    <div class="my-modal-refund"><span>${L("예상 환불액", "Estimated refund")}</span><strong id="tpc_refund">${formatWon(0)}</strong></div>
    <div class="my-modal-actions">
      <button class="btn-outline" id="tpc_close">${L("닫기", "Close")}</button>
      <button class="btn-cta" id="tpc_ok" disabled>${L("선택 취소하기", "Cancel selected")}</button>
    </div>
  </div>`;
  document.body.appendChild(wrap);
  const close = () => wrap.remove();
  const refresh = () => {
    let refund = 0, cnt = 0;
    Object.keys(sel).forEach((k) => { const l = lineByKey(k); refund += sel[k] * l.unit; cnt += sel[k]; });
    wrap.querySelector("#tpc_refund").textContent = formatWon(refund);
    wrap.querySelector("#tpc_ok").disabled = cnt === 0;
  };
  wrap.querySelectorAll(".tpc-line").forEach((row) => {
    const key = row.dataset.key; const l = lineByKey(key);
    row.querySelector(".tpc-dec").addEventListener("click", () => { sel[key] = Math.max(0, sel[key] - 1); row.querySelector(".tpc-q").textContent = sel[key]; refresh(); });
    row.querySelector(".tpc-inc").addEventListener("click", () => { sel[key] = Math.min(l.max, sel[key] + 1); row.querySelector(".tpc-q").textContent = sel[key]; refresh(); });
  });
  wrap.addEventListener("click", (e) => { if (e.target === wrap) close(); });
  wrap.querySelector("#tpc_close").addEventListener("click", close);
  wrap.querySelector("#tpc_ok").addEventListener("click", () => {
    let refundPreview = 0, cnt = 0;
    Object.keys(sel).forEach((k) => { const l = lineByKey(k); refundPreview += sel[k] * l.unit; cnt += sel[k]; });
    if (cnt <= 0) return;
    // 취소 여부 확인 팝업
    showCancelModal({
      title: L(`선택한 ${cnt}매를 취소하시겠습니까?`, `Cancel ${cnt} ticket(s)?`),
      refund: refundPreview,
      note: L("미사용 쿠폰만 취소되며, 취소 후 되돌릴 수 없습니다.", "Only unused coupons are cancelled. This cannot be undone."),
    }, L, () => {
      let refund = 0; const all = loadTicketCoupons();
      Object.keys(sel).forEach((k) => {
        let q = sel[k]; if (q <= 0) return;
        const [pid, lv] = k.split("|"); const level = parseInt(lv, 10);
        for (const c of all) {
          if (q <= 0) break;
          if (c.order_no === orderNo && c.product_id === pid && c.level === level && c.status === "SOLD" && c.use_end_date && today <= c.use_end_date) { c.status = "CANCELLED"; refund += (c.sell || 0); q--; }
        }
      });
      saveTicketCoupons(all);
      const orders = loadTicketOrders(); const o = orders.find((x) => x.order_no === orderNo);
      const ocs = all.filter((c) => c.order_no === orderNo);
      const allC = ocs.length > 0 && ocs.every((c) => c.status === "CANCELLED");
      const anyC = ocs.some((c) => c.status === "CANCELLED");
      o.status = allC ? "취소완료" : (anyC ? "부분취소" : "결제완료");
      o.refund_amount = (o.refund_amount || 0) + refund;
      o.cancelled_at = new Date().toISOString();
      saveTicketOrders(orders);
      close(); render();
      tkToast(L(`취소되었습니다. 환불 ${formatWon(refund)}`, `Cancelled. Refund ${formatWon(refund)}`));
    });
  });
}

/** 취소 확인 모달 (환불액 표시) */
function showCancelModal(opt, L, onConfirm) {
  const wrap = document.createElement("div");
  wrap.className = "my-modal-back";
  wrap.innerHTML = `<div class="my-modal">
    <h3>${escapeHtml(opt.title)}</h3>
    <div class="my-modal-refund"><span>${L("예상 환불액", "Estimated refund")}</span><strong>${formatWon(opt.refund)}</strong></div>
    <p class="my-modal-note">${escapeHtml(opt.note || "")}</p>
    <div class="my-modal-actions">
      <button class="btn-outline" id="mm_close">${L("닫기", "Close")}</button>
      <button class="btn-cta" id="mm_ok">${L("취소하기", "Confirm cancel")}</button>
    </div>
  </div>`;
  document.body.appendChild(wrap);
  const close = () => wrap.remove();
  wrap.addEventListener("click", (e) => { if (e.target === wrap) close(); });
  wrap.querySelector("#mm_close").addEventListener("click", close);
  wrap.querySelector("#mm_ok").addEventListener("click", () => { close(); onConfirm(); });
}

/** 내 계정정보 관리 (My Profile) — 기본 투숙객 정보 + 비밀번호 변경 */
function renderMyProfile(app) {
  const L = (ko, en) => (uiState.lang === "en" ? en || ko : ko || en);
  if (!requireLogin("#/mypage/profile")) return;
  window.scrollTo(0, 0);
  const u = currentUser();
  const email = (u && u.email) || "";
  const saved = loadProfile(email) || {};
  const p = {
    useAsDefault: saved.useAsDefault === true,
    nationality: saved.nationality || "",
    firstName: saved.firstName || "", middleName: saved.middleName || "", lastName: saved.lastName || "",
    email: saved.email || email,
    phoneCc: saved.phoneCc || "+82", phone: saved.phone || "",
  };
  const natOpts = `<option value="">${L("선택", "Select")}</option>` + NATIONALITIES.map((n) => `<option value="${escapeHtml(n)}" ${p.nationality === n ? "selected" : ""}>${escapeHtml(n)}</option>`).join("");
  const ccOpts = PHONE_CCS.map((c) => `<option value="${escapeHtml(c)}" ${p.phoneCc === c ? "selected" : ""}>${escapeHtml(c)}</option>`).join("");

  app.innerHTML = `<div class="my-wrap my-profile">
    <a class="my-back" href="#/mypage">← ${L("나의 예약", "My Bookings")}</a>
    <h2 class="my-title">${L("내 계정정보", "My Profile")}</h2>

    <div class="mp-toggle-row">
      <div>
        <div class="mp-toggle-title">${L("기본 투숙객 정보로 사용", "Set as default guest information for reservation")}</div>
        <div class="mp-toggle-sub">${L("켜면 예약 단계에서 아래 정보가 자동으로 채워집니다. (제출 전 수정 가능)", "When on, the info below auto-fills at booking. You can still edit before submit.")}</div>
      </div>
      <label class="mp-switch"><input type="checkbox" id="mp_default" ${p.useAsDefault ? "checked" : ""}><span class="mp-slider"></span></label>
    </div>

    <div class="mp-form">
      <label class="bk-label">${L("국적", "Nationality")}</label>
      <select id="mp_nat" class="bk-input">${natOpts}</select>
      <div class="bk-row3">
        <div><label class="bk-label">${L("영문 이름 (First)", "First name")}</label><input id="mp_first" class="bk-input" value="${escapeHtml(p.firstName)}" placeholder="Use only English letters"></div>
        <div><label class="bk-label">${L("미들네임 (선택)", "Middle name")}</label><input id="mp_middle" class="bk-input" value="${escapeHtml(p.middleName)}" placeholder="Use only English letters"></div>
        <div><label class="bk-label">${L("영문 성 (Last)", "Last name")}</label><input id="mp_last" class="bk-input" value="${escapeHtml(p.lastName)}" placeholder="Use only English letters"></div>
      </div>
      <label class="bk-label">${L("이메일", "Email")}</label>
      <input id="mp_email" class="bk-input" type="email" value="${escapeHtml(p.email)}" placeholder="you@example.com">
      <div class="mp-hint">${L("예약 확인 메일이 이 주소로 발송됩니다.", "Booking confirmation will be sent to this email.")}</div>
      <label class="bk-label">${L("휴대폰 번호 (선택)", "Phone number")}</label>
      <div class="bk-phone"><select id="mp_cc" class="bk-input bk-cc">${ccOpts}</select><input id="mp_phone" class="bk-input" inputmode="tel" value="${escapeHtml(p.phone)}" placeholder="Phone number"></div>
      <div class="mp-links"><a href="javascript:void(0)" id="mp_chpw">${L("비밀번호 변경", "Change password")}</a></div>
      <p class="bk-err" id="mp_err" style="display:none"></p>
      <div class="mp-actions">
        <button id="mp_cancel" class="btn-outline">${L("취소", "Cancel")}</button>
        <button id="mp_save" class="btn-cta">${L("저장", "Save")}</button>
      </div>
    </div>
  </div>`;

  app.querySelector("#mp_cancel").addEventListener("click", () => { location.hash = "#/mypage"; });
  app.querySelector("#mp_chpw").addEventListener("click", () => showChangePwModal(email, L));
  app.querySelector("#mp_save").addEventListener("click", () => {
    const np = {
      useAsDefault: app.querySelector("#mp_default").checked,
      nationality: app.querySelector("#mp_nat").value,
      firstName: (app.querySelector("#mp_first").value || "").trim(),
      middleName: (app.querySelector("#mp_middle").value || "").trim(),
      lastName: (app.querySelector("#mp_last").value || "").trim(),
      email: (app.querySelector("#mp_email").value || "").trim(),
      phoneCc: app.querySelector("#mp_cc").value,
      phone: (app.querySelector("#mp_phone").value || "").trim(),
    };
    const errEl = app.querySelector("#mp_err");
    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(np.email);
    let msg = "";
    if (!np.firstName || !np.lastName) msg = L("영문 이름과 성을 입력하세요.", "Enter first and last name.");
    else if (!emailOk) msg = L("올바른 이메일을 입력하세요.", "Enter a valid email.");
    if (msg) { errEl.textContent = msg; errEl.style.display = "block"; return; }
    saveProfile(email, np);
    alert(L("저장되었습니다.", "Saved."));
    location.hash = "#/mypage";
  });
}

/** 비밀번호 변경 모달 — 로그인의 이메일 인증 → 비번 입력 재사용(세션 인증 시 생략) */
function showChangePwModal(email, L) {
  const verified = uiState.pwVerified === true;
  const wrap = document.createElement("div");
  wrap.className = "my-modal-back";
  const close = () => wrap.remove();
  const drawVerify = () => {
    wrap.innerHTML = `<div class="my-modal">
      <h3>${L("본인 확인", "Verify your identity")}</h3>
      <p class="my-modal-note">${L("인증번호를 이메일로 보냈습니다.", "We sent a verification code to your email.")}<br><span style="color:#7c3aed">${escapeHtml(email)}</span><br>${L("프로토타입: 아무 6자리 숫자나 입력하면 통과합니다.", "Prototype: enter any 6 digits.")}</p>
      <input id="cp_code" class="bk-input" inputmode="numeric" maxlength="6" placeholder="000000" style="letter-spacing:6px;text-align:center">
      <p class="bk-err" id="cp_err1" style="display:none"></p>
      <div class="my-modal-actions"><button class="btn-outline" id="cp_close">${L("닫기", "Close")}</button><button class="btn-cta" id="cp_verify">${L("인증하기", "Verify")}</button></div>
    </div>`;
    wrap.querySelector("#cp_close").addEventListener("click", close);
    wrap.querySelector("#cp_verify").addEventListener("click", () => {
      const code = (wrap.querySelector("#cp_code").value || "").trim();
      if (!/^\d{6}$/.test(code)) { const e = wrap.querySelector("#cp_err1"); e.textContent = L("6자리 숫자를 입력하세요.", "Enter 6 digits."); e.style.display = "block"; return; }
      uiState.pwVerified = true;
      drawNewPw();
    });
  };
  const drawNewPw = () => {
    wrap.innerHTML = `<div class="my-modal">
      <h3>${L("새 비밀번호 설정", "Set a new password")}</h3>
      <label class="bk-label">${L("새 비밀번호 (8자 이상)", "New password (8+ chars)")}</label>
      <input id="cp_pw" class="bk-input" type="password" placeholder="Password">
      <label class="bk-label">${L("새 비밀번호 확인", "Confirm password")}</label>
      <input id="cp_pw2" class="bk-input" type="password" placeholder="Confirm password">
      <p class="bk-err" id="cp_err2" style="display:none"></p>
      <div class="my-modal-actions"><button class="btn-outline" id="cp_close2">${L("닫기", "Close")}</button><button class="btn-cta" id="cp_save">${L("변경하기", "Update")}</button></div>
    </div>`;
    wrap.querySelector("#cp_close2").addEventListener("click", close);
    wrap.querySelector("#cp_save").addEventListener("click", () => {
      const pw = wrap.querySelector("#cp_pw").value || "";
      const pw2 = wrap.querySelector("#cp_pw2").value || "";
      const e = wrap.querySelector("#cp_err2");
      if (pw.length < 8) { e.textContent = L("비밀번호는 8자 이상이어야 합니다.", "Password must be at least 8 characters."); e.style.display = "block"; return; }
      if (pw !== pw2) { e.textContent = L("비밀번호가 일치하지 않습니다.", "Passwords do not match."); e.style.display = "block"; return; }
      const members = loadMembers();
      const m = members.find((x) => String(x.email || "").toLowerCase() === String(email).toLowerCase());
      if (m) { m.password = pw; saveMembers(members); }
      close();
      alert(L("비밀번호가 변경되었습니다.", "Your password has been changed."));
    });
  };
  document.body.appendChild(wrap);
  wrap.addEventListener("click", (e) => { if (e.target === wrap) close(); });
  if (verified) drawNewPw(); else drawVerify();
}

/* ─── Main render ─── */
function render() {
  const app = document.getElementById("app");
  if (!app) return;

  document.documentElement.lang = uiState.lang;
  const langSel = document.getElementById("langSelect");
  if (langSel && langSel.value !== uiState.lang) langSel.value = uiState.lang;
  renderTicketGnb();
  renderAuthGnb();

  if (window.__heroTimer) { clearInterval(window.__heroTimer); window.__heroTimer = null; }
  if (window.__holdTimer) { clearInterval(window.__holdTimer); window.__holdTimer = null; }
  const { parts, path } = parseHash();
  const prevPath = uiState._lastHash;
  // 페이지 이동(해시 변경) 시 티켓 상세 모달 닫힘
  if (uiState._lastHash !== undefined && uiState._lastHash !== path && uiState.ticketModal && uiState.ticketModal.open) {
    uiState.ticketModal.open = false;
  }
  uiState._lastHash = path;
  // 다른 페이지 → 메인(#/) 진입 시 검색바 도메인 숙소 기본. (메인 내 재렌더·언어토글에선 유지)
  if (parts[0] !== "ticket" && parts[0] !== "search" && parts[0] !== "bridge" && prevPath !== undefined && prevPath !== path) uiState.searchDomain = "acc";

  if (parts[0] === "ticket") {
    if (parts[1] === "bridge") renderTicketBridge(app, decodeURIComponent(parts[2] || ""));
    else if (parts[1] === "checkout") renderTicketCheckout(app);
    else if (parts[1] === "done") renderTicketDone(app);
    else renderTicketSearch(app);
  } else if (parts[0] === "bridge") {
    uiState.searchDomain = "acc";
    renderBridge(app, parts[1] === "CONDO" ? "CONDO" : "HOTEL");
  } else if (parts[0] === "search") {
    uiState.searchDomain = "acc";
    renderSearch(app);
  } else if (parts[0] === "login") {
    renderLogin(app);
  } else if (parts[0] === "booking") {
    renderBooking(app);
  } else if (parts[0] === "payment") {
    renderPayment(app);
  } else if (parts[0] === "booking-done") {
    renderBookingDone(app);
  } else if (parts[0] === "mypage") {
    renderMyPage(app, parts);
  } else {
    renderMain(app);
  }

  renderPlaceLayer();
  renderRoomDetailModal();
  renderTicketModal();
}

/* ─── Init ─── */
window.addEventListener("DOMContentLoaded", () => {
  ensureTicketFrontSeed();
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
  document.getElementById("langSelect")?.addEventListener("change", (e) => {
    const v = e.target.value;
    uiState.lang = ["en", "zh", "ko"].includes(v) ? v : "ko";
    localStorage.setItem("high1_front_v02_lang", uiState.lang);
    render();
  });
  document.getElementById("signinBtn")?.addEventListener("click", () => {
    uiState.auth = { step: "email", email: DEMO_LOGIN.email, isNew: false, next: location.hash, err: "" };
    location.hash = "#/login";
  });
  // Mypage 드롭다운 — 비로그인 시 로그인 유도 / Log out / (Profile·My Bookings·Event·CS는 Phase3)
  document.getElementById("myNavMenu")?.addEventListener("click", (e) => {
    const a = e.target.closest("a[data-my]"); if (!a) return;
    const menu = a.getAttribute("data-my");
    if (menu === "logout") {
      if (currentUser() && confirm("로그아웃 하시겠습니까?")) { logout(); location.hash = "#/"; render(); }
      return;
    }
    if (menu === "bookings") { // 나의 예약 목록
      if (!requireLogin("#/mypage")) return;
      location.hash = "#/mypage";
      return;
    }
    if (menu === "profile") { // 내 계정정보
      if (!requireLogin("#/mypage/profile")) return;
      location.hash = "#/mypage/profile";
      return;
    }
    if (!currentUser()) { // 비로그인 → 로그인 페이지로 유도
      uiState.auth = { step: "email", email: DEMO_LOGIN.email, isNew: false, next: "#/", err: "" };
      location.hash = "#/login";
      return;
    }
    // 로그인 상태 — Event·CS는 후속 단계 예정
    alert("마이페이지 '" + a.textContent.trim() + "'는 준비 중입니다.");
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
