# 캐릭터 데이터 편집 안내

전체 편집 위치와 예시는 저장소의 `docs/EDITING.md`, 코드 구조는 `docs/ARCHITECTURE.md`에 정리되어 있습니다.

## 파일 구성

- `characters/index.json`: 출시·출시 예정 ID와 공통 정보, `displayCharacterIds`의 S등급 표시 순서를 관리합니다. A등급은 이름순입니다.
- `characters/{id}.json`: 캐릭터 한 명의 기본 명단 정보, 설정, 소개, 한국어 자료로 확인한 스킬 요약과 각성 1~6 효과, 각성 3·6회 추가 효과, 콘솔 추천, 필드 스킬, 레벨별 계수(`coefficients`)와 출처(`r3`, `crosscheck` 포함)를 모읍니다. 계수는 원자료 출처를 함께 표시하며 국내 자료로 검증 완료한 값이라고 표시하지 않습니다. 도시 스킬은 `fieldSkills.citySkills`에 레벨별로 저장하고, `categoryKo`는 적용 분야를 뜻합니다. 도시 활동 목록과는 별도이며, 미확인 레벨은 빈 문자열로 둡니다. 백장 패시브의 지정 용어는 「스코치」입니다. 파일 이름과 `id`, `roster.id`는 같은 영문 ID를 사용합니다.
- `character-data-meta-v1.4.json`: 기존 데이터 묶음의 공통 출처와 버전을 보관합니다. 스킬·각성 데이터는 각 캐릭터 파일의 국내 한국어 출처를 기준으로 확인합니다.
- `nte-cartridge-sets-v1.4.json`: 여러 캐릭터가 함께 사용하는 카트리지 세트 정의를 보관합니다. 캐릭터별 추천은 각 캐릭터 파일의 `console`에 있습니다.
- `nte-character-signature-arcs-v1.4.json`: 전용 아크는 별도 파일로 관리합니다. R1·R5 수치 쌍은 `rankInterpolationPairs`에 0부터 시작하는 숫자 토큰 위치로 지정하며, 화면에서 R2~R4를 선형 보간합니다.
- `nte-character-growth-v1.4.json`: 성장 재료는 별도 파일로 관리합니다.
- `portal-notices.json`: 공식 한국 사이트의 공지·뉴스·이벤트를 날짜, 분류, 제목, 한국어 요약과 원문 링크로 저장합니다. 2026년 10월 8일 기준 공식 목록 24페이지의 72건을 수록했으며, 공지 탭은 12건씩 페이지를 나눠 보여줍니다. 상세 정보가 확인된 글에는 `sections`를 추가하고, 나머지는 공식 원문 링크를 제공합니다. 공지 제목을 누르면 사이트 안에서 상세 화면을 열고, 주소에 공지 ID가 포함되어 직접 열기와 뒤로 가기도 지원합니다. 새 소식을 추가할 때 원문 URL과 확인된 한국어 요약·세부 항목을 입력합니다.
- `portal-guides.json`: 공략 게시판에 등록할 공략 제목, 분류, 날짜, 요약과 링크를 저장합니다.
- `portal-wallpapers.json`: 월페이퍼 제목, X 게시일, 이미지 URL, 공식 게시물 URL과 대체 텍스트입니다. 최신 날짜순이며 게시일은 확대 화면에서 표시합니다. `wallpaper-x-2026-10-16-b.jpg` 형식을 사용하고 같은 날짜·게시물·알파벳의 PC·모바일 파일은 한 카드에서 넘겨봅니다.

## 이미지 구성

- `img/character/`: 캐릭터 WebP 일러스트입니다. 캐릭터 JSON의 `roster.portraitFile`에 확장자를 포함한 파일명을 입력합니다. 예: `아카네.webp`.
- `img/icon/`: 6개 속성 아이콘을 투명 WebP 한 형식으로 보관합니다. PNG와 WebP가 중복되던 아이콘은 PNG 원본을 무손실 변환해 투명도와 해상도를 보존했습니다.
- `img/arc-type/`: 고체·기체·액체·플라즈마·결합의 투명 WebP 아이콘입니다. 2026-10-20에 `https://nte.hq1.pro/ko/characters`에서 사용하는 `YH_UI_icon_{solid,gas,liquid,plasma,boson}.webp`를 수집했습니다. 타입별 파일 연결은 `catalog.js`의 `ARC_TYPE_ICON_FILES`에서 관리합니다.
- `img/wallpaper/`: 월페이퍼 이미지입니다. 카드와 확대 화면은 `portal-wallpapers.json`의 `imageUrl`로 파일을 연결합니다.

## 캐릭터를 추가할 때

1. `characters/{영문 ID}.json` 파일을 만들고 기존 캐릭터 파일의 필드 구조를 복사합니다.
2. 그 파일의 `id`와 `roster.id`를 같은 ID로 바꾸고 캐릭터 데이터를 채웁니다.
3. 아직 확인하지 못한 자료는 `null` 또는 빈 배열로 둡니다. JSON에는 주석이나 마지막 항목 뒤의 쉼표를 넣지 않습니다.
4. 출시된 캐릭터면 `releasedCharacterIds`, 출시 예정이면 `upcomingCharacterIds`에 ID를 추가합니다. S등급 표시 순서는 `displayCharacterIds`로 지정하고, A등급은 이름순으로 정렬합니다.
5. 전용 아크 연결 정보와 성장 재료는 기존 아크·성장 파일에서 별도로 갱신합니다.

캐릭터별 자료의 출처 링크는 각 캐릭터 파일과 `character-data-meta-v1.4.json`에서 확인할 수 있습니다. 공통 출처 목록은 `nte-character-sources.md`에 정리되어 있습니다.

## 코드 수정 없이 바꿀 수 있는 필드

- `roster.portraitFile`: 확장자를 포함한 일러스트 파일명
- `detail.skillNamesKo`: `basic`, `skill`, `ultimate`, `support` 기술명
- `detail.releaseInfoKo`: 출시 예정 안내의 `schedule`, `reward`, `pending`
- `detail.voiceActors`: `ko`, `ja`, `zhHans`, `en` 성우
- `fieldSkills.passives`: `nameKo`, `effectKo`, 확인된 경우에만 `unlock`

저장 후 저장소 폴더에서 `node scripts/update-version.mjs`, `node scripts/check.mjs`, `node --test tests/*.test.mjs`를 실행하고 GitHub Desktop에서 커밋·푸시합니다. `dist/`가 실제 배포 소스라 빌드는 필요하지 않습니다.
