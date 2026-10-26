# 실제 서비스 구현 계획 — 제안 설계

이 문서는 앞으로 구현할 설계다. 현재 소스는 `docs/CURRENT_STATE.md`에 설명한 정적 데모다.
아래 디렉터리·API·테이블은 아직 만들어져 있지 않다. 확정 제품 요구는 `PRODUCT_SPEC.md`를 우선한다.

## 1. 권장 구성과 선택 기준

작은 팀이 관리하기 쉬운 웹/API 모놀리스에 오래 걸리는 작업만 별도 워커로 분리하는 구성을 제안한다.
한 번에 마이크로서비스 전체를 만들지 않는다.

| 구성 | 제안 | 이유/제약 |
|---|---|---|
| 웹·업무 API | TypeScript 기반 React 계열 + 단일 서버 프레임워크 | 기존 UI를 컴포넌트로 단계 이전, 인증·폼·타입 공유 |
| DB | PostgreSQL, 필요 시 pgvector | 조직·프로젝트 관계, 트랜잭션, 자재 임베딩 검색 |
| 파일 | S3 호환 비공개 Object Storage | PDF·사진·생성 결과·모델 보관, 서명 URL |
| 분석/생성 | 작업 큐 + 별도 워커 | 타임아웃·재시도·중복 방지·진행률·비용 추적 |
| 도면 처리 | Python 분석 워커 (필요 시) | PDF/OCR/영상처리 라이브러리 활용 |
| SketchUp | SDK 호환 별도 실행 환경 | 배포 서버 OS와 SDK 조건을 독립적으로 검증 |
| 인증 | 관리형 인증 또는 검증된 라이브러리 | 자체 비밀번호 암호화/세션을 임의 제작하지 않음 |
| 운영 | 에러 추적, 구조화 로그, 지표, 백업 | 요청·작업 단위 추적과 장애 복구 |

특정 클라우드·AI 공급자·라이브러리 버전은 소유자가 확정하지 않았다.
Claude는 현재 공식 문서·비용·운영 조건을 확인한 뒤 선택 이유와 대안을 `DECISIONS.md`에 기록한다.
GitHub에 올린다고 기존 Sites에 CI/CD가 생기지 않는다. 신규 스테이징을 분리하고
기존 공개 데모를 운영 서비스로 전환하는 시점은 별도 작업으로 다룬다.

### 제안 디렉터리

```text
public/                # 현재 데모 기준본, 이전 완료까지 보존
apps/web/              # 실제 UI·업무 API (선정한 스택에 맞춰 조정)
workers/analysis/      # PDF/OCR/공간 인식
workers/generation/    # 생성 공급자와 작업 실행
workers/sketchup/      # 실제 모델 내보내기
packages/contracts/    # API·DB·작업 입력/출력 타입과 스키마
packages/providers/    # 주소·이미지 생성·임베딩·도면 공급자 어댑터
db/migrations/         # 버전 관리된 스키마 변경
tests/fixtures/        # 사용 허가된 소형 테스트 입력
docs/                  # 인수 문서·결정·진행 기록
```

전면 복제 UI를 장기간 이중 유지하지 않도록 화면별 이전 계획을 둔다.
원래 화면을 기준으로 비교한 후 대시보드 → 업로드 → 분석 → 결과 → 콘솔 순으로 이전할 수 있다.

## 2. 권한과 테넌트 경계

- B2C는 개인 workspace, B2B는 organization workspace를 갖는다.
- 모든 프로젝트·파일·작업 조회는 현재 사용자와 workspace 멤버십을 서버에서 확인한다.
- 요청 본문의 `ownerId`, `workspaceId`, `role`, `plan`은 신뢰하지 않는다.
- 프로젝트 viewer는 결과 열람만, editor는 생성/수정, admin은 멤버 관리 등 명시적 권한 표를 둔다.
- 플랫폼 운영자와 업체 owner는 다른 권한이다. 업체 owner에게 전 사용자 DB 권한을 주지 않는다.
- 스토리지 객체는 공개 버킷에 두지 않으며 프로젝트 권한 확인 후 짧은 만료 URL 발급.
- 외부 공유 토큰은 충분한 엔트로피, 해시 저장, 만료·취소를 지원한다. 내부 메모는 응답에서 제외.
- 로그·관측·오류 추적에 원본 도면, 상세 주소, 토큰을 남기지 않는다.

## 3. 데이터 모델 초안

타임스탬프는 UTC 저장, UI는 사용자 시간대로 표시. 금액은 정수 KRW,
길이는 mm, 면적은 m², 색상값·좌표계·원본 단위를 명시한다. 원본 OCR 숫자를 함께 보존한다.
UUID와 서버 검증을 사용하며, ID를 안다고 권한이 생기지 않는다.

| 테이블 | 핵심 필드/역할 |
|---|---|
| users / profiles | auth subject, 표시명, B2B/B2C 프로필, 상태 |
| workspaces / memberships | 개인/조직, user_id, role, 초대 상태; 멤버십 유니크 |
| projects | workspace_id, creator_id, 이름, 원본 유형, 예산_원, 층고_mm, 상태, 선택 시안 |
| project_clients | 프로젝트별 고객명·연락처(필요 시), 내부 메모; 제한된 응답 |
| project_files | project_id, private object key, MIME, 크기, checksum, 페이지, 검사 상태 |
| buildings / addresses | 공급자 식별자, 표준 주소, 단지명, 위치, 출처 |
| unit_types | building_id, 타입명, 전용/공급 면적, 확장/반전 구분 |
| floorplan_versions | unit_type_id, 원본 파일, 버전, 검수 상태, 사용 가능 범위, 라이선스 만료 |
| floorplan_requests | 찾지 못한 단지/타입 요청, 제출 동의, 검수 상태 |
| analyses / analysis_versions | 입력 파일/페이지, 구조 JSON, confidence, 스케일/검수, 분석기 버전 |
| rooms / surfaces | 분석 버전, 방·표면 식별자, 폴리곤/벽/개구부 연결; JSON 또는 정규화 선택 |
| generation_batches | 프로젝트, 분석 버전, 콘셉트 범위, 요청 옵션, 부분 성공 상태 |
| design_variants / renders | 배치, 스타일, room_id, camera_id, 결과 객체, 생성 공급자/모델, 품질 검수 |
| jobs / job_attempts / job_events | 종류, 입력 버전, 상태, 진척, 재시도, idempotency, 비용, 오류 코드 |
| brands / products / product_variants | 브랜드·제품·SKU·카테고리·규격·활성 상태·출처·검수 |
| product_assets / product_embeddings | 제품 이미지/텍스처 권한·checksum, 모델 버전·벡터 |
| catalog_imports / catalog_rows | PDF·제휴 데이터 수집 이력, 원문 페이지, 오류/검수 |
| material_matches | render/surface_id, SKU, raw similarity, calibrated score, 이유, 알고리즘 버전 |
| project_materials | 사용자가 선택한 SKU·표면·수량·단위·선택 시점 스냅샷 |
| favorites / saved_variants | 사용자와 대상의 복합 유니크. 역할 문자열로 저장하지 않음 |
| model_exports | 분석/시안 버전, 엔진 버전, 파일, 검증 보고서, 상태 |
| subscriptions / entitlements | workspace, 공급자 customer/subscription ID, 상태, 유효 기간 |
| usage_ledger / reservations | 작업별 예약·확정·반환 크레딧과 실제 공급자 비용 |
| webhook_events | 공급자 event ID 유니크, 서명 검증·처리 상태 |
| share_links / audit_events | 공유 범위·만료·철회, 중요 변경 감사 로그 |

테이블 수 자체가 목표가 아니다. 초기에는 관련 정보를 JSON 스키마와 적은 테이블로 시작해도 되지만
원본/분석/생성 결과 버전과 테넌트 경계는 처음부터 명확하게 유지한다.
제품은 `brand_id + vendor_sku` 등 안정된 키로 중복 방지하고 중복 후보는 검수한다.
카탈로그 제품 삭제가 과거 제안서의 내용을 바꾸지 않도록 선택 시점 스냅샷을 유지한다.

### 구조 모델 필수 필드 (예시)

```json
{
  "schemaVersion": "1.0",
  "units": "mm",
  "coordinateSystem": "right-handed-z-up",
  "source": {"fileId": "uuid", "page": 1, "type": "floorplan_pdf"},
  "scale": {"mmPerSourceUnit": null, "status": "needs_reference", "source": null},
  "ceilingHeightMm": {"value": 2400, "source": "default", "confirmed": false},
  "rooms": [],
  "walls": [],
  "openings": [],
  "surfaces": [],
  "warnings": ["scale_unconfirmed"],
  "reviewStatus": "needs_review",
  "eligibleForModelExport": false
}
```

`eligibleForModelExport`는 서버가 계산하는 결과이며 클라이언트 입력을 신뢰하지 않는다.
polygon 닫힘·자기교차·벽 접합·개구부의 부모 벽·중복 방·면적 일관성을 검증한다.
좌표 변환, 이미지 픽셀→mm 변환, SketchUp 단위 변환은 명시적 함수로 테스트한다.

## 4. API 계약 초안

경로는 제안이다. 공통 응답은 requestId, 데이터 버전, 안정된 error code를 포함한다.
목록에는 페이지네이션, 변경에는 낙관적 동시성(version/ETag), 생성에는 Idempotency-Key를 적용한다.

| 메서드·경로 | 기능/권한 |
|---|---|
| GET /api/me | 세션 사용자·멤버십·실효 권한 |
| POST /api/workspaces | 개인/업체 작업 공간 생성 |
| GET/POST /api/projects | 허용된 프로젝트 목록/생성 |
| GET/PATCH/DELETE /api/projects/:id | 소유권 검사, 버전 충돌 및 보존 정책 |
| POST /api/projects/:id/uploads | 업로드 예약·서명 URL |
| POST /api/projects/:id/uploads/:fileId/complete | 실제 객체 크기/MIME/checksum 확인 후 처리 큐 등록 |
| GET /api/addresses/search | 주소 공급자 검색, 남용 제한 |
| GET /api/buildings/:id/unit-types | 보유 타입·도면 가용성 |
| GET /api/floorplans/:id | 검수·사용 권한이 유효한 도면 미리보기 |
| POST /api/projects/:id/floorplan-selection | 타입·확장·반전·사용자 확인 기록 |
| POST /api/projects/:id/analyses | 분석 작업 생성, 202 + jobId |
| PATCH /api/analyses/:id | 사용자 수정으로 새 분석 버전 저장 |
| POST /api/analyses/:id/confirm | 스케일·구조 검증 후 확정 |
| POST /api/projects/:id/generations | 생성 배치 예약·202 반환 |
| GET /api/jobs/:id | 권한 있는 진행 상태 조회; SSE는 선택 사항 |
| POST /api/jobs/:id/retry | 실패 항목만 재시도, 중복 차감 방지 |
| GET /api/projects/:id/variants | 실제 결과와 부분 성공 상태 |
| GET /api/products | 카테고리·검색·필터·페이지네이션 |
| GET /api/variants/:id/material-matches | 표면별 후보·점수 의미·출처 |
| PUT /api/projects/:id/materials | 프로젝트별 선택 자재 저장 |
| POST /api/projects/:id/model-exports | B2B Pro·구조 검수 조건을 서버에서 확인 |
| POST /api/projects/:id/exports | 실제 JSON/CSV/이미지/리포트 파일 생성 |
| POST/DELETE /api/projects/:id/shares | 사용자 지정 공유 생성/철회 |
| POST /api/billing/checkout | 서버 가격표의 플랜만 사용, 테스트 모드 우선 |
| POST /api/webhooks/billing | 원본 바디 서명·이벤트 중복 검사 |
| POST /api/admin/catalog-imports | 운영자용 카탈로그 검수 파이프라인 |

실패 예: 400 입력 오류, 401 미인증, 403 권한 없음, 404 숨길 리소스,
409 버전 충돌, 413 파일 과다, 422 분석 불가능, 429 사용량 제한,
503 공급자 미설정/일시 장애. 사용자의 내부 구현 노출 없이 다음 조치를 안내한다.

## 5. 비동기 작업·비용

상태: `queued → running → succeeded | partially_succeeded | failed | cancelled`.
외부 콜백 대기는 `waiting_provider`, 사용자 치수 보완은 `needs_input`으로 구별 가능.
단계 이름과 완료 결과 개수를 저장하고 0~100을 임의 시간으로 증가시키지 않는다.

- 요청 중복 키는 workspace·작업 종류·입력 버전·설정 해시 범위로 관리.
- 큐는 중복 전달될 수 있으므로 워커의 결과 저장·사용량 차감을 멱등하게 구현.
- 작업 예약/크레딧 예약은 트랜잭션 처리, 성공 시 확정, 실패/취소 시 정책에 따라 반환.
- 공급자 비용과 사용자 청구 크레딧을 별도 원장으로 기록.
- 시간 초과를 즉시 실패로 오인하여 같은 유료 작업을 다시 만들지 않음. 공급자 요청 ID로 상태 조회.
- 콜백 서명 검증, 재시도 백오프·최대 횟수, 장기 정체 탐지, 실패 큐/수동 재시작 제공.
- 6개 시안 중 성공 4개·실패 2개를 그대로 보존하고 배치 전체 성공으로 표시하지 않음.
- 결과 다운로드 실패 시 파일 복구/재생성을 별도 취급하여 AI를 다시 불필요하게 호출하지 않음.
- 생성 전 예상 크레딧과 범위, 실행 후 실제 완료/실패 항목과 사용량을 설명.

## 6. 공급자 인터페이스

`AddressProvider.search(query)`, `FloorplanProvider.getVersion(id)`,
`PlanAnalyzer.analyze(file, options)`, `ImageGenerator.submit(input)`/`getStatus(id)`,
`EmbeddingProvider.embed(asset)`, `ModelExporter.export(geometry, materials)`를 분리한다.
각 구현은 capability(지원 입력/제어/포맷), 설정 상태, 모델 버전을 반환한다.
공급자가 미설정이면 typed error를 반환한다. 테스트 fixture와 production adapter는
런타임 설정/화면 표시/결과 메타데이터로 구분하며 운영 모드에 샘플 fallback을 넣지 않는다.

API 키는 환경변수/비밀 관리자에서 서버만 접근. 브라우저 번들·에러·커밋에 포함하지 않는다.
외부 URL에서 파일을 가져오면 허용 도메인/크기/타임아웃과 내부 IP 접근 차단을 적용한다.
PDF 처리/사용자 입력/카탈로그 텍스트는 신뢰하지 않으며 프롬프트의 시스템 지시로 실행하지 않는다.

## 7. 구현 순서와 각 단계 완료 기준

### 0 — 기준본 실행과 두 가지 기술 검증

- 현 데모를 실행, 실제 디자인/입력/결과 흐름을 확인하고 비교 스크린샷 확보.
- 기존 E2E 절대 경로를 이식할 계획을 세우고 테스트 환경 구성.
- **초기 위험 검증 A**: 허가된 도면 한 건에서 스케일 있는 구조 JSON 생성/검수.
- **초기 위험 검증 B**: 그 구조에서 실제 `.skp`를 만들고 SketchUp에서 열기.
- 생성 공급자는 구조 보존·실사 품질·속도·비용을 작은 테스트셋으로 평가.
- 완료: 기술 선택과 실패/지원 한계를 기록. 전체 AI/SKP가 쉽게 가능하다고 가정하지 않음.

### 1 — 서버 기반 사용자·프로젝트·파일

- 인증, workspace/RBAC, DB migrations, 비공개 파일 저장, 입력 검증, 서버 프로젝트 CRUD.
- 기존 UI에 연결하고 브라우저를 바꿔도 자기 데이터가 복원되는지 검증.
- 완료: 두 사용자/두 조직의 교차 접근이 API 및 파일 다운로드에서 모두 차단됨.

### 2 — 주소 검색과 확보된 도면 카탈로그

- 주소 어댑터 + 자체 단지/타입/도면 버전 DB + 운영자 등록/검수.
- 검색 실패·타입 불일치·만료 도면은 직접 업로드로 연결.
- 완료: 테스트 대상 주소가 올바른 타입 후보를 보이며 임의의 다른 도면을 붙이지 않음.
- 키/공급 계약이 없다면 인터페이스와 자체 DB 검색을 완성하되 외부 실연동은 미완료로 명시.

### 3 — 실제 공간 분석과 수정

- PDF 페이지 선택, OCR/기하 추출, 스케일 기준, 구조 편집/확정, 신뢰도·경고.
- 완료: 허가된 정답 도면 세트에서 벽/방/문/창·면적·단위 검증, 낮은 신뢰도 차단.
- 빈 도면·스크린샷·손상 PDF에 샘플 84㎡를 반환하지 않음.

### 4 — 실제 시안 생성

- 비동기 큐, 구조 제어 입력, 기본 6개 스타일, 방별 연계, 부분 성공/재시도, 사용량.
- 완료: 실제 공급자로 생성한 최소 5개 결과가 서버에 보존되고 새 기기에서도 열림.
- 구조 보존 실패 결과는 별도 표시·재생성 가능. 생성 호출 성공만으로 품질 검수 통과가 아님.

### 5 — 실제 제품 DB·추천

- 제품/이미지 수집 검수, 카테고리별 색인, 표면 분할, 후보 검색, 점수 보정, 선택 저장.
- 완료: 추천 SKU가 실제 검수 DB에 존재하고 출처·영역·모델 버전을 추적 가능.
- 작은 전문가 평가셋에서 Top-K 품질/오추천을 측정. 합의된 임계치 전에는 정확도 광고 금지.

### 6 — SketchUp 제품화

- 초기 검증한 엔진을 작업 큐/Pro 권한/파일 저장과 연결.
- 완료: 실측/확정 치수 허용오차 안에서 벽/개구부/층고가 유지되고 그룹/재질 편집 가능.
- 스크린샷, B2C, Basic, 검수 미완료는 직접 API 요청으로도 거절.
- 권한이 있지만 변환 엔진이 없는 환경에서는 불가 사유를 표시하며 JSON을 SKP로 반환하지 않음.

### 7 — 협업·다운로드·구독

- 서버 저장, 시안 비교/즐겨찾기, 업체 콘솔, 권한 있는 고객 공유, 결과 파일.
- 결제 테스트 모드·웹훅·플랜 권한·사용량 원장, 가입/해지/갱신 실패 시나리오.
- 완료: 새로고침/기기 변경/공유 철회/중복 웹훅/부분 실패 정산을 검증.
- 실과금은 가격·결제 사업자·정책 확정 뒤 별도 전환.

### 8 — 출시 검증과 스테이징 인수

- 성능/작업 대기시간·실패율·비용 지표, 복구 가능한 백업, 삭제 파이프라인, 운영 문서.
- E2E, API 권한, 작업 멱등성, 실제 공급자 제한된 smoke test 수행.
- 완료: 미연결 기능을 목록화하고 아래 수용 테스트 증거와 함께 스테이징 URL 전달.
- 기존 운영 URL 교체는 명시적 배포 작업으로 진행.

## 8. 반드시 검증할 시나리오

| ID | 시나리오 | 통과 조건 |
|---|---|---|
| A01 | 사용자 A가 B의 project/file/job ID로 요청 | 정보·파일 노출 없이 차단 |
| A02 | 파일 확장자 위조·손상 PDF·초과 용량·과도한 픽셀/페이지 | 서버 검증 실패, 분석 비용 발생 전 차단 |
| A03 | 같은 주소의 84A/84B·확장/비확장 | 사용자가 정확한 버전 확인, 자동 단정 없음 |
| A04 | 기준 치수 없는 평면도 | 보완 요청, 실측 면적 및 SKP 확정 차단 |
| A05 | 도면의 단위가 m/cm/mm 혼재 | 정규화·근거 보존, 사용자 확인 |
| A06 | 6개 생성 중 2개 실패·새로고침 | 성공 4개 보존, 부분 성공, 실패 2개만 재시도 |
| A07 | 중복 클릭·큐 재전달·동일 웹훅 3회 | 논리적 작업/차감/권한 변경이 한 번만 발생 |
| A08 | DB에 제품 후보가 없음 | 가짜 SKU·고정 95% 없이 후보 없음 표시 |
| A09 | 사용자 메모·카탈로그에 악성 HTML/수식/지시 포함 | UI escape, CSV 수식 중화, 지시로 실행하지 않음 |
| A10 | B2C/Basic/스크린샷이 SKP API 호출 | 서버 거절; UI 차단만으로 테스트 종료하지 않음 |
| A11 | 허가된 구조→SKP 출력→SketchUp 2025 열기 | 크기/방 수/개구부/재질/편집성 검증 보고서 |
| A12 | 고객 공유·철회·내부 메모 | 허용 결과만 열람, 철회 즉시 차단, 메모 미노출 |
| A13 | 프로젝트 삭제와 생성 워커 완료가 경합 | 삭제된 프로젝트에 파일이 다시 공개되지 않음 |
| A14 | 기존 로컬 데이터 가져오기 | 샘플/실제 구분, 만원→원, 중복 방지, 파일 누락 안내 |
| A15 | 뷰포트 1440/1920/2560 및 390px | 기존 랜딩 비율·앱 배치 보존, 핵심 작업 가능 |
| A16 | 공급자 키 누락·잔액 부족·타임아웃 | 실제 오류 상태·다음 행동, 샘플 성공으로 대체 없음 |
| A17 | 동시 프로젝트 편집 | 오래된 버전으로 덮어쓰지 않고 충돌 해결 |

실제 AI 품질과 SKP 검증은 fixture/mock 테스트만으로 대체할 수 없다.
면적 오차·개구부 탐지·이미지 구조 보존·자재 Top-K 등 임계치는 평가셋 구성 후 합의한다.
주관적 품질을 임의로 '95% 완료'로 수치화하지 않는다.

## 9. 비용·데이터·운영 고려

생성 단가를 코드에 고정하지 말고 요청별 이미지 수·해상도·재시도·저장/전송량을 기록한다.
사용자/조직별 일일 상한, 동시 작업 제한, 관리자 경고를 설정 가능하게 한다.
원본 도면을 AI 공급자에게 보내는 목적과 보관 범위는 서비스 정책에 반영한다.
서버 저장과 별개로 공급자 보관 정책도 확인한다. 데이터 삭제는 DB·원본·파생 결과·캐시를 포함한다.
개인정보/권리/결제 정책은 운영 지역과 서비스 구조에 맞춰 출시 전에 검토한다.

## 10. 공식 참고 자료

2026-10-24에 확인한 공식 문서. 계약·요금·지원 환경은 실제 도입 시 다시 확인한다.

- [NAVER Cloud Geocoding](https://api.ncloud-docs.com/docs/application-maps-geocoding): 주소 정보 검색의 API이다. 별도의 평면도 공급을 전제하지 않는다.
- [SketchUp C SDK](https://developer.trimble.com/docs/sketchup/tools/sdk/): 독립 프로그램에서 SKP 읽기/쓰기를 위한 검토 경로. 배포 조건은 SDK 안내를 확인한다.
- [SketchUp Ruby API](https://developer.trimble.com/docs/sketchup/tools/api/): SketchUp 모델/앱을 다루는 확장 경로. 서버 내보내기와 동일한 실행 환경은 아니다.
- [Claude Code 프로젝트 메모리](https://code.claude.com/docs/en/memory): 루트 `CLAUDE.md`와 상세 문서를 분리해 필요한 맥락을 유지한다.

나머지 데이터 모델·작업 처리·UI 계획은 이 프로젝트를 위한 설계 제안이며 공급자 보장 사항이 아니다.
