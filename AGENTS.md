# AGENTS.md — heituz-plugins 카탈로그 규칙

이 저장소는 HeiTuz 플러그인 마켓플레이스 `heituz`의 **카탈로그**다. 플러그인 본체를 여기에 복사하지 않는다. 본체는 각 정본 저장소가 만들어 배포 브랜치에 올리고, 여기서는 그 위치와 버전 핀만 관리한다.

## 불변식

- 마켓플레이스 이름 `heituz`와 기존 플러그인 이름은 바꾸지 않는다. 설치명(`<plugin>@heituz`)이 사용자 설정에 저장된다.
- `.agents/plugins/marketplace.json`(Codex·ChatGPT)과 `.claude-plugin/marketplace.json`(Claude Code)은 같은 플러그인 목록, 같은 `url`·`path`·`ref`·`sha`를 가진다. 손으로 한쪽만 고치지 않는다 — `scripts/bump.mjs`를 쓴다.
- 핀은 정본 저장소의 릴리스 태그(`<plugin>-plugin-v<버전>`)와 그 태그가 가리키는 40자 커밋 SHA다. `main` 같은 움직이는 브랜치를 핀으로 쓰지 않는다.
- 플러그인 순서는 표시 순서다. 새 항목은 뒤에 추가한다.

## 버전 갱신

정본 저장소에서 릴리스 태그를 push한 뒤:

```sh
node scripts/bump.mjs mpw mpw-plugin-v3.0.1
node scripts/check.mjs
git commit -am "Pin mpw to mpw-plugin-v3.0.1" && git push
```

`bump.mjs`는 `git ls-remote`로 태그의 커밋 SHA를 찾아 두 카탈로그에 함께 기록한다.

## 새 플러그인 추가

1. 정본 저장소에 `plugins/<name>/`(`.codex-plugin/plugin.json`, `.claude-plugin/plugin.json`, `skills/`)를 만드는 빌드와 배포 브랜치 릴리스를 준비하고 태그를 push한다. MPW의 `scripts/build_plugin.mjs`·`scripts/release_plugin.mjs`가 기준 구현이다.
2. 이 저장소에서 항목을 추가한다:
   ```sh
   node scripts/bump.mjs <name> <tag> --url https://github.com/HeiTuz/<repo>.git --path ./plugins/<name> \
     --description "<한 줄 설명>" --category Productivity
   ```
3. 격리한 `CODEX_HOME`·`CLAUDE_CONFIG_DIR`에서 marketplace add → 설치 → 캐시 확인을 한 뒤 push한다.
4. README의 플러그인 표에 행을 추가한다.

작은 스킬은 이 저장소 `plugins/<name>/`에 직접 두고 `"source": "local"`(Codex)·`"./plugins/<name>"`(Claude)로 연결해도 된다. 그 경우 이 저장소가 그 스킬의 정본이 된다.
