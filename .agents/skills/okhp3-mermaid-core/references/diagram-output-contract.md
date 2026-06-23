# Diagram Output Contract

These rules apply to every diagram produced by any skill in the `mermaid/` family. They are non-negotiable output constraints, not style preferences.

---

## Output Structure

**One Mermaid block per response when a diagram is requested.**
Never split a diagram across multiple fenced blocks. Never produce a partial diagram followed by "here's the rest." One request, one complete block.

**No stray prose inside the fenced block.**
The block contains only valid Mermaid syntax. Comments (`%%`) are allowed. Explanatory text belongs outside the block.

**One block of explanatory text is permitted after the diagram, not before.**
If context is needed, deliver the diagram first. The diagram is the deliverable; the explanation is the appendix.

---

## Node and Edge Rules

**Use stable short IDs.**
Node identifiers must be short (2-5 characters or a compact camelCase token), stable across diagram versions, and semantically meaningful. Do not use auto-generated sequential IDs (A, B, C, D) when a meaningful token exists. Stable IDs survive copy/paste and diff review.

**Quote labels that contain spaces, special characters, or punctuation.**
```
A["Approve Request"] --> B["Send Notification"]
```
Unquoted labels with spaces or punctuation will cause parse failures or render incorrectly. Quote them.

**No semicolons.**
Mermaid does not require or want semicolons after statements. They cause inconsistent parse behavior across versions. Omit them entirely.

**Do not use `end` as a node ID or label.**
`end` is a reserved keyword in Mermaid's flowchart grammar. Using it as a node identifier or label will break parsing. Use `endNode`, `finish`, `done`, or any non-reserved token instead.

---

## Style Rules

**No HTML in node labels unless the renderer explicitly supports it.**
The `<br>` tag and HTML-style formatting in labels (`<b>`, `<i>`, `<span>`) render inconsistently across Mermaid versions and export targets. Use plain text. If line breaks are needed, split into multiple nodes or use `\n` in supported contexts.

**Do not invent classDef names.**
Apply only `classDef` names that are defined within the current diagram's `%%{init}%%` block or at the top of the diagram. Applying an undefined class results in silent failure — the style is not applied and no error is raised.

**Every `classDef` must set `fill`, `stroke`, AND `color`.**
Omitting any of these three properties causes dark/light-mode rendering failures. This is the single most common style defect in community Mermaid diagrams.

---

## Update and Repair Rules

**Preserve existing style when updating a diagram.**
When an existing `.mmd` file is modified, the `%%{init}%%` config block and all `classDef` declarations must be carried forward unchanged unless the update explicitly targets them. Style drift on update is a defect.

**Repair minimally.**
Syntax repair means fixing the broken syntax and nothing else. Do not reorganize, relabel, restyle, or restructure during a repair pass. The minimum change that makes the diagram parse is the correct change.

**Re-run all three validation gates after any update or repair.**
Gate 1 (syntax), Gate 2 (semantic), Gate 3 (audience fit) apply equally to updates and repairs. A repaired diagram that no longer correctly represents the process has failed Gate 2.

---

## Publishing Rules

**The rendered file is the deliverable. Never delete it.**
A PNG, SVG, or `.mmd` source file produced as output is the artifact the user requested. It is not scratch space. It is not temporary.

**Do not route diagram source through third-party public APIs without explicit user consent.**
No Kroki. No remote rendering APIs. Diagram content may be proprietary. Local rendering via `mmdc` is the default path.
