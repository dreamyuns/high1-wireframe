/**
 * High1 admin prototype v0.5 — localStorage only
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
const STORAGE_MARGIN_MASTER = "high1_margin_master_v1"; // 공통관리 마진 마스터 (RM_TYP_CD별 일자별 마진 디폴트)
const STORAGE_MAIN_HERO = "high1_main_hero_v1"; // 화면관리 > 메인관리 히어로 슬라이드
const STORAGE_MAIN_HERO_CFG = "high1_main_hero_cfg_v1"; // 히어로 전역 설정(자동슬라이드·주기)
const STORAGE_MAIN_SECTION = "high1_main_section_v1"; // 추천 섹션

/* ── 티켓 도메인 (Phase 1: S17 카테고리 · S13 스펙 · S14 상품) ── */
const STORAGE_TICKET_CATEGORIES = "high1_ticket_categories_v1"; // S17 티켓 카테고리(최대 2뎁스)
const STORAGE_COUPON_SPECS = "high1_coupon_specs_v1"; // S13 쿠폰 스펙(쿠폰ID+레벨 행)
const STORAGE_TICKET_PRODUCTS = "high1_ticket_products_v1"; // S14 티켓 상품
const STORAGE_TICKET_MARGIN_MASTER = "high1_ticket_margin_master_v1"; // S11 티켓 탭 마진(쿠폰ID 단위) — 신규-4 제안 키
const STORAGE_TICKET_UPLOAD_HISTORY = "high1_ticket_upload_history_v1"; // S13 탭B 업로드 이력
const STORAGE_TICKET_SEED_VER = "high1_ticket_seed_ver"; // 더미 시드 버전 마커 (값 바뀌면 재주입)
const TICKET_SEED_VER = 12; // 더미 갱신 시 +1 → 카테고리·스펙·마진·상품 재주입(이력 제외)

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

/**
 * PMS 동기화 더미 데이터 (MVP 숙소목록 캡쳐 기준 7개).
 * 프로토타입에는 실제 PMS API가 없으므로, [PMS 동기화] 클릭 시 이 셋을 주입/갱신하여 시뮬레이션한다.
 * PMS 수신 필드: place_code / place_name(한글) / category / sub_place / check_in/out / image 수.
 * 관리자 보완 필드(_en, guide/policy_html, facility_ids, extra_fee_notes 등)는 재동기화 시 보존.
 */
const PMS_DUMMY_PLACES_SEED = [
  { place_code: "PL-DAB431", place_name: "메인타워", category: "HOTEL", sub_place: "", check_in_time: "15:00", check_out_time: "11:00", image_count: 3, visibility: "HIDE" },
  { place_code: "PL-A17411", place_name: "마운틴PLUS콘도", category: "CONDO", sub_place: "", check_in_time: "15:00", check_out_time: "11:00", image_count: 0, visibility: "HIDE" },
  { place_code: "PL-96903C", place_name: "컨벤션타워", category: "HOTEL", sub_place: "grand_convention", check_in_time: "15:00", check_out_time: "11:00", image_count: 4, visibility: "SHOW" },
  { place_code: "PL-B66F6A", place_name: "마운틴콘도", category: "CONDO", sub_place: "mountain", check_in_time: "15:00", check_out_time: "11:00", image_count: 3, visibility: "SHOW" },
  { place_code: "PL-C07303", place_name: "밸리콘도", category: "CONDO", sub_place: "valley", check_in_time: "15:00", check_out_time: "11:00", image_count: 3, visibility: "SHOW" },
  { place_code: "PL-4F7F0D", place_name: "힐콘도", category: "CONDO", sub_place: "hill", check_in_time: "15:00", check_out_time: "11:00", image_count: 3, visibility: "SHOW" },
  { place_code: "PL-7064E0", place_name: "하이원팰리스", category: "HOTEL", sub_place: "palace", check_in_time: "15:00", check_out_time: "11:00", image_count: 4, visibility: "SHOW" },
];

/** AI 번역(더미) — PMS는 한글명만 주므로, 미입력 영문명을 자동 채움 시뮬레이션 */
const PLACE_NAME_EN_MAP = {
  "메인타워": "Main Tower",
  "마운틴PLUS콘도": "Mountain PLUS Condo",
  "컨벤션타워": "Convention Tower",
  "마운틴콘도": "Mountain Condo",
  "밸리콘도": "Valley Condo",
  "힐콘도": "Hill Condo",
  "하이원팰리스": "High1 Palace",
};

/** [PMS 동기화/갱신] — 더미 PMS 숙소를 주입/갱신. 기존 관리자 보완 필드는 보존. */
function syncPmsPlaces() {
  const existing = loadPlaces();
  const now = new Date().toISOString();
  const merged = PMS_DUMMY_PLACES_SEED.map((seed) => {
    const prev = existing.find((p) => p.place_code === seed.place_code);
    return {
      // 관리자 보완 필드 보존 (재동기화 시 유지)
      id: prev?.id || uid(),
      place_name_en: prev?.place_name_en || "",
      address: prev?.address || "",
      address_en: prev?.address_en || "",
      location_detail: prev?.location_detail || "",
      guide_html: prev?.guide_html || "",
      guide_html_en: prev?.guide_html_en || "",
      policy_html: prev?.policy_html || "",
      policy_html_en: prev?.policy_html_en || "",
      facility_ids: prev?.facility_ids || [],
      featured_facility_ids: prev?.featured_facility_ids || [],
      category_facility_text: prev?.category_facility_text || "",
      category_facility_text_en: prev?.category_facility_text_en || "",
      extra_fee_notes: prev?.extra_fee_notes || [],
      created_at: prev?.created_at || now,
      // PMS 수신 필드 (갱신)
      place_code: seed.place_code,
      place_name: seed.place_name,
      category: seed.category,
      sub_place: seed.sub_place,
      check_in_time: seed.check_in_time,
      check_out_time: seed.check_out_time,
      visibility: prev ? prev.visibility : seed.visibility,
      image_meta: prev?.image_meta && prev.image_meta.length ? prev.image_meta : Array.from({ length: seed.image_count }, () => ({ from_pms: true })),
      updated_at: now,
      updated_by: "PMS 동기화",
    };
  });
  savePlaces(merged);
  return merged.length;
}

/** [비영문 이름 AI 번역](더미) — 미입력 place_name_en 자동 채움 */
function aiTranslatePlaceNames() {
  const list = loadPlaces();
  let n = 0;
  list.forEach((p) => {
    if (!p.place_name_en && p.place_name) {
      p.place_name_en = PLACE_NAME_EN_MAP[p.place_name] || p.place_name;
      p.updated_at = new Date().toISOString();
      n++;
    }
  });
  savePlaces(list);
  return n;
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

/**
 * PMS 객실 동기화 더미 데이터 (숙소별 객실 + RM_TYP_CD).
 * [PMS 객실 동기화] 클릭 시 주입/갱신. place_code로 소속 숙소를 찾아 연결한다.
 * RM_TYP_CD = PMS 객실타입코드(요금·재고·마진 기준 키). 객실코드(RM-####)와 별개.
 */
const PMS_DUMMY_ROOMS_SEED = [
  { place_code: "PL-DAB431", rm_typ_cd: "STD", room_name: "스탠다드", standard: 2, max: 2 },
  { place_code: "PL-DAB431", rm_typ_cd: "DLX", room_name: "디럭스", standard: 2, max: 4 },
  { place_code: "PL-96903C", rm_typ_cd: "LSD", room_name: "럭셔리스위트 더블", standard: 2, max: 2 },
  { place_code: "PL-96903C", rm_typ_cd: "LBD", room_name: "럭셔리스위트 베스트슬립 더블", standard: 2, max: 2 },
  { place_code: "PL-96903C", rm_typ_cd: "SPD", room_name: "슈페리어 더블", standard: 2, max: 2 },
  { place_code: "PL-7064E0", rm_typ_cd: "PST", room_name: "팰리스 스위트", standard: 2, max: 4 },
  { place_code: "PL-B66F6A", rm_typ_cd: "MST", room_name: "마운틴 스탠다드", standard: 4, max: 6 },
  { place_code: "PL-C07303", rm_typ_cd: "VST", room_name: "밸리 스탠다드", standard: 4, max: 6 },
  { place_code: "PL-4F7F0D", rm_typ_cd: "HST", room_name: "힐 스탠다드", standard: 4, max: 6 },
];

const ROOM_NAME_EN_MAP = {
  "스탠다드": "Standard",
  "디럭스": "Deluxe",
  "럭셔리스위트 더블": "Luxury Suite Double",
  "럭셔리스위트 베스트슬립 더블": "Luxury Suite BestSleep Double",
  "슈페리어 더블": "Superior Double",
  "팰리스 스위트": "Palace Suite",
  "마운틴 스탠다드": "Mountain Standard",
  "밸리 스탠다드": "Valley Standard",
  "힐 스탠다드": "Hill Standard",
};

/** [PMS 객실 동기화] — 더미 PMS 객실을 주입/갱신. 소속 숙소가 없으면(미동기화) 스킵. */
function syncPmsRooms() {
  const places = loadPlaces();
  const placeByCode = new Map(places.map((p) => [p.place_code, p]));
  const existing = loadRooms();
  const now = new Date().toISOString();
  let seq = 0;
  const nextCode = () => {
    seq += 1;
    return "RM-" + String(seq).padStart(4, "0");
  };
  const merged = [];
  PMS_DUMMY_ROOMS_SEED.forEach((seed) => {
    const place = placeByCode.get(seed.place_code);
    if (!place) return; // 숙소 미동기화 → 스킵
    const prev = existing.find((r) => r.place_id === place.id && r.rm_typ_cd === seed.rm_typ_cd);
    merged.push({
      id: prev?.id || uid(),
      place_id: place.id,
      room_code: prev?.room_code || nextCode(),
      rm_typ_cd: seed.rm_typ_cd, // PMS 객실타입코드 (기준 키)
      room_name: seed.room_name,
      room_name_en: prev?.room_name_en || "",
      // 관리자 보완 필드 보존
      room_type_id: prev?.room_type_id || "",
      room_trait_ids: prev?.room_trait_ids || [],
      bed_rows: prev?.bed_rows || [],
      facility_ids: prev?.facility_ids || [],
      featured_facility_ids: prev?.featured_facility_ids || [],
      room_size_sqm: prev?.room_size_sqm || "",
      policy_html_en: prev?.policy_html_en || "",
      policy_html_zh: prev?.policy_html_zh || "",
      guide_html_en: prev?.guide_html_en || "",
      guide_html_zh: prev?.guide_html_zh || "",
      image_meta: prev?.image_meta || [],
      // PMS 수신
      standard_occupancy: seed.standard,
      max_occupancy: seed.max,
      visibility: prev ? prev.visibility : "SHOW",
      created_at: prev?.created_at || now,
      updated_at: now,
      updated_by: "PMS 동기화",
    });
  });
  saveRooms(merged);
  return merged.length;
}

/** [누락된 필드 AI 번역](더미) — 미입력 room_name_en 자동 채움 */
function aiTranslateRoomNames() {
  const list = loadRooms();
  let n = 0;
  list.forEach((r) => {
    if (!r.room_name_en && r.room_name) {
      r.room_name_en = ROOM_NAME_EN_MAP[r.room_name] || r.room_name;
      r.updated_at = new Date().toISOString();
      n++;
    }
  });
  saveRooms(list);
  return n;
}

/** 객실타입(RM_TYP_CD)별 더미 입금가 (재고·요금 동기화용) */
const RM_TYP_RATE_MAP = {
  STD: 250000, DLX: 350000, LSD: 400000, LBD: 420000, SPD: 300000,
  PST: 500000, MST: 280000, VST: 280000, HST: 280000,
};

/** 7/1~8/31 날짜별 인벤토리(재고·요금) 더미 생성 · 재고 3값(총운영/예약/잔여) */
function buildDummyRoomInventory(price, totalStock) {
  const rows = [];
  [
    ["07", 31],
    ["08", 31],
  ].forEach(([mm, days]) => {
    for (let d = 1; d <= days; d++) {
      rows.push({
        date: `2026-${mm}-${String(d).padStart(2, "0")}`,
        price,
        oper_cnt: totalStock, // 총 운영 (OPER_RM_CNT)
        rsv_cnt: 0, // 예약됨 (RSV_CNT)
        avlb_cnt: totalStock, // 잔여 (AVLB_RM_CNT) ★ 프런트 sold out 기준
        stock: totalStock, // 하위호환(= 잔여)
        closed: false,
      });
    }
  });
  return rows;
}

/** [재고·요금 동기화] — 객실별 PMS 재고·요금(room.inventory) 채움. 객실 정보 동기화와 별개. */
function syncPmsRoomInventory() {
  const rooms = loadRooms();
  if (!rooms.length) return 0;
  const now = new Date().toISOString();
  let count = 0;
  rooms.forEach((room) => {
    const price = RM_TYP_RATE_MAP[room.rm_typ_cd] || 300000;
    // 재동기화 시 기존 강제 마감(closed) 상태 보존
    const prevClosed = new Map((Array.isArray(room.inventory) ? room.inventory : []).map((r) => [r.date, r.closed === true]));
    room.inventory = buildDummyRoomInventory(price, 30).map((r) => ({ ...r, closed: prevClosed.get(r.date) === true })); // 7/1~8/31, 재고 30
    room.inventory_synced_at = now;
    count += 1;
  });
  saveRooms(rooms);
  return count;
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

/**
 * PMS 상품정보 동기화 (더미). 동기화된 각 객실당 룸온리 상품 1건 생성/갱신.
 * - 전 상품 PMS 연동 전제(pms_linked). 취소정책은 PMS API 9 표시(읽기전용).
 * - 재고·요금(inventory)은 S04-INV/PMS 연동이며 상품에서는 읽기전용 조회. 동기화 직후 인벤토리 0행.
 */
function syncPmsProducts() {
  const rooms = loadRooms();
  if (!rooms.length) return 0;
  const existing = loadProducts();
  const now = new Date().toISOString();
  let seq = 0;
  const nextCode = () => {
    seq += 1;
    return "PR-" + String(seq).padStart(4, "0");
  };
  const merged = [];
  rooms.forEach((room) => {
    const prev = existing.find((p) => p.room_id === room.id && p.pms_linked);
    const baseName = room.room_name_en || room.room_name || room.rm_typ_cd || "Room";
    merged.push({
      id: prev?.id || uid(),
      product_code: prev?.product_code || nextCode(),
      room_id: room.id,
      pms_linked: true,
      product_type: PRODUCT_TYPE.ROOM_ONLY,
      // 다국어 (국문 미사용 · EN 필수 · ZH 선택)
      name_en: prev?.name_en || `${baseName} Room Only`,
      name_zh: prev?.name_zh || "",
      description_en: prev?.description_en || "",
      description_zh: prev?.description_zh || "",
      guide_policy_html_en: prev?.guide_policy_html_en || "",
      guide_policy_html_zh: prev?.guide_policy_html_zh || "",
      // PMS 수신 / 정책
      visibility: prev ? prev.visibility : "Y",
      sale_start_date: prev?.sale_start_date || "2026-07-01",
      sale_end_date: prev?.sale_end_date || "2026-12-31",
      cancel_policy_type: "PMS_API9", // PMS 취소정책 (API 9/10, 읽기전용)
      cancel_free_days_before: null,
      inventory: prev?.inventory || [], // 재고·요금은 S04-INV/PMS 연동, 마진은 일자별(inventory row)
      created_at: prev?.created_at || now,
      updated_at: now,
      updated_by: "PMS 동기화",
    });
  });
  saveProducts(merged);
  return merged.length;
}

/** [누락된 필드 AI 번역](더미) — 미입력 상품명 영문 자동 채움 */
function aiTranslateProductNames() {
  const rooms = loadRooms();
  const roomById = new Map(rooms.map((r) => [r.id, r]));
  const list = loadProducts();
  let n = 0;
  list.forEach((p) => {
    if (!p.name_en) {
      const room = roomById.get(p.room_id);
      const base = room?.room_name_en || room?.room_name || room?.rm_typ_cd || "Room";
      p.name_en = `${base} Room Only`;
      p.updated_at = new Date().toISOString();
      n++;
    }
  });
  saveProducts(list);
  return n;
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
  const margin_type = raw?.margin_type === "rate" || raw?.margin_type === "amount" ? raw.margin_type : "";
  const margin_value = raw?.margin_value === "" || raw?.margin_value == null ? "" : String(raw.margin_value);
  const margin_source = raw?.margin_source === "manual" ? "manual" : "master"; // manual=관리자 개별, master=마스터 상속
  return {
    date,
    price,
    stock,
    closed: raw?.closed === true,
    checkin_allowed,
    min_stay_nights,
    max_stay_nights,
    cutoff_days_before_checkin,
    margin_type, // 일자별 마진 유형 (amount/rate/"")
    margin_value, // 일자별 마진 값
    margin_source, // 마스터 상속(master) / 관리자 개별(manual)
  };
}

/** 공통관리 마진관리 — 전역 기본 디폴트 (마스터 미설정 RM_TYP_CD에 적용) */
const DEFAULT_DAILY_MARGIN = { type: "amount", value: "30000" };

function loadMarginMaster() {
  try {
    const raw = localStorage.getItem(STORAGE_MARGIN_MASTER);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}
function saveMarginMaster(map) {
  localStorage.setItem(STORAGE_MARGIN_MASTER, JSON.stringify(map || {}));
}
/** RM_TYP_CD의 마진 마스터 값 (없으면 전역 디폴트) — 상품 일자별 마진 디폴트 소스 */
function getMarginMaster(rmTypCd) {
  const m = loadMarginMaster();
  const e = rmTypCd && m[rmTypCd];
  if (e && (e.type === "amount" || e.type === "rate")) return { type: e.type, value: String(e.value ?? "") };
  return { type: DEFAULT_DAILY_MARGIN.type, value: DEFAULT_DAILY_MARGIN.value };
}

/* ── 화면관리 > 메인관리 ── */
function loadMainHero() {
  try {
    const r = localStorage.getItem(STORAGE_MAIN_HERO);
    return r ? JSON.parse(r) : [];
  } catch {
    return [];
  }
}
function saveMainHero(list) {
  localStorage.setItem(STORAGE_MAIN_HERO, JSON.stringify(list || []));
}
function loadMainHeroCfg() {
  try {
    const r = localStorage.getItem(STORAGE_MAIN_HERO_CFG);
    const cfg = r ? JSON.parse(r) : null;
    return cfg && typeof cfg === "object" ? { autoplay: cfg.autoplay !== false, interval_sec: cfg.interval_sec || 5 } : { autoplay: true, interval_sec: 5 };
  } catch {
    return { autoplay: true, interval_sec: 5 };
  }
}
function saveMainHeroCfg(cfg) {
  localStorage.setItem(STORAGE_MAIN_HERO_CFG, JSON.stringify(cfg || {}));
}
function loadMainSection() {
  try {
    const r = localStorage.getItem(STORAGE_MAIN_SECTION);
    return r ? JSON.parse(r) : [];
  } catch {
    return [];
  }
}
function saveMainSection(list) {
  localStorage.setItem(STORAGE_MAIN_SECTION, JSON.stringify(list || []));
}
/** 히어로 슬라이드 상태 계산: 강제종료 OR 노출기간 경과 → OFF */
function heroSlideOn(h, todayStr) {
  if (h.force_off) return false;
  const s = String(h.period_start || "").slice(0, 10);
  const e = String(h.period_end || "").slice(0, 10);
  if (s && todayStr < s) return false;
  if (e && todayStr > e) return false;
  return true;
}

/** 실판매가 = 입금가 + 마진 (마진율: floor(base×(1+율/100)) · 마진금액: base+금액). 소수점 버림. */
function computeSellPrice(basePrice, marginType, marginValue) {
  const base = Math.max(0, parseInt(basePrice, 10) || 0);
  const v = parseFloat(marginValue);
  if (marginType === "rate" && !Number.isNaN(v)) return Math.max(0, Math.floor(base * (1 + v / 100)));
  if (marginType === "amount" && !Number.isNaN(v)) return Math.max(0, base + Math.floor(v));
  return base; // 마진 없음 → 판매가 = 입금가
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
      (target === "room-masters" && path.startsWith("room-masters")) ||
      (target === "margin-management" && path.startsWith("margin-management")) ||
      (target === "main-management" && path.startsWith("main-management")) ||
      (target === "coupon-specs" && path.startsWith("coupon-specs")) ||
      (target === "ticket-products" && path.startsWith("ticket-products")) ||
      (target === "ticket-categories" && path.startsWith("ticket-categories"));
    el.classList.toggle("active", on);
  });
}

/* ── 상단 GNB + 컨텍스트 LNB (개발사 어드민 구조) ── */
const NAV_SECTIONS = [
  {
    id: "stay", label: "숙소관리", match: ["places", "rooms", "products"],
    lnb: [
      { label: "숙소관리", route: "places" },
      { label: "객실관리", route: "rooms" },
      { label: "상품관리", route: "products" },
    ],
  },
  {
    id: "ticket", label: "티켓관리", match: ["ticket-categories", "coupon-specs", "ticket-products"],
    lnb: [
      { label: "카테고리/컨텐츠 관리", route: "ticket-categories" },
      { label: "쿠폰 스펙 관리", route: "coupon-specs" },
      { label: "티켓 상품", route: "ticket-products" },
    ],
  },
  { id: "tour", label: "투어관리", mock: true, match: ["tours"], lnb: [], placeholder: "tours" },
  { id: "booking", label: "예약관리", match: ["reservations", "ticket-orders"], lnb: [], placeholder: "reservations" },
  {
    id: "screen", label: "화면관리", match: ["main-management"],
    lnb: [{ label: "메인관리", route: "main-management" }],
  },
  {
    id: "common", label: "공통관리", match: ["categories", "facilities", "room-masters", "margin-management"],
    lnb: [
      { head: "숙소 카테고리·시설" },
      { label: "숙소시설관리", route: "categories/place", sub: true },
      { label: "객실시설관리", route: "categories/room", sub: true },
      { label: "숙소 시설", route: "facilities/place", sub: true },
      { label: "객실 시설", route: "facilities/room", sub: true },
      { label: "객실유형관리", route: "room-masters", sub: true },
      { head: "마진" },
      { label: "마진관리", route: "margin-management" },
    ],
  },
];

function sectionForPath(path) {
  for (const s of NAV_SECTIONS) {
    if (s.match.some((m) => path === m || path.startsWith(m + "/"))) return s;
  }
  return NAV_SECTIONS[0];
}
function firstRouteOf(section) {
  const item = (section.lnb || []).find((i) => i.route);
  return item ? item.route : section.placeholder || "places";
}

/** 상단 GNB + 좌측 LNB를 현재 라우트 기준으로 렌더 (routeWrap마다 호출) */
function renderChrome() {
  const { path } = parseHash();
  const active = sectionForPath(path);

  const gnb = document.getElementById("gnb");
  if (gnb) {
    gnb.innerHTML = NAV_SECTIONS.map(
      (s) => `<button type="button" class="gnb-item ${s.id === active.id ? "active" : ""}" data-section="${s.id}">${escapeHtml(s.label)}${s.mock ? `<span class="gnb-mock">MOCK</span>` : ""}</button>`
    ).join("");
    gnb.querySelectorAll(".gnb-item").forEach((btn) => btn.addEventListener("click", () => {
      const s = NAV_SECTIONS.find((x) => x.id === btn.getAttribute("data-section"));
      if (s) navigate(firstRouteOf(s));
    }));
  }

  const lnb = document.getElementById("lnb");
  if (lnb) {
    let html = `<div class="lnb-title">${escapeHtml(active.label)}${active.mock ? `<span class="gnb-mock">MOCK</span>` : ""}</div>`;
    if (!(active.lnb && active.lnb.length)) {
      html += `<div class="lnb-empty">준비 중입니다 (MOCK).</div>`;
    } else {
      let headSeen = false;
      active.lnb.forEach((i) => {
        if (i.head) { html += `<div class="nav-group-subtitle ${headSeen ? "nav-head-div" : ""}">${escapeHtml(i.head)}</div>`; headSeen = true; return; }
        const on = navRouteMatch(i.route, path);
        html += `<button type="button" class="nav-link ${i.sub ? "nav-link-sub" : ""} ${on ? "active" : ""}" data-route="${escapeAttr(i.route)}">${escapeHtml(i.label)}</button>`;
      });
    }
    lnb.innerHTML = html;
    lnb.querySelectorAll(".nav-link[data-route]").forEach((btn) => btn.addEventListener("click", () => navigate(btn.getAttribute("data-route"))));
  }
}

/** 미구현(MOCK) 섹션 안내 화면 */
function renderComingSoon(main, label, mock) {
  main.innerHTML = `
    <h2 class="page-title">${escapeHtml(label)}${mock ? ` <span class="badge" style="background:#fef3c7;color:#92610e">MOCK</span>` : ""}</h2>
    <div class="card"><div class="empty"><strong>준비 중입니다.</strong> 이 메뉴는 아직 프로토타입에 구현되지 않았습니다${mock ? " (MOCK)" : ""}.</div></div>`;
}

let _marginTab = "lodging"; // 마진관리 탭 상태 (lodging | ticket)
function renderMarginMaster(main) {
  main.innerHTML = `
    <h2 class="page-title">마진관리 <span style="font-size:12px;font-weight:400;color:#888">— 공통관리 · 숙소(객실 타입별) · 티켓(카테고리 마스터+쿠폰ID 오버라이드)</span></h2>
    <div class="room-master-tabs">
      <a class="room-master-tab ${_marginTab === "lodging" ? "active" : ""}" href="javascript:void(0)" data-mtab="lodging">숙소</a>
      <a class="room-master-tab ${_marginTab === "ticket" ? "active" : ""}" href="javascript:void(0)" data-mtab="ticket">티켓</a>
    </div>
    <div id="mm-body"></div>`;
  main.querySelectorAll("[data-mtab]").forEach((el) => el.addEventListener("click", () => { _marginTab = el.getAttribute("data-mtab"); renderMarginMaster(main); }));
  const body = main.querySelector("#mm-body");
  if (_marginTab === "ticket") renderTicketMarginPanel(body);
  else renderLodgingMarginPanel(body);
}

function renderLodgingMarginPanel(main) {
  const rooms = loadRooms();
  const places = loadPlaces();
  const placeById = new Map(places.map((p) => [p.id, p]));
  const master = loadMarginMaster();
  const seen = new Set();
  const types = [];
  rooms.forEach((r) => {
    const code = r.rm_typ_cd;
    if (!code || seen.has(code)) return;
    seen.add(code);
    types.push({
      code,
      roomName: r.room_name_en || r.room_name || "",
      placeName: placeById.get(r.place_id)?.place_name || "",
      placeId: r.place_id || "",
    });
  });
  function previewCell(mt, mv) {
    const p = computeSellPrice(300000, mt || DEFAULT_DAILY_MARGIN.type, mt ? mv : DEFAULT_DAILY_MARGIN.value);
    return p.toLocaleString() + "원";
  }
  const rowsHtml = types.length
    ? types
        .map((t) => {
          const e = master[t.code] || {};
          const mt = e.type === "amount" || e.type === "rate" ? e.type : "";
          const mv = e.value ?? "";
          return `<tr data-code="${escapeAttr(t.code)}" data-place="${escapeAttr(t.placeId || "")}">
            <td><span class="badge" style="background:#eef;color:#4457c7">${escapeHtml(t.code)}</span></td>
            <td>${escapeHtml(t.placeName || "-")}</td>
            <td>${escapeHtml(t.roomName || "-")}</td>
            <td><select class="mm-type" style="width:110px">
              <option value="" ${!mt ? "selected" : ""}>전역 디폴트</option>
              <option value="amount" ${mt === "amount" ? "selected" : ""}>마진금액</option>
              <option value="rate" ${mt === "rate" ? "selected" : ""}>마진율%</option>
            </select></td>
            <td><input class="mm-value" type="text" inputmode="numeric" value="${escapeAttr(String(mv))}" style="width:90px" ${!mt ? "disabled" : ""} /></td>
            <td style="color:#1a6fb8;font-weight:600">${previewCell(mt, mv)}</td>
          </tr>`;
        })
        .join("")
    : `<tr><td colspan="6" class="muted" style="padding:12px">객실이 없습니다. 객실관리에서 [PMS 객실 동기화] 후 이용하세요.</td></tr>`;

  main.innerHTML = `
    <p class="page-desc">여기서 설정한 마진이 상품 재고·요금의 <strong>일자별 마진 디폴트</strong>로 주입됩니다. 날짜별 개별 조정은 상품(S06) 재고·요금 탭에서 합니다. 전역 기본 디폴트: 마진금액 ${DEFAULT_DAILY_MARGIN.value}원.</p>
    <div class="card">
      <div class="product-bulk-bar" style="display:flex;flex-wrap:wrap;gap:10px;align-items:flex-end;">
        <span class="product-bulk-title" style="width:100%;margin-bottom:2px;">일괄 적용</span>
        <label style="display:flex;flex-direction:column;gap:2px;font-size:10px;color:#888;">숙소 필터
          <select id="mm_bulk_place" style="width:180px;">
            <option value="">전체</option>
            ${places.map((p) => `<option value="${escapeAttr(p.id)}">${escapeHtml(p.place_name)}</option>`).join("")}
          </select></label>
        <label style="display:flex;flex-direction:column;gap:2px;font-size:10px;color:#888;">마진 유형
          <select id="mm_bulk_type" style="width:120px;">
            <option value="">선택</option>
            <option value="amount">마진금액</option>
            <option value="rate">마진율%</option>
          </select></label>
        <label style="display:flex;flex-direction:column;gap:2px;font-size:10px;color:#888;">마진 값
          <input type="text" id="mm_bulk_value" inputmode="numeric" style="width:90px;" /></label>
        <button type="button" class="btn" id="mm_bulk_apply" style="height:34px;">전체 적용</button>
        <span style="flex:1"></span>
        <button type="button" class="btn btn-primary" id="mm_save" style="height:34px;">마진 마스터 저장</button>
      </div>
      <div class="product-inv-wrap" style="margin-top:10px"><table class="room-list-table">
        <thead><tr><th>RM_TYP_CD</th><th>숙소명</th><th>객실명</th><th>마진 유형</th><th>마진 값</th><th>판매가 예시 (입금가 300,000)</th></tr></thead>
        <tbody>${rowsHtml}</tbody>
      </table></div>
      <p class="field-hint" style="margin-top:8px">유형 '전역 디폴트' 선택 시 전역 기본(마진금액 ${DEFAULT_DAILY_MARGIN.value}원)이 적용됩니다. 저장 후 상품 재고·요금에서 마진 미설정 일자에 이 값이 디폴트로 반영됩니다.</p>
    </div>
  `;

  function refreshRowPreview(tr) {
    const mt = tr.querySelector(".mm-type")?.value || "";
    const mv = tr.querySelector(".mm-value")?.value || "";
    tr.querySelector("td:last-child").textContent = previewCell(mt, mv);
  }
  main.querySelectorAll(".mm-type").forEach((sel) => {
    sel.addEventListener("change", () => {
      const tr = sel.closest("tr");
      const valInp = tr.querySelector(".mm-value");
      if (valInp) valInp.disabled = !sel.value;
      refreshRowPreview(tr);
    });
  });
  main.querySelectorAll(".mm-value").forEach((inp) => {
    inp.addEventListener("input", () => refreshRowPreview(inp.closest("tr")));
  });

  document.getElementById("mm_bulk_apply")?.addEventListener("click", () => {
    const bt = document.getElementById("mm_bulk_type")?.value || "";
    const bv = String(document.getElementById("mm_bulk_value")?.value || "").trim();
    const bp = document.getElementById("mm_bulk_place")?.value || ""; // "" = 전체
    if (bt !== "amount" && bt !== "rate") {
      alert("마진 유형(마진금액/마진율)을 선택하세요.");
      return;
    }
    let n = 0;
    main.querySelectorAll("tbody tr[data-code]").forEach((tr) => {
      if (bp && tr.getAttribute("data-place") !== bp) return; // 숙소 필터 (전체가 아니면 해당 숙소만)
      const sel = tr.querySelector(".mm-type");
      const inp = tr.querySelector(".mm-value");
      if (sel) sel.value = bt;
      if (inp) {
        inp.value = bv;
        inp.disabled = false;
      }
      refreshRowPreview(tr);
      n += 1;
    });
    if (!n) alert("선택한 숙소에 해당하는 객실 타입이 없습니다.");
  });

  document.getElementById("mm_save")?.addEventListener("click", () => {
    if (!confirm("마진 마스터를 저장하시겠습니까?\n저장 시 상품 재고·요금의 마진 미설정 일자에 디폴트로 반영됩니다.")) return;
    const map = {};
    main.querySelectorAll("tbody tr[data-code]").forEach((tr) => {
      const code = tr.getAttribute("data-code");
      const mt = tr.querySelector(".mm-type")?.value || "";
      const mv = String(tr.querySelector(".mm-value")?.value || "").trim();
      if (mt === "amount" || mt === "rate") map[code] = { type: mt, value: mv };
    });
    saveMarginMaster(map);
    alert("마진 마스터가 저장되었습니다.");
  });
}

/* ── S11 티켓 마진 탭 — 카테고리 마스터 + 쿠폰ID 오버라이드 (정책 v0.11 §11) ── */
function renderTicketMarginPanel(main) {
  const W = loadTicketMarginMaster(); // 작업 사본 { categories, overrides }
  const groups = Array.from(groupCouponSpecs(loadCouponSpecs()).values());
  const cats = loadTicketCategories();
  const tops = cats.filter((c) => !c.parent_id).sort((a, b) => (a.order || 0) - (b.order || 0));
  const catOpts = [{ v: "", label: "전체" }];
  tops.forEach((t) => {
    catOpts.push({ v: t.name_ko, label: t.name_ko });
    cats.filter((c) => c.parent_id === t.id).sort((a, b) => (a.order || 0) - (b.order || 0)).forEach((s) => catOpts.push({ v: `${t.name_ko}>${s.name_ko}`, label: `${t.name_ko} > ${s.name_ko}` }));
  });
  const resolveW = (cid, cat1, cat2) => {
    const ov = W.overrides[cid];
    if (isMarginEntry(ov)) return { type: ov.type, value: String(ov.value ?? ""), source: "override" };
    const k2 = cat1 && cat2 ? `${cat1}>${cat2}` : "";
    if (k2 && isMarginEntry(W.categories[k2])) return { type: W.categories[k2].type, value: String(W.categories[k2].value ?? ""), source: "cat2" };
    if (cat1 && isMarginEntry(W.categories[cat1])) return { type: W.categories[cat1].type, value: String(W.categories[cat1].value ?? ""), source: "cat1" };
    return { type: DEFAULT_TICKET_MARGIN.type, value: DEFAULT_TICKET_MARGIN.value, source: "default" };
  };
  const effLabel = (m) => m.source === "default"
    ? `전역 디폴트(${Number(DEFAULT_TICKET_MARGIN.value).toLocaleString()}원)`
    : (m.type === "rate" ? `${m.value}%` : `${Number(m.value || 0).toLocaleString()}원`);
  const previewLevels = (g, m) => g.rows.map((r) => {
    const sell = computeSellPrice(Number(r.price) || 0, m.type, m.value);
    return `${escapeHtml(r.level_name)} ${Number(r.price).toLocaleString()}→${sell.toLocaleString()}`;
  }).join("<br>");

  function draw() {
    groups.sort((a, b) => (a.category || "").localeCompare(b.category || "") || (a.product_type || "").localeCompare(b.product_type || "") || a.coupon_id.localeCompare(b.coupon_id));
    const rowsHtml = groups.length ? groups.map((g) => {
      const cid = g.coupon_id, cat1 = g.category || "", cat2 = g.product_type || "";
      const isOv = isMarginEntry(W.overrides[cid]);
      const eff = resolveW(cid, cat1, cat2);
      const catLabel = cat2 ? `${cat1} > ${cat2}` : (cat1 || "-");
      const typeCell = isOv
        ? `<select class="tm-type" data-cid="${escapeAttr(cid)}" style="width:110px"><option value="amount" ${eff.type === "amount" ? "selected" : ""}>마진금액</option><option value="rate" ${eff.type === "rate" ? "selected" : ""}>마진율%</option></select>`
        : `<span class="badge" style="background:#f0f0ea;color:#888">${eff.source === "default" ? "전역 디폴트" : (eff.type === "rate" ? "마진율%" : "마진금액") + "(마스터)"}</span>`;
      const valCell = isOv
        ? `<input class="tm-value" data-cid="${escapeAttr(cid)}" type="text" inputmode="numeric" value="${escapeAttr(eff.value)}" style="width:80px">`
        : `<span style="color:#888">${eff.source === "default" ? "—" : effLabel(eff)}</span>`;
      return `<tr data-cid="${escapeAttr(cid)}">
        <td><span class="badge" style="background:#fde8e8;color:#c0392b">${escapeHtml(cid)}</span></td>
        <td style="font-size:11px;color:#666">${escapeHtml(catLabel)}</td>
        <td>${escapeHtml(g.pass_name || "")}</td>
        <td><span class="badge" style="background:${isOv ? "#dcfce7;color:#166534" : "#e8e8e2;color:#666"}">${isOv ? "개별" : "상속"}</span></td>
        <td>${typeCell}</td>
        <td>${valCell}</td>
        <td style="font-size:10px;font-weight:600;color:${isOv ? "#1a6fb8" : "#999"}">${previewLevels(g, eff)}</td>
        <td><button type="button" class="btn btn-sm tm-toggle" data-cid="${escapeAttr(cid)}">${isOv ? "상속으로" : "개별설정"}</button></td>
      </tr>`;
    }).join("") : `<tr><td colspan="8" class="muted" style="padding:12px">쿠폰 스펙이 없습니다. 쿠폰 스펙 관리(S13)에서 등록 후 이용하세요.</td></tr>`;

    main.innerHTML = `
      <p class="page-desc" style="margin-top:0">티켓 마진은 <strong>카테고리 마스터 + 쿠폰ID 오버라이드</strong>로 관리합니다. 상단에서 카테고리 마스터를 정하면 그 범위 쿠폰ID가 <strong>상속</strong>하고, 특정 쿠폰ID만 <strong>개별설정</strong>으로 덮어씁니다.</p>
      <div class="card" style="background:#f0f5ff;border-color:#c7d2fe;margin-bottom:12px">
        <div style="font-size:12px;font-weight:700;color:#3730a3;margin-bottom:4px">마진 적용 우선순위</div>
        <div style="font-size:12px;color:#444;line-height:1.7">① <strong>쿠폰ID 개별</strong> ▸ ② <strong>2뎁스(상품유형) 마스터</strong> ▸ ③ <strong>1뎁스(카테고리) 마스터</strong> ▸ ④ <strong>전역 디폴트(마진금액 ${Number(DEFAULT_TICKET_MARGIN.value).toLocaleString()}원)</strong></div>
      </div>
      <div class="card">
        <div class="product-bulk-bar" style="display:flex;flex-wrap:wrap;gap:10px;align-items:flex-end">
          <span class="product-bulk-title" style="width:100%;margin-bottom:2px">카테고리 마스터 마진 설정</span>
          <label style="display:flex;flex-direction:column;gap:2px;font-size:10px;color:#888">카테고리
            <select id="tm_cat" style="width:200px">${catOpts.map((o) => `<option value="${escapeAttr(o.v)}">${escapeHtml(o.label)}</option>`).join("")}</select></label>
          <label style="display:flex;flex-direction:column;gap:2px;font-size:10px;color:#888">마진 유형
            <select id="tm_type" style="width:120px"><option value="">전역 디폴트</option><option value="amount">마진금액</option><option value="rate">마진율%</option></select></label>
          <label style="display:flex;flex-direction:column;gap:2px;font-size:10px;color:#888">마진 값
            <input id="tm_val" type="text" inputmode="numeric" style="width:90px"></label>
          <button type="button" class="btn" id="tm_apply" style="height:34px">카테고리 마스터 적용</button>
          <span style="flex:1"></span>
          <button type="button" class="btn btn-primary" id="tm_save" style="height:34px">쿠폰ID 마진 저장</button>
        </div>
        <p class="field-hint" style="margin-top:8px">카테고리(전체/1뎁스/2뎁스)로 범위를 좁혀 유형·값 지정 → [카테고리 마스터 적용]으로 그 범위 <strong>'상속' 행에 반영</strong>. '개별' 행은 영향 없음. 유형 '전역 디폴트' 선택 시 해당 카테고리 마스터 삭제(→전역 디폴트 상속). 반드시 <strong>[쿠폰ID 마진 저장]</strong>을 눌러야 최종 반영.</p>
        <div class="product-inv-wrap" style="margin-top:10px"><table class="room-list-table">
          <thead><tr><th>쿠폰ID</th><th>카테고리</th><th>이용권명</th><th>상속·개별</th><th>마진 유형</th><th>마진 값</th><th>판매가 예시(레벨별)</th><th>개별</th></tr></thead>
          <tbody>${rowsHtml}</tbody>
        </table></div>
        <p class="field-hint" style="margin-top:8px">마진율 -49~+100 정수, 마진금액 정액. 소수점 버림(floor). 한 쿠폰ID의 <strong>모든 레벨에 동일 마진</strong> 적용.</p>
      </div>`;

    // 개별 토글
    main.querySelectorAll(".tm-toggle").forEach((b) => b.addEventListener("click", () => {
      const cid = b.getAttribute("data-cid");
      if (isMarginEntry(W.overrides[cid])) { delete W.overrides[cid]; }
      else { const g = groups.find((x) => x.coupon_id === cid); const eff = resolveW(cid, g.category || "", g.product_type || ""); W.overrides[cid] = { type: eff.type === "rate" ? "rate" : "amount", value: eff.value }; }
      draw();
    }));
    // 오버라이드 행 편집
    main.querySelectorAll(".tm-type").forEach((sel) => sel.addEventListener("change", () => {
      const cid = sel.getAttribute("data-cid");
      W.overrides[cid] = { type: sel.value, value: (W.overrides[cid] && W.overrides[cid].value) || "" };
      draw();
    }));
    main.querySelectorAll(".tm-value").forEach((inp) => inp.addEventListener("input", () => {
      const cid = inp.getAttribute("data-cid");
      W.overrides[cid] = { type: (W.overrides[cid] && W.overrides[cid].type) || "amount", value: inp.value.trim() };
      const tr = inp.closest("tr"); const g = groups.find((x) => x.coupon_id === cid);
      tr.querySelector("td:nth-child(7)").innerHTML = previewLevels(g, W.overrides[cid]);
    }));
    // 카테고리 마스터 적용
    main.querySelector("#tm_apply").addEventListener("click", () => {
      const key = main.querySelector("#tm_cat").value;
      const type = main.querySelector("#tm_type").value;
      const val = String(main.querySelector("#tm_val").value || "").trim();
      const applyKey = (k) => { if (!type) delete W.categories[k]; else W.categories[k] = { type, value: val }; };
      if (key === "") catOpts.filter((o) => o.v).forEach((o) => applyKey(o.v));
      else applyKey(key);
      draw();
    });
    main.querySelector("#tm_save").addEventListener("click", () => {
      const nCat = Object.keys(W.categories).filter((k) => isMarginEntry(W.categories[k])).length;
      const nOv = Object.keys(W.overrides).filter((k) => isMarginEntry(W.overrides[k])).length;
      if (!confirm(`티켓 마진을 저장하시겠습니까?\n\n· 카테고리 마스터 ${nCat}건\n· 개별(오버라이드) ${nOv}건\n\n저장 시 프런트 판매가에 즉시 반영됩니다.`)) return;
      saveTicketMarginMaster(W);
      alert(`✅ 티켓 마진이 저장되었습니다.\n\n· 카테고리 마스터 ${nCat}건\n· 개별(오버라이드) ${nOv}건\n반영 완료.`);
    });
  }
  draw();
}

function sortLabel(t) {
  return t === "az" ? "A-Z" : t === "za" ? "Z-A" : t === "popular" ? "인기순" : "가격순(낮은순)";
}
function sectionOn(s, todayStr) {
  if (s.visible === false) return false;
  const st = String(s.period_start || "").slice(0, 10);
  const e = String(s.period_end || "").slice(0, 10);
  if (st && todayStr < st) return false;
  if (e && todayStr > e) return false;
  return true;
}

function renderMainManagement(main) {
  const heroes = loadMainHero();
  const cfg = loadMainHeroCfg();
  const sections = loadMainSection();
  const placeById = new Map(loadPlaces().map((p) => [p.id, p]));
  const today = new Date().toISOString().slice(0, 10);

  const heroRows = heroes.length
    ? heroes
        .slice()
        .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
        .map((h) => {
          const on = heroSlideOn(h, today);
          const period = h.period_start || h.period_end ? `${escapeHtml(h.period_start || "")} ~ ${escapeHtml(h.period_end || "")}` : "상시";
          return `<tr>
            <td><span class="badge" style="background:${h.media_type === "video" ? "#f3e8ff;color:#6b21a8" : "#dbeafe;color:#1e40af"}">${h.media_type === "video" ? "동영상" : "이미지"}</span></td>
            <td>${escapeHtml(h.title_ko || h.title_en || "-")}</td>
            <td style="font-size:11px">${period}</td>
            <td style="text-align:center">${h.force_off ? `<span class="badge off">강제OFF</span>` : "—"}</td>
            <td><span class="badge ${on ? "on" : "off"}">${on ? "ON" : "OFF"}</span></td>
            <td style="white-space:nowrap"><button type="button" class="btn btn-ghost js-hero-edit" data-id="${escapeAttr(h.id)}">수정</button> <button type="button" class="btn btn-ghost js-hero-del" data-id="${escapeAttr(h.id)}">삭제</button></td>
          </tr>`;
        })
        .join("")
    : `<tr><td colspan="6" class="muted" style="padding:12px">등록된 슬라이드가 없습니다. [+ 슬라이드 추가]로 등록하세요.</td></tr>`;

  const secRows = sections.length
    ? sections
        .slice()
        .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
        .map((s) => {
          const isTk = s.type === "ticket";
          const typeBadge = isTk ? `<span class="badge" style="background:#fce7f3;color:#ec4899">티켓</span>` : `<span class="badge" style="background:#dbeafe;color:#1e40af">숙소</span>`;
          const cat = isTk
            ? ((s.ticket_cats || []).length ? s.ticket_cats.join(", ") : "전체")
            : ((s.cat_1depth || []).map((c) => (c === "condo" ? "Condo" : "Hotel")).join(", ") || "-");
          const placeFilter = isTk ? "—" : (s.place_ids && s.place_ids.length ? s.place_ids.map((id) => placeById.get(id)?.place_name || "?").join(", ") : "전체");
          const sel = isTk
            ? (s.ticket_mode === "manual" ? `수동 · ${(s.ticket_product_ids || []).length}개` : `자동 · ${s.ticket_sort === "name" ? "이름순" : "가격순"}`)
            : (s.room_mode === "manual" ? `수동 · ${(s.room_ids || []).length}개` : `자동 · ${sortLabel(s.sort_type)}`);
          const period = s.period_start || s.period_end ? `${escapeHtml(s.period_start || "")} ~ ${escapeHtml(s.period_end || "")}` : "상시";
          const on = sectionOn(s, today);
          return `<tr>
            <td>${typeBadge}</td>
            <td style="font-weight:600">${escapeHtml(s.title_ko || s.title_en || "-")}</td>
            <td>${escapeHtml(cat)}</td>
            <td style="font-size:11px">${escapeHtml(placeFilter)}</td>
            <td style="font-size:11px">${escapeHtml(sel)}</td>
            <td style="font-size:11px">${period}</td>
            <td><span class="badge ${on ? "on" : "off"}">${on ? "SHOW" : "HIDE"}</span></td>
            <td style="white-space:nowrap"><button type="button" class="btn btn-ghost js-sec-edit" data-id="${escapeAttr(s.id)}">수정</button> <button type="button" class="btn btn-ghost js-sec-del" data-id="${escapeAttr(s.id)}">삭제</button></td>
          </tr>`;
        })
        .join("")
    : `<tr><td colspan="8" class="muted" style="padding:12px">등록된 섹션이 없습니다. [+ 섹션 추가]로 등록하세요.</td></tr>`;

  main.innerHTML = `
    <h2 class="page-title">메인 화면 관리 <span style="font-size:12px;font-weight:400;color:#888">— 화면관리 &gt; 메인관리</span></h2>
    <p class="page-desc">프런트 메인 페이지의 <strong>히어로 슬라이드</strong>와 <strong>추천 섹션</strong>을 관리합니다. 두 영역은 독립 저장됩니다. (숙소 집중 · 티켓·투어 추후)</p>

    <div class="card" style="border:1.5px solid #10b981">
      <h3 class="section-title" style="color:#065f46">▶ 히어로 이미지 영역</h3>
      <div style="display:flex;align-items:center;gap:12px;flex-wrap:wrap;background:#f0fdf4;border:1px solid #bbf7d0;border-radius:4px;padding:8px 12px;margin-bottom:12px;font-size:12px">
        <strong style="color:#065f46">전역 설정</strong>
        <label style="display:flex;align-items:center;gap:5px">자동 슬라이드
          <select id="mh_autoplay"><option value="on" ${cfg.autoplay ? "selected" : ""}>ON</option><option value="off" ${!cfg.autoplay ? "selected" : ""}>OFF</option></select>
        </label>
        <label style="display:flex;align-items:center;gap:5px">주기 <input id="mh_interval" type="number" min="1" value="${cfg.interval_sec}" style="width:56px"> 초</label>
        <button type="button" class="btn btn-primary" id="mh_cfg_save" style="margin-left:auto;background:#10b981;border-color:#10b981">전역 설정 저장</button>
      </div>
      <div style="font-size:10px;color:#888;margin-bottom:5px">슬라이드 목록 (${heroes.length} / 최대 10장)</div>
      <div class="product-inv-wrap"><table class="room-list-table"><thead><tr><th>유형</th><th>타이틀(KO)</th><th>노출 기간</th><th>강제종료</th><th>상태</th><th>작업</th></tr></thead><tbody>${heroRows}</tbody></table></div>
      <div style="margin-top:8px"><a href="#/main-management/hero/new" class="btn ${heroes.length >= 10 ? "" : ""}">+ 슬라이드 추가</a></div>
    </div>

    <div class="card" style="border:1.5px solid #6366f1;margin-top:16px">
      <h3 class="section-title" style="color:#3730a3">★ 추천 섹션 영역</h3>
      <div style="font-size:10px;color:#888;margin-bottom:5px">섹션 목록 (${sections.length}개)</div>
      <div class="product-inv-wrap"><table class="room-list-table"><thead><tr><th>유형</th><th>섹션 타이틀(KO)</th><th>카테고리</th><th>숙소 필터</th><th>선택</th><th>노출 기간</th><th>상태</th><th>작업</th></tr></thead><tbody>${secRows}</tbody></table></div>
      <div style="margin-top:8px;display:flex;gap:8px"><a href="#/main-management/section/new" class="btn">+ 숙소 섹션 추가</a><a href="#/main-management/section/new-ticket" class="btn" style="border-color:#ec4899;color:#be185d">+ 티켓 섹션 추가</a></div>
    </div>
  `;

  document.getElementById("mh_cfg_save")?.addEventListener("click", () => {
    const autoplay = document.getElementById("mh_autoplay")?.value === "on";
    const interval_sec = Math.max(1, parseInt(document.getElementById("mh_interval")?.value, 10) || 5);
    saveMainHeroCfg({ autoplay, interval_sec });
    alert("전역 설정이 저장되었습니다.");
  });
  main.querySelectorAll(".js-hero-edit").forEach((b) => b.addEventListener("click", () => navigate("main-management/hero/edit/" + b.getAttribute("data-id"))));
  main.querySelectorAll(".js-hero-del").forEach((b) =>
    b.addEventListener("click", () => {
      if (!confirm("이 슬라이드를 삭제할까요?")) return;
      saveMainHero(loadMainHero().filter((x) => x.id !== b.getAttribute("data-id")));
      renderMainManagement(main);
    })
  );
  main.querySelectorAll(".js-sec-edit").forEach((b) => b.addEventListener("click", () => navigate("main-management/section/edit/" + b.getAttribute("data-id"))));
  main.querySelectorAll(".js-sec-del").forEach((b) =>
    b.addEventListener("click", () => {
      if (!confirm("이 섹션을 삭제할까요?")) return;
      saveMainSection(loadMainSection().filter((x) => x.id !== b.getAttribute("data-id")));
      renderMainManagement(main);
    })
  );
}

/** S12-B 히어로 슬라이드 등록·수정 */
function renderHeroForm(main, editId) {
  const heroes = loadMainHero();
  const existing = editId ? heroes.find((h) => h.id === editId) : null;
  const isEdit = !!existing;
  const state = {
    id: existing?.id || uid(),
    media_type: existing?.media_type || "image",
    pc_image: existing?.pc_image || "",
    mobile_image: existing?.mobile_image || "",
    video_url: existing?.video_url || "",
    video_autoplay: existing?.video_autoplay !== false,
    title_ko: existing?.title_ko || "",
    title_en: existing?.title_en || "",
    subtitle_ko: existing?.subtitle_ko || "",
    subtitle_en: existing?.subtitle_en || "",
    period_start: existing?.period_start || "",
    period_end: existing?.period_end || "",
    force_off: !!existing?.force_off,
    cta_use: existing?.cta_use ?? true,
    cta_label_ko: existing?.cta_label_ko || "",
    cta_label_en: existing?.cta_label_en || "",
    cta_url: existing?.cta_url || "",
    order: existing?.order ?? heroes.length,
  };

  function persist() {
    const v = (id) => document.getElementById(id);
    state.media_type = v("hf_type")?.value || "image";
    if (state.media_type === "image") {
      state.pc_image = v("hf_pc")?.value.trim() ?? state.pc_image;
      state.mobile_image = v("hf_mo")?.value.trim() ?? state.mobile_image;
    } else {
      state.video_url = v("hf_video")?.value.trim() ?? state.video_url;
      if (v("hf_autoplay")) state.video_autoplay = v("hf_autoplay").value === "on";
    }
    if (v("hf_title_ko")) state.title_ko = v("hf_title_ko").value;
    if (v("hf_title_en")) state.title_en = v("hf_title_en").value;
    if (v("hf_sub_ko")) state.subtitle_ko = v("hf_sub_ko").value;
    if (v("hf_sub_en")) state.subtitle_en = v("hf_sub_en").value;
    if (v("hf_ps")) state.period_start = v("hf_ps").value;
    if (v("hf_pe")) state.period_end = v("hf_pe").value;
    if (v("hf_force")) state.force_off = v("hf_force").value === "on";
    if (v("hf_cta_use")) state.cta_use = v("hf_cta_use").value === "on";
    if (v("hf_cta_ko")) state.cta_label_ko = v("hf_cta_ko").value;
    if (v("hf_cta_en")) state.cta_label_en = v("hf_cta_en").value;
    if (v("hf_cta_url")) state.cta_url = v("hf_cta_url").value.trim();
  }

  function render() {
    const mediaBlock =
      state.media_type === "image"
        ? `<label class="field"><span>PC 이미지 URL</span><input id="hf_pc" type="text" value="${escapeAttr(state.pc_image)}" placeholder="https://... (권장 1920×600)" /></label>
           <label class="field"><span>모바일 이미지 URL</span><input id="hf_mo" type="text" value="${escapeAttr(state.mobile_image)}" placeholder="https://... (권장 768×450, 미입력 시 PC 이미지 사용)" /></label>
           ${state.pc_image ? `<div style="margin:4px 0 8px"><img src="${escapeAttr(state.pc_image)}" alt="미리보기" style="max-width:360px;max-height:130px;border:1px solid #ddd;border-radius:4px" onerror="this.style.display='none'" /></div>` : ""}`
        : `<label class="field"><span>동영상 URL</span><input id="hf_video" type="text" value="${escapeAttr(state.video_url)}" placeholder="https://....mp4" /></label>
           <label class="field"><span>자동 재생</span><select id="hf_autoplay"><option value="on" ${state.video_autoplay ? "selected" : ""}>ON</option><option value="off" ${!state.video_autoplay ? "selected" : ""}>OFF</option></select></label>
           <div class="notice" style="background:#fff9e6;border:1px solid #f0d98c;border-radius:6px;padding:8px 12px;font-size:12px;color:#7a5c00">동영상은 폼에서 관리만 하며, 프런트 실제 재생 연동은 제외됩니다(용량 이슈). 프런트는 이미지 슬라이드만 렌더링됩니다.</div>`;

    const ctaBlock = state.cta_use
      ? `<label class="field"><span>버튼명 KO <span style="color:#e74c3c">*</span></span><input id="hf_cta_ko" type="text" value="${escapeAttr(state.cta_label_ko)}" placeholder="예) 지금 예약하기" /></label>
         <label class="field"><span>버튼명 EN</span><input id="hf_cta_en" type="text" value="${escapeAttr(state.cta_label_en)}" placeholder="e.g. Book Now" /></label>
         <label class="field"><span>링크 URL <span style="color:#e74c3c">*</span></span><input id="hf_cta_url" type="text" value="${escapeAttr(state.cta_url)}" placeholder="예) /hotel 또는 https://..." /></label>
         <p class="field-hint">내부(/…)·외부(https://) 모두 허용. 외부 URL은 새 탭. CTA 사용 시 버튼명 KO·URL 필수.</p>`
      : "";

    main.innerHTML = `
      <h2 class="page-title">히어로 슬라이드 ${isEdit ? "수정" : "등록"}</h2>
      <p class="page-desc">프런트 메인 최상단 슬라이드. 이미지는 <strong>URL 입력</strong> 방식(용량 이슈로 파일 업로드 대신).</p>

      <div class="card">
        <h3 class="section-title">① 미디어</h3>
        <label class="field"><span>유형</span>
          <select id="hf_type"><option value="image" ${state.media_type === "image" ? "selected" : ""}>이미지</option><option value="video" ${state.media_type === "video" ? "selected" : ""}>동영상</option></select>
        </label>
        ${mediaBlock}
      </div>

      <div class="card">
        <h3 class="section-title">② 텍스트 <span style="font-size:12px;font-weight:400;color:#888">(KO/EN)</span></h3>
        <label class="field"><span>타이틀 KO</span><input id="hf_title_ko" type="text" value="${escapeAttr(state.title_ko)}" placeholder="예) 하이원의 봄" /></label>
        <label class="field"><span>타이틀 EN</span><input id="hf_title_en" type="text" value="${escapeAttr(state.title_en)}" placeholder="e.g. Spring at High1" /></label>
        <label class="field"><span>서브타이틀 KO</span><input id="hf_sub_ko" type="text" value="${escapeAttr(state.subtitle_ko)}" /></label>
        <label class="field"><span>서브타이틀 EN</span><input id="hf_sub_en" type="text" value="${escapeAttr(state.subtitle_en)}" /></label>
      </div>

      <div class="card">
        <h3 class="section-title">③ 노출 설정</h3>
        <div class="form-grid">
          <label class="field"><span>노출 시작일</span><input id="hf_ps" type="date" value="${escapeAttr(state.period_start)}" /></label>
          <label class="field"><span>노출 종료일</span><input id="hf_pe" type="date" value="${escapeAttr(state.period_end)}" /></label>
        </div>
        <p class="field-hint">비워두면 상시 노출. 종료일 경과 시 자동 OFF.</p>
        <label class="field"><span>강제 종료</span><select id="hf_force"><option value="off" ${!state.force_off ? "selected" : ""}>OFF</option><option value="on" ${state.force_off ? "selected" : ""}>ON (즉시 비노출)</option></select></label>
      </div>

      <div class="card">
        <h3 class="section-title">④ CTA 버튼</h3>
        <label class="field"><span>CTA 사용</span><select id="hf_cta_use"><option value="on" ${state.cta_use ? "selected" : ""}>사용</option><option value="off" ${!state.cta_use ? "selected" : ""}>미사용</option></select></label>
        ${ctaBlock}
      </div>

      <div class="wizard-actions wizard-actions--sticky">
        <a href="#/main-management" class="btn">목록</a>
        <div class="wizard-actions-trailing">
          <a href="#/main-management" class="btn">취소</a>
          <button type="button" class="btn btn-primary" id="hf_save" style="background:#10b981;border-color:#10b981">${isEdit ? "저장" : "등록"}</button>
        </div>
      </div>
      <p id="hf_err" class="error" style="min-height:20px"></p>
    `;

    document.getElementById("hf_type")?.addEventListener("change", () => {
      persist();
      render();
    });
    document.getElementById("hf_cta_use")?.addEventListener("change", () => {
      persist();
      render();
    });
    const pcInp = document.getElementById("hf_pc");
    if (pcInp) pcInp.addEventListener("change", () => { persist(); render(); }); // 미리보기 갱신

    document.getElementById("hf_save")?.addEventListener("click", () => {
      persist();
      const err = document.getElementById("hf_err");
      if (state.media_type === "image" && !state.pc_image) {
        err.textContent = "PC 이미지 URL을 입력하세요.";
        return;
      }
      if (state.media_type === "video" && !state.video_url) {
        err.textContent = "동영상 URL을 입력하세요.";
        return;
      }
      if (state.cta_use && (!state.cta_label_ko.trim() || !state.cta_url.trim())) {
        err.textContent = "CTA 사용 시 버튼명 KO와 링크 URL은 필수입니다.";
        return;
      }
      const list = loadMainHero();
      const idx = list.findIndex((h) => h.id === state.id);
      const now = new Date().toISOString();
      const record = { ...state, updated_at: now };
      if (idx >= 0) list[idx] = { ...list[idx], ...record };
      else {
        record.created_at = now;
        list.push(record);
      }
      saveMainHero(list);
      navigate("main-management");
    });
  }
  render();
}
/** S12-C 추천 섹션 설정 (카테고리→숙소→객실 자동/수동 + 선택 팝업) */
function renderSectionForm(main, editId) {
  const sections = loadMainSection();
  const existing = editId ? sections.find((s) => s.id === editId) : null;
  const isEdit = !!existing;
  const state = {
    id: existing?.id || uid(),
    title_ko: existing?.title_ko || "",
    title_en: existing?.title_en || "",
    subtitle_ko: existing?.subtitle_ko || "",
    subtitle_en: existing?.subtitle_en || "",
    visible: existing?.visible !== false,
    period_start: existing?.period_start || "",
    period_end: existing?.period_end || "",
    viewall_use: existing?.viewall_use ?? true,
    viewall_label_ko: existing?.viewall_label_ko || "",
    viewall_label_en: existing?.viewall_label_en || "",
    viewall_url: existing?.viewall_url || "",
    cat_1depth: Array.isArray(existing?.cat_1depth) ? [...existing.cat_1depth] : [],
    place_ids: Array.isArray(existing?.place_ids) ? [...existing.place_ids] : [],
    tab_enabled: !!existing?.tab_enabled,
    room_mode: existing?.room_mode === "manual" ? "manual" : "auto",
    sort_type: existing?.sort_type || "price",
    room_ids: Array.isArray(existing?.room_ids) ? [...existing.room_ids] : [],
    order: existing?.order ?? sections.length,
    popupOpen: false,
  };

  const allPlaces = loadPlaces();
  const placeById = new Map(allPlaces.map((p) => [p.id, p]));
  const allRooms = loadRooms().filter((r) => r.visibility !== "HIDE");
  const roomById = new Map(allRooms.map((r) => [r.id, r]));
  const catOf = (p) => (p.category === "CONDO" ? "condo" : "hotel");
  const roomLabel = (r) => {
    const pl = placeById.get(r.place_id);
    const occ = r.standard_occupancy != null ? `기준${r.standard_occupancy}-최대${r.max_occupancy ?? "?"}` : "";
    const sz = r.room_size_sqm ? `${r.room_size_sqm}m²` : "";
    const meta = [occ, sz].filter(Boolean).join(" , ");
    return `${pl ? pl.place_name + " — " : ""}${r.room_name_en || r.room_name || r.rm_typ_cd || "객실"}${meta ? " , " + meta : ""}`;
  };

  function catPlaces() {
    return allPlaces.filter((p) => state.cat_1depth.includes(catOf(p)));
  }
  function targetPlaceIds() {
    return state.place_ids.length ? state.place_ids : catPlaces().map((p) => p.id);
  }
  function candidateRooms() {
    const ids = new Set(targetPlaceIds());
    return allRooms.filter((r) => ids.has(r.place_id));
  }

  function persistBasics() {
    const v = (id) => document.getElementById(id);
    if (v("sf_title_ko")) state.title_ko = v("sf_title_ko").value;
    if (v("sf_title_en")) state.title_en = v("sf_title_en").value;
    if (v("sf_sub_ko")) state.subtitle_ko = v("sf_sub_ko").value;
    if (v("sf_sub_en")) state.subtitle_en = v("sf_sub_en").value;
    if (v("sf_visible")) state.visible = v("sf_visible").value === "on";
    if (v("sf_ps")) state.period_start = v("sf_ps").value;
    if (v("sf_pe")) state.period_end = v("sf_pe").value;
    if (v("sf_va_use")) state.viewall_use = v("sf_va_use").value === "on";
    if (v("sf_va_ko")) state.viewall_label_ko = v("sf_va_ko").value;
    if (v("sf_va_en")) state.viewall_label_en = v("sf_va_en").value;
    if (v("sf_va_url")) state.viewall_url = v("sf_va_url").value.trim();
    if (v("sf_sort")) state.sort_type = v("sf_sort").value;
    // 체크박스류
    const cats = [...main.querySelectorAll(".sf-cat:checked")].map((c) => c.value);
    if (main.querySelector(".sf-cat")) state.cat_1depth = cats;
    if (main.querySelector(".sf-place")) state.place_ids = [...main.querySelectorAll(".sf-place:checked")].map((c) => c.value);
    if (v("sf_tab")) state.tab_enabled = v("sf_tab").value === "on";
    if (v("sf_mode")) state.room_mode = v("sf_mode").value === "manual" ? "manual" : "auto";
    // place_ids 중 현재 카테고리에서 벗어난 것 정리
    const validPids = new Set(catPlaces().map((p) => p.id));
    state.place_ids = state.place_ids.filter((id) => validPids.has(id));
    // room_ids 중 후보 벗어난 것 정리
    const cand = new Set(candidateRooms().map((r) => r.id));
    state.room_ids = state.room_ids.filter((id) => cand.has(id));
  }

  function render() {
    const twoDepthBlock = state.cat_1depth.length
      ? `<div class="wf-form-field" style="margin-top:6px">
          <div style="border:1px solid #ddd;border-radius:4px;padding:8px 10px;background:#fff;font-size:12px">
            <div style="color:#888;font-size:10px;margin-bottom:6px">2뎁스 — 숙소 선택 (미선택 시 카테고리 전체)</div>
            ${catPlaces()
              .map((p) => `<label style="display:flex;align-items:center;gap:6px;padding:3px 0;cursor:pointer"><input type="checkbox" class="sf-place" value="${escapeAttr(p.id)}" ${state.place_ids.includes(p.id) ? "checked" : ""}> ${escapeHtml(p.place_name)}</label>`)
              .join("") || `<span class="muted">해당 카테고리 숙소가 없습니다.</span>`}
          </div>
        </div>`
      : `<p class="field-hint" style="color:#f59e0b">▲ 1뎁스(Hotel/Condo)를 먼저 선택하면 숙소 목록이 표시됩니다.</p>`;

    const tabBlock =
      state.place_ids.length >= 2
        ? `<label class="field"><span>탭 분리</span><select id="sf_tab"><option value="on" ${state.tab_enabled ? "selected" : ""}>ON (숙소별 탭)</option><option value="off" ${!state.tab_enabled ? "selected" : ""}>OFF (통합)</option></select></label>`
        : `<p class="field-hint">탭 분리는 2뎁스 숙소를 <strong>2개 이상</strong> 선택하면 활성화됩니다. (현재 통합 그리드)</p>`;

    const autoBlock = `<label class="field"><span>정렬 기준</span><select id="sf_sort">
        <option value="price" ${state.sort_type === "price" ? "selected" : ""}>가격순 (낮은순)</option>
        <option value="az" ${state.sort_type === "az" ? "selected" : ""}>A-Z</option>
        <option value="za" ${state.sort_type === "za" ? "selected" : ""}>Z-A</option>
        <option value="popular" ${state.sort_type === "popular" ? "selected" : ""}>인기순</option>
      </select></label>`;

    const manualList = state.room_ids.length
      ? state.room_ids
          .map((id) => {
            const r = roomById.get(id);
            return `<div style="display:flex;align-items:center;gap:8px;padding:6px 4px;border-bottom:1px solid #f0f0eb;font-size:12px">
              <span style="flex:1">${r ? escapeHtml(roomLabel(r)) : `<span style="color:#e74c3c">삭제된/숨김 객실 (${escapeHtml(id)})</span>`}</span>
              <button type="button" class="btn btn-ghost btn-danger sf-room-rm" data-id="${escapeAttr(id)}" style="padding:1px 6px">제거</button>
            </div>`;
          })
          .join("")
      : `<p class="muted" style="padding:6px 0">선택된 객실이 없습니다. [객실 선택]으로 추가하세요.</p>`;
    const manualBlock = `
      <div style="display:flex;align-items:center;gap:10px;margin-bottom:8px">
        <button type="button" class="btn" id="sf_pick">객실 선택</button>
        <span style="font-size:12px;color:#555">선택됨: <strong>${state.room_ids.length}</strong> / 10</span>
      </div>
      <div style="border:1px solid #ddd;border-radius:4px;background:#fff;padding:6px 8px">${manualList}</div>`;

    const popup = state.popupOpen ? renderPickPopup() : "";

    main.innerHTML = `
      <h2 class="page-title">추천 섹션 ${isEdit ? "수정" : "등록"}</h2>
      <p class="page-desc">프런트 메인 추천 섹션. 카테고리→숙소→객실 순으로 노출 범위를 정합니다. (숙소 집중)</p>

      <div class="card">
        <h3 class="section-title">① 기본 정보 <span style="font-size:12px;font-weight:400;color:#888">(KO/EN)</span></h3>
        <label class="field"><span>타이틀 KO <span style="color:#e74c3c">*</span></span><input id="sf_title_ko" type="text" value="${escapeAttr(state.title_ko)}" placeholder="예) 이번 주 추천 호텔" /></label>
        <label class="field"><span>타이틀 EN</span><input id="sf_title_en" type="text" value="${escapeAttr(state.title_en)}" /></label>
        <label class="field"><span>서브타이틀 KO</span><input id="sf_sub_ko" type="text" value="${escapeAttr(state.subtitle_ko)}" /></label>
        <label class="field"><span>서브타이틀 EN</span><input id="sf_sub_en" type="text" value="${escapeAttr(state.subtitle_en)}" /></label>
        <div class="form-grid">
          <label class="field"><span>노출 여부</span><select id="sf_visible"><option value="on" ${state.visible ? "selected" : ""}>노출</option><option value="off" ${!state.visible ? "selected" : ""}>미노출</option></select></label>
          <label class="field"><span>노출 시작일</span><input id="sf_ps" type="date" value="${escapeAttr(state.period_start)}" /></label>
          <label class="field"><span>노출 종료일</span><input id="sf_pe" type="date" value="${escapeAttr(state.period_end)}" /></label>
        </div>
        <label class="field"><span>전체보기 버튼</span><select id="sf_va_use"><option value="on" ${state.viewall_use ? "selected" : ""}>사용</option><option value="off" ${!state.viewall_use ? "selected" : ""}>미사용</option></select></label>
        ${
          state.viewall_use
            ? `<label class="field"><span>버튼명 KO <span style="color:#e74c3c">*</span></span><input id="sf_va_ko" type="text" value="${escapeAttr(state.viewall_label_ko)}" placeholder="전체보기" /></label>
               <label class="field"><span>버튼명 EN</span><input id="sf_va_en" type="text" value="${escapeAttr(state.viewall_label_en)}" placeholder="View All" /></label>
               <label class="field"><span>링크 URL <span style="color:#e74c3c">*</span></span><input id="sf_va_url" type="text" value="${escapeAttr(state.viewall_url)}" placeholder="예) /hotel 또는 https://..." /></label>`
            : ""
        }
      </div>

      <div class="card">
        <h3 class="section-title">② 카테고리 설정</h3>
        <div class="wf-form-field">
          <div style="font-size:11px;margin-bottom:4px">1뎁스 <span style="color:#e74c3c">*</span> (복수 선택)</div>
          <div style="display:flex;gap:20px">
            <label style="display:flex;align-items:center;gap:6px;cursor:pointer"><input type="checkbox" class="sf-cat" value="hotel" ${state.cat_1depth.includes("hotel") ? "checked" : ""}> Hotel</label>
            <label style="display:flex;align-items:center;gap:6px;cursor:pointer"><input type="checkbox" class="sf-cat" value="condo" ${state.cat_1depth.includes("condo") ? "checked" : ""}> Condo</label>
          </div>
        </div>
        ${twoDepthBlock}
        ${tabBlock}
      </div>

      <div class="card">
        <h3 class="section-title">③ 객실 선택 방식</h3>
        <label class="field"><span>선택 방식 <span style="color:#e74c3c">*</span></span><select id="sf_mode"><option value="auto" ${state.room_mode === "auto" ? "selected" : ""}>자동 (정렬 기준 상위)</option><option value="manual" ${state.room_mode === "manual" ? "selected" : ""}>수동 (직접 선택)</option></select></label>
        ${state.room_mode === "auto" ? autoBlock : manualBlock}
      </div>

      <div class="wizard-actions wizard-actions--sticky">
        <a href="#/main-management" class="btn">목록</a>
        <div class="wizard-actions-trailing">
          <a href="#/main-management" class="btn">취소</a>
          <button type="button" class="btn btn-primary" id="sf_save" style="background:#10b981;border-color:#10b981">${isEdit ? "저장" : "등록"}</button>
        </div>
      </div>
      <p id="sf_err" class="error" style="min-height:20px"></p>
      ${popup}
    `;

    // 리렌더 트리거 (카테고리·숙소·방식·전체보기 변경 시)
    main.querySelectorAll(".sf-cat").forEach((c) => c.addEventListener("change", () => { persistBasics(); render(); }));
    main.querySelectorAll(".sf-place").forEach((c) => c.addEventListener("change", () => { persistBasics(); render(); }));
    document.getElementById("sf_mode")?.addEventListener("change", () => { persistBasics(); render(); });
    document.getElementById("sf_va_use")?.addEventListener("change", () => { persistBasics(); render(); });

    document.getElementById("sf_pick")?.addEventListener("click", () => { persistBasics(); state.popupOpen = true; render(); });
    main.querySelectorAll(".sf-room-rm").forEach((b) => b.addEventListener("click", () => { persistBasics(); state.room_ids = state.room_ids.filter((x) => x !== b.getAttribute("data-id")); render(); }));

    bindPopupEvents();

    document.getElementById("sf_save")?.addEventListener("click", () => {
      persistBasics();
      const err = document.getElementById("sf_err");
      if (!state.title_ko.trim()) { err.textContent = "타이틀 KO는 필수입니다."; return; }
      if (!state.cat_1depth.length) { err.textContent = "1뎁스(Hotel/Condo)를 1개 이상 선택하세요."; return; }
      if (state.viewall_use && (!state.viewall_label_ko.trim() || !state.viewall_url.trim())) { err.textContent = "전체보기 사용 시 버튼명 KO·URL은 필수입니다."; return; }
      if (state.room_mode === "manual" && !state.room_ids.length) { err.textContent = "수동 선택 시 객실을 1개 이상 선택하세요."; return; }
      const list = loadMainSection();
      const idx = list.findIndex((s) => s.id === state.id);
      const now = new Date().toISOString();
      const rec = { ...state, updated_at: now };
      delete rec.popupOpen;
      if (idx >= 0) list[idx] = { ...list[idx], ...rec };
      else { rec.created_at = now; list.push(rec); }
      saveMainSection(list);
      navigate("main-management");
    });
  }

  function renderPickPopup() {
    const cand = candidateRooms();
    const byPlace = new Map();
    cand.forEach((r) => {
      if (!byPlace.has(r.place_id)) byPlace.set(r.place_id, []);
      byPlace.get(r.place_id).push(r);
    });
    const groups = [...byPlace.entries()]
      .map(([pid, rms]) => {
        const pl = placeById.get(pid);
        const rows = rms
          .map((r) => {
            const checked = state.room_ids.includes(r.id);
            return `<label style="display:flex;align-items:center;gap:8px;padding:7px 12px;font-size:12px;cursor:pointer;border-bottom:1px solid #f0f0eb;${checked ? "background:#f0fdf4" : ""}"><input type="checkbox" class="sf-pick-room" value="${escapeAttr(r.id)}" ${checked ? "checked" : ""}> ${escapeHtml(roomLabel(r))}</label>`;
          })
          .join("");
        return `<div style="font-size:11px;font-weight:700;color:#555;background:#f8f8f5;padding:5px 12px;border-bottom:1px solid #e8e8e2">${escapeHtml(pl?.place_name || "숙소")}</div>${rows}`;
      })
      .join("");
    return `
      <div style="position:fixed;inset:0;background:rgba(20,25,40,.55);display:flex;align-items:center;justify-content:center;z-index:100" id="sf_popup_dim">
        <div style="background:#fff;border-radius:8px;width:520px;max-width:92vw;max-height:82vh;display:flex;flex-direction:column;overflow:hidden;box-shadow:0 10px 30px rgba(0,0,0,.3)">
          <div style="background:#1a1f2e;padding:10px 16px;display:flex;align-items:center;justify-content:space-between">
            <span style="color:#fff;font-weight:700;font-size:13px">객실 선택</span>
            <span style="color:rgba(255,255,255,.8);font-size:12px">선택: <strong style="color:#6ee7b7" id="sf_pick_count">${state.room_ids.length}</strong> / 10</span>
          </div>
          <div style="flex:1;overflow-y:auto">${groups || `<p class="muted" style="padding:16px">후보 객실이 없습니다. 카테고리·숙소를 먼저 선택하세요.</p>`}</div>
          <div style="border-top:1px solid #e8e8e2;padding:8px 14px;display:flex;justify-content:flex-end;gap:8px;background:#fafaf8">
            <button type="button" class="btn" id="sf_pick_cancel">취소</button>
            <button type="button" class="btn btn-primary" id="sf_pick_apply" style="background:#10b981;border-color:#10b981">적용</button>
          </div>
        </div>
      </div>`;
  }

  function bindPopupEvents() {
    if (!state.popupOpen) return;
    // 팝업 임시 선택 상태(적용 전까지 state 미반영)
    let temp = [...state.room_ids];
    const countEl = () => document.getElementById("sf_pick_count");
    main.querySelectorAll(".sf-pick-room").forEach((cb) => {
      cb.addEventListener("change", () => {
        const id = cb.value;
        if (cb.checked) {
          if (temp.length >= 10 && !temp.includes(id)) { cb.checked = false; alert("최대 10개까지 선택할 수 있습니다."); return; }
          if (!temp.includes(id)) temp.push(id);
        } else {
          temp = temp.filter((x) => x !== id);
        }
        if (countEl()) countEl().textContent = String(temp.length);
      });
    });
    document.getElementById("sf_pick_apply")?.addEventListener("click", () => {
      state.room_ids = temp;
      state.popupOpen = false;
      render();
    });
    document.getElementById("sf_pick_cancel")?.addEventListener("click", () => { state.popupOpen = false; render(); });
    document.getElementById("sf_popup_dim")?.addEventListener("click", (e) => { if (e.target.id === "sf_popup_dim") { state.popupOpen = false; render(); } });
  }

  render();
}

function boot() {
  window.addEventListener("hashchange", () => {
    routeWrap();
  });
  const logout = document.getElementById("btn-logout");
  if (logout) logout.addEventListener("click", () => alert("로그아웃 (프로토타입 목업)"));
  const lang = document.getElementById("lang-select");
  if (lang) lang.addEventListener("change", () => alert("언어 전환은 프로토타입 목업입니다."));
  routeWrap();
}

function route() {
  const { path, parts } = parseHash();
  const main = document.getElementById("main");
  if (!main) return;

  // ── 미구현(MOCK) 섹션 ──
  if (parts[0] === "tours") { renderComingSoon(main, "투어관리", true); return; }
  if (parts[0] === "reservations") { renderComingSoon(main, "예약관리", false); return; }

  // ── 티켓 도메인 ──
  if (parts[0] === "ticket-categories") {
    if (parts[1] === "edit" && parts[2]) { renderTicketCategoryContent(main, parts[2]); return; }
    renderTicketCategoryList(main);
    return;
  }
  if (parts[0] === "coupon-specs") {
    renderCouponSpecPage(main, parts[1] === "history" ? "history" : "list");
    return;
  }
  if (parts[0] === "ticket-products") {
    if (parts.length === 2 && parts[1] === "new") { renderTicketProductForm(main, null); return; }
    if (parts.length === 3 && parts[1] === "edit" && parts[2]) { renderTicketProductForm(main, parts[2]); return; }
    renderTicketProductList(main);
    return;
  }

  if (parts[0] === "room-masters") {
    const tab = parts[1] === "beds" ? "beds" : "types";
    renderRoomMastersPage(main, tab);
    return;
  }

  if (parts[0] === "margin-management") {
    renderMarginMaster(main);
    return;
  }

  if (parts[0] === "main-management") {
    if (parts[1] === "hero" && parts[2] === "new") {
      renderHeroForm(main, null);
      return;
    }
    if (parts[1] === "hero" && parts[2] === "edit" && parts[3]) {
      renderHeroForm(main, parts[3]);
      return;
    }
    if (parts[1] === "section" && parts[2] === "new") {
      renderSectionForm(main, null);
      return;
    }
    if (parts[1] === "section" && parts[2] === "new-ticket") {
      renderTicketSectionForm(main, null);
      return;
    }
    if (parts[1] === "section" && parts[2] === "edit" && parts[3]) {
      const sec = loadMainSection().find((s) => s.id === parts[3]);
      if (sec && sec.type === "ticket") renderTicketSectionForm(main, parts[3]);
      else renderSectionForm(main, parts[3]);
      return;
    }
    renderMainManagement(main);
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

/* ── 티켓 전용 추천 섹션 폼 (숙소 섹션과 분리) ── */
function renderTicketSectionForm(main, editId) {
  ensureTicketStores();
  const sections = loadMainSection();
  const existing = editId ? sections.find((s) => s.id === editId) : null;
  const products = loadTicketProducts();
  const tops = ticketTopCategories();
  const state = {
    id: existing?.id || uid(),
    type: "ticket",
    title_ko: existing?.title_ko || "", title_en: existing?.title_en || "",
    subtitle_ko: existing?.subtitle_ko || "", subtitle_en: existing?.subtitle_en || "",
    visible: existing?.visible !== false,
    period_start: existing?.period_start || "", period_end: existing?.period_end || "",
    viewall_use: existing?.viewall_use ?? true,
    viewall_label_ko: existing?.viewall_label_ko || "", viewall_label_en: existing?.viewall_label_en || "",
    ticket_mode: existing?.ticket_mode === "manual" ? "manual" : "auto",
    ticket_sort: existing?.ticket_sort === "name" ? "name" : "price",
    ticket_cats: Array.isArray(existing?.ticket_cats) ? [...existing.ticket_cats] : [],
    ticket_product_ids: Array.isArray(existing?.ticket_product_ids) ? [...existing.ticket_product_ids] : [],
    order: existing?.order ?? sections.length,
  };
  const inp = "width:100%;padding:8px;border:1px solid #ddd;border-radius:6px";
  function sync() {
    const v = (id) => main.querySelector("#" + id);
    if (v("ts_title_ko")) state.title_ko = v("ts_title_ko").value;
    if (v("ts_title_en")) state.title_en = v("ts_title_en").value;
    if (v("ts_sub_ko")) state.subtitle_ko = v("ts_sub_ko").value;
    if (v("ts_sub_en")) state.subtitle_en = v("ts_sub_en").value;
    if (v("ts_visible")) state.visible = v("ts_visible").value === "on";
    if (v("ts_ps")) state.period_start = v("ts_ps").value;
    if (v("ts_pe")) state.period_end = v("ts_pe").value;
    if (v("ts_va_use")) state.viewall_use = v("ts_va_use").value === "on";
    if (v("ts_va_ko")) state.viewall_label_ko = v("ts_va_ko").value;
    if (v("ts_va_en")) state.viewall_label_en = v("ts_va_en").value;
    if (v("ts_sort")) state.ticket_sort = v("ts_sort").value;
    if (v("ts_order")) state.order = parseInt(v("ts_order").value, 10) || 0;
    if (main.querySelector(".ts-cat")) state.ticket_cats = [...main.querySelectorAll(".ts-cat:checked")].map((c) => c.value);
    if (main.querySelector(".ts-prod")) state.ticket_product_ids = [...main.querySelectorAll(".ts-prod:checked")].map((c) => c.value);
    if (v("ts_mode")) state.ticket_mode = v("ts_mode").value === "manual" ? "manual" : "auto";
  }
  function render() {
    const autoBlock = `
      <label class="field"><span>카테고리 필터 <span style="color:var(--muted)">미선택=전체</span></span></label>
      <div style="border:1px solid #ddd;border-radius:6px;padding:8px 10px;background:#fff;font-size:13px;display:flex;flex-wrap:wrap;gap:12px">
        ${tops.map((t) => `<label style="display:flex;align-items:center;gap:6px;cursor:pointer"><input type="checkbox" class="ts-cat" value="${escapeAttr(t.name_ko)}" ${state.ticket_cats.includes(t.name_ko) ? "checked" : ""}> ${escapeHtml(t.name_ko)}</label>`).join("")}
      </div>
      <label class="field" style="margin-top:10px"><span>정렬 기준</span>
        <select id="ts_sort" style="${inp}"><option value="price" ${state.ticket_sort === "price" ? "selected" : ""}>최저가 낮은순</option><option value="name" ${state.ticket_sort === "name" ? "selected" : ""}>이름순</option></select></label>`;
    const manualBlock = `
      <label class="field"><span>티켓 상품 선택 <span style="color:#d33">*</span> <span style="color:var(--muted)">— 선택 ${state.ticket_product_ids.length}개</span></span></label>
      <div style="border:1px solid #ddd;border-radius:6px;padding:6px 10px;background:#fff;max-height:280px;overflow:auto">
        ${products.length ? products.map((p) => `<label style="display:flex;align-items:center;gap:8px;padding:5px 0;border-bottom:1px solid #f0f0eb;font-size:12px;cursor:pointer"><input type="checkbox" class="ts-prod" value="${escapeAttr(p.id)}" ${state.ticket_product_ids.includes(p.id) ? "checked" : ""}> <span class="badge" style="background:#fce7f3;color:#ec4899">${escapeHtml(p.category_1)}${p.category_2 ? " › " + escapeHtml(p.category_2) : ""}</span> ${escapeHtml(p.name_en)}</label>`).join("") : `<span class="muted">티켓 상품이 없습니다. 티켓 상품 등록 후 이용하세요.</span>`}
      </div>`;
    main.innerHTML = `
      <h2 class="page-title">티켓 추천 섹션 ${existing ? "수정" : "등록"} <span class="badge" style="background:#fce7f3;color:#ec4899">티켓</span></h2>
      <p class="page-desc">프런트 메인에 노출되는 <strong>티켓 전용 추천 섹션</strong>입니다. 카드=썸네일·상품명·최저가, 클릭 시 해당 카테고리 브릿지로 이동합니다. (숙소 섹션과 분리)</p>
      <div class="card">
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px">
          <label class="field"><span>섹션 타이틀 (KO) <span style="color:#d33">*</span></span><input id="ts_title_ko" value="${escapeAttr(state.title_ko)}" style="${inp}"></label>
          <label class="field"><span>섹션 타이틀 (EN)</span><input id="ts_title_en" value="${escapeAttr(state.title_en)}" style="${inp}"></label>
          <label class="field"><span>서브타이틀 (KO)</span><input id="ts_sub_ko" value="${escapeAttr(state.subtitle_ko)}" style="${inp}"></label>
          <label class="field"><span>서브타이틀 (EN)</span><input id="ts_sub_en" value="${escapeAttr(state.subtitle_en)}" style="${inp}"></label>
          <label class="field"><span>노출 여부</span><select id="ts_visible" style="${inp}"><option value="on" ${state.visible ? "selected" : ""}>노출</option><option value="off" ${!state.visible ? "selected" : ""}>미노출</option></select></label>
          <label class="field"><span>노출 순서</span><input id="ts_order" type="number" value="${state.order}" style="${inp}"></label>
          <label class="field"><span>노출 시작일 <span style="color:var(--muted)">선택</span></span><input id="ts_ps" type="date" value="${escapeAttr(state.period_start)}" style="${inp}"></label>
          <label class="field"><span>노출 종료일 <span style="color:var(--muted)">선택</span></span><input id="ts_pe" type="date" value="${escapeAttr(state.period_end)}" style="${inp}"></label>
        </div>
      </div>
      <div class="card">
        <h3 style="margin-top:0">전체보기 버튼</h3>
        <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:14px">
          <label class="field"><span>사용 여부</span><select id="ts_va_use" style="${inp}"><option value="on" ${state.viewall_use ? "selected" : ""}>사용</option><option value="off" ${!state.viewall_use ? "selected" : ""}>미사용</option></select></label>
          <label class="field"><span>라벨 (KO)</span><input id="ts_va_ko" value="${escapeAttr(state.viewall_label_ko)}" placeholder="전체보기" style="${inp}"></label>
          <label class="field"><span>라벨 (EN)</span><input id="ts_va_en" value="${escapeAttr(state.viewall_label_en)}" placeholder="View all" style="${inp}"></label>
        </div>
      </div>
      <div class="card">
        <label class="field"><span>선택 방식 <span style="color:#d33">*</span></span>
          <select id="ts_mode" style="${inp}"><option value="auto" ${state.ticket_mode === "auto" ? "selected" : ""}>자동 (카테고리 필터 + 정렬)</option><option value="manual" ${state.ticket_mode === "manual" ? "selected" : ""}>수동 (상품 직접 선택)</option></select></label>
        <div style="margin-top:10px">${state.ticket_mode === "manual" ? manualBlock : autoBlock}</div>
      </div>
      <p id="ts_err" class="error"></p>
      <div class="toolbar" style="gap:8px">
        <button type="button" class="btn js-ts-cancel">취소</button>
        <button type="button" class="btn btn-primary js-ts-save">저장</button>
      </div>`;
    main.querySelector("#ts_mode").addEventListener("change", () => { sync(); render(); });
    main.querySelector(".js-ts-cancel").addEventListener("click", () => navigate("main-management"));
    main.querySelector(".js-ts-save").addEventListener("click", () => {
      sync();
      const err = main.querySelector("#ts_err"); err.textContent = "";
      if (!state.title_ko.trim() && !state.title_en.trim()) { err.textContent = "섹션 타이틀(KO 또는 EN)을 입력하세요."; return; }
      if (state.ticket_mode === "manual" && !state.ticket_product_ids.length) { err.textContent = "수동 선택 시 티켓 상품을 1개 이상 선택하세요."; return; }
      if (state.period_start && state.period_end && state.period_start > state.period_end) { err.textContent = "노출 종료일이 시작일보다 빠릅니다."; return; }
      const list = loadMainSection();
      const rec = { ...state };
      const idx = list.findIndex((x) => x.id === state.id);
      const now = new Date().toISOString();
      if (idx >= 0) list[idx] = { ...list[idx], ...rec, updated_at: now };
      else { rec.created_at = now; list.push(rec); }
      saveMainSection(list);
      alert("티켓 섹션이 저장되었습니다.");
      navigate("main-management");
    });
  }
  render();
}

function routeWrap() {
  renderChrome();
  route();
}

// --- Place list ---

function renderPlaceList(main) {
  const places = loadPlaces();
  const rooms = loadRooms();
  const products = loadProducts();
  const placeProductCount = productCountByPlaceId(products, rooms);
  const untranslated = places.filter((p) => !p.place_name_en && p.place_name).length;
  const rows = places
    .slice()
    .sort((a, b) => (b.updated_at || "").localeCompare(a.updated_at || ""))
    .map(
      (p) => {
        const imgCount = Array.isArray(p.image_meta) ? p.image_meta.length : 0;
        return `
    <tr data-id="${p.id}">
      <td>${escapeHtml(p.place_code)}</td>
      <td>${escapeHtml(p.place_name)}${imgCount ? ` <span class="badge" style="background:#eef;color:#4457c7">img:${imgCount}</span>` : ""}</td>
      <td><span class="badge ${p.category === "CONDO" ? "" : "on"}">${p.category === "CONDO" ? "CONDO" : "HOTEL"}</span></td>
      <td>${escapeHtml(subLabel(p.category, p.sub_place) || "-")}</td>
      <td><span class="badge ${p.visibility === "HIDE" ? "off" : "on"}">${visibilityLabel(p.visibility)}</span></td>
      <td>${escapeHtml(p.check_in_time || "-")} / ${escapeHtml(p.check_out_time || "-")}</td>
      <td><a class="btn btn-ghost" href="#/rooms/place/${p.id}">${rooms.filter((r) => r.place_id === p.id).length}</a></td>
      <td><a class="btn btn-ghost" href="#/products/place/${p.id}">${placeProductCount.get(p.id) || 0}</a></td>
      <td>${formatDate(p.updated_at)}</td>
      <td><button type="button" class="btn btn-ghost js-edit" data-id="${p.id}">수정</button></td>
    </tr>`;
      }
    )
    .join("");

  main.innerHTML = `
    <h2 class="page-title">숙소관리</h2>
    <p class="page-desc">스토어에 노출되는 숙소(호텔/콘도)를 관리합니다. <strong>신규 숙소는 PMS 동기화로만 생성됩니다.</strong> (프로토타입: PMS 연동은 더미 데이터로 시뮬레이션)</p>
    <div class="card">
      <div class="toolbar" style="justify-content:flex-end;gap:8px">
        <span style="color:var(--muted);font-size:13px;margin-right:auto">저장소: <code>${STORAGE_PLACES}</code></span>
        <button type="button" class="btn btn-primary js-pms-sync">PMS 동기화 / 갱신</button>
        <button type="button" class="btn js-ai-translate"${untranslated ? "" : " disabled"}>비영문 이름 AI 번역${untranslated ? ` (${untranslated})` : ""}</button>
      </div>
      <div class="notice" style="background:#fff9e6;border:1px solid #f0d98c;border-radius:6px;padding:8px 12px;font-size:13px;color:#7a5c00;margin-bottom:12px">
        여기서 수정한 내용은 C-side 숙소 카탈로그(이름, 히어로 이미지, 소개)에 반영되며, HIDE하면 스토어에서 숙소가 숨겨집니다. <strong>신규 숙소는 먼저 PMS를 동기화한 뒤, 여기서 보완 항목만 수정합니다.</strong>
      </div>
      ${
        places.length === 0
          ? `<div class="empty"><strong>동기화된 숙소가 없습니다.</strong> 상단 <strong>[PMS 동기화 / 갱신]</strong> 버튼을 눌러 PMS에서 숙소를 불러오세요. (최초 1회 필수)</div>`
          : `<table>
        <thead><tr>
          <th>숙소코드</th><th>숙소명</th><th>1차 분류</th><th>2차 구역</th><th>노출 여부</th>
          <th>체크인/체크아웃</th><th>객실수</th><th>상품연결</th>
          <th>수정일시</th><th>수정</th>
        </tr></thead>
        <tbody>${rows}</tbody>
      </table>`
      }
    </div>
  `;

  main.querySelectorAll(".js-edit").forEach((btn) => {
    btn.addEventListener("click", () => navigate("places/edit/" + btn.getAttribute("data-id")));
  });

  const syncBtn = main.querySelector(".js-pms-sync");
  if (syncBtn) {
    syncBtn.addEventListener("click", () => {
      if (!confirm("PMS에서 숙소 정보를 동기화(갱신)합니다.\nPMS 수신 항목(숙소명·분류·체크인 시간 등)은 갱신되고, 관리자 보완 항목(영문명·소개·정책·시설 등)은 유지됩니다.\n진행할까요?")) return;
      const n = syncPmsPlaces();
      alert(`PMS 동기화 완료 — 숙소 ${n}건 반영되었습니다.`);
      renderPlaceList(main);
    });
  }

  const aiBtn = main.querySelector(".js-ai-translate");
  if (aiBtn) {
    aiBtn.addEventListener("click", () => {
      const n = aiTranslatePlaceNames();
      alert(n ? `AI 번역 완료 — 영문명 ${n}건 자동 입력되었습니다. (더미)` : "번역할 미입력 영문명이 없습니다.");
      renderPlaceList(main);
    });
  }
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
    image_meta: existing?.image_meta || [],
    image_storage_warning: "",
    guide_html: existing?.guide_html || "",
    guide_html_en: existing?.guide_html_en || "",
    policy_html: existing?.policy_html || "",
    policy_html_en: existing?.policy_html_en || "",
    extra_fee_notes: Array.isArray(existing?.extra_fee_notes) ? existing.extra_fee_notes.map((n) => ({ en: n.en || "", zh: n.zh || "" })) : [],
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
        <label class="field"><span>위치 상세</span>
          ${richEditorHtml("f_loc_detail", state.location_detail, { minHeight: 140 })}
        </label>
        <p style="font-size:12px;color:var(--muted);margin:6px 0 12px;">툴바 [이미지 불러오기] 또는 스크린샷 Ctrl+V 붙여넣기로 이미지 삽입(자동 업로드·URL 저장).</p>
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
      const efn = Array.isArray(state.extra_fee_notes) ? state.extra_fee_notes : [];
      const efnRowsHtml = efn.length
        ? efn
            .map(
              (n, i) => `
          <div class="efn-row" style="display:flex;gap:6px;margin-bottom:6px;align-items:center">
            <input class="efn-en" placeholder="EN (필수)" value="${escapeHtml(n.en || "")}" style="flex:1" />
            <input class="efn-zh" placeholder="ZH (선택 · 미입력 시 EN 대체)" value="${escapeHtml(n.zh || "")}" style="flex:1" />
            <button type="button" class="btn btn-ghost efn-del" data-idx="${i}">삭제</button>
          </div>`
            )
            .join("")
        : `<p style="font-size:12px;color:var(--muted);margin:0 0 6px">등록된 추가요금 안내가 없습니다. [+ 항목 추가]로 입력하세요.</p>`;
      body = `
        <div class="dual">
          <label class="field"><span>숙소 안내</span>
            ${richEditorHtml("f_guide", state.guide_html, { minHeight: 200 })}
          </label>
          <label class="field"><span>숙소 안내(영문, 선택)</span>
            ${richEditorHtml("f_guide_en", state.guide_html_en, { minHeight: 200 })}
          </label>
          <label class="field"><span>정책 안내</span>
            ${richEditorHtml("f_policy", state.policy_html, { minHeight: 200 })}
          </label>
          <label class="field"><span>정책 안내(영문, 선택)</span>
            ${richEditorHtml("f_policy_en", state.policy_html_en, { minHeight: 200 })}
          </label>
        </div>
        <p style="font-size:12px;color:var(--muted);margin:0 0 14px;">각 입력칸 툴바의 <b>[이미지 불러오기]</b> 또는 스크린샷 <kbd>Ctrl</kbd>+<kbd>V</kbd> 붙여넣기로 이미지를 삽입할 수 있습니다. (이미지는 자동 업로드되어 URL로 저장)</p>

        <div class="field" style="margin-top:8px;border-top:1px solid var(--border, #e3e3e3);padding-top:14px">
          <span>추가요금 안내 (extra_fee_notes · 정보성, 결제와 무관)</span>
          <p style="font-size:12px;color:var(--muted);margin:2px 0 8px">한 줄에 하나씩 입력합니다. EN 필수·ZH 선택. 프런트 정책정보 탭 '추가요금' 블록에 목록으로 표시됩니다. (예: Extra bedding: KRW 15,000 per set / night)</p>
          <div id="efn_rows">${efnRowsHtml}</div>
          <div style="display:flex;gap:8px;margin-top:6px">
            <button type="button" class="btn" id="efn_add">+ 항목 추가</button>
            <button type="button" class="btn" id="efn_ai">AI 번역 (미입력 EN/ZH 자동 채움)</button>
          </div>
        </div>
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
    if (state.step === 4) {
      const addBtn = document.getElementById("efn_add");
      if (addBtn)
        addBtn.addEventListener("click", () => {
          syncStepFields();
          state.extra_fee_notes = state.extra_fee_notes || [];
          state.extra_fee_notes.push({ en: "", zh: "" });
          renderStep();
        });
      document.querySelectorAll(".efn-del").forEach((btn) => {
        btn.addEventListener("click", () => {
          syncStepFields();
          const i = parseInt(btn.getAttribute("data-idx"), 10);
          if (!Number.isNaN(i) && Array.isArray(state.extra_fee_notes)) state.extra_fee_notes.splice(i, 1);
          renderStep();
        });
      });
      const aiBtn = document.getElementById("efn_ai");
      if (aiBtn)
        aiBtn.addEventListener("click", () => {
          syncStepFields();
          // 더미 AI 번역: 미입력 영문/중문 자동 채움
          if (!state.guide_html_en && state.guide_html) state.guide_html_en = state.guide_html;
          if (!state.policy_html_en && state.policy_html) state.policy_html_en = state.policy_html;
          (state.extra_fee_notes || []).forEach((n) => {
            if (n.en && !n.zh) n.zh = n.en;
          });
          renderStep();
          alert("AI 번역(더미) 완료 — 미입력 영문/중문을 자동 채웠습니다.");
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
          const hero = await buildImageMetaSmart(f);
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
            rest.push(await buildImageMetaSmart(f));
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
    wireRichEditors(main);

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
      { const ld = document.getElementById("f_loc_detail"); if (ld) state.location_detail = ld.innerHTML.trim(); }
    } else if (step === 4) {
      const g = document.getElementById("f_guide");
      const p = document.getElementById("f_policy");
      if (g) state.guide_html = g.innerHTML.trim();
      if (p) state.policy_html = p.innerHTML.trim();
      const ge = document.getElementById("f_guide_en");
      const pe = document.getElementById("f_policy_en");
      if (ge) state.guide_html_en = ge.innerHTML.trim();
      if (pe) state.policy_html_en = pe.innerHTML.trim();
      const efnRowsEl = document.getElementById("efn_rows");
      if (efnRowsEl) {
        state.extra_fee_notes = Array.from(efnRowsEl.querySelectorAll(".efn-row"))
          .map((r) => ({
            en: (r.querySelector(".efn-en")?.value || "").trim(),
            zh: (r.querySelector(".efn-zh")?.value || "").trim(),
          }))
          .filter((x) => x.en || x.zh);
      }
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
      image_meta: state.image_meta,
      guide_html: state.guide_html,
      guide_html_en: state.guide_html_en,
      policy_html: state.policy_html,
      policy_html_en: state.policy_html_en,
      extra_fee_notes: (state.extra_fee_notes || []).filter((n) => n.en || n.zh),
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
  const t = tab === "beds" ? "beds" : "types"; // v0.5: 객실특징(traits) 탭 제거 — 객실/객실유형에서 특징 미사용
  const tabs = [
    { id: "types", label: "객실유형", href: "#/room-masters/types" },
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
      const nProd = roomProductCount.get(r.id) || 0;
      return `
      <tr>
        <td>${escapeHtml(r.room_code || "-")}</td>
        <td>${pl ? escapeHtml(pl.place_name) : "?"}</td>
        <td>${r.rm_typ_cd ? `<span class="badge" style="background:#eef;color:#4457c7">${escapeHtml(r.rm_typ_cd)}</span>` : "-"}</td>
        <td>${escapeHtml(r.room_name || "-")}</td>
        <td>${escapeHtml(String(r.standard_occupancy ?? "-"))}</td>
        <td>${escapeHtml(String(r.max_occupancy ?? "-"))}</td>
        <td><span class="badge ${r.visibility === "HIDE" ? "off" : "on"}">${visibilityLabel(r.visibility)}</span></td>
        <td><a class="btn btn-ghost" href="#/products/place/${escapeAttr(r.place_id)}">${nProd}개</a></td>
        <td>${formatDate(r.updated_at)}</td>
        <td><button type="button" class="btn btn-ghost js-room-edit" data-id="${escapeAttr(r.id)}">수정</button></td>
      </tr>`;
    })
    .join("");
  const untranslatedRooms = filtered.filter((r) => !r.room_name_en && r.room_name).length;

  main.innerHTML = `
    <h2 class="page-title">객실관리</h2>
    <p class="page-desc">각 숙소의 객실 유형을 관리합니다. <strong>신규 객실은 PMS 동기화로만 생성</strong>되고, 여기서 보완 항목을 편집합니다. (RM_TYP_CD = PMS 객실타입코드, 요금·재고·마진 기준 키)</p>
    <div class="card">
      <div class="toolbar room-list-toolbar" style="justify-content:space-between">
        <label class="field" style="flex-direction:row;align-items:center;gap:8px;margin:0;">
          <span style="font-weight:600;">숙소 필터</span>
          <select id="room_place_filter" style="min-width:220px;">${placeOpts}</select>
        </label>
        <div style="display:flex;gap:8px">
          <button type="button" class="btn btn-primary js-pms-room-sync">PMS 객실 동기화</button>
          <button type="button" class="btn btn-primary js-pms-inv-sync">재고·요금 동기화</button>
          <button type="button" class="btn js-ai-room-translate"${untranslatedRooms ? "" : " disabled"}>누락된 필드 AI 번역${untranslatedRooms ? ` (${untranslatedRooms})` : ""}</button>
        </div>
      </div>
      ${
        filtered.length === 0
          ? `<div class="empty"><strong>동기화된 객실이 없습니다.</strong> 상단 <strong>[PMS 객실 동기화]</strong> 버튼을 눌러 PMS에서 객실을 불러오세요. (숙소를 먼저 동기화해야 합니다 · 최초 1회 필수)</div>`
          : `<div class="room-list-table-wrap">
      <table class="room-list-table">
        <thead><tr>
          <th>객실코드</th><th>숙소</th><th>PMS 객실타입코드</th><th>객실명</th><th>기준인원</th><th>최대인원</th>
          <th>노출 여부</th><th>상품연결</th><th>수정일시</th><th>수정</th>
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

  const roomSyncBtn = main.querySelector(".js-pms-room-sync");
  if (roomSyncBtn) {
    roomSyncBtn.addEventListener("click", () => {
      if (loadPlaces().length === 0) {
        alert("먼저 숙소관리에서 [PMS 동기화]로 숙소를 불러오세요.");
        return;
      }
      if (!confirm("PMS에서 객실 정보를 동기화(갱신)합니다.\nRM_TYP_CD·객실명·인원 등 PMS 수신 항목은 갱신되고, 관리자 보완 항목(영문명·시설·침대구성 등)은 유지됩니다.\n진행할까요?")) return;
      const n = syncPmsRooms();
      alert(`PMS 객실 동기화 완료 — 객실 ${n}건 반영되었습니다.`);
      renderRoomList(main, placeFilterId);
    });
  }

  const invSyncBtn = main.querySelector(".js-pms-inv-sync");
  if (invSyncBtn) {
    invSyncBtn.addEventListener("click", () => {
      if (loadRooms().length === 0) {
        alert("먼저 [PMS 객실 동기화]로 객실을 불러오세요.");
        return;
      }
      if (!confirm("PMS에서 재고·요금을 동기화합니다. (객실 정보 동기화와 별개)\n2026-07-01 ~ 08-31 날짜별 재고·요금이 채워집니다.\n진행할까요?")) return;
      const n = syncPmsRoomInventory();
      alert(`재고·요금 동기화 완료 — 객실 ${n}건에 7/1~8/31 인벤토리(재고 30)가 반영되었습니다.`);
      renderRoomList(main, placeFilterId);
    });
  }

  const aiRoomBtn = main.querySelector(".js-ai-room-translate");
  if (aiRoomBtn) {
    aiRoomBtn.addEventListener("click", () => {
      const n = aiTranslateRoomNames();
      alert(n ? `AI 번역 완료 — 객실 영문명 ${n}건 자동 입력되었습니다. (더미)` : "번역할 미입력 영문명이 없습니다.");
      renderRoomList(main, placeFilterId);
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
    rm_typ_cd: existing?.rm_typ_cd || "",
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
    policy_html_en: existing?.policy_html_en || "",
    policy_html_zh: existing?.policy_html_zh || "",
    guide_html_en: existing?.guide_html_en || "",
    guide_html_zh: existing?.guide_html_zh || "",
    visibility: existing?.visibility === "HIDE" ? "HIDE" : "SHOW",
    image_meta: Array.isArray(existing?.image_meta) ? [...existing.image_meta] : [],
    image_storage_warning: "",
    rfTab: "basic",
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
    state.policy_html_en = document.getElementById("rf_policy_en")?.innerHTML.trim() ?? "";
    state.policy_html_zh = document.getElementById("rf_policy_zh")?.innerHTML.trim() ?? "";
    state.guide_html_en = document.getElementById("rf_guide_en")?.innerHTML.trim() ?? "";
    state.guide_html_zh = document.getElementById("rf_guide_zh")?.innerHTML.trim() ?? "";
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

    main.innerHTML = `
      <h2 class="page-title">${isEdit ? "객실 수정" : "객실 등록"}</h2>
      <p class="page-desc">숙소에 종속된 객실 · v0.5 · 코드 <code>${escapeHtml(state.room_code)}</code></p>

      <div class="pf-form-tabs" role="tablist" aria-label="객실 수정 탭">
        <button type="button" role="tab" class="pf-tab ${state.rfTab === "basic" ? "is-active" : ""}" id="rf_tab_basic">기본정보</button>
        <button type="button" role="tab" class="pf-tab ${state.rfTab === "inv" ? "is-active" : ""}" id="rf_tab_inv">재고·요금</button>
      </div>

      <div id="rf_panel_basic" style="display:${state.rfTab === "basic" ? "block" : "none"}">
      <div class="card">
        <h3 class="section-title">소속 · 코드</h3>
        <div class="form-grid">
          <label class="field"><span>숙소</span>
            <select id="rf_place">${placeOpts || '<option value="">숙소를 먼저 등록하세요</option>'}</select>
          </label>
          <label class="field"><span>객실코드</span>
            <input type="text" id="rf_code" value="${escapeAttr(state.room_code)}" ${isEdit ? "readonly" : ""} />
          </label>
          <label class="field"><span>PMS 객실타입코드 (RM_TYP_CD)</span>
            <input type="text" id="rf_rm_typ_cd" value="${escapeAttr(state.rm_typ_cd || "")}" readonly placeholder="PMS 동기화 시 자동" style="background:#f5f5f5;color:#555" />
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
        <h3 class="section-title">객실유형 · 침대</h3>
        <p class="field-hint">객실유형 1개 필수 · 침대유형 1개 이상 필수 · 침대 개수는 선택 순서와 동일합니다.</p>
        <div class="tag-section"><strong>객실유형</strong><div class="tag-pool">${rtPills || "<span class='muted'>마스터 없음</span>"}</div></div>
        <div class="tag-section"><strong>침대유형</strong><div class="tag-pool">${bedPills || ""}</div></div>
        <div class="bed-count-grid">${bedCountRows || "<p class='muted small'>침대유형을 선택하면 개수 입력이 나타납니다.</p>"}</div>
      </div>

      <div class="card">
        <h3 class="section-title">객실명</h3>
        <p class="field-hint">PMS 동기화 시 객실명이 자동 입력됩니다. 필요 시 직접 수정하세요. (영문명은 [누락된 필드 AI 번역]으로 채움)</p>
        <label class="field"><span>객실명</span>
          <input type="text" id="rf_name" value="${escapeAttr(state.room_name)}" placeholder="PMS 수신 또는 직접 입력" />
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

      <!-- v0.5: 객실 부가요금(인원추가요금·엑스트라베드) 섹션 제거 → 숙소 '추가요금 안내(extra_fee_notes)'로 이관, 결제 개념 폐기 -->

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
        <p class="field-hint" style="margin:-6px 0 12px;font-size:12px;">영문(필수)·중문(선택)으로 입력합니다. (외국인 전용 · 국문 미사용) 프런트는 중문 접속 시 중문, 없으면 영문으로 표시됩니다.</p>
        <label class="field"><span>객실정책 (영문, 필수)</span>
          ${richEditorHtml("rf_policy_en", state.policy_html_en, { minHeight: 140 })}
        </label>
        <label class="field"><span>객실정책 (중문, 선택)</span>
          ${richEditorHtml("rf_policy_zh", state.policy_html_zh, { minHeight: 120 })}
        </label>
        <hr style="border:0;border-top:1px solid var(--border);margin:12px 0;" />
        <label class="field"><span>객실안내 (영문, 필수)</span>
          ${richEditorHtml("rf_guide_en", state.guide_html_en, { minHeight: 140 })}
        </label>
        <label class="field"><span>객실안내 (중문, 선택)</span>
          ${richEditorHtml("rf_guide_zh", state.guide_html_zh, { minHeight: 120 })}
        </label>
      </div>

      <div class="wizard-actions wizard-actions--sticky">
        <a href="#/rooms${state.place_id ? `/place/${state.place_id}` : ""}" class="btn">목록</a>
        <div class="wizard-actions-trailing">
          <a href="#/rooms" class="btn">취소</a>
          <button type="button" class="btn btn-primary" id="rf_save">${isEdit ? "저장" : "등록"}</button>
        </div>
      </div>
      </div><!-- /rf_panel_basic -->

      <div id="rf_panel_inv" style="display:${state.rfTab === "inv" ? "block" : "none"}">
        <div class="card">
          <h3 class="section-title">재고·요금 (PMS 동기화 · 객실 타입 단위)</h3>
          <div class="notice" style="background:#eff6ff;border:1px solid #bfdbfe;border-radius:6px;padding:9px 12px;font-size:13px;color:#1a4fa0;margin-bottom:10px">
            재고(총운영/예약/잔여)·요금은 <strong>PMS 동기화로 채워지는 조회 전용</strong> 데이터입니다. 상품(S06)에서도 읽기전용으로 참조합니다. (RM_TYP_CD: <strong>${escapeHtml(state.rm_typ_cd || "-")}</strong>)
          </div>
          <div class="toolbar" style="margin-bottom:10px;">
            <button type="button" class="btn" id="rf_inv_sync">이 객실 재고·요금 동기화</button>
          </div>
          <div style="background:#fef9c3;border:1px solid #f59e0b;border-radius:6px;padding:9px 12px;font-size:13px;color:#7a5c00;margin-bottom:10px">
            ⚠️ <strong>주의</strong> — 판매 ON/OFF 변경은 우측 상단 <strong>[판매 ON/OFF 저장]</strong>을 눌러야 반영됩니다. 마감(OFF) 처리 시 <strong>해당 일자 예약이 즉시 차단</strong>되며, 이 객실에 연결된 <strong>모든 상품</strong>에 적용됩니다. 신중히 확인 후 저장하세요.
          </div>
          <div style="display:flex;justify-content:space-between;align-items:flex-end;margin-bottom:6px;gap:12px;">
            <p class="field-hint" style="margin:0;">잔여 재고가 0이면 자동 SOLD OUT. 판매 ON/OFF로 <strong>재고와 무관하게 강제 마감</strong>(CLSE_YN)할 수 있습니다.</p>
            <button type="button" class="btn btn-primary" id="rf_inv_save" style="flex-shrink:0;">판매 ON/OFF 저장</button>
          </div>
          ${(() => {
            const rfInv = Array.isArray(existing?.inventory) ? existing.inventory : [];
            if (!rfInv.length)
              return `<p class="muted" style="padding:8px 0;">재고·요금이 없습니다. <strong>[이 객실 재고·요금 동기화]</strong> 또는 객실 목록의 <strong>[재고·요금 동기화]</strong>를 실행하세요. ${isEdit ? "" : "(신규 등록은 저장 후 동기화 가능)"}</p>`;
            const rows = rfInv
              .slice()
              .sort((a, b) => String(a.date).localeCompare(String(b.date)))
              .map((r) => {
                const avlb = r.avlb_cnt ?? r.stock ?? 0;
                const status =
                  avlb <= 0
                    ? `<span style="color:#e74c3c;font-weight:600">SOLD OUT</span>`
                    : r.closed
                      ? `<span style="color:#b45309;font-weight:600">마감(강제)</span>`
                      : `<span style="color:#166534">판매중</span>`;
                return `<tr data-date="${escapeAttr(r.date)}">
                  <td>${escapeHtml(r.date)}</td>
                  <td style="color:#555">${escapeHtml(Number(r.price || 0).toLocaleString())}</td>
                  <td style="color:#555;text-align:center">${escapeHtml(String(r.oper_cnt ?? r.stock ?? 0))}</td>
                  <td style="color:#555;text-align:center">${escapeHtml(String(r.rsv_cnt ?? 0))}</td>
                  <td style="color:#1a6fb8;text-align:center;font-weight:600">${escapeHtml(String(avlb))}</td>
                  <td>${status}</td>
                  <td style="text-align:center"><input type="checkbox" class="rf-inv-onoff" data-date="${escapeAttr(r.date)}" ${r.closed ? "" : "checked"} title="해제 시 해당 일자 강제 마감" /></td>
                </tr>`;
              })
              .join("");
            return `<div class="product-inv-wrap"><table class="room-list-table"><thead><tr><th>날짜(체크인)</th><th>입금가</th><th>총재고</th><th>예약</th><th>잔여</th><th>판매상태</th><th>판매 ON/OFF</th></tr></thead><tbody>${rows}</tbody></table></div>
              <p class="field-hint" style="margin-top:6px;">총 ${rfInv.length}일 · 재고 3값(총운영/예약/잔여, PMS API 4) · 예약조건(최소/최대박·컷오프)은 상품(S06)에서 관리합니다.</p>`;
          })()}
        </div>
      </div>
      <p id="rf_err" class="error" style="min-height:20px;"></p>
    `;

    const errEl = () => document.getElementById("rf_err");

    document.getElementById("rf_tab_basic")?.addEventListener("click", () => {
      persistFromDom();
      state.rfTab = "basic";
      render();
    });
    document.getElementById("rf_tab_inv")?.addEventListener("click", () => {
      persistFromDom();
      state.rfTab = "inv";
      render();
    });
    document.getElementById("rf_inv_sync")?.addEventListener("click", () => {
      if (!isEdit) {
        alert("객실을 먼저 저장한 뒤 재고·요금을 동기화할 수 있습니다.");
        return;
      }
      if (!confirm("이 객실의 재고·요금을 PMS에서 동기화합니다.\n2026-07-01 ~ 08-31 · 재고 30이 채워집니다.\n진행할까요?")) return;
      const price = RM_TYP_RATE_MAP[state.rm_typ_cd] || 300000;
      const list = loadRooms();
      const idx = list.findIndex((r) => r.id === state.id);
      const prevClosed = new Map(
        (idx >= 0 && Array.isArray(list[idx].inventory) ? list[idx].inventory : []).map((r) => [r.date, r.closed === true])
      );
      const inv = buildDummyRoomInventory(price, 30).map((r) => ({ ...r, closed: prevClosed.get(r.date) === true }));
      if (idx >= 0) {
        list[idx].inventory = inv;
        list[idx].inventory_synced_at = new Date().toISOString();
        saveRooms(list);
      }
      if (existing) existing.inventory = inv;
      alert("재고·요금 동기화 완료 — 7/1~8/31 재고 30 반영되었습니다.");
      render();
    });

    // 판매 ON/OFF는 즉시 저장하지 않고, [변경사항 저장] 클릭 시 일괄 반영 (민감 항목)
    document.getElementById("rf_inv_save")?.addEventListener("click", () => {
      const panel = document.getElementById("rf_panel_inv");
      if (!panel) return;
      const list = loadRooms();
      const idx = list.findIndex((r) => r.id === state.id);
      if (idx < 0 || !Array.isArray(list[idx].inventory) || !list[idx].inventory.length) {
        alert("동기화된 재고·요금이 없습니다. 먼저 [이 객실 재고·요금 동기화]를 실행하세요.");
        return;
      }
      const offDates = [];
      const invByDate = new Map(list[idx].inventory.map((r) => [r.date, r]));
      panel.querySelectorAll(".rf-inv-onoff").forEach((cb) => {
        const row = invByDate.get(cb.getAttribute("data-date"));
        if (row) {
          row.closed = !cb.checked;
          if (row.closed) offDates.push(row.date);
        }
      });
      if (!confirm(`판매 ON/OFF 변경사항을 저장합니다.\n강제 마감(OFF) 일자: ${offDates.length}건\n마감된 일자는 이 객실에 연결된 모든 상품에서 예약이 차단됩니다. 진행할까요?`)) return;
      saveRooms(list);
      if (existing) existing.inventory = list[idx].inventory;
      alert("판매 ON/OFF 변경사항이 저장되었습니다. 연결된 상품에 반영됩니다.");
      render();
    });

    main.querySelectorAll(".js-rt").forEach((btn) => {
      btn.addEventListener("click", () => {
        persistFromDom();
        state.room_type_id = btn.getAttribute("data-id");
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
    wireRichEditors(main);

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
          const hero = await buildImageMetaSmart(f);
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
            rest.push(await buildImageMetaSmart(file));
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
        rm_typ_cd: state.rm_typ_cd || "",
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
        policy_html_en: state.policy_html_en,
        policy_html_zh: state.policy_html_zh,
        guide_html_en: state.guide_html_en,
        guide_html_zh: state.guide_html_zh,
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
      const linked = p.pms_linked
        ? `<span class="badge on">PMS연동</span>`
        : `<span class="badge">수기</span>`;
      const dispName = p.name_en || p.name || "-";
      return `<tr>
        <td>${escapeHtml(p.product_code || "-")}</td>
        <td>${pl ? escapeHtml(pl.place_name) : "?"}</td>
        <td>${r ? escapeHtml(r.room_name || r.room_code || "-") : "?"}</td>
        <td>${typeLabel(p.product_type)}</td>
        <td>${escapeHtml(dispName)}</td>
        <td>${linked}</td>
        <td><span class="room-yn">${escapeHtml(vis)}</span></td>
        <td>${sale}</td>
        <td>${escapeHtml(p.stay_start_date || "-")}</td>
        <td>${escapeHtml(p.stay_end_date || "-")}</td>
        <td>${formatDate(p.updated_at)}</td>
        <td>
          <button type="button" class="btn btn-ghost js-pf-edit" data-id="${escapeAttr(p.id)}">수정</button>
          <button type="button" class="btn btn-ghost js-pf-del" data-id="${escapeAttr(p.id)}">삭제</button>
        </td>
      </tr>`;
    })
    .join("");
  const untranslatedProducts = filtered.filter((p) => !p.name_en).length;

  main.innerHTML = `
    <h2 class="page-title">상품관리</h2>
    <p class="page-desc">PMS 연동으로 등록된 숙소 상품(SKU)을 관리합니다. <strong>전 상품 PMS 연동</strong> · 재고·요금·취소정책은 PMS/S04-INV 연동(읽기전용), 예약조건만 상품에서 관리.</p>
    <div class="card">
      <div class="toolbar room-list-toolbar" style="justify-content:space-between">
        <label class="field" style="flex-direction:row;align-items:center;gap:8px;margin:0;">
          <span style="font-weight:600;">숙소 필터</span>
          <select id="pf_place_filter" style="min-width:220px;">${placeOpts}</select>
        </label>
        <div style="display:flex;gap:8px">
          <button type="button" class="btn btn-primary js-pms-product-sync">PMS 상품정보 동기화</button>
          <button type="button" class="btn js-ai-product-translate"${untranslatedProducts ? "" : " disabled"}>누락된 필드 AI 번역${untranslatedProducts ? ` (${untranslatedProducts})` : ""}</button>
        </div>
      </div>
      ${
        rooms.length === 0
          ? `<div class="empty"><strong>객실이 없습니다.</strong> 먼저 객실관리에서 <strong>[PMS 객실 동기화]</strong>로 객실을 불러오세요.</div>`
          : filtered.length === 0
            ? `<div class="empty"><strong>동기화된 상품이 없습니다.</strong> 상단 <strong>[PMS 상품정보 동기화]</strong> 버튼을 눌러 PMS에서 상품을 불러오세요. (최초 1회 필수)</div>`
            : `<div class="product-inv-wrap">
        <table class="room-list-table product-master-table">
          <thead><tr>
            <th>상품코드</th><th>숙소</th><th>객실</th><th>유형</th><th>상품명</th><th>연동</th><th>노출</th>
            <th>판매기간</th><th>투숙 시작일</th><th>투숙 종료일</th><th>수정일시</th><th>수정/삭제</th>
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

  const prodSyncBtn = main.querySelector(".js-pms-product-sync");
  if (prodSyncBtn) {
    prodSyncBtn.addEventListener("click", () => {
      if (loadRooms().length === 0) {
        alert("먼저 객실관리에서 [PMS 객실 동기화]로 객실을 불러오세요.");
        return;
      }
      if (!confirm("PMS에서 상품 정보를 동기화(갱신)합니다.\n각 객실당 룸온리 상품이 생성되며, 취소정책은 PMS(API 9), 재고·요금은 S04-INV 연동입니다.\n진행할까요?")) return;
      const n = syncPmsProducts();
      alert(`PMS 상품정보 동기화 완료 — 상품 ${n}건 반영되었습니다.`);
      renderProductList(main, placeFilterId);
    });
  }

  const aiProdBtn = main.querySelector(".js-ai-product-translate");
  if (aiProdBtn) {
    aiProdBtn.addEventListener("click", () => {
      const n = aiTranslateProductNames();
      alert(n ? `AI 번역 완료 — 상품 영문명 ${n}건 자동 입력되었습니다. (더미)` : "번역할 미입력 영문명이 없습니다.");
      renderProductList(main, placeFilterId);
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
  if (!String(st.name_en || "").trim()) return "상품명(영문)을 입력하세요.";
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
    pms_linked: existing?.pms_linked || false,
    stay_start_date: existing?.stay_start_date || "",
    stay_end_date: existing?.stay_end_date || "",
    name_en: existing?.name_en || "",
    name_zh: existing?.name_zh || "",
    description_en: existing?.description_en || "",
    description_zh: existing?.description_zh || "",
    guide_policy_html_en: existing?.guide_policy_html_en || "",
    guide_policy_html_zh: existing?.guide_policy_html_zh || "",
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
    if (!tb) return;
    // 재고·요금(price/stock)은 room 소스라 유지, 예약조건(체크인허용·최소/최대박·컷오프)만 DOM에서 반영
    const condMap = new Map();
    tb.querySelectorAll("tr.js-inv-row").forEach((tr) => {
      const date = tr.getAttribute("data-date");
      if (!date) return;
      condMap.set(date, {
        min_stay_nights: Math.max(1, parseInt(tr.querySelector(".js-inv-min")?.value, 10) || 1),
        max_stay_nights: Math.max(1, parseInt(tr.querySelector(".js-inv-max")?.value, 10) || 30),
        cutoff_days_before_checkin: Math.max(
          0,
          parseInt(String(tr.querySelector(".js-inv-cutoff")?.value || "").replace(/\D/g, ""), 10) || 0
        ),
        margin_type: tr.querySelector(".js-inv-margin-type")?.value || "",
        margin_value: String(tr.querySelector(".js-inv-margin-value")?.value || "").trim(),
      });
    });
    state.inventory = state.inventory.map((row) => {
      const c = condMap.get(row.date);
      return c ? normalizeInventoryRow({ ...row, ...c }) : row;
    });
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
    const sts = el("pf_stay_s");
    if (sts) state.stay_start_date = String(sts.value || "").slice(0, 10);
    const ste = el("pf_stay_e");
    if (ste) state.stay_end_date = String(ste.value || "").slice(0, 10);
    const nmEn = el("pf_name_en");
    if (nmEn) state.name_en = String(nmEn.value || "").trim();
    const nmZh = el("pf_name_zh");
    if (nmZh) state.name_zh = String(nmZh.value || "").trim();
    const descEn = el("pf_desc_en");
    if (descEn) state.description_en = descEn.value || "";
    const descZh = el("pf_desc_zh");
    if (descZh) state.description_zh = descZh.value || "";
    const guideEn = el("pf_guide_en");
    if (guideEn) state.guide_policy_html_en = guideEn.innerHTML.trim() || "";
    const guideZh = el("pf_guide_zh");
    if (guideZh) state.guide_policy_html_zh = guideZh.innerHTML.trim() || "";
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
    const room = rooms.find((r) => r.id === state.room_id);
    if (!Array.isArray(room?.inventory) || !room.inventory.length) {
      return `<tr><td colspan="8" class="muted" style="padding:12px;">재고·요금이 없습니다. <strong>객실관리 → [재고·요금 동기화]</strong> 후 이용하세요.</td></tr>`;
    }
    sortInv();
    return state.inventory
      .map((row) => {
        const avlb = row.avlb_cnt ?? row.stock ?? 0;
        const off = row.closed === true;
        const soldout = avlb <= 0;
        const status = soldout
          ? `<span style="color:#e74c3c;font-weight:600">SOLD OUT</span>`
          : off
            ? `<span style="color:#b45309;font-weight:600">마감</span>`
            : `<span style="color:#166534">판매중</span>`;
        const rowStyle = off || soldout ? ' style="background:#f3f4f6;color:#9ca3af;"' : "";
        const mt = row.margin_type || "";
        const sell = computeSellPrice(row.price, mt, row.margin_value);
        return `<tr class="js-inv-row" data-date="${escapeAttr(row.date)}"${rowStyle}>
        <td>${escapeHtml(row.date)}</td>
        <td style="color:#888">${escapeHtml(Number(row.price || 0).toLocaleString())} <span style="font-size:10px;color:#aaa">읽기전용</span></td>
        <td><select class="js-inv-margin-type" style="width:88px;">
          <option value="" ${!mt ? "selected" : ""}>없음</option>
          <option value="amount" ${mt === "amount" ? "selected" : ""}>마진금액</option>
          <option value="rate" ${mt === "rate" ? "selected" : ""}>마진율%</option>
        </select> ${row.margin_source === "manual" ? '<span style="font-size:9px;color:#b45309">개별</span>' : '<span style="font-size:9px;color:#999">상속</span>'}</td>
        <td><input type="text" class="js-inv-margin-value" inputmode="numeric" value="${escapeAttr(String(row.margin_value ?? ""))}" style="width:72px;" ${!mt ? "disabled" : ""} /></td>
        <td style="color:#1a6fb8;font-weight:600">${escapeHtml(sell.toLocaleString())}</td>
        <td style="text-align:center;color:#555">${escapeHtml(String(avlb))}</td>
        <td style="text-align:center;">${status}</td>
        <td><input type="number" class="js-inv-min" min="1" max="365" value="${escapeAttr(String(row.min_stay_nights))}" style="width:56px;" /></td>
        <td><input type="number" class="js-inv-max" min="1" max="365" value="${escapeAttr(String(row.max_stay_nights))}" style="width:56px;" /></td>
        <td><input type="text" class="js-inv-cutoff" inputmode="numeric" value="${escapeAttr(String(row.cutoff_days_before_checkin))}" style="width:52px;" title="체크인 N일 전 00:00부터 예약 불가" /></td>
      </tr>`;
      })
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
    // 재고·요금은 객실(room.inventory) 소스(읽기전용), 예약조건은 기존 state.inventory 유지 — 매 렌더 병합
    {
      const roomInv = Array.isArray(room?.inventory) ? room.inventory : [];
      const condMap = invMapFromRows(state.inventory);
      state.inventory = roomInv.map((ri) => {
        const c = condMap.get(ri.date);
        // 관리자가 개별 설정한(manual) 마진만 유지, 그 외(상속/미설정)는 공통관리 마스터 최신값 반영
        const isManual = c && c.margin_source === "manual" && (c.margin_type === "amount" || c.margin_type === "rate");
        const dm = getMarginMaster(room?.rm_typ_cd); // 공통관리 마진 마스터(객실 타입별) 디폴트
        return normalizeInventoryRow({
          date: ri.date,
          price: ri.price,
          stock: ri.stock,
          closed: ri.closed,
          checkin_allowed: c ? c.checkin_allowed : true,
          min_stay_nights: c ? c.min_stay_nights : 1,
          max_stay_nights: c ? c.max_stay_nights : 30,
          cutoff_days_before_checkin: c ? c.cutoff_days_before_checkin : 0,
          margin_type: isManual ? c.margin_type : dm.type,
          margin_value: isManual ? c.margin_value : dm.value,
          margin_source: isManual ? "manual" : "master",
        });
      });
    }
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
        <h3 class="section-title">① 기본 정보</h3>
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
        </div>
      </div>

      <div class="card">
        <h3 class="section-title">② 기간 (판매기간 · 투숙 가능 기간)</h3>
        <div class="form-grid">
          <label class="field"><span>판매 시작일</span>
            <input type="date" id="pf_sale_s" value="${escapeAttr(state.sale_start_date)}" />
          </label>
          <label class="field"><span>판매 종료일</span>
            <input type="date" id="pf_sale_e" value="${escapeAttr(state.sale_end_date)}" />
          </label>
          <label class="field"><span>투숙 가능 시작일</span>
            <input type="date" id="pf_stay_s" value="${escapeAttr(state.stay_start_date || (Array.isArray(room?.inventory) && room.inventory.length ? room.inventory.map((r) => r.date).sort()[0] : ""))}" />
          </label>
          <label class="field"><span>투숙 가능 종료일</span>
            <input type="date" id="pf_stay_e" value="${escapeAttr(state.stay_end_date || (Array.isArray(room?.inventory) && room.inventory.length ? room.inventory.map((r) => r.date).sort().slice(-1)[0] : ""))}" />
          </label>
        </div>
        <div class="pd-rule" style="background:#f0f5ff;border-left:3px solid #6366f1;padding:8px 12px;border-radius:0 4px 4px 0;font-size:12px;color:#334;margin-top:8px">
          <strong>판매기간</strong> = 유저가 프런트에서 <strong>상품을 검색·구매(예약 결제)할 수 있는 기간</strong>.<br>
          <strong>투숙 가능 기간</strong> = 유저가 <strong>실제 투숙일로 선택할 수 있는 날짜 범위</strong>. PMS 인벤토리 기준으로 자동 세팅되며, 관리자가 좁혀서 지정할 수 있습니다.
        </div>
        <p class="field-hint" style="margin-top:6px;color:#b45309;">※ '투숙 가능 기간'은 신규 항목입니다 — 정책서 반영 대기(대화창 1 전달 예정).</p>
      </div>

      <div class="card">
        <h3 class="section-title">③ 상품명 · 설명 <span style="font-size:12px;font-weight:400;color:#888">(영문 필수 · 중문 선택)</span></h3>
        <p class="field-hint" style="margin:0 0 8px;font-size:12px;">국문 미사용. 프런트는 중문 접속 시 중문, 없으면 영문 표시.</p>
        <label class="field"><span>상품명 (영문, 필수)</span>
          <input type="text" id="pf_name_en" value="${escapeAttr(state.name_en)}" placeholder="e.g. Deluxe King Room Only" />
        </label>
        <label class="field"><span>상품명 (중문, 선택)</span>
          <input type="text" id="pf_name_zh" value="${escapeAttr(state.name_zh)}" placeholder="中文（可选）" />
        </label>
        <label class="field"><span>상품 설명 (영문, 필수)</span>
          <textarea id="pf_desc_en" rows="3" placeholder="Summary / inclusions">${escapeForTextarea(state.description_en)}</textarea>
        </label>
        <label class="field"><span>상품 설명 (중문, 선택)</span>
          <textarea id="pf_desc_zh" rows="3" placeholder="中文（可选）">${escapeForTextarea(state.description_zh)}</textarea>
        </label>
      </div>

      <div class="card">
        <h3 class="section-title">④ 상품 안내 / 정책 <span style="font-size:12px;font-weight:400;color:#888">(영문 필수 · 중문 선택)</span></h3>
        ${pkgDescHint}
        <label class="field"><span>상품 안내/정책 (영문, 필수)</span>
          ${richEditorHtml("pf_guide_en", state.guide_policy_html_en, { minHeight: 130 })}
        </label>
        <label class="field"><span>상품 안내/정책 (중문, 선택)</span>
          ${richEditorHtml("pf_guide_zh", state.guide_policy_html_zh, { minHeight: 120 })}
        </label>
      </div>

      <div class="card">
        <h3 class="section-title">⑤ 취소 정책 (상품)</h3>
        ${
          state.pms_linked
            ? `<div class="notice" style="background:#eff6ff;border:1px solid #bfdbfe;border-radius:6px;padding:9px 12px;font-size:13px;color:#1a4fa0;">
                 <strong>PMS 연동 상품</strong> — 취소·환불 정책은 <strong>PMS API 9/10</strong>에서 내려온 규정이 적용되며, 어드민에서 수정할 수 없습니다.
               </div>
               <p class="field-hint" style="margin:8px 0 0;">적용 정책: <strong>API 9 (PMS 취소·환불 규정, 읽기전용)</strong></p>`
            : `<label class="field"><span>유형</span>
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
        </div>`
        }
      </div>

      </div>

      <div id="pf_panel2" class="pf-tab-panel" style="display:${state.pfTab === 2 ? "block" : "none"}">
      <div class="card">
        <h3 class="section-title">재고·요금 (읽기전용) · 예약조건 (편집)</h3>
        <div class="notice" style="background:#eff6ff;border:1px solid #bfdbfe;border-radius:6px;padding:9px 12px;font-size:13px;color:#1a4fa0;margin-bottom:10px">
          <strong>재고·요금(입금가·재고)은 읽기전용</strong>입니다 — 객실관리 <strong>[재고·요금 동기화]</strong>로 채워지며 상품에서 수정할 수 없습니다. 이 화면에서는 <strong>체크인허용·최소/최대박·컷오프(예약조건)</strong>만 관리합니다.
        </div>
        <div class="product-bulk-bar" style="display:flex;flex-wrap:wrap;gap:10px;align-items:flex-end;">
          <span class="product-bulk-title" style="width:100%;margin-bottom:2px;">예약조건·마진 구간 일괄</span>
          <label style="display:flex;flex-direction:column;gap:2px;font-size:10px;color:#888;">시작일
            <input type="date" id="pf_bulk_a" style="width:132px;" /></label>
          <label style="display:flex;flex-direction:column;gap:2px;font-size:10px;color:#888;">종료일
            <input type="date" id="pf_bulk_b" style="width:132px;" /></label>
          <label style="display:flex;flex-direction:column;gap:2px;font-size:10px;color:#888;">최소박
            <input type="number" id="pf_bulk_min" min="1" value="1" style="width:56px;" /></label>
          <label style="display:flex;flex-direction:column;gap:2px;font-size:10px;color:#888;">최대박
            <input type="number" id="pf_bulk_max" min="1" value="30" style="width:56px;" /></label>
          <label style="display:flex;flex-direction:column;gap:2px;font-size:10px;color:#888;">컷오프N
            <input type="text" id="pf_bulk_cut" inputmode="numeric" style="width:56px;" /></label>
          <label style="display:flex;flex-direction:column;gap:2px;font-size:10px;color:#888;">마진 유형
            <select id="pf_bulk_margin_type" style="width:104px;">
              <option value="">변경없음</option>
              <option value="amount">마진금액</option>
              <option value="rate">마진율%</option>
            </select></label>
          <label style="display:flex;flex-direction:column;gap:2px;font-size:10px;color:#888;">마진 값
            <input type="text" id="pf_bulk_margin_value" inputmode="numeric" style="width:76px;" /></label>
          <button type="button" class="btn btn-primary" id="pf_bulk_go" style="height:34px;">적용</button>
        </div>
        <div class="product-inv-wrap">
          <table class="room-list-table product-inv-table">
            <thead><tr>
              <th>날짜(체크인)</th><th>입금가</th><th>마진유형</th><th>마진값</th><th>판매가</th><th>잔여</th><th>판매상태</th><th>최소박</th><th>최대박</th><th>컷오프N</th>
            </tr></thead>
            <tbody id="pf_inv_tbody">${invRowsHtml()}</tbody>
          </table>
        </div>
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
    wireRichEditors(main);

    // 예약조건 구간 일괄(벌크) — 재고·요금은 room 소스라 제외, room.inventory에 있는 날짜만 적용
    document.getElementById("pf_bulk_go")?.addEventListener("click", () => {
      syncAllFromDomBeforeRender();
      const a = document.getElementById("pf_bulk_a")?.value;
      const b = document.getElementById("pf_bulk_b")?.value;
      const min_stay_nights = Math.max(1, parseInt(document.getElementById("pf_bulk_min")?.value, 10) || 1);
      const max_stay_nights = Math.max(
        min_stay_nights,
        parseInt(document.getElementById("pf_bulk_max")?.value, 10) || 30
      );
      const cutoff_days_before_checkin = Math.max(
        0,
        parseInt(String(document.getElementById("pf_bulk_cut")?.value || "").replace(/\D/g, ""), 10) || 0
      );
      const bmt = document.getElementById("pf_bulk_margin_type")?.value || "";
      const bmv = String(document.getElementById("pf_bulk_margin_value")?.value || "").trim();
      const map = new Map(state.inventory.map((r) => [r.date, { ...r }]));
      eachDateInclusive(a, b, (ymd) => {
        const cur = map.get(ymd);
        if (!cur) return; // room 재고·요금이 없는 날짜는 건너뜀
        const next = { ...cur, min_stay_nights, max_stay_nights, cutoff_days_before_checkin };
        // 마진 유형을 '변경없음'이 아닌 값으로 선택했을 때만 마진 일괄 적용 (개별=manual)
        if (bmt === "amount" || bmt === "rate") {
          next.margin_type = bmt;
          next.margin_value = bmv;
          next.margin_source = "manual";
        }
        map.set(ymd, next);
      });
      state.inventory = [...map.values()].map((x) => normalizeInventoryRow(x));
      errEl().textContent = "";
      render();
    });

    // 일자별 마진 유형/값 변경 시 판매가·입력 활성화 즉시 갱신
    document.getElementById("pf_inv_tbody")?.addEventListener("change", (e) => {
      const t = e.target;
      if (t && (t.classList.contains("js-inv-margin-type") || t.classList.contains("js-inv-margin-value"))) {
        syncAllFromDomBeforeRender();
        const tr = t.closest("tr[data-date]");
        const date = tr?.getAttribute("data-date");
        const row = state.inventory.find((r) => r.date === date);
        if (row) row.margin_source = "manual"; // 관리자 개별 설정 → 마스터 상속 해제
        render();
      }
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
        pms_linked: state.pms_linked,
        name_en: state.name_en,
        name_zh: state.name_zh,
        description_en: state.description_en,
        description_zh: state.description_zh,
        package_inclusions_text: "",
        guide_policy_html_en: state.guide_policy_html_en,
        guide_policy_html_zh: state.guide_policy_html_zh,
        visibility: state.visibility,
        sale_start_date: state.sale_start_date,
        sale_end_date: state.sale_end_date,
        stay_start_date: state.stay_start_date,
        stay_end_date: state.stay_end_date,
        cancel_policy_type: state.pms_linked ? "PMS_API9" : state.cancel_policy_type,
        cancel_free_days_before:
          !state.pms_linked && state.cancel_policy_type === PRODUCT_CANCEL_POLICY.FREE_N_DAYS ? state.cancel_free_days_before : null,
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


/* =====================================================================
 * 티켓 도메인 (Phase 1) — S17 카테고리 · S13 쿠폰 스펙 · S14-A/B 상품
 * 정책서: 티켓쿠폰연동-정책서-v0.8.md / 개발스펙 준용
 * 범위: 어드민 등록 흐름(카테고리→스펙→상품). POS 시뮬레이터·S15/S16은 이후 단계.
 * ===================================================================== */

/** 티켓 전역 기본 마진 (마스터 미설정 쿠폰ID에 적용) */
const DEFAULT_TICKET_MARGIN = { type: "amount", value: "30000" }; // 전역 디폴트 (정책 v0.11 §11)

/** 취소정책 기준일 옵션 (이용일 기준) */
const TICKET_CXL_BASES = [
  { value: "3plus", label: "이용일 3일 이상 전" },
  { value: "2", label: "이용일 2일 전" },
  { value: "1", label: "이용일 1일 전" },
  { value: "today", label: "이용일 당일 24시 이전" },
];
function ticketCxlBaseLabel(v) {
  return (TICKET_CXL_BASES.find((x) => x.value === v) || {}).label || v || "-";
}

/* ── load / save ── */
function loadTicketCategories() {
  try { const r = localStorage.getItem(STORAGE_TICKET_CATEGORIES); return r ? JSON.parse(r) : []; } catch { return []; }
}
function saveTicketCategories(list) { localStorage.setItem(STORAGE_TICKET_CATEGORIES, JSON.stringify(list || [])); }

function loadCouponSpecs() {
  try { const r = localStorage.getItem(STORAGE_COUPON_SPECS); return r ? JSON.parse(r) : []; } catch { return []; }
}
function saveCouponSpecs(list) { localStorage.setItem(STORAGE_COUPON_SPECS, JSON.stringify(list || [])); }

function loadTicketProducts() {
  try { const r = localStorage.getItem(STORAGE_TICKET_PRODUCTS); return r ? JSON.parse(r) : []; } catch { return []; }
}
function saveTicketProducts(list) { localStorage.setItem(STORAGE_TICKET_PRODUCTS, JSON.stringify(list || [])); }

/** 티켓 마진 스키마 정규화 — { categories:{}, overrides:{} }. 구(flat) 스키마는 overrides로 이관. */
function normalizeTicketMargin(raw) {
  const r = raw && typeof raw === "object" ? raw : {};
  if (r.categories || r.overrides) return { categories: r.categories || {}, overrides: r.overrides || {} };
  // 레거시 flat { COUPON: {type,value} } → overrides로 취급
  return { categories: {}, overrides: { ...r } };
}
function loadTicketMarginMaster() {
  try { const r = localStorage.getItem(STORAGE_TICKET_MARGIN_MASTER); return normalizeTicketMargin(r ? JSON.parse(r) : {}); } catch { return { categories: {}, overrides: {} }; }
}
function saveTicketMarginMaster(map) { localStorage.setItem(STORAGE_TICKET_MARGIN_MASTER, JSON.stringify(normalizeTicketMargin(map))); }
const isMarginEntry = (e) => e && (e.type === "amount" || e.type === "rate");
/** 쿠폰ID의 카테고리(1뎁스/2뎁스) 조회 (스펙 기준) */
function ticketCouponCat(couponId) {
  const g = groupCouponSpecs(loadCouponSpecs()).get(couponId);
  return { cat1: g ? g.category || "" : "", cat2: g ? g.product_type || "" : "" };
}
/**
 * 쿠폰ID 적용 마진 (우선순위: 쿠폰ID 개별 > 2뎁스 마스터 > 1뎁스 마스터 > 전역 디폴트) — 정책 v0.11 §11.3
 * source: override | cat2 | cat1 | default
 */
function getTicketMargin(couponId) {
  const m = loadTicketMarginMaster();
  const ov = couponId && m.overrides[couponId];
  if (isMarginEntry(ov)) return { type: ov.type, value: String(ov.value ?? ""), source: "override" };
  const { cat1, cat2 } = ticketCouponCat(couponId);
  const key2 = cat1 && cat2 ? `${cat1}>${cat2}` : "";
  if (key2 && isMarginEntry(m.categories[key2])) return { type: m.categories[key2].type, value: String(m.categories[key2].value ?? ""), source: "cat2" };
  if (cat1 && isMarginEntry(m.categories[cat1])) return { type: m.categories[cat1].type, value: String(m.categories[cat1].value ?? ""), source: "cat1" };
  return { type: DEFAULT_TICKET_MARGIN.type, value: DEFAULT_TICKET_MARGIN.value, source: "default" };
}

function loadTicketUploadHistory() {
  try { const r = localStorage.getItem(STORAGE_TICKET_UPLOAD_HISTORY); return r ? JSON.parse(r) : []; } catch { return []; }
}
function saveTicketUploadHistory(list) { localStorage.setItem(STORAGE_TICKET_UPLOAD_HISTORY, JSON.stringify(list || [])); }

/* ── 코드 채번 ── */
function nextTicketCategoryCode(list) {
  let max = 0;
  (list || []).forEach((c) => { const m = /^TC-(\d+)$/.exec(c.code || ""); if (m) max = Math.max(max, parseInt(m[1], 10)); });
  return "TC-" + String(max + 1).padStart(3, "0");
}
function nextTicketProductCode(list) {
  let max = 0;
  (list || []).forEach((p) => { const m = /^PR-T(\d+)$/.exec(p.product_code || ""); if (m) max = Math.max(max, parseInt(m[1], 10)); });
  return "PR-T" + String(max + 1).padStart(4, "0");
}

/* ── 헬퍼 ── */
/** 1뎁스 카테고리 목록 (order순) */
function ticketTopCategories() {
  return loadTicketCategories().filter((c) => !c.parent_id).sort((a, b) => (a.order || 0) - (b.order || 0));
}
/** 특정 1뎁스의 2뎁스(상품유형) 목록 */
function ticketSubCategories(parentId) {
  return loadTicketCategories().filter((c) => c.parent_id === parentId).sort((a, b) => (a.order || 0) - (b.order || 0));
}
/** name_ko(관리명)로 카테고리 존재 검증용 집합 */
function ticketCategoryKoSet() {
  const set = new Set();
  loadTicketCategories().forEach((c) => { if (c.name_ko) set.add(c.name_ko); });
  return set;
}
/** 쿠폰ID별 스펙 묶음 (레벨 행 그룹핑) */
function groupCouponSpecs(specs) {
  const map = new Map();
  (specs || []).forEach((s) => {
    if (!map.has(s.coupon_id)) {
      map.set(s.coupon_id, { coupon_id: s.coupon_id, pass_name: s.pass_name, category: s.category, product_type: s.product_type, active: s.active !== false, rows: [] });
    }
    const g = map.get(s.coupon_id);
    g.rows.push(s);
    if (s.active === false) g.active = false;
  });
  map.forEach((g) => g.rows.sort((a, b) => (a.level || 0) - (b.level || 0)));
  return map;
}
function ticketProductCountByCoupon(couponId) {
  return loadTicketProducts().filter((p) => p.spec_coupon_id === couponId).length;
}
/** 판매기간 기준 판매상태 (v0.9) — 판매시작 전/판매중/판매종료 */
function ticketSaleStatus(p) {
  const today = new Date().toISOString().slice(0, 10);
  const s = p.sale_start_date || "";
  const e = p.sale_end_date || "";
  if (s && today < s) return { key: "before", label: "판매전" };
  if (e && today > e) return { key: "after", label: "판매종료" };
  return { key: "on", label: "판매중" };
}
function fmtSalePeriod(p) {
  const s = p.sale_start_date || "";
  const e = p.sale_end_date || "";
  if (!s && !e) return "상시(노출 토글 제어)";
  return `${s || "즉시"} ~ ${e || "무기한"}`;
}
/** 자산 없이 렌더용 SVG 플레이스홀더 이미지 (data URL) */
function svgPlaceholder(label, bg) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="640" height="384"><rect width="640" height="384" fill="${bg}"/><text x="320" y="205" font-family="sans-serif" font-size="30" fill="#ffffff" text-anchor="middle">${label}</text></svg>`;
  return "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg);
}
function seedDetailHtml(title, color) {
  return `<h3>${title}</h3><p>상품 상세 소개 영역(프로토타입 더미). 어드민 S14-B 상세정보 탭에서 이미지 붙여넣기·텍스트로 자유 구성합니다.</p><img src="${svgPlaceholder(title, color)}" style="max-width:100%;height:auto;display:block;border-radius:8px;margin-top:8px" />`;
}
/** 상품 카드/히어로용 이미지 (썸네일 우선 → 히어로 → 서브) */
function ticketProductImg(p) {
  const pick = (a) => (a && a[0] && a[0].data_url) || "";
  return pick(p.thumb_meta) || pick(p.hero_meta) || pick(p.hero_image_meta) || pick(p.image_meta) || "";
}
/** 카테고리(뎁스) 히어로 이미지 */
function ticketCatImg(c) { return (c && c.hero_image_meta && c.hero_image_meta[0] && c.hero_image_meta[0].data_url) || ""; }

const TICKET_ADDR = "265, High1-gil, Gohan-eup, Jeongseon-gun, Gangwon-do, Korea";

/* ── 더미 시드 ── */
function ensureTicketStores() {
  // 시드 버전이 최신이면 재주입 생략(관리자 입력 보존). 버전이 바뀌면 카테고리·스펙·마진·상품 재주입.
  if (localStorage.getItem(STORAGE_TICKET_SEED_VER) === String(TICKET_SEED_VER)) return;

  const T = "2026-07-09T00:00:00.000Z";
  // 뎁스(카테고리) 콘텐츠 — 히어로·개요·상세·안내·정책·주소 (A안: 콘텐츠는 뎁스 소유)
  const catImg = (label, color) => [{ data_url: svgPlaceholder(label, color), name: label }];
  const catC = (label, color, overview) => ({
    hero_image_meta: catImg(label, color),
    overview_en: overview, overview_zh: "",
    detail_html_en: `<h3>${label}</h3><p>${label} 상세 소개(프로토타입 더미). 어드민 S17 카테고리 콘텐츠에서 이미지·텍스트로 구성합니다.</p><img src="${svgPlaceholder(label + " Detail", color)}" style="max-width:100%;height:auto;display:block;border-radius:8px;margin-top:8px" />`,
    detail_html_zh: "",
    guide_html_en: `<ul><li>Show the issued 12-digit coupon barcode at the on-site POS/KIOSK.</li><li>Open ticket — free entry within the valid period.</li><li>One coupon per person.</li></ul>`,
    guide_html_zh: "",
    policy_html_en: `<ul><li>Cancellation follows the valid end date — full refund if unused before the end date.</li><li>No refund after on-site use.</li></ul>`,
    policy_html_zh: "",
    address_en: TICKET_ADDR, address_zh: "",
  });
  saveTicketCategories([
    { id: "tc_waterpark", code: "TC-001", name_ko: "워터파크", name_en: "Water Park", name_zh: "水上乐园", parent_id: null, order: 1, updatedAt: T, ...catC("Water Park", "#38bdf8", "High1 Water World — indoor/outdoor water park. Open-type tickets, free use within the valid period.") },
    { id: "tc_ski", code: "TC-002", name_ko: "스키", name_en: "Ski", name_zh: "滑雪", parent_id: null, order: 2, updatedAt: T, hero_image_meta: catImg("Ski", "#6366f1") }, // 상위(자식보유) — 콘텐츠는 2뎁스 소유
    { id: "tc_ski_lift", code: "TC-003", name_ko: "리프트권", name_en: "Lift Pass", name_zh: "缆车票", parent_id: "tc_ski", order: 1, updatedAt: T, ...catC("Ski Lift Pass", "#6366f1", "High1 ski resort lift pass. 4-hour / 7-hour / day pass.") },
    { id: "tc_ski_rental", code: "TC-004", name_ko: "장비렌탈", name_en: "Equipment Rental", name_zh: "器材租赁", parent_id: "tc_ski", order: 2, updatedAt: T, ...catC("Ski Equipment Rental", "#8b5cf6", "Ski/board equipment rental. 4-hour / 7-hour / day.") },
    { id: "tc_meal", code: "TC-005", name_ko: "식사권", name_en: "Meal Voucher", name_zh: "餐券", parent_id: null, order: 3, updatedAt: T, ...catC("Meal Voucher", "#f59e0b", "Resort dining meal vouchers.") },
    { id: "tc_gondola", code: "TC-006", name_ko: "곤돌라", name_en: "Gondola", name_zh: "观光缆车", parent_id: null, order: 4, updatedAt: T, ...catC("Gondola", "#10b981", "Sightseeing gondola round-trip.") },
  ]);

  // 쿠폰 스펙 — 워터파크 5코드(종일권 3채널 + 4시간 + 7시간) / 스키 리프트 3 / 스키 장비렌탈 3
  const WW = { s: "2026-07-10", e: "2026-08-30" }; // 워터파크 성수기
  const SKI = { s: "2026-12-01", e: "2027-02-28" }; // 스키 겨울시즌
  // (쿠폰명 대인/소인 자동 생성) 한 코드 = 대인(LV.1)+소인(LV.2) 2행
  const specs = [];
  const addCoupon = (coupon_id, pass_name, category, product_type, baseName, priceAdult, priceChild, use, discount) => {
    specs.push(
      { id: uid(), coupon_id, pass_name, category, product_type, level: 1, level_name: "대인", coupon_name: `${baseName}(대인)`, price: priceAdult, discount_target: discount, use_start_date: use.s, use_end_date: use.e, active: true, created_at: T, updated_at: T },
      { id: uid(), coupon_id, pass_name, category, product_type, level: 2, level_name: "소인", coupon_name: `${baseName}(소인)`, price: priceChild, discount_target: discount, use_start_date: use.s, use_end_date: use.e, active: true, created_at: T, updated_at: T }
    );
  };
  // 워터파크
  addCoupon("DBO", "OAT_26성수기_얼리_워터월드(플레이스토리)", "워터파크", "", "워터월드 종일권_성수기", 40000, 35000, WW, "종일권_대인_남_4계절 상품 외 15종");
  addCoupon("DBR", "OAT_26성수기_얼리_워터월드(티브리지)", "워터파크", "", "워터월드 종일권_성수기", 40000, 35000, WW, "종일권_대인_남_4계절 상품 외 15종");
  addCoupon("DBT", "OAT_26성수기_얼리_워터월드(스마트인피니)", "워터파크", "", "워터월드 종일권_성수기", 40000, 35000, WW, "종일권_대인_남_4계절 상품 외 15종");
  addCoupon("DBQ", "OAT_26성수기_워터월드_4시간권", "워터파크", "", "워터월드 4시간권", 30000, 26000, WW, "워터월드 4시간권 대인 외 (입금가 추정)");
  addCoupon("DBW", "OAT_26성수기_워터월드_7시간권", "워터파크", "", "워터월드 7시간권", 36000, 31000, WW, "워터월드 7시간권 대인 외 (입금가 추정)");
  // 스키 리프트권
  addCoupon("SVC", "OAT_26시즌_스키리프트_4시간권", "스키", "리프트권", "스키 리프트 4시간권", 45000, 34000, SKI, "리프트 4시간권 대인 외 (입금가 추정)");
  addCoupon("SVZ", "OAT_26시즌_스키리프트_7시간권", "스키", "리프트권", "스키 리프트 7시간권", 55000, 40000, SKI, "리프트 7시간권 대인 외 (입금가 추정)");
  addCoupon("SVA", "OAT_26시즌_스키리프트_종일권", "스키", "리프트권", "스키 리프트 종일권", 65000, 48000, SKI, "리프트 종일권 대인 외 (입금가 추정)");
  // 스키 장비렌탈
  addCoupon("RSA", "OAT_26시즌_장비렌탈_4시간권", "스키", "장비렌탈", "스키 장비렌탈 4시간권", 25000, 20000, SKI, "장비렌탈 4시간권 대인 외 (입금가 추정)");
  addCoupon("RSC", "OAT_26시즌_장비렌탈_7시간권", "스키", "장비렌탈", "스키 장비렌탈 7시간권", 30000, 24000, SKI, "장비렌탈 7시간권 대인 외 (입금가 추정)");
  addCoupon("RSF", "OAT_26시즌_장비렌탈_종일권", "스키", "장비렌탈", "스키 장비렌탈 종일권", 38000, 30000, SKI, "장비렌탈 종일권 대인 외 (입금가 추정)");
  // 곤돌라 왕복권 — 성인(대인) 전용 티켓 (아동 레벨 없음)
  specs.push({ id: uid(), coupon_id: "GDO", pass_name: "OAT_곤돌라_왕복권", category: "곤돌라", product_type: "", level: 1, level_name: "대인", coupon_name: "곤돌라 왕복권(대인)", price: 18000, discount_target: "곤돌라 왕복 대인", use_start_date: "2026-07-01", use_end_date: "2026-12-31", active: true, created_at: T, updated_at: T });
  saveCouponSpecs(specs);

  // 마진 마스터 — 카테고리 마스터 + 쿠폰ID 오버라이드 (정책 v0.11 §11)
  saveTicketMarginMaster({
    categories: {
      "워터파크": { type: "amount", value: "4000" },
      "스키>리프트권": { type: "rate", value: "10" },
      "스키>장비렌탈": { type: "amount", value: "3000" },
      "곤돌라": { type: "amount", value: "2000" },
    },
    overrides: {
      DBQ: { type: "amount", value: "3000" }, // 워터월드 4시간권만 개별
    },
  });

  // 티켓 상품 — 판매 옵션 단위. 이미지(썸네일/히어로/서브)는 상품별. 상세/안내/정책/위치는 뎁스(카테고리) 소유.
  const cxlWW = [{ base: "3plus", penalty: 0 }, { base: "2", penalty: 50 }, { base: "today", penalty: 100 }];
  const cxlSKI = [{ base: "3plus", penalty: 0 }, { base: "1", penalty: 50 }, { base: "today", penalty: 100 }];
  const SALE_WW = { sale_start_date: "2026-07-01", sale_end_date: "2026-08-25" };
  const SALE_SKI = { sale_start_date: "2026-07-01", sale_end_date: "2027-02-20" }; // 데모: 지금부터 판매·사용기간은 겨울
  // 상품 이미지 = 썸네일만(검색결과·브릿지 카드·메인 추천). 히어로·상세는 뎁스(S17) 소유.
  const pimg = (label, color) => ({ thumb_meta: [{ data_url: svgPlaceholder(label, color), name: label }] });
  const mk = (over) => ({ id: uid(), visibility: "Y", date_mode: "open", created_at: T, updated_at: T, ...over });
  saveTicketProducts([
    mk({ product_code: "PR-T0001", name_en: "Water World Day Pass (Peak/Early)", name_zh: "水世界一日通票（旺季/早鸟）", category_1: "워터파크", category_2: "", spec_coupon_id: "DBO", ...SALE_WW, cutoff: { n: 1, unit: "day", time: "23:59" }, cancel_policy: cxlWW, ...pimg("Water World Day Pass", "#38bdf8") }),
    mk({ product_code: "PR-T0002", name_en: "Water World 4-Hour Pass", name_zh: "水世界4小时票", category_1: "워터파크", category_2: "", spec_coupon_id: "DBQ", ...SALE_WW, cutoff: { n: 0, unit: "hour", time: "23:59" }, cancel_policy: cxlWW, ...pimg("Water World 4-Hour", "#0ea5e9") }),
    mk({ product_code: "PR-T0003", name_en: "Ski Lift Day Pass", name_zh: "滑雪缆车一日券", category_1: "스키", category_2: "리프트권", spec_coupon_id: "SVA", ...SALE_SKI, cutoff: { n: 1, unit: "day", time: "18:00" }, cancel_policy: cxlSKI, ...pimg("Ski Lift Day Pass", "#6366f1") }),
    mk({ product_code: "PR-T0004", name_en: "Ski Equipment Rental (Day)", name_zh: "滑雪装备租赁（全日）", category_1: "스키", category_2: "장비렌탈", spec_coupon_id: "RSF", ...SALE_SKI, cutoff: { n: 1, unit: "day", time: "18:00" }, cancel_policy: cxlSKI, ...pimg("Ski Equipment Rental", "#8b5cf6") }),
    mk({ product_code: "PR-T0005", name_en: "Gondola Round Trip", name_zh: "观光缆车往返", category_1: "곤돌라", category_2: "", spec_coupon_id: "GDO", sale_start_date: "2026-07-01", sale_end_date: "2026-12-31", cutoff: { n: 0, unit: "hour", time: "23:59" }, cancel_policy: cxlWW, ...pimg("Gondola Round Trip", "#10b981") }),
  ]);

  if (!localStorage.getItem(STORAGE_TICKET_UPLOAD_HISTORY)) saveTicketUploadHistory([]);
  // 데모용 티켓 추천 섹션(메인) — 티켓 섹션이 없을 때만 1건 추가 (숙소 섹션 보존)
  try {
    const secs = JSON.parse(localStorage.getItem(STORAGE_MAIN_SECTION) || "[]");
    if (!secs.some((s) => s.type === "ticket")) {
      secs.push({ id: "sec_ticket_demo", type: "ticket", title_ko: "인기 티켓", title_en: "Popular Tickets", subtitle_ko: "워터파크·스키 추천 상품", subtitle_en: "Water Park & Ski picks", visible: true, viewall_use: true, ticket_mode: "auto", ticket_sort: "price", ticket_cats: [], ticket_product_ids: [], order: 90 });
      localStorage.setItem(STORAGE_MAIN_SECTION, JSON.stringify(secs));
    }
  } catch (e) {}
  localStorage.setItem(STORAGE_TICKET_SEED_VER, String(TICKET_SEED_VER));
}

/* =========================== S17 티켓 카테고리관리 =========================== */
function renderTicketCategoryList(main) {
  ensureTicketStores();
  const tops = ticketTopCategories();
  const products = loadTicketProducts();
  const countByKo = (ko) => products.filter((p) => p.category_1 === ko || p.category_2 === ko).length;

  // 카드형(A안): 1뎁스 = 카드(헤더), 2뎁스(상품유형) = 카드 안 하위 테이블
  const cards = tops.map((t) => {
    const subs = ticketSubCategories(t.id);
    const linked1 = countByKo(t.name_ko);
    const subRows = subs.map((s) => {
      const linked2 = countByKo(s.name_ko);
      return `
        <tr>
          <td><span class="tk-lv-pill">2뎁스</span> <strong>${escapeHtml(s.name_en)}</strong>${s.name_zh ? ` <span style="color:var(--muted)">${escapeHtml(s.name_zh)}</span>` : ""}</td>
          <td><span class="tk-ko-chip">${escapeHtml(s.name_ko)}</span></td>
          <td>${escapeHtml(s.code)}</td>
          <td>${s.order || 0}</td>
          <td>${linked2 ? `<span class="badge on">연결상품 ${linked2}</span>` : `<span class="badge">0</span>`}</td>
          <td style="text-align:right;white-space:nowrap"><button type="button" class="btn btn-ghost js-tc-content" data-id="${escapeAttr(s.id)}">콘텐츠</button> <button type="button" class="btn btn-ghost js-tc-edit" data-id="${escapeAttr(s.id)}">수정</button></td>
        </tr>`;
    }).join("");
    return `
      <div class="tk-card">
        <div class="tk-card-head cat">
          <span class="tk-code tk-code-cat">${escapeHtml(t.code)}</span>
          <span class="tk-head-title">${escapeHtml(t.name_en)}${t.name_zh ? ` <span style="color:var(--muted);font-weight:400">${escapeHtml(t.name_zh)}</span>` : ""}</span>
          <span class="tk-head-meta">관리명 <strong>${escapeHtml(t.name_ko)}</strong> · 순서 ${t.order || 0} · 2뎁스 ${subs.length}개${linked1 ? ` · 연결상품 ${linked1}` : ""}</span>
          <span class="tk-head-actions">
            ${subs.length === 0 ? `<button type="button" class="btn btn-ghost js-tc-content" data-id="${escapeAttr(t.id)}">콘텐츠</button>` : ""}
            <button type="button" class="btn btn-ghost js-tc-edit" data-id="${escapeAttr(t.id)}">수정</button>
            <button type="button" class="btn btn-ghost js-tc-addsub" data-id="${escapeAttr(t.id)}">+ 하위(2뎁스) 추가</button>
          </span>
        </div>
        ${subs.length
          ? `<table class="tk-lv-table"><thead><tr><th>상품유형(2뎁스)</th><th style="width:130px">관리명</th><th style="width:90px">코드</th><th style="width:70px">순서</th><th style="width:120px">연결상품</th><th style="width:80px"></th></tr></thead><tbody>${subRows}</tbody></table>`
          : `<div class="tk-cat-empty">하위 상품유형(2뎁스) 없음 — 1뎁스 단독 카테고리입니다.</div>`}
      </div>`;
  }).join("");

  const d1 = tops.length;
  const d2 = loadTicketCategories().filter((c) => c.parent_id).length;

  main.innerHTML = `
    <h2 class="page-title">티켓 카테고리관리 <span class="badge" style="background:#eef2ff;color:#6366f1">공통관리</span></h2>
    <p class="page-desc">티켓 상품(S14)의 카테고리 드롭다운 소스이자 <strong>S13 쿠폰 스펙 업로드 시 검증 기준</strong>입니다. <strong>카드 = 1뎁스 카테고리, 카드 안 행 = 2뎁스(상품유형)</strong>. 최대 2뎁스. 삭제는 없습니다(추가·수정만). 저장소: <code>${STORAGE_TICKET_CATEGORIES}</code></p>
    <div class="card">
      <div class="toolbar" style="justify-content:space-between">
        <span style="color:var(--muted);font-size:13px">등록: 1뎁스 ${d1}개 · 2뎁스 ${d2}개</span>
        <button type="button" class="btn btn-primary js-tc-add1">+ 1뎁스 카테고리 추가</button>
      </div>
      <div class="notice" style="background:#eef2ff;border:1px solid #c7d2fe;border-radius:6px;padding:8px 12px;font-size:12px;color:#3730a3;margin-bottom:12px">
        <strong>관리명(KO)</strong>은 내부 식별·CSV 매칭용이며, <strong>EN/ZH</strong>는 고객 화면 표시명입니다. 레벨(대인/소인)은 카테고리가 아니라 상품 옵션이므로 트리에 넣지 않습니다.
      </div>
      ${cards}
    </div>
  `;

  main.querySelector(".js-tc-add1").addEventListener("click", () => openTicketCategoryModal(main, { parentId: null, editId: null }));
  main.querySelectorAll(".js-tc-addsub").forEach((b) => b.addEventListener("click", () => openTicketCategoryModal(main, { parentId: b.getAttribute("data-id"), editId: null })));
  main.querySelectorAll(".js-tc-edit").forEach((b) => b.addEventListener("click", () => openTicketCategoryModal(main, { parentId: null, editId: b.getAttribute("data-id") })));
  main.querySelectorAll(".js-tc-content").forEach((b) => b.addEventListener("click", () => navigate("ticket-categories/edit/" + b.getAttribute("data-id"))));
}

/* S17 뎁스 콘텐츠 편집 — 히어로·개요·상세설명·이용안내·정책·위치 (프런트 브릿지 매핑) */
function renderTicketCategoryContent(main, id) {
  ensureTicketStores();
  const list = loadTicketCategories();
  const c = list.find((x) => x.id === id);
  if (!c) { main.innerHTML = `<div class="card"><div class="empty">카테고리를 찾을 수 없습니다.</div></div>`; return; }
  const parent = c.parent_id ? list.find((x) => x.id === c.parent_id) : null;
  const label = `${parent ? parent.name_ko + " › " : ""}${c.name_ko} (${c.name_en})`;
  const st = {
    hero_image_meta: c.hero_image_meta ? c.hero_image_meta.map((m) => ({ ...m })) : [],
    overview_en: c.overview_en || "", overview_zh: c.overview_zh || "",
    detail_html_en: c.detail_html_en || "", detail_html_zh: c.detail_html_zh || "",
    guide_html_en: c.guide_html_en || "", guide_html_zh: c.guide_html_zh || "",
    policy_html_en: c.policy_html_en || "", policy_html_zh: c.policy_html_zh || "",
    address_en: c.address_en || "", address_zh: c.address_zh || "",
  };
  const RICH_KEYS = ["overview_en", "overview_zh", "detail_html_en", "detail_html_zh", "guide_html_en", "guide_html_zh", "policy_html_en", "policy_html_zh"];
  const sync = () => {
    const q = (s) => main.querySelector(s);
    ["address_en", "address_zh"].forEach((k) => { const el = q("#cc_" + k); if (el) st[k] = el.value; });
    RICH_KEYS.forEach((k) => { const el = q("#cc_" + k); if (el) st[k] = el.innerHTML.trim(); });
  };
  const ta = "width:100%;margin:6px 0 0;padding:10px;border:1px solid #ddd;border-radius:6px;font-family:inherit";
  const inp = "width:100%;padding:8px;border:1px solid #ddd;border-radius:6px";
  function render() {
    const heroThumbs = st.hero_image_meta.length
      ? st.hero_image_meta.map((m, i) => `<div class="image-meta-item"><img src="${escapeAttr(m.data_url)}" alt="" style="width:100%;height:90px;object-fit:cover;border-radius:6px"><button type="button" class="image-meta-delete js-cch-del" data-i="${i}">×</button></div>`).join("")
      : `<div style="color:var(--muted);font-size:13px;padding:8px 0">등록된 히어로 이미지가 없습니다.</div>`;
    main.innerHTML = `
      <h2 class="page-title">카테고리/컨텐츠 관리 <span class="badge" style="background:#eef2ff;color:#6366f1">티켓관리</span></h2>
      <p class="page-desc"><strong>${escapeHtml(label)}</strong> — 프런트 브릿지의 히어로·상세설명·이용안내·정책·위치에 매핑됩니다. (뎁스 단위 공통 콘텐츠) 저장소: <code>${STORAGE_TICKET_CATEGORIES}</code></p>
      <div class="card">
        <h3 style="margin-top:0">① 히어로 이미지 <span class="badge">브릿지 상단</span></h3>
        <div class="image-meta-list" style="display:grid;grid-template-columns:repeat(auto-fill,minmax(160px,1fr));gap:10px;margin-bottom:10px">${heroThumbs}</div>
        <input type="file" id="cc_hero_img" accept="image/*" multiple>
      </div>
      <div class="card">
        <h3 style="margin-top:0">② 개요(요약) <span class="badge">리치 에디터</span></h3>
        <label style="font-size:13px;font-weight:600;display:block;margin-bottom:4px">개요 (EN)</label>
        ${richEditorHtml("cc_overview_en", st.overview_en, { minHeight: 90 })}
        <label style="font-size:13px;font-weight:600;display:block;margin:14px 0 4px">개요 (ZH)</label>
        ${richEditorHtml("cc_overview_zh", st.overview_zh, { minHeight: 80 })}
      </div>
      <div class="card">
        <h3 style="margin-top:0">③ 상세설명 <span class="badge">리치 에디터</span></h3>
        <label style="font-size:13px;font-weight:600;display:block;margin-bottom:4px">상세설명 (EN)</label>
        ${richEditorHtml("cc_detail_html_en", st.detail_html_en, { minHeight: 180 })}
        <label style="font-size:13px;font-weight:600;display:block;margin:14px 0 4px">상세설명 (ZH)</label>
        ${richEditorHtml("cc_detail_html_zh", st.detail_html_zh, { minHeight: 120 })}
      </div>
      <div class="card">
        <h3 style="margin-top:0">④ 이용안내 <span class="badge">리치 에디터</span></h3>
        <label style="font-size:13px;font-weight:600;display:block;margin-bottom:4px">이용안내 (EN)</label>
        ${richEditorHtml("cc_guide_html_en", st.guide_html_en, { minHeight: 140 })}
        <label style="font-size:13px;font-weight:600;display:block;margin:14px 0 4px">이용안내 (ZH)</label>
        ${richEditorHtml("cc_guide_html_zh", st.guide_html_zh, { minHeight: 110 })}
      </div>
      <div class="card">
        <h3 style="margin-top:0">⑤ 유의사항 / 정책 <span class="badge">리치 에디터</span></h3>
        <label style="font-size:13px;font-weight:600;display:block;margin-bottom:4px">유의사항/정책 (EN)</label>
        ${richEditorHtml("cc_policy_html_en", st.policy_html_en, { minHeight: 140 })}
        <label style="font-size:13px;font-weight:600;display:block;margin:14px 0 4px">유의사항/정책 (ZH)</label>
        ${richEditorHtml("cc_policy_html_zh", st.policy_html_zh, { minHeight: 110 })}
      </div>
      <div class="card">
        <h3 style="margin-top:0">⑥ 위치(주소)</h3>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px">
          <label style="font-size:13px">주소 (EN)<br><input type="text" id="cc_address_en" value="${escapeAttr(st.address_en)}" style="${inp}"></label>
          <label style="font-size:13px">주소 (ZH)<br><input type="text" id="cc_address_zh" value="${escapeAttr(st.address_zh)}" style="${inp}"></label>
        </div>
      </div>
      <div class="toolbar" style="gap:8px">
        <button type="button" class="btn js-cc-cancel">목록으로</button>
        <button type="button" class="btn btn-primary js-cc-save">저장</button>
      </div>`;
    const hi = main.querySelector("#cc_hero_img");
    if (hi) hi.addEventListener("change", async () => {
      sync();
      for (const f of Array.from(hi.files || [])) { try { const src = await resolveImageSrc(f); st.hero_image_meta.push({ data_url: src, name: f.name }); } catch (e) { alert(e.message || "이미지 추가 실패"); } }
      render();
    });
    main.querySelectorAll(".js-cch-del").forEach((b) => b.addEventListener("click", () => { sync(); st.hero_image_meta.splice(parseInt(b.getAttribute("data-i"), 10), 1); render(); }));
    wireRichEditors(main);
    main.querySelector(".js-cc-cancel").addEventListener("click", () => navigate("ticket-categories"));
    main.querySelector(".js-cc-save").addEventListener("click", () => {
      sync();
      const list2 = loadTicketCategories();
      const row = list2.find((x) => x.id === id);
      Object.assign(row, st, { updatedAt: new Date().toISOString() });
      try {
        saveTicketCategories(list2);
      } catch (e) {
        if (isStorageQuotaExceeded(e)) {
          alert("저장 공간(브라우저 localStorage)이 부족합니다.\n\n붙여넣은 이미지 총량이 브라우저 한도(약 5MB)를 넘었습니다.\n· 이미지 개수를 줄이거나\n· 더 작은 이미지를 사용해 주세요.\n(이미지는 자동 축소되지만 여러 장이 쌓이면 한도를 넘을 수 있습니다.)");
        } else {
          alert("저장에 실패했습니다: " + (e && e.message || e));
        }
        return;
      }
      alert("콘텐츠가 저장되었습니다.");
      navigate("ticket-categories");
    });
  }
  render();
}

function openTicketCategoryModal(main, { parentId, editId }) {
  const list = loadTicketCategories();
  const editing = editId ? list.find((c) => c.id === editId) : null;
  const parent = editing ? (editing.parent_id ? list.find((c) => c.id === editing.parent_id) : null) : (parentId ? list.find((c) => c.id === parentId) : null);
  const parentLabel = parent ? `${parent.name_ko} (${parent.name_en})` : "최상위 (1뎁스)";

  const dim = document.createElement("div");
  dim.id = "tc_modal_dim";
  dim.style.cssText = "position:fixed;inset:0;background:rgba(0,0,0,.35);display:flex;align-items:center;justify-content:center;z-index:1000";
  dim.innerHTML = `
    <div style="background:#fff;border-radius:10px;padding:22px;width:440px;max-width:92vw;box-shadow:0 12px 40px rgba(0,0,0,.2)">
      <h3 style="margin:0 0 14px">${editing ? "카테고리 수정" : "카테고리 등록"}</h3>
      <div style="display:flex;flex-direction:column;gap:12px">
        <label style="font-size:13px">상위 카테고리<br><input type="text" value="${escapeAttr(parentLabel)}" readonly style="width:100%;margin-top:4px;background:#f5f5f5;padding:8px;border:1px solid #ddd;border-radius:6px"></label>
        <label style="font-size:13px">관리명 (KO) <span style="color:#d33">*</span> <span style="color:var(--muted)">— 내부·CSV 매칭용</span><br><input type="text" id="tc_ko" value="${escapeAttr(editing?.name_ko || "")}" placeholder="예: 워터파크" style="width:100%;margin-top:4px;padding:8px;border:1px solid #ddd;border-radius:6px"></label>
        <label style="font-size:13px">카테고리명 (EN) <span style="color:#d33">*</span><br><input type="text" id="tc_en" value="${escapeAttr(editing?.name_en || "")}" placeholder="e.g. Water Park" style="width:100%;margin-top:4px;padding:8px;border:1px solid #ddd;border-radius:6px"></label>
        <label style="font-size:13px">카테고리명 (ZH) <span style="color:var(--muted)">— 선택</span><br><input type="text" id="tc_zh" value="${escapeAttr(editing?.name_zh || "")}" placeholder="选填" style="width:100%;margin-top:4px;padding:8px;border:1px solid #ddd;border-radius:6px"></label>
        <label style="font-size:13px">노출 순서<br><input type="number" id="tc_order" value="${editing?.order || (list.filter((c) => (parent ? c.parent_id === parent.id : !c.parent_id)).length + 1)}" min="1" style="width:120px;margin-top:4px;padding:8px;border:1px solid #ddd;border-radius:6px"></label>
        <p id="tc_err" class="error" style="margin:0"></p>
      </div>
      <div style="display:flex;justify-content:flex-end;gap:8px;margin-top:18px">
        <button type="button" class="btn js-tc-cancel">취소</button>
        <button type="button" class="btn btn-primary js-tc-save">저장</button>
      </div>
    </div>`;
  document.body.appendChild(dim);
  const close = () => dim.remove();
  dim.addEventListener("click", (e) => { if (e.target === dim) close(); });
  dim.querySelector(".js-tc-cancel").addEventListener("click", close);
  dim.querySelector(".js-tc-save").addEventListener("click", () => {
    const ko = dim.querySelector("#tc_ko").value.trim();
    const en = dim.querySelector("#tc_en").value.trim();
    const zh = dim.querySelector("#tc_zh").value.trim();
    const order = parseInt(dim.querySelector("#tc_order").value, 10) || 1;
    const err = dim.querySelector("#tc_err");
    err.textContent = "";
    if (!ko) { err.textContent = "관리명(KO)을 입력하세요."; return; }
    if (!en) { err.textContent = "카테고리명(EN)은 필수입니다."; return; }
    const list2 = loadTicketCategories();
    const pid = editing ? editing.parent_id : (parent ? parent.id : null);
    const dupe = list2.find((c) => c.id !== editId && c.name_ko === ko && (c.parent_id || null) === (pid || null));
    if (dupe) { err.textContent = "같은 뎁스에 동일 관리명이 이미 있습니다."; return; }
    const now = new Date().toISOString();
    if (editing) {
      const row = list2.find((c) => c.id === editId);
      Object.assign(row, { name_ko: ko, name_en: en, name_zh: zh, order, updatedAt: now });
    } else {
      list2.push({ id: uid(), code: nextTicketCategoryCode(list2), name_ko: ko, name_en: en, name_zh: zh, parent_id: pid || null, order, updatedAt: now });
    }
    saveTicketCategories(list2);
    close();
    renderTicketCategoryList(main);
  });
}

/* =========================== S13 쿠폰 스펙 관리 =========================== */
/** 더미 CSV 업로드 데이터셋 (버튼 클릭 시 주입 — 파일 I/O 대체).
 *  기존 DBO(덮어쓰기) + 신규 DC1(추가) + 카테고리 오류행(실패) 을 섞어 검증·이력을 시연. */
function ticketDummyUploadRows() {
  const ww = { use_start: "2026-07-10", use_end: "2026-08-30" };
  return [
    { category: "워터파크", product_type: "", coupon_id: "DBO", pass_name: "OAT_26성수기_얼리_워터월드(플레이스토리)", level: 1, coupon_name: "워터월드 종일권_성수기(대인/얼리)", price: 40000, discount: "종일권_대인_남_4계절 상품 외 15종", ...ww },
    { category: "워터파크", product_type: "", coupon_id: "DBO", pass_name: "OAT_26성수기_얼리_워터월드(플레이스토리)", level: 2, coupon_name: "워터월드 종일권_성수기(소인/얼리)", price: 35000, discount: "종일권_대인_남_4계절 상품 외 15종", ...ww },
    { category: "곤돌라", product_type: "", coupon_id: "DC1", pass_name: "OAT_26곤돌라_왕복", level: 1, coupon_name: "곤돌라 왕복권(대인)", price: 18000, discount: "곤돌라 대인 외 2종", use_start: "2026-07-10", use_end: "2026-12-31" },
    { category: "카트레이싱", product_type: "", coupon_id: "DK1", pass_name: "OAT_카트_1회", level: 1, coupon_name: "카트 1회권", price: 25000, discount: "", use_start: "2026-07-10", use_end: "2026-12-31" },
  ];
}

function runTicketDummyUpload(main) {
  const rows = ticketDummyUploadRows();
  const koSet = ticketCategoryKoSet();
  const specs = loadCouponSpecs();
  const existsKey = new Set(specs.map((s) => s.coupon_id + "|" + s.level));

  // 1) 검증 + 기존 존재 여부 판정
  const report = [];
  const overwriteTargets = [];
  const validAdds = [];
  rows.forEach((r, i) => {
    const line = i + 1;
    if (!koSet.has(r.category)) { report.push({ line, coupon_id: r.coupon_id, level: r.level, status: "fail", reason: `카테고리 불일치 ("${r.category}" 미등록)` }); return; }
    if (r.product_type && !koSet.has(r.product_type)) { report.push({ line, coupon_id: r.coupon_id, level: r.level, status: "fail", reason: `상품유형 불일치 ("${r.product_type}" 미등록)` }); return; }
    if (existsKey.has(r.coupon_id + "|" + r.level)) { overwriteTargets.push(r); report.push({ line, coupon_id: r.coupon_id, level: r.level, status: "overwrite", reason: "기존 스펙 덮어쓰기" }); }
    else { validAdds.push(r); report.push({ line, coupon_id: r.coupon_id, level: r.level, status: "success", reason: "신규 등록" }); }
  });

  // 2) 덮어쓰기 확인
  if (overwriteTargets.length) {
    if (!confirm(`${overwriteTargets.length}건이 이미 존재합니다(쿠폰코드+레벨 동일). 덮어쓰시겠습니까?\n[취소] 시 업로드를 중단합니다.`)) {
      alert("업로드를 중단했습니다. 변경사항이 없습니다.");
      return;
    }
  }

  // 3) 반영
  const now = new Date().toISOString();
  const toRow = (r) => ({
    id: uid(), coupon_id: r.coupon_id, pass_name: r.pass_name, category: r.category, product_type: r.product_type || "",
    level: r.level, level_name: r.level === 1 ? "대인" : r.level === 2 ? "소인" : "LV." + r.level,
    coupon_name: r.coupon_name, price: r.price, discount_target: r.discount || "",
    use_start_date: r.use_start, use_end_date: r.use_end, active: true, created_at: now, updated_at: now,
  });
  overwriteTargets.forEach((r) => {
    const idx = specs.findIndex((s) => s.coupon_id === r.coupon_id && s.level === r.level);
    const keepActive = idx >= 0 ? specs[idx].active : true;
    const nr = toRow(r); nr.active = keepActive !== false;
    if (idx >= 0) specs[idx] = { ...specs[idx], ...nr }; else specs.push(nr);
  });
  validAdds.forEach((r) => specs.push(toRow(r)));
  saveCouponSpecs(specs);

  const success = report.filter((x) => x.status !== "fail").length;
  const fail = report.filter((x) => x.status === "fail").length;
  const hist = loadTicketUploadHistory();
  hist.unshift({ id: uid(), at: now, filename: "waterpark_ski_specs_dummy.csv", total: report.length, success, fail, uploader: "admin", rows: report });
  saveTicketUploadHistory(hist.slice(0, 50));

  alert(`업로드 완료 — 전체 ${report.length}건 · 성공 ${success} · 실패 ${fail}\n(성공에는 덮어쓰기 ${overwriteTargets.length}건 포함)`);
  renderCouponSpecPage(main, "list");
}

function renderCouponSpecPage(main, tab) {
  ensureTicketStores();
  const t = tab === "history" ? "history" : "list";
  const tabPills = `
    <a class="room-master-tab ${t === "list" ? "active" : ""}" href="#/coupon-specs">업로드 & 스펙 목록</a>
    <a class="room-master-tab ${t === "history" ? "active" : ""}" href="#/coupon-specs/history">업로드 이력</a>`;

  if (t === "history") {
    const hist = loadTicketUploadHistory();
    const rows = hist.map((h, i) => `
      <tr class="js-hist-row" data-idx="${i}" style="cursor:pointer">
        <td>${formatDate(h.at)}</td><td>${escapeHtml(h.filename)}</td>
        <td>${h.total}</td><td style="color:#1a7f37">${h.success}</td><td style="color:#d33">${h.fail}</td>
        <td>${escapeHtml(h.uploader)}</td><td><span class="link">상세 보기 ▾</span></td>
      </tr>
      <tr class="js-hist-detail" data-idx="${i}" style="display:none"><td colspan="7" style="background:#fafafa">
        <table style="margin:6px 0"><thead><tr><th>라인</th><th>쿠폰코드</th><th>레벨</th><th>결과</th><th>사유</th></tr></thead>
        <tbody>${h.rows.map((r) => `<tr><td>${r.line}</td><td>${escapeHtml(r.coupon_id)}</td><td>${r.level}</td><td>${r.status === "fail" ? '<span class="badge off">실패</span>' : r.status === "overwrite" ? '<span class="badge">덮어쓰기</span>' : '<span class="badge on">성공</span>'}</td><td>${escapeHtml(r.reason)}</td></tr>`).join("")}</tbody></table>
      </td></tr>`).join("");
    main.innerHTML = `
      <h2 class="page-title">쿠폰 스펙 관리 <span class="badge" style="background:#fce7f3;color:#ec4899">티켓관리</span></h2>
      <p class="page-desc">High1 마케팅팀 제공 스펙을 등록·관리합니다. 저장소: <code>${STORAGE_COUPON_SPECS}</code></p>
      <div class="room-master-tabs">${tabPills}</div>
      <div class="card">
        ${hist.length === 0 ? `<div class="empty">업로드 이력이 없습니다. [업로드 & 스펙 목록] 탭에서 <strong>샘플 스펙 불러오기</strong>를 눌러보세요.</div>`
          : `<table><thead><tr><th>업로드 일시</th><th>파일명</th><th>전체</th><th>성공</th><th>실패</th><th>업로더</th><th>상세</th></tr></thead><tbody>${rows}</tbody></table>`}
      </div>`;
    main.querySelectorAll(".js-hist-row").forEach((tr) => tr.addEventListener("click", () => {
      const d = main.querySelector(`.js-hist-detail[data-idx="${tr.getAttribute("data-idx")}"]`);
      if (d) d.style.display = d.style.display === "none" ? "" : "none";
    }));
    return;
  }

  // 탭A — 업로드 & 스펙 목록
  const specs = loadCouponSpecs();
  const groups = Array.from(groupCouponSpecs(specs).values());
  // 카드형(A안): 쿠폰ID = 그룹 카드, 레벨 = 카드 내 하위 테이블
  let cards = "";
  groups.forEach((g) => {
    const linked = ticketProductCountByCoupon(g.coupon_id);
    const issued = 0; // Phase 1: 발급 쿠폰(S16) 미구현 → 0 고정
    const canDelete = linked === 0 && issued === 0;
    const catCol = `${escapeHtml(g.category)}${g.product_type ? " › " + escapeHtml(g.product_type) : ""}`;
    const lvRows = g.rows.map((r) => `
        <tr>
          <td><span class="tk-lv-pill ${r.level === 2 ? "lv2" : ""}">LV.${r.level}</span> ${escapeHtml(r.level_name)}</td>
          <td>${escapeHtml(r.coupon_name)}</td>
          <td>${catCol}</td>
          <td>${Number(r.price).toLocaleString()}원</td>
          <td>${escapeHtml(r.discount_target || "-")}</td>
          <td>${escapeHtml(r.use_start_date)} ~ ${escapeHtml(r.use_end_date)}</td>
        </tr>`).join("");
    cards += `
      <div class="tk-card ${g.active ? "" : "is-off"}">
        <div class="tk-card-head">
          <span class="tk-code">${escapeHtml(g.coupon_id)}</span>
          <span class="tk-head-title">${escapeHtml(g.pass_name)}</span>
          <span class="tk-head-meta">레벨 ${g.rows.length} · 연결상품 ${linked} · 발급 ${issued}</span>
          <span class="tk-head-actions">
            <span class="badge ${g.active ? "on" : "off"}">${g.active ? "노출 ON" : "노출 OFF 🔒"}</span>
            <button type="button" class="btn btn-ghost js-cs-toggle" data-cid="${escapeAttr(g.coupon_id)}">${g.active ? "노출 OFF" : "노출 ON"}</button>
            <button type="button" class="btn btn-ghost js-cs-del" data-cid="${escapeAttr(g.coupon_id)}" ${canDelete ? "" : `disabled title="연결 상품 ${linked}개 / 발급 쿠폰 ${issued}개가 있어 삭제할 수 없습니다"`}>삭제</button>
          </span>
        </div>
        <div class="tk-lv-scroll"><table class="tk-lv-table">
          <thead><tr><th style="width:110px">레벨</th><th style="min-width:180px">쿠폰명</th><th style="width:130px">카테고리</th><th style="width:95px">입금가</th><th style="min-width:200px">할인대상내역</th><th style="width:180px">사용기간</th></tr></thead>
          <tbody>${lvRows}</tbody>
        </table></div>
      </div>`;
  });

  main.innerHTML = `
    <h2 class="page-title">쿠폰 스펙 관리 <span class="badge" style="background:#fce7f3;color:#ec4899">티켓관리</span></h2>
    <p class="page-desc">High1 제공 쿠폰 스펙을 등록·관리합니다. <strong>카드 = 쿠폰ID(코드), 카드 안 행 = 레벨(대인/소인)</strong>. 스펙은 S14 상품의 연결 소스입니다. 저장소: <code>${STORAGE_COUPON_SPECS}</code></p>
    <div class="room-master-tabs">${tabPills}</div>
    <div class="card">
      <div class="toolbar" style="justify-content:space-between">
        <span style="color:var(--muted);font-size:13px">등록된 스펙 ${groups.length}종 (레벨행 ${specs.length}건)</span>
        <span style="display:flex;gap:8px">
          <button type="button" class="btn js-cs-template">⭳ CSV 템플릿</button>
          <button type="button" class="btn btn-primary js-cs-upload">⭱ 샘플 스펙 불러오기 (더미)</button>
        </span>
      </div>
      <div class="notice" style="background:#fdf2f8;border:1px solid #fbcfe8;border-radius:6px;padding:8px 12px;font-size:12px;color:#9d174d;margin-bottom:12px">
        프로토타입: 실제 파일 업로드 대신 <strong>[샘플 스펙 불러오기]</strong> 버튼이 더미 CSV(워터월드 DBO 덮어쓰기 + 곤돌라 DC1 신규 + 카테고리 오류행 1건)를 주입해 <strong>검증·덮어쓰기 확인·이력</strong>을 시연합니다. S17 미등록 카테고리 행은 실패 처리됩니다.
      </div>
      ${groups.length === 0 ? `<div class="empty">등록된 스펙이 없습니다. <strong>[샘플 스펙 불러오기]</strong>를 눌러 주입하세요.</div>` : cards}
    </div>`;

  main.querySelector(".js-cs-upload").addEventListener("click", () => runTicketDummyUpload(main));
  main.querySelector(".js-cs-template").addEventListener("click", () => {
    const header = ["카테고리", "상품유형", "쿠폰코드", "이용권명", "레벨", "쿠폰명", "입금가", "할인대상내역", "사용시작일", "사용종료일"];
    const sample = ["워터파크", "", "DBO", "OAT_26성수기_얼리_워터월드(플레이스토리)", "1", "워터월드 종일권_성수기(대인/얼리)", "40000", "종일권_대인_남_4계절 상품 외 15종", "2026-07-10", "2026-08-30"];
    const csv = "﻿" + header.join(",") + "\n" + sample.join(",") + "\n";
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = "coupon_spec_template.csv"; a.click(); URL.revokeObjectURL(a.href);
  });
  main.querySelectorAll(".js-cs-toggle").forEach((b) => b.addEventListener("click", () => {
    const cid = b.getAttribute("data-cid");
    const list = loadCouponSpecs();
    const curOn = list.filter((s) => s.coupon_id === cid).every((s) => s.active !== false);
    if (!confirm(curOn ? `쿠폰 ${cid}를 미노출 처리하시겠습니까?\n연결된 티켓 상품이 전부 강제 미노출(🔒)됩니다.` : `쿠폰 ${cid}를 노출 처리하시겠습니까?`)) return;
    list.forEach((s) => { if (s.coupon_id === cid) s.active = !curOn; });
    saveCouponSpecs(list);
    renderCouponSpecPage(main, "list");
  }));
  main.querySelectorAll(".js-cs-del").forEach((b) => b.addEventListener("click", () => {
    const cid = b.getAttribute("data-cid");
    if (!confirm(`쿠폰 스펙 ${cid}를 삭제할까요? (연결 상품·발급 쿠폰이 0건일 때만 가능)`)) return;
    saveCouponSpecs(loadCouponSpecs().filter((s) => s.coupon_id !== cid));
    renderCouponSpecPage(main, "list");
  }));
}

/* =========================== S14-A 티켓 상품 목록 =========================== */
function renderTicketProductList(main) {
  ensureTicketStores();
  const products = loadTicketProducts();
  const specs = loadCouponSpecs();
  const specByCoupon = groupCouponSpecs(specs);

  // 카드형(A안): 상품 = 그룹 카드(헤더=상품명·쿠폰ID·카테고리·노출·액션), 레벨 = 카드 내 하위 테이블(입금가·마진·판매가)
  const cards = products
    .slice()
    .sort((a, b) => (b.updated_at || "").localeCompare(a.updated_at || ""))
    .map((p) => {
      const g = specByCoupon.get(p.spec_coupon_id);
      const specOn = g ? g.active : false;
      const sale = ticketSaleStatus(p);
      const forcedHide = !specOn; // 스펙 OFF → 강제 미노출
      const shown = p.visibility !== "N" && specOn && sale.key === "on"; // 노출 = 스펙ON AND 상품ON AND 판매중 (v0.9 OR 미노출)
      const margin = getTicketMargin(p.spec_coupon_id);
      const marginLabel = margin.type === "rate" ? `${margin.value}%` : `+${Number(margin.value).toLocaleString()}원`;
      const saleBadgeCls = sale.key === "on" ? "on" : "off";
      const catCol = `${escapeHtml(p.category_1)}${p.category_2 ? " › " + escapeHtml(p.category_2) : ""}`;
      const saleCol = escapeHtml(fmtSalePeriod(p));
      const lvRows = g ? g.rows.map((r) => {
        const sell = computeSellPrice(r.price, margin.type, margin.value);
        return `
        <tr>
          <td><span class="tk-lv-pill ${r.level === 2 ? "lv2" : ""}">LV.${r.level}</span> ${escapeHtml(r.level_name)}</td>
          <td>${escapeHtml(r.coupon_name)}</td>
          <td>${catCol}</td>
          <td>${saleCol}</td>
          <td>${escapeHtml(r.use_start_date)} ~ ${escapeHtml(r.use_end_date)}</td>
          <td>${Number(r.price).toLocaleString()}원</td>
          <td>${marginLabel}</td>
          <td class="tk-sell">${sell.toLocaleString()}원</td>
        </tr>`;
      }).join("") : `<tr><td colspan="8" style="color:#d33">⚠ 연결 스펙(${escapeHtml(p.spec_coupon_id)})을 찾을 수 없습니다.</td></tr>`;
      const thumb = ticketProductImg(p) ? `<img src="${escapeAttr(ticketProductImg(p))}" alt="" style="width:44px;height:30px;object-fit:cover;border-radius:4px;flex-shrink:0">` : "";
      return `
      <div class="tk-card ${shown ? "" : "is-off"}">
        <div class="tk-card-head">
          ${thumb}
          <span class="tk-code tk-code-prod">${escapeHtml(p.spec_coupon_id)}</span>
          <span class="tk-head-title">${escapeHtml(p.name_en)}${p.name_zh ? ` <span style="color:var(--muted);font-weight:400">${escapeHtml(p.name_zh)}</span>` : ""}</span>
          <span class="tk-head-actions">
            <span class="badge ${saleBadgeCls}">${sale.label}</span>
            ${forcedHide ? '<span class="badge off">강제 미노출 🔒</span>' : `<span class="badge ${shown ? "on" : "off"}">${shown ? "노출중" : "미노출"}</span>`}
            <button type="button" class="btn btn-ghost js-tp-toggle" data-id="${escapeAttr(p.id)}" ${forcedHide ? "disabled title=\"연결 스펙이 미노출(OFF)이라 제어할 수 없습니다\"" : ""}>${p.visibility === "N" ? "노출" : "미노출"}</button>
            <button type="button" class="btn btn-ghost js-tp-edit" data-id="${escapeAttr(p.id)}">수정</button>
            <button type="button" class="btn btn-ghost js-tp-del" data-id="${escapeAttr(p.id)}">삭제</button>
          </span>
        </div>
        <div class="tk-lv-scroll"><table class="tk-lv-table">
          <thead><tr><th style="width:110px">레벨</th><th style="min-width:180px">쿠폰명</th><th style="width:130px">카테고리</th><th style="width:170px">판매기간</th><th style="width:170px">사용기간</th><th style="width:95px">입금가</th><th style="width:95px">적용 마진</th><th style="width:105px">판매가</th></tr></thead>
          <tbody>${lvRows}</tbody>
        </table></div>
      </div>`;
    }).join("");

  main.innerHTML = `
    <h2 class="page-title">티켓 상품 <span class="badge" style="background:#fce7f3;color:#ec4899">티켓관리</span></h2>
    <p class="page-desc">S13 쿠폰 스펙 기반 판매 상품입니다(스펙 1 : 상품 N). <strong>카드 = 상품, 카드 안 행 = 레벨(대인/소인)</strong>. 마진은 쿠폰ID 단위(S11 티켓 탭)로 관리되며 여기선 판매가로 표시만 됩니다. 저장소: <code>${STORAGE_TICKET_PRODUCTS}</code></p>
    <div class="card">
      <div class="toolbar" style="justify-content:space-between">
        <span style="color:var(--muted);font-size:13px">총 ${products.length}개 상품</span>
        <button type="button" class="btn btn-primary js-tp-new">+ 상품 등록</button>
      </div>
      ${products.length === 0 ? `<div class="empty">등록된 티켓 상품이 없습니다. <strong>[+ 상품 등록]</strong>으로 추가하세요. (먼저 S13에 스펙이 있어야 합니다)</div>` : cards}
    </div>`;

  const newBtn = main.querySelector(".js-tp-new");
  if (newBtn) newBtn.addEventListener("click", () => {
    if (loadCouponSpecs().length === 0) { alert("먼저 S13 쿠폰 스펙 관리에서 스펙을 등록하세요."); return; }
    navigate("ticket-products/new");
  });
  main.querySelectorAll(".js-tp-edit").forEach((b) => b.addEventListener("click", () => navigate("ticket-products/edit/" + b.getAttribute("data-id"))));
  main.querySelectorAll(".js-tp-del").forEach((b) => b.addEventListener("click", () => {
    if (!confirm("이 티켓 상품을 삭제할까요?")) return;
    saveTicketProducts(loadTicketProducts().filter((x) => x.id !== b.getAttribute("data-id")));
    renderTicketProductList(main);
  }));
  main.querySelectorAll(".js-tp-toggle").forEach((b) => b.addEventListener("click", () => {
    const list = loadTicketProducts();
    const p = list.find((x) => x.id === b.getAttribute("data-id"));
    if (!p) return;
    p.visibility = p.visibility === "N" ? "Y" : "N";
    p.updated_at = new Date().toISOString();
    saveTicketProducts(list);
    renderTicketProductList(main);
  }));
}

/* =========================== S14-B 티켓 상품 마스터 (+탭2 커트오프) =========================== */
function renderTicketProductForm(main, id) {
  ensureTicketStores();
  const editing = id ? loadTicketProducts().find((x) => x.id === id) : null;
  const specGroups = Array.from(groupCouponSpecs(loadCouponSpecs()).values());

  const state = {
    tab: "master",
    name_en: editing?.name_en || "",
    name_zh: editing?.name_zh || "",
    cat1: editing?.category_1 || "",
    cat2: editing?.category_2 || "",
    spec_coupon_id: editing?.spec_coupon_id || "",
    visibility: editing?.visibility || "Y",
    sale_start_date: editing?.sale_start_date || "",
    sale_end_date: editing?.sale_end_date || "",
    date_mode: "open", // 오픈형 고정 (v0.4·항목4)
    cutoff: editing?.cutoff ? { ...editing.cutoff } : { n: 1, unit: "day", time: "23:59" },
    // 오픈형은 취소 특례(사용종료일 기준)를 적용하므로 이용일 구간은 편집하지 않음(항목5·v0.11 8.2).
    // 날짜지정형 전환 대비 기본값만 보존.
    cancel_policy: editing?.cancel_policy ? editing.cancel_policy.map((c) => ({ ...c })) : [{ base: "3plus", penalty: 0 }, { base: "today", penalty: 100 }],
    // 상품 이미지 — 썸네일만(검색결과·브릿지 카드·메인 추천). 상세설명·안내·정책·위치·히어로는 뎁스(S17 카테고리/컨텐츠) 소유.
    thumb_meta: editing?.thumb_meta ? editing.thumb_meta.map((m) => ({ ...m })) : [],
  };

  function syncFromDom() {
    const q = (id2) => main.querySelector(id2);
    if (state.tab === "master") {
      if (q("#tp_en")) state.name_en = q("#tp_en").value;
      if (q("#tp_zh")) state.name_zh = q("#tp_zh").value;
      if (q("#tp_sale_s")) state.sale_start_date = q("#tp_sale_s").value;
      if (q("#tp_sale_e")) state.sale_end_date = q("#tp_sale_e").value;
    } else if (state.tab === "date") {
      if (q("#tp_cutn")) state.cutoff.n = parseInt(q("#tp_cutn").value, 10) || 0;
      if (q("#tp_cutunit")) state.cutoff.unit = q("#tp_cutunit").value;
      if (q("#tp_cuttime")) state.cutoff.time = q("#tp_cuttime").value;
    }
    // 썸네일은 파일 입력·state 직접 관리라 sync 불필요
  }

  function render() {
    const tops = ticketTopCategories();
    const subs = state.cat1 ? ticketSubCategories((tops.find((t) => t.name_ko === state.cat1) || {}).id) : [];
    // 항목3: 카테고리1(+2) 선택 → 연결 스펙 필터. 1개면 자동선택.
    const filteredSpecs = state.cat1
      ? specGroups.filter((sg) => sg.category === state.cat1 && (state.cat2 ? sg.product_type === state.cat2 : true))
      : [];
    if (state.spec_coupon_id && !filteredSpecs.some((s) => s.coupon_id === state.spec_coupon_id)) state.spec_coupon_id = "";
    if (!state.spec_coupon_id && filteredSpecs.length === 1) state.spec_coupon_id = filteredSpecs[0].coupon_id;

    const g = specGroups.find((x) => x.coupon_id === state.spec_coupon_id);
    const margin = getTicketMargin(state.spec_coupon_id);
    const marginLabel = margin.type === "rate" ? `${margin.value}%` : `+${Number(margin.value).toLocaleString()}원`;
    const useEnd = g && g.rows.length ? g.rows[0].use_end_date : "";

    const tabPills = `
      <a class="room-master-tab ${state.tab === "master" ? "active" : ""}" href="javascript:void(0)" data-tab="master">탭1 · 상품 마스터</a>
      <a class="room-master-tab ${state.tab === "date" ? "active" : ""}" href="javascript:void(0)" data-tab="date">탭2 · 날짜 설정</a>`;

    const thumbCardHtml = () => {
      const grid = "display:grid;grid-template-columns:repeat(auto-fill,minmax(140px,1fr));gap:10px;margin-bottom:10px";
      const thumbs = state.thumb_meta.length
        ? state.thumb_meta.map((m, i) => `<div class="image-meta-item"><img src="${escapeAttr(m.data_url)}" alt="" style="width:100%;height:90px;object-fit:cover;border-radius:6px"><button type="button" class="image-meta-delete js-tpt-del" data-i="${i}">×</button></div>`).join("")
        : `<div style="color:var(--muted);font-size:13px;padding:8px 0">등록된 썸네일이 없습니다.</div>`;
      return `<div class="card">
          <h3 style="margin-top:0">③ 썸네일 <span class="badge">검색결과·브릿지 카드·메인 추천</span></h3>
          <div class="notice" style="background:#eef2ff;border:1px solid #c7d2fe;border-radius:6px;padding:8px 12px;font-size:12px;color:#3730a3;margin:0 0 10px">상세설명·이용안내·정책·위치·히어로 이미지는 <strong>카테고리/컨텐츠 관리(S17)</strong>에서 뎁스 단위로 관리합니다. 상품엔 목록 대표 <strong>썸네일</strong>만 등록합니다. (${PLACE_IMAGE_MAX_MB}MB 이하, 첫 장이 대표)</div>
          <div class="image-meta-list" style="${grid}">${thumbs}</div>
          <input type="file" id="tp_thumb_img" accept="image/*" multiple>
        </div>`;
    };

    const inputStyle = "width:100%;padding:8px;border:1px solid #ddd;border-radius:6px";
    let panel = "";
    if (state.tab === "master") {
      const levelRows = g ? g.rows.map((r) => {
        const sell = computeSellPrice(r.price, margin.type, margin.value);
        return `<tr><td>LV.${r.level} ${escapeHtml(r.level_name)}</td><td>${Number(r.price).toLocaleString()}원</td><td>${marginLabel} <span class="badge">읽기전용</span></td><td><strong>${sell.toLocaleString()}원</strong></td></tr>`;
      }).join("") : `<tr><td colspan="4" style="color:var(--muted)">카테고리를 선택하면 연결 스펙이 좁혀지고, 스펙 선택 시 레벨·판매가가 표시됩니다.</td></tr>`;
      // 항목3: 필터된 스펙 드롭다운 (카테고리 미선택 시 안내)
      const specOptions = !state.cat1
        ? `<option value="">먼저 카테고리를 선택하세요</option>`
        : filteredSpecs.length === 0
          ? `<option value="">이 카테고리에 연결 가능한 스펙 없음</option>`
          : `<option value="">선택</option>` + filteredSpecs.map((sg) => `<option value="${escapeAttr(sg.coupon_id)}" ${state.spec_coupon_id === sg.coupon_id ? "selected" : ""}>${escapeHtml(sg.coupon_id)} — ${escapeHtml(sg.pass_name)}</option>`).join("");
      panel = `
        <div class="card">
          <h3 style="margin-top:0">① 기본정보</h3>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px">
            <label style="font-size:13px">상품명 (EN) <span style="color:#d33">*</span><br><input type="text" id="tp_en" value="${escapeAttr(state.name_en)}" style="${inputStyle}"></label>
            <label style="font-size:13px">상품명 (ZH) <span style="color:var(--muted)">선택</span><br><input type="text" id="tp_zh" value="${escapeAttr(state.name_zh)}" style="${inputStyle}"></label>
            <label style="font-size:13px">카테고리 1뎁스 <span style="color:#d33">*</span><br>
              <select id="tp_cat1" style="${inputStyle}"><option value="">선택</option>${tops.map((t) => `<option value="${escapeAttr(t.name_ko)}" ${state.cat1 === t.name_ko ? "selected" : ""}>${escapeHtml(t.name_ko)} (${escapeHtml(t.name_en)})</option>`).join("")}</select></label>
            <label style="font-size:13px">카테고리 2뎁스 (상품유형)<br>
              <select id="tp_cat2" style="${inputStyle}" ${subs.length ? "" : "disabled"}><option value="">${subs.length ? "전체(상품유형 무관)" : "— 없음"}</option>${subs.map((s) => `<option value="${escapeAttr(s.name_ko)}" ${state.cat2 === s.name_ko ? "selected" : ""}>${escapeHtml(s.name_ko)}</option>`).join("")}</select></label>
            <label style="font-size:13px">연결 스펙 (쿠폰ID) <span style="color:#d33">*</span> <span style="color:var(--muted)">— 카테고리로 자동 필터</span><br>
              <select id="tp_spec" style="${inputStyle}" ${state.cat1 && filteredSpecs.length ? "" : "disabled"}>${specOptions}</select></label>
            <label style="font-size:13px">노출 여부<br>
              <select id="tp_vis" style="${inputStyle}"><option value="Y" ${state.visibility !== "N" ? "selected" : ""}>노출</option><option value="N" ${state.visibility === "N" ? "selected" : ""}>미노출</option></select></label>
            <label style="font-size:13px">판매 시작일 <span style="color:var(--muted)">선택·미설정 시 즉시</span><br><input type="date" id="tp_sale_s" value="${escapeAttr(state.sale_start_date)}" style="${inputStyle}"></label>
            <label style="font-size:13px">판매 종료일 <span style="color:var(--muted)">선택·경과 시 자동 미노출</span><br><input type="date" id="tp_sale_e" value="${escapeAttr(state.sale_end_date)}" style="${inputStyle}"></label>
          </div>
          <div class="notice" style="background:#eff6ff;border:1px solid #bfdbfe;border-radius:6px;padding:8px 12px;font-size:12px;color:#1e40af;margin-top:10px">판매기간(우리 홈페이지 판매 가능 기간)은 High1 사용기간(현장 입장 가능 기간)과 별개입니다. 판매종료일 자정 경과 시 프런트 자동 미노출(v0.9).</div>
        </div>
        <div class="card">
          <h3 style="margin-top:0">② 레벨 구성 & 판매가 <span class="badge">마진 읽기전용</span></h3>
          <p class="page-desc" style="margin-top:0">이 상품 마진: 쿠폰ID <strong>${escapeHtml(state.spec_coupon_id || "-")}</strong> 기준 <strong>${state.spec_coupon_id ? marginLabel : "-"}</strong> · <span class="link js-margin-link" style="cursor:pointer">편집: S11 마진관리 티켓 탭 →</span></p>
          <table><thead><tr><th>레벨</th><th>입금가</th><th>적용 마진 (S11·읽기전용)</th><th>판매가</th></tr></thead><tbody>${levelRows}</tbody></table>
        </div>
        <div class="card">
          <h3 style="margin-top:0">③ 취소/환불 정책 <span class="badge" style="background:#ecfdf5;color:#047857">오픈형 고정</span></h3>
          <p class="page-desc" style="margin-top:0">오픈형 상품은 이용일이 없어 <strong>이용일 기준 구간을 설정하지 않습니다.</strong> 아래 <strong>사용기간 종료일 기준</strong> 규칙이 자동 적용됩니다. (정책 v0.11 8.2절)</p>
          <table><thead><tr><th>취소 시점</th><th>쿠폰 상태</th><th>환불</th></tr></thead><tbody>
            <tr><td>사용종료일(<strong>${useEnd || "연결 스펙의 사용종료일"}</strong>) 이전</td><td>미사용 (SOLD)</td><td style="color:#1a7f37;font-weight:600">전액 환불</td></tr>
            <tr><td>사용종료일(<strong>${useEnd || "연결 스펙의 사용종료일"}</strong>) 이후</td><td>미사용 (SOLD)</td><td style="color:#d33;font-weight:600">환불 불가</td></tr>
            <tr><td>사용 완료 후</td><td>사용됨 (USED)</td><td style="color:#d33;font-weight:600">환불 불가</td></tr>
          </tbody></table>
        </div>
        ${thumbCardHtml()}`;
    } else if (state.tab === "date") {
      const isOpen = state.date_mode === "open";
      panel = `
        <div class="card">
          <h3 style="margin-top:0">날짜 방식</h3>
          <div style="display:flex;align-items:center;gap:8px;font-size:14px"><span class="badge on">오픈형 (고정)</span> 사용기간 내 자유 사용 — 현재 운영 방식</div>
          <div class="notice" style="background:#ecfdf5;border:1px solid #a7f3d0;border-radius:6px;padding:8px 12px;font-size:12px;color:#065f46;margin-top:10px">오픈형은 날짜별 한도·입금가 설정이 없습니다. 사용기간은 스펙(사용시작/종료일)을 표시용으로만 사용하며 날짜 유효성 체크는 하지 않습니다(DBER31/32 미발생). ※ 날짜지정형은 정책상 기능 유지이나 현재 프로토타입 범위 밖.</div>
        </div>
        ${isOpen
          ? `<div class="card"><h3 style="margin-top:0">커트오프 (예약 마감)</h3><div class="notice" style="background:#f8f9fb;border:1px solid #e5e7eb;border-radius:6px;padding:8px 12px;font-size:12px;color:var(--muted)">커트오프는 <strong>이용일 기준 마감</strong>이라 이용일이 없는 <strong>오픈형에는 적용되지 않습니다.</strong> 날짜지정형에서만 설정합니다.</div></div>`
          : `<div class="card">
          <h3 style="margin-top:0">커트오프 (예약 마감)</h3>
          <p class="page-desc" style="margin-top:0">미설정 시 이용일 당일 자정까지 구매 가능.</p>
          <div style="display:flex;align-items:center;gap:8px">
            이용일 <input type="number" id="tp_cutn" value="${state.cutoff.n}" min="0" style="width:70px;padding:6px">
            <select id="tp_cutunit" style="padding:6px"><option value="day" ${state.cutoff.unit === "day" ? "selected" : ""}>일</option><option value="hour" ${state.cutoff.unit === "hour" ? "selected" : ""}>시간</option></select>
            전 <input type="time" id="tp_cuttime" value="${escapeAttr(state.cutoff.time)}" style="padding:6px"> 까지
          </div>
        </div>`}`;
    }

    main.innerHTML = `
      <h2 class="page-title">${editing ? "티켓 상품 수정" : "티켓 상품 등록"} <span class="badge" style="background:#fce7f3;color:#ec4899">티켓관리</span></h2>
      <p class="page-desc">${editing ? `상품코드 ${escapeHtml(editing.product_code)}` : "신규 상품"} · 저장소: <code>${STORAGE_TICKET_PRODUCTS}</code></p>
      <div class="room-master-tabs">${tabPills}</div>
      ${panel}
      <p id="tp_err" class="error"></p>
      <div class="toolbar" style="gap:8px">
        <button type="button" class="btn js-tp-cancel">취소</button>
        <button type="button" class="btn btn-primary js-tp-save">저장</button>
      </div>`;

    // 탭 전환
    main.querySelectorAll(".room-master-tab[data-tab]").forEach((el) => el.addEventListener("click", () => { syncFromDom(); state.tab = el.getAttribute("data-tab"); render(); }));
    // master 탭 컨트롤
    const cat1 = main.querySelector("#tp_cat1");
    if (cat1) cat1.addEventListener("change", () => { syncFromDom(); state.cat1 = cat1.value; state.cat2 = ""; state.spec_coupon_id = ""; render(); });
    const cat2 = main.querySelector("#tp_cat2");
    if (cat2) cat2.addEventListener("change", () => { syncFromDom(); state.cat2 = cat2.value; state.spec_coupon_id = ""; render(); });
    const spec = main.querySelector("#tp_spec");
    if (spec) spec.addEventListener("change", () => { syncFromDom(); state.spec_coupon_id = spec.value; render(); });
    const vis = main.querySelector("#tp_vis");
    if (vis) vis.addEventListener("change", () => { state.visibility = vis.value; });
    const mlink = main.querySelector(".js-margin-link");
    if (mlink) mlink.addEventListener("click", () => alert("S11 마진관리 티켓 탭은 이후 단계에서 구현됩니다. (Phase 1은 더미 마진 읽기전용 표시)"));

    // 썸네일 업로드·삭제 (탭1 하단)
    const thumbInput = main.querySelector("#tp_thumb_img");
    if (thumbInput) thumbInput.addEventListener("change", async () => {
      syncFromDom();
      for (const f of Array.from(thumbInput.files || [])) {
        try { const src = await resolveImageSrc(f); state.thumb_meta.push({ data_url: src, name: f.name }); }
        catch (e) { alert(e.message || "이미지 추가 실패"); }
      }
      render();
    });
    main.querySelectorAll(".js-tpt-del").forEach((b) => b.addEventListener("click", () => { state.thumb_meta.splice(parseInt(b.getAttribute("data-i"), 10), 1); render(); }));

    main.querySelector(".js-tp-cancel").addEventListener("click", () => navigate("ticket-products"));
    main.querySelector(".js-tp-save").addEventListener("click", () => {
      syncFromDom();
      const err = main.querySelector("#tp_err"); err.textContent = "";
      const fail = (msg) => { state.tab = "master"; render(); main.querySelector("#tp_err").textContent = msg; };
      if (!state.name_en.trim()) return fail("상품명(EN)은 필수입니다.");
      if (!state.cat1) return fail("카테고리(1뎁스)를 선택하세요.");
      if (!state.spec_coupon_id) return fail("연결 스펙(쿠폰ID)을 선택하세요. (카테고리를 고르면 해당 스펙만 표시됩니다)");
      if (state.sale_start_date && state.sale_end_date && state.sale_start_date > state.sale_end_date) return fail("판매 종료일이 시작일보다 빠릅니다.");
      // 오픈형 취소정책은 사용종료일 기준 고정(항목5·v0.11) — 구간 유효성 검사 없음.
      const list = loadTicketProducts();
      const now = new Date().toISOString();
      const payload = { name_en: state.name_en.trim(), name_zh: state.name_zh.trim(), category_1: state.cat1, category_2: state.cat2, spec_coupon_id: state.spec_coupon_id, visibility: state.visibility, sale_start_date: state.sale_start_date, sale_end_date: state.sale_end_date, date_mode: "open", cutoff: state.cutoff, cancel_policy: state.cancel_policy, thumb_meta: state.thumb_meta };
      if (editing) {
        Object.assign(list.find((x) => x.id === editing.id), payload, { updated_at: now });
      } else {
        list.push({ id: uid(), product_code: nextTicketProductCode(list), ...payload, created_at: now, updated_at: now });
      }
      try {
        saveTicketProducts(list);
      } catch (e) {
        if (isStorageQuotaExceeded(e)) return fail("저장 공간(localStorage)이 부족합니다. 썸네일 이미지 용량을 줄여주세요.");
        return fail("저장 실패: " + (e && e.message || e));
      }
      alert("저장되었습니다.");
      navigate("ticket-products");
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

/* =========================================================================
 * 리치 에디터 (프로토타입) — contenteditable + 툴바
 *  - [이미지 불러오기] 파일 선택 / Ctrl+V 이미지 붙여넣기 / 굵게·제목·목록
 *  - HTML 문자열을 읽고 씀. 대용량 콘텐츠 필드(설명·안내·정책·상품상세)에 공용 사용.
 * =====================================================================*/
const RICH_IMG_MAX_MB = 2;

function richEditorHtml(id, html, opts) {
  opts = opts || {};
  const minH = opts.minHeight || 160;
  return `
    <div class="rich-ed" data-ed="${id}">
      <div class="rich-tb">
        <button type="button" class="rich-btn" data-cmd="bold" title="굵게"><b>B</b></button>
        <button type="button" class="rich-btn" data-cmd="formatBlock" data-val="h3" title="제목">제목</button>
        <button type="button" class="rich-btn" data-cmd="insertUnorderedList" title="목록">• 목록</button>
        <span class="rich-tb-div"></span>
        <button type="button" class="rich-btn rich-img-btn" title="이미지 불러오기">🖼 이미지 불러오기</button>
        <span class="rich-tb-hint">이미지는 Ctrl+V 붙여넣기도 됩니다</span>
        <input type="file" class="rich-file" accept="image/*" multiple hidden />
      </div>
      <div id="${id}" class="rich-area" contenteditable="true" style="min-height:${minH}px">${html || ""}</div>
    </div>`;
}

/* ── Cloudinary 이미지 업로드 (프로토타입: 무인증 업로드) ──
 * 붙여넣은/불러온 이미지를 Cloudinary에 올리고 URL만 localStorage에 저장.
 * → base64 미저장 → 용량 문제 해소. 업로드 실패 시 압축 base64로 폴백. */
const CLOUDINARY = { cloud: "gu089qzz", preset: "high1_unsigned" };

/** 캔버스로 리사이즈 후 Blob(JPEG) 반환 — 업로드 대역폭 절약 */
function compressImageToBlob(fileOrBlob, maxDim, quality) {
  maxDim = maxDim || 1600;
  quality = quality || 0.82;
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(fileOrBlob);
    const img = new Image();
    img.onload = () => {
      let w = img.naturalWidth || img.width, h = img.naturalHeight || img.height;
      const s = Math.min(1, maxDim / Math.max(w, h || 1));
      w = Math.max(1, Math.round(w * s)); h = Math.max(1, Math.round(h * s));
      const cv = document.createElement("canvas");
      cv.width = w; cv.height = h;
      const cx = cv.getContext("2d");
      cx.fillStyle = "#ffffff"; cx.fillRect(0, 0, w, h);
      cx.drawImage(img, 0, 0, w, h);
      URL.revokeObjectURL(url);
      cv.toBlob((b) => (b ? resolve(b) : reject(new Error("이미지 처리 실패"))), "image/jpeg", quality);
    };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error("이미지를 불러올 수 없습니다.")); };
    img.src = url;
  });
}

/** Cloudinary 업로드 → secure_url 반환 */
function uploadToCloudinary(fileOrBlob) {
  return compressImageToBlob(fileOrBlob).then((blob) => {
    const fd = new FormData();
    fd.append("upload_preset", CLOUDINARY.preset);
    fd.append("file", blob);
    return fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY.cloud}/image/upload`, { method: "POST", body: fd })
      .then((r) => r.json())
      .then((j) => { if (j && j.secure_url) return j.secure_url; throw new Error((j && j.error && j.error.message) || "업로드 실패"); });
  });
}

/** 이미지 소스 확보: Cloudinary URL(우선) → 실패 시 압축 base64 폴백 */
function resolveImageSrc(fileOrBlob) {
  return uploadToCloudinary(fileOrBlob).catch((e) => {
    console.warn("Cloudinary 업로드 실패 → base64 폴백:", e && e.message);
    return compressImageToDataUrl(fileOrBlob);
  });
}

/** 이미지 메타 객체 확보(숙소·객실용) — Cloudinary URL 우선, 실패 시 base64 메타 폴백 */
function buildImageMetaSmart(file, maxMB) {
  return uploadToCloudinary(file)
    .then((url) => ({ name: file.name, size: file.size, type: "image/jpeg", data_url: url, cdn: true }))
    .catch((e) => { console.warn("Cloudinary 업로드 실패 → base64 폴백:", e && e.message); return buildImageMetaWithDataUrl(file, maxMB); });
}

/**
 * 이미지 자동 축소 — 캔버스 리사이즈 + JPEG 압축으로 data URL 크기 대폭 감소.
 * localStorage 용량 초과 방지(폴백용). 화면 확인용 화질로 충분.
 */
function compressImageToDataUrl(fileOrBlob, maxDim, quality) {
  maxDim = maxDim || 1400;
  quality = quality || 0.72;
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(fileOrBlob);
    const img = new Image();
    img.onload = () => {
      let w = img.naturalWidth || img.width, h = img.naturalHeight || img.height;
      const scale = Math.min(1, maxDim / Math.max(w, h || 1));
      w = Math.max(1, Math.round(w * scale));
      h = Math.max(1, Math.round(h * scale));
      const cv = document.createElement("canvas");
      cv.width = w; cv.height = h;
      const cx = cv.getContext("2d");
      cx.fillStyle = "#ffffff"; cx.fillRect(0, 0, w, h); // JPEG 투명 배경 대비 흰 배경
      cx.drawImage(img, 0, 0, w, h);
      URL.revokeObjectURL(url);
      let out;
      try { out = cv.toDataURL("image/jpeg", quality); } catch (e) { out = cv.toDataURL(); }
      resolve(out);
    };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error("이미지를 불러올 수 없습니다.")); };
    img.src = url;
  });
}

function _richInsertImageSrc(area, src) {
  const safe = String(src).replace(/"/g, "&quot;");
  area.focus();
  document.execCommand(
    "insertHTML",
    false,
    `<img src="${safe}" alt="" style="max-width:100%;height:auto;display:block;border-radius:6px;margin:8px 0;" />`
  );
}

function wireRichEditors(scope) {
  scope.querySelectorAll(".rich-ed").forEach((ed) => {
    const area = ed.querySelector(".rich-area");
    const file = ed.querySelector(".rich-file");
    // 서식 버튼 (mousedown로 선택영역 유지)
    ed.querySelectorAll(".rich-btn[data-cmd]").forEach((b) => {
      b.addEventListener("mousedown", (e) => {
        e.preventDefault();
        area.focus();
        document.execCommand(b.getAttribute("data-cmd"), false, b.getAttribute("data-val") || null);
      });
    });
    // 이미지 불러오기
    ed.querySelector(".rich-img-btn").addEventListener("click", () => file.click());
    file.addEventListener("change", async () => {
      for (const f of Array.from(file.files || [])) {
        try {
          const src = await resolveImageSrc(f); // Cloudinary URL(우선) / base64 폴백
          _richInsertImageSrc(area, src);
        } catch (err) {
          alert(err.message || "이미지 추가 실패");
        }
      }
      file.value = "";
    });
    // 이미지 붙여넣기 — 업로드 후 URL 삽입
    area.addEventListener("paste", (e) => {
      const items = e.clipboardData && e.clipboardData.items;
      if (!items || !items.length) return;
      for (let i = 0; i < items.length; i++) {
        if (!items[i].type.startsWith("image/")) continue;
        const f = items[i].getAsFile();
        if (!f) continue;
        e.preventDefault();
        resolveImageSrc(f)
          .then((src) => _richInsertImageSrc(area, src))
          .catch((err) => alert(err.message || "이미지 붙여넣기 실패"));
        return;
      }
    });
  });
}

function readRichEditor(scope, id) {
  const el = scope.querySelector("#" + id);
  return el ? el.innerHTML.trim() : "";
}

window.addEventListener("DOMContentLoaded", () => {
  ensureFacilityStores();
  ensureRoomMasters();
  ensureTicketStores();
  boot();
});
