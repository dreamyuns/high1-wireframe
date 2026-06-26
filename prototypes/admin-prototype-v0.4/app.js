/**
 * High1 admin prototype v0.2 — localStorage only
 * Places: high1_places_v1
 * Facility categories / Facilities: (동일 v1)
 * Room masters: high1_room_master_room_type_v1, high1_room_master_trait_v1, high1_room_master_bed_type_v1
 * Rooms: high1_rooms_v1 (place_id 종속)
 * Products: high1_products_v1 (room_id 종속 · 상품관리 UI)
 */

const STORAGE_PLACES = "high1_places_v1";
const STORAGE_FACILITY_CATEGORIES = "high1_facility_categories_v1";
const STORAGE_FACILITIES = "high1_facilities_v2";
const STORAGE_FACILITIES_LEGACY = "high1_facilities_v1";
const STORAGE_ROOM_TYPES = "high1_room_master_room_type_v1";
const STORAGE_ROOM_TRAITS = "high1_room_master_trait_v1";
const STORAGE_BED_TYPES = "high1_room_master_bed_type_v1";
const STORAGE_ROOMS = "high1_rooms_v1";
const STORAGE_PRODUCTS = "high1_products_v1";

/** 객실 부가요금 반영 기준 — 프런트 정책 노출은 모드와 무관하게 동일하게 표시 */
const ROOM_CHARGE_SETTLEMENT = {
  AT_BOOKING: "AT_BOOKING",
  ON_SITE: "ON_SITE",
};

function normalizeRoomChargeSettlement(v) {
  return v === ROOM_CHARGE_SETTLEMENT.ON_SITE ? ROOM_CHARGE_SETTLEMENT.ON_SITE : ROOM_CHARGE_SETTLEMENT.AT_BOOKING;
}

/** 카테고리 구분 — 숙소 시설 / 객실 시설 등 */
const CATEGORY_DOMAIN = {
  PLACE: "PLACE",
  ROOM: "ROOM",
};

function normalizeCategoryDomain(d) {
  return d === CATEGORY_DOMAIN.ROOM ? CATEGORY_DOMAIN.ROOM : CATEGORY_DOMAIN.PLACE;
}

function domainPathSegment(domain) {
  return normalizeCategoryDomain(domain) === CATEGORY_DOMAIN.ROOM ? "room" : "place";
}

function domainLabel(domain) {
  return normalizeCategoryDomain(domain) === CATEGORY_DOMAIN.ROOM ? "객실" : "숙소";
}

const HOTEL_SUBS = [
  { value: "grand_main", label: "Grand main" },
  { value: "grand_convention", label: "Grand convention" },
  { value: "palace", label: "Palace" },
];

const CONDO_SUBS = [
  { value: "valley", label: "Valley" },
  { value: "hill", label: "Hill" },
  { value: "mountain", label: "Mountain" },
];

function uid() {
  return "id_" + Math.random().toString(36).slice(2, 11) + Date.now().toString(36);
}

const PLACE_IMAGE_MAX_MB = 2;
const CATEGORY_PICTOGRAM_MAX_MB = 5;

function loadPlaces() {
  try {
    const raw = localStorage.getItem(STORAGE_PLACES);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function savePlaces(list) {
  localStorage.setItem(STORAGE_PLACES, JSON.stringify(list));
}

function isStorageQuotaExceeded(err) {
  if (!err) return false;
  return (
    err.name === "QuotaExceededError" ||
    err.name === "NS_ERROR_DOM_QUOTA_REACHED" ||
    err.code === 22 ||
    err.code === 1014
  );
}

/** 숙소별 대표 노출 시설 id — 적용된 facility_ids 안에서만, 최대 10개 */
function normalizeFeaturedFacilityIds(raw, facilityIds) {
  const allowed = new Set(Array.isArray(facilityIds) ? facilityIds : []);
  const ids = Array.isArray(raw) ? raw : [];
  const out = [];
  for (const id of ids) {
    if (typeof id !== "string" || !allowed.has(id)) continue;
    if (out.includes(id)) continue;
    out.push(id);
    if (out.length >= 10) break;
  }
  return out;
}

/** 숙소: plc##### 또는 기존 cate##### 시퀀스 반영 · 객실: rmc##### */
function nextCategoryCode(list, domain) {
  const d = normalizeCategoryDomain(domain);
  const sub = Array.isArray(list) ? list.filter((c) => normalizeCategoryDomain(c.domain) === d) : [];
  if (d === CATEGORY_DOMAIN.PLACE) {
    const nums = sub.flatMap((c) => {
      const m = String(c.code || "").match(/^(?:plc|cate)(\d{5})$/);
      return m ? [parseInt(m[1], 10)] : [];
    });
    const max = nums.length ? Math.max(...nums) : 0;
    return "plc" + String(max + 1).padStart(5, "0");
  }
  const nums = sub.flatMap((c) => {
    const m = String(c.code || "").match(/^rmc(\d{5})$/);
    return m ? [parseInt(m[1], 10)] : [];
  });
  const max = nums.length ? Math.max(...nums) : 0;
  return "rmc" + String(max + 1).padStart(5, "0");
}

function migrateFacilityCategoriesDomain(list) {
  if (!Array.isArray(list)) return [];
  let changed = false;
  const next = list.map((c) => {
    if (c.domain === CATEGORY_DOMAIN.PLACE || c.domain === CATEGORY_DOMAIN.ROOM) return c;
    changed = true;
    return { ...c, domain: CATEGORY_DOMAIN.PLACE };
  });
  return changed ? next : list;
}

function saveFacilityCategories(list) {
  localStorage.setItem(STORAGE_FACILITY_CATEGORIES, JSON.stringify(list));
}

function saveFacilities(list) {
  localStorage.setItem(STORAGE_FACILITIES, JSON.stringify(list));
}

/** Legacy v1 → categories + v2 facilities (once) */
function migrateFacilitiesFromV1() {
  const legacyRaw = localStorage.getItem(STORAGE_FACILITIES_LEGACY);
  const hasV2 = localStorage.getItem(STORAGE_FACILITIES);
  const hasCats = localStorage.getItem(STORAGE_FACILITY_CATEGORIES);
  if (!legacyRaw || hasV2 || hasCats) return false;

  let oldList;
  try {
    oldList = JSON.parse(legacyRaw);
  } catch {
    return false;
  }
  if (!Array.isArray(oldList) || oldList.length === 0) return false;

  const orderNames = [];
  const seen = new Set();
  oldList.forEach((x) => {
    const n = x.category || "기타";
    if (!seen.has(n)) {
      seen.add(n);
      orderNames.push(n);
    }
  });

  const categories = [];
  const nameToId = new Map();
  orderNames.forEach((name) => {
    const id = uid();
    nameToId.set(name, id);
    categories.push({
      id,
      domain: CATEGORY_DOMAIN.PLACE,
      code: nextCategoryCode(categories, CATEGORY_DOMAIN.PLACE),
      name,
      pictogram_meta: [],
      visible: true,
      updatedAt: new Date().toISOString(),
    });
  });

  const facilities = oldList.map((x) => ({
    id: x.id || uid(),
    code: x.code,
    name: x.name,
    category_id: nameToId.get(x.category || "기타"),
    visible: x.visible !== false,
    updatedAt: x.updatedAt || new Date().toISOString(),
  }));

  saveFacilityCategories(categories);
  saveFacilities(facilities);
  return true;
}

function seedFacilityCategoriesAndFacilities() {
  const swimId = uid();
  const spaId = uid();
  const categories = [
    {
      id: swimId,
      domain: CATEGORY_DOMAIN.PLACE,
      code: "cate00001",
      name: "수영장",
      pictogram_meta: [],
      visible: true,
      updatedAt: new Date().toISOString(),
    },
    {
      id: spaId,
      domain: CATEGORY_DOMAIN.PLACE,
      code: "cate00002",
      name: "휴양",
      pictogram_meta: [],
      visible: true,
      updatedAt: new Date().toISOString(),
    },
  ];
  const facilities = [
    {
      id: uid(),
      code: "POOL_IN",
      name: "실내수영장",
      category_id: swimId,
      visible: true,
      updatedAt: new Date().toISOString(),
    },
    {
      id: uid(),
      code: "POOL_KIDS",
      name: "키즈수영장",
      category_id: swimId,
      visible: true,
      updatedAt: new Date().toISOString(),
    },
    {
      id: uid(),
      code: "SPA",
      name: "스파",
      category_id: spaId,
      visible: true,
      updatedAt: new Date().toISOString(),
    },
  ];
  saveFacilityCategories(categories);
  saveFacilities(facilities);
}

function loadFacilityCategories() {
  try {
    const raw = localStorage.getItem(STORAGE_FACILITY_CATEGORIES);
    if (raw) {
      let list = JSON.parse(raw);
      const migrated = migrateFacilityCategoriesDomain(list);
      if (migrated !== list) saveFacilityCategories(migrated);
      return migrated;
    }
  } catch (_) {}

  if (migrateFacilitiesFromV1()) {
    let list = JSON.parse(localStorage.getItem(STORAGE_FACILITY_CATEGORIES));
    list = migrateFacilityCategoriesDomain(list);
    saveFacilityCategories(list);
    return list;
  }

  seedFacilityCategoriesAndFacilities();
  let list = JSON.parse(localStorage.getItem(STORAGE_FACILITY_CATEGORIES));
  list = migrateFacilityCategoriesDomain(list);
  saveFacilityCategories(list);
  return list;
}

function categoriesForPlaceFacilities() {
  return loadFacilityCategories().filter((c) => normalizeCategoryDomain(c.domain) === CATEGORY_DOMAIN.PLACE);
}

function categoriesForRoomFacilities() {
  return loadFacilityCategories().filter((c) => normalizeCategoryDomain(c.domain) === CATEGORY_DOMAIN.ROOM);
}

function loadFacilities() {
  try {
    const raw = localStorage.getItem(STORAGE_FACILITIES);
    if (raw) return JSON.parse(raw);
  } catch (_) {}

  loadFacilityCategories();
  const again = localStorage.getItem(STORAGE_FACILITIES);
  return again ? JSON.parse(again) : [];
}

function ensureFacilityStores() {
  loadFacilityCategories();
  loadFacilities();
  ensureRoomFacilitySeed();
  ensurePlaceFacilitySeed();
}

/** 고속장·리조트 객실 시설 예시 — ROOM 카테고리가 하나도 없을 때만 1회 시드 */
function roomSeedPictoDataUrl(kind) {
  const svgs = {
    sleep:
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48"><path fill="#334155" d="M6 26h36v10H6z"/><path fill="#94a3b8" d="M4 30h40v4H4z"/><path fill="#cbd5e1" d="M8 20h32v10H8z"/><circle cx="14" cy="34" r="3" fill="#64748b"/></svg>',
    bath:
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48"><ellipse cx="24" cy="26" fill="none" stroke="#0284c7" stroke-width="2.5" rx="15" ry="9"/><path fill="#0284c7" d="M10 18h28v4H10z"/><path fill="#bae6fd" d="M18 14h4v6h-4z"/></svg>',
    media:
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48"><rect x="8" y="12" width="32" height="22" rx="2" fill="#1e293b"/><rect x="11" y="15" width="26" height="16" fill="#38bdf8"/><path fill="#64748b" d="M18 38h12v4H18z"/></svg>',
    fnb:
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48"><rect x="10" y="14" width="28" height="20" rx="2" fill="#fef3c7" stroke="#d97706" stroke-width="2"/><path fill="#f59e0b" d="M16 22h16v3H16z"/><circle cx="24" cy="30" r="3" fill="#d97706"/></svg>',
    amenity:
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48"><circle cx="24" cy="22" r="12" fill="none" stroke="#475569" stroke-width="2"/><path fill="#475569" d="M24 10v6M18 16l4 4 4-4"/><rect x="18" y="28" width="12" height="10" rx="2" fill="#94a3b8"/></svg>',
  };
  const svg = svgs[kind] || svgs.amenity;
  return "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg);
}

function pictoMetaFromSeed(kind) {
  const data_url = roomSeedPictoDataUrl(kind);
  return [
    {
      name: `seed-${kind}.svg`,
      size: data_url.length,
      type: "image/svg+xml",
      data_url,
    },
  ];
}

function ensureRoomFacilitySeed() {
  const FLAG = "high1_room_facility_seed_done_v1";
  if (localStorage.getItem(FLAG) === "1") return;

  const cats = loadFacilityCategories();
  if (cats.some((c) => normalizeCategoryDomain(c.domain) === CATEGORY_DOMAIN.ROOM)) {
    localStorage.setItem(FLAG, "1");
    return;
  }

  const now = new Date().toISOString();
  let acc = cats.slice();
  const newCats = [];
  const newFacs = [];

  const plan = [
    {
      name: "침실·수면",
      picto: "sleep",
      facilities: [
        ["BED_KING", "킹 베드"],
        ["BED_TWIN_PAIR", "트윈 베드(2식)"],
        ["LINEN_PREM", "프리미엄 침구"],
        ["BLACKOUT", "암막 커튼"],
      ],
    },
    {
      name: "욕실",
      picto: "bath",
      facilities: [
        ["BATH_TUB", "욕조"],
        ["SHOWER_RAIN", "레인 샤워부스"],
        ["BIDET", "비데"],
        ["AMENITY_SET", "어메니티 세트"],
      ],
    },
    {
      name: "미디어·IT",
      picto: "media",
      facilities: [
        ["TV_SMART", "스마트 TV"],
        ["WIFI_GIGA", "기가 와이파이"],
        ["BT_SPEAKER", "블루투스 스피커"],
        ["USB_MULTI", "USB 충전 포트"],
      ],
    },
    {
      name: "주방·미니바",
      picto: "fnb",
      facilities: [
        ["KETTLE", "전기포트"],
        ["FRIDGE", "냉장고"],
        ["COFFEE_DM", "커피머신(캡슐)"],
        ["MINIBAR", "미니바"],
      ],
    },
    {
      name: "편의·안전",
      picto: "amenity",
      facilities: [
        ["SAFE", "금고"],
        ["HAIR_DRY", "헤어드라이어"],
        ["IRON_ST", "다리미·다리미판"],
        ["AC_ZONE", "개별 냉난방"],
      ],
    },
  ];

  for (const block of plan) {
    const id = uid();
    const code = nextCategoryCode(acc, CATEGORY_DOMAIN.ROOM);
    const row = {
      id,
      domain: CATEGORY_DOMAIN.ROOM,
      code,
      name: block.name,
      pictogram_meta: pictoMetaFromSeed(block.picto),
      visible: true,
      updatedAt: now,
    };
    newCats.push(row);
    acc.push(row);
    for (const [fcode, fname] of block.facilities) {
      newFacs.push({
        id: uid(),
        code: fcode,
        name: fname,
        category_id: id,
        visible: true,
        updatedAt: now,
      });
    }
  }

  saveFacilityCategories([...cats, ...newCats]);
  saveFacilities([...loadFacilities(), ...newFacs]);
  localStorage.setItem(FLAG, "1");
}

/** 숙소 시설 예시 — PLACE 카테고리가 하나도 없을 때만 1회 시드 */
function ensurePlaceFacilitySeed() {
  const FLAG = "high1_place_facility_seed_done_v1";
  if (localStorage.getItem(FLAG) === "1") return;

  const cats = loadFacilityCategories();
  if (cats.some((c) => normalizeCategoryDomain(c.domain) === CATEGORY_DOMAIN.PLACE)) {
    localStorage.setItem(FLAG, "1");
    return;
  }

  const now = new Date().toISOString();
  let acc = cats.slice();
  const newCats = [];
  const newFacs = [];

  const plan = [
    {
      name: "편의시설",
      facilities: [
        ["PARKING",    "주차장"],
        ["CONCIERGE",  "컨시어지"],
        ["LUGGAGE",    "수하물 보관"],
        ["LAUNDRY",    "세탁 서비스"],
      ],
    },
    {
      name: "식음료",
      facilities: [
        ["RESTAURANT",    "레스토랑"],
        ["BAR_LOUNGE",    "바·라운지"],
        ["CAFE",          "카페"],
        ["ROOM_SERVICE",  "룸서비스"],
      ],
    },
    {
      name: "레저·스포츠",
      facilities: [
        ["POOL",     "수영장"],
        ["FITNESS",  "피트니스센터"],
        ["SPA",      "스파"],
        ["SKI",      "스키장 연계"],
      ],
    },
  ];

  for (const block of plan) {
    const id   = uid();
    const code = nextCategoryCode(acc, CATEGORY_DOMAIN.PLACE);
    const row  = {
      id,
      domain: CATEGORY_DOMAIN.PLACE,
      code,
      name: block.name,
      pictogram_meta: [],
      visible: true,
      updatedAt: now,
    };
    newCats.push(row);
    acc.push(row);
    for (const [fcode, fname] of block.facilities) {
      newFacs.push({
        id: uid(),
        code: fcode,
        name: fname,
        category_id: id,
        visible: true,
        updatedAt: now,
      });
    }
  }

  saveFacilityCategories([...cats, ...newCats]);
  saveFacilities([...loadFacilities(), ...newFacs]);
  localStorage.setItem(FLAG, "1");
}

function nextPlaceCode(list) {
  const nums = list
    .map((p) => p.place_code)
    .filter((c) => /^PL-\d+$/.test(c))
    .map((c) => parseInt(c.replace("PL-", ""), 10));
  const max = nums.length ? Math.max(...nums) : 0;
  return "PL-" + String(max + 1).padStart(4, "0");
}

function nextRoomTypeCode(list) {
  const nums = (Array.isArray(list) ? list : [])
    .map((x) => String(x.code || "").match(/^rt(\d{5})$/))
    .filter(Boolean)
    .map((m) => parseInt(m[1], 10));
  const max = nums.length ? Math.max(...nums) : 0;
  return "rt" + String(max + 1).padStart(5, "0");
}

function nextRoomTraitCode(list) {
  const nums = (Array.isArray(list) ? list : [])
    .map((x) => String(x.code || "").match(/^tr(\d{5})$/))
    .filter(Boolean)
    .map((m) => parseInt(m[1], 10));
  const max = nums.length ? Math.max(...nums) : 0;
  return "tr" + String(max + 1).padStart(5, "0");
}

function nextBedTypeCode(list) {
  const nums = (Array.isArray(list) ? list : [])
    .map((x) => String(x.code || "").match(/^bd(\d{5})$/))
    .filter(Boolean)
    .map((m) => parseInt(m[1], 10));
  const max = nums.length ? Math.max(...nums) : 0;
  return "bd" + String(max + 1).padStart(5, "0");
}

function loadRoomTypes() {
  try {
    const raw = localStorage.getItem(STORAGE_ROOM_TYPES);
    if (raw) return JSON.parse(raw);
  } catch (_) {}
  return [];
}

function saveRoomTypes(list) {
  localStorage.setItem(STORAGE_ROOM_TYPES, JSON.stringify(list));
}

function loadRoomTraits() {
  try {
    const raw = localStorage.getItem(STORAGE_ROOM_TRAITS);
    if (raw) return JSON.parse(raw);
  } catch (_) {}
  return [];
}

function saveRoomTraits(list) {
  localStorage.setItem(STORAGE_ROOM_TRAITS, JSON.stringify(list));
}

function loadBedTypes() {
  try {
    const raw = localStorage.getItem(STORAGE_BED_TYPES);
    if (raw) return JSON.parse(raw);
  } catch (_) {}
  return [];
}

function saveBedTypes(list) {
  localStorage.setItem(STORAGE_BED_TYPES, JSON.stringify(list));
}

function loadRooms() {
  try {
    const raw = localStorage.getItem(STORAGE_ROOMS);
    if (raw) return JSON.parse(raw);
  } catch (_) {}
  return [];
}

function saveRooms(list) {
  localStorage.setItem(STORAGE_ROOMS, JSON.stringify(list));
}

function loadProducts() {
  try {
    const raw = localStorage.getItem(STORAGE_PRODUCTS);
    if (raw) return JSON.parse(raw);
  } catch (_) {}
  return [];
}

function saveProducts(list) {
  localStorage.setItem(STORAGE_PRODUCTS, JSON.stringify(list));
}

/** 객실 id당 연결된 상품 건수 */
function productCountByRoomId(products) {
  const m = new Map();
  for (const p of Array.isArray(products) ? products : []) {
    const rid = p?.room_id;
    if (typeof rid !== "string" || !rid) continue;
    m.set(rid, (m.get(rid) || 0) + 1);
  }
  return m;
}

/** 숙소 id당 소속 객실에 연결된 상품 건수 합 */
function productCountByPlaceId(products, rooms) {
  const byRoom = productCountByRoomId(products);
  const m = new Map();
  for (const r of Array.isArray(rooms) ? rooms : []) {
    const pid = r?.place_id;
    if (typeof pid !== "string" || !pid) continue;
    const n = byRoom.get(r.id) || 0;
    m.set(pid, (m.get(pid) || 0) + n);
  }
  return m;
}

/** 상품 유형 — §5.10 */
const PRODUCT_TYPE = {
  ROOM_ONLY: "ROOM_ONLY",
  PACKAGE: "PACKAGE",
};

/** 상품 취소정책 — 상품 마스터 전용 */
const PRODUCT_CANCEL_POLICY = {
  FREE_N_DAYS: "FREE_N_DAYS",
  NON_REFUNDABLE: "NON_REFUNDABLE",
};

function nextProductCode(products) {
  const nums = (Array.isArray(products) ? products : [])
    .map((p) => String(p.product_code || "").match(/^PR-(\d+)$/))
    .filter(Boolean)
    .map((m) => parseInt(m[1], 10));
  const max = nums.length ? Math.max(...nums) : 0;
  return "PR-" + String(max + 1).padStart(4, "0");
}

/** YYYY-MM-DD 문자열 기준 포함 구간 일자 순회 */
function eachDateInclusive(fromStr, toStr, fn) {
  const from = String(fromStr || "").trim();
  const to = String(toStr || "").trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(from) || !/^\d{4}-\d{2}-\d{2}$/.test(to)) return;
  const a = new Date(from + "T12:00:00");
  const b = new Date(to + "T12:00:00");
  if (Number.isNaN(a.getTime()) || Number.isNaN(b.getTime()) || a > b) return;
  for (let d = new Date(a); d <= b; d.setDate(d.getDate() + 1)) {
    fn(d.toISOString().slice(0, 10));
  }
}

function defaultSaleEndDateFromStart(startYmd) {
  const d = /^\d{4}-\d{2}-\d{2}$/.test(startYmd)
    ? new Date(startYmd + "T12:00:00")
    : new Date();
  d.setFullYear(d.getFullYear() + 1);
  return d.toISOString().slice(0, 10);
}

function normalizeInventoryRow(raw) {
  const date = String(raw?.date || "").trim();
  const price = Math.max(0, parseInt(String(raw?.price ?? "").replace(/\D/g, ""), 10) || 0);
  const stock = Math.max(0, parseInt(String(raw?.stock ?? "").replace(/\D/g, ""), 10) || 0);
  const checkin_allowed =
    raw?.checkin_allowed === false || raw?.checkin_allowed === "N" || raw?.checkin_allowed === "n"
      ? false
      : true;
  const min_stay_nights = Math.max(1, parseInt(raw?.min_stay_nights, 10) || 1);
  const max_stay_nights = Math.min(365, Math.max(min_stay_nights, parseInt(raw?.max_stay_nights, 10) || 30));
  const cutoff_days_before_checkin = Math.max(
    0,
    parseInt(String(raw?.cutoff_days_before_checkin ?? "").replace(/\D/g, ""), 10) || 0
  );
  return {
    date,
    price,
    stock,
    checkin_allowed,
    min_stay_nights,
    max_stay_nights,
    cutoff_days_before_checkin,
  };
}

function invMapFromRows(inventory) {
  return new Map(
    (Array.isArray(inventory) ? inventory : []).map((r) => [String(r?.date || "").trim(), r])
  );
}

/** 일요일 시작 6주 그리드(42칸), ym = YYYY-MM */
function calendarMonthCellDates(ym) {
  const parts = String(ym || "")
    .split("-")
    .map((x) => parseInt(x, 10));
  const Y = parts[0];
  const M = parts[1];
  if (!Y || !M || M < 1 || M > 12) {
    const t = new Date();
    return calendarMonthCellDates(t.toISOString().slice(0, 7));
  }
  const first = new Date(Y, M - 1, 1);
  const startDow = first.getDay();
  const cur = new Date(first);
  cur.setDate(1 - startDow);
  const cells = [];
  for (let i = 0; i < 42; i++) {
    cells.push(cur.toISOString().slice(0, 10));
    cur.setDate(cur.getDate() + 1);
  }
  return cells;
}

function cancelPolicyLabel(p) {
  if (p?.cancel_policy_type === PRODUCT_CANCEL_POLICY.FREE_N_DAYS) {
    const n = Math.max(0, parseInt(p.cancel_free_days_before, 10) || 0);
    return `체크인 ${n}일 전 무료취소`;
  }
  return "취소 및 환불불가";
}

function nextRoomCode(rooms) {
  const nums = (Array.isArray(rooms) ? rooms : [])
    .map((r) => String(r.room_code || "").match(/^RM-(\d+)$/))
    .filter(Boolean)
    .map((m) => parseInt(m[1], 10));
  const max = nums.length ? Math.max(...nums) : 0;
  return "RM-" + String(max + 1).padStart(4, "0");
}

function ensureRoomMasters() {
  let types = loadRoomTypes();
  let traits = loadRoomTraits();
  let beds = loadBedTypes();
  if (types.length && traits.length && beds.length) {
    return;
  }
  const now = new Date().toISOString();
  if (types.length === 0) {
    const names = [
      "슈페리어",
      "스탠다드",
      "디럭스",
      "펫룸",
      "스위트",
      "패밀리",
      "펜트하우스",
      "클린룸",
    ];
    types = names.map((name, i) => ({
      id: uid(),
      code: "rt" + String(i + 1).padStart(5, "0"),
      name,
      visible: true,
      updatedAt: now,
    }));
    saveRoomTypes(types);
  }
  if (traits.length === 0) {
    const names = [
      "베스트슬립",
      "코너",
      "패밀리",
      "테라스",
      "주니어",
      "이그제큐티브",
      "럭셔리",
      "갤러리",
      "노블",
      "프리미어",
      "로얄",
      "그랜드",
    ];
    traits = names.map((name, i) => ({
      id: uid(),
      code: "tr" + String(i + 1).padStart(5, "0"),
      name,
      visible: true,
      updatedAt: now,
    }));
    saveRoomTraits(traits);
  }
  if (beds.length === 0) {
    const names = ["트윈", "더블", "트리플", "온돌", "스위트", "패밀리"];
    beds = names.map((name, i) => ({
      id: uid(),
      code: "bd" + String(i + 1).padStart(5, "0"),
      name,
      visible: true,
      updatedAt: now,
    }));
    saveBedTypes(beds);
  }
}

function buildAutoRoomName(state, masters) {
  const { roomTypes, traits, bedTypes } = masters;
  const tmap = new Map(roomTypes.map((x) => [x.id, x]));
  const rmap = new Map(traits.map((x) => [x.id, x]));
  const bmap = new Map(bedTypes.map((x) => [x.id, x]));
  const traitLabels = (state.room_trait_ids || [])
    .map((id) => rmap.get(id)?.name)
    .filter(Boolean);
  const rtLabel = tmap.get(state.room_type_id)?.name || "";
  const bedParts = (state.bed_rows || []).map((row) => {
    const n = bmap.get(row.bed_type_id)?.name || "";
    return n ? n + "베드" : "";
  }).filter(Boolean);
  const parts = [...traitLabels, rtLabel, ...bedParts].filter(Boolean);
  return parts.join(" ");
}

function formatDate(iso) {
  if (!iso) return "-";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "-";
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const h = String(d.getHours()).padStart(2, "0");
  const min = String(d.getMinutes()).padStart(2, "0");
  return `${y}-${m}-${day} ${h}:${min}`;
}

function subLabel(category, subValue) {
  const list = category === "CONDO" ? CONDO_SUBS : HOTEL_SUBS;
  const f = list.find((x) => x.value === subValue);
  return f ? f.label : subValue || "-";
}

function visibilityLabel(v) {
  return v === "HIDE" ? "비노출" : "노출";
}

// --- Router ---

const routes = {
  places: renderPlaceList,
  "places/new": renderPlaceWizard,
  "places/edit": renderPlaceWizard,
  categories: renderCategoryDomainHome,
};

function parseHash() {
  const h = (location.hash || "#/places").replace(/^#\//, "");
  const parts = h.split("/");
  return { path: h, parts };
}

function navigate(path) {
  location.hash = "#/" + path;
}

function navRouteMatch(target, path) {
  if (!target) return false;
  return path === target || path.startsWith(target + "/");
}

function setActiveNav() {
  const { path } = parseHash();
  document.querySelectorAll(".nav-link").forEach((el) => {
    const target = el.getAttribute("data-route");
    if (!target) return;
    const on =
      navRouteMatch(target, path) ||
      (target === "places" && path.startsWith("places")) ||
      (target === "rooms" && path.startsWith("rooms")) ||
      (target === "products" && path.startsWith("products")) ||
      (target === "room-masters" && path.startsWith("room-masters"));
    el.classList.toggle("active", on);
  });
}

function boot() {
  window.addEventListener("hashchange", () => {
    routeWrap();
  });
  document.querySelectorAll(".nav-link[data-route]").forEach((el) => {
    el.addEventListener("click", () => {
      navigate(el.getAttribute("data-route"));
    });
  });
  routeWrap();
}

function route() {
  const { path, parts } = parseHash();
  const main = document.getElementById("main");
  if (!main) return;

  if (parts[0] === "room-masters") {
    const tab = parts[1] === "traits" ? "traits" : parts[1] === "beds" ? "beds" : "types";
    renderRoomMastersPage(main, tab);
    return;
  }

  if (parts[0] === "products") {
    if (parts.length === 2 && parts[1] === "new") {
      renderProductForm(main, null, null);
      return;
    }
    if (parts.length === 4 && parts[1] === "new" && parts[2] === "room" && parts[3]) {
      renderProductForm(main, null, parts[3]);
      return;
    }
    if (parts.length === 3 && parts[1] === "edit" && parts[2]) {
      renderProductForm(main, parts[2], null);
      return;
    }
    if (parts.length >= 3 && parts[1] === "place" && parts[2]) {
      renderProductList(main, parts[2]);
      return;
    }
    renderProductList(main, null);
    return;
  }

  if (parts[0] === "rooms") {
    if (parts.length >= 3 && parts[1] === "place" && parts[2]) {
      renderRoomList(main, parts[2]);
      return;
    }
    if (parts.length === 2 && parts[1] === "new") {
      renderRoomForm(main, null, null);
      return;
    }
    if (parts.length === 4 && parts[1] === "new" && parts[2] === "place" && parts[3]) {
      renderRoomForm(main, null, parts[3]);
      return;
    }
    if (parts.length === 3 && parts[1] === "edit" && parts[2]) {
      renderRoomForm(main, parts[2], null);
      return;
    }
    renderRoomList(main, null);
    return;
  }

  if (parts[0] === "facilities") {
    if (parts.length === 1) {
      navigate("facilities/place");
      return;
    }
    if (parts[1] === "new") {
      navigate("facilities/place/new");
      return;
    }
    if (parts[1] === "edit" && parts[2]) {
      const facList = loadFacilities();
      const f = facList.find((x) => x.id === parts[2]);
      const catList = loadFacilityCategories();
      const cat = catList.find((c) => c.id === f?.category_id);
      const d = cat ? normalizeCategoryDomain(cat.domain) : CATEGORY_DOMAIN.PLACE;
      const legacySeg = d === CATEGORY_DOMAIN.ROOM ? "room" : "place";
      navigate(`facilities/${legacySeg}/edit/${parts[2]}`);
      return;
    }
    if (parts[1] === "place" || parts[1] === "room") {
      const domain = parts[1] === "room" ? CATEGORY_DOMAIN.ROOM : CATEGORY_DOMAIN.PLACE;
      if (parts.length === 2) {
        renderFacilityList(main, domain);
        return;
      }
      if (parts.length === 3 && parts[2] === "new") {
        renderFacilityForm(main);
        return;
      }
      if (parts.length === 4 && parts[2] === "edit" && parts[3]) {
        renderFacilityForm(main);
        return;
      }
    }
    navigate("facilities/place");
    return;
  }

  if (path.startsWith("facility-categories")) {
    const tail = path.slice("facility-categories".length).replace(/^\//, "");
    navigate(tail ? `categories/place/${tail}` : "categories/place");
    return;
  }

  if (parts[0] === "categories") {
    if (parts.length === 1) {
      renderCategoryDomainHome(main);
      return;
    }
    const domSeg = parts[1];
    const domain = domSeg === "room" ? CATEGORY_DOMAIN.ROOM : CATEGORY_DOMAIN.PLACE;
    if (domSeg !== "place" && domSeg !== "room") {
      navigate("categories");
      return;
    }
    if (parts.length === 2) {
      renderFacilityCategoryList(main, domain);
      return;
    }
    if (parts.length === 3 && parts[2] === "new") {
      renderFacilityCategoryForm(main, domain, null);
      return;
    }
    if (parts.length === 4 && parts[2] === "edit" && parts[3]) {
      renderFacilityCategoryForm(main, domain, parts[3]);
      return;
    }
    navigate("categories");
    return;
  }

  if (path.startsWith("places/edit/") && parts[2]) {
    renderPlaceWizard(main, parts[2]);
    return;
  }

  const key = path.split("?")[0];
  if (key === "places/new") {
    renderPlaceWizard(main, undefined);
    return;
  }

  const fn = routes[key] || routes.places;
  fn(main);
}

function routeWrap() {
  setActiveNav();
  route();
}

// --- Place list ---

function renderPlaceList(main) {
  const places = loadPlaces();
  const rooms = loadRooms();
  const products = loadProducts();
  const placeProductCount = productCountByPlaceId(products, rooms);
  const rows = places
    .slice()
    .sort((a, b) => (b.updated_at || "").localeCompare(a.updated_at || ""))
    .map(
      (p) => `
    <tr data-id="${p.id}">
      <td>${escapeHtml(p.place_code)}</td>
      <td>${escapeHtml(p.place_name)}</td>
      <td>${p.category === "CONDO" ? "Condo" : "Hotel"}</td>
      <td>${escapeHtml(subLabel(p.category, p.sub_place))}</td>
      <td><span class="badge ${p.visibility === "HIDE" ? "off" : "on"}">${visibilityLabel(p.visibility)}</span></td>
      <td>${escapeHtml(p.check_in_time || "-")}</td>
      <td>${escapeHtml(p.check_out_time || "-")}</td>
      <td><a class="btn btn-ghost" href="#/rooms/place/${p.id}">객실 ${rooms.filter((r) => r.place_id === p.id).length}</a></td>
      <td><a class="btn btn-ghost" href="#/products/place/${p.id}">${placeProductCount.get(p.id) || 0}개</a></td>
      <td>${formatDate(p.updated_at)}</td>
      <td>${escapeHtml(p.updated_by || "-")}</td>
      <td><button type="button" class="btn btn-ghost js-edit" data-id="${p.id}">수정</button></td>
    </tr>`
    )
    .join("");

  main.innerHTML = `
    <h2 class="page-title">숙소관리</h2>
    <p class="page-desc">숙소(Place) 데이터를 등록·수정합니다. (프로토타입: 브라우저 localStorage 저장) · v0.2 · 상품연결은 소속 객실에 매핑된 <code>${escapeHtml(STORAGE_PRODUCTS)}</code> 건수 합계입니다.</p>
    <div class="card">
      <div class="toolbar">
        <a href="#/places/new" class="btn btn-primary">숙소 등록</a>
        <a href="#/rooms/new" class="btn">객실 등록</a>
        <span style="color:var(--muted);font-size:13px;">저장소: <code>${STORAGE_PLACES}</code></span>
      </div>
      ${
        places.length === 0
          ? `<div class="empty"><strong>등록된 숙소가 없습니다.</strong>「숙소 등록」으로 첫 데이터를 만들어 보세요.</div>`
          : `<table>
        <thead><tr>
          <th>숙소코드</th><th>숙소명</th><th>1차 분류</th><th>2차</th><th>운영</th>
          <th>체크인</th><th>체크아웃</th><th>객실</th><th>상품연결</th>
          <th>수정일시</th><th>수정자</th><th></th>
        </tr></thead>
        <tbody>${rows}</tbody>
      </table>`
      }
    </div>
  `;

  main.querySelectorAll(".js-edit").forEach((btn) => {
    btn.addEventListener("click", () => navigate("places/edit/" + btn.getAttribute("data-id")));
  });
}

// --- Place wizard ---

const WIZARD_STEPS = [
  { id: 1, title: "분류·기본·운영" },
  { id: 2, title: "위치" },
  { id: 3, title: "이미지" },
  { id: 4, title: "안내·정책" },
  { id: 5, title: "숙소시설" },
];

function renderPlaceWizard(main, editId) {
  const places = loadPlaces();
  const existing = editId ? places.find((p) => p.id === editId) : null;
  const isEdit = !!existing;

  const state = {
    step: 1,
    id: existing?.id || uid(),
    place_code: existing?.place_code || "",
    place_name: existing?.place_name || "",
    place_name_en: existing?.place_name_en || "",
    category: existing?.category || "HOTEL",
    sub_place: existing?.sub_place || HOTEL_SUBS[0].value,
    visibility: existing?.visibility || "SHOW",
    check_in_time: existing?.check_in_time || "15:00",
    check_out_time: existing?.check_out_time || "11:00",
    address: existing?.address || "",
    address_en: existing?.address_en || "",
    location_detail: existing?.location_detail || "",
    location_detail_en: existing?.location_detail_en || "",
    image_meta: existing?.image_meta || [],
    image_storage_warning: "",
    guide_html: existing?.guide_html || "",
    guide_html_en: existing?.guide_html_en || "",
    policy_html: existing?.policy_html || "",
    policy_html_en: existing?.policy_html_en || "",
    facility_ids: existing?.facility_ids || [],
    featured_facility_ids: normalizeFeaturedFacilityIds(
      existing?.featured_facility_ids,
      existing?.facility_ids || []
    ),
    category_facility_text: existing?.category_facility_text || "",
    category_facility_text_en: existing?.category_facility_text_en || "",
    pickerCategoryId: "",
  };

  if (!state.place_code && !isEdit) {
    state.place_code = nextPlaceCode(places);
  }

  function subOptionsHtml() {
    const list = state.category === "CONDO" ? CONDO_SUBS : HOTEL_SUBS;
    return list
      .map(
        (o) =>
          `<option value="${o.value}" ${state.sub_place === o.value ? "selected" : ""}>${o.label}</option>`
      )
      .join("");
  }

  function facilityChipsHtml() {
    const cats = categoriesForPlaceFacilities();
    const facs = loadFacilities();
    const parts = state.facility_ids
      .map((id) => {
        const f = facs.find((x) => x.id === id);
        if (!f) return "";
        const c = cats.find((x) => x.id === f.category_id);
        const cname = c ? c.name : "?";
        const feat = state.featured_facility_ids.includes(id);
        const badge = feat
          ? `<span class="facility-chip-badge" aria-hidden="true">대표</span>`
          : "";
        return `<span class="facility-chip${feat ? " facility-chip--featured" : ""}">${badge}<span class="facility-chip-text">${escapeHtml(cname)} : ${escapeHtml(f.name)}</span>
      <button type="button" class="facility-chip-x js-chip-remove" data-fac-id="${escapeAttr(id)}" aria-label="삭제">×</button></span>`;
      })
      .filter(Boolean);
    return parts.length
      ? `<div class="facility-chips">${parts.join("")}</div>`
      : `<p style="color:var(--muted);font-size:14px;margin:0 0 16px;">선택된 시설이 없습니다. 카테고리·시설을 고른 뒤 다른 카테고리로 넘어가거나 저장하면 자동 반영됩니다.</p>`;
  }

  function applyFacilityPickerFromDom() {
    const catId = state.pickerCategoryId;
    if (!catId) return { ok: true };
    const inCat = loadFacilities()
      .filter((f) => f.category_id === catId)
      .map((f) => f.id);
    const listEl = document.getElementById("fac_right_list");
    if (!listEl) return { ok: true };

    const applyIds = [];
    const featIds = [];
    listEl.querySelectorAll(".fac-picker-row").forEach((row) => {
      const id = row.getAttribute("data-fac-id");
      if (!id || !inCat.includes(id)) return;
      const applyCb = row.querySelector(".js-fac-apply");
      const featCb = row.querySelector(".js-fac-featured");
      if (applyCb?.checked) applyIds.push(id);
      if (applyCb?.checked && featCb?.checked && !featCb.disabled) featIds.push(id);
    });

    const rest = state.facility_ids.filter((id) => !inCat.includes(id));
    const nextFac = [...new Set([...rest, ...applyIds])];

    const restFeat = state.featured_facility_ids.filter((id) => !inCat.includes(id));
    const mergedFeat = [...new Set([...restFeat, ...featIds])].filter((id) => nextFac.includes(id));

    if (mergedFeat.length > 10) {
      return {
        ok: false,
        msg: `대표 노출은 최대 10개까지입니다. (이 적용 결과 ${mergedFeat.length}개입니다. 다른 카테고리·행에서 대표를 해제한 뒤 다시 적용하세요.)`,
      };
    }

    state.facility_ids = nextFac;
    state.featured_facility_ids = mergedFeat;
    return { ok: true };
  }

  function renderStep() {
    const pills = WIZARD_STEPS.map((s) => {
      const cls = "step-pill" + (s.id === state.step ? " active" : "");
      return `<button type="button" class="${cls} js-step-pill" data-step="${s.id}">${s.id}. ${s.title}</button>`;
    }).join("");

    let body = "";
    if (state.step === 1) {
      body = `
        <div class="form-grid">
          <label class="field"><span>1차 분류</span>
            <select id="f_category">
              <option value="HOTEL" ${state.category === "HOTEL" ? "selected" : ""}>Hotel</option>
              <option value="CONDO" ${state.category === "CONDO" ? "selected" : ""}>Condo</option>
            </select>
          </label>
          <label class="field"><span>2차(건물·단지)</span>
            <select id="f_sub">${subOptionsHtml()}</select>
          </label>
          <label class="field"><span>숙소명</span>
            <input type="text" id="f_name" value="${escapeAttr(state.place_name)}" placeholder="예: 그랜드 호텔 메인타워" />
          </label>
          <label class="field"><span>숙소명(영문, 선택)</span>
            <input type="text" id="f_name_en" value="${escapeAttr(state.place_name_en)}" placeholder="e.g. Grand Hotel Main Tower" />
          </label>
          <label class="field"><span>운영</span>
            <select id="f_vis">
              <option value="SHOW" ${state.visibility === "SHOW" ? "selected" : ""}>노출</option>
              <option value="HIDE" ${state.visibility === "HIDE" ? "selected" : ""}>비노출</option>
            </select>
          </label>
          <label class="field"><span>체크인(기본)</span>
            <input type="time" id="f_ci" value="${escapeAttr(state.check_in_time)}" />
          </label>
          <label class="field"><span>체크아웃(기본)</span>
            <input type="time" id="f_co" value="${escapeAttr(state.check_out_time)}" />
          </label>
          <label class="field"><span>숙소코드</span>
            <input type="text" id="f_code" value="${escapeAttr(state.place_code)}" ${isEdit ? "readonly" : ""} />
          </label>
        </div>
        <p style="font-size:13px;color:var(--muted);">숙소코드는 신규 시 자동 채번됩니다. 필요 시 수정 가능합니다.</p>
      `;
    } else if (state.step === 2) {
      body = `
        <label class="field"><span>주소</span>
          <textarea id="f_addr" rows="3" placeholder="전체 주소">${escapeHtml(state.address)}</textarea>
        </label>
        <label class="field"><span>주소(영문, 선택)</span>
          <textarea id="f_addr_en" rows="3" placeholder="Address in English">${escapeHtml(state.address_en)}</textarea>
        </label>
        <label class="field"><span>위치 상세 (HTML 또는 텍스트)</span>
          <textarea id="f_loc_detail" class="js-image-paste" rows="6" placeholder="<p>...</p> 또는 안내 문구">${escapeForTextarea(state.location_detail)}</textarea>
        </label>
        <label class="field"><span>위치 상세 영문 (선택)</span>
          <textarea id="f_loc_detail_en" class="js-image-paste" rows="6" placeholder="<p>...</p> or detail text">${escapeForTextarea(state.location_detail_en)}</textarea>
        </label>
        <p style="font-size:12px;color:var(--muted);margin:-8px 0 12px;">클립보드 이미지 붙여넣기 가능 · 길게 저장 시 용량이 커지므로 2MB 이하 권장(프로토타입은 Data URL로 삽입)</p>
      `;
    } else if (state.step === 3) {
      const metaLines = (state.image_meta || [])
        .map(
          (m, idx) => `<li class="image-meta-item">
          <span class="image-meta-text">${idx === 0 ? "대표" : "추가"} · ${escapeHtml(m.name)} (${m.size} bytes)</span>
          <button type="button" class="image-meta-delete js-place-image-remove" data-image-idx="${idx}" aria-label="이미지 삭제">×</button>
        </li>`
        )
        .join("");
      body = `
        <p style="font-size:14px;color:var(--muted);">프로토타입: 파일 메타와 프런트 확인용 Data URL을 함께 저장합니다. 실서비스는 업로드 URL 저장 권장.</p>
        <label class="field"><span>대표 이미지 (필수) — 1장</span>
          <input type="file" id="f_img_hero" accept="image/*" />
        </label>
        <label class="field"><span>추가 이미지 — 최대 9장</span>
          <input type="file" id="f_img_more" accept="image/*" multiple />
        </label>
        <p style="font-size:12px;color:var(--muted);margin:0 0 8px;">이미지당 ${PLACE_IMAGE_MAX_MB}MB 이하만 허용합니다. 큰 이미지는 저장 실패할 수 있습니다.</p>
        <div style="font-size:13px;">
          <p style="margin:0 0 6px;">선택된 파일</p>
          ${
            state.image_meta?.length
              ? `<ul class="image-meta-list">${metaLines}</ul>`
              : `<p style="margin:0;color:var(--muted);">없음</p>`
          }
        </div>
        ${
          state.image_storage_warning
            ? `<p class="field-warn">${escapeHtml(state.image_storage_warning)}</p>`
            : ""
        }
      `;
    } else if (state.step === 4) {
      body = `
        <div class="dual">
          <label class="field"><span>숙소 안내</span>
            <textarea id="f_guide" class="js-image-paste" rows="10" placeholder="HTML 또는 텍스트">${escapeForTextarea(state.guide_html)}</textarea>
          </label>
          <label class="field"><span>숙소 안내(영문, 선택)</span>
            <textarea id="f_guide_en" class="js-image-paste" rows="10" placeholder="HTML or plain text">${escapeForTextarea(state.guide_html_en)}</textarea>
          </label>
          <label class="field"><span>정책 안내</span>
            <textarea id="f_policy" class="js-image-paste" rows="10" placeholder="HTML 또는 텍스트">${escapeForTextarea(state.policy_html)}</textarea>
          </label>
          <label class="field"><span>정책 안내(영문, 선택)</span>
            <textarea id="f_policy_en" class="js-image-paste" rows="10" placeholder="HTML or plain text">${escapeForTextarea(state.policy_html_en)}</textarea>
          </label>
        </div>
        <p style="font-size:12px;color:var(--muted);margin:0 0 14px;">위 두 입력칸에 스크린샷 등 이미지를 복사한 뒤 <kbd>Ctrl</kbd>+<kbd>V</kbd>(Mac: <kbd>⌘</kbd>+<kbd>V</kbd>)로 붙여넣으면 이미지가 본문에 삽입됩니다.</p>
      `;
    } else {
      const cats = categoriesForPlaceFacilities()
        .filter((c) => c.visible !== false)
        .slice()
        .sort((a, b) => a.code.localeCompare(b.code));
      if (!state.pickerCategoryId && cats[0]) state.pickerCategoryId = cats[0].id;

      const catButtons = cats
        .map(
          (c) =>
            `<button type="button" class="facility-cat-btn js-pick-cat ${state.pickerCategoryId === c.id ? "active" : ""}" data-cat-id="${c.id}">${escapeHtml(c.name)} <small style="opacity:.85">${escapeHtml(c.code)}</small></button>`
        )
        .join("");

      const facs = loadFacilities().filter((f) => f.visible !== false);
      const nFeatured = state.featured_facility_ids.length;
      const maxFeatured = nFeatured >= 10;
      const catFacs = facs
        .filter((f) => f.category_id === state.pickerCategoryId)
        .slice()
        .sort((a, b) => a.name.localeCompare(b.name, "ko"));
      const hasPickerRows = catFacs.length > 0;
      const rightItems = catFacs
        .map((f) => {
          const applied = state.facility_ids.includes(f.id);
          const feat = state.featured_facility_ids.includes(f.id);
          const featDisabled = !applied || (maxFeatured && !feat);
          return `<div class="fac-picker-row" data-fac-id="${escapeAttr(f.id)}">
            <label class="fac-picker-apply">
              <input type="checkbox" class="js-fac-apply" value="${escapeAttr(f.id)}" ${applied ? "checked" : ""} />
              <span>${escapeHtml(f.name)} <small style="color:var(--muted)">(${escapeHtml(f.code)})</small></span>
            </label>
            <label class="fac-picker-feat"${featDisabled ? ' title="숙소에 적용된 시설만 대표 지정 가능 · 최대 10개"' : ""}>
              <input type="checkbox" class="js-fac-featured" value="${escapeAttr(f.id)}" ${feat ? "checked" : ""} ${
            featDisabled ? "disabled" : ""
          } />
              <span class="fac-picker-feat-label">대표</span>
            </label>
          </div>`;
        })
        .join("");

      body = `
        <div class="facility-step-banner" aria-live="polite">
          <span class="facility-step-banner-stat">대표 노출 <strong>${nFeatured}</strong> / 10</span>
          <span class="facility-step-banner-hint">시설 행 오른쪽 「대표」는 적용(체크)된 시설만 선택 · 카테고리를 바꾸거나 다른 단계로 이동·저장 시 현재 카테고리 선택이 자동 반영됩니다.</span>
        </div>
        <p style="font-size:13px;color:var(--muted);margin:0 0 14px;">카테고리·시설을 고르면 다른 카테고리로 이동·단계 이동·저장 시 자동으로 아래 「적용된 시설」에 반영됩니다. (「적용」은 수동으로 다시 그리기용)</p>
        <div class="facility-picker">
          <div class="facility-picker-col">
            <h4>카테고리</h4>
            <div class="facility-cat-list">
              ${catButtons || "<p style='color:var(--muted);font-size:14px;'>등록된 카테고리가 없습니다.</p>"}
            </div>
          </div>
          <div class="facility-picker-col">
            <h4>시설 선택 <small style="font-weight:400;color:var(--muted)">(적용 · 대표 열 — 저장 시 전체 반영)</small></h4>
            ${
              hasPickerRows
                ? `<div class="fac-picker-head" aria-hidden="true">
              <span>숙소에 적용</span>
              <span>대표 노출</span>
            </div>`
                : ""
            }
            <div id="fac_right_list">
              ${
                rightItems ||
                `<p style="color:var(--muted);margin:0;font-size:14px;">이 카테고리에 등록된 시설이 없거나, 카테고리를 선택하세요.</p>`
              }
            </div>
            <button type="button" class="btn btn-primary" id="btn_fac_apply">적용</button>
          </div>
        </div>
        <hr style="border:0;border-top:1px solid var(--border);margin:16px 0;" />
        <h3 style="margin:0 0 10px;font-size:15px;">적용된 시설</h3>
        ${facilityChipsHtml()}
        <p style="font-size:13px;color:var(--muted);margin:0 0 16px;">대표로 지정된 시설은 칩에 「대표」라벨과 색으로 표시됩니다. 칩 × 로 빼면 대표 지정도 함께 해제됩니다.</p>
        <hr style="border:0;border-top:1px solid var(--border);margin:20px 0;" />
        <label class="field">
          <span>시설 특이사항</span>
          <span class="field-hint">체크박스로 고른 시설 목록과 별개로, 영업시간·유료 여부 등을 문장으로 적을 때 사용합니다. 마스터 시설과 겹치면 비워 두어도 됩니다.</span>
          <textarea id="f_cat_fac" rows="5" placeholder="예: 수영장 주중 09:00~21:00 / 주말 연장">${escapeForTextarea(state.category_facility_text)}</textarea>
        </label>
        <label class="field">
          <span>시설 특이사항(영문, 선택)</span>
          <textarea id="f_cat_fac_en" rows="5" placeholder="e.g. Pool 09:00~21:00 on weekdays">${escapeForTextarea(state.category_facility_text_en)}</textarea>
        </label>
      `;
    }

    main.innerHTML = `
      <h2 class="page-title">${isEdit ? "숙소 수정" : "숙소 등록"}</h2>
      <p class="page-desc">5단계 폼 · 탭으로 이동 · 임시저장 없음 — 어느 단계에서든 등록·저장 가능 · ${escapeHtml(state.place_code)}</p>
      <div class="wizard-steps">${pills}</div>
      <div class="card" id="wiz_card">${body}</div>
      <div class="wizard-actions wizard-actions--sticky">
        <a href="#/places" class="btn">목록</a>
        <div class="wizard-actions-trailing">
          <a href="#/places" class="btn">취소</a>
          <button type="button" class="btn btn-primary" id="btn_save_place">${isEdit ? "저장" : "등록"}</button>
        </div>
      </div>
      <p id="wiz_err" class="error" style="min-height:20px;"></p>
    `;

    const errEl = () => document.getElementById("wiz_err");

    document.querySelectorAll(".js-step-pill").forEach((btn) => {
      btn.addEventListener("click", () => {
        if (state.step === 5) {
          syncStepFields();
          const r = applyFacilityPickerFromDom();
          if (r && r.ok === false) {
            errEl().textContent = r.msg;
            return;
          }
        }
        syncStepFields();
        state.step = parseInt(btn.getAttribute("data-step"), 10);
        errEl().textContent = "";
        renderStep();
      });
    });

    if (state.step === 1) {
      document.getElementById("f_category").addEventListener("change", (e) => {
        state.category = e.target.value;
        const list = state.category === "CONDO" ? CONDO_SUBS : HOTEL_SUBS;
        state.sub_place = list[0].value;
        document.getElementById("f_sub").innerHTML = subOptionsHtml();
      });
      document.getElementById("f_sub").addEventListener("change", (e) => {
        state.sub_place = e.target.value;
      });
    }
    if (state.step === 3) {
      main.querySelectorAll(".js-place-image-remove").forEach((btn) => {
        btn.addEventListener("click", () => {
          const idx = parseInt(btn.getAttribute("data-image-idx"), 10);
          if (Number.isNaN(idx)) return;
          state.image_meta = state.image_meta.filter((_, i) => i !== idx);
          state.image_storage_warning = "";
          errEl().textContent = "";
          renderStep();
        });
      });
      document.getElementById("f_img_hero").addEventListener("change", async (e) => {
        const f = e.target.files?.[0];
        if (!f) {
          state.image_meta = [];
          state.image_storage_warning = "";
          renderStep();
          return;
        }
        try {
          const hero = await buildImageMetaWithDataUrl(f);
          state.image_meta = hero ? [hero] : [];
          state.image_storage_warning = "";
          errEl().textContent = "";
        } catch (err) {
          errEl().textContent = err?.message || "대표 이미지 처리 중 오류가 발생했습니다.";
        }
        renderStep();
      });
      document.getElementById("f_img_more").addEventListener("change", async (e) => {
        const hero = state.image_meta?.[0];
        const files = Array.from(e.target.files || []).slice(0, 9);
        try {
          const rest = [];
          for (const f of files) {
            rest.push(await buildImageMetaWithDataUrl(f));
          }
          state.image_meta = hero ? [hero, ...rest] : rest;
          state.image_storage_warning = "";
          errEl().textContent = "";
        } catch (err) {
          errEl().textContent = err?.message || "추가 이미지 처리 중 오류가 발생했습니다.";
        }
        renderStep();
      });
    }
    if (state.step === 5) {
      main.querySelectorAll(".js-pick-cat").forEach((btn) => {
        btn.addEventListener("click", () => {
          syncStepFields();
          const r = applyFacilityPickerFromDom();
          if (r && r.ok === false) {
            errEl().textContent = r.msg;
            return;
          }
          errEl().textContent = "";
          state.pickerCategoryId = btn.getAttribute("data-cat-id");
          renderStep();
        });
      });
      const applyBtn = document.getElementById("btn_fac_apply");
      if (applyBtn) {
        applyBtn.addEventListener("click", () => {
          syncStepFields();
          const r = applyFacilityPickerFromDom();
          if (r && r.ok === false) {
            errEl().textContent = r.msg;
            return;
          }
          errEl().textContent = "";
          renderStep();
        });
      }
      main.querySelectorAll(".js-chip-remove").forEach((btn) => {
        btn.addEventListener("click", () => {
          syncStepFields();
          const fid = btn.getAttribute("data-fac-id");
          state.facility_ids = state.facility_ids.filter((x) => x !== fid);
          state.featured_facility_ids = state.featured_facility_ids.filter((x) => x !== fid);
          renderStep();
        });
      });
      function mergePlaceFacilitiesFromPickerOrBail() {
        const r = applyFacilityPickerFromDom();
        if (r && r.ok === false) {
          errEl().textContent = r.msg;
          renderStep();
          return false;
        }
        errEl().textContent = "";
        renderStep();
        return true;
      }

      main.querySelectorAll(".js-fac-apply").forEach((cb) => {
        cb.addEventListener("change", () => {
          const row = cb.closest(".fac-picker-row");
          const feat = row?.querySelector(".js-fac-featured");
          if (!feat) return;
          if (!cb.checked) {
            feat.checked = false;
            feat.disabled = true;
          } else {
            const n = state.featured_facility_ids.length;
            const id = cb.value;
            feat.disabled = n >= 10 && !state.featured_facility_ids.includes(id);
          }
          mergePlaceFacilitiesFromPickerOrBail();
        });
      });
      main.querySelectorAll(".js-fac-featured").forEach((cb) => {
        cb.addEventListener("change", () => {
          mergePlaceFacilitiesFromPickerOrBail();
        });
      });
    }

    main.querySelectorAll("textarea.js-image-paste").forEach((ta) => attachClipboardImagePaste(ta));

    document.getElementById("btn_save_place").addEventListener("click", () => {
      if (state.step === 5) {
        const r = applyFacilityPickerFromDom();
        if (r && r.ok === false) {
          errEl().textContent = r.msg;
          return;
        }
      }
      syncStepFields();
      const err = validateAllSteps(state);
      if (err) {
        errEl().textContent = err;
        return;
      }
      try {
        state.image_storage_warning = "";
        errEl().textContent = "";
        persistPlace(isEdit);
        navigate("places");
      } catch (saveErr) {
        const msg = saveErr?.message || "저장 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.";
        if (isStorageQuotaExceeded(saveErr) || /저장공간|용량/i.test(msg)) {
          state.image_storage_warning =
            "저장 용량 부족으로 등록에 실패했습니다. 이미지 영역(대표/추가)에서 파일을 줄이거나 삭제한 뒤 다시 저장해 주세요.";
          state.step = 3;
          renderStep();
          document.getElementById("wiz_err").textContent =
            "이미지 영역에서 용량을 줄인 뒤 다시 저장해 주세요.";
          return;
        }
        errEl().textContent = msg;
      }
    });
  }

  function syncStepFields() {
    const step = state.step;
    if (step === 1) {
      state.category = document.getElementById("f_category").value;
      state.sub_place = document.getElementById("f_sub").value;
      state.place_name = document.getElementById("f_name").value.trim();
      state.place_name_en = document.getElementById("f_name_en")?.value.trim() || "";
      state.visibility = document.getElementById("f_vis").value;
      state.check_in_time = document.getElementById("f_ci").value;
      state.check_out_time = document.getElementById("f_co").value;
      state.place_code = document.getElementById("f_code").value.trim();
    } else if (step === 2) {
      state.address = document.getElementById("f_addr").value.trim();
      state.address_en = document.getElementById("f_addr_en")?.value.trim() || "";
      state.location_detail = document.getElementById("f_loc_detail").value;
      state.location_detail_en = document.getElementById("f_loc_detail_en")?.value || "";
    } else if (step === 4) {
      const g = document.getElementById("f_guide");
      const p = document.getElementById("f_policy");
      if (g) state.guide_html = g.value;
      if (p) state.policy_html = p.value;
      const ge = document.getElementById("f_guide_en");
      const pe = document.getElementById("f_policy_en");
      if (ge) state.guide_html_en = ge.value;
      if (pe) state.policy_html_en = pe.value;
    } else if (step === 5) {
      const cf = document.getElementById("f_cat_fac");
      const cfe = document.getElementById("f_cat_fac_en");
      if (cf) state.category_facility_text = cf.value;
      if (cfe) state.category_facility_text_en = cfe.value;
    }
  }

  function validateAllSteps(st) {
    if (!st.place_name.trim()) return "[1단계] 숙소명을 입력하세요.";
    if (!st.check_in_time || !st.check_out_time) return "[1단계] 체크인/체크아웃 시각을 입력하세요.";
    if (!st.place_code.trim()) return "[1단계] 숙소코드를 입력하세요.";
    if (!st.address.trim()) return "[2단계] 주소를 입력하세요.";
    if (!st.image_meta?.length) return "[3단계] 대표 이미지를 선택하세요.";
    return "";
  }

  function persistPlace(isEditMode) {
    const list = loadPlaces();
    const now = new Date().toISOString();
    const record = {
      id: state.id,
      place_code: state.place_code,
      place_name: state.place_name,
      place_name_en: state.place_name_en,
      category: state.category,
      sub_place: state.sub_place,
      visibility: state.visibility,
      check_in_time: state.check_in_time,
      check_out_time: state.check_out_time,
      address: state.address,
      address_en: state.address_en,
      location_detail: state.location_detail,
      location_detail_en: state.location_detail_en,
      image_meta: state.image_meta,
      guide_html: state.guide_html,
      guide_html_en: state.guide_html_en,
      policy_html: state.policy_html,
      policy_html_en: state.policy_html_en,
      facility_ids: state.facility_ids,
      featured_facility_ids: normalizeFeaturedFacilityIds(
        state.featured_facility_ids,
        state.facility_ids
      ),
      category_facility_text: state.category_facility_text,
      category_facility_text_en: state.category_facility_text_en,
      updated_at: now,
      updated_by: "admin",
    };
    if (isEditMode) {
      const idx = list.findIndex((p) => p.id === state.id);
      if (idx >= 0) {
        const merged = { ...list[idx], ...record };
        delete merged.rep_facilities;
        list[idx] = merged;
      }
    } else {
      record.created_at = now;
      list.push(record);
    }
    try {
      savePlaces(list);
    } catch (err) {
      if (isStorageQuotaExceeded(err)) {
        throw new Error(
          "브라우저 저장공간이 부족해 등록할 수 없습니다. 이미지 수/용량을 줄이거나 기존 데이터를 일부 삭제해 주세요."
        );
      }
      throw err;
    }
  }

  renderStep();
}

// --- Facility categories (domains: PLACE / ROOM) ---

function renderCategoryDomainHome(main) {
  main.innerHTML = `
    <h2 class="page-title">카테고리 관리</h2>
    <p class="page-desc">숙소·객실 등 구분별 마스터 카테고리입니다. 구분을 고른 뒤 카테고리를 등록하세요. 코드는 숙소(<code>plc</code>·기존 <code>cate</code> 계열)와 객실(<code>rmc</code>)이 서로 다릅니다.</p>
    <div class="category-domain-grid">
      <a href="#/categories/place" class="category-domain-card">
        <span class="category-domain-card-title">숙소</span>
        <span class="category-domain-card-desc">숙소 시설 카테고리 · 「숙소시설관리」·숙소 등록 시설 탭과 연결</span>
      </a>
      <a href="#/categories/room" class="category-domain-card">
        <span class="category-domain-card-title">객실</span>
        <span class="category-domain-card-desc">객실 시설 카테고리 · 추후 객실 관리 화면과 연결</span>
      </a>
    </div>
    <p style="font-size:13px;color:var(--muted);margin-top:16px;">저장소: <code>${STORAGE_FACILITY_CATEGORIES}</code></p>
  `;
}

function renderFacilityCategoryList(main, domain) {
  const d = normalizeCategoryDomain(domain);
  const seg = domainPathSegment(d);
  const list = loadFacilityCategories()
    .filter((c) => normalizeCategoryDomain(c.domain) === d)
    .slice()
    .sort((a, b) => a.code.localeCompare(b.code));
  const rows = list
    .map((c) => {
      const pg =
        c.pictogram_meta?.length > 0
          ? escapeHtml(c.pictogram_meta.map((m) => m.name).join(", "))
          : "-";
      return `
      <tr>
        <td>${escapeHtml(c.code)}</td>
        <td>${escapeHtml(c.name)}</td>
        <td>${pg}</td>
        <td>${c.visible === false ? "비노출" : "노출"}</td>
        <td>${formatDate(c.updatedAt)}</td>
        <td>
          <button type="button" class="btn btn-ghost js-cedit" data-id="${c.id}">수정</button>
          <button type="button" class="btn btn-ghost js-cdel" data-id="${c.id}">삭제</button>
        </td>
      </tr>`;
    })
    .join("");

  main.innerHTML = `
    <h2 class="page-title">카테고리 관리 · ${escapeHtml(domainLabel(d))}</h2>
    <p class="page-desc">공통관리 → 카테고리 관리 → ${escapeHtml(domainLabel(d))}. 픽토그램은 카테고리에 두고, 하위 시설은 ${d === CATEGORY_DOMAIN.PLACE ? "「숙소시설관리」" : "(추후 객실 시설 관리)"}에서 등록합니다.</p>
    <div class="card">
      <div class="toolbar">
        <a href="#/categories" class="btn">구분 선택</a>
        <a href="#/categories/${seg}/new" class="btn btn-primary">카테고리 등록</a>
        <span style="color:var(--muted);font-size:13px;"><code>${STORAGE_FACILITY_CATEGORIES}</code></span>
      </div>
      <table>
        <thead><tr><th>카테고리코드</th><th>카테고리명</th><th>픽토그램 파일</th><th>노출</th><th>수정일시</th><th></th></tr></thead>
        <tbody>${rows}</tbody>
      </table>
    </div>
  `;

  main.querySelectorAll(".js-cedit").forEach((b) =>
    b.addEventListener("click", () => navigate(`categories/${seg}/edit/` + b.getAttribute("data-id")))
  );
  main.querySelectorAll(".js-cdel").forEach((b) =>
    b.addEventListener("click", () => {
      const id = b.getAttribute("data-id");
      const facCount = loadFacilities().filter((f) => f.category_id === id).length;
      if (facCount > 0) {
        alert(`이 카테고리에 연결된 시설이 ${facCount}개 있습니다. 먼저 시설을 삭제하거나 다른 카테고리로 옮기세요.`);
        return;
      }
      if (!confirm("카테고리를 삭제할까요?")) return;
      const next = loadFacilityCategories().filter((x) => x.id !== id);
      saveFacilityCategories(next);
      route();
    })
  );
}

function renderFacilityCategoryForm(main, domain, editId) {
  const d = normalizeCategoryDomain(domain);
  const seg = domainPathSegment(d);
  const isNew = !editId;
  const list = loadFacilityCategories();
  const existing = editId ? list.find((x) => x.id === editId) : null;

  if (editId && !existing) {
    navigate(`categories/${seg}`);
    return;
  }
  if (existing && normalizeCategoryDomain(existing.domain) !== d) {
    alert("선택한 구분과 카테고리의 도메인이 일치하지 않습니다.");
    navigate(`categories/${seg}`);
    return;
  }

  const c = existing || {
    domain: d,
    code: isNew ? nextCategoryCode(list, d) : "",
    name: "",
    name_en: "",
    pictogram_meta: [],
    visible: true,
  };

  const pgNames = (c.pictogram_meta || []).map((m) => m.name).join(", ") || "없음";
  const pictoStored = existing?.pictogram_meta || [];

  main.innerHTML = `
    <h2 class="page-title">${isNew ? "카테고리 등록" : "카테고리 수정"} · ${escapeHtml(domainLabel(d))}</h2>
    <p class="page-desc">공통관리 → 카테고리 관리 → ${escapeHtml(domainLabel(d))}</p>
    <div class="card facility-form">
      <label class="field"><span>구분</span>
        <input type="text" value="${escapeAttr(domainLabel(d))}" readonly style="background:#f5f5f5;" />
      </label>
      <label class="field"><span>카테고리코드</span>
        <input type="text" id="cat_code" value="${escapeAttr(c.code)}" readonly style="background:#f5f5f5;" />
      </label>
      <label class="field"><span>카테고리명</span>
        <input type="text" id="cat_name" value="${escapeAttr(c.name)}" placeholder="예: 수영장" />
      </label>
      <label class="field"><span>카테고리명(영문, 선택)</span>
        <input type="text" id="cat_name_en" value="${escapeAttr(c.name_en || "")}" placeholder="e.g. Pool" />
      </label>
      <label class="field"><span>픽토그램 이미지 (1장 권장)</span>
        <input type="file" id="cat_picto" accept="image/*" />
      </label>
      <p style="font-size:13px;color:var(--muted);">현재 저장된 메타: ${escapeHtml(pgNames)} (프로토타입은 미리보기용 Data URL도 함께 저장)</p>
      <label class="field"><span>노출</span>
        <select id="cat_vis">
          <option value="true" ${c.visible !== false ? "selected" : ""}>노출</option>
          <option value="false" ${c.visible === false ? "selected" : ""}>비노출</option>
        </select>
      </label>
      <div class="wizard-actions" style="justify-content:flex-start;padding:0;">
        <a href="#/categories/${seg}" class="btn">목록</a>
        <button type="button" class="btn btn-primary" id="cat_save">저장</button>
      </div>
      <p id="cat_err" class="error"></p>
    </div>
  `;

  document.getElementById("cat_save").addEventListener("click", async () => {
    const name = document.getElementById("cat_name").value.trim();
    const nameEn = document.getElementById("cat_name_en").value.trim();
    const err = document.getElementById("cat_err");
    err.textContent = "";
    if (!name) {
      err.textContent = "카테고리명을 입력하세요.";
      return;
    }
    const now = new Date().toISOString();
    const fileInput = document.getElementById("cat_picto").files?.[0];
    let pictogramMeta = pictoStored;
    if (fileInput) {
      try {
        pictogramMeta = [await buildImageMetaWithDataUrl(fileInput, CATEGORY_PICTOGRAM_MAX_MB)];
      } catch (e) {
        err.textContent = e?.message || "픽토그램 이미지 처리 중 오류가 발생했습니다.";
        return;
      }
    }
    const row = {
      id: existing?.id || uid(),
      domain: d,
      code: document.getElementById("cat_code").value.trim(),
      name,
      name_en: nameEn,
      pictogram_meta: pictogramMeta,
      visible: document.getElementById("cat_vis").value === "true",
      updatedAt: now,
    };
    let next;
    if (isNew) next = [...list, row];
    else next = list.map((x) => (x.id === row.id ? row : x));
    saveFacilityCategories(next);
    navigate(`categories/${seg}`);
  });
}

// --- Facilities (숙소 PLACE / 객실 ROOM 도메인 분리) ---

function facilityDomainSeg(domain) {
  return normalizeCategoryDomain(domain) === CATEGORY_DOMAIN.ROOM ? "room" : "place";
}

function renderFacilityList(main, domain = CATEGORY_DOMAIN.PLACE) {
  const cats = loadFacilityCategories();
  const dom = normalizeCategoryDomain(domain);
  const catIds = new Set(
    cats.filter((c) => normalizeCategoryDomain(c.domain) === dom).map((c) => c.id)
  );
  const catName = (id) => cats.find((c) => c.id === id)?.name || "-";
  const catCode = (id) => cats.find((c) => c.id === id)?.code || "-";

  const list = loadFacilities()
    .filter((f) => catIds.has(f.category_id))
    .slice()
    .sort((a, b) => {
      const ac = catCode(a.category_id).localeCompare(catCode(b.category_id));
      if (ac !== 0) return ac;
      return a.name.localeCompare(b.name, "ko");
    });

  const seg = facilityDomainSeg(dom);
  const title = dom === CATEGORY_DOMAIN.ROOM ? "객실시설관리" : "숙소시설관리";
  const emptyHint =
    dom === CATEGORY_DOMAIN.ROOM
      ? `「카테고리 관리 → 객실시설관리」에서 객실 도메인 카테고리를 등록한 뒤 시설을 추가하세요.`
      : `「카테고리 관리 → 숙소시설관리」에서 숙소 도메인 카테고리를 등록한 뒤 시설을 추가하세요.`;

  const rows = list
    .map(
      (f) => `
      <tr>
        <td>${escapeHtml(f.code)}</td>
        <td>${escapeHtml(f.name)}</td>
        <td>${escapeHtml(catCode(f.category_id))}</td>
        <td>${escapeHtml(catName(f.category_id))}</td>
        <td>${f.visible === false ? "비노출" : "노출"}</td>
        <td>${formatDate(f.updatedAt)}</td>
        <td>
          <button type="button" class="btn btn-ghost js-fedit" data-id="${f.id}">수정</button>
          <button type="button" class="btn btn-ghost js-fdel" data-id="${f.id}">삭제</button>
        </td>
      </tr>`
    )
    .join("");

  main.innerHTML = `
    <h2 class="page-title">${title}</h2>
    <p class="page-desc">${dom === CATEGORY_DOMAIN.ROOM ? "객실" : "숙소"} 도메인 카테고리에 속한 시설만 표시합니다. 저장소: <code>${STORAGE_FACILITIES}</code></p>
    <div class="card">
      <div class="toolbar">
        <a href="#/facilities/${seg}/new" class="btn btn-primary">시설 등록</a>
        <span style="color:var(--muted);font-size:13px;"><code>${STORAGE_FACILITIES}</code></span>
      </div>
      ${
        list.length === 0
          ? `<div class="empty"><strong>등록된 시설이 없습니다.</strong> ${emptyHint}</div>`
          : `<table>
        <thead><tr><th>시설코드</th><th>시설명</th><th>카테고리코드</th><th>카테고리명</th><th>노출</th><th>수정일시</th><th></th></tr></thead>
        <tbody>${rows}</tbody>
      </table>`
      }
    </div>
  `;

  main.querySelectorAll(".js-fedit").forEach((b) =>
    b.addEventListener("click", () => navigate(`facilities/${seg}/edit/` + b.getAttribute("data-id")))
  );
  main.querySelectorAll(".js-fdel").forEach((b) =>
    b.addEventListener("click", () => {
      const id = b.getAttribute("data-id");
      if (!confirm("삭제할까요?")) return;
      const next = loadFacilities().filter((x) => x.id !== id);
      saveFacilities(next);
      route();
    })
  );
}

function renderFacilityForm(main) {
  const { parts } = parseHash();
  if (parts[0] !== "facilities" || (parts[1] !== "place" && parts[1] !== "room")) {
    navigate("facilities/place");
    return;
  }
  const seg = parts[1];
  const domain = parts[1] === "room" ? CATEGORY_DOMAIN.ROOM : CATEGORY_DOMAIN.PLACE;
  const isNew = parts[2] === "new";
  const editId = parts[2] === "edit" && parts[3] ? parts[3] : null;

  const list = loadFacilities();
  const categories = (
    domain === CATEGORY_DOMAIN.ROOM ? categoriesForRoomFacilities() : categoriesForPlaceFacilities()
  )
    .filter((c) => c.visible !== false)
    .sort((a, b) => a.code.localeCompare(b.code));
  const existing = editId ? list.find((x) => x.id === editId) : null;

  const defaultCat = categories[0]?.id || "";
  const f = existing || {
    code: "",
    name: "",
    name_en: "",
    category_id: defaultCat,
    visible: true,
  };

  const catOpts = categories
    .map(
      (c) =>
        `<option value="${c.id}" ${f.category_id === c.id ? "selected" : ""}>${escapeHtml(c.code)} · ${escapeHtml(c.name)}</option>`
    )
    .join("");

  const scopeTitle = domain === CATEGORY_DOMAIN.ROOM ? "객실시설관리" : "숙소시설관리";

  main.innerHTML = `
    <h2 class="page-title">${isNew ? "시설 등록" : "시설 수정"}</h2>
    <p class="page-desc">공통관리 &gt; 시설 관리 &gt; ${escapeHtml(scopeTitle)}</p>
    <div class="card facility-form">
      <label class="field"><span>소속 카테고리</span>
        <select id="fc_cat_id">${catOpts || '<option value="">카테고리를 먼저 등록하세요</option>'}</select>
      </label>
      <label class="field"><span>시설코드</span>
        <input type="text" id="fc_code" value="${escapeAttr(f.code)}" ${existing ? "readonly" : ""} placeholder="예: POOL_IN" />
      </label>
      <label class="field"><span>시설명</span>
        <input type="text" id="fc_name" value="${escapeAttr(f.name)}" />
      </label>
      <label class="field"><span>시설명(영문, 선택)</span>
        <input type="text" id="fc_name_en" value="${escapeAttr(f.name_en || "")}" />
      </label>
      <label class="field"><span>노출</span>
        <select id="fc_vis">
          <option value="true" ${f.visible !== false ? "selected" : ""}>노출</option>
          <option value="false" ${f.visible === false ? "selected" : ""}>비노출</option>
        </select>
      </label>
      <div class="wizard-actions" style="justify-content:flex-start;padding:0;">
        <a href="#/facilities/${seg}" class="btn">목록</a>
        <button type="button" class="btn btn-primary" id="fc_save">저장</button>
      </div>
      <p id="fc_err" class="error"></p>
    </div>
  `;

  document.getElementById("fc_save").addEventListener("click", () => {
    const category_id = document.getElementById("fc_cat_id").value;
    const code = document.getElementById("fc_code").value.trim();
    const name = document.getElementById("fc_name").value.trim();
    const name_en = document.getElementById("fc_name_en").value.trim();
    const err = document.getElementById("fc_err");
    err.textContent = "";
    if (!category_id) {
      err.textContent = "카테고리를 선택하세요.";
      return;
    }
    const catRow = loadFacilityCategories().find((c) => c.id === category_id);
    if (
      catRow &&
      normalizeCategoryDomain(catRow.domain) !== normalizeCategoryDomain(domain)
    ) {
      err.textContent = "선택한 카테고리가 이 화면의 도메인(숙소/객실)과 맞지 않습니다.";
      return;
    }
    if (!code || !name) {
      err.textContent = "시설코드, 시설명은 필수입니다.";
      return;
    }
    if (isNew && list.some((x) => x.code === code)) {
      err.textContent = "이미 같은 시설코드가 있습니다.";
      return;
    }
    const now = new Date().toISOString();
    const row = {
      id: existing?.id || uid(),
      code,
      name,
      name_en,
      category_id,
      visible: document.getElementById("fc_vis").value === "true",
      updatedAt: now,
    };
    let next;
    if (isNew) next = [...list, row];
    else
      next = list.map((x) => {
        if (x.id !== row.id) return x;
        const merged = { ...x, ...row };
        delete merged.sortOrder;
        return merged;
      });
    saveFacilities(next);
    navigate(`facilities/${seg}`);
  });
}

function selectRangeOptions(min, max, selected) {
  let html = "";
  for (let i = min; i <= max; i++) {
    html += `<option value="${i}" ${Number(selected) === i ? "selected" : ""}>${i}</option>`;
  }
  return html;
}

function renderRoomMastersPage(main, tab) {
  ensureRoomMasters();
  const t = tab === "traits" ? "traits" : tab === "beds" ? "beds" : "types";
  const tabs = [
    { id: "types", label: "객실유형", href: "#/room-masters/types" },
    { id: "traits", label: "객실특징", href: "#/room-masters/traits" },
    { id: "beds", label: "침대유형", href: "#/room-masters/beds" },
  ];
  const tabPills = tabs
    .map(
      (x) =>
        `<a class="room-master-tab ${t === x.id ? "active" : ""}" href="${x.href}">${escapeHtml(x.label)}</a>`
    )
    .join("");

  let list = [];
  let title = "";
  let storageHint = "";
  if (t === "types") {
    list = loadRoomTypes();
    title = "객실유형";
    storageHint = STORAGE_ROOM_TYPES;
  } else if (t === "traits") {
    list = loadRoomTraits();
    title = "객실특징";
    storageHint = STORAGE_ROOM_TRAITS;
  } else {
    list = loadBedTypes();
    title = "침대유형";
    storageHint = STORAGE_BED_TYPES;
  }

  const rows = list
    .slice()
    .sort((a, b) => String(a.code || "").localeCompare(String(b.code || "")))
    .map(
      (row) => `
      <tr>
        <td>${escapeHtml(row.code)}</td>
        <td>${escapeHtml(row.name)}</td>
        <td>${row.visible !== false ? "노출" : "비노출"}</td>
        <td>${formatDate(row.updatedAt)}</td>
        <td>
          <button type="button" class="btn btn-ghost js-rm-edit" data-id="${escapeAttr(row.id)}">수정</button>
          <button type="button" class="btn btn-ghost js-rm-del" data-id="${escapeAttr(row.id)}">삭제</button>
        </td>
      </tr>`
    )
    .join("");

  main.innerHTML = `
    <h2 class="page-title">객실유형관리</h2>
    <p class="page-desc">객실등록 화면에서 사용하는 마스터 태그입니다. 저장소: <code>${escapeHtml(storageHint)}</code></p>
    <div class="room-master-tabs">${tabPills}</div>
    <div class="card">
      <h3 style="margin-top:0">${escapeHtml(title)}</h3>
      <div class="toolbar">
        <input type="text" id="rm_new_name" class="rm-inline-input" placeholder="명칭 입력 후 추가" />
        <button type="button" class="btn btn-primary" id="rm_add">추가</button>
      </div>
      ${
        list.length === 0
          ? `<div class="empty">항목이 없습니다.</div>`
          : `<table>
        <thead><tr><th>코드</th><th>명칭</th><th>노출</th><th>수정일시</th><th></th></tr></thead>
        <tbody>${rows}</tbody>
      </table>`
      }
      <p id="rm_err" class="error"></p>
    </div>
  `;

  document.getElementById("rm_add").addEventListener("click", () => {
    const name = document.getElementById("rm_new_name").value.trim();
    const err = document.getElementById("rm_err");
    err.textContent = "";
    if (!name) {
      err.textContent = "명칭을 입력하세요.";
      return;
    }
    const now = new Date().toISOString();
    if (t === "types") {
      const list2 = loadRoomTypes();
      list2.push({ id: uid(), code: nextRoomTypeCode(list2), name, visible: true, updatedAt: now });
      saveRoomTypes(list2);
    } else if (t === "traits") {
      const list2 = loadRoomTraits();
      list2.push({ id: uid(), code: nextRoomTraitCode(list2), name, visible: true, updatedAt: now });
      saveRoomTraits(list2);
    } else {
      const list2 = loadBedTypes();
      list2.push({ id: uid(), code: nextBedTypeCode(list2), name, visible: true, updatedAt: now });
      saveBedTypes(list2);
    }
    document.getElementById("rm_new_name").value = "";
    renderRoomMastersPage(main, t);
  });

  main.querySelectorAll(".js-rm-edit").forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = btn.getAttribute("data-id");
      let list2;
      let saver;
      if (t === "types") {
        list2 = loadRoomTypes();
        saver = saveRoomTypes;
      } else if (t === "traits") {
        list2 = loadRoomTraits();
        saver = saveRoomTraits;
      } else {
        list2 = loadBedTypes();
        saver = saveBedTypes;
      }
      const row = list2.find((x) => x.id === id);
      if (!row) return;
      const nv = prompt("명칭 수정", row.name);
      if (nv === null) return;
      const name = nv.trim();
      if (!name) return;
      row.name = name;
      row.updatedAt = new Date().toISOString();
      saver(list2);
      renderRoomMastersPage(main, t);
    });
  });

  main.querySelectorAll(".js-rm-del").forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = btn.getAttribute("data-id");
      if (!confirm("삭제할까요? 객실에서 참조 중이면 오류가 날 수 있습니다.")) return;
      if (t === "types") saveRoomTypes(loadRoomTypes().filter((x) => x.id !== id));
      else if (t === "traits") saveRoomTraits(loadRoomTraits().filter((x) => x.id !== id));
      else saveBedTypes(loadBedTypes().filter((x) => x.id !== id));
      renderRoomMastersPage(main, t);
    });
  });
}

function renderRoomList(main, placeFilterId) {
  ensureRoomMasters();
  const rooms = loadRooms();
  const places = loadPlaces();
  const products = loadProducts();
  const roomProductCount = productCountByRoomId(products);
  const placeById = new Map(places.map((p) => [p.id, p]));
  let filtered = rooms;
  if (placeFilterId) filtered = rooms.filter((r) => r.place_id === placeFilterId);

  const placeOpts =
    `<option value="">전체 숙소</option>` +
    places
      .map((p) => `<option value="${escapeAttr(p.id)}" ${placeFilterId === p.id ? "selected" : ""}>${escapeHtml(p.place_name)}</option>`)
      .join("");

  const rows = filtered
    .slice()
    .sort((a, b) => (b.updated_at || "").localeCompare(a.updated_at || ""))
    .map((r) => {
      const pl = placeById.get(r.place_id);
      const xbedYn = r.extra_bed_enabled ? "Y" : "N";
      const occExtraYn = r.occupant_extra_charge_enabled ? "Y" : "N";
      const nProd = roomProductCount.get(r.id) || 0;
      return `
      <tr>
        <td>${escapeHtml(r.room_code || "-")}</td>
        <td>${pl ? escapeHtml(pl.place_name) : "?"}</td>
        <td>${escapeHtml(r.room_name || "-")}</td>
        <td>${escapeHtml(String(r.standard_occupancy ?? "-"))}</td>
        <td>${escapeHtml(String(r.max_occupancy ?? "-"))}</td>
        <td title="${r.extra_bed_enabled ? "있음 (Y)" : "없음 (N)"}"><span class="room-yn">${escapeHtml(xbedYn)}</span></td>
        <td title="${r.occupant_extra_charge_enabled ? "있음 (Y)" : "없음 (N)"}"><span class="room-yn">${escapeHtml(occExtraYn)}</span></td>
        <td><a class="btn btn-ghost" href="#/products/place/${escapeAttr(r.place_id)}">${nProd}개</a></td>
        <td>${formatDate(r.updated_at)}</td>
        <td><button type="button" class="btn btn-ghost js-room-edit" data-id="${escapeAttr(r.id)}">수정</button></td>
      </tr>`;
    })
    .join("");

  main.innerHTML = `
    <h2 class="page-title">객실관리</h2>
    <p class="page-desc">숙소에 종속된 객실 데이터입니다. 저장소: <code>${escapeHtml(STORAGE_ROOMS)}</code> · 상품연결 건수는 <code>${escapeHtml(STORAGE_PRODUCTS)}</code>의 <code>room_id</code> 기준 · <a href="#/products">상품관리</a>에서 등록합니다.</p>
    <div class="card">
      <div class="toolbar room-list-toolbar">
        <label class="field" style="flex-direction:row;align-items:center;gap:8px;margin:0;">
          <span style="font-weight:600;">숙소 필터</span>
          <select id="room_place_filter" style="min-width:220px;">${placeOpts}</select>
        </label>
        ${
          placeFilterId
            ? `<a href="#/rooms/new/place/${escapeAttr(placeFilterId)}" class="btn room-list-place-register-btn">이 숙소로 등록</a>
          <a href="#/products/place/${escapeAttr(placeFilterId)}" class="btn">이 숙소 상품</a>`
            : ""
        }
      </div>
      <div class="room-list-table-bar" aria-label="객실 목록 도구">
        <div class="room-list-table-bar-actions">
          <a href="#/rooms/new" class="btn btn-primary">객실 등록</a>
        </div>
      </div>
      ${
        filtered.length === 0
          ? `<div class="empty"><strong>객실이 없습니다.</strong> 마스터(<a href="#/room-masters/types">객실유형관리</a>)와 숙소를 준비한 뒤 등록하세요.</div>`
          : `<div class="room-list-table-wrap">
      <table class="room-list-table">
        <thead><tr>
          <th>객실코드</th><th>숙소</th><th>객실명</th><th>기준인원</th><th>최대인원</th>
          <th title="Y=엑스트라베드 있음, N=없음">엑스트라베드<br /><span class="th-sub">Y/N</span></th>
          <th title="Y=기준인원 초과 1인당 추가요금 있음, N=없음">추가인원비용<br /><span class="th-sub">Y/N</span></th>
          <th>상품연결</th><th>수정일시</th><th></th>
        </tr></thead>
        <tbody>${rows}</tbody>
      </table>
    </div>`
      }
    </div>
  `;

  const sel = document.getElementById("room_place_filter");
  if (sel) {
    sel.addEventListener("change", () => {
      const v = sel.value;
      if (v) navigate(`rooms/place/${v}`);
      else navigate("rooms");
    });
  }

  main.querySelectorAll(".js-room-edit").forEach((btn) => {
    btn.addEventListener("click", () => navigate(`rooms/edit/${btn.getAttribute("data-id")}`));
  });
}

function normalizeRoomBedRows(existing) {
  if (Array.isArray(existing?.bed_rows) && existing.bed_rows.length) {
    return existing.bed_rows.map((r) => ({
      bed_type_id: r.bed_type_id,
      count: Math.max(1, parseInt(r.count, 10) || 1),
    }));
  }
  return [];
}

/** 객실크기(㎡): 숫자와 소수점 한 개만 허용 */
function sanitizeRoomSizeSqmInput(raw) {
  let s = String(raw ?? "").replace(/[^\d.]/g, "");
  const dot = s.indexOf(".");
  if (dot >= 0) {
    s = s.slice(0, dot + 1) + s.slice(dot + 1).replace(/\./g, "");
  }
  return s;
}

function renderRoomForm(main, editId, presetPlaceId) {
  ensureRoomMasters();
  ensureFacilityStores();

  const masters = {
    roomTypes: loadRoomTypes().filter((x) => x.visible !== false),
    traits: loadRoomTraits().filter((x) => x.visible !== false),
    bedTypes: loadBedTypes().filter((x) => x.visible !== false),
  };

  const places = loadPlaces();
  const allRooms = loadRooms();
  const existing = editId ? allRooms.find((r) => r.id === editId) : null;
  const isEdit = !!existing;

  const state = {
    id: existing?.id || uid(),
    place_id: existing?.place_id || presetPlaceId || places[0]?.id || "",
    room_code: existing?.room_code || (isEdit ? "" : nextRoomCode(allRooms)),
    room_name: existing?.room_name || "",
    room_type_id: existing?.room_type_id || "",
    room_trait_ids: Array.isArray(existing?.room_trait_ids) ? [...existing.room_trait_ids] : [],
    bed_rows: normalizeRoomBedRows(existing),
    standard_occupancy: existing?.standard_occupancy ?? 2,
    max_occupancy: existing?.max_occupancy ?? 4,
    facility_ids: Array.isArray(existing?.facility_ids) ? [...existing.facility_ids] : [],
    featured_facility_ids: normalizeFeaturedFacilityIds(
      existing?.featured_facility_ids,
      existing?.facility_ids || []
    ),
    pickerCategoryId: "",
    room_size_sqm: existing?.room_size_sqm ?? "",
    policy_html: existing?.policy_html || "",
    guide_html: existing?.guide_html || "",
    extra_bed_enabled: !!existing?.extra_bed_enabled,
    extra_bed_max_count: existing?.extra_bed_max_count ?? 1,
    extra_bed_fee: existing?.extra_bed_fee ?? 0,
    occupant_extra_charge_enabled: !!existing?.occupant_extra_charge_enabled,
    occupant_extra_charge_per_person: existing?.occupant_extra_charge_per_person ?? 0,
    occupant_extra_charge_settlement: normalizeRoomChargeSettlement(existing?.occupant_extra_charge_settlement),
    extra_bed_settlement: normalizeRoomChargeSettlement(existing?.extra_bed_settlement),
    visibility: existing?.visibility === "HIDE" ? "HIDE" : "SHOW",
    image_meta: Array.isArray(existing?.image_meta) ? [...existing.image_meta] : [],
    image_storage_warning: "",
  };

  const roomCats = categoriesForRoomFacilities()
    .filter((c) => c.visible !== false)
    .slice()
    .sort((a, b) => a.code.localeCompare(b.code));
  if (!state.pickerCategoryId && roomCats[0]) state.pickerCategoryId = roomCats[0].id;

  function syncBedCountsFromDom() {
    document.querySelectorAll(".js-bed-count").forEach((inp) => {
      const bid = inp.getAttribute("data-bed-id");
      const row = state.bed_rows.find((r) => r.bed_type_id === bid);
      if (row) row.count = Math.max(1, parseInt(inp.value, 10) || 1);
    });
  }

  function applyRoomFacilityPickerFromDom() {
    const catId = state.pickerCategoryId;
    if (!catId) return { ok: true };
    const inCat = loadFacilities()
      .filter((f) => f.category_id === catId)
      .map((f) => f.id);
    const listEl = document.getElementById("room_fac_right_list");
    if (!listEl) return { ok: true };
    const applyIds = [];
    const featIds = [];
    listEl.querySelectorAll(".fac-picker-row").forEach((row) => {
      const id = row.getAttribute("data-fac-id");
      if (!id || !inCat.includes(id)) return;
      const applyCb = row.querySelector(".js-fac-apply");
      const featCb = row.querySelector(".js-fac-featured");
      if (applyCb?.checked) applyIds.push(id);
      if (applyCb?.checked && featCb?.checked && !featCb.disabled) featIds.push(id);
    });
    const rest = state.facility_ids.filter((id) => !inCat.includes(id));
    const nextFac = [...new Set([...rest, ...applyIds])];
    const restFeat = state.featured_facility_ids.filter((id) => !inCat.includes(id));
    const mergedFeat = [...new Set([...restFeat, ...featIds])].filter((id) => nextFac.includes(id));
    if (mergedFeat.length > 10) {
      return {
        ok: false,
        msg: `대표 객실시설 노출은 최대 10개까지입니다. (현재 적용 결과 ${mergedFeat.length}개)`,
      };
    }
    state.facility_ids = nextFac;
    state.featured_facility_ids = mergedFeat;
    return { ok: true };
  }

  function roomFacilityChipsHtml() {
    const cats = roomCats;
    const facs = loadFacilities();
    const parts = state.facility_ids
      .map((id) => {
        const f = facs.find((x) => x.id === id);
        if (!f) return "";
        const c = cats.find((x) => x.id === f.category_id);
        const cname = c ? c.name : "?";
        const feat = state.featured_facility_ids.includes(id);
        const badge = feat ? `<span class="facility-chip-badge" aria-hidden="true">대표</span>` : "";
        return `<span class="facility-chip${feat ? " facility-chip--featured" : ""}">${badge}<span class="facility-chip-text">${escapeHtml(cname)} : ${escapeHtml(f.name)}</span>
      <button type="button" class="facility-chip-x js-room-chip-remove" data-fac-id="${escapeAttr(id)}" aria-label="삭제">×</button></span>`;
      })
      .filter(Boolean);
    return parts.length
      ? `<div class="facility-chips">${parts.join("")}</div>`
      : `<p style="color:var(--muted);font-size:14px;margin:0 0 16px;">선택된 객실 시설이 없습니다. 카테고리를 바꾸거나 저장하면 현재 카테고리 선택이 자동 반영됩니다.</p>`;
  }

  function persistFromDom() {
    state.place_id = document.getElementById("rf_place")?.value || "";
    state.room_code = document.getElementById("rf_code")?.value.trim() || "";
    state.room_name = document.getElementById("rf_name")?.value || "";
    state.standard_occupancy = parseInt(document.getElementById("rf_std_occ")?.value, 10) || 1;
    state.max_occupancy = parseInt(document.getElementById("rf_max_occ")?.value, 10) || 1;
    state.room_size_sqm = sanitizeRoomSizeSqmInput(document.getElementById("rf_size")?.value ?? "");
    state.policy_html = document.getElementById("rf_policy")?.value ?? "";
    state.guide_html = document.getElementById("rf_guide")?.value ?? "";
    state.extra_bed_enabled = document.getElementById("rf_xbed_on")?.checked || false;
    state.extra_bed_max_count = state.extra_bed_enabled
      ? parseInt(document.getElementById("rf_xbed_max")?.value, 10) || 0
      : 0;
    state.extra_bed_fee = state.extra_bed_enabled
      ? document.getElementById("rf_xbed_fee")?.value.trim() || "0"
      : "0";
    state.occupant_extra_charge_enabled = document.getElementById("rf_occ_extra_on")?.checked || false;
    state.occupant_extra_charge_per_person = state.occupant_extra_charge_enabled
      ? document.getElementById("rf_occ_extra_amt")?.value.trim() || "0"
      : "0";
    state.occupant_extra_charge_settlement = normalizeRoomChargeSettlement(
      document.getElementById("rf_occ_extra_mode")?.value
    );
    state.extra_bed_settlement = normalizeRoomChargeSettlement(document.getElementById("rf_xbed_mode")?.value);
    state.visibility = document.getElementById("rf_vis")?.value || "SHOW";
    syncBedCountsFromDom();
  }

  function validateRoom(st) {
    if (!st.place_id) return "숙소를 선택하세요.";
    if (!st.room_type_id) return "객실유형을 선택하세요.";
    if (!st.bed_rows || st.bed_rows.length === 0) return "침대유형을 1개 이상 선택하세요.";
    for (const br of st.bed_rows) {
      if (!br.bed_type_id) return "침대유형이 올바르지 않습니다.";
      if (!br.count || br.count < 1) return "침대 개수는 각 1 이상이어야 합니다.";
    }
    if (!String(st.room_name || "").trim()) return "객실명을 입력하세요.";
    if (st.max_occupancy < st.standard_occupancy) return "최대인원은 기준인원 이상이어야 합니다.";
    const sz = String(sanitizeRoomSizeSqmInput(st.room_size_sqm || "")).trim();
    if (sz && Number.isNaN(Number(sz))) return "객실크기는 숫자만 입력하세요.";
    return "";
  }

  function render() {
    const placeOpts = places
      .map((p) => `<option value="${escapeAttr(p.id)}" ${state.place_id === p.id ? "selected" : ""}>${escapeHtml(p.place_code)} · ${escapeHtml(p.place_name)}</option>`)
      .join("");

    const rtPills = masters.roomTypes
      .map(
        (x) =>
          `<button type="button" class="tag-pill ${state.room_type_id === x.id ? "active" : ""} js-rt" data-id="${escapeAttr(x.id)}">${escapeHtml(x.name)}</button>`
      )
      .join("");

    const traitPills = masters.traits
      .map((x) => {
        const on = state.room_trait_ids.includes(x.id);
        return `<button type="button" class="tag-pill ${on ? "active" : ""} js-tr" data-id="${escapeAttr(x.id)}">${escapeHtml(x.name)}</button>`;
      })
      .join("");

    const bedPills = masters.bedTypes
      .map((x) => {
        const on = state.bed_rows.some((r) => r.bed_type_id === x.id);
        return `<button type="button" class="tag-pill ${on ? "active" : ""} js-bd" data-id="${escapeAttr(x.id)}">${escapeHtml(x.name)}</button>`;
      })
      .join("");

    const bedCountRows = state.bed_rows
      .map((row) => {
        const bt = masters.bedTypes.find((b) => b.id === row.bed_type_id);
        const label = bt ? bt.name : "?";
        return `<label class="field bed-count-row"><span>${escapeHtml(label)} 개수</span>
          <input type="number" class="js-bed-count" data-bed-id="${escapeAttr(row.bed_type_id)}" min="1" step="1" value="${escapeAttr(String(row.count))}" /></label>`;
      })
      .join("");

    const roomImgMetaLines = (state.image_meta || [])
      .map(
        (m, idx) => `<li class="image-meta-item">
        <span class="image-meta-text">${idx === 0 ? "대표" : "추가"} · ${escapeHtml(m.name)} (${m.size} bytes)</span>
        <button type="button" class="image-meta-delete js-room-image-remove" data-image-idx="${idx}" aria-label="이미지 삭제">×</button>
      </li>`
      )
      .join("");

    const catButtons = roomCats
      .map(
        (c) =>
          `<button type="button" class="facility-cat-btn js-room-pick-cat ${state.pickerCategoryId === c.id ? "active" : ""}" data-cat-id="${c.id}">${escapeHtml(c.name)} <small style="opacity:.85">${escapeHtml(c.code)}</small></button>`
      )
      .join("");

    const facs = loadFacilities().filter((f) => f.visible !== false);
    const nFeatured = state.featured_facility_ids.length;
    const maxFeatured = nFeatured >= 10;
    const catFacs = facs
      .filter((f) => f.category_id === state.pickerCategoryId)
      .slice()
      .sort((a, b) => a.name.localeCompare(b.name, "ko"));
    const rightItems = catFacs
      .map((f) => {
        const applied = state.facility_ids.includes(f.id);
        const feat = state.featured_facility_ids.includes(f.id);
        const featDisabled = !applied || (maxFeatured && !feat);
        return `<div class="fac-picker-row" data-fac-id="${escapeAttr(f.id)}">
            <label class="fac-picker-apply">
              <input type="checkbox" class="js-fac-apply" value="${escapeAttr(f.id)}" ${applied ? "checked" : ""} />
              <span>${escapeHtml(f.name)} <small style="color:var(--muted)">(${escapeHtml(f.code)})</small></span>
            </label>
            <label class="fac-picker-feat"${featDisabled ? ' title="적용된 시설만 대표 지정 · 최대 10개"' : ""}>
              <input type="checkbox" class="js-fac-featured" value="${escapeAttr(f.id)}" ${feat ? "checked" : ""} ${
          featDisabled ? "disabled" : ""
        } />
              <span class="fac-picker-feat-label">대표</span>
            </label>
          </div>`;
      })
      .join("");

    const autofillHint =
      "「마스터로 객실명 채우기」는 언제든 누를 수 있으며, 클릭 시 현재 선택·침대 개수 기준으로 객실명을 덮어씁니다(수동 입력보다 우선).";

    main.innerHTML = `
      <h2 class="page-title">${isEdit ? "객실 수정" : "객실 등록"}</h2>
      <p class="page-desc">숙소에 종속된 객실 · v0.2 · 코드 <code>${escapeHtml(state.room_code)}</code></p>

      <div class="card">
        <h3 class="section-title">소속 · 코드</h3>
        <div class="form-grid">
          <label class="field"><span>숙소</span>
            <select id="rf_place">${placeOpts || '<option value="">숙소를 먼저 등록하세요</option>'}</select>
          </label>
          <label class="field"><span>객실코드</span>
            <input type="text" id="rf_code" value="${escapeAttr(state.room_code)}" ${isEdit ? "readonly" : ""} />
          </label>
          <label class="field"><span>운영</span>
            <select id="rf_vis">
              <option value="SHOW" ${state.visibility === "SHOW" ? "selected" : ""}>노출</option>
              <option value="HIDE" ${state.visibility === "HIDE" ? "selected" : ""}>비노출</option>
            </select>
          </label>
        </div>
      </div>

      <div class="card">
        <h3 class="section-title">객실유형 · 특징 · 침대</h3>
        <p class="field-hint">객실유형 1개 필수 · 특징은 선택(클릭 순서대로 명칭 앞에 붙음) · 침대유형 1개 이상 필수 · 침대 개수는 선택 순서와 동일합니다.</p>
        <div class="tag-section"><strong>객실유형</strong><div class="tag-pool">${rtPills || "<span class='muted'>마스터 없음</span>"}</div></div>
        <div class="tag-section"><strong>객실특징</strong><div class="tag-pool">${traitPills || ""}</div></div>
        <div class="tag-section"><strong>침대유형</strong><div class="tag-pool">${bedPills || ""}</div></div>
        <div class="bed-count-grid">${bedCountRows || "<p class='muted small'>침대유형을 선택하면 개수 입력이 나타납니다.</p>"}</div>
      </div>

      <div class="card">
        <h3 class="section-title">객실명</h3>
        <p class="field-hint">${escapeHtml(autofillHint)}</p>
        <div class="toolbar" style="margin-bottom:10px;">
          <button type="button" class="btn btn-primary" id="rf_autofill_name">마스터로 객실명 채우기</button>
        </div>
        <label class="field"><span>객실명</span>
          <input type="text" id="rf_name" value="${escapeAttr(state.room_name)}" placeholder="자동 또는 직접 입력" />
        </label>
      </div>

      <div class="card">
        <h3 class="section-title">인원 · 크기</h3>
        <div class="form-grid">
          <label class="field"><span>기준인원 (검색 기준)</span>
            <select id="rf_std_occ">${selectRangeOptions(1, 30, state.standard_occupancy)}</select>
          </label>
          <label class="field"><span>최대인원 (추가 요금 안내용)</span>
            <select id="rf_max_occ">${selectRangeOptions(1, 30, state.max_occupancy)}</select>
          </label>
          <label class="field"><span>객실크기 (㎡)</span>
            <input type="text" id="rf_size" class="js-room-size-sqm" inputmode="decimal" autocomplete="off" placeholder="숫자만 (소수점 허용)" value="${escapeAttr(
              state.room_size_sqm === undefined || state.room_size_sqm === null
                ? ""
                : String(sanitizeRoomSizeSqmInput(state.room_size_sqm))
            )}" />
          </label>
        </div>
      </div>

      <div class="card">
        <h3 class="section-title">객실 이미지</h3>
        <p class="field-hint" style="margin:-6px 0 12px;font-size:12px;">숙소 등록과 동일하게 프로토타입에서는 파일 메타와 확인용 Data URL을 함께 저장합니다. 실서비스는 업로드 URL 저장을 권장합니다.</p>
        <label class="field"><span>대표 이미지 — 1장</span>
          <input type="file" id="rf_img_hero" accept="image/*" />
        </label>
        <label class="field"><span>추가 이미지 — 최대 9장</span>
          <input type="file" id="rf_img_more" accept="image/*" multiple />
        </label>
        <p style="font-size:12px;color:var(--muted);margin:0 0 8px;">이미지당 ${PLACE_IMAGE_MAX_MB}MB 이하만 허용합니다. 큰 이미지는 저장 실패할 수 있습니다.</p>
        <div style="font-size:13px;">
          <p style="margin:0 0 6px;">등록된 이미지</p>
          ${
            state.image_meta?.length
              ? `<ul class="image-meta-list">${roomImgMetaLines}</ul>`
              : `<p style="margin:0;color:var(--muted);">없음</p>`
          }
        </div>
        ${
          state.image_storage_warning
            ? `<p class="field-warn">${escapeHtml(state.image_storage_warning)}</p>`
            : ""
        }
      </div>

      <div class="card">
        <h3 class="section-title">인원 추가요금 (객실정책)</h3>
        <p class="field-hint" style="margin:-6px 0 12px;font-size:12px;">반영 기준은 결제 흐름용입니다. 프런트 정책 화면에는 금액·조건이 선택과 관계없이 노출됩니다.</p>
        <label class="field row-inline">
          <input type="checkbox" id="rf_occ_extra_on" ${state.occupant_extra_charge_enabled ? "checked" : ""} />
          <span>기준인원 초과 시 추가요금 있음</span>
        </label>
        <label class="field"><span>1인당 추가요금 (숫자)</span>
          <input type="text" id="rf_occ_extra_amt" inputmode="numeric" placeholder="원" value="${escapeAttr(String(state.occupant_extra_charge_per_person ?? ""))}" ${
      !state.occupant_extra_charge_enabled ? "disabled" : ""
    } />
        </label>
        <label class="field"><span>추가요금 반영 기준</span>
          <select id="rf_occ_extra_mode" ${!state.occupant_extra_charge_enabled ? "disabled" : ""}>
            <option value="${ROOM_CHARGE_SETTLEMENT.AT_BOOKING}" ${state.occupant_extra_charge_settlement === ROOM_CHARGE_SETTLEMENT.AT_BOOKING ? "selected" : ""}>예약·결제 시 반영</option>
            <option value="${ROOM_CHARGE_SETTLEMENT.ON_SITE}" ${state.occupant_extra_charge_settlement === ROOM_CHARGE_SETTLEMENT.ON_SITE ? "selected" : ""}>현장 결제</option>
          </select>
        </label>
      </div>

      <div class="card">
        <h3 class="section-title">엑스트라베드</h3>
        <p class="field-hint" style="margin:-6px 0 12px;font-size:12px;">반영 기준은 결제 흐름용입니다. 프런트 정책 화면에는 금액·조건이 선택과 관계없이 노출됩니다.</p>
        <label class="field row-inline">
          <input type="checkbox" id="rf_xbed_on" ${state.extra_bed_enabled ? "checked" : ""} />
          <span>엑스트라베드 사용</span>
        </label>
        <div class="form-grid">
          <label class="field"><span>최대 신청 개수</span>
            <select id="rf_xbed_max" ${!state.extra_bed_enabled ? "disabled" : ""}>${selectRangeOptions(0, 10, state.extra_bed_max_count)}</select>
          </label>
          <label class="field"><span>추가비용 · 1개당 (숫자)</span>
            <input type="text" id="rf_xbed_fee" inputmode="numeric" placeholder="1개·1박당 원 단위 등" value="${escapeAttr(String(state.extra_bed_fee ?? ""))}" ${
      !state.extra_bed_enabled ? "disabled" : ""
    } />
          </label>
          <label class="field"><span>추가비용 반영 기준</span>
            <select id="rf_xbed_mode" ${!state.extra_bed_enabled ? "disabled" : ""}>
              <option value="${ROOM_CHARGE_SETTLEMENT.AT_BOOKING}" ${state.extra_bed_settlement === ROOM_CHARGE_SETTLEMENT.AT_BOOKING ? "selected" : ""}>예약·결제 시 반영</option>
              <option value="${ROOM_CHARGE_SETTLEMENT.ON_SITE}" ${state.extra_bed_settlement === ROOM_CHARGE_SETTLEMENT.ON_SITE ? "selected" : ""}>현장 결제</option>
            </select>
          </label>
        </div>
      </div>

      <div class="card">
        <div class="facility-step-banner">
          <span class="facility-step-banner-stat">대표 객실시설 <strong>${nFeatured}</strong> / 10</span>
          <span class="facility-step-banner-hint">객실 시설 카테고리(구분: 객실) 아래 시설을 선택합니다. 카테고리 전환·저장 시 선택이 자동 반영됩니다. 「카테고리 관리 → 객실」에서 카테고리를 먼저 등록하세요.</span>
        </div>
        <div class="facility-picker">
          <div class="facility-picker-col">
            <h4>카테고리</h4>
            <div class="facility-cat-list">${catButtons || "<p class='muted'>객실 도메인 카테고리가 없습니다.</p>"}</div>
          </div>
          <div class="facility-picker-col">
            <h4>객실 시설 선택</h4>
            ${
              catFacs.length
                ? `<div class="fac-picker-head"><span>적용</span><span>대표</span></div><div id="room_fac_right_list">${rightItems}</div><button type="button" class="btn btn-primary" id="btn_room_fac_apply">적용</button>`
                : "<p class='muted'>이 카테고리에 시설이 없습니다.</p>"
            }
          </div>
        </div>
        <hr style="border:0;border-top:1px solid var(--border);margin:16px 0;" />
        <h4 style="margin:0 0 10px;">적용된 객실 시설</h4>
        ${roomFacilityChipsHtml()}
      </div>

      <div class="card">
        <h3 class="section-title">객실정책 · 객실안내</h3>
        <label class="field"><span>객실정책 (HTML·이미지 붙여넣기)</span>
          <textarea id="rf_policy" class="js-image-paste" rows="8">${escapeForTextarea(state.policy_html)}</textarea>
        </label>
        <label class="field"><span>객실안내 (HTML·이미지 붙여넣기)</span>
          <textarea id="rf_guide" class="js-image-paste" rows="8">${escapeForTextarea(state.guide_html)}</textarea>
        </label>
      </div>

      <div class="wizard-actions wizard-actions--sticky">
        <a href="#/rooms${state.place_id ? `/place/${state.place_id}` : ""}" class="btn">목록</a>
        <div class="wizard-actions-trailing">
          <a href="#/rooms" class="btn">취소</a>
          <button type="button" class="btn btn-primary" id="rf_save">${isEdit ? "저장" : "등록"}</button>
        </div>
      </div>
      <p id="rf_err" class="error" style="min-height:20px;"></p>
    `;

    const errEl = () => document.getElementById("rf_err");

    main.querySelectorAll(".js-rt").forEach((btn) => {
      btn.addEventListener("click", () => {
        persistFromDom();
        state.room_type_id = btn.getAttribute("data-id");
        render();
      });
    });

    main.querySelectorAll(".js-tr").forEach((btn) => {
      btn.addEventListener("click", () => {
        persistFromDom();
        const id = btn.getAttribute("data-id");
        const idx = state.room_trait_ids.indexOf(id);
        if (idx >= 0) state.room_trait_ids.splice(idx, 1);
        else state.room_trait_ids.push(id);
        render();
      });
    });

    main.querySelectorAll(".js-bd").forEach((btn) => {
      btn.addEventListener("click", () => {
        persistFromDom();
        const id = btn.getAttribute("data-id");
        const ix = state.bed_rows.findIndex((r) => r.bed_type_id === id);
        if (ix >= 0) state.bed_rows.splice(ix, 1);
        else state.bed_rows.push({ bed_type_id: id, count: 1 });
        render();
      });
    });

    document.getElementById("rf_autofill_name")?.addEventListener("click", () => {
      persistFromDom();
      if (!state.room_type_id || !state.bed_rows.length) {
        errEl().textContent = "객실유형과 침대유형을 먼저 선택하세요.";
        return;
      }
      state.room_name = buildAutoRoomName(state, masters);
      errEl().textContent = "";
      render();
    });

    document.getElementById("rf_occ_extra_on")?.addEventListener("change", () => {
      persistFromDom();
      render();
    });

    document.getElementById("rf_xbed_on")?.addEventListener("change", () => {
      persistFromDom();
      render();
    });

    const sizeInp = document.getElementById("rf_size");
    if (sizeInp) {
      const applySize = () => {
        const next = sanitizeRoomSizeSqmInput(sizeInp.value);
        if (sizeInp.value !== next) sizeInp.value = next;
      };
      sizeInp.addEventListener("beforeinput", (e) => {
        if (e.inputType === "insertFromPaste") return;
        const t = e.data;
        if (t == null) return;
        if (/^\d$/.test(t)) return;
        if (t === "." && !String(sizeInp.value + "").includes(".")) return;
        e.preventDefault();
      });
      sizeInp.addEventListener("paste", (e) => {
        e.preventDefault();
        const paste = (e.clipboardData || window.clipboardData)?.getData("text") || "";
        const cur = sizeInp.value;
        const start = sizeInp.selectionStart ?? cur.length;
        const end = sizeInp.selectionEnd ?? cur.length;
        const merged = cur.slice(0, start) + paste + cur.slice(end);
        sizeInp.value = sanitizeRoomSizeSqmInput(merged);
      });
      sizeInp.addEventListener("input", applySize);
    }

    main.querySelectorAll(".js-room-pick-cat").forEach((btn) => {
      btn.addEventListener("click", () => {
        persistFromDom();
        const r = applyRoomFacilityPickerFromDom();
        if (r && r.ok === false) {
          errEl().textContent = r.msg;
          return;
        }
        errEl().textContent = "";
        state.pickerCategoryId = btn.getAttribute("data-cat-id");
        render();
      });
    });

    const applyFacBtn = document.getElementById("btn_room_fac_apply");
    if (applyFacBtn) {
      applyFacBtn.addEventListener("click", () => {
        persistFromDom();
        const r = applyRoomFacilityPickerFromDom();
        if (r && r.ok === false) {
          errEl().textContent = r.msg;
          return;
        }
        errEl().textContent = "";
        render();
      });
    }

    main.querySelectorAll(".js-room-chip-remove").forEach((btn) => {
      btn.addEventListener("click", () => {
        persistFromDom();
        const fid = btn.getAttribute("data-fac-id");
        state.facility_ids = state.facility_ids.filter((x) => x !== fid);
        state.featured_facility_ids = state.featured_facility_ids.filter((x) => x !== fid);
        render();
      });
    });

    function mergeRoomFacilitiesFromPickerOrBail() {
      const r = applyRoomFacilityPickerFromDom();
      if (r && r.ok === false) {
        errEl().textContent = r.msg;
        render();
        return false;
      }
      errEl().textContent = "";
      render();
      return true;
    }

    main.querySelectorAll(".js-fac-apply").forEach((cb) => {
      cb.addEventListener("change", () => {
        const row = cb.closest(".fac-picker-row");
        const feat = row?.querySelector(".js-fac-featured");
        if (!feat) return;
        if (!cb.checked) {
          feat.checked = false;
          feat.disabled = true;
        } else {
          const n = state.featured_facility_ids.length;
          const id = cb.value;
          feat.disabled = n >= 10 && !state.featured_facility_ids.includes(id);
        }
        mergeRoomFacilitiesFromPickerOrBail();
      });
    });
    main.querySelectorAll(".js-fac-featured").forEach((cb) => {
      if (!cb.closest("#room_fac_right_list")) return;
      cb.addEventListener("change", () => {
        mergeRoomFacilitiesFromPickerOrBail();
      });
    });

    main.querySelectorAll("textarea.js-image-paste").forEach((ta) => attachClipboardImagePaste(ta));

    main.querySelectorAll(".js-room-image-remove").forEach((btn) => {
      btn.addEventListener("click", () => {
        const idx = parseInt(btn.getAttribute("data-image-idx"), 10);
        if (Number.isNaN(idx)) return;
        state.image_meta = state.image_meta.filter((_, i) => i !== idx);
        state.image_storage_warning = "";
        errEl().textContent = "";
        render();
      });
    });

    const rfHero = document.getElementById("rf_img_hero");
    if (rfHero) {
      rfHero.addEventListener("change", async (e) => {
        const f = e.target.files?.[0];
        if (!f) {
          state.image_meta = [];
          state.image_storage_warning = "";
          errEl().textContent = "";
          render();
          return;
        }
        try {
          const hero = await buildImageMetaWithDataUrl(f);
          state.image_meta = hero ? [hero] : [];
          state.image_storage_warning = "";
          errEl().textContent = "";
        } catch (err) {
          errEl().textContent = err?.message || "대표 이미지 처리 중 오류가 발생했습니다.";
        }
        render();
      });
    }
    const rfMore = document.getElementById("rf_img_more");
    if (rfMore) {
      rfMore.addEventListener("change", async (e) => {
        const hero = state.image_meta?.[0];
        const files = Array.from(e.target.files || []).slice(0, 9);
        try {
          const rest = [];
          for (const file of files) {
            rest.push(await buildImageMetaWithDataUrl(file));
          }
          state.image_meta = hero ? [hero, ...rest] : rest;
          state.image_storage_warning = "";
          errEl().textContent = "";
        } catch (err) {
          errEl().textContent = err?.message || "추가 이미지 처리 중 오류가 발생했습니다.";
        }
        render();
      });
    }

    document.getElementById("rf_save").addEventListener("click", () => {
      persistFromDom();
      const r = applyRoomFacilityPickerFromDom();
      if (r && r.ok === false) {
        errEl().textContent = r.msg;
        return;
      }
      const err = validateRoom(state);
      if (err) {
        errEl().textContent = err;
        return;
      }
      const now = new Date().toISOString();
      const record = {
        id: state.id,
        place_id: state.place_id,
        room_code: state.room_code,
        room_name: state.room_name.trim(),
        room_type_id: state.room_type_id,
        room_trait_ids: [...state.room_trait_ids],
        bed_rows: state.bed_rows.map((r) => ({
          bed_type_id: r.bed_type_id,
          count: Math.max(1, parseInt(r.count, 10) || 1),
        })),
        standard_occupancy: state.standard_occupancy,
        max_occupancy: state.max_occupancy,
        facility_ids: [...state.facility_ids],
        featured_facility_ids: normalizeFeaturedFacilityIds(state.featured_facility_ids, state.facility_ids),
        room_size_sqm:
          String(sanitizeRoomSizeSqmInput(state.room_size_sqm || "")).trim() === ""
            ? ""
            : Number(String(sanitizeRoomSizeSqmInput(state.room_size_sqm)).trim()),
        policy_html: state.policy_html,
        guide_html: state.guide_html,
        extra_bed_enabled: state.extra_bed_enabled,
        extra_bed_max_count: state.extra_bed_enabled ? Math.max(0, parseInt(state.extra_bed_max_count, 10) || 0) : 0,
        extra_bed_fee: state.extra_bed_enabled ? Math.max(0, parseInt(String(state.extra_bed_fee).replace(/\D/g, ""), 10) || 0) : 0,
        occupant_extra_charge_enabled: state.occupant_extra_charge_enabled,
        occupant_extra_charge_per_person: state.occupant_extra_charge_enabled
          ? Math.max(0, parseInt(String(state.occupant_extra_charge_per_person).replace(/\D/g, ""), 10) || 0)
          : 0,
        occupant_extra_charge_settlement: normalizeRoomChargeSettlement(state.occupant_extra_charge_settlement),
        extra_bed_settlement: normalizeRoomChargeSettlement(state.extra_bed_settlement),
        visibility: state.visibility,
        image_meta: Array.isArray(state.image_meta) ? [...state.image_meta] : [],
        updated_at: now,
        updated_by: "admin",
      };
      let list = loadRooms();
      try {
        state.image_storage_warning = "";
        if (isEdit) {
          const idx = list.findIndex((x) => x.id === state.id);
          if (idx >= 0) {
            list[idx] = { ...list[idx], ...record };
            delete list[idx].initial_name_autofill_done;
          }
        } else {
          record.created_at = now;
          list.push(record);
        }
        saveRooms(list);
      } catch (e) {
        if (isStorageQuotaExceeded(e)) {
          state.image_storage_warning =
            "저장 용량 부족으로 등록에 실패했습니다. 이미지 영역(대표/추가)에서 파일을 줄이거나 삭제한 뒤 다시 저장해 주세요.";
          render();
          document.getElementById("rf_err").textContent =
            "이미지 영역에서 용량을 줄인 뒤 다시 저장해 주세요.";
          return;
        }
        throw e;
      }
      navigate(`rooms/place/${state.place_id}`);
    });
  }

  render();
}

// --- Products (§5.10 정책 반영, 판매상태 필드 없음) ---

function renderProductList(main, placeFilterId) {
  const places = loadPlaces();
  const rooms = loadRooms();
  const products = loadProducts();
  const placeById = new Map(places.map((p) => [p.id, p]));
  const roomById = new Map(rooms.map((r) => [r.id, r]));

  const roomIdsInPlace = new Set(
    placeFilterId ? rooms.filter((r) => r.place_id === placeFilterId).map((r) => r.id) : []
  );
  let filtered = products.slice();
  if (placeFilterId) {
    filtered = filtered.filter((p) => roomIdsInPlace.has(p.room_id));
  }
  filtered.sort((a, b) => (b.updated_at || "").localeCompare(a.updated_at || ""));

  const placeOpts =
    `<option value="">전체 숙소</option>` +
    places
      .map((p) => `<option value="${escapeAttr(p.id)}" ${placeFilterId === p.id ? "selected" : ""}>${escapeHtml(p.place_name)}</option>`)
      .join("");

  const firstRoomInPlace =
    placeFilterId && rooms.length ? rooms.find((r) => r.place_id === placeFilterId) : null;

  const typeLabel = (t) =>
    t === PRODUCT_TYPE.PACKAGE ? "패키지" : t === PRODUCT_TYPE.ROOM_ONLY ? "룸온리" : escapeHtml(String(t || "-"));

  const rows = filtered
    .map((p) => {
      const r = roomById.get(p.room_id);
      const pl = r ? placeById.get(r.place_id) : null;
      const invN = Array.isArray(p.inventory) ? p.inventory.length : 0;
      const vis = p.visibility === "N" ? "N" : "Y";
      const sale = `${escapeHtml(p.sale_start_date || "-")} ~ ${escapeHtml(p.sale_end_date || "-")}`;
      return `<tr>
        <td>${escapeHtml(p.product_code || "-")}</td>
        <td>${pl ? escapeHtml(pl.place_name) : "?"}</td>
        <td>${r ? escapeHtml(r.room_name || r.room_code || "-") : "?"}</td>
        <td>${typeLabel(p.product_type)}</td>
        <td>${escapeHtml(p.name || "-")}</td>
        <td><span class="room-yn">${escapeHtml(vis)}</span></td>
        <td>${sale}</td>
        <td>${escapeHtml(cancelPolicyLabel(p))}</td>
        <td>${invN}</td>
        <td>${formatDate(p.updated_at)}</td>
        <td>
          <button type="button" class="btn btn-ghost js-pf-edit" data-id="${escapeAttr(p.id)}">수정</button>
          <button type="button" class="btn btn-ghost js-pf-del" data-id="${escapeAttr(p.id)}">삭제</button>
        </td>
      </tr>`;
    })
    .join("");

  main.innerHTML = `
    <h2 class="page-title">상품관리</h2>
    <p class="page-desc">객실에 종속된 판매 SKU입니다. 저장소: <code>${escapeHtml(STORAGE_PRODUCTS)}</code> · 판매상태 필드 없음(노출·판매기간·재고·체크인허용·컷오프 조합, §5.10.3).</p>
    <div class="card">
      <div class="toolbar room-list-toolbar">
        <label class="field" style="flex-direction:row;align-items:center;gap:8px;margin:0;">
          <span style="font-weight:600;">숙소 필터</span>
          <select id="pf_place_filter" style="min-width:220px;">${placeOpts}</select>
        </label>
        ${
          firstRoomInPlace
            ? `<a href="#/products/new/room/${escapeAttr(firstRoomInPlace.id)}" class="btn">선택 숙소 첫 객실로 상품 등록</a>`
            : ""
        }
      </div>
      <div class="room-list-table-bar">
        <div class="room-list-table-bar-actions">
          <a href="#/products/new" class="btn btn-primary">상품 등록</a>
          <a href="#/rooms" class="btn">객실 목록</a>
        </div>
      </div>
      ${
        rooms.length === 0
          ? `<div class="empty"><strong>객실이 없습니다.</strong> 먼저 <a href="#/rooms/new">객실 등록</a> 후 상품을 만드세요.</div>`
          : filtered.length === 0
            ? `<div class="empty"><strong>상품이 없습니다.</strong>「상품 등록」으로 추가하세요.</div>`
            : `<div class="product-inv-wrap">
        <table class="room-list-table product-master-table">
          <thead><tr>
            <th>상품코드</th><th>숙소</th><th>객실</th><th>유형</th><th>상품명</th><th>노출</th>
            <th>판매기간</th><th>취소</th><th>일자행</th><th>수정일시</th><th></th>
          </tr></thead>
          <tbody>${rows}</tbody>
        </table>
      </div>`
      }
    </div>
  `;

  const pfSel = document.getElementById("pf_place_filter");
  if (pfSel) {
    pfSel.addEventListener("change", () => {
      const v = pfSel.value;
      if (v) navigate(`products/place/${v}`);
      else navigate("products");
    });
  }
  main.querySelectorAll(".js-pf-edit").forEach((btn) => {
    btn.addEventListener("click", () => navigate(`products/edit/${btn.getAttribute("data-id")}`));
  });
  main.querySelectorAll(".js-pf-del").forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = btn.getAttribute("data-id");
      if (!confirm("이 상품을 삭제할까요?")) return;
      saveProducts(loadProducts().filter((x) => x.id !== id));
      renderProductList(main, placeFilterId);
    });
  });
}

function validateProduct(st) {
  if (!st.room_id) return "객실을 선택하세요.";
  if (!String(st.name || "").trim()) return "상품명을 입력하세요.";
  const sd = String(st.sale_start_date || "").trim();
  const ed = String(st.sale_end_date || "").trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(sd) || !/^\d{4}-\d{2}-\d{2}$/.test(ed)) return "판매 시작일·종료일을 YYYY-MM-DD 형식으로 입력하세요.";
  if (sd > ed) return "판매 종료일은 판매 시작일 이상이어야 합니다.";
  if (st.cancel_policy_type === PRODUCT_CANCEL_POLICY.FREE_N_DAYS) {
    const n = parseInt(st.cancel_free_days_before, 10);
    if (Number.isNaN(n) || n < 0) return "무료취소 N일 전에는 0 이상의 정수를 입력하세요.";
  }
  const inv = Array.isArray(st.inventory) ? st.inventory : [];
  for (const row of inv) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(String(row.date || "").trim())) return `인벤토리에 잘못된 날짜가 있습니다: ${row.date}`;
  }
  const dates = inv.map((r) => r.date);
  if (new Set(dates).size !== dates.length) return "인벤토리에 동일 날짜가 중복되었습니다.";
  return "";
}

function renderProductForm(main, editId, presetRoomId) {
  const places = loadPlaces();
  const rooms = loadRooms().slice().sort((a, b) => (a.room_code || "").localeCompare(b.room_code || ""));
  const allProducts = loadProducts();
  const existing = editId ? allProducts.find((p) => p.id === editId) : null;
  const isEdit = !!existing;
  const today = new Date().toISOString().slice(0, 10);

  const migrateInv = (raw) => {
    if (!Array.isArray(raw)) return [];
    return raw.map((x) => normalizeInventoryRow(x)).filter((x) => /^\d{4}-\d{2}-\d{2}$/.test(x.date));
  };

  const initialInv = migrateInv(existing?.inventory);
  initialInv.sort((a, b) => a.date.localeCompare(b.date));
  const defaultCalMonth = initialInv.length ? initialInv[0].date.slice(0, 7) : today.slice(0, 7);
  const invInDefaultMonth = initialInv
    .filter((r) => r.date.startsWith(defaultCalMonth))
    .sort((a, b) => a.date.localeCompare(b.date));
  const defaultCalSelected = invInDefaultMonth[0]?.date || `${defaultCalMonth}-01`;
  const CANCEL_N_SELECT_MAX = 60;

  const state = {
    id: existing?.id || uid(),
    product_code: existing?.product_code || (isEdit ? "" : nextProductCode(allProducts)),
    room_id:
      existing?.room_id ||
      (presetRoomId && rooms.some((r) => r.id === presetRoomId) ? presetRoomId : rooms[0]?.id || ""),
    product_type:
      existing?.product_type === PRODUCT_TYPE.PACKAGE ? PRODUCT_TYPE.PACKAGE : PRODUCT_TYPE.ROOM_ONLY,
    name: existing?.name || "",
    description: existing?.description || "",
    guide_policy_html: existing?.guide_policy_html || "",
    visibility: existing?.visibility === "N" ? "N" : "Y",
    sale_start_date: String(existing?.sale_start_date || today).slice(0, 10),
    sale_end_date: String(
      existing?.sale_end_date || defaultSaleEndDateFromStart(existing?.sale_start_date || today)
    ).slice(0, 10),
    cancel_policy_type:
      existing?.cancel_policy_type === PRODUCT_CANCEL_POLICY.FREE_N_DAYS
        ? PRODUCT_CANCEL_POLICY.FREE_N_DAYS
        : PRODUCT_CANCEL_POLICY.NON_REFUNDABLE,
    cancel_free_days_before: existing?.cancel_free_days_before ?? 7,
    inventory: initialInv,
    /** 1: 상품·취소, 2: 재고·요금 */
    pfTab: 1,
    /** Tab2 데일리: list | calendar */
    dailyMode: "list",
    calMonth: defaultCalMonth,
    calSelected: defaultCalSelected,
  };
  if (state.cancel_free_days_before > CANCEL_N_SELECT_MAX) state.cancel_free_days_before = CANCEL_N_SELECT_MAX;

  const placeById = new Map(places.map((p) => [p.id, p]));
  const roomOpts = rooms
    .map((r) => {
      const pl = placeById.get(r.place_id);
      const label = `${r.room_code || ""} · ${r.room_name || ""}${pl ? " (" + pl.place_name + ")" : ""}`;
      return `<option value="${escapeAttr(r.id)}" ${state.room_id === r.id ? "selected" : ""}>${escapeHtml(label)}</option>`;
    })
    .join("");

  function sortInv() {
    state.inventory.sort((a, b) => a.date.localeCompare(b.date));
  }

  function adjustCalSelectedForMonth() {
    const ym = String(state.calMonth || "").trim();
    if (!/^\d{4}-\d{2}$/.test(ym)) return;
    if (state.calSelected && state.calSelected.startsWith(ym) && /^\d{4}-\d{2}-\d{2}$/.test(state.calSelected)) {
      return;
    }
    const inM = state.inventory
      .filter((r) => r.date.startsWith(ym))
      .sort((a, b) => a.date.localeCompare(b.date));
    state.calSelected = inM[0]?.date || `${ym}-01`;
  }

  function inventoryRowOrDefault(ymd) {
    const found = state.inventory.find((r) => r.date === ymd);
    if (found) return found;
    return normalizeInventoryRow({
      date: ymd,
      price: 0,
      stock: 0,
      checkin_allowed: true,
      min_stay_nights: 1,
      max_stay_nights: 30,
      cutoff_days_before_checkin: 0,
    });
  }

  /** 신규 일자로 오인되는 기본 패널 값(아직 inventory에 없는 날짜) */
  function isBlankInventoryTemplate(row) {
    return (
      row.price === 0 &&
      row.stock === 0 &&
      row.checkin_allowed === true &&
      row.min_stay_nights === 1 &&
      row.max_stay_nights === 30 &&
      row.cutoff_days_before_checkin === 0
    );
  }

  /**
   * 월 캘린더 우측 패널 → state.inventory 병합(해당 일자만).
   * `force`: true면 「이 날짜에 반영」— 기본값만 있어도 행 생성.
   * 그 외에는 해당 날짜가 기존에 없고 패널이 빈 템플릿이면 병합하지 않음(선택일만 보고 생기는 유령 행 방지).
   */
  function flushCalendarPanelToInv(opts) {
    const force = !!(opts && opts.force);
    const d = String(document.getElementById("pf_cal_sel_date")?.value || "").trim();
    if (!/^\d{4}-\d{2}-\d{2}$/.test(d)) return;
    const price = Math.max(
      0,
      parseInt(String(document.getElementById("pf_cal_price")?.value || "").replace(/\D/g, ""), 10) || 0
    );
    const stock = Math.max(
      0,
      parseInt(String(document.getElementById("pf_cal_stock")?.value || "").replace(/\D/g, ""), 10) || 0
    );
    const checkin_allowed = !!document.getElementById("pf_cal_allow")?.checked;
    const min_stay_nights = Math.max(1, parseInt(document.getElementById("pf_cal_min")?.value, 10) || 1);
    const max_stay_nights = Math.max(
      min_stay_nights,
      parseInt(document.getElementById("pf_cal_max")?.value, 10) || 30
    );
    const cutoff_days_before_checkin = Math.max(
      0,
      parseInt(String(document.getElementById("pf_cal_cutoff")?.value || "").replace(/\D/g, ""), 10) || 0
    );
    const map = invMapFromRows(state.inventory);
    const existedBefore = map.has(d);
    const normalized = normalizeInventoryRow({
      date: d,
      price,
      stock,
      checkin_allowed,
      min_stay_nights,
      max_stay_nights,
      cutoff_days_before_checkin,
    });
    if (!force && !existedBefore && isBlankInventoryTemplate(normalized)) {
      return;
    }
    map.set(d, normalized);
    state.inventory = [...map.values()].sort((a, b) => a.date.localeCompare(b.date));
  }

  function persistInventoryFromDom() {
    const tb = document.getElementById("pf_inv_tbody");
    if (tb) {
      const next = [];
      tb.querySelectorAll("tr").forEach((tr) => {
        if (tr.querySelector("td.muted")) return;
        const dateInp = tr.querySelector(".js-inv-date-inp");
        if (!dateInp) return;
        const date = String(dateInp.value || "").trim();
        const price = Math.max(0, parseInt(tr.querySelector(".js-inv-price")?.value.replace(/\D/g, "") || "0", 10) || 0);
        const stock = Math.max(0, parseInt(tr.querySelector(".js-inv-stock")?.value.replace(/\D/g, "") || "0", 10) || 0);
        const checkin_allowed = !!tr.querySelector(".js-inv-allow")?.checked;
        const min_stay_nights = Math.max(1, parseInt(tr.querySelector(".js-inv-min")?.value, 10) || 1);
        const max_stay_nights = Math.max(
          min_stay_nights,
          parseInt(tr.querySelector(".js-inv-max")?.value, 10) || 30
        );
        const cutoff_days_before_checkin = Math.max(
          0,
          parseInt(String(tr.querySelector(".js-inv-cutoff")?.value || "").replace(/\D/g, ""), 10) || 0
        );
        next.push(
          normalizeInventoryRow({
            date,
            price,
            stock,
            checkin_allowed,
            min_stay_nights,
            max_stay_nights,
            cutoff_days_before_checkin,
          })
        );
      });
      state.inventory = next;
      return;
    }
  }

  /** 탭 1 마스터·취소 — DOM → state (탭이 숨겨져 있어도 요소는 DOM에 남음) */
  function persistMasterFromDom() {
    const el = (id) => document.getElementById(id);
    const room = el("pf_room");
    if (room) state.room_id = String(room.value || "");
    const typ = el("pf_type");
    if (typ) state.product_type = typ.value || PRODUCT_TYPE.ROOM_ONLY;
    const vis = el("pf_vis");
    if (vis) state.visibility = vis.value === "N" ? "N" : "Y";
    const ss = el("pf_sale_s");
    if (ss) state.sale_start_date = String(ss.value || "").slice(0, 10);
    const se = el("pf_sale_e");
    if (se) state.sale_end_date = String(se.value || "").slice(0, 10);
    const nm = el("pf_name");
    if (nm) state.name = String(nm.value || "").trim();
    const desc = el("pf_desc");
    if (desc) state.description = desc.value || "";
    const guide = el("pf_guide");
    if (guide) state.guide_policy_html = guide.value || "";
    const ct = el("pf_cancel_t");
    if (ct) state.cancel_policy_type = ct.value || PRODUCT_CANCEL_POLICY.NON_REFUNDABLE;
    const cn = el("pf_cancel_n");
    if (cn) state.cancel_free_days_before = Math.max(0, parseInt(String(cn.value), 10) || 0);
  }

  function syncAllFromDomBeforeRender() {
    persistInventoryFromDom();
    if (state.dailyMode === "calendar" && document.getElementById("pf_cal_sel_date")) {
      flushCalendarPanelToInv();
    }
    persistMasterFromDom();
  }

  function invRowsHtml() {
    sortInv();
    if (!state.inventory.length) {
      return `<tr><td colspan="8" class="muted" style="padding:12px;">일자별 행이 없습니다.「행 추가」또는「구간 일괄 적용」을 사용하세요.</td></tr>`;
    }
    return state.inventory
      .map(
        (row) => `<tr class="js-inv-row">
        <td><input type="date" class="js-inv-date-inp" value="${escapeAttr(row.date)}" /></td>
        <td><input type="text" class="js-inv-price" inputmode="numeric" value="${escapeAttr(String(row.price))}" style="width:100px;" /></td>
        <td><input type="text" class="js-inv-stock" inputmode="numeric" value="${escapeAttr(String(row.stock))}" style="width:72px;" /></td>
        <td style="text-align:center;"><input type="checkbox" class="js-inv-allow" ${row.checkin_allowed ? "checked" : ""} title="체크인 허용" /></td>
        <td><input type="number" class="js-inv-min" min="1" max="365" value="${escapeAttr(String(row.min_stay_nights))}" style="width:64px;" /></td>
        <td><input type="number" class="js-inv-max" min="1" max="365" value="${escapeAttr(String(row.max_stay_nights))}" style="width:64px;" /></td>
        <td><input type="text" class="js-inv-cutoff" inputmode="numeric" value="${escapeAttr(String(row.cutoff_days_before_checkin))}" style="width:56px;" title="체크인 N일 전 00:00부터 예약 불가" /></td>
        <td><button type="button" class="btn btn-ghost js-inv-remove" aria-label="행 삭제">×</button></td>
      </tr>`
      )
      .join("");
  }

  function calGridHtml() {
    const cells = calendarMonthCellDates(state.calMonth);
    const map = invMapFromRows(state.inventory);
    const sel = state.calSelected;
    const wdLabels = ["일", "월", "화", "수", "목", "금", "토"];
    const head = wdLabels.map((w) => `<div class="pf-cal-wd">${w}</div>`).join("");
    const body = cells
      .map((ymd) => {
        const inMonth = ymd.slice(0, 7) === state.calMonth;
        const row = map.get(ymd);
        const dow = new Date(ymd + "T12:00:00").getDay();
        const wkend = dow === 0 || dow === 6;
        const closed = row && (!row.checkin_allowed || row.stock <= 0);
        const cls = [
          "pf-cal-cell",
          !inMonth ? "pf-cal-cell--oom" : "",
          wkend && inMonth ? "pf-cal-cell--wkend" : "",
          closed && inMonth ? "pf-cal-cell--closed" : "",
          sel === ymd ? "pf-cal-cell--selected" : "",
        ]
          .filter(Boolean)
          .join(" ");
        const dayNum = parseInt(ymd.slice(8), 10);
        const meta = row ? `${row.stock} / ${row.price}` : "—";
        return `<button type="button" class="${cls}" data-cal-d="${escapeAttr(ymd)}">
      <span class="pf-cal-dn">${dayNum}</span>
      <span class="pf-cal-meta">${escapeHtml(meta)}</span>
    </button>`;
      })
      .join("");
    return `<div class="pf-cal-wd-row">${head}</div><div class="pf-cal-cells">${body}</div>`;
  }

  function calAsideHtml() {
    const r = inventoryRowOrDefault(state.calSelected);
    return `
    <h4 class="pf-cal-aside-title">선택일 편집</h4>
    <p class="field-hint" style="margin-top:0;">${escapeHtml(state.calSelected)} · 「이 날짜에 반영」 또는 다른 날짜를 누르면 입력이 저장됩니다.</p>
    <input type="hidden" id="pf_cal_sel_date" value="${escapeAttr(state.calSelected)}" />
    <label class="field"><span>판매가</span>
      <input type="text" id="pf_cal_price" inputmode="numeric" value="${escapeAttr(String(r.price))}" />
    </label>
    <label class="field"><span>재고</span>
      <input type="text" id="pf_cal_stock" inputmode="numeric" value="${escapeAttr(String(r.stock))}" style="max-width:120px;" />
    </label>
    <label class="row-inline" style="gap:8px;"><input type="checkbox" id="pf_cal_allow" ${r.checkin_allowed ? "checked" : ""} /><span>체크인 허용</span></label>
    <div class="form-grid">
      <label class="field"><span>최소 숙박</span>
        <input type="number" id="pf_cal_min" min="1" max="365" value="${escapeAttr(String(r.min_stay_nights))}" />
      </label>
      <label class="field"><span>최대 숙박</span>
        <input type="number" id="pf_cal_max" min="1" max="365" value="${escapeAttr(String(r.max_stay_nights))}" />
      </label>
    </div>
    <label class="field"><span>컷오프 N (체크인 N일 전 00:00)</span>
      <input type="text" id="pf_cal_cutoff" inputmode="numeric" value="${escapeAttr(String(r.cutoff_days_before_checkin))}" style="max-width:120px;" />
    </label>
    <div style="margin-top:12px;display:flex;gap:8px;flex-wrap:wrap;">
      <button type="button" class="btn btn-primary" id="pf_cal_apply">이 날짜에 반영</button>
    </div>`;
  }

  function render() {
    const room = rooms.find((r) => r.id === state.room_id);
    const placeId = room?.place_id || "";
    const pkgDescHint =
      state.product_type === PRODUCT_TYPE.PACKAGE
        ? `<p class="field-hint" style="margin-top:-6px;">패키지 포함 내역·구성은 <strong>상품 설명</strong>에 함께 적어 주세요.</p>`
        : "";
    const nClamped = Math.min(CANCEL_N_SELECT_MAX, Math.max(0, parseInt(String(state.cancel_free_days_before), 10) || 0));
    const cancelNOptions = Array.from({ length: CANCEL_N_SELECT_MAX + 1 }, (_, i) => {
      const sel = i === nClamped ? "selected" : "";
      return `<option value="${i}" ${sel}>${i}</option>`;
    }).join("");

    const listDailyBlock = `
        <div class="toolbar" style="margin:12px 0;">
          <button type="button" class="btn" id="pf_inv_add">행 추가 (날짜 직접 수정 가능)</button>
        </div>
        <div class="product-inv-wrap">
          <table class="room-list-table product-inv-table">
            <thead><tr>
              <th>날짜(체크인)</th><th>판매가</th><th>재고</th><th>체크인허용</th><th>최소박</th><th>최대박</th><th>컷오프N</th><th></th>
            </tr></thead>
            <tbody id="pf_inv_tbody">${invRowsHtml()}</tbody>
          </table>
        </div>`;

    const calendarDailyBlock = `
        <div class="toolbar" style="margin:12px 0;flex-wrap:wrap;gap:8px;">
          <button type="button" class="btn" id="pf_inv_add">행 추가 (다음 날짜)</button>
        </div>
        <div class="pf-cal-layout">
          <div class="pf-cal-left">
            <div class="pf-cal-toolbar">
              <button type="button" class="btn" id="pf_cal_prev" aria-label="이전 달">◀</button>
              <input type="month" id="pf_cal_month_input" value="${escapeAttr(state.calMonth)}" />
              <button type="button" class="btn" id="pf_cal_next" aria-label="다음 달">▶</button>
            </div>
            <p class="pf-cal-legend"><span class="pf-legend-swatch pf-legend-swatch--closed"></span> 재고 0 또는 체크인 불가 · 주말 열은 배경 구분</p>
            <div id="pf_cal_grid" class="pf-cal-grid-wrap">${calGridHtml()}</div>
          </div>
          <aside class="pf-cal-aside" id="pf_cal_detail">${calAsideHtml()}</aside>
        </div>`;

    main.innerHTML = `
      <h2 class="page-title">${isEdit ? "상품 수정" : "상품 등록"}</h2>
      <p class="page-desc">코드 <code>${escapeHtml(state.product_code)}</code> · 객실 1개당 상품 개수 제한 없음 · 취소정책은 상품만 적용(§5.10) · <strong>탭 2</strong>에서 일자별 재고·요금을 목록형 또는 월 캘린더로 관리</p>

      <div class="pf-form-tabs" role="tablist" aria-label="상품 등록 단계">
        <button type="button" role="tab" class="pf-tab ${state.pfTab === 1 ? "is-active" : ""}" id="pf_tab1" aria-selected="${state.pfTab === 1 ? "true" : "false"}">1. 상품·취소</button>
        <button type="button" role="tab" class="pf-tab ${state.pfTab === 2 ? "is-active" : ""}" id="pf_tab2" aria-selected="${state.pfTab === 2 ? "true" : "false"}">2. 재고·요금</button>
      </div>

      <div id="pf_panel1" class="pf-tab-panel" style="display:${state.pfTab === 1 ? "block" : "none"}">
      <div class="card">
        <h3 class="section-title">상품 마스터</h3>
        <div class="form-grid">
          <label class="field"><span>객실 (필수)</span>
            <select id="pf_room">${roomOpts || '<option value="">객실 없음</option>'}</select>
          </label>
          <label class="field"><span>상품 유형</span>
            <select id="pf_type">
              <option value="${PRODUCT_TYPE.ROOM_ONLY}" ${state.product_type === PRODUCT_TYPE.ROOM_ONLY ? "selected" : ""}>룸온리 (${PRODUCT_TYPE.ROOM_ONLY})</option>
              <option value="${PRODUCT_TYPE.PACKAGE}" ${state.product_type === PRODUCT_TYPE.PACKAGE ? "selected" : ""}>패키지 (${PRODUCT_TYPE.PACKAGE})</option>
            </select>
          </label>
          <label class="field"><span>노출 여부</span>
            <select id="pf_vis">
              <option value="Y" ${state.visibility === "Y" ? "selected" : ""}>Y (노출)</option>
              <option value="N" ${state.visibility === "N" ? "selected" : ""}>N (비노출)</option>
            </select>
          </label>
          <label class="field"><span>판매 시작일 (포함)</span>
            <input type="date" id="pf_sale_s" value="${escapeAttr(state.sale_start_date)}" />
          </label>
          <label class="field"><span>판매 종료일 (포함)</span>
            <input type="date" id="pf_sale_e" value="${escapeAttr(state.sale_end_date)}" />
          </label>
        </div>
        <p class="field-hint">판매기간은 <strong>구매(예약 결제) 가능 시점</strong>이며, 투숙 체크인일과 다릅니다.</p>
        <label class="field"><span>상품명</span>
          <input type="text" id="pf_name" value="${escapeAttr(state.name)}" placeholder="예: 조식 패키지 디럭스" />
        </label>
        <label class="field"><span>상품 설명 (plain, 줄바꿈 허용)</span>
          <textarea id="pf_desc" rows="4" placeholder="룸온리·패키지 모두 여기에 요약·포함 내역을 적을 수 있습니다.">${escapeForTextarea(state.description)}</textarea>
        </label>
        ${pkgDescHint}
        <label class="field"><span>상품 안내 / 정책 (HTML·이미지 붙여넣기)</span>
          <textarea id="pf_guide" class="js-image-paste" rows="6">${escapeForTextarea(state.guide_policy_html)}</textarea>
        </label>
      </div>

      <div class="card">
        <h3 class="section-title">취소 정책 (상품)</h3>
        <label class="field"><span>유형</span>
          <select id="pf_cancel_t">
            <option value="${PRODUCT_CANCEL_POLICY.FREE_N_DAYS}" ${state.cancel_policy_type === PRODUCT_CANCEL_POLICY.FREE_N_DAYS ? "selected" : ""}>체크인 기준 N일 전 무료취소</option>
            <option value="${PRODUCT_CANCEL_POLICY.NON_REFUNDABLE}" ${state.cancel_policy_type === PRODUCT_CANCEL_POLICY.NON_REFUNDABLE ? "selected" : ""}>취소 및 환불불가</option>
          </select>
        </label>
        <div class="pf-cancel-n-row">
          <label class="field pf-cancel-n-field">
            <span>무료취소 N일 전</span>
            <select id="pf_cancel_n" class="pf-cancel-n-select" aria-label="체크인 며칠 전까지 무료취소" ${
              state.cancel_policy_type === PRODUCT_CANCEL_POLICY.NON_REFUNDABLE ? "disabled" : ""
            }>${cancelNOptions}</select>
          </label>
          <span class="pf-cancel-n-suffix muted">체크인 당일=0, 하루 전=1 …</span>
        </div>
      </div>
      </div>

      <div id="pf_panel2" class="pf-tab-panel" style="display:${state.pfTab === 2 ? "block" : "none"}">
      <div class="card">
        <h3 class="section-title">재고·가격 (일자별, 체크인 1박 기준)</h3>
        <p class="field-hint">컷오프: 체크인 <strong>N일 전 00:00</strong>부터 해당 체크인일 예약 불가(프런트). <code>체크인 허용</code> 해제 시 해당 일자는 체크인 시작일로 예약 불가(재고와 별개).</p>
        <div class="product-bulk-bar">
          <span class="product-bulk-title">구간 일괄 적용</span>
          <input type="date" id="pf_bulk_a" />
          <span>~</span>
          <input type="date" id="pf_bulk_b" />
          <input type="text" id="pf_bulk_price" placeholder="판매가" inputmode="numeric" style="width:90px;" />
          <input type="text" id="pf_bulk_stock" placeholder="재고" inputmode="numeric" style="width:64px;" />
          <label class="row-inline" style="gap:6px;"><input type="checkbox" id="pf_bulk_allow" checked /><span>체크인허용</span></label>
          <input type="number" id="pf_bulk_min" min="1" value="1" style="width:56px;" title="최소숙박" />
          <input type="number" id="pf_bulk_max" min="1" value="30" style="width:56px;" title="최대숙박" />
          <input type="text" id="pf_bulk_cut" placeholder="컷오프N" inputmode="numeric" style="width:64px;" />
          <button type="button" class="btn btn-primary" id="pf_bulk_go">적용</button>
        </div>
        <div class="pf-daily-mode-bar">
          <span class="product-bulk-title">데일리 화면</span>
          <button type="button" class="btn ${state.dailyMode === "list" ? "btn-primary" : ""}" id="pf_dm_list">목록형</button>
          <button type="button" class="btn ${state.dailyMode === "calendar" ? "btn-primary" : ""}" id="pf_dm_cal">월 캘린더</button>
        </div>
        ${state.dailyMode === "list" ? listDailyBlock : calendarDailyBlock}
      </div>
      </div>

      <div class="wizard-actions wizard-actions--sticky">
        <a href="#/products${placeId ? `/place/${placeId}` : ""}" class="btn">목록</a>
        <div class="wizard-actions-trailing">
          <a href="#/products${placeId ? `/place/${placeId}` : ""}" class="btn">취소</a>
          <button type="button" class="btn btn-primary" id="pf_save">${isEdit ? "저장" : "등록"}</button>
        </div>
      </div>
      <p id="pf_err" class="error" style="min-height:20px;"></p>
    `;

    const errEl = () => document.getElementById("pf_err");

    document.getElementById("pf_tab1")?.addEventListener("click", () => {
      syncAllFromDomBeforeRender();
      state.pfTab = 1;
      errEl().textContent = "";
      render();
    });
    document.getElementById("pf_tab2")?.addEventListener("click", () => {
      syncAllFromDomBeforeRender();
      state.pfTab = 2;
      errEl().textContent = "";
      render();
    });

    document.getElementById("pf_dm_list")?.addEventListener("click", () => {
      syncAllFromDomBeforeRender();
      state.dailyMode = "list";
      errEl().textContent = "";
      render();
    });
    document.getElementById("pf_dm_cal")?.addEventListener("click", () => {
      syncAllFromDomBeforeRender();
      state.dailyMode = "calendar";
      if (!/^\d{4}-\d{2}$/.test(state.calMonth)) state.calMonth = today.slice(0, 7);
      adjustCalSelectedForMonth();
      errEl().textContent = "";
      render();
    });

    document.getElementById("pf_cal_prev")?.addEventListener("click", () => {
      syncAllFromDomBeforeRender();
      const [Y, M] = state.calMonth.split("-").map((x) => parseInt(x, 10));
      const d = new Date(Y, M - 2, 1);
      state.calMonth = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      adjustCalSelectedForMonth();
      errEl().textContent = "";
      render();
    });
    document.getElementById("pf_cal_next")?.addEventListener("click", () => {
      syncAllFromDomBeforeRender();
      const [Y, M] = state.calMonth.split("-").map((x) => parseInt(x, 10));
      const d = new Date(Y, M, 1);
      state.calMonth = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      adjustCalSelectedForMonth();
      errEl().textContent = "";
      render();
    });
    document.getElementById("pf_cal_month_input")?.addEventListener("change", (e) => {
      syncAllFromDomBeforeRender();
      const v = String(e.target.value || "").trim();
      if (/^\d{4}-\d{2}$/.test(v)) state.calMonth = v;
      adjustCalSelectedForMonth();
      errEl().textContent = "";
      render();
    });

    document.getElementById("pf_cal_grid")?.addEventListener("click", (e) => {
      const btn = e.target.closest("[data-cal-d]");
      if (!btn) return;
      syncAllFromDomBeforeRender();
      state.calSelected = btn.getAttribute("data-cal-d") || state.calSelected;
      errEl().textContent = "";
      render();
    });

    document.getElementById("pf_cal_apply")?.addEventListener("click", () => {
      syncAllFromDomBeforeRender();
      flushCalendarPanelToInv({ force: true });
      errEl().textContent = "";
      render();
    });

    document.getElementById("pf_room")?.addEventListener("change", () => {
      syncAllFromDomBeforeRender();
      errEl().textContent = "";
      render();
    });
    document.getElementById("pf_type")?.addEventListener("change", () => {
      syncAllFromDomBeforeRender();
      errEl().textContent = "";
      render();
    });
    document.getElementById("pf_cancel_t")?.addEventListener("change", () => {
      syncAllFromDomBeforeRender();
      errEl().textContent = "";
      render();
    });

    main.querySelectorAll("textarea.js-image-paste").forEach((ta) => attachClipboardImagePaste(ta));

    document.getElementById("pf_bulk_go")?.addEventListener("click", () => {
      syncAllFromDomBeforeRender();
      const a = document.getElementById("pf_bulk_a")?.value;
      const b = document.getElementById("pf_bulk_b")?.value;
      const price = Math.max(0, parseInt(String(document.getElementById("pf_bulk_price")?.value || "").replace(/\D/g, ""), 10) || 0);
      const stock = Math.max(0, parseInt(String(document.getElementById("pf_bulk_stock")?.value || "").replace(/\D/g, ""), 10) || 0);
      const checkin_allowed = !!document.getElementById("pf_bulk_allow")?.checked;
      const min_stay_nights = Math.max(1, parseInt(document.getElementById("pf_bulk_min")?.value, 10) || 1);
      const max_stay_nights = Math.max(
        min_stay_nights,
        parseInt(document.getElementById("pf_bulk_max")?.value, 10) || 30
      );
      const cutoff_days_before_checkin = Math.max(
        0,
        parseInt(String(document.getElementById("pf_bulk_cut")?.value || "").replace(/\D/g, ""), 10) || 0
      );
      const map = new Map(state.inventory.map((r) => [r.date, { ...r }]));
      eachDateInclusive(a, b, (ymd) => {
        map.set(ymd, {
          date: ymd,
          price,
          stock,
          checkin_allowed,
          min_stay_nights,
          max_stay_nights,
          cutoff_days_before_checkin,
        });
      });
      state.inventory = [...map.values()].map((x) => normalizeInventoryRow(x));
      errEl().textContent = "";
      render();
    });

    document.getElementById("pf_inv_add")?.addEventListener("click", () => {
      syncAllFromDomBeforeRender();
      let next = today;
      if (state.inventory.length) {
        const last = [...state.inventory].sort((x, y) => y.date.localeCompare(x.date))[0].date;
        const d = new Date(last + "T12:00:00");
        d.setDate(d.getDate() + 1);
        next = d.toISOString().slice(0, 10);
      }
      if (!state.inventory.some((r) => r.date === next)) {
        state.inventory.push(
          normalizeInventoryRow({
            date: next,
            price: 0,
            stock: 0,
            checkin_allowed: true,
            min_stay_nights: 1,
            max_stay_nights: 30,
            cutoff_days_before_checkin: 0,
          })
        );
      }
      errEl().textContent = "";
      render();
    });

    document.getElementById("pf_inv_tbody")?.addEventListener("click", (e) => {
      const rm = e.target.closest(".js-inv-remove");
      if (!rm) return;
      const tr = rm.closest("tr");
      const ds = String(tr?.querySelector(".js-inv-date-inp")?.value || "").trim();
      syncAllFromDomBeforeRender();
      state.inventory = ds ? state.inventory.filter((x) => x.date !== ds) : state.inventory;
      errEl().textContent = "";
      render();
    });

    document.getElementById("pf_save")?.addEventListener("click", () => {
      syncAllFromDomBeforeRender();

      const err = validateProduct(state);
      if (err) {
        errEl().textContent = err;
        return;
      }
      sortInv();
      const now = new Date().toISOString();
      const record = {
        id: state.id,
        product_code: state.product_code,
        room_id: state.room_id,
        product_type: state.product_type,
        name: state.name,
        description: state.description,
        package_inclusions_text: "",
        guide_policy_html: state.guide_policy_html,
        visibility: state.visibility,
        sale_start_date: state.sale_start_date,
        sale_end_date: state.sale_end_date,
        cancel_policy_type: state.cancel_policy_type,
        cancel_free_days_before:
          state.cancel_policy_type === PRODUCT_CANCEL_POLICY.FREE_N_DAYS ? state.cancel_free_days_before : null,
        inventory: state.inventory.map((r) => normalizeInventoryRow(r)),
        updated_at: now,
        updated_by: "admin",
      };
      let list = loadProducts();
      try {
        if (isEdit) {
          const idx = list.findIndex((x) => x.id === state.id);
          if (idx >= 0) list[idx] = { ...list[idx], ...record };
          else list.push(record);
        } else {
          record.created_at = now;
          list.push(record);
        }
        saveProducts(list);
      } catch (e) {
        if (isStorageQuotaExceeded(e)) {
          errEl().textContent = "브라우저 저장공간이 부족합니다. 안내 HTML·이미지를 줄여 주세요.";
          return;
        }
        throw e;
      }
      const r = rooms.find((x) => x.id === state.room_id);
      navigate(r ? `products/place/${r.place_id}` : "products");
    });
  }

  render();
}


/** textarea 본문 삽입 시 파서 깨짐 방지(그 외는 원문 유지 — HTML·이미지 붙여넣기 대응) */
function escapeForTextarea(s) {
  return String(s ?? "").replace(/<\/textarea/gi, "<\\/textarea");
}

function escapeHtml(s) {
  return String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function escapeAttr(s) {
  return escapeHtml(s).replace(/'/g, "&#39;");
}

function buildImageMetaWithDataUrl(file, maxMB = PLACE_IMAGE_MAX_MB) {
  return new Promise((resolve, reject) => {
    if (!file) return resolve(null);
    const maxBytes = maxMB * 1024 * 1024;
    if (file.size > maxBytes) {
      return reject(
        new Error(`이미지 '${file.name}' 용량이 ${maxMB}MB를 초과합니다.`)
      );
    }
    const reader = new FileReader();
    reader.onload = () => {
      resolve({
        name: file.name,
        size: file.size,
        type: file.type,
        data_url: String(reader.result || ""),
      });
    };
    reader.onerror = () => reject(new Error(`이미지 '${file.name}' 읽기에 실패했습니다.`));
    reader.readAsDataURL(file);
  });
}

/** textarea: 클립보드 이미지 → Data URL img 태그 삽입 (프로토타입) */
const CLIPBOARD_IMAGE_PASTE_MAX_MB = 2;

function insertAtCursor(textarea, text) {
  const start = textarea.selectionStart ?? textarea.value.length;
  const end = textarea.selectionEnd ?? textarea.value.length;
  const val = textarea.value;
  textarea.value = val.slice(0, start) + text + val.slice(end);
  const pos = start + text.length;
  textarea.selectionStart = textarea.selectionEnd = pos;
  textarea.focus();
}

function attachClipboardImagePaste(textarea) {
  textarea.addEventListener("paste", (e) => {
    const items = e.clipboardData?.items;
    if (!items?.length) return;
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (!item.type.startsWith("image/")) continue;
      const file = item.getAsFile();
      if (!file) continue;
      e.preventDefault();
      const maxBytes = CLIPBOARD_IMAGE_PASTE_MAX_MB * 1024 * 1024;
      if (file.size > maxBytes) {
        alert(
          `이미지 용량이 ${CLIPBOARD_IMAGE_PASTE_MAX_MB}MB를 초과합니다. 크기를 줄이거나 이미지 파일 선택으로 추가해 주세요.`
        );
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        const raw = String(reader.result);
        const safeSrc = raw.replace(/"/g, "&quot;");
        const img = `\n<img src="${safeSrc}" alt="" style="max-width:100%;height:auto;display:block;" />\n`;
        insertAtCursor(textarea, img);
      };
      reader.readAsDataURL(file);
      return;
    }
  });
}

window.addEventListener("DOMContentLoaded", () => {
  ensureFacilityStores();
  ensureRoomMasters();
  boot();
});
