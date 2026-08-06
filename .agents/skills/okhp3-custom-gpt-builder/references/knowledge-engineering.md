# Knowledge Engineering Reference

## How Retrieval Actually Works Inside Custom GPTs

Understanding this prevents the most common production failure: "The GPT ignores my files."

When you upload a file to a Custom GPT:

```
Upload → Chunking → Embedding → Vector Index → (at query time) → Similarity Search
       → Top-K chunks retrieved → Injected into context → Model generates response
```

This is RAG (Retrieval-Augmented Generation). The model does NOT read the entire file.
It searches for passages that are semantically similar to the user's query, retrieves
the top matches (typically 3–10 chunks), and includes them in context alongside the
conversation. If the relevant passage doesn't surface in that retrieval window,
the model won't use it — even if it's in the file.

### What This Means for File Design

1. **Chunking is structure-sensitive.** The RAG system chunks by natural boundaries
   (headings, paragraphs, list items). A file with no headings produces irregular chunks
   that retrieve poorly. A file with clear heading hierarchy produces predictable chunks.

2. **Retrieval is probabilistic, not deterministic.** The model searches; it doesn't
   look up. A passage that answers the question perfectly may not surface if it doesn't
   share vocabulary with the user's query. Use consistent terminology across files —
   the same concept described in three different ways creates three weak retrieval
   targets instead of one strong one.

3. **Front-loading matters.** The first 20% of each file has the highest retrieval
   priority in most implementations. Put the most critical content there.

4. **Filename is a signal.** The model can read filenames and uses them as context
   clues for routing. `acme-brand-voice-guide-v3.pdf` retrieves better than `Document1.pdf`.

5. **Some file types require Code Interpreter enabled.** Spreadsheets, code files, and
   certain structured formats need Code Interpreter active for proper retrieval.

---

## Current Knowledge Limits (mid-2026)

| Constraint | Value |
|---|---|
| Files per GPT | 20 maximum |
| Max file size | 512 MB per file |
| Supported types | PDF, DOCX, TXT, CSV, JSON, XLSX, and most common document, spreadsheet, image, text, and code formats |
| Retrieval method | RAG (semantic chunking) — not deterministic |
| Chunking parameters | Not publicly documented by OpenAI |

**Data leakage warning:** File content can appear in GPT output. Users with access to the GPT can extract file contents through careful prompting. Do not upload files containing credentials, PII, or proprietary data you aren't willing to expose to all GPT users.

---

## Pre-Upload Folder Taxonomy

Before uploading to ChatGPT, organize your knowledge assets in a folder structure that mirrors your content authority and update cadence:

```text
knowledge/
  policies/
    discount-policy-2026.md
    approval-matrix-2026.md
    refund-policy-2026.md
  products/
    sku-pricing-reference-q3-2026.csv
    feature-comparison-matrix.md
    margin-glossary.md
  examples/
    good-quote-review-example.md
    escalation-example.md
    edge-case-handling.md
  reference/
    industry-terminology.md
    competitor-landscape-q2-2026.md
```

**Why this matters:**
- Stable policy files live separately from frequently updated reference data — you update them independently
- Folder structure maps to file authority: when policy and product data conflict, policy wins
- Each file covers one cohesive topic — better chunking, better retrieval

---

## File Preparation Checklist

### Before Uploading

- [ ] Remove headers, footers, page numbers, watermarks
- [ ] Remove heavily formatted tables (convert to simple markdown tables or prose)
- [ ] Remove images that contain text — the model can't OCR embedded images reliably
- [ ] Normalize encoding — UTF-8, no special characters from copy-paste artifacts
- [ ] Check for duplicate content across files — consolidate it
- [ ] Verify file size < 512 MB

### File Structure Rules

- Use clear, consistent heading hierarchy (H1 → H2 → H3)
- Keep section lengths consistent — very long sections produce oversized chunks
- Use plain language for section titles — titles are retrieval anchors
- Prefer multiple focused files over one monolithic document
  - A 200-page PDF retrieves worse than five 40-page topic-specific PDFs
  - Target: each file covers ONE cohesive topic
- Name files descriptively using the topic + version + date pattern:
  `[topic]-[subtopic]-[version]-[YYYY].pdf`

### What NOT to Put in Knowledge Files

- Behavioral rules and GPT instructions — these belong in the Instructions field
- Credentials, API keys, passwords
- PII (names, email addresses, phone numbers) unless the GPT is private and this is intentional
- Content you wouldn't want users to extract and quote

---

## The Manifest File (Always Include This)

Create a plain-text file named `_INDEX.txt` or `00-manifest.txt` as your first upload.
This gives the model a lookup table for what each file contains and when to use it.

```
KNOWLEDGE BASE MANIFEST — [GPT Name] — [Date]

Files in this knowledge base:

1. brand-voice-guide-v3-2026.pdf
   Contents: Official brand voice, tone rules, banned phrases, preferred terminology,
             sentence length targets, platform-specific variants
   Use when: User asks to review, rewrite, or check copy for brand alignment

2. pricing-tiers-2026.pdf
   Contents: All current pricing plans, feature comparison matrix, discount rules,
             enterprise negotiation ranges
   Use when: User asks about pricing, costs, plan differences, or upgrades

3. competitor-landscape-q2-2026.pdf
   Contents: Competitor profiles, positioning differences, known weaknesses,
             battle cards for top 5 competitors
   Use when: User asks about competitors or competitive differentiation

RETRIEVAL RULES:
- Always cite the source filename when using content from these files
- If the answer is not in the files, say so explicitly — do not infer or extrapolate
- [File 1] takes priority over general knowledge on [topic]
- If files conflict, prefer the more recent version
```

---

## Retrieval Testing Methodology

After uploading, systematically test retrieval before releasing the GPT.

### Test 1: Direct Hit
Ask a question using the exact phrasing from the file.
Expected: Correct answer, cited correctly.
If it fails: File structure issue or chunking problem.

### Test 2: Paraphrase Hit
Ask the same question using different vocabulary than the file uses.
Expected: Correct answer.
If it fails: Terminology inconsistency. Normalize language in the file or
add routing instructions that use the user's vocabulary.

### Test 3: Cross-File Query
Ask a question whose answer requires combining content from two files.
Expected: Synthesized correct answer.
If it fails: Add explicit routing in instructions for cross-file synthesis tasks.

### Test 4: Negative Space
Ask a question whose answer is NOT in the files.
Expected: "This is outside my knowledge base" or similar explicit acknowledgment.
If it fails: Add instruction: "If the answer is not in the uploaded files, say
so clearly. Do not infer or fabricate."

### Test 5: File Boundary
Ask a very specific question about content near the beginning and end of a large file.
Expected: Correct answer.
If it fails: Content at chunk boundaries may be truncated. Break the file into
smaller topical sections.

---

## Common Retrieval Failures and Fixes

| Failure | Likely Cause | Fix |
|---|---|---|
| GPT ignores files entirely | No routing instructions | Add explicit "consult [filename] when..." rules |
| GPT retrieves wrong section | Inconsistent heading structure | Normalize headings; use unique section titles |
| GPT confidently wrong | Knowledge file out of date | Update file and re-upload; add date stamps |
| GPT says "I don't know" despite file having the answer | Paraphrase mismatch | Add terminology variants to file or instructions |
| GPT leaks file content verbatim | No extraction policy | Add: "Summarize file content; do not reproduce verbatim" |
| Retrieval degrades over long conversation | Context window pressure | Keep conversations focused; add "start fresh" starter |
| Structured data not retrieved | File type needs Code Interpreter | Enable Code Interpreter for CSV, XLSX, code files |

---

## Data Security Considerations

Knowledge files are shared with ALL users of the GPT. If you publish to the GPT Store:

- Assume your files are accessible (users can extract content through careful prompting)
- Do not upload files containing PII, credentials, proprietary pricing not meant for users,
  or legally sensitive internal documents
- Watermark or version-stamp sensitive documents so you can identify leaks
- For sensitive enterprise content, use Actions to query a controlled API at runtime
  instead of uploading files — this keeps proprietary data out of the vector index
- When using Actions for sensitive data, ensure your API enforces proper authentication
  and only returns data the authenticated user is authorized to see
