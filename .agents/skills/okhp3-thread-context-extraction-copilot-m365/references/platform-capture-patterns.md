# Microsoft Copilot Capture Patterns

Reviewed: 2026-07-21

## Verified current structure

Microsoft documents a `Message Copilot` compose box with Add and manage sources.
Prompts can reference files, people, meetings, and email. Responses can use work
data, web data, or attached content. Copilot Pages is an editable, shareable
canvas created from Copilot responses and can appear beside Copilot Chat.

Sources:

- https://support.microsoft.com/en-us/microsoft-365-copilot/get-started-with-microsoft-365-copilot-chat
- https://support.microsoft.com/en-us/microsoft-365-copilot/add-content-to-microsoft-365-copilot-chat-prompts
- https://support.microsoft.com/en-us/microsoft-365-copilot/refer-to-specific-files-and-more-in-microsoft-365-copilot
- https://support.microsoft.com/en-us/microsoft-365-copilot/what-information-does-copilot-use-to-answer-my-prompt
- https://support.microsoft.com/en-us/microsoft-365-copilot/get-started-with-microsoft-365-copilot-pages

## Paste-boundary heuristics

1. Prefer explicit `You`, `User`, `Copilot`, or structured role metadata.
2. Treat `Message Copilot` and Add/manage-source controls as composer chrome.
3. A response with citations/reference chips and response actions remains one
   assistant turn; source chips are separate `citation` or `file` elements.
4. A Copilot Page is a separate `canvas` element attached to the response that
   created or updated it. Do not treat the Page as ordinary response prose.
5. Work/web grounding, agent selection, and tenant context are generation
   metadata. Record them only when supplied.

## Rich-element handling

- Work source chips: type as file, email, meeting, person, chat, Page, or unknown;
  record display label and private locator handling without exposing tenant URLs.
- Citation/reference: attach to the supported claim or response and mark whether
  the source content is supplied, accessible, or only referenced.
- Copilot Page: capture title, version/snapshot, supplied content, and link state.
- Generated Word/PowerPoint/Excel/Designer content is a separate `generated_file`
  or `image`, not proof that the destination file was saved.
- Tenant, client, and employer material defaults to `needs-review` or
  `private-only` before repository retention.
