# PR Template (English)

Use for overseas open-source projects. Write title and body in English.

## Title

- Imperative mood, under 72 characters, no trailing period.
- Follow the repository's convention if one exists (e.g. Conventional Commits: `feat: add prompt length limit`).

## Body

```markdown
## Summary

<1-3 sentences: what this PR does and why.>

## Changes

- <Key change 1>
- <Key change 2>

## Motivation / Context

<Why this change is needed. Link the issue or discussion if one exists.>

Closes #<issue number>

## How to Test

1. <Step to reproduce or verify>
2. <Expected result>

## Checklist

- [ ] Tests added or updated
- [ ] Lint, tests, and build pass locally
- [ ] Documentation updated (if needed)
- [ ] No secrets or unrelated changes included

## Screenshots / Notes

<UI changes: before/after. Otherwise "N/A". Mention breaking changes or follow-ups here.>
```

## Rules

- Keep every section. Write `N/A` for sections that do not apply.
- Remove the `Closes #` line when there is no related issue.
- Check a box only if it was actually verified.
