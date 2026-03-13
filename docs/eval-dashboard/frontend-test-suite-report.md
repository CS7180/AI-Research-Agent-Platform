# Eval Dashboard - Frontend Test & Coverage Report

Generated at: 2026-03-13 12:47:07 PDT
Repository: AI-Research-Agent-Platform
Commit: 3293feb

## Scope
Executed in frontend:

```bash
npm run test
npm run test:coverage
```

## 70% Coverage Standard (Implemented)
To align with `.agents/rules.md` frontend target (components/hooks), coverage is now enforced in Jest:
- `collectCoverageFrom`: `src/components/**/*.{ts,tsx}`, `src/hooks/**/*.{ts,tsx}`
- `coverageThreshold.global`: statements/branches/functions/lines all `>= 70`

Configuration file:
- `frontend/jest.config.mjs`

## Test Scale
- Test suites: 23
- Tests: 68
- Main coverage includes chat, documents, ui, navbar components

## Result: npm run test
- Status: PASSED
- Test Suites: 23 passed, 23 total
- Tests: 68 passed, 68 total
- Time: 2.815 s

## Result: npm run test:coverage
- Status: PASSED
- Test Suites: 23 passed, 23 total
- Tests: 68 passed, 68 total
- Time: 2.662 s

Coverage summary:
- Statements: 89.29% (292/327)
- Branches: 72.15% (114/158)
- Functions: 88.42% (84/95)
- Lines: 90.97% (262/288)

Conclusion:
- All enforced metrics are above the 70% threshold.

Coverage artifacts:
- `frontend/coverage/index.html`
- `frontend/coverage/lcov-report/index.html`
- `frontend/coverage/lcov.info`

## Raw Output (test:coverage)
```text

> frontend@0.1.0 test:coverage
> jest --runInBand --coverage

PASS src/components/documents/StorageDashboard.test.tsx
PASS src/components/chat/ChatArea.test.tsx
PASS src/components/documents/ActionMenu.test.tsx
PASS src/components/documents/DangerZone.test.tsx
PASS src/components/documents/DocumentTable.test.tsx
PASS src/components/documents/KnowledgeSidebar.test.tsx
PASS src/components/documents/DocumentRow.test.tsx
PASS src/components/ui/ConfirmModal.test.tsx
PASS src/components/documents/PageUploadDropzone.test.tsx
PASS src/components/documents/UploadDropzone.test.tsx
PASS src/components/chat/ChatInput.test.tsx
PASS src/app/login/LoginCard.test.tsx
PASS src/app/settings/SettingsCard.test.tsx
PASS src/components/documents/RenameModal.test.tsx
PASS src/components/Navbar.test.tsx
PASS src/components/chat/ChatItem.test.tsx
PASS src/components/chat/SourcesCard.test.tsx
PASS src/components/chat/ChatSidebar.test.tsx
PASS src/components/ui/Avatar.test.tsx
PASS src/components/chat/ChatMessage.test.tsx
PASS src/components/ui/StatusBadge.test.tsx
PASS src/backend/client.test.ts
PASS src/backend/shared.test.ts
-------------------------|---------|----------|---------|---------|-------------------
File                     | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s 
-------------------------|---------|----------|---------|---------|-------------------
All files                |   89.29 |    72.15 |   88.42 |   90.97 |                   
 components              |   93.75 |    66.66 |     100 |     100 |                   
  Navbar.tsx             |   93.75 |    66.66 |     100 |     100 | 32-39             
 components/chat         |   92.72 |    80.95 |     100 |      96 |                   
  ChatArea.tsx           |   90.69 |    72.41 |     100 |   94.87 | 23-24             
  ChatInput.tsx          |     100 |      100 |     100 |     100 |                   
  ChatItem.tsx           |     100 |      100 |     100 |     100 |                   
  ChatMessage.tsx        |     100 |      100 |     100 |     100 |                   
  ChatSidebar.tsx        |     100 |      100 |     100 |     100 |                   
  SourcesCard.tsx        |     100 |      100 |     100 |     100 |                   
 components/documents    |   87.86 |    65.93 |   83.82 |   88.51 |                   
  ActionMenu.tsx         |   87.27 |    68.18 |   91.66 |   89.79 | 45-46,57,70,107   
  DangerZone.tsx         |     100 |    88.88 |     100 |     100 | 24                
  DocumentRow.tsx        |   94.44 |    71.42 |    87.5 |   92.85 | 59                
  DocumentTable.tsx      |   94.44 |    85.71 |     100 |   96.77 | 23                
  FileItem.tsx           |     100 |      100 |     100 |     100 |                   
  KnowledgeSidebar.tsx   |   95.65 |     87.5 |     100 |   94.11 | 12                
  PageUploadDropzone.tsx |   70.37 |    36.36 |   42.85 |      72 | 36-47             
  RenameModal.tsx        |   85.71 |    66.66 |   83.33 |      80 | 17-18             
  StorageDashboard.tsx   |     100 |    66.66 |     100 |     100 | 59-67             
  UploadDropzone.tsx     |   70.37 |    41.66 |   42.85 |      72 | 37-48             
 components/ui           |   94.11 |     92.3 |     100 |     100 |                   
  Avatar.tsx             |     100 |      100 |     100 |     100 |                   
  ConfirmModal.tsx       |   91.66 |     90.9 |     100 |     100 | 28                
  StatusBadge.tsx        |     100 |      100 |     100 |     100 |                   
-------------------------|---------|----------|---------|---------|-------------------

=============================== Coverage summary ===============================
Statements   : 89.29% ( 292/327 )
Branches     : 72.15% ( 114/158 )
Functions    : 88.42% ( 84/95 )
Lines        : 90.97% ( 262/288 )
================================================================================

Test Suites: 23 passed, 23 total
Tests:       68 passed, 68 total
Snapshots:   0 total
Time:        2.662 s, estimated 3 s
Ran all test suites.
```
