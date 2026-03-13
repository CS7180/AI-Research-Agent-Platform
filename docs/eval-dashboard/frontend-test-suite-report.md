# Eval Dashboard - Frontend Test & Coverage Report

Generated at: 2026-03-13 00:10:46 PDT
Repository: AI-Research-Agent-Platform
Commit: cbee254

## Scope
This report includes frontend test execution and coverage results for:

```bash
cd frontend
npm run test
npm run test:coverage
```

## Requirement Mapping
- Professor requirement: submit a document showing test suite results from `npm run test`.
- PRD + `.agents/rules.md`: frontend stack uses Jest + React Testing Library.
- Common practice: include repeatable coverage reporting in CI/local checks.

## Test Inventory
- `src/backend/client.test.ts`
- `src/backend/shared.test.ts`
- `src/components/chat/ChatInput.test.tsx`
- `src/components/chat/ChatItem.test.tsx`
- `src/components/chat/SourcesCard.test.tsx`
- `src/components/documents/DangerZone.test.tsx`
- `src/components/documents/KnowledgeSidebar.test.tsx`
- `src/components/ui/Avatar.test.tsx`
- `src/components/ui/ConfirmModal.test.tsx`
- `src/components/ui/StatusBadge.test.tsx`
- `src/app/login/LoginCard.test.tsx`
- `src/app/settings/SettingsCard.test.tsx`

## npm run test Result
- Status: PASSED
- Test Suites: 12 passed, 12 total
- Tests: 43 passed, 43 total
- Duration: 1.657 s

## npm run test:coverage Result
- Status: PASSED
- Test Suites: 12 passed, 12 total
- Tests: 43 passed, 43 total
- Duration: 2.198 s
- Coverage (Statements): 35.54% (177/498)
- Coverage (Branches): 33.17% (68/205)
- Coverage (Functions): 31.45% (39/124)
- Coverage (Lines): 36.94% (167/452)

Coverage artifacts generated at:
- `frontend/coverage/index.html`
- `frontend/coverage/lcov-report/index.html`
- `frontend/coverage/lcov.info`

## Raw Output (test:coverage)
```text

> frontend@0.1.0 test:coverage
> jest --runInBand --coverage

PASS src/components/documents/DangerZone.test.tsx
PASS src/backend/client.test.ts
PASS src/components/documents/KnowledgeSidebar.test.tsx
PASS src/components/ui/ConfirmModal.test.tsx
PASS src/components/chat/ChatInput.test.tsx
PASS src/app/login/LoginCard.test.tsx
PASS src/components/ui/StatusBadge.test.tsx
PASS src/app/settings/SettingsCard.test.tsx
PASS src/components/chat/ChatItem.test.tsx
PASS src/components/ui/Avatar.test.tsx
PASS src/components/chat/SourcesCard.test.tsx
PASS src/backend/shared.test.ts
--------------------------|---------|----------|---------|---------|-------------------
File                      | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s 
--------------------------|---------|----------|---------|---------|-------------------
All files                 |   35.54 |    33.17 |   31.45 |   36.94 |                   
 src                      |       0 |        0 |       0 |       0 |                   
  middleware.ts           |       0 |        0 |       0 |       0 | 12-72             
 src/app/login            |     100 |      100 |     100 |     100 |                   
  LoginCard.tsx           |     100 |      100 |     100 |     100 |                   
 src/app/settings         |     100 |      100 |     100 |     100 |                   
  SettingsCard.tsx        |     100 |      100 |     100 |     100 |                   
 src/backend              |   82.07 |    70.27 |    92.3 |   83.49 |                   
  client.ts               |   95.29 |       75 |     100 |   97.56 | 142,176           
  server.ts               |       0 |        0 |       0 |       0 | 1-34              
  shared.ts               |     100 |      100 |     100 |     100 |                   
 src/components           |       0 |        0 |       0 |       0 |                   
  Navbar.tsx              |       0 |        0 |       0 |       0 | 1-59              
 src/components/chat      |   14.54 |    28.57 |      30 |      14 |                   
  ChatArea.tsx            |       0 |        0 |       0 |       0 | 3-112             
  ChatInput.tsx           |     100 |      100 |     100 |     100 |                   
  ChatItem.tsx            |     100 |      100 |     100 |     100 |                   
  ChatMessage.tsx         |       0 |        0 |       0 |       0 | 1-9               
  ChatSidebar.tsx         |       0 |      100 |       0 |       0 | 1                 
  SourcesCard.tsx         |     100 |      100 |     100 |     100 |                   
 src/components/documents |   19.66 |    16.48 |   19.11 |   19.61 |                   
  ActionMenu.tsx          |       0 |        0 |       0 |       0 | 3-107             
  DangerZone.tsx          |     100 |    88.88 |     100 |     100 | 24                
  DocumentRow.tsx         |       0 |        0 |       0 |       0 | 3-59              
  DocumentTable.tsx       |       0 |        0 |       0 |       0 | 3-84              
  FileItem.tsx            |     100 |      100 |     100 |     100 |                   
  KnowledgeSidebar.tsx    |   95.65 |     87.5 |     100 |   94.11 | 12                
  PageUploadDropzone.tsx  |       0 |        0 |       0 |       0 | 3-78              
  RenameModal.tsx         |       0 |        0 |       0 |       0 | 15-35             
  StorageDashboard.tsx    |       0 |        0 |       0 |       0 | 3-60              
  UploadDropzone.tsx      |       0 |        0 |       0 |       0 | 3-64              
 src/components/ui        |   94.11 |     92.3 |     100 |     100 |                   
  Avatar.tsx              |     100 |      100 |     100 |     100 |                   
  ConfirmModal.tsx        |   91.66 |     90.9 |     100 |     100 | 28                
  StatusBadge.tsx         |     100 |      100 |     100 |     100 |                   
 src/lib                  |       0 |      100 |     100 |       0 |                   
  mock-documents.ts       |       0 |      100 |     100 |       0 | 34-173            
 src/lib/supabase         |       0 |        0 |       0 |       0 |                   
  client.ts               |       0 |        0 |       0 |       0 | 10-22             
  server.ts               |       0 |      100 |       0 |       0 | 11-28             
--------------------------|---------|----------|---------|---------|-------------------

=============================== Coverage summary ===============================
Statements   : 35.54% ( 177/498 )
Branches     : 33.17% ( 68/205 )
Functions    : 31.45% ( 39/124 )
Lines        : 36.94% ( 167/452 )
================================================================================

Test Suites: 12 passed, 12 total
Tests:       43 passed, 43 total
Snapshots:   0 total
Time:        2.198 s
Ran all test suites.
```
