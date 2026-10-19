# 수정할 파일 찾기

내용은 `dist/data/`의 JSON, 동작은 `dist/js/features/`, 디자인은 `dist/css/`에서 수정합니다.

| 수정할 내용 | 파일·폴더 |
| --- | --- |
| 캐릭터 정보·성우·기술명·패시브·각성 | `dist/data/characters/{id}.json` |
| 출시·출시 예정 명단과 S등급 순서 | `dist/data/characters/index.json` |
| 캐릭터 이미지 | `dist/img/character/`와 캐릭터 JSON의 `roster.portraitFile` |
| 프로필 상단·성우 배치·출시 안내 | `dist/js/features/characters/profile.js` |
| 캐릭터 목록·검색·정렬 | `dist/js/features/characters/roster.js` |
| 패시브·도시 스킬 화면 | `dist/js/features/characters/tabs/passives.js` |
| 기술표·계수 화면 | `dist/js/features/characters/tabs/skills.js` |
| 각성·공명 화면 | `dist/js/features/characters/tabs/awakening.js` |
| 전용 아크 화면 | `dist/js/features/characters/tabs/arcs.js` |
| 콘솔·카트리지 화면 | `dist/js/features/characters/tabs/console.js` |
| 성장 재료 화면 | `dist/js/features/characters/tabs/growth.js` |
| 속성 색상·아이콘·탭 이름 | `dist/js/features/characters/catalog.js` |
| 공지 내용 | `dist/data/portal-notices.json` |
| 공지 목록·상세 | `dist/js/features/notices/index.js` |
| 아크 목록·검색 | `dist/js/features/arcs/index.js` |
| 월페이퍼 등록·게시일 | `dist/data/portal-wallpapers.json`, `dist/img/wallpaper/` |
| 월페이퍼 화면·키보드 | `dist/js/features/wallpapers/index.js` |
| 홈 메뉴·소개 문구 | `dist/js/features/home/index.js` |
| 상단 메뉴·사이트 제목 | `dist/index.html` |
| 공략 편집 화면·버튼 | `dist/js/features/guides/index.js` |
| 공략 저장·본문·백업 | `features/guides/`의 `repository.js`, `content.js`, `backup.js`, `archive.js` |
| 공략 파일 한도·허용 글꼴 | `dist/js/features/guides/config.js` |

## 캐릭터 한 명 수정하기

사키리는 `dist/data/characters/sakiri.json`을 엽니다. 기술명과 이미지 이름도 이 파일에서 관리합니다.

| JSON 위치 | 표시 내용 |
| --- | --- |
| `roster.names.ko` | 이름 |
| `roster.portraitFile` | 확장자 포함 이미지 이름. 예: `사키리.webp` |
| `roster.released` | 출시 여부 |
| `roster.plannedGlobalAvailability` | 출시 예정일. 예: `2026-10-21` |
| `setting.summary` | 상단 소개 |
| `setting.birthday`, `faction`, `ability` | 생일·소속·이능력 |
| `detail.voiceActors` | `ko` 한국어, `ja` 일본어, `zhHans` 중국어, `en` 영어 |
| `detail.skillNamesKo` | `basic`, `skill`, `ultimate`, `support` 기술명 |
| `detail.skillDescriptionsKo` | 기술 설명. 문단 구분은 `\n\n` |
| `detail.releaseInfoKo` | 출시 안내의 `schedule` 일정, `reward` 보상, `pending` 추가 안내 |
| `mechanics.level80BaseStats` | 80레벨 능력치 |
| `mechanics.awakeningNamesKo` | A1~A6 각성 이름 |
| `mechanics.awakeningEffectsKo` | `A1: 설명` 형식의 효과 목록 |
| `mechanics.resonanceKo` | `3`, `6` 공명 추가 효과 |
| `fieldSkills.passives` | 고유 패시브 목록 |
| `fieldSkills.citySkills` | 도시 스킬과 레벨별 효과 |
| `coefficients.tables` | 기술별·레벨별 수치 |
| `console` | 콘솔·카트리지 추천 |

스킬·패시브·각성·공명·전용 아크·카트리지 효과의 `「문구」`와 `상속성 이능력 피해`, `령속성 공격` 같은 속성 표현은 `roster.element`의 색상으로 자동 표시됩니다. JSON에는 HTML이나 색상 코드를 넣지 않아도 됩니다. 처리 코드는 `dist/js/features/characters/text.js`, 속성별 색상은 `catalog.js`의 `ELEMENTS`에서 편집합니다.

스킬 레벨업 재료는 `dist/data/nte-character-growth-v1.4.json`의 `skillUpgrades`에서 편집합니다. `levels`는 단계별 수량·코인·돌파 조건, `materials`는 재료명, `characters`는 각 캐릭터의 재료 계열과 출처입니다. 화면 코드는 `dist/js/features/characters/tabs/skill-growth.js`입니다. 자세한 수집 기준은 `docs/research/SKILL-MATERIALS.md`에 정리했습니다.

패시브 한 항목의 형식입니다. `unlock`은 확인된 경우에만 입력합니다.

```json
{
  "nameKo": "패시브 이름",
  "unlock": "",
  "effectKo": "첫 번째 줄입니다.\n두 번째 줄입니다."
}
```

`detail.coreMechanicKo`는 참고 데이터로 보존되지만 화면에는 표시하지 않습니다.
아카네의 별도 고유 패시브 빈 영역은 `tabs/index.js`의 `includeUniquePlaceholder` 옵션에서 관리합니다.

## 캐릭터 추가하기

1. 기존 JSON을 복사해 `characters/{새-id}.json`을 만듭니다.
2. 최상위 `id`, `roster.id`, 내부 `detail.id` 등 캐릭터 ID를 맞춥니다.
3. `roster.portraitFile`을 입력하고 `img/character/`에 파일을 넣습니다.
4. 기술명 4개를 `detail.skillNamesKo`에 입력합니다.
5. `index.json`의 `releasedCharacterIds` 또는 `upcomingCharacterIds`에 넣고 `roster.released`도 맞춥니다.
6. S등급 순서는 `displayCharacterIds`에 지정합니다. A등급은 이름순입니다.
7. 필요하면 아크·성장 재료 파일에도 연결을 추가합니다.

이미지·기술명 등록을 위해 JavaScript 명단을 수정할 필요가 없습니다.

## 디자인 수정하기

`dist/styles.css`에는 불러오는 순서만 있습니다. 실제 규칙은 `dist/css/`에 속성별로 줄을 나눠 정리했습니다.

| 파일 | 담당 영역 |
| --- | --- |
| `base.css` | 공통 색상·글꼴·기본 레이아웃 |
| `characters.css` | 캐릭터 목록·프로필·탭·공통 카드 |
| `characters-mobile.css` | 캐릭터 모바일 추가 규칙 |
| `layout.css` | 상단 메뉴·페이지 레이아웃 |
| `home.css` | 홈 |
| `portal.css` | 일반 페이지 제목·필터 |
| `notices.css`, `notices-detail.css` | 공지 목록·상세 |
| `arcs.css` | 아크 DB |
| `guides.css` | 공략 게시판·편집기 |
| `wallpapers.css` | 월페이퍼·확대 화면 |
| `responsive.css` | 공통 빈 화면·포털·게시판·월페이퍼 반응형 규칙 |

우선순위를 보존하기 위해 CSS의 불러오는 순서를 유지합니다. 공통 색상은 `base.css`의 `:root` 변수를 먼저 수정합니다.

## 저장 후 확인

```sh
node scripts/update-version.mjs
node scripts/check.mjs
node --test tests/*.test.mjs
```

검사를 통과하면 GitHub Desktop에서 커밋하고 푸시합니다. `dist/`를 그대로 배포하므로 복사·빌드 단계는 없습니다.
공략 게시판에서 직접 쓴 글과 첨부파일은 현재 브라우저의 IndexedDB에 저장됩니다. JSON과 별개이며 브라우저를 바꾸기 전 게시판에서 백업합니다.
