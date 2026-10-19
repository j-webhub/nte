# 이환 아카이브

캐릭터, 아크, 공지사항, 공략 게시판, 월페이퍼를 모은 정적 사이트입니다.
실제 사이트 파일은 **`dist/`에서 직접 편집**합니다. 빌드나 패키지 설치는 필요하지 않습니다.

- 사이트: https://j-webhub.github.io/nte/
- [수정할 파일 찾기](docs/EDITING.md)
- [코드 구조](docs/ARCHITECTURE.md)
- [데이터 편집 안내](dist/data/README.md)

## 로컬에서 열기

Node.js 22 이상에서 저장소 폴더를 열고 실행합니다.

```sh
node scripts/serve.mjs
```

브라우저에서 `http://127.0.0.1:8765/`를 엽니다. 종료는 터미널에서 `Ctrl+C`입니다.
HTML 파일을 더블클릭하면 JSON 로딩이 제한되므로 서버 주소로 접속합니다.

## 수정하고 올리기

1. 편집 안내에서 수정할 파일을 찾고 저장합니다.
2. 로컬 화면을 확인하고 아래 명령을 실행합니다.

```sh
node scripts/update-version.mjs
node scripts/check.mjs
node --test tests/*.test.mjs
```

3. GitHub Desktop에서 커밋하고 **Push origin**을 누릅니다.
4. **Actions → Deploy to GitHub Pages**가 성공하면 공개 사이트에 반영됩니다.

`version:assets`는 JS·CSS·JSON 캐시 버전을 한 번에 갱신합니다. `npm install`이나 빌드는 필요하지 않습니다.
