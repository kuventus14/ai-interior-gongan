# 현재 구현 상태 — 2026-10-24 소스 인수 기준

이 문서는 계획이 아니라 현재 소스를 직접 읽어 확인한 사실이다.
기준 Sites project ID: `appgprj_6aa0e0bc53c48191aa2989972df39290`.
복원한 원본 커밋: `a4b2d7ee0ed26a569718cdb5dd1056d008f36434`.
배포 사이트: https://gonggan-interior-studio.twn4nkfqjp.chatgpt.site
현재 Sites 접근 설정은 public이다. 사이트 공개와 사용자 프로젝트 공개는 별개다.

## 저장소 구성

| 경로 | 역할 |
|---|---|
| `public/index.html` | 앱 루트, 다이얼로그, 토스트, CSS/JS 로드 |
| `public/app.js` | 해시 라우팅, 모든 화면 템플릿·상태·이벤트·저장·다운로드 |
| `public/data.js` | 6개 콘셉트, 9개 제품, 샘플 방과 샘플 프로젝트 |
| `public/style.css` | 반응형 UI, 랜딩 전체 비례 확대 스타일 |
| `public/assets/` | 9개 참고 사진, Pretendard 폰트 2개, Lucide 및 라이선스 |
| `server.py` | Python 표준 라이브러리의 정적 개발 서버. 제품 백엔드가 아님 |
| `build.py` | `public/` → `dist/` 복사 |
| `package.json` | `dev`, `build` 스크립트. 앱 런타임 외부 패키지 의존 없음 |
| `tests/e2e.cjs` | 과거 작성한 브라우저 시나리오. 실행 환경 이식 필요 |
| `.openai/hosting.json` | 기존 Sites 식별자 및 정적 배포 경로 |

## 화면

현재 해시 경로: `#landing`, `#dashboard`, `#projects`, `#new`, `#gallery`,
`#detail`, `#compare`, `#materials`, `#saved`, `#favorites`, `#console`, `#settings`.
가입·분석 확인·다운로드·SketchUp·자재 상세는 모달 또는 단계 화면이다.
주소 검색, 결제, 실제 계정 로그인, 관리자 데이터 수집 화면은 없다.

## 기능별 사실

| 기능 | 현재 코드의 실제 동작 | 제품화 때 필요한 작업 |
|---|---|---|
| B2B/B2C | 이름·업체명·유형을 브라우저 프로필에 저장 | 실제 인증, 조직·멤버·역할·구독 권한 |
| 입력 | PDF/JPG/PNG/WebP, 20MB 제한, 파일 시그니처 검사·이미지 디코딩·미리보기 | 서버 검증, 안전한 저장, PDF 페이지 처리, 업로드 재시도 |
| 공간 분석 | 고정 샘플 방 목록을 불러와 면적·이름 수정 | OCR, 벽·방·문·창 인식, 스케일 검증, 구조 편집 |
| 시안 | 정적 6개 콘셉트와 참고 JPEG 표시 | 실제 생성 API, 비동기 작업·결과 보관·실패 처리 |
| 방별 보기 | 주방·안방·욕실 참고 사진으로 교체 | 같은 집 구조·콘셉트를 유지한 실제 공간별 생성 |
| 자재 | `MATERIALS` 9개 레코드 검색·필터·정렬·즐겨찾기 | 제품 DB, 허가된 제품 이미지·카탈로그, 임베딩·검색·매칭 |
| 점수 | 하드코딩한 값에 인덱스 보정, 90~98 범위 제한 | 실제 평가된 매칭 알고리즘, 버전·근거·신뢰도 |
| 예산 | 입력 만원 예산 × 콘셉트별 예시 계수 | 가격 출처·수량·단위·기준일·누락 항목을 갖춘 추정 |
| 보관 | 콘셉트 저장·대표 시안 적용·즐겨찾기 | 서버 동기화, 버전 관리, 사용자/조직 격리 |
| 다운로드 | 프로젝트 JSON, BOM 포함 자재 CSV, 참고 JPG, 업로드 원본 | 실제 결과 리포트·원본 보관·권한 있는 다운로드 |
| SketchUp | B2B 도면에서 변환 요청 JSON만 다운로드 | 실제 구조 기반 모델 생성과 검증된 `.skp` 출력 |
| 업체 콘솔 | 고객명·메모·상태 변경·검색·목록 JSON | 실제 업체별 접근 제어, 팀 협업, 고객 검토 |

## 중요 함수와 교체 지점

- `state`, `persist()`: `localStorage['gonggan.v1']`에 프로필·프로젝트·즐겨찾기 저장.
- `db()`, `fileOp()`: IndexedDB `gonggan-files`의 `files` 저장소에 원본 파일 저장.
- `owner()`, `visible()`: `b2b`/`b2c` 문자열에 따라 화면 데이터 필터. 서로 다른 두 B2B 사용자를 구별하지 못한다.
- `start()`, `uploadPage()`, `analyze()`, `createProject()`: 입력 플로우. `analyze()`는 지연 후 샘플 분석 단계로 전환한다.
- `score()`: 실제 AI 호출 없음. 현재 점수를 학습 데이터나 정확도 증거로 쓰면 안 된다.
- `roomImg()`: 방별 정적 사진 선택. 동일 아파트의 일관된 렌더가 아니다.
- `sketchup()`, `prepareSketchup()`: `actualSkpGenerated:false`인 JSON. 확장자를 `.skp`로 바꾸지 않는다.
- `exportJSON()`, `exportCSV()`, `exportImage()`, `exportOriginal()`: 기존 다운로드 UX 재사용 지점.
- `syncLandingScale()`: 뷰포트 / 1230 기준 배율을 CSS 변수로 적용한다. 랜딩만 글자·사진·간격·높이를 함께 확대한다.

## 데이터 이관 시 유의점

기존 프로젝트의 `owner`는 실제 사용자 ID가 아니며 `budget`은 **만원**, `height`는 mm다.
`rooms`는 `{name, area}` 목록일 뿐 벽·개구부·좌표·스케일이 없다.
샘플 이름의 평수와 84㎡ 샘플 면적은 일치한다고 보장할 수 없다.
`sample:true`와 데모 점수는 실제 프로젝트로 조용히 승격시키지 않는다.
서버 이관은 로그인 사용자가 해당 브라우저 데이터의 미리보기를 보고 명시적으로 가져오는 방식으로 한다.
원본 파일이 사라진 프로젝트는 `source_missing`으로 표시한다.

## 자산과 출처

참고 사진은 기존 README에 기록된 Unsplash 자료이며 실제 업로드 도면의 생성물이 아니다.
제품 이름·품번·링크는 과거 제작 시 기록한 LX Z:IN/IKEA 자료로, 이번 인수에서 현재 판매 여부를 재검증하지 않았다.
제품 이미지처럼 보이는 질감 그래픽도 실제 해당 SKU 사진이 아니다.
기존 출처와 라이선스는 `docs/LEGACY_README.md`, `public/assets/*LICENSE*`, `public/data.js`를 보존했다.

## 테스트 이력과 이번 인수의 경계

이전 대화에는 33개 브라우저 검증 통과 기록이 있다. 이것은 당시 데모 검증이며
실제 AI·계정·결제·SKP 기능의 검증이 아니다. 이번 인수의 검증 결과는
`docs/TRANSFER_VALIDATION.md`에 별도로 기록한다.
현재 E2E 파일은 Work의 Playwright/pdf-lib 경로와 과거 Chromium 실행 파일 경로를 하드코딩한다.
Claude 개발 환경에서 패키지 선언과 브라우저 설치 경로를 정리한 후 재실행해야 한다.

## GitHub와 기존 서버의 관계

이 인수본은 기존 Sites 원본에서 분리한 개발용 소스 스냅샷이다. 앱 파일은 그대로 유지한다.
기존 사이트의 원격 소스 저장소와 새 GitHub 저장소는 별개이며, 동기화나 자동 배포가 구성되어 있지 않다.
`.openai/hosting.json`은 기존 사이트 참조용이다. 다른 호스팅에서 Python 개발 서버를 운영 백엔드로 사용하지 않는다.
기존 서버의 사용자 업로드는 이 저장소에 없으며, 브라우저 데이터도 자동 이관되지 않는다.
