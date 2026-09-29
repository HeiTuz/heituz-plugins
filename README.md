# HeiTuz plugins

HeiTuz 스킬을 Codex · Claude Code · ChatGPT에 설치하는 플러그인 마켓플레이스입니다. 마켓플레이스 이름은 `heituz`입니다.

| 플러그인 | 설명 | 정본 |
|---|---|---|
| `mpw` | 거친 요청을 결과·검증까지 닫힌 프롬프트로 바꾸는 작성·검토 스킬 | [HeiTuz/MPW](https://github.com/HeiTuz/MPW) |

## 설치

**Codex**

```sh
codex plugin marketplace add HeiTuz/heituz-plugins
codex plugin add mpw@heituz
```

**Claude Code**

```sh
claude plugin marketplace add HeiTuz/heituz-plugins
claude plugin install mpw@heituz
```

**ChatGPT (워크스페이스)**: 관리자가 Workspace settings → Plugins → Add → Import marketplace에 `https://github.com/HeiTuz/heituz-plugins`를 넣습니다. 가져온 플러그인은 매일 동기화됩니다.

설치 후 새 세션에서 적용됩니다. 직접 부를 때는 Codex `$mpw:mpw`, Claude Code `/mpw:mpw`, ChatGPT `@mpw`를 씁니다.

## 업데이트

```sh
codex plugin marketplace upgrade heituz && codex plugin add mpw@heituz
claude plugin marketplace update heituz && claude plugin update mpw@heituz
```

## 구조

이 저장소에는 카탈로그만 있습니다. 각 플러그인 본체는 정본 저장소의 배포 브랜치에 있고, 카탈로그 항목이 `git-subdir`로 릴리스 태그와 커밋을 고정합니다.

```
.agents/plugins/marketplace.json   Codex · ChatGPT
.claude-plugin/marketplace.json    Claude Code
scripts/bump.mjs                   두 카탈로그의 핀을 함께 갱신·추가
scripts/check.mjs                  두 카탈로그의 일치와 핀 존재 확인 (CI)
```

새 플러그인 추가와 버전 갱신 절차는 [AGENTS.md](AGENTS.md)에 있습니다.

## License

MIT
