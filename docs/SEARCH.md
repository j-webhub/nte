# 검색용 페이지와 배포

## 주소

- 홈: `/nte/`
- 캐릭터 목록: `/nte/characters/`
- 캐릭터 상세: `/nte/characters/akane-rin/`
- 캐릭터 탭: `/nte/characters/akane-rin/skills/`, `awakening/`, `arcs/`, `console/`, `growth/`
- 아크: `/nte/arcs/`
- 공지: `/nte/notices/`와 `/nte/notices/{id}/`
- 공략: `/nte/guides/`
- 월페이퍼: `/nte/wallpapers/`

기존 `#characters/{id}`, `#notices/{id}`, `#home` 주소는 JavaScript가 새 주소로 바꿔 같은 화면을 엽니다.

## 생성 방식

`templates/shell.html`이 공통 문서 틀입니다. `dist/index.html`은 생성 결과이므로 공통 틀을 바꾸려면 템플릿을 편집합니다.

`node scripts/build-pages.mjs` 또는 `npm run build`로 데이터에서 실제 본문 HTML, 페이지별 제목·설명·canonical·공유 메타데이터·구조화 데이터를 생성합니다. 캐릭터 기본 페이지와 각 탭, 공지 상세도 독립된 `index.html`로 저장하므로 GitHub Pages에서 직접 접속·새로고침할 수 있습니다. 화면은 기존 렌더러를 사용하며 브라우저에서는 기존 필터·탭·계산 기능이 이어집니다.

`node scripts/update-version.mjs 버전명`도 마지막에 페이지 생성기를 실행합니다. GitHub Actions는 배포 전에 항상 페이지를 새로 만듭니다. 생성된 하위 페이지 디렉터리는 Git에서 제외하며, 저장소에는 데이터·템플릿·렌더러·생성기를 관리합니다.

배포 주소를 옮기면 `dist/js/config/site.js`의 `SITE_URL`과 `templates/shell.html`의 `<base>` 및 기본 메뉴 링크를 함께 수정합니다.

## 검색 등록

- 사이트 주소: `https://j-webhub.github.io/nte/`
- 사이트맵: `https://j-webhub.github.io/nte/sitemap.xml`
- Google Search Console에서 위 사이트를 URL 접두어 속성으로 등록하고 소유 확인 후 사이트맵을 제출합니다.
- 네이버 서치어드바이저도 사이트 소유 확인 후 사이트맵을 제출합니다.
- 소유 확인용 메타 태그를 발급받으면 `templates/shell.html`의 `<head>`에 넣습니다.

검색 등록은 계정 소유자가 진행하며 색인·검색 순위는 보장되지 않습니다. 프로젝트 경로의 `/nte/robots.txt`는 사이트맵 정보를 담지만, 검색로봇의 접근 정책은 도메인 루트 `/robots.txt`에서 읽으므로 프로젝트 파일만으로 루트 정책을 바꿀 수는 없습니다.

## 현재 범위

직접 작성한 공략 글은 브라우저 IndexedDB에만 저장되는 구조이므로 다른 방문자나 검색엔진에 공개되지 않습니다. 공개 공략 글의 검색 노출을 원하면 공략 본문을 배포 데이터에 포함하거나 공유 서버를 추가해야 합니다. 이번 변경은 해당 저장 방식을 바꾸지 않습니다.

사이트와 이미 공개된 게임 리소스는 기존 비공식 팬 사이트 안내 및 출처를 유지합니다.
