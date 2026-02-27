# DocMind — Mom Test Interview Notes

> **Interviewer:** Shanshou Li, Yachen Wang
> **Date Range:** February 10–21, 2026
> **Method:** Semi-structured interviews following Rob Fitzpatrick's *The Mom Test* — questions focused on past behaviors, real workflows, and specific pain points rather than hypothetical feature validation.
> **Location:** Northeastern University campus, Zoom, Snell Library study rooms

---

## Interview 1: Kevin M.

| Field | Detail |
|---|---|
| **Date** | February 10, 2026 |
| **Duration** | 28 minutes |
| **Profile** | MS CS, 2nd semester. Taking CS6650 (Distributed Systems), CS7180 (Special Topics in AI). Works part-time as a research assistant in an NLP lab. |
| **Device** | MacBook Pro 14", uses VS Code and Cursor daily |

### Key Quotes & Observations

**On current document workflow:**
> "Every Monday before the DS exam, I open like 15–20 tabs — different lecture PDFs, the textbook chapters, my own Markdown notes. I spend probably 40 minutes just *finding* the right content before I even start reviewing. Last week I was looking for how Paxos handles leader election and I opened 8 files before I found it in slide 47 of Lecture 9."

**On existing tools tried:**
> "I tried Notion AI last semester. It's fine for notes I already wrote, but it can't search inside my PDFs. I also tried uploading things to ChatGPT, but the context window runs out fast and I can't keep a persistent knowledge base. Every new session I'm re-uploading."

**On group project pain:**
> "For our CS7180 project, we have a shared Google Drive with like 60 papers. When someone asks in Slack 'did any of our papers cover few-shot prompting for code generation?', nobody knows. We each Ctrl+F our own subset. Takes 20 minutes across 4 people to figure out the answer is in paragraph 3 of one paper."

**On what "good enough" looks like:**
> "If I could type a question and it told me the answer AND which file and page it came from, that's 80% of what I need. The citation part is non-negotiable — I don't trust AI answers about my course material without seeing the source."

**On image/whiteboard use:**
> "I photograph whiteboards maybe 2–3 times a week. They just go into my camera roll and I never find them again. If I could ask a question about a whiteboard photo, that'd be wild. But honestly I'd settle for just PDFs working well."

**On workflow integration:**
> "I live in Cursor. If I could query my knowledge base from Cursor without switching to a browser, I'd use it constantly during projects."

### Behavioral Signals

- Pulled out his phone and showed 14 whiteboard photos from the past 2 weeks — none were organized or labeled.
- Opened his laptop to demonstrate his "review process" — had 23 tabs of PDFs open from last exam prep.
- When asked about Notion AI, visibly frustrated: "It's great until you need it to read a PDF."
- Unprompted, asked if the tool could work with Cursor.

### Risk Flags

- Mentioned he would "probably forget to upload files" unless it was very low friction.
- Said he wouldn't pay more than $5/month as a student.

---

## Interview 2: Priya S.

| Field | Detail |
|---|---|
| **Date** | February 12, 2026 |
| **Duration** | 35 minutes |
| **Profile** | MS CS, 1st semester. Taking CS5800 (Algorithms), CS5500 (Foundations of Software Engineering), CS5010 (PDP). Transferred from India, adjusting to US academic pace. |
| **Device** | Windows laptop, primarily uses browser-based tools |

### Key Quotes & Observations

**On information overload:**
> "Back home I took 3 courses a semester. Here it's 3 but each one has twice the material. I have 200+ files in my Downloads folder from this semester alone. I tried making folders but I gave up after week 3."

**On exam preparation:**
> "Before my algorithms midterm, I spent an entire Saturday — like 6 hours — going through all the lecture slides to find every mention of dynamic programming. I kept a Google Doc where I copy-pasted relevant slides. It took forever and I still missed stuff."

**On what she actually wants:**
> "I just want to ask 'show me everything about dynamic programming from my algorithm slides' and get a real answer. Not a generic textbook answer — specifically what Professor Chen covered, with his examples."

**On trust and accuracy:**
> "My biggest worry with AI tools is hallucination. Last semester I used ChatGPT to study and it confidently gave me a wrong time complexity for a DP problem. On the exam I wrote the wrong answer because I trusted it. I need to see where the answer comes from."

**On collaboration:**
> "I don't do much group work yet — mostly individual courses. But I could see sharing a knowledge base with my study group. We have a WhatsApp group where people ask questions about lectures all the time."

**On existing tool attempts:**
> "I tried Google's NotebookLM. It was actually pretty good for PDFs! But it doesn't let me add my own Markdown notes alongside it, and there's no API or integration with anything. It's a silo."

### Behavioral Signals

- Opened her Downloads folder to show the chaos: 243 files, no organization.
- Had a physical notebook where she manually indexed which lecture covered which topic. Hand-written.
- Very animated when discussing the exam incident with ChatGPT hallucination — clearly still upset about it.
- Immediately understood the value proposition: "So it's like NotebookLM but I own the knowledge base and it works with everything."

### Risk Flags

- Not tech-savvy with developer tools; wouldn't use MCP or Slack integration. Web UI is the only viable entry point.
- Very price-sensitive; free tier must be fully functional.

---

## Interview 3: Marcus J.

| Field | Detail |
|---|---|
| **Date** | February 14, 2026 |
| **Duration** | 22 minutes |
| **Profile** | BS CS, senior year. Taking CS4500 (Software Dev), one elective. Works on a 5-person capstone team. Heavy Slack user. |
| **Device** | M2 MacBook Air, uses Slack and VS Code |

### Key Quotes & Observations

**On team documentation pain:**
> "Our capstone team has a shared Drive with meeting notes, design docs, API specs, research papers — probably 40 files. Every standup someone asks 'what did we decide about the auth flow?' and we spend 10 minutes scrolling through Google Docs. It's ridiculous."

**On Slack as the work hub:**
> "Honestly, I don't want to open another app. I'm in Slack 8 hours a day. If I could just @ a bot and ask 'what's our API rate limit policy?' and it answered from our docs, that would save us so much time."

**On current workarounds:**
> "We have a 'decisions' channel in Slack where we try to log important choices. Nobody updates it after the first week. The real decisions are scattered across 50 random messages."

**On what would make him switch:**
> "If it's more than 2 clicks to get an answer, I'll just @mention my teammate and wait for them to respond. The tool has to be faster than asking a human."

**On document management:**
> "I don't care about managing documents in your UI. Just give me a way to dump our Google Drive in there and keep it synced. The less I think about it, the better."

### Behavioral Signals

- Pulled up his team's Slack and scrolled through the #decisions channel — last message was 3 weeks old.
- Showed the team Google Drive: 47 files, 3 levels of nested folders, some mislabeled.
- Kept circling back to Slack integration as the killer feature.
- Minimal interest in the web UI itself; wants the knowledge to come to him.

### Risk Flags

- Would never upload documents individually — batch upload or Drive sync is a hard requirement for team use.
- May represent a small power-user segment; most students aren't this Slack-heavy.

---

## Interview 4: Emily Z.

| Field | Detail |
|---|---|
| **Date** | February 17, 2026 |
| **Duration** | 31 minutes |
| **Profile** | MS CS, 2nd semester, Align program (career changer from finance). Taking CS5004 (OOD), CS5800 (Algorithms). First exposure to CS concepts. |
| **Device** | Windows Surface Pro, uses OneNote extensively |

### Key Quotes & Observations

**On being overwhelmed:**
> "I have zero CS background from undergrad. Every lecture introduces 10 concepts I've never seen. I record lectures, take notes in OneNote, and download all the slides. By week 6 I have so much material I can't navigate it anymore."

**On how she currently studies:**
> "I made a color-coded Excel spreadsheet mapping every concept to which lecture covered it. It took me an entire weekend to set up. Now it's out of date because I stopped maintaining it after the midterm."

**On what she wants from AI:**
> "I want to ask stupid questions without feeling judged. Like 'what's the difference between an interface and an abstract class based on what Professor Kim said in lecture 5?' I can Google it, but Google gives me the Java docs answer, not the way my professor explained it which is the way it'll be on the exam."

**On multi-modal input:**
> "I screenshot OneNote pages a lot. My notes have diagrams I drew, code snippets, and text all mixed together. If I could just paste a screenshot and say 'explain this diagram' using my other notes, that would help so much."

**On discovery of NotebookLM:**
> "Wait, this sounds a lot like NotebookLM. I used it for one class and loved it. But it capped at 50 sources and it doesn't show the processing pipeline or give me control. Also no Markdown."

### Behavioral Signals

- Showed her Excel spreadsheet: 400+ rows mapping concepts to lectures. Impressive effort, terrible workflow.
- Takes screenshots of her OneNote pages rather than exporting — multi-modal input is a real workflow, not a hypothetical.
- Compared everything to NotebookLM positively — she's a warm lead but needs differentiation.
- Asked about mobile support twice.

### Risk Flags

- Align students may have lower tolerance for technical setup (Docker, environment variables).
- OneNote isn't a supported format — she'd need to export or screenshot.

---

## Interview 5: David C.

| Field | Detail |
|---|---|
| **Date** | February 19, 2026 |
| **Duration** | 40 minutes |
| **Profile** | PhD CS, 2nd year. Research area: Systems + ML. TAing for an undergrad course. Accumulates papers for literature reviews. |
| **Device** | Linux workstation + ThinkPad, uses Zotero for paper management |

### Key Quotes & Observations

**On research paper chaos:**
> "I have 300+ papers in Zotero tagged by topic. But Zotero's search is keyword-only. When I need to write a related work section, I'm reading abstracts for an hour trying to remember which paper had the specific ablation study I need. I know it's in there, I just can't find it."

**On the difference between search and understanding:**
> "Google Scholar finds papers. Semantic Scholar finds related papers. But neither of them can tell me 'across these 15 papers you've read, what are the three main approaches to X and how do they compare?' That requires synthesis across documents, which is what I do manually and it takes days."

**On RAG quality concerns:**
> "I've built RAG systems in my research. Chunking at 512 tokens is fine for general use, but academic papers have weird structures — multi-column layouts, tables, figures with captions. If you mess up the chunking on a table, the retrieval is garbage. How are you handling that?"

**On evaluation:**
> "I want to see RAGAS scores. If you show me faithfulness above 0.85 on a real benchmark — not cherry-picked examples — I'd take it seriously. Every RAG demo looks great until you test edge cases."

**On what would make him a daily user:**
> "Two things: (1) I can import my Zotero library, and (2) the retrieval is actually good enough that I trust the citations. If those work, I'd use it every day for my literature review."

**On MCP integration:**
> "Oh, you have an MCP server? I'd connect that to Claude Desktop immediately. That's actually the most interesting part to me — I already live in Claude for research. Having it pull from my own papers would be incredible."

### Behavioral Signals

- Asked detailed technical questions about chunking strategy, embedding model choice, and re-ranking approach. Engaged at the architecture level.
- Showed his Zotero library with 342 papers, meticulously tagged but still hard to cross-reference.
- Eyes lit up at MCP integration — this was the first feature that genuinely excited him.
- Offered to be a beta tester and evaluate RAG quality.

### Risk Flags

- Very high bar for quality — mediocre retrieval would make him churn immediately.
- Zotero import is not in the current scope but may be critical for the research audience.
- Edge case: PhD students are a smaller market but have outsized influence (recommend tools to labs).

---

## Interview 6: Sophie T.

| Field | Detail |
|---|---|
| **Date** | February 21, 2026 |
| **Duration** | 25 minutes |
| **Profile** | MS CS, 1st semester. Taking CS5800 (Algorithms), CS6140 (Machine Learning). Active in 3 study groups. Organized, high-achiever. |
| **Device** | MacBook Air M3, uses Notion + Apple Notes |

### Key Quotes & Observations

**On study group coordination:**
> "I run a study group of 6 people for ML. Before each session I assign readings and everyone writes summary notes. But nobody reads everyone else's summaries. We just talk from memory and miss connections constantly."

**On her current system:**
> "I have a Notion database with every lecture tagged by topic, professor, and course. It works for my own notes, but Notion can't read my PDFs. So I have two separate systems — Notion for my notes and Finder for the actual slides."

**On what she would use DocMind for:**
> "If my entire study group could upload their notes and the lecture slides into one shared space, and then any of us could ask 'summarize the three approaches to regularization covered this week,' that would replace our entire prep process."

**On accuracy and citations:**
> "The source citations are critical. If I'm going to share an AI-generated answer in my study group, I need to be able to say 'this comes from slide 12 of lecture 7.' Otherwise someone will challenge it and we'll waste time verifying."

**On what she wouldn't use:**
> "I don't code much outside of homework, so the Cursor integration doesn't apply to me. And I don't use Slack — our group is on Discord. But the web UI and shared knowledge base? Absolutely."

**On willingness to pay:**
> "If the free tier lets me upload enough for one course, I'd try it for ML. If it works well, I'd pay maybe $8/month to use it for all my courses. My study group might split a team plan."

### Behavioral Signals

- Showed her meticulously organized Notion database — she's already invested in information management.
- Immediately asked about sharing and permissions: "Can I make the knowledge base read-only for some people?"
- Mentioned Discord 3 times — Slack integration doesn't reach all student teams.
- Offered to bring her study group in as pilot users.

### Risk Flags

- Team/sharing features aren't in Sprint 1 — could lose her if individual-only for too long.
- Discord is the dominant student chat platform; Slack integration may miss the primary student collaboration channel.

---

## Cross-Interview Observation Log

### Environment Notes
- 5 of 6 interviewees had visibly messy file systems (>100 unsorted files).
- 4 of 6 had tried at least one AI-powered tool (ChatGPT, Notion AI, NotebookLM) for studying and found it insufficient.
- All 6 independently mentioned the need for source citations before being asked about it.
- Only 2 of 6 (Kevin, David) were familiar with MCP; the rest had never heard of it.
- Slack was mentioned by 2, Discord by 2, WhatsApp by 1 as the primary team communication tool.

### Recurring Patterns Observed During Interviews
1. **Physical evidence of pain:** Every interviewee could pull up their messy file system or manual workaround within 30 seconds. This is not a hypothetical pain point.
2. **Time quantification:** Interviewees naturally quantified wasted time (40 min, 6 hours, an entire Saturday) without prompting. This is a real, felt cost.
3. **Citation is non-negotiable:** All 6 mentioned needing to see where answers come from. Two recounted specific incidents where AI hallucination caused real harm (wrong exam answer, incorrect implementation).
4. **NotebookLM as the anchor:** 3 of 6 independently brought up Google NotebookLM, positioning it as the closest existing solution but with clear gaps (no Markdown, limited sources, no integrations).
5. **Collaboration is desired but secondary:** Everyone mentioned group use, but only 2 (Marcus, Sophie) prioritized it over individual use. Build individual first, then layer sharing.
