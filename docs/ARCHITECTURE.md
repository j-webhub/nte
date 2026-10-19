# 코드 구조

브라우저 ES 모듈을 사용하는 정적 사이트입니다. 프레임워크·번들러·외부 패키지 없이 실행합니다.

```text
dist/
  index.html                 HTML 셸과 상단 메뉴
  styles.css                 CSS 불러오는 순서
  css/                       영역별 스타일
  js/
    app.js                   기능 연결과 시작
    config/                  캐시·페이지 크기·데이터 경로
    core/
      state.js               공유 화면 상태
      data.js                JSON 로딩·ID 검증
      dom.js                 DOM·이스케이프·숫자·푸터
      router.js              메뉴·주소·뒤로 가기·초기화
    shared/arc-ranks.js       공통 아크 단계 계산
    features/
      home/                  홈
      notices/               공지 목록·상세
      arcs/                  아크 목록·검색
      wallpapers/            월페이퍼·확대·키보드
      guides/                UI·저장·본문·백업
      characters/
        index.js             캐릭터 이벤트
        catalog.js           분류·아이콘·탭 이름
        model.js             데이터 조회
        roster.js            목록·검색·정렬
        profile.js           프로필·출시 안내
        sources.js           출처
        tabs/                패시브·기술·각성·아크·콘솔·성장
  data/                      편집 가능한 JSON
  img/                       이미지
scripts/                     미리보기·검사·캐시 갱신
tests/                       데이터·렌더링·백업 검사
docs/                        편집·구조 안내
```

## 실행 흐름

1. `index.html`이 `js/app.js`를 엽니다.
2. `app.js`가 기능별 초기화·렌더 함수를 라우터에 등록합니다.
3. `core/data.js`가 공통·캐릭터 JSON을 읽습니다.
4. `core/router.js`가 주소에 맞는 화면을 렌더링합니다.
5. 기능별 `index.js`가 클릭·입력·키보드를 처리합니다.

라우터는 기능을 직접 import하지 않고 `app.js`에서 전달받은 함수를 사용합니다.
공통 모듈은 기능 모듈을 참조하지 않고 캐릭터 탭은 프로필 전체 화면을 참조하지 않습니다.

## 재배치 내용

| 이전 | 현재 |
| --- | --- |
| `dist/pages.js`의 여러 기능 | `js/features/` 화면별 모듈 |
| `dist/common.js`의 상태·로딩·라우팅·도우미 | `js/core/`, `js/config/` |
| `dist/guide-board.js`의 UI·DB·본문·ZIP | `features/guides/` 역할별 파일 |
| 코드에 있던 기술명·이미지 이름 | 캐릭터 JSON의 `detail.skillNamesKo`, `roster.portraitFile` |
| 코드에 있던 S등급 순서 | `characters/index.json`의 `displayCharacterIds` |
| 아카네 출시 안내 본문 | `detail.releaseInfoKo` |
| 한 줄에 모인 CSS | 순서를 보존한 영역별 CSS |
| 수동 캐시 문자열 수정 | `node scripts/update-version.mjs` |

이전 JS 파일은 중복 편집을 막기 위해 제거했습니다. `dist/js/`가 실제 실행 소스입니다.
공략 IndexedDB 이름·스키마 버전·게시글 ID·백업 포맷은 유지했습니다.

## 검증과 배포

- `node scripts/check.mjs`: 문법, 모듈 경로, 캐시 버전, JSON, ID·출시 구분, 기술명·이미지 참조를 검사합니다.
- `node --test tests/*.test.mjs`: 데이터 로딩, 필수·선택 자료 누락, 중복 ID, 전체 캐릭터 탭·기술 레벨 경계, HTML 이스케이프, 월페이퍼 게시일, ZIP 백업 왕복·손상·중복 경로를 검사합니다.
- 이번 재배치에서는 HTML 출력 317개와 전체 CSS 선언 순서가 이전 코드와 동일함을 확인했습니다.

자동 검사는 브라우저 레이아웃·IndexedDB 접근·파일 선택 창 전체를 대신하지 않습니다. UI 수정 후 `node scripts/serve.mjs`로 해당 메뉴도 확인합니다.
`.github/workflows/pages.yml`이 `main` 푸시 시 `dist/`를 GitHub Pages에 올립니다. 검사 스크립트와 문서는 배포 폴더 밖에 있습니다.
`.openai/hosting.json`은 기존 연결 정보로 보존했으며 현재 GitHub Pages 배포는 위 워크플로를 사용합니다.
