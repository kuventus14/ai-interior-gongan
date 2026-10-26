# 공간 · AI Interior Studio

**상상을, 실제 공간으로.**

도면과 SketchUp 스크린샷에서 인테리어 시안을 탐색하고 실제 자재를 추천받는
데스크탑 우선 플랫폼의 현재 데모 소스 및 실제 서비스 개발 인수 자료입니다.

현재 웹사이트: https://gonggan-interior-studio.twn4nkfqjp.chatgpt.site

> 현재 앱은 정적 데모입니다. 실제 AI·계정 인증·DB·주소 검색·결제·SKP 출력은
> 아직 연결되지 않았습니다. 앞으로 구현할 명세와 현재 구현 상태를 구분해 주세요.

## 바로 실행

Python 3만으로 현재 데모를 실행할 수 있습니다. Node 패키지 설치나 API 키는 필요하지 않습니다.

```bash
cd ai-interior-gongan
python3 server.py --port 5173
```

브라우저에서 http://127.0.0.1:5173 을 열고 **데모 워크스페이스 둘러보기**를 선택합니다.
서버 종료는 실행한 터미널에서 Ctrl+C입니다.

정적 배포 파일 생성:

```bash
python3 build.py
```

`dist/`에 결과가 생성됩니다. `server.py`는 개발용 정적 서버이며 인증·AI를 처리하는 운영 서버가 아닙니다.

## Claude Code 개발 인수

| 파일 | 내용 |
|---|---|
| [CLAUDE.md](CLAUDE.md) | 프로젝트의 짧은 기본 지침과 변경 금지 조건 |
| [현재 구현 상태](docs/CURRENT_STATE.md) | 실제 소스 파일·함수·데모 데이터·기술 한계 |
| [제품 상세 명세](docs/PRODUCT_SPEC.md) | 전체 제품 목표·사용자 흐름·주소/도면·AI·자재·SketchUp·구독 |
| [구현 계획](docs/IMPLEMENTATION_PLAN.md) | 권장 구조·테이블·API·작업 큐·개발 단계·수용 테스트 |
| [Claude 시작 요청문](docs/CLAUDE_START_PROMPT.md) | 저장소에서 Claude Code에 바로 전달할 요청문 |
| [진행 기록](docs/PROGRESS.md) | 완료/미완료와 다음 작업, 필요한 외부 입력 |
| [이관 검증](docs/TRANSFER_VALIDATION.md) | 이번 인수본의 검사 범위와 결과 |
| [기존 README](docs/LEGACY_README.md) | 원래 기능 안내와 자산 출처 보존 |

저장소 폴더를 Claude Code로 연 뒤 `docs/CLAUDE_START_PROMPT.md`의 요청문을 전달하면 됩니다.
개발 요구사항은 문서에 적혀 있지만, 새 서버 아키텍처가 이미 구현되어 있는 것은 아닙니다.

## 현재 가능한 데모

- B2B/B2C 프로필 체험, 프로젝트 목록과 업체 콘솔.
- PDF/JPG/PNG/WebP 업로드와 20MB 검사, 콘셉트·예산·층고 입력.
- 샘플 분석 면적 수정, 6개 콘셉트·참고 사진, 최대 3개 비교.
- 9개 예시 제품 검색·즐겨찾기·공식 출처 열기.
- 프로젝트 JSON·자재 CSV·참고 이미지·업로드 원본 다운로드.
- B2B 도면 프로젝트의 SketchUp 변환 요청 JSON. 실제 `.skp`는 생성하지 않음.

프로젝트 메타데이터는 localStorage, 원본 파일은 IndexedDB에 보관됩니다.
같은 브라우저의 역할별 분리는 보안 인증이 아닙니다. 다른 기기나 사용자와 자동 공유되지 않습니다.

## 검증 명령

```bash
node --check public/app.js
node --check public/data.js
python3 build.py
```

`tests/e2e.cjs`는 기존 작업 환경의 Playwright/pdf-lib 및 Chromium 경로에 의존합니다.
일반 개발 PC에서 실행하려면 먼저 경로와 의존성을 이식해야 합니다.
이번 인수에서 과거의 33개 브라우저 검증을 재실행했다고 주장하지 않습니다.

## 배포·보안·자산

- `.openai/hosting.json`은 기존 Sites 프로젝트를 가리킵니다. 새 GitHub 저장소와 자동 동기화되지 않습니다.
- 이번 인수는 현재 앱 화면/기능을 바꾸지 않고 문서를 추가한 것입니다. 기존 사이트 재배포도 하지 않습니다.
- API 키, `.env`, 고객 도면, DB 덤프, 세션 토큰은 Git에 포함하지 않습니다.
- 폰트/아이콘 라이선스는 `public/assets/`에 있습니다. 사진과 제품 정보 출처는 기존 README에 보존했습니다.
- 실제 서비스 전환 시 제품 판매 여부·자산 이용 범위·데이터 공급 계약을 재확인하세요.

인수 기준 원본 커밋: `a4b2d7ee0ed26a569718cdb5dd1056d008f36434` (2026-10-24 복원).
