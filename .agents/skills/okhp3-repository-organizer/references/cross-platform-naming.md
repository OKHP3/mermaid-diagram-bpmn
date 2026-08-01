# Cross-platform naming and path portability

Use this policy for new names and for proposed renames. It is intentionally more conservative than the minimum supported by any one operating system because the same repository may be checked out on Windows, macOS, and Linux, accessed through GitHub's web UI, linked from Markdown, and manipulated by different shells.

## Portable profile for new ordinary names

Use this form for ordinary files and folders:

```text
[a-z0-9]+(?:-[a-z0-9]+)*(?:\.[a-z0-9]+)?
```

Examples:

```text
market-history/
market-history-2026.md
prompt-pack-v2.docx
source-notes/
```

This profile means:

- ASCII letters only, lowercase; digits are allowed but do not make a name look like a device name.
- Single hyphens separate words. Do not use spaces, tabs, underscores, repeated hyphens, leading hyphens, or trailing hyphens in new ordinary names.
- A period is reserved for a single lowercase file extension. Do not end a segment with a period or use multiple ambiguous extensions.
- Do not use Unicode punctuation, emoji, accents, zero-width characters, or visually confusable characters in new ordinary names. Unicode remains valid content; this is a filename portability policy.
- Do not use URL-reserved or shell-sensitive characters such as `#`, `%`, `?`, `&`, `+`, `;`, `$`, `!`, quotes, brackets, parentheses, backticks, or pipes.
- Keep a segment at 64 characters or fewer and keep the full repository-relative path comfortably below 240 characters. Prefer a shorter budget when the repository will be consumed by legacy Windows tools, ZIP extractors, sync clients, or browser-based tooling.

## Required-name exceptions

Some ecosystem names are intentionally outside the ordinary profile. Preserve them when required:

```text
README.md       AGENTS.md       CLAUDE.md       LICENSE
.gitignore      .gitattributes  .github/        .agents/
```

Do not generalize these exceptions to content names. A required uppercase file is acceptable; a pair such as `Notes.md` and `notes.md` is not portable enough to introduce.

## Why the conservative profile exists

- Windows rejects or mishandles several characters, control characters, trailing spaces, trailing periods, and reserved device basenames such as `CON`, `NUL`, `COM1`, and `LPT1`, including when an extension follows them.
- Windows and macOS commonly use case-insensitive filesystems, while Linux environments commonly distinguish case. Git probes this behavior through `core.ignoreCase`, so a case-only distinction can behave differently after checkout.
- macOS and Git have additional Unicode normalization behavior. A decomposed and composed spelling can look identical while behaving differently across filesystems and Git configurations.
- Markdown links and GitHub web URLs can encode spaces and reserved characters, but encoding makes paths harder to read, copy, search, and keep stable. A safe ASCII path is more web-friendly.

## Existing names

Do not mass-rename existing names merely to make the tree look uniform. For each flagged path:

1. determine whether it is an authority anchor, external URL target, historical artifact, or ordinary content name
2. check for case-folded and Unicode-normalized collisions across the entire relative path
3. propose an ASCII mapping without silently discarding meaning, dates, versions, or provenance
4. preserve the old-to-new mapping in `MIGRATION.md` or an approved migration ledger
5. update relative Markdown links, image paths, scripts, manifests, and external references
6. use a two-step temporary `git mv` for case-only changes on case-insensitive filesystems
7. rerun the portability diagnostics on the final tree

Do not automatically transliterate names such as `résumé.md` to `resume.md` when the distinction carries meaning. Propose the mapping and let the owner approve it. If a public URL or external automation depends on the old path, retain a compatibility anchor or choose a different safe target.

## Portability diagnostics

The bundled inventory script reports these conditions without changing files:

- Windows-forbidden or control characters
- trailing spaces or periods
- Windows-reserved device basenames
- spaces, uppercase, non-ASCII, URL-reserved, and other nonconforming ordinary names
- case-folded and NFC-normalized path collisions
- long path segments and long relative paths

Treat diagnostics as findings for the plan. They are not permission to rename or delete.
