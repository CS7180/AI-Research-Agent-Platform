# DocMind — Mom Test Interview Summary

> **Interviews Conducted:** 6
> **Date Range:** February 10–21, 2026
> **Interviewers:** Shanshou Li, Yachen Wang
> **Methodology:** Rob Fitzpatrick's *The Mom Test* — behavioral questions about past actions, real workflows, and observed pain. No leading questions about proposed features.

---

## 1. Executive Findings

Across 6 interviews with CS students ranging from Align career-changers to PhD researchers, we found **strong, independently validated demand** for a personal knowledge base with AI-powered cross-document retrieval. Every interviewee demonstrated the core problem within 30 seconds — pulling up a chaotic file system, a manual index, or recounting a multi-hour search session. This is not a speculative need; it is an active, time-consuming pain point that students currently "solve" with brute-force manual effort.

The three strongest signals:

1. **Source citations are the trust mechanism.** All 6 interviewees independently stated that they need to see where an answer comes from. Two shared specific stories where AI hallucination caused measurable harm (incorrect exam answer, flawed implementation). DocMind's RAG-with-citations design directly addresses the #1 trust barrier.

2. **NotebookLM is the competitive anchor.** Three interviewees brought up Google NotebookLM unprompted, positioning it as the closest existing solution. Their complaints map precisely to DocMind's differentiators: no Markdown support, no external integrations, limited source count, and no developer-facing API.

3. **Individual use precedes collaboration.** While every interviewee mentioned group scenarios, only 2 prioritized team features over personal knowledge management. The correct build order is individual-first, collaboration-second — which aligns with our current sprint plan.

---

## 2. Validated Assumptions

These PRD assumptions were confirmed by behavioral evidence (not just stated preferences):

| Assumption | Validation Strength | Evidence |
|---|---|---|
| Students waste significant time searching across course files | ✅ Strong (6/6) | Quantified: 40 min–6 hours per exam prep session across interviewees. All demonstrated physical evidence (messy filesystems, manual indices). |
| Ctrl+F across many files is the dominant current workflow | ✅ Strong (5/6) | Directly observed or described by 5 interviewees. One (Emily) uses a manual Excel index instead. |
| Generic AI chatbots (ChatGPT, Claude) fail because they lack access to personal course materials | ✅ Strong (4/6) | Four interviewees described specific failures: context window limits, re-uploading every session, hallucinated answers to course-specific questions. |
| Source citations are essential for trust | ✅ Strong (6/6) | Independently raised by every interviewee before any prompting. Two shared concrete harm stories. |
| Image/whiteboard input addresses a real workflow | ✅ Moderate (3/6) | Kevin (14 unorganized whiteboard photos), Emily (screenshots OneNote pages), and Priya (lecture screenshots) all showed real image artifacts. Others don't photograph whiteboards. |
| MCP/IDE integration is valued by developer-oriented users | ✅ Moderate (2/6) | Kevin and David both expressed strong interest. The other 4 had never heard of MCP. This is a niche but high-value feature for the developer persona. |
| Slack integration enables team workflows | ⚠️ Partial (2/6) | Only Marcus and David use Slack regularly. Sophie's group uses Discord, Priya's uses WhatsApp. Slack covers professional teams but misses student collaboration channels. |

---

## 3. Invalidated or Challenged Assumptions

| Assumption | Challenge | Implication |
|---|---|---|
| Slack is the primary team communication tool for CS students | **Discord and WhatsApp are equally or more prevalent.** 2 of 6 use Slack; 2 use Discord; 1 uses WhatsApp. | n8n + Slack integration (US-04) serves the developer/professional persona but not the broader student audience. Consider Discord integration as a future addition. Does not block Sprint 1. |
| Students will individually upload documents through the web UI | **Team users want bulk import or Drive sync, not file-by-file uploading.** Marcus explicitly said he wouldn't use the tool if upload isn't batch/automatic. | For Sprint 1 (individual users), file-by-file upload is acceptable. For Sprint 2+ team features, Google Drive sync or bulk upload becomes a hard requirement. |
| Web UI is the primary entry point for all users | **Developer users (Kevin, David) prefer IDE/CLI access over web UI.** The web UI is primary for non-developers but secondary for power users. | Web UI should be excellent but shouldn't be the only first-run experience. MCP setup documentation should be first-class. |

---

## 4. Discovery: Unplanned Insights

These findings emerged organically from interviews and were not anticipated in the PRD:

### 4.1 NotebookLM as Competitive Positioning Anchor

Three interviewees independently framed the product against Google NotebookLM. This gives us a clear competitive narrative:

- NotebookLM has no Markdown/TXT support → DocMind supports PDF, MD, TXT.
- NotebookLM caps at 50 sources → DocMind scales via pgvector.
- NotebookLM has no API/integration layer → DocMind offers MCP + Slack + REST API.
- NotebookLM is a sealed product → DocMind is provider-agnostic and extensible.

**Action:** Add NotebookLM to the competitive analysis section of the PRD. Use the comparison in marketing copy and README.

### 4.2 The "Study Group Knowledge Base" Use Case

Sophie's study group workflow — 6 people uploading summaries and querying a shared base — represents a high-retention collaborative scenario that's distinct from the "team project" persona. Study groups are informal, semester-long, and highly motivated to share notes.

**Action:** Validate this pattern with 2–3 more study groups. If confirmed, it could become a primary growth loop: one user invites 5 teammates → organic expansion.

### 4.3 Zotero Integration as PhD On-Ramp

David's 342-paper Zotero library represents a high-value user segment that already has structured document collections. Zotero export (BibTeX + PDF) is a well-defined format that could be supported with modest engineering effort.

**Action:** Add Zotero import as a "Could Have" feature in Sprint 2 backlog. PhD students recommend tools to their labs; this audience has outsized word-of-mouth potential.

### 4.4 Mobile/Screenshot Workflow is Prevalent

Emily takes screenshots of OneNote pages. Kevin photographs whiteboards. Priya screenshots lecture slides. There's a real workflow where students capture visual artifacts and want to query against them — this validates the multi-modal (US-03) feature more strongly than expected.

**Action:** Multi-modal input (US-03) priority is correctly set at "Must Have." Consider adding a mobile-responsive upload flow or PWA in future sprints.

---

## 5. Persona Refinement

Based on interviews, we refine the original two personas and propose a third:

### Persona 1 (Validated): Individual CS Student → "The Exam Prepper"
Matches Priya, Emily, and Sophie. Accumulates course materials, studies individually or in small groups, values speed and accuracy during exam prep. **Primary entry point: Web UI.** Sensitive to hallucination; citations are non-negotiable.

### Persona 2 (Validated with nuance): Group Project Team Member → "The Workflow Integrator"
Matches Marcus and partially Kevin. Lives in Slack/IDE, wants the knowledge to come to them. **Primary entry point: Slack or MCP.** Batch upload / Drive sync is a hard requirement. Smaller segment than Persona 1 but higher per-user engagement.

### Persona 3 (New): Research Student → "The Literature Synthesizer"
Matches David. Has 100+ papers, uses Zotero, needs cross-document synthesis for literature reviews. **Primary entry point: MCP (Claude Desktop) or Web UI.** Highest quality bar for retrieval accuracy. Smallest segment but strongest word-of-mouth influence.

---

## 6. Feature Prioritization Impact

Based on interview evidence, here is how the sprint plan holds up:

### Sprint 1 — Confirmed (No Changes)

All Sprint 1 items (document pipeline, auth, basic RAG, SSE streaming, document management UI) are validated as Must Have by behavioral evidence. No de-prioritization needed.

### Sprint 2 — Adjusted

| Feature | Original Priority | Adjusted Priority | Rationale |
|---|---|---|---|
| LangGraph agent (US-08) | Must Have | **Must Have** ✓ | Confirmed: fallback to web search when KB doesn't have the answer was mentioned by 3 interviewees as expected behavior. |
| MCP Server (US-05) | Should Have | **Should Have** ✓ | Confirmed by 2/6 (Kevin, David), but those 2 are high-influence users. Keep priority. |
| Image input (US-03) | Should Have | **Should Have → Must Have** ↑ | Stronger behavioral evidence than expected: 3/6 have active image-based workflows. Promote. |
| Slack integration (US-04) | Should Have | **Should Have** ✓ | Validated for the professional persona, but challenged by Discord/WhatsApp prevalence in student teams. Keep as-is; note Discord gap. |
| RAGAS evaluation (US-09) | Could Have | **Could Have → Should Have** ↑ | David (PhD) explicitly asked for evaluation scores. High-quality users need proof of retrieval quality to adopt. Promote. |
| Code execution (US-10) | Could Have | **Could Have** ✓ | No interviewee mentioned needing code execution. Keep as stretch goal. |

### New Backlog Items (from Discovery)

| Feature | Priority | Source |
|---|---|---|
| Batch / bulk document upload | Should Have (Sprint 2) | Marcus interview |
| NotebookLM competitive comparison in README | Must Have (Sprint 1, docs only) | Kevin, Emily, Priya |
| Zotero library import | Could Have (future) | David interview |
| Discord bot integration | Could Have (future) | Sophie, one other |
| Mobile-responsive upload / PWA | Could Have (future) | Emily interview |
| Shared knowledge base with permissions | Should Have (Sprint 3+) | Sophie, Marcus |

---

## 7. Key Risks Surfaced

| Risk | Severity | Mitigation |
|---|---|---|
| Retrieval quality on academic PDFs (multi-column, tables, figures) | **High** | David flagged this directly. Invest in layout-aware PDF extraction (e.g., unstructured.io or marker). Include PDF-specific test cases in RAGAS benchmark. |
| Free tier must be fully functional for student adoption | **High** | Priya and Sophie are price-sensitive. Free tier should support at least 1 course worth of materials (~20 docs). Paid tier for multi-course power users. |
| Upload friction kills team adoption | **Medium** | Marcus won't use file-by-file upload. Sprint 1 is individual-focused so this is acceptable, but batch upload must ship before any team marketing. |
| Discord gap limits student team reach | **Medium** | Slack integration covers professional workflows. For student teams, Discord is dominant. Monitor demand; add Discord integration when team features ship. |
| High quality bar from technical users | **Medium** | David (PhD) and Kevin (power user) will churn on mediocre retrieval. RAGAS benchmark must be visible and scores must meet targets. |

---

## 8. Recommended Next Steps

1. **Proceed with Sprint 1 as planned.** All core features are validated. No de-prioritization needed.
2. **Add NotebookLM competitive positioning** to the project README and any demo materials. Three interviewees gave us the competitive frame for free.
3. **Promote image input (US-03) to Must Have** for Sprint 2, given stronger-than-expected behavioral evidence.
4. **Promote RAGAS evaluation (US-09) to Should Have** — quality-conscious users need visible proof.
5. **Recruit 3 pilot users** for early Sprint 1 testing: Kevin (power user/MCP), Sophie (study group lead), and David (PhD/quality evaluator). All three volunteered.
6. **Conduct 2–3 follow-up interviews** with study group members (Sophie's group) to validate the collaborative knowledge base use case before investing in team features.

---

*Document version: 1.0 | Last updated: February 22, 2026*
