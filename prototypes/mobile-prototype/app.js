/* =========================================================
   High1 Mobile Prototype — app.js  (v0.4.4)
        · [v0.4.0] 바코드=중앙 팝업(PC 동일, ‹›이동·사용처리 토스트) · 티켓 목록카드 총수 상품명 하단 이동(높이 축소) · 티켓 예약상세 UI 정돈(쿠폰 섹션 카드화·행 좌우패딩·중복CSS 정리)
        · [v0.3.8] 숙소 나의예약 = 시드(high1_reservations_v1) 공유(하드코딩 폴백) — 목록·상세·취소·취소완료 정규화(코드 키). 로그인/이메일 무관 노출.
        · [v0.3.9] [버그픽스] 바코드/취소 바텀시트 루트에 fixed 규칙 추가(#mbBcRoot·#mbCancelRoot) → 긴 페이지에서 시트가 화면 밖(딤만)으로 가던 문제 해결. 취소 스테퍼 부분갱신(전체 재렌더 제거) → 깜빡임 해소.
   기준: 개발환경 현재 화면/기능을 모바일로 재현 + 버그 개선
   데이터: 숙소=더미 시드 / 티켓=어드민 공유 localStorage(동일 키) + 시드 fallback
   화면: 공용 셸 · 홈 · 검색 · 숙소 상세/예약/결제/완료 · 마이페이지
        · [v0.3.0] 티켓 브릿지·상세시트·체크아웃·주문완료 신설
        · [v0.3.1] 검색 도메인 토글(숙소/티켓) + 티켓 검색결과(#/ticket/search)·필터
        · [v0.3.7] 티켓 마이페이지 PC 동일화 — 목록(외N종·총N매·유효기간/금액제외·탭규칙)
          + 상세(상태탭·[바코드보기]시트 스와이프·현장사용처리 데모·토스트·결제내역 성인/아동
          ·구매자 국가/국가번호·섹션순서·고객센터) + 부분취소 확인단계
   ========================================================= */

/* ---------- 아이콘 (인라인 SVG) ---------- */
const ICO = {
  cal: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 9h18M8 3v4M16 3v4"/></svg>`,
  users: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="8" r="3.2"/><path d="M3.5 20a5.5 5.5 0 0 1 11 0M16.5 5.5a3 3 0 0 1 0 5.6M17 20a5.5 5.5 0 0 0-3-4.9"/></svg>`,
  bed: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M3 8v11M3 13h18v6M21 13v6M7 13v-3h6a4 4 0 0 1 4 4"/></svg>`,
  search: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.2-3.2"/></svg>`,
};

/* ---------- 그라데이션 플레이스홀더 ---------- */
const GRAD = {
  ski: "linear-gradient(135deg,#8aa0c9,#5f6f92 55%,#3c465f)",
  night: "linear-gradient(135deg,#3a1a5e,#7c3aed 45%,#c026d3 90%)",
  snow: "linear-gradient(135deg,#c9d6e8,#9fb2ce 60%,#6d7f9e)",
  room1: "linear-gradient(135deg,#e6d3b3,#c9a878 60%,#9c7a4f)",
  room2: "linear-gradient(135deg,#d8c1a0,#b89b73 60%,#8a6f4c)",
  condo: "linear-gradient(135deg,#e9c7a0,#d99a5c 60%,#b06e33)",
  palace: "linear-gradient(135deg,#b8c6e0,#7f95bf 60%,#4f6699)",
};

/* ---------- 더미 시드 ---------- */
const PLACES = [
  { id: "convention-tower", type: "hotel", name: "Convention Tower", subtitle: "Grand Convention Hotel", hero: GRAD.night,
    checkin: "15:00", checkout: "11:00",
    facilities: ["Gift Shop", "Free WiFi (Public)", "Free Parking", "Business Center", "Spa / Sauna", "Indoor / Outdoor Pool", "Water Slide", "Wellness Center", "Convenience Store", "Fitness"],
    desc: "A premium space that captures the elegance of High1. Enjoy sweeping mountain views, resort-class amenities, and easy access to the gondola and slopes.",
    rooms: [
      { id: "cv-lux-double", name: "Luxury Suite Best Sleep Double", bed: "Double x 1", size: 80, base: 2, max: 4, img: GRAD.room1, soldout: true, price: 320000 },
      { id: "cv-lux-twin", name: "Luxury Suite Best Sleep Twin", bed: "Twin x 2", size: 80, base: 2, max: 4, img: GRAD.room2, soldout: true, price: 320000 },
      { id: "cv-deluxe", name: "Deluxe Mountain View", bed: "Double x 1", size: 66, base: 2, max: 3, img: GRAD.room1, left: 3, price: 268000 },
    ] },
  { id: "high1-palace", type: "hotel", name: "High1 Palace", subtitle: "High1 Palace Hotel", hero: GRAD.palace,
    checkin: "15:00", checkout: "11:00",
    facilities: ["Free WiFi (Public)", "Free Parking", "Casino", "Spa / Sauna", "Fine Dining", "Sky Lounge", "Fitness", "Convenience Store"],
    desc: "High1's flagship hotel with panoramic ridge-line views, fine dining, and direct casino access.",
    rooms: [
      { id: "pl-suite", name: "Palace Suite Ridge View", bed: "King x 1", size: 92, base: 2, max: 4, img: GRAD.palace, left: 2, price: 410000 },
      { id: "pl-deluxe", name: "Palace Deluxe Twin", bed: "Twin x 2", size: 70, base: 2, max: 4, img: GRAD.palace, price: 350000 },
    ] },
  { id: "valley-condo", type: "condo", name: "Valley Condo", subtitle: "Valley Condominium", hero: GRAD.snow,
    checkin: "15:00", checkout: "11:00",
    facilities: ["Free Parking", "Kitchenette", "Laundry", "Convenience Store", "Ski Storage"],
    desc: "Self-catering condominium at the valley base — spacious family layouts steps from the beginner slopes.",
    rooms: [
      { id: "vl-fam", name: "Valley Family 4P", bed: "Ondol + Bed", size: 74, base: 4, max: 6, img: GRAD.condo, left: 5, price: 240000 },
      { id: "vl-std", name: "Valley Standard 2P", bed: "Double x 1", size: 46, base: 2, max: 3, img: GRAD.condo, soldout: true, price: 180000 },
    ] },
  { id: "hill-condo", type: "condo", name: "Hill Condo", subtitle: "Hill Condominium", hero: GRAD.ski,
    checkin: "15:00", checkout: "11:00",
    facilities: ["Free Parking", "Kitchenette", "Mountain View", "Ski Storage", "Laundry"],
    desc: "Hillside condominium with the closest ski-in access and wide living rooms for groups.",
    rooms: [
      { id: "hl-premium", name: "Hill Premium Kitchen 4P", bed: "Ondol + Bed", size: 82, base: 4, max: 6, img: GRAD.condo, left: 2, price: 288000 },
      { id: "hl-loft", name: "Hill Loft Suite", bed: "Double x 2", size: 96, base: 4, max: 6, img: GRAD.condo, left: 1, price: 330000 },
    ] },
];

// 카드 표시용 객실유형 라벨 + 시설(더미). 시설 없는 객실은 카드에서 시설 미노출(빈 값 숨김).
const ROOM_TYPE_LABEL = {
  "cv-lux-double": "Luxury Suite", "cv-lux-twin": "Luxury Suite", "cv-deluxe": "Deluxe",
  "pl-suite": "Palace Suite", "pl-deluxe": "Palace Deluxe",
  "vl-fam": "Family Condo", "vl-std": "Standard Condo",
  "hl-premium": "Premium Kitchen", "hl-loft": "Loft Suite",
};
const ROOM_FACILS = {
  "cv-lux-double": ["Free WiFi", "Smart TV", "Mini Bar", "Bath"],
  "cv-lux-twin": ["Free WiFi", "Smart TV", "Mini Bar"],
  "cv-deluxe": ["Free WiFi", "Mountain View"],
  "pl-suite": ["Free WiFi", "Ridge View", "Bath", "Lounge Access"],
  "hl-premium": ["Kitchenette", "Free WiFi", "Ski Storage"],
  "hl-loft": ["Kitchenette", "Free WiFi", "Mountain View"],
  // pl-deluxe, vl-fam, vl-std = 시설 데이터 없음 → 카드에서 숨김
};
// 객실 이미지(2장 이상이면 카드에서 좌우 스와이프). 지정 없으면 단일 이미지.
const ROOM_IMGS = {
  "cv-lux-double": [GRAD.room1, GRAD.room2, GRAD.night],
  "cv-deluxe": [GRAD.room1, GRAD.snow],
  "pl-suite": [GRAD.palace, GRAD.ski],
  "vl-fam": [GRAD.condo, GRAD.snow],
  "hl-premium": [GRAD.condo, GRAD.snow, GRAD.ski],
  "hl-loft": [GRAD.condo, GRAD.palace],
};
// 숙소상세 히어로 갤러리 이미지(좌우 스와이프)
const PLACE_IMGS = {
  "convention-tower": [GRAD.night, GRAD.ski, GRAD.palace],
  "high1-palace": [GRAD.palace, GRAD.ski],
  "valley-condo": [GRAD.snow, GRAD.condo],
  "hill-condo": [GRAD.ski, GRAD.snow, GRAD.condo],
};
PLACES.forEach((p) => {
  p.imgs = PLACE_IMGS[p.id] || [p.hero];
  p.rooms.forEach((r) => {
    r.type = ROOM_TYPE_LABEL[r.id] || "Room";
    r.facilities = ROOM_FACILS[r.id] || [];
    r.imgs = ROOM_IMGS[r.id] || [r.img];
  });
});

// 히어로 슬라이드 (한 개는 CTA 버튼 버전 — 라벨은 임시, 캡처 후 확정)
const HERO_SLIDES = [
  { grad: GRAD.ski, title: "Where Every Season Thrills", sub: "High1 Resort", cta: "View Packages" },
  { grad: GRAD.snow, title: "Snow, Slopes & Snow Festival", sub: "Winter at High1" },
  { grad: GRAD.night, title: "Nights That Light Up", sub: "Convention Tower" },
];

const CATEGORIES = ["All", "Convention Tower", "Valley Condo", "Hill Condo", "High1 Palace"];
const CHILD_AGE_MAX = 12; // 만 0~12세
const PLACE_NAMES = ["Convention Tower", "High1 Palace", "Hill Condo", "Valley Condo"];
// 개발환경 필터 기준(ROOM TYPE 칩 목록)
const ROOM_TYPES = ["All", "Double", "Twin", "Ondol", "Corner", "King", "Triple", "Family", "Suite", "Deluxe Room", "Pet Room", "Suite Room", "Superior Room"];
function roomTypeOf(r) {
  const b = (r.bed || "").toLowerCase();
  if (b.includes("ondol")) return "Ondol";
  if (b.includes("twin")) return "Twin";
  if (b.includes("king")) return "King";
  if (b.includes("double")) return "Double";
  return "Other";
}

// 숙소상세 Guide/Policy/Location 콘텐츠 (개발환경은 한글이나 외국인 전용 사이트라 영문으로 작성)
const PLACE_GUIDE = {
  usage: [
    "Free cancellation/refund is unavailable while Kangwon Land is not operating (general terms apply).",
    "Package-included items may be substituted per on-site conditions; unused portions are non-refundable.",
    "Check the High1 Resort website in advance for ancillary facility operation.",
    "Reselling a room after purchase may result in strict action, including check-in refusal.",
    "Rooms are not pre-assigned; the specific room is assigned at on-site check-in.",
  ],
  notices: [
    "[Infinity Pool] Convention Tower 7F outdoor infinity pool under construction (2025.11.17–2026.07). Noise possible.",
    "[Condo Renewal] Some condo rooms under renewal; shuttle/facility operations may change during the period.",
  ],
};
const PLACE_POLICY = [
  "Reservation is made under the staying guest's name.",
  "Entry over the standard occupancy is not allowed.",
  "Minors cannot stay alone (19+ only).",
  "No pets in any room.",
  "All rooms are non-smoking · free parking · free Wi-Fi.",
  "Rental items: laptop (paid), blanket, baby bed, iron/board, humidifier, wet-wipe warmer, wired LAN cable.",
  "Extra bedding/persons are paid on-site (card only at front desk).",
];
const LOCATION = { url: "https://www.high1.com/common/fullmap_eng.html", address: "265, High1-gil, Sabuk-eup, Jeongseon-gun, Gangwon-do" };

// 마이페이지 예약 더미데이터 (status: upcoming | past | cancelled)
const DEMO_GUEST = { nationality: "Korea", first: "Test", middle: "", last: "Guest", email: "3664573275@qq.com", code: "+82", phone: "12341234" };
const MY_BOOKINGS = [
  { no: "CODXBK-20260724-00001", placeId: "high1-palace", roomId: "pl-suite", ci: "2026-07-25", co: "2026-07-26", adults: 2, children: 0, status: "upcoming", bookedAt: "07/24/2026, 11:37", product: "Accommodation", guest: DEMO_GUEST },
  { no: "CODXBK-20260723-00003", placeId: "convention-tower", roomId: "cv-deluxe", ci: "2026-07-30", co: "2026-07-31", adults: 2, children: 0, status: "upcoming", bookedAt: "07/23/2026, 15:20", product: "Accommodation", guest: DEMO_GUEST },
  { no: "CODXBK-20260714-00001", placeId: "hill-condo", roomId: "hl-premium", ci: "2026-06-20", co: "2026-06-21", adults: 4, children: 0, status: "past", bookedAt: "07/14/2026, 14:52", product: "Accommodation", guest: DEMO_GUEST },
  { no: "CODXBK-20260710-00002", placeId: "valley-condo", roomId: "vl-fam", ci: "2026-07-12", co: "2026-07-13", adults: 4, children: 0, status: "cancelled", bookedAt: "07/10/2026, 09:10", product: "Accommodation", guest: DEMO_GUEST },
];
function nightsBetween(ci, co) { const a = ymdParts(ci), b = ymdParts(co); return Math.max(1, Math.round((new Date(b.y, b.m - 1, b.d) - new Date(a.y, a.m - 1, a.d)) / 86400000)); }
function refundAmount(bk, r) { const total = r.price * nightsBetween(bk.ci, bk.co); return TODAY <= addDays(bk.ci, -3) ? total : 0; }
const uiProfile = { defaultGuest: false }; // 프로필 데모 상태

/* ---------- 상태 ---------- */
const uiState = {
  loggedIn: false,
  lang: "en",
  heroIdx: 0,
  activeCat: "All",
  search: { type: "Accommodation", ci: "2026-07-24", co: "2026-07-25", adults: 2, children: 0, childAges: [], rooms: 1 },
  calDraft: { ci: "2026-07-24", co: "2026-07-25" },
  calMonth: "2026-07-01",
  filters: { order: "low", places: new Set(["All"]), roomType: "All" },
  pendingBooking: null,
  nav: ["#/"], // 논리 네비게이션 스택(계층 백)
};

/* ---------- 유틸 ---------- */
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
const won = (n) => "₩" + Number(n).toLocaleString("en-US");
const fmtMD = (ymd) => { if (!ymd) return ""; const [y, m, d] = ymd.split("-").map(Number); return new Date(y, m - 1, d).toLocaleString("en-US", { month: "short", day: "numeric" }); };
const fmtFull = (ymd) => { if (!ymd) return ""; const [y, m, d] = ymd.split("-").map(Number); return new Date(y, m - 1, d).toLocaleString("en-US", { month: "short", day: "numeric", year: "numeric" }); };
// 무료취소 기한 = 체크인 −3일. 이후 환불불가.
function freeCancelDeadline() { return addDays(uiState.search.ci, -3); }
function cancelText() { return `Free cancellation until ${fmtFull(freeCancelDeadline())} · Non-refundable afterward.`; }
// 박수 = 체크아웃 − 체크인 (최소 1박)
function nightsCount() {
  const { ci, co } = uiState.search;
  if (!ci || !co) return 1;
  const a = ymdParts(ci), b = ymdParts(co);
  const ms = new Date(b.y, b.m - 1, b.d) - new Date(a.y, a.m - 1, a.d);
  return Math.max(1, Math.round(ms / 86400000));
}
function ymdParts(ymd) { const [y, m, d] = ymd.split("-").map(Number); return { y, m, d }; }
function addMonths(ymd, delta) { const { y, m } = ymdParts(ymd); const dt = new Date(y, m - 1 + delta, 1); return `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, "0")}-01`; }
function addDays(ymd, n) { const { y, m, d } = ymdParts(ymd); const dt = new Date(y, m - 1, d + n); return `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, "0")}-${String(dt.getDate()).padStart(2, "0")}`; }
const TODAY = "2026-07-24";
function guestSummary() {
  const s = uiState.search;
  const parts = [`${s.adults} adult${s.adults > 1 ? "s" : ""}`];
  if (s.children > 0) parts.push(`${s.children} child${s.children > 1 ? "ren" : ""}`);
  return parts.join(" · ");
}

/* ========================================================
   네비게이션 (계층 백 스택)
   - go: 새 페이지 진입(push) / replaceNavTop: 같은 화면 내 교체(탭 전환)
   - navBack: 스택 pop → 직전 페이지로 즉시 이동
   ======================================================== */
function pushNav(h) { const n = uiState.nav; if (n[n.length - 1] !== h) n.push(h); }
function replaceNavTop(h) { const n = uiState.nav; if (n.length) n[n.length - 1] = h; else n.push(h); }
function resetNav() { uiState.nav = ["#/"]; }
function go(h) {
  if (h === "#/") resetNav(); else pushNav(h);
  if (location.hash === h) router(); else location.hash = h;
}
function goReplace(h) { replaceNavTop(h); if (location.hash === h) router(); else location.hash = h; }
function navBack() {
  const n = uiState.nav;
  if (n.length > 1) n.pop();
  const prev = n[n.length - 1] || "#/";
  if (location.hash === prev) router(); else location.hash = prev;
}
// 숙소상세 스크롤 스파이(섹션 위치로 네비 탭 활성화)
let pdScrollHandler = null;
function clearPdScroll() { if (pdScrollHandler) { window.removeEventListener("scroll", pdScrollHandler); pdScrollHandler = null; } }
// 모달/시트 열림 시 배경 스크롤 잠금 (position:fixed 방식 — 터치/휠까지 차단, 위치 보존)
let _lockY = 0;
function lockBg() {
  if (document.body.style.position === "fixed") return; // 이미 잠김
  _lockY = window.scrollY || document.documentElement.scrollTop || 0;
  document.body.style.position = "fixed";
  document.body.style.top = `-${_lockY}px`;
  document.body.style.left = "0"; document.body.style.right = "0"; document.body.style.width = "100%";
  document.body.classList.add("scroll-lock");
}
function unlockBg() {
  if (document.body.style.position !== "fixed") return; // 잠기지 않음
  document.body.style.position = ""; document.body.style.top = ""; document.body.style.left = ""; document.body.style.right = ""; document.body.style.width = "";
  document.body.classList.remove("scroll-lock");
  window.scrollTo(0, _lockY);
}

/* ========================================================
   라우터
   ======================================================== */
function router() {
  const hash = location.hash || "#/";
  const app = $("#app");
  closeDrawer(); closeSearchSheet(); closeFilterSheet(); closeRoomDetail(); closePlaceModal(); clearPdScroll();
  if (typeof closeTicketSheet === "function") closeTicketSheet();
  if (typeof closeTicketCartSheet === "function") closeTicketCartSheet();
  if (typeof closeMbTicketCancel === "function") closeMbTicketCancel();
  if (hash.startsWith("#/ticket-order/")) renderMyTicketOrder(app, decodeURIComponent(hash.split("/")[2] || ""));
  else if (hash === "#/ticket/search") renderTicketSearch(app);
  else if (hash.startsWith("#/ticket/bridge/")) renderTicketBridge(app, decodeURIComponent(hash.split("/")[3] || ""));
  else if (hash === "#/ticket/checkout") renderTicketCheckout(app);
  else if (hash === "#/ticket/done") renderTicketDone(app);
  else if (hash.startsWith("#/place/")) renderPlaceDetail(app, hash.split("/")[2]);
  else if (hash === "#/search") renderSearchResults(app);
  else if (hash === "#/signin") renderSignin(app);
  else if (hash.startsWith("#/booking/")) renderBooking(app, hash.split("/")[2], hash.split("/")[3]);
  else if (hash.startsWith("#/payment/")) renderPayment(app, hash.split("/")[2], hash.split("/")[3]);
  else if (hash.startsWith("#/complete/")) renderComplete(app, hash.split("/")[2], hash.split("/")[3]);
  else if (hash === "#/mybookings") renderMyBookings(app);
  else if (hash.startsWith("#/mybooking/")) renderMyBookingDetail(app, decodeURIComponent(hash.split("/")[2] || ""));
  else if (hash.startsWith("#/mycancel/")) renderMyCancel(app, decodeURIComponent(hash.split("/")[2] || ""));
  else if (hash.startsWith("#/cancelcomplete/")) renderCancelComplete(app, decodeURIComponent(hash.split("/")[2] || ""));
  else if (hash === "#/profile") renderProfile(app);
  else if (hash === "#/loading") app.innerHTML = `<div class="loading"><div class="spinner"></div></div>`;
  else renderHome(app);
  // 푸터: 메인·검색결과·숙소상세에서만 노출
  const showFooter = hash === "#/" || hash === "#/search" || hash.startsWith("#/place/");
  const mf = document.querySelector(".mfoot");
  if (mf) mf.style.display = showFooter ? "" : "none";
  window.scrollTo(0, 0);
}

/* ========================================================
   홈
   ======================================================== */
function renderHome(app) {
  const s = uiState.search;
  const heroSlides = HERO_SLIDES.map((h) => `
    <div class="hero-slide">
      <div class="hero-ph" style="background:${h.grad}"></div>
      <div class="hero-cap"><h2>${h.title}</h2><p>${h.sub}</p>${h.cta ? `<a class="hero-cta" href="javascript:void(0)">${h.cta} ›</a>` : ""}</div>
    </div>`).join("");
  const dots = HERO_SLIDES.map((_, i) => `<i class="${i === uiState.heroIdx ? "on" : ""}"></i>`).join("");
  const cats = CATEGORIES.map((c) => `<button class="cat-tab ${c === uiState.activeCat ? "on" : ""}" data-cat="${c}">${c}</button>`).join("");

  const filtered = uiState.activeCat === "All" ? PLACES : PLACES.filter((p) => p.name === uiState.activeCat);
  const topPlace = filtered[0] || PLACES[0];
  const topCards = topPlace.rooms.map((r) => roomCardHtml(topPlace, r)).join("");
  const second = PLACES.find((p) => p.id === "hill-condo");
  const secondCards = second.rooms.map((r) => roomCardHtml(second, r)).join("");

  app.innerHTML = `
    <!-- 히어로 (좌우 스와이프, 화살표 없음) -->
    <div class="hero">
      <div class="hero-imgs" id="heroImgs">${heroSlides}</div>
      <div class="hero-dots">${dots}</div>
    </div>

    <!-- 검색영역 (컴팩트 요약 카드, 좌측 픽토그램) -->
    ${searchMiniHtml()}

    <!-- 추천 섹션 1 -->
    <section class="section">
      <div class="section-head">
        <div class="st-wrap">
          <h3>Top Hotel Room Recommendations</h3>
          <p class="sub">Recommended Rooms at High1's Top Hotels</p>
        </div>
        <a class="view-all" href="#/place/${topPlace.id}">view all ›</a>
      </div>
      <div class="scroll-hint"><div class="cat-tabs">${cats}</div></div>
      <div class="card-scroller">${topCards}</div>
    </section>

    <!-- 추천 섹션 2 -->
    <section class="section">
      <div class="section-head">
        <div class="st-wrap">
          <h3>Top Recommended Rooms at ${second.name}</h3>
          <p class="sub">Recommend some popular rooms at ${second.name}.</p>
        </div>
        <a class="view-all" href="#/place/${second.id}">View All ›</a>
      </div>
      <div class="card-scroller">${secondCards}</div>
    </section>
  `;

  // 히어로 스와이프 → 점 동기화
  const hi = $("#heroImgs");
  if (hi) hi.addEventListener("scroll", () => {
    const idx = Math.round(hi.scrollLeft / hi.clientWidth);
    $$(".hero-dots i").forEach((el, k) => el.classList.toggle("on", k === idx));
  });
  $$(".cat-tab").forEach((b) => b.onclick = () => { uiState.activeCat = b.dataset.cat; renderHome(app); });
  wireSearchMini(app);
  wireRoomCards(app);
}

function syncHero() {
  const t = $("#heroTrack");
  if (t) t.style.transform = `translateX(-${uiState.heroIdx * 100}%)`;
  $$(".hero-dots i").forEach((el, i) => el.classList.toggle("on", i === uiState.heroIdx));
}

// 검색 요약 카드 (홈·브릿지 Rooms 공용)
function searchMiniHtml() {
  const s = uiState.search;
  const isTicket = s.type === "Ticket";
  const lines = isTicket
    ? `<div class="sm-line"><span class="sm-ic">${ICO.cal}</span><span>Usage date ${uiState.ticketUseDate || todayKstYmd()}</span></div>
       <div class="sm-line"><span class="sm-ic">🎫</span><span>Open tickets · usable on the selected date</span></div>`
    : `<div class="sm-line"><span class="sm-ic">${ICO.cal}</span><span>Check-in ${fmtMD(s.ci)} / Check-out ${fmtMD(s.co)}</span></div>
       <div class="sm-line"><span class="sm-ic">${ICO.users}</span><span>${s.adults} adults / ${s.children} children / ${s.rooms} room</span></div>`;
  return `
    <div class="search-mini js-open-search" role="button" tabindex="0">
      <div class="sm-body">
        <div class="sm-type">${s.type}</div>
        ${lines}
      </div>
      <button class="sm-btn" aria-label="Search">${ICO.search}</button>
    </div>`;
}
function wireSearchMini(scope) { $$(".js-open-search", scope || document).forEach((el) => el.addEventListener("click", openSearchSheet)); }

function roomCardHtml(place, r) {
  let badge = "";
  if (r.soldout) badge = `<span class="rc-badge soldout">SOLD OUT</span>`;
  else if (r.left != null) badge = `<span class="rc-badge left">Only ${r.left} room${r.left > 1 ? "s" : ""} left</span>`;
  const avail = r.soldout
    ? `<div class="rc-avail"><div class="lbl">AVAILABILITY</div><div class="val">Sold Out</div></div>`
    : `<div class="rc-avail"><div class="lbl">FROM (PER NIGHT)</div><div class="val price">${won(r.price)}<small> /night</small></div></div>`;
  const cta = r.soldout ? `<button class="rc-cta">Select Different Date</button>` : `<button class="rc-cta book">Select Room</button>`;
  return `
    <article class="room-card" data-place="${place.id}">
      <div class="rc-img" style="background:${r.img}">${badge}</div>
      <div class="rc-body">
        <span class="rc-place">${place.name}</span>
        <h4 class="rc-name">${r.name}</h4>
        <div class="rc-meta">
          <div class="row"><span class="ic">🛏</span><span>${r.bed}</span></div>
          <div class="row"><span class="ic">▦</span><span>${r.size}m²</span></div>
          <div class="row"><span class="ic">👤</span><span>${r.base} Base / ${r.max} Max</span></div>
        </div>
        ${avail}${cta}
      </div>
    </article>`;
}
function wireRoomCards(scope) {
  $$(".room-card", scope).forEach((card) => card.addEventListener("click", () => go(`#/place/${card.dataset.place}`)));
  $$(".view-all", scope).forEach((a) => a.addEventListener("click", (e) => { e.preventDefault(); go(a.getAttribute("href")); }));
}

/* ========================================================
   검색 결과 목록
   ======================================================== */
// 필터·정렬 적용된 객실 목록(평면) 반환
function filteredRooms() {
  const f = uiState.filters;
  let rows = [];
  PLACES.forEach((p) => p.rooms.forEach((r) => rows.push({ place: p, room: r })));
  // PLACE 필터
  if (!f.places.has("All") && f.places.size > 0) rows = rows.filter((x) => f.places.has(x.place.name));
  // ROOM TYPE 필터
  if (f.roomType !== "All") rows = rows.filter((x) => roomTypeOf(x.room) === f.roomType);
  // 정렬: 예약가능 우선 → 가격(order)
  rows.sort((a, b) => {
    const soA = a.room.soldout ? 1 : 0, soB = b.room.soldout ? 1 : 0;
    if (soA !== soB) return soA - soB;
    return f.order === "low" ? a.room.price - b.room.price : b.room.price - a.room.price;
  });
  return rows;
}

function renderSearchResults(app) {
  const s = uiState.search;
  const rows = filteredRooms();
  const cards = rows.map((x) => resCardHtml(x.place, x.room)).join("");

  app.innerHTML = `
    <div class="subhead">
      <button class="back-btn" id="resBack" aria-label="Back">‹</button>
      <span class="subtitle">Search Result</span>
    </div>
    <div class="res-topbar">
      <span class="res-top-ico">${ICO.search}</span>
      <div class="res-top-txt">
        <div class="l1">${fmtMD(s.ci)} – ${fmtMD(s.co)}</div>
        <div class="l2">${s.adults} adults · ${s.children} children · ${s.rooms} room</div>
      </div>
      <button class="res-edit-btn" id="resEdit">Edit</button>
    </div>
    <div class="res-controls">
      <span class="cnt">${rows.length} rooms available</span>
      <button class="filters-btn" id="btnFilters">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M3 5h18M6 12h12M10 19h4"/></svg>
        Filters
      </button>
    </div>
    <div class="res-list">${cards || `<div class="stub"><p>No rooms match your filters.</p></div>`}</div>
  `;

  $("#resBack").onclick = navBack;
  $("#resEdit").onclick = openSearchSheet;
  $("#btnFilters").onclick = openFilterSheet;
  wireResultCards();
}

// 결과/브릿지 공용 카드 이벤트 배선
function wireResultCards(scope) {
  const root = scope || document;
  $$(".res-card [data-info]", root).forEach((btn) => btn.addEventListener("click", (e) => {
    e.stopPropagation(); openRoomDetail(btn.dataset.place, btn.dataset.room);
  }));
  $$(".res-card [data-select]", root).forEach((el) => el.addEventListener("click", (e) => {
    e.stopPropagation(); selectRoom(el.dataset.place, el.dataset.room);
  }));
  // 이미지 스와이프 → 점 동기화
  $$(".rc-imgwrap", root).forEach((wrap) => {
    const strip = wrap.querySelector(".rc-imgs");
    const dts = wrap.querySelectorAll(".rc-dots i");
    if (dts.length < 2) return;
    strip.addEventListener("scroll", () => {
      const i = Math.round(strip.scrollLeft / strip.clientWidth);
      dts.forEach((d, k) => d.classList.toggle("on", k === i));
    });
  });
}

function resCardHtml(place, r) {
  const imgs = r.imgs || [r.img];
  const slides = imgs.map((g) => `<div class="rc-img-slide" style="background:${g}"></div>`).join("");
  const dots = imgs.length > 1 ? `<div class="rc-dots">${imgs.map((_, i) => `<i class="${i === 0 ? "on" : ""}"></i>`).join("")}</div>` : "";
  let badge = "";
  if (r.soldout) badge = `<span class="rc-badge soldout">SOLD OUT</span>`;
  else if (r.left != null) badge = `<span class="rc-badge left">Only ${r.left} room${r.left > 1 ? "s" : ""} left</span>`;
  // 취소정보 → 대표시설(최대 1줄: 3개 + 나머지 +N)
  const cancel = r.soldout ? "" : `<div class="res-cancel"><span class="ic">ⓘ</span><span>${cancelText()}</span></div>`;
  const fl = r.facilities || [];
  let facils = "";
  if (fl.length) {
    const shown = fl.slice(0, 3), rest = fl.length - shown.length;
    facils = `<div class="rc-facils">${shown.map((f) => `<span class="rc-facil">${f}</span>`).join("")}${rest > 0 ? `<span class="rc-facil more">+${rest}</span>` : ""}</div>`;
  }
  // 가격 = 1박 요금 × 박수 (총액). 가격영역 전체 클릭 = 예약(로그인 게이트).
  // Sold out은 하단 바 제거 — 이미 상단 배지(SOLD OUT)로 표현.
  const nights = nightsCount();
  const total = r.price * nights;
  const priceBar = r.soldout ? "" : `<div class="price-bar" data-select data-place="${place.id}" data-room="${r.id}">
         <span class="pb-price">${won(total)}<small> / ${nights} night${nights > 1 ? "s" : ""}</small></span>
         <span class="pb-book">Book →</span>
       </div>`;
  return `
    <article class="res-card">
      <div class="rc-imgwrap"><div class="rc-imgs">${slides}</div>${badge}${dots}</div>
      <div class="res-body">
        <div class="rc-top">
          <span class="rc-place">${place.name}</span>
          <button class="rc-info-link" data-info data-place="${place.id}" data-room="${r.id}">Details ›</button>
        </div>
        <div class="res-type">${r.type}</div>
        <h4 class="res-name">${r.name}</h4>
        <div class="rc-meta">
          <div class="row"><span class="ic">🛏</span><span>${r.bed}</span></div>
          <div class="row"><span class="ic">▦</span><span>${r.size}m²</span></div>
          <div class="row"><span class="ic">👤</span><span>Basic ${r.base} / Max ${r.max} Guests</span></div>
        </div>
        ${cancel}
        ${facils}
        ${priceBar}
      </div>
    </article>`;
}

/* ---------- 필터 바텀시트 ---------- */
function openFilterSheet() {
  renderFilterBody();
  $("#filterScope").classList.add("open");
  $("#filterSheet").setAttribute("aria-hidden", "false");
  lockBg();
}
function closeFilterSheet() { $("#filterScope").classList.remove("open"); $("#filterSheet").setAttribute("aria-hidden", "true"); unlockBg(); }
function renderFilterBody() {
  const f = uiState.filters;
  const orderRow = (v, label) => `<div class="opt-row ${f.order === v ? "on" : ""}" data-order="${v}"><span class="dot"></span><span>${label}</span></div>`;
  const placeRow = (name) => `<div class="opt-row ${f.places.has(name) ? "on" : ""}" data-place="${name}"><span class="box">${f.places.has(name) ? "✓" : ""}</span><span>${name}</span></div>`;
  const chips = ROOM_TYPES.map((t) => `<button class="type-chip ${f.roomType === t ? "on" : ""}" data-rt="${t}">${t}</button>`).join("");
  $("#filterBody").innerHTML = `
    <div class="sheet-head">
      <div><div class="sh-eyebrow">Filters</div><div class="sh-title">Refine stays</div></div>
      <button class="sheet-close" id="filterClose">✕</button>
    </div>
    <div class="filter-sec">
      <div class="f-title">Order</div>
      ${orderRow("low", "Low cost")}${orderRow("high", "High cost")}
    </div>
    <div class="filter-sec">
      <div class="f-title">Place <span class="map">Map view →</span></div>
      ${placeRow("All")}${PLACE_NAMES.map(placeRow).join("")}
    </div>
    <div class="filter-sec">
      <div class="f-title">Room type</div>
      <div class="type-chips">${chips}</div>
    </div>
    <div class="filter-actions">
      <button class="filter-reset" id="filterReset">Reset filters</button>
      <button class="filter-apply" id="filterApply">Show ${filteredRooms().length} rooms</button>
    </div>`;

  const refresh = () => { renderFilterBody(); };
  $("#filterClose").onclick = closeFilterSheet;
  $$("#filterBody [data-order]").forEach((el) => el.onclick = () => { f.order = el.dataset.order; refresh(); });
  $$("#filterBody [data-place]").forEach((el) => el.onclick = () => {
    const name = el.dataset.place;
    if (name === "All") { f.places = new Set(["All"]); }
    else {
      f.places.delete("All");
      if (f.places.has(name)) f.places.delete(name); else f.places.add(name);
      if (f.places.size === 0) f.places = new Set(["All"]);
    }
    refresh();
  });
  $$("#filterBody [data-rt]").forEach((el) => el.onclick = () => { f.roomType = el.dataset.rt; refresh(); });
  $("#filterReset").onclick = () => { uiState.filters = { order: "low", places: new Set(["All"]), roomType: "All" }; refresh(); };
  $("#filterApply").onclick = () => { closeFilterSheet(); go("#/search"); };
}

/* ---------- 객실상세 바텀시트 ---------- */
function openRoomDetail(placeId, roomId) {
  const place = PLACES.find((p) => p.id === placeId);
  const r = place.rooms.find((x) => x.id === roomId);
  uiState._rmdTab = "Policy";
  renderRoomDetail(place, r);
  $("#roomScope").classList.add("open");
  $("#roomSheet").setAttribute("aria-hidden", "false");
  lockBg();
}
function closeRoomDetail() { $("#roomScope").classList.remove("open"); $("#roomSheet").setAttribute("aria-hidden", "true"); unlockBg(); }
function renderRoomDetail(place, r) {
  const tab = uiState._rmdTab;
  const facilList = (r.facilities && r.facilities.length) ? r.facilities : place.facilities.slice(0, 6);
  const panels = {
    Policy: `<h5>Policy</h5><p>No specific policy.</p><hr/><h5>Cancellation policy</h5><p>${cancelText()}</p>`,
    Guide: `<h5>Guide</h5><p>Check-in ${place.checkin} / Check-out ${place.checkout}. Please present a valid ID matching the reservation name at check-in.</p>`,
    Facilities: `<h5>Facilities</h5><p>${facilList.join(", ")}.</p>`,
  };
  // sold out이면 버튼 미노출, 아니면 하단 고정 footer로 Select Room
  const footer = r.soldout ? "" : `<div class="rmd-foot"><button class="rmd-select" id="rmdSelect">Select Room</button></div>`;
  $("#roomBody").innerHTML = `
    <div class="sheet-head">
      <div><div class="sh-eyebrow" style="color:var(--purple)">${place.name}</div><div class="sh-title">${r.name}</div></div>
      <button class="sheet-close" id="rmdClose">✕</button>
    </div>
    <div class="rmd-sec-title">Description</div>
    <div class="rmd-desc">One-room layout with resort-class service at an affordable price. ${place.desc}</div>
    <div class="rmd-sec-title">Information</div>
    <div class="rmd-info-row"><span class="k">Type</span><span class="v">${r.type}</span></div>
    <div class="rmd-info-row"><span class="k">Occupancy</span><span class="v">Basic ${r.base} Guests / Max ${r.max} Guests</span></div>
    <div class="rmd-info-row"><span class="k">Bed type</span><span class="v">${r.bed}</span></div>
    <div class="rmd-info-row"><span class="k">Size</span><span class="v">${r.size}m²</span></div>
    <div class="rmd-tabs">
      ${["Policy", "Guide", "Facilities"].map((t) => `<button class="rmd-tab ${t === tab ? "on" : ""}" data-tab="${t}">${t}</button>`).join("")}
    </div>
    <div class="rmd-panel">${panels[tab]}</div>
    ${footer}`;
  $("#rmdClose").onclick = closeRoomDetail;
  $$("#roomBody .rmd-tab").forEach((b) => b.onclick = () => { uiState._rmdTab = b.dataset.tab; renderRoomDetail(place, r); });
  const sel = $("#rmdSelect");
  if (sel) sel.onclick = () => { closeRoomDetail(); selectRoom(place.id, r.id); };
}

/* ---------- Select Room 로그인 게이트 ---------- */
function selectRoom(placeId, roomId) {
  if (uiState.loggedIn) { go(`#/booking/${placeId}/${roomId}`); }
  else { uiState.pendingBooking = { placeId, roomId }; go("#/signin"); }
}

/* ---------- 로그인 화면(스텁) · 예약결제(스텁) ---------- */
function renderSignin(app) {
  app.innerHTML = `
    <div class="subhead"><button class="back-btn" id="siBack" aria-label="Back">‹</button><span class="subtitle">Sign in</span></div>
    <div class="stub">
      <div class="ic">🔒</div>
      <h3>Sign in required</h3>
      <p>You need to sign in to continue booking.<br/>(실제 로그인/가입 화면은 B단계에서 제작)</p>
      <button class="stub-btn" id="siDemo">Demo Sign in &amp; Continue</button>
    </div>`;
  $("#siBack").onclick = navBack;
  $("#siDemo").onclick = () => {
    uiState.loggedIn = true; applyAuthUI();
    const pb = uiState.pendingBooking;
    if (uiState.pendingTicketCheckout) { uiState.pendingTicketCheckout = false; goReplace("#/ticket/checkout"); } // 티켓 예약 게이트 통과
    else if (pb) { uiState.pendingBooking = null; goReplace(`#/booking/${pb.placeId}/${pb.roomId}`); } // signin을 예약결제로 교체
    else go("#/");
  };
}
/* ---------- 예약/결제/완료 공통 ---------- */
function findRoom(pid, rid) { const p = PLACES.find((x) => x.id === pid); const r = p ? p.rooms.find((x) => x.id === rid) : null; return { place: p, room: r }; }
function bkStepsHtml(step) {
  return `<div class="bk-steps">
    <span class="st ${step === 1 ? "on" : ""}"><span class="n">1</span>Detail</span>
    <span class="arrow">→</span>
    <span class="st ${step === 2 ? "on" : ""}"><span class="n">2</span>Payment</span>
  </div>`;
}
// 숙소정보
function bkRoomCard(place, r) {
  const img = (r.imgs && r.imgs[0]) || r.img;
  return `<div class="bk-card bk-room">
    <div class="bk-room-img" style="background:${img}"></div>
    <div class="bk-room-info"><span class="rc-place">${place.name}</span><div class="res-type">${r.type}</div><h4 class="res-name">${r.name}</h4>
      <div class="bk-room-meta"><b>Bed:</b> ${r.bed}<br/><b>Guests:</b> Basic ${r.base} / Max ${r.max}</div></div>
  </div>`;
}
// 예약정보
function bkInfoCard(place) {
  return `<div class="bk-card"><h4 class="bk-h">Booking info</h4>
    <div class="bk-line"><span class="ic">📅</span><span>${fmtFull(uiState.search.ci)} – ${fmtFull(uiState.search.co)}</span></div>
    <div class="bk-line"><span class="ic">🕐</span><span>Check-in after ${place.checkin} / Check-out before ${place.checkout}</span></div>
    <div class="bk-line"><span class="ic">🛏</span><span>1 room</span></div>
    <div class="bk-line"><span class="ic">👥</span><span>${guestSummary()}</span></div>
  </div>`;
}
// 가격정보
function bkPriceCard(r) {
  const nights = nightsCount(), total = r.price * nights;
  return `<div class="bk-card"><h4 class="bk-h">Price Details</h4>
    <div class="bk-price-row"><span>1 room x ${nights} night${nights > 1 ? "s" : ""}</span><span>${won(total)}</span></div>
    <div class="bk-price-row"><span>VAT</span><span>Included</span></div>
    <div class="bk-total"><span>TOTAL</span><span>${won(total)}</span></div>
  </div>`;
}
// 취소정보
function bkCancelCard() { return `<div class="bk-card"><h4 class="bk-h">Cancellation policy</h4><p class="bk-cxl">${cancelText()}</p></div>`; }

/* ---------- Step 1: 예약정보입력 ---------- */
function renderBooking(app, pid, rid) {
  const { place, room: r } = findRoom(pid, rid);
  if (!place || !r) { location.hash = "#/search"; return; }
  const NATIONS = ["Select", "Korea", "China", "Japan", "United States", "Other"];
  const CODES = ["+82", "+86", "+81", "+1", "Other"];
  app.innerHTML = `
    <div class="subhead"><button class="back-btn" id="bkBack" aria-label="Back">‹</button><span class="subtitle">Reservation</span></div>
    ${bkStepsHtml(1)}
    <div class="bk-wrap">
      ${bkRoomCard(place, r)}
      ${bkInfoCard(place)}
      <h2 class="bk-title">Who's staying?</h2>
      <p class="bk-sub">Guest names must match the ID used at check-in.</p>
      <div class="field"><label>Nationality <span class="req">*</span></label><select id="f_nat">${NATIONS.map((n) => `<option>${n}</option>`).join("")}</select></div>
      <div class="field"><label>First name <span class="req">*</span></label><input id="f_first" placeholder="English letters only" /></div>
      <div class="field"><label>Middle name</label><input id="f_mid" placeholder="Optional" /></div>
      <div class="field"><label>Last name <span class="req">*</span></label><input id="f_last" placeholder="English letters only" /></div>
      <div class="field"><label>Email <span class="req">*</span></label><input id="f_email" placeholder="Email for confirmation" /><div class="hint">Booking confirmation will be sent to this email.</div></div>
      <div class="field"><label>Phone number <span class="req">*</span></label>
        <div class="field-row"><select class="col-code" id="f_code">${CODES.map((c) => `<option>${c}</option>`).join("")}</select><input class="col" id="f_phone" placeholder="Phone number" /></div>
      </div>
      ${bkPriceCard(r)}
      ${bkCancelCard()}
      <label class="agree"><input type="checkbox" id="f_agree" /><span>I confirm the information is accurate and agree to the <a href="javascript:void(0)">Terms of Service</a>, <a href="javascript:void(0)">Privacy Policy</a>, and <a href="javascript:void(0)">Cancellation &amp; Refund policy</a>.</span></label>
      <button class="bk-cta" id="bkNext">Final step →</button>
    </div>`;
  $("#bkBack").onclick = navBack;
  $("#bkNext").onclick = () => {
    if (!$("#f_agree").checked) { $("#f_agree").focus(); alert("Please agree to the terms to continue."); return; }
    go(`#/payment/${pid}/${rid}`);
  };
}

/* ---------- Step 2: 결제정보입력 (모바일 세로 1열) ---------- */
function renderPayment(app, pid, rid) {
  const { place, room: r } = findRoom(pid, rid);
  if (!place || !r) { location.hash = "#/search"; return; }
  const total = r.price * nightsCount();
  app.innerHTML = `
    <div class="subhead"><button class="back-btn" id="pyBack" aria-label="Back">‹</button><span class="subtitle">Reservation</span></div>
    ${bkStepsHtml(2)}
    <div class="bk-wrap">
      ${bkRoomCard(place, r)}
      ${bkInfoCard(place)}
      <h2 class="bk-title">Payment info</h2>
      <div class="pay-timer">Please complete payment within 09:59</div>
      <div class="field"><label>Card number <span class="req">*</span></label><input id="p_card" inputmode="numeric" placeholder="1234 5678 9012 3456" /></div>
      <div class="field-row">
        <div class="field col"><label>Expiry <span class="req">*</span></label><input id="p_exp" placeholder="MM / YY" /></div>
        <div class="field col"><label>CVC <span class="req">*</span></label><input id="p_cvc" inputmode="numeric" placeholder="CVC" /></div>
      </div>
      <div class="field"><label>Cardholder name <span class="req">*</span></label><input id="p_name" placeholder="Name on card" /></div>
      ${bkPriceCard(r)}
      ${bkCancelCard()}
      <label class="agree"><input type="checkbox" id="p_agree" /><span>I authorize payment of the total amount shown below and understand my booking is subject to the <a href="javascript:void(0)">transaction notice</a>.</span></label>
      <button class="bk-cta" id="pyPay">Pay ${won(total)} →</button>
    </div>`;
  $("#pyBack").onclick = navBack;
  $("#pyPay").onclick = () => {
    if (!$("#p_agree").checked) { alert("Please authorize the payment to continue."); return; }
    $("#app").innerHTML = `<div class="loading"><div class="spinner"></div></div>`; // 결제 처리(목업)
    setTimeout(() => goReplace(`#/complete/${pid}/${rid}`), 1000); // 결제→완료 교체(백 시 결제 재진입 방지)
  };
}

/* ---------- 예약완료 ---------- */
function renderComplete(app, pid, rid) {
  const { place, room: r } = findRoom(pid, rid);
  if (!place || !r) { location.hash = "#/"; return; }
  const bkno = "BK-20260724-00001"; // 데모 예약번호 (형식: BK-YYYYMMDD-NNNNN)
  app.innerHTML = `
    <div class="bk-wrap" style="padding-bottom:150px">
      <div class="done-badge">● CONFIRMED</div>
      <h2 class="done-title">Your booking is confirmed.</h2>
      <p class="done-sub">Your reservation is confirmed for the dates and conditions shown below.</p>
      <div class="done-num"><div class="k">BOOKING NUMBER</div><div class="v">${bkno}</div></div>
      ${bkCancelCard()}
      ${bkRoomCard(place, r)}
      ${bkInfoCard(place)}
      ${bkPriceCard(r)}
    </div>
    <div class="done-foot">
      <button class="btn-solid" id="dnBookings">Go to Booking list →</button>
      <button class="btn-line" id="dnMain">Go to Main →</button>
    </div>`;
  $("#dnMain").onclick = () => go("#/");
  $("#dnBookings").onclick = () => go("#/mybookings");
}

/* ========================================================
   마이페이지 — 예약내역 / 상세 / 취소 / 프로필
   ======================================================== */
const uiMB = { product: "All", tab: "upcoming" };
const PRODUCTS = ["All", "Accommodation", "Ticket", "Package", "Transportation"];
const MB_TABS = [{ k: "upcoming", label: "Upcoming" }, { k: "past", label: "Past" }, { k: "cancelled", label: "Cancelled" }];

/* 숙소 예약 목록 — 시드(high1_reservations_v1) 공유. 없으면 하드코딩 폴백. 정규화 아이템으로 반환 */
const MB_ACC_GRAD = [GRAD.night, GRAD.palace, GRAD.snow, GRAD.room1, GRAD.condo, GRAD.room2];
function mbAccList() {
  const today = todayKstYmd();
  const seed = loadReservationsM();
  if (seed.length) {
    return seed.map((r, i) => {
      const rooms = (r.pax && r.pax.rooms) || [];
      const adults = rooms.reduce((s, x) => s + (x.adults || 0), 0) || 2;
      const children = rooms.reduce((s, x) => s + (x.children || 0), 0);
      const status = r.status === "CANCELLED" ? "cancelled" : ((r.checkout || "") >= today ? "upcoming" : "past");
      const g = r.guest || {};
      return { seed: true, id: r.code, no: r.code, placeName: r.place_name || "-", roomType: r.product_name || "", roomName: r.room_name || "", bed: "", img: MB_ACC_GRAD[i % MB_ACC_GRAD.length],
        ci: r.checkin, co: r.checkout, adults, children, roomCount: rooms.length || 1, status, bookedAt: (r.created_at || "").slice(0, 10),
        guest: { nationality: g.nationality || "-", first: g.firstName || "", middle: "", last: g.lastName || "", email: r.member_email || "", code: "", phone: "" },
        total: r.amount_sell || 0, refund: r.refund_amount, checkin: "15:00", checkout: "11:00" };
    }).sort((a, b) => String(b.no).localeCompare(String(a.no)));
  }
  return MY_BOOKINGS.map((bk, i) => {
    const { place, room: r } = findRoom(bk.placeId, bk.roomId);
    const nights = nightsBetween(bk.ci, bk.co);
    return { seed: false, idx: i, id: bk.no, no: bk.no, placeName: place.name, roomType: r.type, roomName: r.name, bed: r.bed, img: (r.imgs && r.imgs[0]) || r.img,
      ci: bk.ci, co: bk.co, adults: bk.adults, children: bk.children, roomCount: 1, status: bk.status, bookedAt: bk.bookedAt, guest: bk.guest,
      total: r.price * nights, refund: refundAmount(bk, r), checkin: place.checkin, checkout: place.checkout };
  });
}
function mbAccById(id) { return mbAccList().find((x) => x.id === id); }
function mbAccCardHtml(a) {
  return `<div class="mb-card">
    <div class="mb-crow">${mbStatusBadge(a.status)}<a class="mb-details" data-view="${escapeHtml(a.id)}" href="javascript:void(0)">Details ›</a></div>
    <div class="mb-bno">Booking no. <b>${escapeHtml(a.no)}</b> · ${escapeHtml(a.bookedAt)}</div>
    <div class="mb-main">
      <div class="mb-thumb" style="background:${a.img}"></div>
      <div class="mb-minfo">
        <span class="rc-place">${escapeHtml(a.placeName)}</span>
        ${a.roomType ? `<div class="res-type">${escapeHtml(a.roomType)}</div>` : ""}
        <h4 class="res-name">${escapeHtml(a.roomName)}</h4>
      </div>
    </div>
    <div class="mb-stay">
      <div class="ln"><span class="ic">📅</span><span>${fmtFull(a.ci)} – ${fmtFull(a.co)}</span></div>
      <div class="ln"><span class="ic">👥</span><span>${a.adults} guests · ${a.roomCount} room${a.roomCount > 1 ? "s" : ""}</span></div>
    </div>
  </div>`;
}

function renderMyBookings(app) {
  const showAcc = uiMB.product === "All" || uiMB.product === "Accommodation";
  const showTk = uiMB.product === "All" || uiMB.product === "Ticket";
  const accRows = showAcc ? mbAccList().filter((x) => x.status === uiMB.tab).map((a) => ({ kind: "acc", a })) : [];
  const tkRows = showTk ? mbTicketItems().filter((x) => x.tab === uiMB.tab) : [];
  const rows = accRows.concat(tkRows);
  const opts = PRODUCTS.map((p) => `<option ${p === uiMB.product ? "selected" : ""}>${p}</option>`).join("");
  const tabs = MB_TABS.map((t) => `<button class="mb-tab ${t.k === uiMB.tab ? "on" : ""}" data-tab="${t.k}">${t.label}</button>`).join("");
  const cards = rows.length ? rows.map((x) => x.kind === "acc" ? mbAccCardHtml(x.a) : mbTicketCardHtml(x)).join("") : `<div class="mb-empty">No bookings in this category.</div>`;
  app.innerHTML = `
    <div class="subhead"><button class="back-btn" id="mbBack" aria-label="Back">‹</button><span class="subtitle">My Bookings</span></div>
    <div class="mb-head"><div class="mb-eyebrow">Booking Center</div><h2 class="mb-title">My Bookings</h2></div>
    <div class="mb-prod"><label>Products</label><select id="mbProd">${opts}</select></div>
    <div class="mb-tabs">${tabs}</div>
    <div class="mb-list">${cards}</div>`;
  $("#mbBack").onclick = navBack;
  $("#mbProd").onchange = (e) => { uiMB.product = e.target.value; renderMyBookings(app); };
  $$(".mb-tab").forEach((b) => b.onclick = () => { uiMB.tab = b.dataset.tab; renderMyBookings(app); });
  $$(".mb-card [data-view]").forEach((b) => b.onclick = () => go(`#/mybooking/${encodeURIComponent(b.dataset.view)}`));
  $$(".mb-card [data-torder]").forEach((b) => b.onclick = () => go(`#/ticket-order/${encodeURIComponent(b.dataset.torder)}`));
}

function mbStatusBadge(s) {
  if (s === "cancelled") return `<span class="badge-cancelled">● CANCELLED</span>`;
  if (s === "past") return `<span class="badge-past">● COMPLETED</span>`;
  return `<span class="badge-confirmed">● CONFIRMED</span>`;
}
function mbCardHtml(bk, i) {
  const { place, room: r } = findRoom(bk.placeId, bk.roomId);
  const img = (r.imgs && r.imgs[0]) || r.img;
  return `<div class="mb-card">
    <div class="mb-crow">${mbStatusBadge(bk.status)}<a class="mb-details" data-view="${i}" href="javascript:void(0)">Details ›</a></div>
    <div class="mb-bno">Booking no. <b>${bk.no}</b> · ${bk.bookedAt}</div>
    <div class="mb-main">
      <div class="mb-thumb" style="background:${img}"></div>
      <div class="mb-minfo">
        <span class="rc-place">${place.name}</span>
        <div class="res-type">${r.type}</div>
        <h4 class="res-name">${r.name}</h4>
      </div>
    </div>
    <div class="mb-stay">
      <div class="ln"><span class="ic">📅</span><span>${fmtFull(bk.ci)} – ${fmtFull(bk.co)}</span></div>
      <div class="ln"><span class="ic">👥</span><span>${bk.adults} guests · 1 room</span></div>
    </div>
  </div>`;
}

function renderMyBookingDetail(app, id) {
  const a = mbAccById(id);
  if (!a) { location.hash = "#/mybookings"; return; }
  const nights = nightsBetween(a.ci, a.co), total = a.total;
  const g = a.guest;
  const cancelBtn = a.status === "upcoming" ? `<button class="mb-cancel-btn" id="mbCancel">Cancel booking</button>` : "";
  app.innerHTML = `
    <div class="subhead"><button class="back-btn" id="mdBack" aria-label="Back">‹</button><span class="subtitle">My Bookings Details</span></div>
    <div class="bk-wrap">
      <div class="bk-card"><div style="margin-bottom:10px">${mbStatusBadge(a.status)}</div>
        <div class="mb-bno" style="padding:0">Booking no. <b>${escapeHtml(a.no)}</b><br/>Booking date ${escapeHtml(a.bookedAt)}</div></div>
      ${bkCancelCard()}
      <div class="bk-card">
        <div class="mb-detail-hero" style="background:${a.img}"></div>
        <span class="rc-place">${escapeHtml(a.placeName)}</span>
        ${a.roomType ? `<div class="res-type" style="margin-top:8px">${escapeHtml(a.roomType)}</div>` : ""}
        <h4 class="res-name">${escapeHtml(a.roomName)}</h4>
        <div class="bk-room-meta" style="margin-top:10px">${a.bed ? `<b>Bed:</b> ${escapeHtml(a.bed)} · ` : ""}<b>Guests:</b> ${a.adults} guests / ${a.roomCount} room${a.roomCount > 1 ? "s" : ""}</div>
      </div>
      <div class="bk-card"><h4 class="bk-h">Booking info</h4>
        <div class="bk-line"><span class="ic">📅</span><span>${fmtFull(a.ci)} – ${fmtFull(a.co)}</span></div>
        <div class="bk-line"><span class="ic">🕐</span><span>Check-in after ${a.checkin} / Check-out before ${a.checkout}</span></div>
      </div>
      <div class="bk-card"><h4 class="bk-h">Guest info</h4>
        <div class="mb-krow"><span class="k">NATIONALITY</span><span class="v">${escapeHtml(g.nationality || "-")}</span></div>
        <div class="mb-krow"><span class="k">NAME</span><span class="v">${escapeHtml([g.first, g.middle, g.last].filter(Boolean).join(" ") || "-")}</span></div>
        <div class="mb-krow"><span class="k">EMAIL</span><span class="v">${escapeHtml(g.email || "-")}</span></div>
        <div class="mb-krow"><span class="k">PHONE</span><span class="v">${escapeHtml([g.code, g.phone].filter(Boolean).join(" ") || "-")}</span></div>
      </div>
      <div class="bk-card"><h4 class="bk-h">Customer Support</h4>
        <div class="mb-krow"><span class="k">CONTACT NUMBER</span><span class="v">+82-33-562-7777</span></div>
        <div class="mb-krow"><span class="k">CONTACT E-MAIL</span><span class="v">reservations@high1.com</span></div>
        <p class="mb-note">Contact support for payment confirmation, booking changes, or cancellation.</p>
      </div>
      <div class="bk-card"><h4 class="bk-h">Price Details</h4>
        <div class="bk-price-row"><span>${a.roomCount} room x ${nights} night${nights > 1 ? "s" : ""}</span><span>${won(total)}</span></div>
        <div class="bk-price-row"><span>VAT</span><span>Included</span></div>
        <div class="bk-total"><span>TOTAL</span><span>${won(total)}</span></div>
        ${a.refund != null ? `<div class="bk-price-row" style="color:#c0392b"><span>Refund</span><span>−${won(a.refund)}</span></div>` : ""}
        <div class="txn"><div class="t1">Payment — ${a.status === "cancelled" ? "Refunded" : "Succeeded"}</div>
          <div class="t2">${won(total)} · stripe (mock)<br/>Transaction ID: TEST-ch${String(a.no).slice(-5)}<br/>Occurred ${escapeHtml(a.bookedAt)}</div></div>
      </div>
      ${cancelBtn}
    </div>`;
  $("#mdBack").onclick = navBack;
  const cb = $("#mbCancel");
  if (cb) cb.onclick = () => go(`#/mycancel/${encodeURIComponent(a.id)}`);
}

function renderMyCancel(app, id) {
  const a = mbAccById(id);
  if (!a) { location.hash = "#/mybookings"; return; }
  const total = a.total;
  const refund = a.refund != null ? a.refund : (TODAY <= addDays(a.ci, -3) ? total : 0);
  app.innerHTML = `
    <div class="subhead"><button class="back-btn" id="cxBack" aria-label="Back">‹</button><span class="subtitle">Cancel booking</span></div>
    <div class="bk-wrap">
      <h2 class="bk-title">Cancel this booking?</h2>
      <p class="bk-sub">Review the refund below. This action cannot be undone.</p>
      <div class="bk-card bk-room"><div class="bk-room-img" style="background:${a.img}"></div>
        <div class="bk-room-info"><span class="rc-place">${escapeHtml(a.placeName)}</span>${a.roomType ? `<div class="res-type">${escapeHtml(a.roomType)}</div>` : ""}<h4 class="res-name">${escapeHtml(a.roomName)}</h4>
        <div class="bk-room-meta"><b>Stay:</b> ${fmtFull(a.ci)} – ${fmtFull(a.co)}</div></div></div>
      ${bkCancelCard()}
      <div class="bk-card"><h4 class="bk-h">Refund</h4>
        <div class="bk-price-row"><span>Paid amount</span><span>${won(total)}</span></div>
        <div class="bk-total"><span>Refund</span><span>${won(refund)}</span></div>
        <p class="mb-note">${refund > 0 ? "Full refund (before free-cancellation deadline)." : "Non-refundable (after free-cancellation deadline)."}</p>
      </div>
      <button class="bk-cta" id="cxConfirm" style="background:#e11d48">Confirm cancellation</button>
    </div>`;
  $("#cxBack").onclick = navBack;
  $("#cxConfirm").onclick = () => {
    if (a.seed) {
      const list = loadReservationsM(); const r = list.find((x) => x.code === a.id);
      if (r) { r.status = "CANCELLED"; r.refund_amount = refund; r.cancelled_at = new Date().toISOString(); saveReservationsM(list); }
    } else {
      MY_BOOKINGS[a.idx].status = "cancelled";
    }
    goReplace(`#/cancelcomplete/${encodeURIComponent(a.id)}`);
  };
}

/* 취소완료 (구조 = 예약완료페이지와 동일) */
function renderCancelComplete(app, id) {
  const a = mbAccById(id);
  if (!a) { location.hash = "#/mybookings"; return; }
  const nights = nightsBetween(a.ci, a.co), total = a.total;
  app.innerHTML = `
    <div class="bk-wrap" style="padding-bottom:150px">
      <div class="done-badge" style="color:#e11d48">● CANCELLED</div>
      <h2 class="done-title">Your booking has been cancelled.</h2>
      <p class="done-sub">Your booking and refund status can be reviewed in booking details.</p>
      <div class="done-num"><div class="k">BOOKING NUMBER</div><div class="v">${escapeHtml(a.no)}</div></div>
      ${bkCancelCard()}
      <div class="bk-card bk-room"><div class="bk-room-img" style="background:${a.img}"></div>
        <div class="bk-room-info"><span class="rc-place">${escapeHtml(a.placeName)}</span>${a.roomType ? `<div class="res-type">${escapeHtml(a.roomType)}</div>` : ""}<h4 class="res-name">${escapeHtml(a.roomName)}</h4>
        <div class="bk-room-meta">${a.bed ? `<b>Bed:</b> ${escapeHtml(a.bed)}<br/>` : ""}<b>Guests:</b> ${a.adults} guests / ${a.roomCount} room${a.roomCount > 1 ? "s" : ""}</div></div></div>
      <div class="bk-card"><h4 class="bk-h">Booking info</h4>
        <div class="bk-line"><span class="ic">📅</span><span>${fmtFull(a.ci)} – ${fmtFull(a.co)}</span></div>
        <div class="bk-line"><span class="ic">🕐</span><span>Check-in after ${a.checkin} / Check-out before ${a.checkout}</span></div>
      </div>
      <div class="bk-card"><h4 class="bk-h">Price Details</h4>
        <div class="bk-price-row"><span>${a.roomCount} room x ${nights} night${nights > 1 ? "s" : ""}</span><span>${won(total)}</span></div>
        <div class="bk-price-row"><span>VAT</span><span>Included</span></div>
        <div class="bk-total"><span>TOTAL</span><span>${won(total)}</span></div>
      </div>
    </div>
    <div class="done-foot">
      <button class="btn-solid" id="ccBookings">Go to Booking list →</button>
      <button class="btn-line" id="ccMain">Go to Main →</button>
    </div>`;
  $("#ccBookings").onclick = () => go("#/mybookings");
  $("#ccMain").onclick = () => go("#/");
}

function renderProfile(app) {
  const CODES = ["Code", "+82", "+86", "+81", "+1"];
  const NATIONS = ["Select", "Korea", "China", "Japan", "United States", "Other"];
  app.innerHTML = `
    <div class="subhead"><button class="back-btn" id="pfBack" aria-label="Back">‹</button><span class="subtitle">My Profile</span></div>
    <div class="bk-wrap">
      <div class="mb-eyebrow">Account Profile</div>
      <h2 class="bk-title">My Profile</h2>
      <p class="bk-sub">Save your guest details here, then let booking auto-fill them whenever default guest information is turned on.</p>
      <div class="pf-toggle">
        <div class="pf-t"><b>Set as default guest information</b><p>When enabled, booking starts with your saved guest name and phone — you can still edit before submitting.</p></div>
        <button class="tgl ${uiProfile.defaultGuest ? "on" : ""}" id="pfTgl" aria-label="Toggle"></button>
      </div>
      <div class="field"><label>Nationality</label><select>${NATIONS.map((n) => `<option>${n}</option>`).join("")}</select></div>
      <div class="field"><label>First name</label><input placeholder="Use only English letters" /></div>
      <div class="field"><label>Middle name</label><input placeholder="Use only English letters" /></div>
      <div class="field"><label>Last name</label><input placeholder="Use only English letters" /></div>
      <div class="field"><label>Email</label><input value="3664573275@qq.com" /></div>
      <div class="field"><label>Phone number</label><div class="field-row"><select class="col-code">${CODES.map((c) => `<option>${c}</option>`).join("")}</select><input class="col" placeholder="Phone number" /></div><div class="hint">Booking confirmation will be sent to this email.</div></div>
      <a class="pf-changepw" href="javascript:void(0)">Change password</a>
      <div class="pf-actions"><button class="btn-dark" id="pfCancel">Cancel</button><button class="btn-solid" id="pfSave">Save</button></div>
    </div>`;
  $("#pfBack").onclick = navBack;
  $("#pfTgl").onclick = () => { uiProfile.defaultGuest = !uiProfile.defaultGuest; $("#pfTgl").classList.toggle("on", uiProfile.defaultGuest); };
  $("#pfCancel").onclick = navBack;
  $("#pfSave").onclick = () => { alert("Saved (demo)."); navBack(); };
}

/* ========================================================
   숙소 상세 (Overview)
   ======================================================== */
function renderPlaceDetail(app, id) {
  const place = PLACES.find((p) => p.id === id) || PLACES[0];
  const siblings = PLACES.filter((p) => p.type === place.type);
  const tabs = siblings.map((p) => `<button class="place-tab ${p.id === place.id ? "on" : ""}" data-pid="${p.id}"><span>${p.name}</span></button>`).join("");
  const SECTIONS = ["Overview", "Rooms", "Guide", "Policy", "Location"];
  const secNav = SECTIONS.map((n) => `<button class="${n === "Overview" ? "on" : ""}" data-sec="${n}">${n}</button>`).join("");

  const gimgs = place.imgs || [place.hero];
  const gslides = gimgs.map((g) => `<div class="dg-slide" style="background:${g}"></div>`).join("");
  const gdots = gimgs.length > 1 ? `<div class="dg-dots">${gimgs.map((_, i) => `<i class="${i === 0 ? "on" : ""}"></i>`).join("")}</div>` : "";
  const typeLabel = place.type === "hotel" ? "Hotel" : "Condo";

  app.innerHTML = `
    <div class="subhead"><button class="back-btn" id="pdBack" aria-label="Back">‹</button><span class="subtitle">${typeLabel}</span></div>
    <div class="place-tabs scroll-hint" style="padding-right:0">${tabs}</div>
    <div class="detail-gallery"><div class="dg-imgs">${gslides}</div>${gdots}</div>
    <div class="detail-title"><h2>${place.name}</h2><p>${place.subtitle}</p></div>
    <div class="sec-nav-wrap scroll-hint"><div class="sec-nav">${secNav}</div></div>
    <div id="secBody"></div>`;

  renderPdBody(place);
  $("#pdBack").onclick = navBack;
  // 같은 숙소상세 내 형제 탭 전환 = in-page 교체(백 단계 안 쌓음)
  $$(".place-tab").forEach((b) => b.onclick = () => goReplace(`#/place/${b.dataset.pid}`));
  const setNav = (name) => $$(".sec-nav button").forEach((x) => x.classList.toggle("on", x.dataset.sec === name));
  $$(".sec-nav button").forEach((b) => b.onclick = () => {
    const sec = b.dataset.sec;
    if (sec === "Overview") { $("#pd-overview").scrollIntoView({ behavior: "smooth", block: "start" }); setNav("Overview"); }
    else if (sec === "Rooms") { $("#pd-rooms").scrollIntoView({ behavior: "smooth", block: "start" }); setNav("Rooms"); }
    else openPlaceModal(place, sec); // Guide/Policy/Location = 모달
  });
  // 갤러리 스와이프 → 점 동기화
  const gw = $(".detail-gallery");
  if (gw) {
    const strip = gw.querySelector(".dg-imgs"), dts = gw.querySelectorAll(".dg-dots i");
    if (dts.length > 1) strip.addEventListener("scroll", () => {
      const i = Math.round(strip.scrollLeft / strip.clientWidth);
      dts.forEach((dd, k) => dd.classList.toggle("on", k === i));
    });
  }
  // 스크롤 스파이: Rooms 타이틀이 네비 아래로 올라오면 Rooms 탭 활성화
  clearPdScroll();
  pdScrollHandler = () => {
    const rooms = document.getElementById("pd-rooms");
    const navWrap = document.querySelector(".sec-nav-wrap");
    if (!rooms || !navWrap) return;
    const threshold = navWrap.getBoundingClientRect().bottom + 8; // 고정 네비 하단 기준
    setNav(rooms.getBoundingClientRect().top <= threshold ? "Rooms" : "Overview");
  };
  window.addEventListener("scroll", pdScrollHandler, { passive: true });
  pdScrollHandler();
}

// Overview(요약정보) + Rooms를 한 페이지에 함께 노출
function renderPdBody(place) {
  const body = $("#secBody");
  const chips = place.facilities.map((f) => `<span class="chip">${f}</span>`).join("");
  const facilMore = place.facilities.length > 6;
  const descMore = (place.desc || "").length > 120;
  body.innerHTML = `
    <section id="pd-overview" class="pd-sec">
      <div class="info-card">
        <div class="info-block"><div class="lbl">Check-in / Check-out</div><div class="big">Check-in ${place.checkin} / Check-out ${place.checkout}</div></div>
        <hr class="info-hr" />
        <div class="info-block"><div class="lbl">Main Facilities</div>
          <div class="chips clamp2" id="pdFacil">${chips}</div>
          ${facilMore ? `<button class="show-more" id="pdFacilBtn">Show more</button>` : ""}
        </div>
        <hr class="info-hr" />
        <div class="info-block"><div class="lbl">Description</div>
          <div class="info-desc clamp3" id="pdDesc">${place.desc}</div>
          ${descMore ? `<button class="show-more" id="pdDescBtn">Show more</button>` : ""}
        </div>
      </div>
    </section>
    <section id="pd-rooms" class="pd-sec">
      <h3 class="pd-sec-h">Rooms</h3>
      ${searchMiniHtml()}
      <div class="pd-rooms-tools"><button class="filters-btn js-open-filters">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M3 5h18M6 12h12M10 19h4"/></svg>Filters</button></div>
      <div class="res-list">${place.rooms.map((r) => resCardHtml(place, r)).join("")}</div>
    </section>`;
  wireResultCards(body);
  wireSearchMini(body);
  $$(".js-open-filters", body).forEach((el) => el.onclick = openFilterSheet);
  // 시설(2줄)/설명(3줄) 접기·펼치기
  const fb = $("#pdFacilBtn");
  if (fb) fb.onclick = () => { const op = $("#pdFacil").classList.toggle("open"); fb.textContent = op ? "Show less" : "Show more"; };
  const db = $("#pdDescBtn");
  if (db) db.onclick = () => { const op = $("#pdDesc").classList.toggle("open"); db.textContent = op ? "Show less" : "Show more"; };
}

/* ---------- 안내/정책/위치 모달 ---------- */
function openPlaceModal(place, tab) {
  uiState._gTab = tab; renderPlaceModal(place);
  $("#guideScope").classList.add("open"); $("#guideSheet").setAttribute("aria-hidden", "false"); lockBg();
}
function closePlaceModal() { $("#guideScope").classList.remove("open"); $("#guideSheet").setAttribute("aria-hidden", "true"); unlockBg(); }
function renderPlaceModal(place) {
  const tab = uiState._gTab || "Guide";
  const tabsHtml = ["Guide", "Policy", "Location"].map((t) => `<button class="gm-tab ${t === tab ? "on" : ""}" data-gt="${t}">${t}</button>`).join("");
  let content = "";
  if (tab === "Guide") {
    content = `
      <div class="gm-eyebrow">Guide</div>
      <div class="gm-card"><div class="gm-sub">Usage Notes</div><ul class="gm-list">${PLACE_GUIDE.usage.map((x) => `<li>${x}</li>`).join("")}</ul></div>
      <div class="gm-eyebrow">Notices / Construction</div>
      ${PLACE_GUIDE.notices.map((x) => `<div class="gm-warn"><span>⚠️</span><span>${x}</span></div>`).join("")}`;
  } else if (tab === "Policy") {
    content = `<div class="gm-eyebrow">Policy</div><div class="gm-card"><ul class="gm-list">${PLACE_POLICY.map((x) => `<li>${x}</li>`).join("")}</ul></div>`;
  } else {
    content = `
      <div class="gm-eyebrow">Location</div>
      <div class="loc-url">${LOCATION.url}</div>
      <div class="loc-map">Resort Map</div>
      <div class="loc-addr-wrap"><span class="loc-pin">📍</span><div class="loc-addr"><div class="k">ADDRESS</div><div class="v">${LOCATION.address}</div></div></div>
      <button class="loc-copy" id="locCopy">⧉ Copy</button>`;
  }
  $("#guideBody").innerHTML = `
    <div class="gm-head"><div class="gm-tabs">${tabsHtml}</div><button class="sheet-close" id="gmClose">✕</button></div>
    <div class="gm-content">${content}</div>`;
  $("#gmClose").onclick = closePlaceModal;
  $$("#guideBody .gm-tab").forEach((b) => b.onclick = () => { uiState._gTab = b.dataset.gt; renderPlaceModal(place); });
  const cp = $("#locCopy");
  if (cp) cp.onclick = () => { try { navigator.clipboard.writeText(LOCATION.address); } catch (e) {} cp.textContent = "Copied!"; setTimeout(() => { cp.textContent = "⧉ Copy"; }, 1200); };
}

/* ========================================================
   검색 바텀시트
   ======================================================== */
function openSearchSheet() {
  const s = uiState.search;
  uiState.calDraft = { ci: s.ci, co: s.co };
  uiState._calOpen = false;
  renderSheetBody();
  $("#sheetScope").classList.add("open");
  $("#searchSheet").setAttribute("aria-hidden", "false");
  lockBg();
}
function closeSearchSheet() { $("#sheetScope").classList.remove("open"); $("#searchSheet").setAttribute("aria-hidden", "true"); unlockBg(); }

/* 도메인(숙소/티켓) 2택 옵션 */
function domainOptionsHtml(cur) {
  const row = (v, label) => `<div class="opt-row ${cur === v ? "on" : ""}" data-domain="${v}"><span class="dot"></span><span>${label}</span></div>`;
  return `<div class="sf-domain-opts">${row("Accommodation", "Accommodation")}${row("Ticket", "Ticket")}</div>`;
}
function renderSheetBody() {
  const s = uiState.search;
  const isTicket = s.type === "Ticket";
  const body = $("#searchSheetBody");
  const accomFields = `
    <div class="sf-field" id="fldCal">
      <span class="sf-ico">${ICO.cal}</span>
      <div class="sf-main"><span class="sf-lbl">Check in - Check out</span><div class="sf-val" id="calSummary">${s.ci} - ${s.co}</div></div>
      <span class="val" style="color:var(--muted)">▾</span>
    </div>
    <div id="calMount"></div>
    ${stepperField("Adults", "adults", ICO.users)}
    ${stepperField("Children", "children", ICO.users, "0-" + CHILD_AGE_MAX + " yrs")}
    ${s.children > 0 ? childAgesHtml() : ""}
    <div class="sf-field">
      <span class="sf-ico">${ICO.bed}</span>
      <div class="sf-main"><span class="sf-lbl">Rooms</span></div>
      <span class="sf-fixed">1</span>
    </div>`;
  if (isTicket && !uiState.ticketUseDate) uiState.ticketUseDate = todayKstYmd();
  const ticketFields = `
    <div class="tk-date-field">
      <label class="tk-date-lbl" for="tkUseDate">${TL("사용일 (하루 선택)", "Usage date (single day)")}</label>
      <input type="date" id="tkUseDate" class="tk-date-input" min="${todayKstYmd()}" value="${uiState.ticketUseDate || todayKstYmd()}">
    </div>
    <div class="sf-note">🎫 ${TL("오픈형 티켓 — 선택한 사용일에 사용 가능한 티켓을 보여줍니다.", "Open tickets — showing tickets usable on the selected date.")}</div>`;
  body.innerHTML = `
    <div class="sf-field select" id="fldDomain">
      <span class="sf-val" style="font-weight:800">${s.type}</span>
      <span class="val" style="color:var(--muted)">▾</span>
    </div>
    <div id="domainMount">${uiState._domainOpen ? domainOptionsHtml(s.type) : ""}</div>
    ${isTicket ? ticketFields : accomFields}
    <button class="sheet-search" id="btnDoSearch">Search</button>`;

  // 도메인 토글
  $("#fldDomain").onclick = () => { uiState._domainOpen = !uiState._domainOpen; renderSheetBody(); };
  $$("#domainMount [data-domain]").forEach((el) => el.onclick = () => { uiState.search.type = el.dataset.domain; uiState._domainOpen = false; uiState._calOpen = false; renderSheetBody(); });
  // 티켓 사용일 입력
  if (isTicket) { const di = $("#tkUseDate"); if (di) di.onchange = () => { uiState.ticketUseDate = di.value || todayKstYmd(); }; }

  if (!isTicket) {
    // 캘린더 토글 (상태 유지)
    $("#fldCal").onclick = () => {
      uiState._calOpen = !uiState._calOpen;
      $("#calMount").innerHTML = uiState._calOpen ? calendarHtml() : "";
      if (uiState._calOpen) wireCalendar();
    };
    if (uiState._calOpen) { $("#calMount").innerHTML = calendarHtml(); wireCalendar(); }
    wireSteppers();
    wireChildAges();
  }
  $("#btnDoSearch").onclick = () => {
    const ticket = uiState.search.type === "Ticket";
    if (ticket) { const di = $("#tkUseDate"); if (di && di.value) uiState.ticketUseDate = di.value; else if (!uiState.ticketUseDate) uiState.ticketUseDate = todayKstYmd(); }
    closeSearchSheet();
    $("#app").innerHTML = `<div class="loading"><div class="spinner"></div></div>`; // 제자리 로딩
    setTimeout(() => go(ticket ? "#/ticket/search" : "#/search"), 700);
  };
}

/* 스텝퍼 (Adults / Children) — Rooms는 1 고정으로 스텝퍼 없음 */
function stepperField(label, key, ico, hint) {
  const v = uiState.search[key];
  const min = key === "adults" ? 1 : 0, max = 10;
  return `
    <div class="sf-field" data-step="${key}">
      <span class="sf-ico">${ico}</span>
      <div class="sf-main"><span class="sf-val" style="font-weight:800">${label}</span>${hint ? `<span class="sf-lbl">${hint}</span>` : ""}</div>
      <div class="stepper">
        <button class="dec" ${v <= min ? "disabled" : ""}>−</button>
        <span class="num">${v}</span>
        <button class="inc" ${v >= max ? "disabled" : ""}>+</button>
      </div>
    </div>`;
}
function wireSteppers() {
  $$(".sf-field[data-step]").forEach((f) => {
    const key = f.dataset.step;
    const min = key === "adults" ? 1 : 0, max = 10;
    f.querySelector(".dec").onclick = (e) => { e.stopPropagation(); if (uiState.search[key] > min) { uiState.search[key]--; afterGuestChange(key); } };
    f.querySelector(".inc").onclick = (e) => { e.stopPropagation(); if (uiState.search[key] < max) { uiState.search[key]++; afterGuestChange(key); } };
  });
}
function afterGuestChange(key) {
  // 아동 수 변경 시 나이 배열 동기화 후 시트 전체 갱신 (나이 UI 노출/숨김)
  if (key === "children") {
    const s = uiState.search;
    while (s.childAges.length < s.children) s.childAges.push(7);
    while (s.childAges.length > s.children) s.childAges.pop();
    renderSheetBody();
  } else {
    const f = $(`.sf-field[data-step="${key}"]`);
    const v = uiState.search[key];
    f.querySelector(".num").textContent = v;
    f.querySelector(".dec").disabled = v <= (key === "adults" ? 1 : 0);
    f.querySelector(".inc").disabled = v >= 10;
  }
}

/* 아동 나이 선택 (아동 1명 이상일 때) */
function childAgesHtml() {
  const opts = Array.from({ length: CHILD_AGE_MAX + 1 }, (_, i) => i);
  const items = uiState.search.childAges.map((age, i) => `
    <div class="ca-item">
      <label>Child ${i + 1}</label>
      <select data-ci="${i}">${opts.map((o) => `<option value="${o}" ${o === age ? "selected" : ""}>${o}</option>`).join("")}</select>
    </div>`).join("");
  return `<div class="child-ages"><div class="ca-title">Age of each child (0–${CHILD_AGE_MAX} yrs)</div><div class="ca-grid">${items}</div></div>`;
}
function wireChildAges() {
  $$(".ca-item select").forEach((sel) => sel.onchange = () => { uiState.search.childAges[+sel.dataset.ci] = +sel.value; });
}

/* 캘린더 */
function calendarHtml() {
  return `<div class="cal-wrap"><div class="cal-head"><button class="cal-nav" id="calPrev">‹</button><strong id="calMonthLbl"></strong><button class="cal-nav" id="calNext">›</button></div><div class="cal-grid" id="calGrid"></div></div>`;
}
function wireCalendar() {
  drawCal();
  $("#calPrev").onclick = () => { uiState.calMonth = addMonths(uiState.calMonth, -1); drawCal(); };
  $("#calNext").onclick = () => { uiState.calMonth = addMonths(uiState.calMonth, 1); drawCal(); };
}
function drawCal() {
  const { y, m } = ymdParts(uiState.calMonth);
  $("#calMonthLbl").textContent = new Date(y, m - 1, 1).toLocaleString("en-US", { month: "long", year: "numeric" });
  const firstDow = new Date(y, m - 1, 1).getDay();
  const dim = new Date(y, m, 0).getDate();
  const dows = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
  const d = uiState.calDraft;
  let cells = dows.map((w) => `<div class="dow">${w}</div>`).join("");
  for (let i = 0; i < firstDow; i++) cells += `<div></div>`;
  for (let day = 1; day <= dim; day++) {
    const ymd = `${y}-${String(m).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    const off = ymd < TODAY;
    const isEnd = ymd === d.ci || ymd === d.co;
    const inRange = d.ci && d.co && ymd > d.ci && ymd < d.co;
    const cls = ["d", off ? "off" : "", isEnd ? "sel" : "", inRange ? "in" : ""].filter(Boolean).join(" ");
    cells += `<div class="${cls}" ${off ? "" : `data-day="${ymd}"`}>${day}</div>`;
  }
  $("#calGrid").innerHTML = cells;
  $$("#calGrid .d[data-day]").forEach((el) => el.onclick = () => {
    const day = el.dataset.day, dd = uiState.calDraft;
    if (!dd.ci || (dd.ci && dd.co) || day <= dd.ci) { dd.ci = day; dd.co = ""; } else { dd.co = day; }
    uiState.search.ci = dd.ci;
    uiState.search.co = dd.co || addDays(dd.ci, 1);
    $("#calSummary").textContent = `${uiState.search.ci} - ${uiState.search.co}`;
    drawCal();
  });
}

/* ========================================================
   드로어 (전체메뉴 · 아코디언)
   ======================================================== */
const NAV = [
  { label: "Home", href: "#/" },
  { label: "Accommodation", sub: [{ label: "Hotel", href: "#/place/convention-tower" }, { label: "Condo", href: "#/place/valley-condo" }] },
  { label: "Ticket", sub: [{ label: "Water World", href: "#/ticket/bridge/" + encodeURIComponent("워터파크") }, { label: "Ski Lift / Rental", href: "#/ticket/bridge/" + encodeURIComponent("스키") }, { label: "Gondola", href: "#/ticket/bridge/" + encodeURIComponent("곤돌라") }] },
  { label: "My Bookings", href: "#/mybookings" },
  { label: "Profile", href: "#/profile" },
  { label: "CS Center", href: "javascript:void(0)" },
];
function buildDrawer() {
  const nav = $("#drawerNav");
  nav.innerHTML = NAV.map((item, i) => {
    if (item.sub) {
      const subs = item.sub.map((s) => `<a href="${s.href}">${s.label}</a>`).join("");
      return `<div class="dn-item" data-acc="${i}"><button class="dn-row" type="button">${item.label}<span class="caret drop">▾</span></button><div class="dn-sub">${subs}</div></div>`;
    }
    return `<div class="dn-item"><a class="dn-row" href="${item.href}">${item.label}<span class="caret">›</span></a></div>`;
  }).join("");
  // 아코디언 토글
  $$(".dn-item[data-acc]").forEach((it) => {
    it.querySelector(".dn-row").onclick = () => it.classList.toggle("open");
  });
  // 링크 클릭 = 새 페이지 진입(전체메뉴 경유) → 스택 push. 드로어 닫기.
  $$("#drawerNav a").forEach((a) => a.addEventListener("click", (e) => {
    const href = a.getAttribute("href");
    closeDrawer();
    if (href && href.startsWith("#/")) { e.preventDefault(); go(href); }
  }));
  applyAuthUI();
}
/* 로그인 상태 UI (데모 토글) */
function applyAuthUI() {
  $("#btnHeadLogin").style.display = uiState.loggedIn ? "none" : "";
  const top = $("#drawerAuthTop");
  if (uiState.loggedIn) {
    top.innerHTML = `<div class="drawer-account"><span class="who">Guest User</span><button class="logout" id="btnLogout">Log out</button></div>`;
    $("#btnLogout").onclick = () => { uiState.loggedIn = false; applyAuthUI(); };
  } else {
    // 로그인/회원가입 페이지 동일 → 최상단 로그인 버튼 1개만
    top.innerHTML = `<button class="drawer-login-btn" id="btnDrawerLogin">Sign in</button>`;
    $("#btnDrawerLogin").onclick = doLogin;
  }
}
function doLogin() { uiState.loggedIn = true; applyAuthUI(); closeDrawer(); } // 데모: 로그인 페이지 대체

function openDrawer() { $("#drawerScope").classList.add("open"); $("#drawer").setAttribute("aria-hidden", "false"); $("#btnMenu").setAttribute("aria-expanded", "true"); lockBg(); }
function closeDrawer() { $("#drawerScope").classList.remove("open"); $("#drawer").setAttribute("aria-hidden", "true"); $("#btnMenu").setAttribute("aria-expanded", "false"); unlockBg(); }

/* ========================================================
   부트스트랩
   ======================================================== */
function boot() {
  ensureTicketFrontSeed(); // 어드민 데이터 없을 때만 티켓 더미 시드(어드민 데이터 보존)
  buildDrawer();
  $("#btnMenu").onclick = openDrawer;
  $("#btnDrawerClose").onclick = closeDrawer;
  $("#drawerBackdrop").onclick = closeDrawer;
  $("#sheetBackdrop").onclick = closeSearchSheet;
  $("#filterBackdrop").onclick = closeFilterSheet;
  $("#roomBackdrop").onclick = closeRoomDetail;
  $("#guideBackdrop").onclick = closePlaceModal;
  $("#btnHeadLogin").onclick = doLogin; // 데모: 헤더 로그인 → 로그인 상태 ON
  $("#langSelect").onchange = (e) => { uiState.lang = e.target.value; };
  document.querySelector(".mhead-logo").addEventListener("click", resetNav); // 로고 → 홈(스택 리셋)
  if (location.hash && location.hash !== "#/") pushNav(location.hash); // 딥링크 초기화
  enableDragScroll();
  window.addEventListener("hashchange", router);
  router();
}

/* 데스크톱 마우스로 가로 스와이프(잡아끌기). 터치는 네이티브 스크롤 사용. */
function enableDragScroll() {
  const SEL = ".hero-imgs, .dg-imgs, .rc-imgs, .card-scroller, .cat-tabs, .place-tabs, .sec-nav";
  let drag = null;
  document.addEventListener("pointerdown", (e) => {
    if (e.pointerType === "touch") return; // 터치는 네이티브
    const sc = e.target.closest(SEL);
    if (!sc) return;
    drag = { sc, startX: e.clientX, startLeft: sc.scrollLeft, moved: false };
    document.body.classList.add("dragging");
  });
  document.addEventListener("pointermove", (e) => {
    if (!drag) return;
    const dx = e.clientX - drag.startX;
    if (Math.abs(dx) > 4) drag.moved = true;
    drag.sc.scrollLeft = drag.startLeft - dx;
  });
  document.addEventListener("pointerup", () => {
    document.body.classList.remove("dragging");
    if (drag && drag.moved) {
      const sc = drag.sc; // 드래그 후 발생하는 클릭 1회 억제(카드/탭 오작동 방지)
      const kill = (ev) => { ev.stopPropagation(); ev.preventDefault(); };
      sc.addEventListener("click", kill, true);
      setTimeout(() => sc.removeEventListener("click", kill, true), 0);
    }
    drag = null;
  });
}
/* ════════════════════════════════════════════════════════════
   티켓 (모바일) — 어드민·PC프런트와 동일 localStorage 공유(읽기/주문 쓰기)
   범위: 브릿지(#/ticket/bridge/:catKo) → 상세 바텀시트 → 체크아웃 → 주문완료
   데이터 레이어는 PC front-prototype에서 그대로 이식(키·계산식 동일) → 어드민 연동
   ════════════════════════════════════════════════════════════ */
/* ─ Storage keys (어드민·PC프런트와 100% 동일) ─ */
const STORAGE_TICKET_CATEGORIES = "high1_ticket_categories_v1";
const STORAGE_COUPON_SPECS      = "high1_coupon_specs_v1";
const STORAGE_TICKET_PRODUCTS   = "high1_ticket_products_v1";
const STORAGE_TICKET_MARGIN     = "high1_ticket_margin_master_v1";
const STORAGE_TICKET_ORDERS     = "high1_ticket_orders_v1";  // 주문(프런트 쓰기)
const STORAGE_TICKET_COUPONS     = "high1_coupons_v1";        // 발급 쿠폰(프런트 쓰기)
const STORAGE_RESV_M            = "high1_reservations_v1";   // 숙소 예약(시드/프런트 공유)
function loadReservationsM() { return ldJson(STORAGE_RESV_M, []); }
function saveReservationsM(v) { localStorage.setItem(STORAGE_RESV_M, JSON.stringify(v || [])); }
const DEFAULT_TICKET_MARGIN_FRONT = { type: "amount", value: "30000" }; // 전역 디폴트

/* ─ 공용 유틸(티켓 전용 · 모바일에 미존재하던 것) ─ */
function escapeHtml(s) { return String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c])); }
function ldJson(k, f) { try { const r = localStorage.getItem(k); return r ? JSON.parse(r) : f; } catch { return f; } }
function todayKstYmd() { try { return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Seoul", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date()); } catch { return "2026-08-19"; } }
/* 티켓 다국어: 모바일은 EN 기본(KO 미사용). L(ko,en) → en 우선 */
function TL(ko, en) { return uiState.lang === "en" ? en : (ko || en); }
/* 실판매가 = 입금가 + 마진 (율: floor(base×(1+율/100)) · 정액: base+금액). 소수점 버림 */
function computeSellPriceFront(basePrice, marginType, marginValue) {
  const base = Math.max(0, parseInt(String(basePrice).replace(/\D/g, ""), 10) || 0);
  const v = parseFloat(marginValue);
  if (marginType === "rate" && !Number.isNaN(v)) return Math.max(0, Math.floor(base * (1 + v / 100)));
  if (marginType === "amount" && !Number.isNaN(v)) return Math.max(0, base + Math.floor(v));
  return base;
}

/* ─ 로더 ─ */
function loadTicketCategories() { return ldJson(STORAGE_TICKET_CATEGORIES, []); }
function loadCouponSpecs() { return ldJson(STORAGE_COUPON_SPECS, []); }
function loadTicketProducts() { return ldJson(STORAGE_TICKET_PRODUCTS, []); }
function normalizeTicketMarginF(raw) { const r = raw && typeof raw === "object" ? raw : {}; if (r.categories || r.overrides) return { categories: r.categories || {}, overrides: r.overrides || {} }; return { categories: {}, overrides: { ...r } }; }
function loadTicketMargin() { return normalizeTicketMarginF(ldJson(STORAGE_TICKET_MARGIN, {})); }
function loadTicketOrders() { return ldJson(STORAGE_TICKET_ORDERS, []); }
function saveTicketOrders(v) { localStorage.setItem(STORAGE_TICKET_ORDERS, JSON.stringify(v || [])); }
function loadTicketCoupons() { return ldJson(STORAGE_TICKET_COUPONS, []); }
function saveTicketCoupons(v) { localStorage.setItem(STORAGE_TICKET_COUPONS, JSON.stringify(v || [])); }

/* ─ 마진 적용(우선순위: 쿠폰ID > 2뎁스 > 1뎁스 > 전역) ─ */
const isMarginEntryF = (e) => e && (e.type === "amount" || e.type === "rate");
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

/* ─ 프런트 단독 데모 시드(어드민 데이터 없을 때만) — PC front와 동일 셋 ─ */
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
    detail_html_en: `<h3>${label}</h3><p>${label} — prototype demo detail.</p><img src="${svgPh(label + " Detail", color)}" style="max-width:100%;height:auto;display:block;border-radius:8px;margin-top:8px" />`, detail_html_zh: "",
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
  add("DBQ", "OAT_26성수기_워터월드_4시간권", "워터파크", "", "워터월드 4시간권", 30000, 26000, WW);
  add("DBW", "OAT_26성수기_워터월드_7시간권", "워터파크", "", "워터월드 7시간권", 36000, 31000, WW);
  add("SVA", "OAT_26시즌_스키리프트_종일권", "스키", "리프트권", "스키 리프트 종일권", 65000, 48000, SKI);
  add("RSF", "OAT_26시즌_장비렌탈_종일권", "스키", "장비렌탈", "스키 장비렌탈 종일권", 38000, 30000, SKI);
  specs.push({ id: "s_GDO1", coupon_id: "GDO", pass_name: "OAT_곤돌라_왕복권", category: "곤돌라", product_type: "", level: 1, level_name: "대인", coupon_name: "곤돌라 왕복권(대인)", price: 18000, discount_target: "", use_start_date: "2026-07-01", use_end_date: "2026-12-31", active: true });
  localStorage.setItem(STORAGE_COUPON_SPECS, JSON.stringify(specs));
  localStorage.setItem(STORAGE_TICKET_MARGIN, JSON.stringify({
    categories: { "워터파크": { type: "amount", value: "4000" }, "스키>리프트권": { type: "rate", value: "10" }, "스키>장비렌탈": { type: "amount", value: "3000" }, "곤돌라": { type: "amount", value: "2000" } },
    overrides: { DBQ: { type: "amount", value: "3000" } },
  }));
  const SW = { sale_start_date: "2026-07-01", sale_end_date: "2026-08-25" }, SS = { sale_start_date: "2026-07-01", sale_end_date: "2027-02-20" };
  const pimg = (label, color) => ({ thumb_meta: [{ data_url: svgPh(label, color) }] });
  const mk = (o) => Object.assign({ id: "p_" + o.product_code, visibility: "Y", date_mode: "open", cancel_policy: [{ base: "3plus", penalty: 0 }, { base: "today", penalty: 100 }], created_at: T, updated_at: T }, o);
  localStorage.setItem(STORAGE_TICKET_PRODUCTS, JSON.stringify([
    mk({ product_code: "PR-T0001", name_en: "Water World Day Pass (Peak/Early)", name_zh: "水世界一日通票（旺季/早鸟）", category_1: "워터파크", category_2: "", spec_coupon_id: "DBO", ...SW, cutoff: { n: 1, unit: "day", time: "23:59" }, ...pimg("Water World Day Pass", "#38bdf8") }),
    mk({ product_code: "PR-T0002", name_en: "Water World 4-Hour Pass", name_zh: "水世界4小时票", category_1: "워터파크", category_2: "", spec_coupon_id: "DBQ", ...SW, cutoff: { n: 0, unit: "hour", time: "23:59" }, ...pimg("Water World 4-Hour", "#0ea5e9") }),
    mk({ product_code: "PR-T0003", name_en: "Water World 7-Hour Pass", name_zh: "水世界7小时票", category_1: "워터파크", category_2: "", spec_coupon_id: "DBW", ...SW, cutoff: { n: 0, unit: "hour", time: "23:59" }, ...pimg("Water World 7-Hour", "#0284c7") }),
    mk({ product_code: "PR-T0004", name_en: "Ski Lift Day Pass", name_zh: "滑雪缆车一日券", category_1: "스키", category_2: "리프트권", spec_coupon_id: "SVA", ...SS, cutoff: { n: 1, unit: "day", time: "18:00" }, ...pimg("Ski Lift Day Pass", "#6366f1") }),
    mk({ product_code: "PR-T0005", name_en: "Ski Equipment Rental (Day)", name_zh: "滑雪装备租赁（全日）", category_1: "스키", category_2: "장비렌탈", spec_coupon_id: "RSF", ...SS, cutoff: { n: 1, unit: "day", time: "18:00" }, ...pimg("Ski Equipment Rental", "#8b5cf6") }),
    mk({ product_code: "PR-T0006", name_en: "Gondola Round Trip", name_zh: "观光缆车往返", category_1: "곤돌라", category_2: "", spec_coupon_id: "GDO", sale_start_date: "2026-07-01", sale_end_date: "2026-12-31", cutoff: { n: 0, unit: "hour", time: "23:59" }, ...pimg("Gondola Round Trip", "#10b981") }),
  ]));
}

/* ─ 파생 헬퍼 ─ */
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
function ticketVisibleNow(p, gmap) {
  const g = gmap.get(p.spec_coupon_id); if (!g || !g.active) return false;
  if (p.visibility === "N") return false;
  const today = todayKstYmd();
  if (p.sale_start_date && today < p.sale_start_date) return false;
  if (p.sale_end_date && today > p.sale_end_date) return false;
  return true;
}
/** 선택 사용일이 상품 사용기간에 포함되는지 (사용일 미선택이면 통과) — PC front와 동일 */
function ticketUsableOn(p, gmap, date) {
  if (!date) return true;
  const g = gmap.get(p.spec_coupon_id); if (!g || !g.rows.length) return false;
  const r = g.rows[0];
  return (!r.use_start_date || date >= r.use_start_date) && (!r.use_end_date || date <= r.use_end_date);
}
function ticketLevelSell(spec, margin) { return computeSellPriceFront(spec.price, margin.type, margin.value); }
function ticketMinPrice(p, gmap) { const g = gmap.get(p.spec_coupon_id); if (!g || !g.rows.length) return 0; const margin = getTicketMarginFront(p.spec_coupon_id); return Math.min(...g.rows.map((r) => ticketLevelSell(r, margin))); }
function ticketImg(p) { const pk = (a) => (a && a[0] && a[0].data_url) || ""; return pk(p.thumb_meta) || pk(p.hero_meta) || pk(p.hero_image_meta) || pk(p.image_meta) || ""; }
function ticketGallery(p) { const a = []; (p.hero_meta || []).forEach((m) => m.data_url && a.push(m.data_url)); (p.thumb_meta || []).forEach((m) => m.data_url && a.push(m.data_url)); (p.image_meta || []).forEach((m) => m.data_url && a.push(m.data_url)); return a.length ? a : ((p.hero_image_meta || []).map((m) => m.data_url).filter(Boolean)); }
function ticketCatImgFront(c) { return (c && c.hero_image_meta && c.hero_image_meta[0] && c.hero_image_meta[0].data_url) || ""; }
function catField(c, base) { if (!c) return ""; return (uiState.lang === "en" ? c[base + "_en"] : (c[base + "_en"] || c[base + "_zh"])) || c[base + "_en"] || c[base + "_zh"] || ""; }
function ticketLevelLabel(level, name) { return level === 1 ? TL("성인", "Adult") : level === 2 ? TL("아동", "Child") : name; }
function ticketBg(img, fallback) { return img ? `center/cover no-repeat url('${img}')` : (fallback || GRAD.snow); }

/* ─ 주문 생성 + 12자리 쿠폰 발급 (PC front 로직 이식) ─ */
function genCouponNo(couponId, level, serialInt) {
  const cid = (couponId + "XXX").slice(0, 3).toUpperCase();
  const serial = String(serialInt).padStart(6, "0").slice(-6);
  const rand = String(Math.floor(Math.random() * 100)).padStart(2, "0");
  return `${cid}${level}${serial}${rand}`;
}
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
  const order = { id: "id_" + Math.random().toString(36).slice(2, 10), order_no: orderNo, items: orderItems, total, pay_method: "CARD(mock)", status: "결제완료", buyer: { name: `${buyer.first} ${buyer.last}`, phone: buyer.phone, email: buyer.email, nationality: buyer.nationality }, use_date: "", created_at: nowIso };
  orders.push(order); saveTicketOrders(orders);
  coupons.push(...issued); saveTicketCoupons(coupons);
  return { order, issued };
}

/* ─ 티켓 상세 바텀시트 ─ */
function openTicketSheet(pid) { uiState.ticketSheet = { open: true, pid }; renderTicketSheet(); }
function closeTicketSheet() { if (uiState.ticketSheet) uiState.ticketSheet.open = false; renderTicketSheet(); }
function renderTicketSheet() {
  let root = document.getElementById("tkSheetRoot");
  const st = uiState.ticketSheet || { open: false };
  if (!st.open) { if (root) { root.remove(); unlockBg(); } return; }
  const gmap = specGroupsMap(); const p = loadTicketProducts().find((x) => x.id === st.pid);
  if (!p) { if (root) root.remove(); return; }
  if (!root) { root = document.createElement("div"); root.id = "tkSheetRoot"; (document.getElementById("device") || document.body).appendChild(root); lockBg(); }
  const g = gmap.get(p.spec_coupon_id); const margin = getTicketMarginFront(p.spec_coupon_id);
  const cat = ticketCatByKo(p.category_1) || {}; const rows = g ? g.rows : [];
  const useP = rows.length ? `${rows[0].use_start_date} ~ ${rows[0].use_end_date}` : "-";
  const img = ticketGallery(p)[0] || ticketImg(p);
  const priceRows = rows.map((r) => `<div class="tk-sheet-price"><span>${ticketLevelLabel(r.level, r.level_name)} · ${escapeHtml(r.coupon_name)}</span><strong>${won(ticketLevelSell(r, margin))}</strong></div>`).join("");
  const detailHtml = (uiState.lang === "en" ? p.detail_html_en : (p.detail_html_en || p.detail_html_zh)) || p.detail_html_en || "";
  root.innerHTML = `<div class="tk-sheet-backdrop"></div><div class="tk-sheet" role="dialog" aria-modal="true">
    <div class="tk-sheet-grab"></div>
    <div class="tk-sheet-head"><div><div class="tk-sheet-cat">${escapeHtml(cat.name_en || p.category_1)}${p.category_2 ? " › " + escapeHtml(p.category_2) : ""}</div><div class="tk-sheet-title">${escapeHtml(p.name_en)}</div></div><button class="tk-sheet-close" aria-label="Close">✕</button></div>
    <div class="tk-sheet-body">
      ${img ? `<div class="tk-sheet-img" style="background:${ticketBg(img)}"></div>` : ""}
      <div class="tk-sheet-info"><span>${TL("사용기간", "Valid")}</span><b>${escapeHtml(useP)}</b></div>
      <div class="tk-sheet-info"><span>${TL("유형", "Type")}</span><b>${TL("오픈형 (사용기간 내 자유 이용)", "Open ticket (free use within valid period)")}</b></div>
      <div class="tk-sheet-prices">${priceRows}</div>
      ${detailHtml ? `<div class="tk-sheet-detail">${detailHtml}</div>` : ""}
      <p class="tk-sheet-note">${TL("수량은 상품선택의 +/- 스테퍼로 조절하면 바로 장바구니에 담깁니다.", "Adjust quantity with the +/- steppers in Select — it goes to the cart instantly.")}</p>
    </div>
  </div>`;
  root.querySelector(".tk-sheet-backdrop").onclick = closeTicketSheet;
  root.querySelector(".tk-sheet-close").onclick = closeTicketSheet;
}

/* ─ 장바구니 수량 헬퍼 (스테퍼 = 장바구니, 단일 소스) ─ */
function tkCartQty(pid, level) {
  const items = (uiState.ticketCart && uiState.ticketCart.items) || [];
  const it = items.find((x) => x.product_id === pid && x.level === level);
  return it ? it.qty : 0;
}
function tkSetQty(pid, level, delta) {
  if (!uiState.ticketCart) return;
  const items = uiState.ticketCart.items;
  const it = items.find((x) => x.product_id === pid && x.level === level);
  const cur = it ? it.qty : 0;
  const next = Math.max(0, Math.min(20, cur + delta));
  if (next === 0) { if (it) items.splice(items.indexOf(it), 1); }
  else if (it) it.qty = next;
  else items.push({ product_id: pid, level, qty: next });
}
/* 브릿지 뒤 화면(스테퍼·하단 바) 갱신 — 장바구니 시트에서 삭제 시 사용 */
function tkRerenderBridge() {
  if (!location.hash.startsWith("#/ticket/bridge/")) return;
  const app = $("#app"); if (!app) return;
  const y = window.scrollY; renderTicketBridge(app, uiState.ticketBridgeCat); window.scrollTo(0, y);
}

/* ─ 브릿지 상품 행 — Add 버튼 없음. +/- 스테퍼가 곧 장바구니 수량(자동 담기) ─ */
function ticketBridgeProductRowM(p, gmap) {
  const g = gmap.get(p.spec_coupon_id); const margin = getTicketMarginFront(p.spec_coupon_id);
  const img = ticketImg(p); const rows = g ? g.rows : [];
  const useP = rows.length ? `${rows[0].use_start_date} ~ ${rows[0].use_end_date}` : "";
  const opt = rows.map((r) => {
    const sell = ticketLevelSell(r, margin); const q = tkCartQty(p.id, r.level);
    return `<div class="tk-optrow${q > 0 ? " in-cart" : ""}">
      <div class="tk-optlabel"><b>${ticketLevelLabel(r.level, r.level_name)}</b><span>${escapeHtml(r.coupon_name)}</span></div>
      <div class="tk-optright"><span class="tk-optprice">${won(sell)}</span>
        <div class="stepper tk-step"><button class="dec tk-pq" data-pid="${escapeHtml(p.id)}" data-lv="${r.level}" data-d="-1" ${q <= 0 ? "disabled" : ""}>−</button><span class="num">${q}</span><button class="inc tk-pq" data-pid="${escapeHtml(p.id)}" data-lv="${r.level}" data-d="1">+</button></div>
      </div></div>`;
  }).join("");
  return `<div class="tk-pcard" data-pid="${escapeHtml(p.id)}">
    <div class="tk-pcard-img" style="background:${ticketBg(img)}">${img ? "" : `<span>No Image</span>`}</div>
    <div class="tk-pcard-body">
      <div class="tk-pcard-head">
        <div class="tk-pcard-title">${escapeHtml(p.name_en)}</div>
        <button class="tk-detailbtn" data-pid="${escapeHtml(p.id)}">${TL("상세보기", "Detail")} ›</button>
      </div>
      ${useP ? `<div class="tk-pcard-valid">🗓 ${TL("사용기간", "Valid")} ${escapeHtml(useP)}</div>` : ""}
      <div class="tk-optbox">${opt || `<div class="tk-empty">${TL("연결 스펙 없음", "No spec")}</div>`}</div>
    </div>
  </div>`;
}
/* ─ 브릿지 내 선택내역(장바구니) 리스트 ─ */
function ticketCartTotals(gmap) {
  const items = (uiState.ticketCart && uiState.ticketCart.items) || [];
  let total = 0, cnt = 0;
  items.forEach((it) => { const p = loadTicketProducts().find((x) => x.id === it.product_id); if (!p) return; const g = gmap.get(p.spec_coupon_id); const r = g && g.rows.find((x) => x.level === it.level); if (!r) return; total += ticketLevelSell(r, getTicketMarginFront(p.spec_coupon_id)) * it.qty; cnt += it.qty; });
  return { total, cnt };
}
/* ─ 장바구니 상품별 그룹핑 ─ */
function ticketCartGrouped(gmap) {
  const items = (uiState.ticketCart && uiState.ticketCart.items) || [];
  const order = []; const byP = new Map();
  items.forEach((it) => { if (!byP.has(it.product_id)) { byP.set(it.product_id, []); order.push(it.product_id); } byP.get(it.product_id).push(it); });
  const groups = [];
  order.forEach((pid) => {
    const p = loadTicketProducts().find((x) => x.id === pid); if (!p) return;
    const g = gmap.get(p.spec_coupon_id); const margin = getTicketMarginFront(p.spec_coupon_id);
    const lines = byP.get(pid).map((it) => {
      const r = g && g.rows.find((x) => x.level === it.level); if (!r) return null;
      const unit = ticketLevelSell(r, margin);
      return { level: it.level, level_name: r.level_name, qty: it.qty, unit, sum: unit * it.qty };
    }).filter(Boolean).sort((a, b) => a.level - b.level);
    if (lines.length) groups.push({ p, lines });
  });
  return groups;
}

/* ─ 장바구니 바텀시트 (하단 바 탭 → 펼침. 상품별 그룹, 라인=수량+금액+[✕]) ─ */
function openTicketCartSheet() { uiState.ticketCartSheetOpen = true; renderTicketCartSheet(); }
function closeTicketCartSheet() { uiState.ticketCartSheetOpen = false; renderTicketCartSheet(); }
function renderTicketCartSheet() {
  let root = document.getElementById("tkCartSheetRoot");
  if (!uiState.ticketCartSheetOpen) { if (root) { root.remove(); unlockBg(); } return; }
  const gmap = specGroupsMap();
  const { total, cnt } = ticketCartTotals(gmap);
  if (!cnt) { uiState.ticketCartSheetOpen = false; if (root) { root.remove(); unlockBg(); } return; }
  const groups = ticketCartGrouped(gmap);
  if (!root) { root = document.createElement("div"); root.id = "tkCartSheetRoot"; (document.getElementById("device") || document.body).appendChild(root); lockBg(); }
  const cat = ticketCatByKo(uiState.ticketBridgeCat);
  const scope = cat ? (cat.name_en || cat.name_ko) : (uiState.ticketBridgeCat || "");
  const body = groups.map((grp) => `
    <div class="tk-cg">
      <div class="tk-cg-name">${escapeHtml(grp.p.name_en)}</div>
      ${grp.lines.map((l) => `<div class="tk-cg-line">
        <div class="tk-cg-l"><span class="tk-cg-lv">${ticketLevelLabel(l.level, l.level_name)}</span><span class="tk-cg-q">× ${l.qty}</span></div>
        <div class="tk-cg-r"><span class="tk-cg-amt">${won(l.sum)}</span><button class="tk-cg-x" data-pid="${escapeHtml(grp.p.id)}" data-lv="${l.level}" aria-label="Remove">✕</button></div>
      </div>`).join("")}
    </div>`).join("");
  root.innerHTML = `<div class="tk-sheet-backdrop"></div><div class="tk-sheet tk-cart-sheet" role="dialog" aria-modal="true">
    <div class="tk-sheet-grab"></div>
    <div class="tk-sheet-head"><div><div class="tk-sheet-cat">${escapeHtml(scope)} ${TL("상품만 담김", "only")}</div><div class="tk-sheet-title">${TL("장바구니", "Cart")} · ${cnt} ${TL("매", cnt === 1 ? "ticket" : "tickets")}</div></div><button class="tk-sheet-close" aria-label="Close">✕</button></div>
    <div class="tk-sheet-body tk-cart-sheet-body">${body}</div>
    <div class="tk-cart-sheet-foot">
      <div class="tk-cart-sheet-total"><span>Total</span><strong>${won(total)}</strong></div>
      <button class="tk-cart-sheet-book" id="tkSheetBook">Booking →</button>
    </div>
  </div>`;
  root.querySelector(".tk-sheet-backdrop").onclick = closeTicketCartSheet;
  root.querySelector(".tk-sheet-close").onclick = closeTicketCartSheet;
  root.querySelectorAll(".tk-cg-x").forEach((b) => b.onclick = () => {
    tkSetQty(b.dataset.pid, parseInt(b.dataset.lv, 10), -9999); // 라인 제거
    tkRerenderBridge(); renderTicketCartSheet();
  });
  root.querySelector("#tkSheetBook").onclick = () => {
    if (!uiState.ticketCart || !uiState.ticketCart.items.length) { closeTicketCartSheet(); return; }
    closeTicketCartSheet();
    if (!uiState.loggedIn) { uiState.pendingTicketCheckout = true; go("#/signin"); return; }
    go("#/ticket/checkout");
  };
}

/* ─ 티켓 브릿지 (#/ticket/bridge/:catKo) ─ */
function renderTicketBridge(app, catKo) {
  const gmap = specGroupsMap();
  const cat = ticketCatByKo(catKo);
  const catLabel = cat ? (cat.name_en || cat.name_ko) : catKo;
  uiState.ticketBridgeCat = catKo;
  const allCats = loadTicketCategories();
  const subs = cat ? allCats.filter((c) => c.parent_id === cat.id).sort((a, b) => (a.order || 0) - (b.order || 0)) : [];
  let activeSub = null;
  if (subs.length) activeSub = subs.find((s) => s.name_ko === uiState.ticketSubTab) || subs[0];
  const contentCat = activeSub || cat;
  if (!uiState.ticketCart || uiState.ticketCart.deptKey !== catKo) { uiState.ticketCart = { deptKey: catKo, items: [] }; }
  const list = loadTicketProducts().filter((p) => ticketVisibleNow(p, gmap) && p.category_1 === catKo && (activeSub ? p.category_2 === activeSub.name_ko : true));
  const heroImg = ticketCatImgFront(cat) || ticketCatImgFront(contentCat) || (list.map((p) => ticketImg(p)).find(Boolean) || "");
  const localizedC = (base) => catField(contentCat, base);
  const addr = localizedC("address") || "265, High1-gil, Gohan-eup, Jeongseon-gun, Gangwon-do, Korea";
  const heroName = escapeHtml(catLabel) + (activeSub ? " · " + escapeHtml(activeSub.name_en || activeSub.name_ko) : "");
  const subTabBar = subs.length ? `<div class="tk-subtabs">${subs.map((s) => `<button class="tk-subtab ${activeSub && activeSub.id === s.id ? "on" : ""}" data-sub="${escapeHtml(s.name_ko)}">${escapeHtml(s.name_en || s.name_ko)}</button>`).join("")}</div>` : "";
  const productRows = list.length ? list.map((p) => ticketBridgeProductRowM(p, gmap)).join("") : `<div class="tk-empty" style="padding:24px 16px">${TL("판매중인 티켓이 없습니다.", "No tickets on sale.")}</div>`;
  const { total, cnt } = ticketCartTotals(gmap);

  app.innerHTML = `
    <div class="subhead"><button class="back-btn" id="tkBack" aria-label="Back">‹</button><span class="subtitle">${escapeHtml(catLabel)}</span></div>
    <div class="detail-hero" style="background:${ticketBg(heroImg, GRAD.night)}">
      <div class="tk-hero-scrim"></div>
      <div class="hero-cap"><div class="tk-hero-eyebrow">TICKET</div><h1 class="tk-hero-name">${heroName}</h1></div>
    </div>
    ${subTabBar}
    <div class="sec-nav-wrap"><div class="sec-nav" id="tkSecNav">
      <button class="on" data-sec="overview">Overview</button>
      <button data-sec="select">Select</button>
      <button data-sec="detail">Detail</button>
      <button data-sec="guide">Guide</button>
      <button data-sec="policy">Policy</button>
      <button data-sec="loc">Location</button>
    </div></div>
    <div class="tk-bridge-body">
      <section id="tsec-overview" class="pd-sec"><h3 class="pd-sec-h">Overview</h3>
        <div class="info-desc" style="padding:0 16px">${localizedC("overview") || escapeHtml(catLabel + " — open ticket.")}</div></section>
      <section id="tsec-select" class="pd-sec"><h3 class="pd-sec-h">${TL("티켓 선택", "Select tickets")}</h3>
        <p class="tk-scope-hint">🎫 ${TL(`${escapeHtml(catLabel)} 상품만 한 장바구니에 담을 수 있어요. 수량을 올리면 바로 담깁니다.`, `Only ${escapeHtml(catLabel)} items go in one cart. Increasing quantity adds it right away.`)}</p>
        <div class="tk-sellist">${productRows}</div>
      </section>
      <section id="tsec-detail" class="pd-sec"><h3 class="pd-sec-h">Detail</h3><div class="tk-detail-html" style="padding:0 16px">${localizedC("detail_html") || `<div class="tk-empty">${TL("상세설명 없음", "No detail")}</div>`}</div></section>
      <section id="tsec-guide" class="pd-sec"><h3 class="pd-sec-h">Guide</h3><div class="tk-detail-html" style="padding:0 16px">${localizedC("guide_html") || `<div class="tk-empty">${TL("이용안내 없음", "No guide")}</div>`}</div></section>
      <section id="tsec-policy" class="pd-sec"><h3 class="pd-sec-h">${TL("취소·환불", "Cancellation")}</h3>
        <div class="info-desc" style="padding:0 16px">${TL("오픈형: 사용종료일 이전 미사용=전액환불 / 이후·사용완료=환불불가", "Open ticket: full refund if unused before the valid end date; no refund after the end date or after use.")}</div>
        <div class="tk-detail-html" style="padding:6px 16px 0">${localizedC("policy_html") || ""}</div></section>
      <section id="tsec-loc" class="pd-sec"><h3 class="pd-sec-h">Location</h3>
        <div class="tk-map" style="margin:0 16px">🗺️ ${TL("지도 (프로토타입)", "Map (prototype)")}</div>
        <p class="info-desc" style="padding:8px 16px 0">📍 ${escapeHtml(addr)}</p></section>
    </div>
    ${cnt > 0 ? `<div class="tk-cartbar">
      <button class="tk-cartbar-info" id="tkCartExpand" aria-label="${TL("장바구니 보기", "View cart")}">
        <span class="tk-cartbar-caret">⌃</span>
        <span class="tk-cartbar-txt"><span class="tk-cartbar-cnt">🧾 ${cnt} ${TL("매", cnt === 1 ? "ticket" : "tickets")}</span><span class="tk-cartbar-total">${won(total)}</span></span>
      </button>
      <button class="tk-cartbar-btn" id="tkReserve">Booking →</button>
    </div>` : ""}`;

  const rerender = () => { const y = window.scrollY; renderTicketBridge(app, catKo); window.scrollTo(0, y); };
  $("#tkBack").onclick = navBack;
  // 서브탭
  $$(".tk-subtab").forEach((b) => b.onclick = () => { uiState.ticketSubTab = b.dataset.sub; rerender(); });
  // 섹션 내비 (스크롤 이동 + active)
  $$("#tkSecNav button").forEach((b) => b.onclick = () => {
    $$("#tkSecNav button").forEach((x) => x.classList.remove("on")); b.classList.add("on");
    const el = document.getElementById("tsec-" + b.dataset.sec); if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  });
  // 수량 스테퍼 = 장바구니 직접 반영 (자동 담기)
  $$(".tk-pq").forEach((b) => b.onclick = () => {
    tkSetQty(b.dataset.pid, parseInt(b.dataset.lv, 10), parseInt(b.dataset.d, 10));
    rerender();
  });
  // 상세보기 시트
  $$(".tk-detailbtn").forEach((b) => b.onclick = (e) => { e.stopPropagation(); openTicketSheet(b.dataset.pid); });
  // 하단 바: 요약 탭 → 장바구니 시트 펼침
  const cartExpand = $("#tkCartExpand");
  if (cartExpand) cartExpand.onclick = openTicketCartSheet;
  // Booking (로그인 게이트) — 담긴 게 있을 때만 바·버튼 존재
  const reserveBtn = $("#tkReserve");
  if (reserveBtn) reserveBtn.onclick = () => {
    if (!uiState.ticketCart.items.length) { alert(TL("담긴 상품이 없습니다.", "Cart is empty.")); return; }
    if (!uiState.loggedIn) { uiState.pendingTicketCheckout = true; go("#/signin"); return; }
    go("#/ticket/checkout");
  };
}

/* ─ 체크아웃 (#/ticket/checkout) ─ */
function renderTicketCheckout(app) {
  const gmap = specGroupsMap();
  const cart = uiState.ticketCart; const items = (cart && cart.items) || [];
  if (!items.length) {
    app.innerHTML = `<div class="subhead"><button class="back-btn" id="coBack" aria-label="Back">‹</button><span class="subtitle">${TL("결제", "Checkout")}</span></div>
      <div class="stub"><div class="ic">🧾</div><h3>${TL("선택된 상품이 없습니다.", "No items selected")}</h3><p>${TL("장바구니가 비어 있습니다.", "Your cart is empty.")}</p><button class="stub-btn" id="coHome">${TL("홈으로", "Go to Main")}</button></div>`;
    $("#coBack").onclick = navBack; $("#coHome").onclick = () => go("#/"); return;
  }
  const lines = items.map((it) => {
    const p = loadTicketProducts().find((x) => x.id === it.product_id); const g = gmap.get(p.spec_coupon_id); const r = g.rows.find((x) => x.level === it.level);
    const sell = ticketLevelSell(r, getTicketMarginFront(p.spec_coupon_id));
    return { pname: p.name_en, opt: `${ticketLevelLabel(it.level, r.level_name)} · ${r.coupon_name}`, qty: it.qty, sum: sell * it.qty };
  });
  const total = lines.reduce((s, l) => s + l.sum, 0);
  const b = uiState.ticketBuyer || (uiState.ticketBuyer = { last: "Hong", first: "Gildong", email: "guest@example.com", phone: "010-1234-5678", nationality: "KR" });
  app.innerHTML = `
    <div class="subhead"><button class="back-btn" id="coBack" aria-label="Back">‹</button><span class="subtitle">${TL("결제", "Checkout")}</span></div>
    <div class="bk-wrap" style="padding-bottom:20px">
      <div class="bk-card"><h4 class="bk-h">${TL("주문 상품", "Order")} (${items.length})</h4>
        ${lines.map((l) => `<div class="bk-price-row"><span>${escapeHtml(l.pname)}<br><small style="color:var(--muted)">${escapeHtml(l.opt)} × ${l.qty}</small></span><span>${won(l.sum)}</span></div>`).join("")}
        <div class="bk-total"><span>TOTAL</span><span>${won(total)}</span></div></div>
      <div class="bk-card"><h4 class="bk-h">${TL("구매자 정보", "Buyer")}</h4>
        <div class="field-row"><div class="field col"><label>${TL("성(Last)", "Last name")}</label><input id="co_last" value="${escapeHtml(b.last)}"></div><div class="field col"><label>${TL("이름(First)", "First name")}</label><input id="co_first" value="${escapeHtml(b.first)}"></div></div>
        <div class="field"><label>${TL("이메일", "Email")} <span class="req">*</span></label><input id="co_email" value="${escapeHtml(b.email)}"></div>
        <div class="field"><label>${TL("전화", "Phone")}</label><input id="co_phone" value="${escapeHtml(b.phone)}"></div>
        <div class="field"><label>${TL("국적", "Nationality")}</label><input id="co_nat" value="${escapeHtml(b.nationality)}"></div>
      </div>
      <div class="bk-card"><h4 class="bk-h">${TL("결제수단", "Payment")}</h4><label class="agree" style="margin:0"><input type="radio" checked> <span>${TL("신용카드 (목업)", "Credit card (mock)")}</span></label></div>
      <div class="bk-card"><h4 class="bk-h">${TL("취소·환불", "Cancellation")}</h4><p class="bk-cxl">${TL("오픈형: 사용종료일 이전 미사용=전액환불 / 이후·사용완료=환불불가", "Open ticket — full refund if unused before the valid end date; no refund after use.")}</p></div>
    </div>
    <div class="done-foot"><button class="btn-solid" id="coPay">${TL("결제하기", "Pay")} ${won(total)} →</button></div>`;
  $("#coBack").onclick = navBack;
  $("#coPay").onclick = () => {
    ["last", "first", "email", "phone", "nationality"].forEach((k, i) => { b[k] = $("#" + ["co_last", "co_first", "co_email", "co_phone", "co_nat"][i]).value; });
    if (!b.email.trim()) { alert(TL("이메일을 입력하세요.", "Enter email.")); return; }
    $("#app").innerHTML = `<div class="loading"><div class="spinner"></div></div>`;
    setTimeout(() => { const res = createTicketOrder(items, b); uiState.ticketCart = null; uiState.ticketLastOrder = res; goReplace("#/ticket/done"); }, 800);
  };
}

/* ─ 주문완료 (#/ticket/done) ─ */
function renderTicketDone(app) {
  const res = uiState.ticketLastOrder;
  if (!res) { go("#/"); return; }
  const { order, issued } = res;
  const rows = issued.map((c) => `<div class="tk-coupon"><div class="tk-coupon-no">${escapeHtml(c.coupon_no)}</div><div class="tk-coupon-meta"><span>${escapeHtml(c.coupon_name)}</span><strong>${won(c.sell)}</strong></div><div class="tk-coupon-valid">🗓 ${TL("사용기간", "Valid")} ${escapeHtml(c.use_start_date)} ~ ${escapeHtml(c.use_end_date)}</div></div>`).join("");
  app.innerHTML = `
    <div class="bk-wrap" style="padding-bottom:20px">
      <div class="done-badge">● PAID</div>
      <h2 class="done-title">${TL("예약이 완료되었습니다", "Reservation complete")}</h2>
      <p class="done-sub">${TL("쿠폰이 발급되었습니다. 현장에서 12자리 바코드를 제시하세요.", "Your coupons have been issued. Show the 12-digit barcode on-site.")}</p>
      <div class="done-num"><div class="k">ORDER NUMBER</div><div class="v">${escapeHtml(order.order_no)}</div></div>
      <div class="bk-card"><h4 class="bk-h">${TL("결제", "Payment")}</h4>
        <div class="bk-price-row"><span>${TL("결제금액", "Total paid")}</span><span>${won(order.total)}</span></div>
        <div class="bk-price-row"><span>${TL("결제수단", "Method")}</span><span>${TL("신용카드 (목업)", "Credit card (mock)")}</span></div></div>
      <h4 class="bk-h" style="margin:18px 4px 8px">${TL("발급된 쿠폰", "Issued coupons")} (${issued.length})</h4>
      <div class="tk-coupons">${rows}</div>
      <p class="info-desc" style="padding:10px 4px 0;font-size:12px;color:var(--muted)">${TL("발급 쿠폰은 어드민 예약·발급현황(S15/S16)에서 조회됩니다.", "Coupons appear in admin S15/S16 and are used on-site.")}</p>
    </div>
    <div class="done-foot"><button class="btn-solid" id="dnHome">${TL("홈으로", "Go to Main")} →</button><button class="btn-line" id="dnMy">${TL("예약내역", "My Bookings")} →</button></div>`;
  $("#dnHome").onclick = () => go("#/");
  $("#dnMy").onclick = () => go("#/mybookings");
}

/* ─ 티켓 검색결과 (#/ticket/search) — 숙소 검색결과와 동일 패턴(요약바+Filters 시트+세로 카드) ─ */
const TK_FILTER_SVG = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M3 5h18M6 12h12M10 19h4"/></svg>`;
function ticketSearchList(gmap) {
  const f = uiState.ticketSearchFilter || (uiState.ticketSearchFilter = { order: "low", cats: [] });
  const date = uiState.ticketUseDate || todayKstYmd();
  let list = loadTicketProducts().filter((p) => ticketVisibleNow(p, gmap) && ticketUsableOn(p, gmap, date)); // 판매중 + 선택 사용일 사용가능
  if (f.cats.length) list = list.filter((p) => f.cats.includes(p.category_1));
  const withMin = list.map((p) => ({ p, min: ticketMinPrice(p, gmap) }));
  withMin.sort((a, b) => (f.order === "high" ? b.min - a.min : a.min - b.min));
  return withMin;
}
function ticketResCardHtml(p, gmap) {
  const g = gmap.get(p.spec_coupon_id); const rows = g ? g.rows : [];
  const margin = getTicketMarginFront(p.spec_coupon_id);
  const img = ticketImg(p);
  const cat = ticketCatByKo(p.category_1) || {};
  const catLabel = (cat.name_en || p.category_1) + (p.category_2 ? " › " + p.category_2 : "");
  const useP = rows.length ? `${rows[0].use_start_date} ~ ${rows[0].use_end_date}` : "-";
  const min = ticketMinPrice(p, gmap);
  const optLines = rows.map((r) => `<div class="row"><span class="ic">👤</span><span>${ticketLevelLabel(r.level, r.level_name)} ${won(ticketLevelSell(r, margin))}</span></div>`).join("");
  return `
    <article class="res-card tk-res-card" data-pid="${escapeHtml(p.id)}" data-cat="${escapeHtml(p.category_1)}" data-sub="${escapeHtml(p.category_2 || "")}">
      <div class="tk-res-img" style="background:${ticketBg(img)}"><span class="tk-res-badge">${TL("오픈형", "Open")}</span></div>
      <div class="res-body">
        <div class="rc-top"><span class="rc-place">${escapeHtml(catLabel)}</span><button class="rc-info-link" data-tkdetail="${escapeHtml(p.id)}">Details ›</button></div>
        <h4 class="res-name">${escapeHtml(p.name_en)}</h4>
        <div class="rc-meta">
          <div class="row"><span class="ic">🗓</span><span>${TL("사용기간", "Valid")} ${escapeHtml(useP)}</span></div>
          ${optLines}
        </div>
        <div class="res-cancel"><span class="ic">ⓘ</span><span>${TL("사용종료일 이전 무료취소", "Free cancel before valid end date")}</span></div>
        <div class="price-bar" data-tkgo="${escapeHtml(p.id)}"><span class="pb-price">${TL("최저 ", "from ")}${won(min)}</span><span class="pb-book">${TL("선택", "Select")} →</span></div>
      </div>
    </article>`;
}
function renderTicketSearch(app) {
  const gmap = specGroupsMap();
  if (!uiState.ticketUseDate) uiState.ticketUseDate = todayKstYmd();
  const date = uiState.ticketUseDate;
  const rows = ticketSearchList(gmap);
  const f = uiState.ticketSearchFilter;
  const cards = rows.map((x) => ticketResCardHtml(x.p, gmap)).join("");
  const emptyMsg = `<div class="stub"><div class="ic">🎫</div><h3>${TL("사용 가능한 티켓 없음", "No tickets usable")}</h3><p>${TL(date + " 에 사용 가능한 판매중 티켓이 없습니다. 사용일을 바꿔보세요.", "No on-sale tickets are usable on " + date + ". Try another date.")}</p><button class="stub-btn" id="tsEmptyEdit">${TL("사용일 변경", "Change date")}</button></div>`;
  app.innerHTML = `
    <div class="subhead"><button class="back-btn" id="tsBack" aria-label="Back">‹</button><span class="subtitle">${TL("티켓 검색결과", "Ticket Search Result")}</span></div>
    <div class="res-topbar">
      <span class="res-top-ico">${ICO.search}</span>
      <div class="res-top-txt"><div class="l1">${TL("사용일", "Usage date")} ${escapeHtml(date)}</div><div class="l2">${TL("그날 사용 가능한 판매중 티켓", "On-sale tickets usable that day")}${f.cats.length ? " · " + f.cats.length + " " + TL("카테고리", "cats") : ""}</div></div>
      <button class="res-edit-btn" id="tsEdit">Edit</button>
    </div>
    <div class="res-controls">
      <span class="cnt">${rows.length} ${TL("개", rows.length === 1 ? "ticket" : "tickets")}</span>
      <button class="filters-btn" id="tsFilters">${TK_FILTER_SVG} Filters</button>
    </div>
    <div class="res-list">${cards || emptyMsg}</div>`;

  $("#tsBack").onclick = navBack;
  $("#tsEdit").onclick = openSearchSheet;
  const emptyEdit = $("#tsEmptyEdit"); if (emptyEdit) emptyEdit.onclick = openSearchSheet;
  $("#tsFilters").onclick = openTicketFilterSheet;
  const gotoBridge = (card) => { const cat = card.dataset.cat, sub = card.dataset.sub; if (sub) uiState.ticketSubTab = sub; go("#/ticket/bridge/" + encodeURIComponent(cat)); };
  $$(".tk-res-card [data-tkdetail]").forEach((b) => b.onclick = (e) => { e.stopPropagation(); openTicketSheet(b.dataset.tkdetail); });
  $$(".tk-res-card [data-tkgo]").forEach((b) => b.onclick = (e) => { e.stopPropagation(); gotoBridge(b.closest(".tk-res-card")); });
  $$(".tk-res-card").forEach((c) => c.addEventListener("click", () => gotoBridge(c)));
}

/* 티켓 필터 바텀시트 (숙소 필터와 동일 #filterScope 재사용) */
function openTicketFilterSheet() {
  renderTicketFilterBody();
  $("#filterScope").classList.add("open");
  $("#filterSheet").setAttribute("aria-hidden", "false");
  lockBg();
}
function renderTicketFilterBody() {
  const f = uiState.ticketSearchFilter || (uiState.ticketSearchFilter = { order: "low", cats: [] });
  const cats = ticketTopCats();
  const orderRow = (v, label) => `<div class="opt-row ${f.order === v ? "on" : ""}" data-torder="${v}"><span class="dot"></span><span>${label}</span></div>`;
  const catRow = (name, label, checked) => `<div class="opt-row ${checked ? "on" : ""}" data-tcat="${escapeHtml(name)}"><span class="box">${checked ? "✓" : ""}</span><span>${escapeHtml(label)}</span></div>`;
  const rowsHtml = catRow("__all", TL("전체", "All"), f.cats.length === 0) + cats.map((c) => catRow(c.name_ko, c.name_en || c.name_ko, f.cats.includes(c.name_ko))).join("");
  const gmap = specGroupsMap();
  let cnt = loadTicketProducts().filter((p) => ticketVisibleNow(p, gmap)); if (f.cats.length) cnt = cnt.filter((p) => f.cats.includes(p.category_1)); cnt = cnt.length;
  $("#filterBody").innerHTML = `
    <div class="sheet-head"><div><div class="sh-eyebrow">Filters</div><div class="sh-title">${TL("티켓 필터", "Refine tickets")}</div></div><button class="sheet-close" id="tfClose">✕</button></div>
    <div class="filter-sec"><div class="f-title">${TL("정렬", "Order")}</div>${orderRow("low", TL("낮은 가격순", "Low cost"))}${orderRow("high", TL("높은 가격순", "High cost"))}</div>
    <div class="filter-sec"><div class="f-title">${TL("카테고리", "Category")}</div>${rowsHtml}</div>
    <div class="filter-actions"><button class="filter-reset" id="tfReset">${TL("초기화", "Reset")}</button><button class="filter-apply" id="tfApply">${TL("적용", "Show")} ${cnt} ${TL("개", "tickets")}</button></div>`;
  const refresh = () => renderTicketFilterBody();
  $("#tfClose").onclick = closeFilterSheet;
  $$("#filterBody [data-torder]").forEach((el) => el.onclick = () => { f.order = el.dataset.torder; refresh(); });
  $$("#filterBody [data-tcat]").forEach((el) => el.onclick = () => {
    const name = el.dataset.tcat;
    if (name === "__all") { f.cats = []; }
    else { const i = f.cats.indexOf(name); if (i >= 0) f.cats.splice(i, 1); else f.cats.push(name); }
    refresh();
  });
  $("#tfReset").onclick = () => { uiState.ticketSearchFilter = { order: "low", cats: [] }; refresh(); };
  $("#tfApply").onclick = () => { closeFilterSheet(); renderTicketSearch($("#app")); };
}

/* ════════════ 마이페이지 — 티켓 주문(예약내역) · 바코드 · 수량단위 부분취소 ════════════ */
/* 토스트 (하단 중앙, 2초) */
function mbToast(msg) {
  const old = document.getElementById("mbToast"); if (old) old.remove();
  const t = document.createElement("div"); t.id = "mbToast"; t.className = "mb-toast"; t.textContent = msg;
  (document.getElementById("device") || document.body).appendChild(t);
  requestAnimationFrame(() => t.classList.add("show"));
  clearTimeout(window._mbToastT);
  window._mbToastT = setTimeout(() => { t.classList.remove("show"); setTimeout(() => t.remove(), 300); }, 2000);
}
/* 국적 → {ko,en,dial} */
const NAT_M = { KR: { ko: "대한민국", en: "Korea", dial: "+82" }, CN: { ko: "중국", en: "China", dial: "+86" }, JP: { ko: "일본", en: "Japan", dial: "+81" }, US: { ko: "미국", en: "USA", dial: "+1" }, TW: { ko: "대만", en: "Taiwan", dial: "+886" }, HK: { ko: "홍콩", en: "Hong Kong", dial: "+852" }, SG: { ko: "싱가포르", en: "Singapore", dial: "+65" }, TH: { ko: "태국", en: "Thailand", dial: "+66" }, VN: { ko: "베트남", en: "Vietnam", dial: "+84" }, MY: { ko: "말레이시아", en: "Malaysia", dial: "+60" }, ID: { ko: "인도네시아", en: "Indonesia", dial: "+62" }, PH: { ko: "필리핀", en: "Philippines", dial: "+63" } };
function natInfoM(v) { if (!v) return null; const k = String(v).trim().toUpperCase(); if (NAT_M[k]) return NAT_M[k]; return Object.values(NAT_M).find((n) => n.ko === v || n.en.toLowerCase() === String(v).toLowerCase()) || null; }
/* 티켓 주문 썸네일 — 대표상품 → 카테고리 히어로(S17) → No Image */
function ticketResvImageM(o) { const pid = (o.items && o.items[0] && o.items[0].product_id) || ""; const p = loadTicketProducts().find((x) => x.id === pid); let img = p ? ticketImg(p) : ""; if (!img && p) img = ticketCatImgFront(ticketCatByKo(p.category_1)); return img || ""; }
function fmtDateShort(iso) { return (iso || "").slice(0, 10); }
function fmtDateTimeM(iso) { if (!iso) return ""; const d = new Date(iso); if (isNaN(d.getTime())) return String(iso).slice(0, 16).replace("T", " "); const p = (n) => String(n).padStart(2, "0"); return `${String(d.getFullYear()).slice(2)}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`; }
/* 티켓 주문 → 마이페이지 아이템 (탭 분류: 취소쿠폰 제외 후 '사용 가능한 미사용 잔여' 기준) */
function mbTicketItems() {
  const today = todayKstYmd();
  const coupons = loadTicketCoupons();
  return loadTicketOrders().map((o) => {
    const ocs = coupons.filter((c) => c.order_no === o.order_no);
    const active = ocs.filter((c) => c.status !== "CANCELLED");
    const allCancelled = ocs.length > 0 && active.length === 0;
    const usable = active.some((c) => c.status === "SOLD" && (!c.use_end_date || c.use_end_date >= today));
    const tab = allCancelled ? "cancelled" : (usable ? "upcoming" : "past");
    return { kind: "ticket", o, ocs, tab };
  }).sort((a, b) => (b.o.created_at || "").localeCompare(a.o.created_at || ""));
}
function mbTicketBadge(o, ocs) {
  if (o.status === "취소완료") return `<span class="badge-cancelled">● CANCELLED</span>`;
  if (o.status === "부분취소") return `<span class="badge-part">● PARTLY CANCELLED</span>`;
  const active = ocs.filter((c) => c.status !== "CANCELLED");
  if (active.length > 0 && active.every((c) => c.status === "USED")) return `<span class="badge-past">● COMPLETED</span>`;
  return `<span class="badge-confirmed">● CONFIRMED</span>`;
}
/* 목록 카드 — 대표상품 +N more · 총 N매 · 썸네일. 유효기간·금액은 목록 미표시(상세에서 확인) */
function mbTicketCardHtml(it) {
  const o = it.o, ocs = it.ocs;
  const first = (o.items && o.items[0]) || {};
  const nMore = (o.items ? o.items.length : 0) - 1;
  const more = nMore > 0 ? ` +${nMore} more` : "";
  const img = ticketResvImageM(o);
  return `<div class="mb-card">
    <div class="mb-crow">${mbTicketBadge(o, ocs)}<a class="mb-details" data-torder="${escapeHtml(o.order_no)}" href="javascript:void(0)">Details ›</a></div>
    <div class="mb-bno">Order no. <b>${escapeHtml(o.order_no)}</b> · ${escapeHtml(fmtDateShort(o.created_at))}</div>
    <div class="mb-main">
      <div class="mb-thumb" style="background:${GRAD.snow}">${img ? `<img src="${escapeHtml(img)}" alt="" loading="lazy">` : ""}</div>
      <div class="mb-minfo">
        <span class="rc-place">🎫 Ticket</span>
        <h4 class="res-name">${escapeHtml((first.product_name || "Ticket order") + more)}</h4>
        <div class="mb-tk-cnt">Total ${ocs.length} ticket${ocs.length !== 1 ? "s" : ""}</div>
      </div>
    </div>
  </div>`;
}

/* 티켓 주문 상세 (#/ticket-order/:orderNo) — 상태탭 + [바코드 보기] + 결제내역 + 부분취소 */
function renderMyTicketOrder(app, orderNo) {
  const o = loadTicketOrders().find((x) => x.order_no === orderNo);
  if (!o) { location.hash = "#/mybookings"; return; }
  const ocs = loadTicketCoupons().filter((c) => c.order_no === o.order_no);
  const today = todayKstYmd();
  const cpLabel = (s) => ({ SOLD: "Unused", USED: "Used", CANCELLED: "Cancelled" }[s] || s);
  const allCancelled = ocs.length > 0 && ocs.every((c) => c.status === "CANCELLED");
  const anyCancelled = ocs.some((c) => c.status === "CANCELLED");
  const badge = allCancelled ? `<span class="badge-cancelled">● CANCELLED</span>` : (anyCancelled ? `<span class="badge-part">● PARTLY CANCELLED</span>` : `<span class="badge-confirmed">● CONFIRMED</span>`);

  // 상태 탭 (미사용 기본 / 사용완료 / 취소)
  const byStatus = { SOLD: [], USED: [], CANCELLED: [] };
  ocs.forEach((c) => { (byStatus[c.status] || (byStatus[c.status] = [])).push(c); });
  let tab = uiState.mbTicketTab; if (!["SOLD", "USED", "CANCELLED"].includes(tab)) tab = "SOLD";
  const TABDEF = [["SOLD", "Unused"], ["USED", "Used"], ["CANCELLED", "Cancelled"]];
  const tabsHtml = TABDEF.map(([k, l]) => `<button class="tkd-tab ${tab === k ? "on" : ""}" data-tkt="${k}">${l} <span class="tkd-tab-n">${(byStatus[k] || []).length}</span></button>`).join("");
  const isUnused = tab === "SOLD";
  const list = byStatus[tab] || [];

  // 활성 탭 쿠폰 → 상품(권종)별 그룹. 미사용=바코드보기 / 사용완료·취소=쿠폰번호만
  let groups;
  if (!list.length) { groups = `<div class="mb-cp-empty">No coupons in this status.</div>`; }
  else {
    const pOrder = []; const byP = new Map();
    list.forEach((c) => { if (!byP.has(c.product_id)) { byP.set(c.product_id, []); pOrder.push(c.product_id); } byP.get(c.product_id).push(c); });
    groups = pOrder.map((pid) => {
      const cs = byP.get(pid).slice().sort((a, b) => (a.level - b.level) || (a.coupon_no || "").localeCompare(b.coupon_no || ""));
      const rows = cs.map((c) => {
        const info = `<div class="mb-cp-nm">${escapeHtml(ticketLevelLabel(c.level, c.level_name))} · ${escapeHtml(c.coupon_name || "")}</div>
          <div class="mb-cp-sub"><span class="mb-cp-no">${escapeHtml(c.coupon_no)}</span> · 🗓 ${escapeHtml(c.use_start_date || "")}~${escapeHtml(c.use_end_date || "")}${c.status === "USED" && c.used_at ? ` · Used ${escapeHtml(fmtDateTimeM(c.used_at))}` : ""}</div>`;
        const action = isUnused
          ? `<button class="mb-bc-btn" data-bc="${escapeHtml(c.coupon_no)}" data-pid="${escapeHtml(c.product_id)}">Barcode</button>`
          : `<span class="mb-cp-st st-${c.status}">${cpLabel(c.status)}</span>`;
        return `<div class="mb-cp2"><div class="mb-cp-info">${info}</div>${action}</div>`;
      }).join("");
      return `<div class="mb-cpg"><div class="mb-cpg-h">${escapeHtml(cs[0].product_name || "")} <span>${cs.length} ea</span></div>${rows}</div>`;
    }).join("");
  }
  const canCancelNow = isUnused && list.some((c) => c.use_end_date && today <= c.use_end_date);

  // 구매자
  const buyer = o.buyer || {}; const nat = natInfoM(buyer.nationality);
  const country = nat ? (uiState.lang === "en" ? nat.en : nat.ko) : (buyer.nationality || "-");
  const rawPhone = (buyer.phone || "").trim();
  const phone = !rawPhone ? "-" : (rawPhone.startsWith("+") ? rawPhone : (nat ? `${nat.dial} ${rawPhone.replace(/^0/, "")}` : rawPhone));

  // 결제 내역 (상품별 성인/아동)
  const payOrder = []; const payMap = new Map();
  ocs.forEach((c) => { if (!payMap.has(c.product_id)) { payMap.set(c.product_id, { name: c.product_name, adult: 0, child: 0, amount: 0 }); payOrder.push(c.product_id); } const g = payMap.get(c.product_id); if (c.level === 2) g.child++; else g.adult++; g.amount += (c.sell || 0); });
  const payRows = payOrder.map((pid) => { const g = payMap.get(pid); const parts = []; if (g.adult) parts.push(`Adult ${g.adult}`); if (g.child) parts.push(`Child ${g.child}`); return `<div class="mb-pay-row"><div class="mb-pay-l"><span class="mb-pay-nm">${escapeHtml(g.name || "")}</span><span class="mb-pay-cnt">${parts.join(" · ")}</span></div><div class="mb-pay-amt">${won(g.amount)}</div></div>`; }).join("");
  const gross = ocs.reduce((s, c) => s + (c.sell || 0), 0);
  const refunded = o.refund_amount || 0;

  app.innerHTML = `
    <div class="subhead"><button class="back-btn" id="toBack" aria-label="Back">‹</button><span class="subtitle">Ticket Order</span></div>
    <div class="bk-wrap" style="padding-bottom:24px">
      <div class="bk-card"><div style="margin-bottom:10px">${badge}</div>
        <div class="mb-bno" style="padding:0">Order no. <b>${escapeHtml(o.order_no)}</b><br/>Ordered ${escapeHtml(fmtDateShort(o.created_at))}</div></div>
      <div class="bk-card"><h4 class="bk-h">Buyer</h4>
        <div class="mb-krow"><span class="k">NAME</span><span class="v">${escapeHtml(buyer.name || "-")}</span></div>
        <div class="mb-krow"><span class="k">COUNTRY</span><span class="v">${escapeHtml(country)}</span></div>
        <div class="mb-krow"><span class="k">EMAIL</span><span class="v">${escapeHtml(buyer.email || "")}</span></div>
        <div class="mb-krow"><span class="k">PHONE</span><span class="v">${escapeHtml(phone)}</span></div></div>
      <div class="bk-card">
        <h4 class="bk-h">Coupons <span style="color:var(--muted);font-weight:600;font-size:14px">(${ocs.length})</span></h4>
        <div class="tkd-tabs">${tabsHtml}</div>
        ${groups}
        ${isUnused && list.length ? `<p class="mb-cp-guide" style="margin:10px 0 0">Tap ‘Barcode’ to scan at the on-site POS/KIOSK. One coupon = one person, one venue.</p>` : ""}
      </div>
      <div class="bk-card"><h4 class="bk-h">Payment</h4>
        ${payRows}
        <div class="mb-pay-sep"></div>
        <div class="mb-pay-row mb-pay-total"><div class="mb-pay-l"><span class="mb-pay-nm">Total paid</span></div><div class="mb-pay-amt">${won(gross)}</div></div>
        ${refunded ? `<div class="mb-pay-row mb-pay-refund"><div class="mb-pay-l"><span class="mb-pay-nm">Refunded</span></div><div class="mb-pay-amt">−${won(refunded)}</div></div>
        <div class="mb-pay-row mb-pay-net"><div class="mb-pay-l"><span class="mb-pay-nm">Net paid</span></div><div class="mb-pay-amt">${won(gross - refunded)}</div></div>` : ""}
        <div class="mb-pay-method">Method · Credit card (mock)</div></div>
      <div class="bk-card"><h4 class="bk-h">Customer center</h4><p class="bk-cxl">High1 Global · 1588-7789 · help@high1global.com</p></div>
      <div class="bk-card"><h4 class="bk-h">Cancellation policy</h4>
        <p class="bk-cxl">Open ticket — unused coupons can be partially cancelled by product & quantity before the valid end date (full refund). Used/expired are non-refundable.</p></div>
    </div>
    ${canCancelNow ? `<div class="done-foot"><button class="btn-solid" id="toCancel" style="background:#e11d48">Cancel tickets</button></div>` : ""}`;
  $("#toBack").onclick = navBack;
  app.querySelectorAll(".tkd-tab").forEach((b) => b.onclick = () => { uiState.mbTicketTab = b.dataset.tkt; renderMyTicketOrder(app, orderNo); });
  app.querySelectorAll(".mb-bc-btn").forEach((b) => b.onclick = () => openMbTicketBarcode(orderNo, b.dataset.bc, b.dataset.pid));
  const cb = $("#toCancel"); if (cb) cb.onclick = () => openMbTicketCancel(orderNo);
}

/* 바코드 중앙 팝업 (PC 동일) — 캐러셀(모달 1회 생성, transform 이동=깜빡임 없음) + 스와이프 + 사용처리 토스트
 * productId: 지정 시 해당 상품(권종) 쿠폰만 스코프(스키리프트/장비렌탈 등 장소별 오사용 방지) */
function openMbTicketBarcode(orderNo, focusNo, productId) {
  const scope = (c) => c.order_no === orderNo && c.status === "SOLD" && (!productId || c.product_id === productId);
  const list0 = loadTicketCoupons().filter(scope);
  if (!list0.length) { mbToast("No unused coupons."); return; }
  let root = document.getElementById("mbBcRoot");
  if (!root) { root = document.createElement("div"); root.id = "mbBcRoot"; (document.getElementById("device") || document.body).appendChild(root); lockBg(); }
  let idx = Math.max(0, list0.findIndex((c) => c.coupon_no === focusNo));
  let cur = [];
  const onMove = (e) => { if (drag) move(e.clientX); };
  const onUp = (e) => { if (drag) end(e.clientX); };
  const close = () => {
    window.removeEventListener("mousemove", onMove); window.removeEventListener("mouseup", onUp);
    root.remove(); unlockBg(); renderMyTicketOrder($("#app"), orderNo);
  };

  // 모달 뼈대 1회 생성 (진입 애니메이션도 1회만)
  root.innerHTML = `<div class="mb-bcm-back"></div><div class="mb-bcm" role="dialog" aria-modal="true">
    <button class="mb-bcm-x" aria-label="Close">✕</button>
    <div class="mb-bcm-vp"><div class="mb-bcm-track"></div></div>
    <div class="mb-bcm-nav">
      <button class="mb-bcm-arw" data-d="-1">‹</button>
      <span class="mb-bcm-cnt"></span>
      <button class="mb-bcm-arw" data-d="1">›</button>
    </div>
    <button class="mb-bcm-use">현장 사용 처리 (데모)</button>
    <p class="mb-bcm-guide">현장 POS/KIOSK에서 바코드를 스캔하세요. 쿠폰 1장 = 1인 1영업장. (좌우로 스와이프)</p>
  </div>`;
  const vp = root.querySelector(".mb-bcm-vp");
  const track = root.querySelector(".mb-bcm-track");
  const cntEl = root.querySelector(".mb-bcm-cnt");
  const useBtn = root.querySelector(".mb-bcm-use");
  const arws = root.querySelectorAll(".mb-bcm-arw");
  root.querySelector(".mb-bcm-back").onclick = close;
  root.querySelector(".mb-bcm-x").onclick = close;

  function slideW() { return 100 / (cur.length || 1); }
  function apply(animate) {
    track.style.transition = animate ? "transform .3s cubic-bezier(.22,.61,.36,1)" : "none";
    track.style.transform = `translateX(-${idx * slideW()}%)`;
    cntEl.textContent = `${idx + 1} / ${cur.length}`;
    arws[0].disabled = idx <= 0; arws[1].disabled = idx >= cur.length - 1;
    useBtn.dataset.use = cur[idx] ? cur[idx].coupon_no : "";
  }
  function goTo(i, animate) { idx = Math.max(0, Math.min(cur.length - 1, i)); apply(animate !== false); }
  function buildTrack() {
    cur = loadTicketCoupons().filter(scope);
    if (!cur.length) { close(); return; }
    if (idx >= cur.length) idx = cur.length - 1; if (idx < 0) idx = 0;
    track.style.width = (cur.length * 100) + "%";
    track.innerHTML = cur.map((c) => `<div class="mb-bcm-slide" style="width:${slideW()}%">
        <div class="mb-bcm-hd">
          <div class="mb-bcm-prod">${escapeHtml(c.product_name || "")}</div>
          <div class="mb-bcm-lvrow"><span class="mb-bcm-lvpill ${c.level === 2 ? "child" : "adult"}">${escapeHtml(ticketLevelLabel(c.level, c.level_name))}</span><span class="mb-bcm-cpn">${escapeHtml(c.coupon_name || "")}</span></div>
        </div>
        <div class="mb-bcm-code"><svg class="js-bc" data-code="${escapeHtml(c.coupon_no)}"></svg><div class="mb-bcm-no">${escapeHtml(c.coupon_no)}</div></div>
        <div class="mb-bcm-vl">🗓 ${escapeHtml(c.use_start_date || "")} ~ ${escapeHtml(c.use_end_date || "")}</div>
      </div>`).join("");
    if (window.JsBarcode) track.querySelectorAll(".js-bc").forEach((el) => { try { JsBarcode(el, el.dataset.code, { format: "CODE128", width: 2.2, height: 84, displayValue: false, margin: 0 }); } catch (e) {} });
    apply(false);
  }

  arws[0].onclick = () => goTo(idx - 1, true);
  arws[1].onclick = () => goTo(idx + 1, true);
  useBtn.onclick = () => {
    const no = useBtn.dataset.use; if (!no) return;
    const all = loadTicketCoupons(); const t = all.find((x) => x.coupon_no === no);
    if (t) { t.status = "USED"; t.used_at = new Date().toISOString(); saveTicketCoupons(all); }
    mbToast("사용 처리되었습니다.");
    buildTrack(); // 목록만 갱신(모달 유지 → 깜빡임 없음)
  };

  // 드래그/스와이프 — 손가락 따라 이동, 놓으면 스냅(부드럽게)
  var drag = false; let sx = 0, w = 0;
  function start(x) { drag = true; sx = x; w = vp.getBoundingClientRect().width || 1; track.style.transition = "none"; }
  function move(x) { if (!drag) return; const dxPct = ((x - sx) / w) * slideW(); track.style.transform = `translateX(-${idx * slideW() - dxPct}%)`; }
  function end(x) { if (!drag) return; drag = false; const dx = x - sx; if (Math.abs(dx) > w * 0.15) goTo(idx + (dx < 0 ? 1 : -1), true); else apply(true); }
  vp.addEventListener("touchstart", (e) => start(e.changedTouches[0].clientX), { passive: true });
  vp.addEventListener("touchmove", (e) => move(e.changedTouches[0].clientX), { passive: true });
  vp.addEventListener("touchend", (e) => end(e.changedTouches[0].clientX), { passive: true });
  vp.addEventListener("mousedown", (e) => { start(e.clientX); e.preventDefault(); });
  window.addEventListener("mousemove", onMove); window.addEventListener("mouseup", onUp);

  buildTrack();
}

/* 수량단위 부분취소 바텀시트 (모바일) */
function openMbTicketCancel(orderNo) { uiState.mbCancel = { open: true, orderNo, sel: {} }; renderMbTicketCancel(); }
function closeMbTicketCancel() { if (uiState.mbCancel) uiState.mbCancel.open = false; renderMbTicketCancel(); }
function renderMbTicketCancel() {
  let root = document.getElementById("mbCancelRoot");
  const st = uiState.mbCancel || { open: false };
  if (!st.open) { if (root) { root.remove(); unlockBg(); } return; }
  const today = todayKstYmd();
  const cs = loadTicketCoupons().filter((c) => c.order_no === st.orderNo && c.status === "SOLD" && c.use_end_date && today <= c.use_end_date);
  if (!cs.length) { uiState.mbCancel.open = false; if (root) { root.remove(); unlockBg(); } return; }
  const keyOf = (c) => c.product_id + "|" + c.level;
  const order = []; const map = new Map();
  cs.forEach((c) => { const k = keyOf(c); if (!map.has(k)) { map.set(k, { product_id: c.product_id, product_name: c.product_name, level: c.level, level_name: c.level_name, unit: c.sell, max: 0 }); order.push(k); } map.get(k).max++; });
  const lines = order.map((k) => map.get(k));
  const sel = st.sel;
  lines.forEach((l) => { const k = keyOf(l); if (sel[k] == null) sel[k] = 0; });
  const lineByKey = (k) => lines.find((l) => keyOf(l) === k);
  if (!root) { root = document.createElement("div"); root.id = "mbCancelRoot"; (document.getElementById("device") || document.body).appendChild(root); lockBg(); }
  const pOrder = []; const pMap = new Map();
  lines.forEach((l) => { if (!pMap.has(l.product_id)) { pMap.set(l.product_id, []); pOrder.push(l.product_id); } pMap.get(l.product_id).push(l); });
  let refund = 0, cnt = 0; Object.keys(sel).forEach((k) => { const l = lineByKey(k); if (l) { refund += sel[k] * l.unit; cnt += sel[k]; } });
  const rowHtml = (l) => { const k = keyOf(l); const q = sel[k] || 0; return `<div class="tcx-line" data-key="${k}">
      <div class="tcx-l"><span class="tcx-lv">${ticketLevelLabel(l.level, l.level_name)}</span><span class="tcx-unit">${won(l.unit)} · unused ${l.max}</span></div>
      <div class="stepper tcx-step"><button class="dec tcx-q" data-d="-1" ${q <= 0 ? "disabled" : ""}>−</button><span class="num">${q}</span><button class="inc tcx-q" data-d="1" ${q >= l.max ? "disabled" : ""}>+</button></div>
    </div>`; };
  const body = pOrder.map((pid) => `<div class="tcx-group"><div class="tcx-gname">${escapeHtml(pMap.get(pid)[0].product_name || "")}</div>${pMap.get(pid).map(rowHtml).join("")}</div>`).join("");
  root.innerHTML = `<div class="tk-sheet-backdrop"></div><div class="tk-sheet tk-cart-sheet" role="dialog" aria-modal="true">
    <div class="tk-sheet-grab"></div>
    <div class="tk-sheet-head"><div><div class="tk-sheet-cat">Cancel</div><div class="tk-sheet-title">취소할 티켓 선택</div></div><button class="tk-sheet-close" aria-label="Close">✕</button></div>
    <div class="tk-sheet-body tk-cart-sheet-body">
      <p class="mb-cp-guide" style="padding:0 2px 8px">미사용 쿠폰만 수량 단위로 취소합니다. 취소 후 되돌릴 수 없습니다.</p>
      ${body}
    </div>
    <div class="tk-cart-sheet-foot">
      <div class="tk-cart-sheet-total"><span>Estimated refund</span><strong id="tcxRefund">${won(refund)}</strong></div>
      <button class="tk-cart-sheet-book" id="tcxOk" ${cnt <= 0 ? "disabled" : ""} style="background:#e11d48">Cancel selected</button>
    </div>`;
  root.querySelector(".tk-sheet-backdrop").onclick = closeMbTicketCancel;
  root.querySelector(".tk-sheet-close").onclick = closeMbTicketCancel;
  // 스테퍼: 전체 재렌더 없이 숫자·환불액만 갱신(시트 깜빡임 방지)
  const refreshCancelUI = () => {
    let rf = 0, cn = 0; Object.keys(sel).forEach((kk) => { const ll = lineByKey(kk); if (ll) { rf += sel[kk] * ll.unit; cn += sel[kk]; } });
    const rEl = root.querySelector("#tcxRefund"); if (rEl) rEl.textContent = won(rf);
    const ok = root.querySelector("#tcxOk"); if (ok) ok.disabled = cn <= 0;
  };
  root.querySelectorAll(".tcx-line").forEach((row) => {
    const k = row.dataset.key; const l = lineByKey(k);
    const numEl = row.querySelector(".num"), dec = row.querySelector(".dec"), inc = row.querySelector(".inc");
    row.querySelectorAll(".tcx-q").forEach((b) => b.onclick = () => {
      sel[k] = Math.max(0, Math.min(l.max, (sel[k] || 0) + parseInt(b.dataset.d, 10)));
      if (numEl) numEl.textContent = sel[k];
      if (dec) dec.disabled = sel[k] <= 0;
      if (inc) inc.disabled = sel[k] >= l.max;
      refreshCancelUI();
    });
  });
  root.querySelector("#tcxOk").onclick = () => {
    let cnt2 = 0, refPrev = 0; Object.keys(sel).forEach((k) => { const l = lineByKey(k); if (l) { cnt2 += sel[k]; refPrev += sel[k] * l.unit; } });
    if (cnt2 <= 0) return;
    if (!confirm(`선택한 ${cnt2}매를 취소하시겠습니까?\n예상 환불액: ${won(refPrev)}\n미사용 쿠폰만 취소되며 되돌릴 수 없습니다.`)) return;
    let ref = 0; const all = loadTicketCoupons();
    Object.keys(sel).forEach((k) => {
      let q = sel[k]; if (q <= 0) return; const [pid, lv] = k.split("|"); const level = parseInt(lv, 10);
      for (const c of all) { if (q <= 0) break; if (c.order_no === st.orderNo && c.product_id === pid && c.level === level && c.status === "SOLD" && c.use_end_date && today <= c.use_end_date) { c.status = "CANCELLED"; c.cancelled_at = new Date().toISOString(); ref += (c.sell || 0); q--; } }
    });
    saveTicketCoupons(all);
    const orders = loadTicketOrders(); const o = orders.find((x) => x.order_no === st.orderNo);
    const rem = all.filter((c) => c.order_no === st.orderNo);
    const allC = rem.length > 0 && rem.every((c) => c.status === "CANCELLED");
    const anyC = rem.some((c) => c.status === "CANCELLED");
    o.status = allC ? "취소완료" : (anyC ? "부분취소" : "결제완료");
    o.refund_amount = (o.refund_amount || 0) + ref; o.cancelled_at = new Date().toISOString();
    saveTicketOrders(orders);
    uiState.mbCancel.open = false; root.remove(); unlockBg();
    renderMyTicketOrder($("#app"), st.orderNo);
    mbToast(`취소되었습니다. 환불 ${won(ref)}`);
  };
}

document.addEventListener("DOMContentLoaded", boot);
