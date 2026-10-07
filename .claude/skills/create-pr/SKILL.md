---
name: create-pr
description: 현재 브랜치의 변경사항을 분석해 GitHub Pull Request를 생성한다. 프로젝트 언어(해외 오픈소스는 영문, 한국 프로젝트는 한국어)에 맞는 템플릿을 references에서 골라 사용한다. "PR 만들어줘", "풀리퀘스트 생성", "create pr", "/create-pr" 같은 요청에 활성화한다.
context: fork
allowed-tools: Bash, Read, Grep, Glob
---

# create-pr

현재 브랜치의 변경사항을 분석해 Pull Request를 생성한다. `context: fork`로 실행되므로 서브에이전트가 독립 컨텍스트에서 PR 생성까지 끝내고, 결과(PR URL과 요약)만 메인 대화로 돌려준다.

## 템플릿

| 템플릿 | 파일 | 사용 조건 |
|--------|------|-----------|
| 영문 | `references/template.en.md` | 해외 오픈소스 프로젝트 |
| 한국어 | `references/template.ko.md` | 한국 프로젝트 |

## 절차

### 1. 사전 확인

```bash
git rev-parse --is-inside-work-tree
gh auth status
git branch --show-current
git status --short
git remote -v
```

- 인증이 안 되어 있으면 `! gh auth login`을 안내하고 끝낸다.
- 커밋하지 않은 변경이 있으면 알린다. 커밋은 이 스킬의 책임이 아니므로 `commit` 스킬을 쓰도록 안내하고, PR에는 커밋된 내용만 담긴다고 설명한다.
- 현재 브랜치가 기본 브랜치(`gh repo view --json defaultBranchRef -q .defaultBranchRef.name`)이면 PR을 만들 수 없다. 새 브랜치를 만들어 달라고 안내하고 끝낸다.
- 이미 열린 PR이 있는지 확인한다(`gh pr list --head <브랜치> --state open`). 있으면 새로 만들지 않고 그 URL을 알린다.

### 2. 변경사항 분석

base는 기본 브랜치로 한다. fork라면 upstream의 기본 브랜치를 base로 한다.

```bash
git fetch origin
git log --oneline <base>..HEAD
git diff <base>...HEAD --stat
git diff <base>...HEAD
```

- 커밋 로그만 믿지 말고 diff를 읽어 실제 변경 목적을 파악한다.
- 커밋이 0개이면 알리고 끝낸다.
- `.env`, 키·토큰 등 비밀 정보가 diff에 있으면 PR을 만들지 말고 알린다.

### 3. 템플릿 언어 결정

아래 신호를 위에서부터 보고 첫 번째로 명확한 결론을 따른다.

1. **저장소 자체 PR 템플릿**: `.github/pull_request_template.md` 등이 있으면 그 언어와 구조를 따른다(references 템플릿은 쓰지 않는다).
2. **fork 여부**: fork이면 upstream 저장소(`gh repo view --json isFork,parent`)의 프로젝트 성격을 기준으로 한다.
3. **프로젝트 문서의 언어**: `README.md`, `CONTRIBUTING.md`, `AGENTS.md`/`CLAUDE.md`가 한국어이면 한국어, 영어이면 영문.
4. **기존 이력의 언어**: `git log -20`과 `gh pr list --state all --limit 10`의 제목·본문 언어.
5. **저장소 소유자와 컨텍스트**: 한국어 이슈·토론 중심이거나 한국 조직/개인 프로젝트이면 한국어.

- 신호가 서로 엇갈리면 프로젝트 문서(3번)와 기존 이력(4번)을 우선한다.
- 끝까지 판단이 안 되면 영문을 기본으로 하고, 어떤 근거로 골랐는지 최종 보고에 적는다.
- 사용자가 인자로 `en`/`ko`를 명시하면 판단 없이 그것을 따른다.

선택한 템플릿 파일을 Read로 읽어 구조를 그대로 따른다.

### 4. PR 제목과 본문 작성

- 제목은 템플릿 파일의 규칙을 따른다. 저장소 커밋 컨벤션(Conventional Commits 등)이 있으면 맞춘다.
- 본문은 템플릿의 섹션을 모두 유지하고, 해당 없는 섹션은 지우지 말고 "해당 없음"/"N/A"로 둔다.
- 변경 요약은 diff에서 확인한 사실만 쓴다. 실행하지 않은 테스트를 통과했다고 쓰지 않는다. 테스트 체크박스는 실제로 돌려 확인한 것만 체크한다.
- 관련 이슈 번호는 브랜치명·커밋 메시지에 근거가 있을 때만 적는다.
- 본문 끝에 현재 환경이 지정한 PR 설명 귀속 문구가 있으면 그것을 붙인다.

### 5. 푸시와 PR 생성

```bash
git push -u origin <브랜치>      # 원격에 없을 때만
gh pr create --base <base> --head <브랜치> --title "<제목>" --body-file <임시파일>
```

- 본문은 임시 파일로 만들어 `--body-file`로 전달한다(따옴표·줄바꿈 깨짐 방지). 생성 후 임시 파일을 지운다.
- 이 스킬을 호출한 것이 PR 생성에 대한 승인이다. 단 `--force` 푸시, 기본 브랜치 푸시, 히스토리 재작성은 하지 않는다.
- `--draft`는 사용자가 요청했을 때만 쓴다.

### 6. 결과 보고

메인 대화로 아래만 짧게 돌려준다(한국어).

- PR URL
- 사용한 템플릿(en/ko)과 선택 근거 한 줄
- 제목, base ← head 브랜치
- 확인하지 못했거나 건너뛴 항목(테스트 미실행, 이슈 연결 없음 등)

## 하지 말 것

- 기본 브랜치에서 PR 만들기, 이미 열린 PR 중복 생성
- 커밋되지 않은 변경을 임의로 커밋하기
- 비밀 정보가 포함된 diff로 PR 만들기
- 확인하지 않은 테스트 결과나 이슈 번호를 본문에 쓰기
- 템플릿 섹션 구조를 임의로 바꾸기
