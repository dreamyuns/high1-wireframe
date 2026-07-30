# admin-prototype 변경이력 (CHANGELOG)

> 롤백 기준: 각 편집 전 `prototypes/backup/snapshots/YYYYMMDD_NN_*` 스냅샷 + git 커밋.
> 형식: 버전 · 날짜 · 변경 파일 · 내용

## v0.7.31 — 2026-07-30 (Step 1: 공지사항 신설)
- **화면관리 LNB에 "공지사항" 추가** (기존 메인관리만 → 메인관리/공지사항).
- **공지 목록**(`#/notices`): 제목(EN/ZH) · 상태(게시중/대기·종료/미게시) · 게시기간 · 팝업(ON/OFF + 대상 배지 M/S/P) · 수정일 · 수정/삭제.
- **공지 등록·수정**(`#/notices/new`·`/edit/:id`): 제목 EN(필수)/ZH(선택) · 본문 EN(필수)/ZH(선택) 리치에디터 · 게시(Published·시작/종료 datetime) · 프런트 팝업(사용·대상 페이지 메인/검색결과/숙소상세) · 버전. 저장 시 확인 알럿 + 저장완료 알럿(현재 화면 유지).
- 저장키 `high1_notices_v1` (어드민 write → 프런트 read, Step 2 연동 예정).
- 변경 파일: `app.js`(상수·헬퍼·renderNoticeList/Form·NAV_SECTIONS·route), `index.html`(버전 v0.7.31).
- 언어 정책: 공지=EN 필수+ZH 선택(개발사 방식, 2026-07-30 PO 확정).
- 스냅샷(착수 전): `backup/snapshots/20260730_01_pre-step1-notice/`.

## v0.7.30 — 2026-07-30 (baseline)
- 2026-07-30 다국어/공지/이메일 개편 착수 전 **베이스라인**.
- 스냅샷: `prototypes/backup/snapshots/20260730_00_baseline_admin-v0.7.30_front-v0.8.27/`
- 이후 단계별 변경을 아래에 누적 기록.
