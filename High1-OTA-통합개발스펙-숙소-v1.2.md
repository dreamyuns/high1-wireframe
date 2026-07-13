# High1 OTA — 통합 개발 스펙 (숙소 도메인)

> **목적**: 개발사가 실제 구현할 수 있도록 어드민·프런트의 데이터 모델·화면 동작·비즈니스 로직·예외 케이스를 통합 정의한 개발 스펙.
> **범위**: 숙소(Accommodation) 전용 — 숙소·객실·상품·재고/요금·마진·메인관리·프런트(메인/브릿지/검색결과/모달). **티켓·쿠폰·투어·패키지(RM+CPN)는 제외**(별도 라인).
> **기준**: 사업부 정책서 v0.5 · 프로토타입 v0.6 (admin/front) · 화면기획서(admin_wireframe)
> **버전**: v1.2 · 2026-07-10 (이미지 저장 = Cloudinary/서버·CDN, HTML 콘텐츠 필드 리치 에디터 반영)
> **참조**: `사업부-정책서-v0.5.md`(정책), `pms-analysis.md`(PMS API), `admin_wireframe/*.html`(화면기획서)

---

## 0. 용어

| 용어 | 정의 |
|------|------|
| 입금가 | 호텔에 지불하는 원가. 고객 미노출. 마진 계산 기준. (PMS SELL_ITM_AMT 또는 수기 입력) |
| 판매가 | 고객 청구 금액 = 입금가 + 마진. 프런트 노출가. |
| 마진 | 판매가 − 입금가. 당사 수익. **일자별** 관리. |
| RM_TYP_CD | PMS 객실 타입 코드(STD/DLX 등). **재고·요금·마진의 기준 키**. |
| 객실코드(RM-####) | OTA 내부 객실 식별 순번(자동채번). |
| 재고 3값 | OPER_RM_CNT(총운영)·RSV_CNT(예약)·AVLB_RM_CNT(잔여). 잔여=총운영−예약, sold out 기준. |
| 판매 ON/OFF | 일자별 강제 마감 여부(`closed`). CLSE_YN 개념. 체크인허용 대체. |
| 투숙 가능 기간 | 고객이 체크인일로 선택 가능한 범위(판매기간과 별개). ※ 정책 정의, 프로토타입 미구현(9절 참고). |

---

## 1. 시스템 아키텍처 (프로토타입 기준)

- **정적 SPA**: 빌드/프레임워크 없음. HTML + Vanilla JS + `localStorage`. 해시 라우팅.
- **2개 앱, 저장소 공유**:
  - **어드민**(`admin-prototype/`): 데이터 **쓰기**. 숙소·객실·상품·재고/요금·마진·메인관리 CRUD.
  - **프런트**(`front-prototype/`): 데이터 **읽기 전용**. 동일 `localStorage` 키를 읽어 고객 화면 렌더.
- **실서비스 전환 시**: `localStorage` ↔ 서버 API/DB로 대체. 본 스펙의 엔티티·필드·규칙은 그대로 백엔드 스키마·API 계약으로 사용 가능.
- **이미지 저장(중요)**: 숙소·객실 이미지(`image_meta[].data_url`)는 **파일을 이미지 스토리지에 업로드하고 URL만 저장**한다. base64 인라인 저장 금지. **프로토타입은 Cloudinary 무인증 업로드**(업로드 전 1600px·JPEG 축소, URL 저장), **실서비스는 서버 서명 업로드 + 자사/CDN 스토리지**로 구현. (`image_meta[].data_url`에 URL이 들어감. 카테고리 픽토그램 등 소형 아이콘만 base64 예외)
- **HTML 콘텐츠 입력 = 리치 에디터**: 숙소 안내/정책·위치 상세(S02), 객실 안내/정책(S04), 상품 안내/정책(S06-A) 등 HTML 필드는 **리치 에디터**(툴바 굵게·제목·목록 + [이미지 불러오기] + Ctrl+V 붙여넣기)로 입력한다. 삽입 이미지는 위 이미지 저장 방식(업로드→URL)으로 처리, 본문 HTML에 `<img src="URL">`로 들어간다. 저장은 에디터 `innerHTML`.
- **다국어**: 외국인 전용. **EN 필수 · ZH 선택 · KO 입력 미사용**(숙소명 등 PMS 원본 KO는 내부 표시용). ZH 미입력 시 EN 대체. EN 미입력 시 저장 불가(유효성).
- **프런트 라우트**: `#/`(메인) · `#/bridge/HOTEL|CONDO`(브릿지) · `#/search`(검색결과). 모달: Room Detail, 장소 레이어.

---

## 2. 데이터 모델 (localStorage 엔티티)

> 모든 텍스트 필드는 `*_en`(필수)/`*_zh`(선택) 이중. `id`는 시스템 고유(uid). 날짜 `YYYY-MM-DD`. 시각 `HH:MM`.

### 2.1 저장소 키 일람

| 키 | 엔티티 | 쓰기 | 읽기 |
|----|--------|------|------|
| `high1_places_v1` | 숙소 Place[] | 어드민 S02 | 프런트·S03/04/06 |
| `high1_rooms_v1` | 객실 Room[] (+inventory) | 어드민 S04/S04-INV | 프런트·S06 |
| `high1_products_v1` | 상품 Product[] (+inventory) | 어드민 S06 | 프런트 |
| `high1_margin_master_v1` | 마진 마스터 Map | 어드민 S11 | S04-INV(디폴트 주입) |
| `high1_room_master_room_type_v1` | 객실유형 RoomType[] | S09 | 프런트 필터·모달 |
| `high1_room_master_bed_type_v1` | 침대유형 BedType[] | S09 | 프런트 카드·모달 |
| `high1_facility_categories_v1` | 시설 카테고리[] (domain PLACE/ROOM) | S07 | 프런트 |
| `high1_facilities_v2` | 시설[] | S08 | 프런트 |
| `high1_main_hero_v1` | 메인 히어로 슬라이드[] | S12-A/B | 프런트 메인 |
| `high1_main_hero_cfg_v1` | 히어로 전역설정 | S12-A | 프런트 메인 |
| `high1_main_section_v1` | 추천 섹션[] | S12-A/C | 프런트 메인 |
| ~~`high1_room_master_trait_v1`~~ | ~~객실특징~~ | **폐기(v0.6)** | — |

### 2.2 Place (숙소) — `high1_places_v1`

| 필드 | 타입 | 설명 |
|------|------|------|
| `id` | string | 고유 id |
| `place_code` | string | PMS 숙소코드 `PL-######` |
| `place_name` | string | 숙소명(KO, PMS 원본) |
| `place_name_en` | string | 숙소명 EN **필수**(AI번역 보완 가능) |
| `category` | `HOTEL`\|`CONDO` | 1차 분류 |
| `sub_place` | string | 2차 분류 코드(건물·단지) |
| `check_in_time` / `check_out_time` | `HH:MM` | 기본 체크인/아웃 |
| `visibility` | `SHOW`\|`HIDE` | 노출 여부 |
| `image_meta[]` | `{data_url}` \| `{from_pms:true}` | 이미지 배열(첫 장=대표) |
| `facility_ids[]` | string[] | 적용 시설(PLACE 도메인) |
| `featured_facility_ids[]` | string[] | 대표 시설(**≤10**, facility_ids의 부분집합) |
| `address` / `address_en` | string | 주소 KO/EN |
| `location_detail` | string(HTML) | 위치 상세(언어중립 단일 필드) |
| `guide_html` / `guide_html_en` | string(HTML) | 안내 |
| `policy_html` / `policy_html_en` | string(HTML) | 정책 |
| `extra_fee_notes[]` | `{en, zh}` | 추가요금 안내(정보성, 결제 미연동) |
| `created_at`/`updated_at`/`updated_by` | | 메타 |

### 2.3 Room (객실) — `high1_rooms_v1`

| 필드 | 타입 | 설명 |
|------|------|------|
| `id` | string | 고유 id |
| `place_id` | string | 소속 숙소 |
| `room_code` | string | 내부 객실코드 `RM-####`(자동채번) |
| `rm_typ_cd` | string | **PMS 객실타입코드(기준 키)** — 재고·요금·마진 연결 |
| `room_name` / `room_name_en` | string | 객실명 KO/EN(EN 필수) |
| `room_type_id` | string | 객실유형 마스터 참조(RoomType) |
| `bed_rows[]` | `{bed_type_id, count}` | 침대 구성 |
| `facility_ids[]` | string[] | 객실 시설(ROOM 도메인) |
| `featured_facility_ids[]` | string[] | 객실 대표 시설(칩 노출) |
| `room_size_sqm` | number | 면적(㎡) |
| `standard_occupancy` | number | **기준 인원** (인원추가요금 판정) |
| `max_occupancy` | number | **최대 인원** (수용 필터 기준) |
| `visibility` | `SHOW`\|`HIDE` | 노출 여부 |
| `guide_html_en/_zh`, `policy_html_en/_zh` | string(HTML) | 객실 안내/정책 |
| `image_meta[]` | `{data_url}` | 이미지 |
| `inventory[]` | Row[] | **재고·요금·판매ON/OFF**(아래 2.3.1) |
| `inventory_synced_at` | ISO | 재고·요금 동기화 시각 |
| `created_at`/`updated_at`/`updated_by` | | 메타 |

#### 2.3.1 `room.inventory[]` Row (재고·요금·판매상태 — 객실 타입 단위)

| 필드 | 타입 | 설명 |
|------|------|------|
| `date` | `YYYY-MM-DD` | 대상일 |
| `price` | number | **입금가**(원가). PMS API3 SELL_ITM_AMT 또는 수기 |
| `oper_cnt` | number | 총 운영 객실 수(OPER_RM_CNT) |
| `rsv_cnt` | number | 예약된 수(RSV_CNT) |
| `avlb_cnt` | number | **잔여**(AVLB=OPER−RSV) ★ sold out 기준 |
| `stock` | number | 하위호환(= 잔여) |
| `closed` | boolean | **판매 ON/OFF** — true=강제 마감 |

> 관리 창구: **S04-INV(객실 타입 단위)**. PMS 연동=읽기, 동기화 버튼 갱신 / 수기=직접 입력.

### 2.4 Product (상품) — `high1_products_v1`

| 필드 | 타입 | 설명 |
|------|------|------|
| `id` | string | 고유 id |
| `product_code` | string | `PR-####`(자동채번) |
| `room_id` | string | **연결 객실**(필수, 1객실:N상품) |
| `pms_linked` | boolean | PMS 연동 여부 |
| `product_type` | `ROOM_ONLY` | 상품 유형(숙소 도메인은 룸온리) |
| `name_en` / `name_zh` | string | 상품명 EN 필수/ZH |
| `description_en/_zh` | string | 상품 설명(카드 미노출·모달만) |
| `guide_policy_html_en/_zh` | string(HTML) | 상품 안내/정책 |
| `visibility` | `Y`\|`N` | 노출 여부 |
| `sale_start_date`/`sale_end_date` | date | **판매기간**(예약·결제 가능 기간) |
| `cancel_policy_type` | `PMS_API9` \| 수기유형 | 취소정책 출처 |
| `cancel_free_days_before` | number\|null | 수기 상품 무료취소 기준일수 |
| `inventory[]` | Row[] | **예약조건 + 일자별 마진**(아래 2.4.1) |
| `created_at`/`updated_at`/`updated_by` | | 메타 |

> ⚠ **투숙 가능 기간**(`stay_start_date`/`stay_end_date`, 정책 15절)은 **현재 프로토타입 미구현**. 실개발 시 추가 필요(9절 미결).

#### 2.4.1 `product.inventory[]` Row (예약조건 + 일자별 마진 — 상품 단위)

| 필드 | 타입 | 설명 |
|------|------|------|
| `date` | date | 대상일 |
| `min_stay_nights` | number(≥1) | 최소 숙박 |
| `max_stay_nights` | number(≤365) | 최대 숙박 |
| `cutoff_days_before_checkin` | number(≥0) | 컷오프(체크인 N일 전 마감) |
| `margin_type` | `amount`\|`rate`\|`""` | 일자별 마진 유형 |
| `margin_value` | string | 마진 값 |
| `margin_source` | `master`\|`manual` | `master`=마스터 상속(마스터 변경 시 재계산) / `manual`=관리자 개별(고정) |
| `checkin_allowed` | boolean | (레거시) — 판매 ON/OFF(room.inventory.closed)로 대체됨 |

> 재고·요금·판매상태는 여기 없음 — **room.inventory**에서 실시간 참조(2.6 병합 규칙).

### 2.5 마진 마스터 — `high1_margin_master_v1`

```
{ [RM_TYP_CD]: { type: "amount" | "rate", value: string } }
```
- 객실 타입별 마진 **일자별 초기 기본값**. S04-INV에서 미설정(`margin_source=master`) 일자에 주입.
- 미설정 RM_TYP_CD → **전역 디폴트** `DEFAULT_DAILY_MARGIN = { type:"amount", value:"30000" }`(마진금액 30,000원).

### 2.6 마스터·메인관리 엔티티

- **RoomType** `[{id:"RT-###", name, place_id, is_visible}]` — 숙소별 분류.
- **BedType** `[{id:"BT-###", name, is_visible}]` — **name 프런트 직접 노출**.
- **FacilityCategory** `[{id, name, domain:"PLACE"|"ROOM"}]` / **Facility** `[{id, name, category_id, domain}]`.
- **MainHero** `[{id, media_type:"image"|"video", pc_image(url), subtitle_ko/en, title_ko/en, cta_use, cta_url, cta_label_ko/en, period_start/end, force_off, order}]`.
  - ※ 히어로 미디어 입력 방식 = **파일 업로드**(화면기획서 확정). 프로토타입은 URL이나 실개발은 업로드. 동영상은 폼 관리만(프런트 재생 제외).
- **MainHeroCfg** `{autoplay:boolean, interval_sec:number(기본5)}`.
- **MainSection** `[{id, title_ko/en, subtitle_ko/en, visible, period_start/end, viewall_use, viewall_label_ko/en, viewall_url, cat_1depth:["hotel"|"condo"], place_ids[], tab_enabled, room_mode:"auto"|"manual", sort_type:"price"|"az"|"za"|"popular", room_ids[], order}]`.

---

## 3. 공통 규칙

### 3.1 노출(고객 화면) 2단 조건
```
프런트 노출 = (room.visibility === "SHOW") AND (product.visibility !== "N")
```
- **Cascade**: `room.visibility=HIDE` → 연결 상품 전체 강제 미노출(어드민에 🔒). SHOW → 상품 개별 제어.

### 3.2 마진·판매가 계산 (`computeSellPrice(base, type, value)`)
```
amount: 판매가 = base + floor(value)          // value 음수 허용(할인)
rate  : 판매가 = floor(base × (1 + value/100)) // value 정수 -49 ~ +100
그 외 : 판매가 = base
※ 결과 min 0, 소수점 무조건 버림(floor)
```
- **SELL_AMT(PMS API6) = 입금가(원가)로 전송**. 마진 미포함. 판매가는 OTA DB에만 저장.
- 마진금액 하한 없음. 마진율 정수 -49~+100.
- **요금 동기화(입금가 갱신)와 마진 독립** — 마진 보존, 판매가 자동 재계산.

### 3.3 식별자
- Place `PL-######`(PMS) / Room `RM-####`(내부) + `rm_typ_cd`(PMS) / Product `PR-####` / RoomType `RT-###` / BedType `BT-###`. 모두 자동채번·수정불가.

### 3.4 핵심 정보 수정 제한
- 노출 이력이 있으면 핵심 식별 필드 🔒: 숙소 유형/구역, 객실유형/침대구성, 상품 유형/연결객실, 연동모드. → 변경 시 판매중단(OFF) 후 신규 등록.
- 재고·요금·마진(S04-INV), 예약조건, 판매기간·투숙기간은 항상 수정 가능(이력 기록).

---

## 4. 어드민 화면 스펙

> 등록 필수 순서: **숙소 → 객실 → 상품** (객실 0개면 상품 저장 불가).

### S01 숙소 목록 (`s01-property-list`)
- 숙소 목록·검색·노출 토글. [+ PMS 동기화](정보) → `syncPmsPlaces()`.

### S02 숙소 등록 (5-Step 위저드)
- Step1 기본: 숙소명(EN 필수)·1차분류(HOTEL/CONDO)·2차분류·체크인/아웃·노출.
- Step2 위치: 주소(EN)·location_detail(**리치 에디터**).
- Step3 이미지: image_meta(대표 1 필수, 업로드→URL).
- Step4 안내·정책: guide_html·policy_html(**리치 에디터** KO/EN)·**extra_fee_notes[]**(추가요금 안내, EN필수/ZH).
- Step5 시설: facility_ids(PLACE) + 대표시설(≤10).

### S03 객실 목록 (`s03-room-list`)
- 컬럼: 순번·PMS코드(rm_typ_cd)·객실명·유형·인원·노출. **엑스트라베드/추가인원 컬럼 없음(폐기)**.

### S04 객실 등록 (`s04-room-form`)
- 필드: 객실명(EN 필수)·객실유형(단일)·침대구성(bed_rows)·기준/최대 인원·면적·시설·대표시설·안내/정책(**리치 에디터** EN/ZH)·이미지(업로드→URL).
- **객실특징(trait) 없음(폐기)**. rm_typ_cd는 PMS 동기화로 획득(수기 입력 아님).
- 저장 유효성: 객실유형 필수. (숙소 선택 필수)

### S04-INV 재고·요금 (`s04-inv` = 객실 S04의 [재고·요금] 탭) ★ 핵심
- **객실 타입(rm_typ_cd) 단위** 재고·요금 조회 + 판매 ON/OFF 창구. 객실 등록·수정(S04) 내 탭으로 진입.
- 데일리 테이블 컬럼: **날짜(체크인) · 입금가 · 재고 3값(총재고/예약/잔여) · 판매상태 · 판매 ON/OFF(체크박스)**.
- **[재고·요금 동기화] 버튼 1개** — 재고(API4)+요금(API3)을 **한 번에** 동기화. `syncPmsRoomInventory()`. 최초 1회 수동 + 배치. 재동기화 시 **판매 OFF(closed) 상태 보존**.
- **판매 ON/OFF**: [판매 ON/OFF 저장] 버튼 방식(즉시 반영 X) + **주의문구** + 확인 팝업. OFF → 연결 상품 전체 즉시 마감.
- **판매상태 자동 판정**: 잔여 0=SOLD OUT / closed=마감(강제) / 그 외=판매중.
- **이 화면 제외(v0.6, 프로토타입 기준)**: 판매가·마진(→ 프런트 노출 계산·마진 마스터 S11), 예약조건 컷오프·최소/최대박(→ 상품 S06). 일괄적용 패널·행 추가·인라인 수정 없음(동기화 조회 전용).

### S05 상품 목록 (`s05-product-list`)
- 컬럼: 상품명·연결객실·판매기간·**투숙 시작/종료일**·노출. (취소정책·인벤토리행수 컬럼 없음)

### S06 상품 등록·인벤토리
- **S06-A 상품폼**(`s06-product-form`): 연동모드·연결객실·상품명(EN)·판매기간·**투숙 가능 기간**·취소정책(PMS=읽기전용 7구간 / 수기=직접)·상품 안내/정책(**리치 에디터** EN/ZH)·노출. **마진 섹션 없음**(→ 마진 마스터 S11에서 객실 타입별 관리, 일자별 디폴트 주입).
- **S06-B 인벤토리 목록**(`s06-inventory-list`): 날짜·입금가·판매가·재고·**판매 ON/OFF(읽기전용)**=조회. **예약조건(최소/최대박·컷오프)만 구간 벌크 편집**.
- **S06-C 인벤토리 달력**(`s06-inventory-cal`): 순수 조회 전용. 예약조건 변경은 S06-B에서.

### S07 카테고리 / S08 시설
- 시설 카테고리·시설(도메인 PLACE/ROOM 분리). name = KO 단일(마스터). 프런트 그룹 헤더·칩.

### S09 객실유형관리 (`s09-roomtype-list`) — **2탭**
- **객실유형**(RT-###, 숙소별) / **침대유형**(BT-###, **이름 프런트 직접 노출**). **객실특징 탭 폐기(v0.6)**.

### S11 마진 마스터 (`s11-a-margin-list`, `s11-b-margin-form`)
- 객실 타입(rm_typ_cd)별 마진 **일자별 초기값 주입** 역할. 마진금액(정액) 권장 / 마진율 -49~+100.
- 미설정 타입 → 전역 디폴트 30,000원. (숙소 탭 기준. 티켓 탭은 별도 라인)
- 이력: 변경일시·변경자·전/후.

### S12 메인관리 (화면관리)
- **S12-A 메인관리**(`s12-a-main-management`): 히어로 슬라이드 목록 + 추천 섹션 목록 + 전역설정(자동슬라이드 ON/OFF·주기).
- **S12-B 히어로 폼**(`s12-b-hero-form`): 미디어(**파일 업로드**, 이미지·동영상)·타이틀/서브(KO/EN)·노출기간·강제종료(force_off)·CTA(사용·버튼명 KO/EN·URL).
- **S12-C 추천섹션 폼**(`s12-c-recommend-form`): 타이틀/서브(KO/EN)·노출·기간·전체보기(KO/EN/URL)·1뎁스(hotel/condo)·2뎁스(숙소)·탭분리(2개↑)·모드(자동 정렬 price/az/za/popular · 수동 객실선택 ≤10).

---

## 5. 프런트 화면 스펙

### 5.0 공통 검색바 (메인·검색결과·브릿지 공유)
- 기본값: **체크인=오늘+7일**, **체크아웃=체크인+1박(최초 1회)**, **성인 2·아동 0·객실 1**.
- **날짜=2개월 듀얼 캘린더**: 1클릭 체크인 / 2클릭 체크아웃(자유 범위). 체크아웃 미선택 시 +1박 자동.
- **인원=객실별**(`pax.rooms[]`): 객실당 성인+아동 **≤8**, 성인 **≥1**, 최대 **5객실**. 아동 선택 시 **만 나이(0~17) 필수** — 미선택 시 검색 시 알럿+팝오버 재오픈(진행 차단).
- 검색 → **로딩 2초** → 결과.

### 5.1 메인 (`#/`)
- **히어로 슬라이더**: `MainHero` 중 `media_type=image` AND 노출기간 통과 AND `!force_off` → order순. 자동재생(cfg). 동영상 프런트 미연동.
- **검색바**(5.0) · **추천 섹션**(`MainSection` visible+기간): 카테고리 탭(Hotel/Condominium) · **4개 노출, 5개↑ 좌우 슬라이드** · View All. 카드=canonical(5.5). · **공통 푸터**(로고·주소·TEL·COPYRIGHT).
- GNB: **Accommodation + Hotel/Condo 드롭다운**. 로그인=목업.

### 5.2 브릿지 (`#/bridge/HOTEL|CONDO`) — 숙소별 리치 페이지
- **숙소 선택 탭**(카테고리별 노출 숙소) → 선택 숙소 컨텍스트.
- **히어로**(숙소 이미지 슬라이더) → **Overview**(체크인/아웃·대표시설 칩·숙소소개) → **Sticky Nav**(Overview·Rooms·Detail·Policies·Location) → **Rooms 섹션**.
- Rooms: 공통 검색바 + 좌측 필터(**정렬·룸타입**) + canonical 카드(해당 숙소 상품).
- Sticky Nav의 Detail/Policies/Location → **장소 레이어 모달**(5.6).

### 5.3 검색결과 (`#/search`)
- 상단 검색바(5.0, 재검색) + 좌측 필터(**정렬 낮은/높은가 · 숙소 체크박스 · 룸타입 pill**) + 우측 canonical 카드 리스트.
- 대상: 노출 객실 중 예약가능 상품 존재 객실만. **수용 필터**(6.4) 적용.

### 5.4 카드 판정·데이터 (백엔드 로직) → 6절

### 5.5 canonical 카드 (검색결과·브릿지 공통)
- 노출: **뱃지=숙소명** / 객실명 / 상품명(볼드) / **📐 객실크기(㎡) · 🛏 침대(유형·개수) · 👥 기준/최대 인원** / **대표시설 칩** / (조건부)**인원추가요금 문구** / 우측: 상세보기 · **취소정책**(무료=파랑볼드/그외=빨강볼드) · **회원가(체류 총액)**.
- **카드 미노출**: 카테고리·룸타입(**룸타입은 필터 전용**)·상품설명(→ Room Detail 모달).
- 판매가 = 예약가능 상품 중 **최저가** 대표.

### 5.6 모달
- **Room Detail 모달**: 갤러리 + Information(**객실유형·인원(기준/최대)·크기·침대**) + 섹션(상품안내 `guide_policy_html` / 객실정책 `policy_html` / 객실안내 `guide_html` / 객실시설정보 `facility_ids` 그룹) + [Select Room]. **폐기 제외**: 객실특징·엑스트라베드·추가요금(extra_charges).
- **장소 레이어 모달**: 안내(`guide_html` + PLACE 시설 그룹) / 정책(`policy_html` + **extra_fee_notes**) / 위치(`location_detail` + 주소 **EN**).

---

## 6. 비즈니스 로직 (백엔드 계약)

### 6.1 재고 3값
```
AVLB_RM_CNT = OPER_RM_CNT − RSV_CNT
sold out ⟺ AVLB_RM_CNT ≤ 0     // 예약 시 RSV+1, 취소 시 RSV−1. OPER 불변.
```

### 6.2 판매 ON/OFF + Cascade
- `room.inventory[date].closed=true` → 해당 일자 예약 차단. **연결 상품 전체 즉시 반영**(객실 타입 단위).
- 재고 0 → 자동 sold out. 관리자 강제 OFF → 저장 버튼·주의문구.

### 6.3 예약 가능 판정 상태머신 `evaluateProductForStay(product, ci, co)`
1. 숙박일(nights) 산출 → 없으면 `bad_dates`
2. 판매기간(`sale_*`) 밖 → `sale_out`
3. (투숙 가능 기간 `stay_*` — 미구현, 개발 시: 범위 밖 → `no_inv`)
4. 각 박(night)마다 **병합 Row**(room.inventory 가격·재고·`closed` + product.inventory 예약조건·마진):
   - Row 없음 → `no_inv`
   - `closed=true` → `soldout`(마감)
   - 컷오프 경과(오늘 ≥ 체크인−cutoff) → `cutoff`
   - 잔여 재고 ≤ 0 → `soldout`
   - 통과 시 `sum += computeSellPrice(price, margin_type, margin_value)`
5. 전 박 통과 → `ok`, `totalPrice=sum`, 라벨 "회원가 {합계}"

### 6.4 수용 필터 (검색결과·브릿지)
```
reqMax = max over 요청 객실 of (adults + children)   // "가장 인원 많은 객실" 기준
노출 ⟺ room.max_occupancy ≥ reqMax
```

### 6.5 인원추가요금 문구
```
reqMax > room.standard_occupancy  →  "인원추가요금이 발생할 수 있습니다." (카드 하단)
reqMax ≤ standard_occupancy       →  미노출
```
- 검색결과·브릿지 카드 공통. 브릿지는 메인에서 넘어온 인원 기준, 인원 미지정 시 미노출.

### 6.6 취소정책 표시 (2상태)
- 무료취소 가능 구간 존재 → **파란색 볼드** ("{날짜} 23:59까지 무료취소 가능")
- 그 외(환불불가·위약금) → **빨간색 볼드** ("취소 및 환불불가")
- PMS 연동=API9/10 표시(읽기전용) / 수기=관리자 7구간.

### 6.7 최저가 노출
- 객실별 예약가능(`ok`) 상품 중 **최저 totalPrice** 대표. 없으면 목록 제외(미표시).

### 6.8 PMS 동기화
- **정보 동기화**: `syncPmsPlaces/Rooms/Products`(상품명·인원·판매기간 등).
- **재고·요금 동기화**: `syncPmsRoomInventory`(S04-INV, **버튼 1개로 API3 요금 + API4 재고 함께**). 최초 1회 수동 + 배치. 재동기화 시 **판매 OFF(closed) 보존**.
- **실시간**(API5): 상품 진입 시 CLSE_YN·체크인시간.

---

## 7. PMS API 매핑 요약 (상세: `pms-analysis.md`)

| API | 용도 | 사용 |
|-----|------|------|
| 1~2 | 시설·채널 조회 | 읽기 |
| **3** | 상품·날짜별 요금(SELL_ITM_AMT) | **가격 유일 소스** → room.inventory.price |
| **4** | 재고(AVLB/OPER/RSV) | 재고 3값 |
| 5 | 실시간(CLSE_YN·TIME_CD) | 마감·체크인시간 |
| 6 | 예약 요청 | SELL_AMT=입금가 전송 |
| 7 | 예약 취소 | 위약금 차감 |
| 8 | 예약 조회 | |
| 9/10 | 취소정책·위약금 | 취소정책 표시 |
| 11 | 카드 등록 | 어드민 범위 외 |
| 12 | 투숙객 변경 | 예약관리(후속) |
| 13 | 시간대(TIME_CD) | **미사용**(B타입 단일) |

- 위약금율 = API10 DLFT_APLY_AMT ÷ SELL_AMT(입금가). 고객 청구 = 위약금율 × 우리 DB 판매가(반올림). PMS 납부는 원금.

---

## 8. 예외·엣지 케이스

| # | 상황 | 처리 |
|---|------|------|
| 1 | 객실 0개에서 상품 등록 | 저장 버튼 비활성 + 알럿 |
| 2 | PMS 불러오기 시 매칭 객실 없음 | 저장 불가 알럿 + [S04 객실 등록] 안내 |
| 3 | 대표시설 10개 초과 | 저장 차단 |
| 4 | EN 필수 필드 미입력 | 저장 차단(유효성) |
| 5 | 재고 0 / 강제 OFF 일자 | 프런트 sold out / 예약 불가 |
| 6 | 객실 HIDE | 연결 상품 전체 강제 미노출(🔒) |
| 7 | 요금 동기화 후 | 마진 보존, 판매가 자동 재계산 |
| 8 | 아동 나이 미선택 검색 | 알럿 + 인원 팝오버 재오픈(진행 차단) |
| 9 | 검색 인원 > 객실 최대 | 수용 필터로 목록 제외 |
| 10 | 검색 인원 > 기준 인원 | 인원추가요금 문구 노출 |
| 11 | 예약가능 상품 없는 객실 | 검색결과·브릿지 목록에서 제외 |
| 12 | 히어로 ON 슬라이드 0개 | 히어로 영역 미노출 |
| 13 | ZH 미입력 | EN으로 대체 표시 |
| 14 | 마진 미설정 일자 | 마스터 → 없으면 전역 디폴트 30,000원 |

---

## 9. 미결 / 후속 (개발 착수 전 확정)

| 항목 | 현황 | 필요 조치 |
|------|------|-----------|
| **투숙 가능 기간(stay_*)** | 정책서 15절 정의, 프로토타입·화면 미구현 | Product에 `stay_start_date`/`stay_end_date` 추가 + evaluateProductForStay 범위 판정(6.3-③) |
| 객실 인원 2값 vs 4값 | 프로토타입=기준/최대, 검색=성인/아동 | PMS API6 STAY_ADLT/CHLD 매핑 규칙 개발팀 확정 |
| 히어로 미디어 | 화면기획서=업로드 / 프로토타입=URL | 실개발 업로드 채택(용량 정책), 동영상 재생 범위 |
| 예약관리(S10) | 초안 | 다중 객실 예약(PMS 1콜=1객실, 루프+OTA 번들), 수기 상품 대기→확정 흐름 |
| 취소정책 단순화 | 내부 검토 | 무료/환불불가 2값 단순화 여부 |
| HTML 필드(guide/policy/location) | innerHTML 렌더 | 실서비스 XSS 새니타이저(DOMPurify 등) 필수 |

---

*본 스펙 v1.2는 숙소 도메인 프로토타입(정책서 v0.5 기준) + 이미지 저장(Cloudinary/서버·CDN)·HTML 콘텐츠 리치 에디터 반영. 티켓·쿠폰·투어·패키지는 별도 라인. 변경 시 버전 갱신.*
