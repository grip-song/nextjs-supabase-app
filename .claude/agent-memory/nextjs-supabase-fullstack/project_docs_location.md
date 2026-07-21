---
name: project_docs_location
description: ROADMAP.md 등 기획 문서가 루트가 아닌 docs/ 디렉토리 아래에 있음
metadata:
  type: reference
---

로드맵 문서는 루트의 `ROADMAP.md`가 아니라 `docs/ROADMAP.md`에 위치한다
(`shrimp-rules.md`, `CLAUDE.md`, `README.md`는 루트에 있음).

**Why:** 프로젝트 루트를 관습적으로 가정하고 바로 읽으면 파일을 찾지 못한다.

**How to apply:** 로드맵/기획 문서를 참조해야 할 때는 `docs/` 하위도 함께 확인할 것.
