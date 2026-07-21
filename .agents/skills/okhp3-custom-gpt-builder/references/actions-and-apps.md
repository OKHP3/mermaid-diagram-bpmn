# Actions and Apps Reference

## Current-platform verification rule

GPT Builder integration capabilities change frequently. Before stating that a Custom GPT can or cannot combine Actions, Apps, connectors, MCP tools, specific auth modes, plan features, Pro-mode behavior, endpoint limits, or publishing requirements, verify against current official OpenAI documentation or the live Builder UI. If not verified, state the claim as an assumption or design constraint to confirm.

## Integration decision model

Custom GPT integrations usually fall into two broad categories:

| Surface | What It Is | Typical Builder | Typical Auth |
|---|---|---|---|
| **Actions** | OpenAPI-defined API calls configured for a GPT | You / your team | None, API key, or OAuth |
| **Apps / connectors / MCP-style integrations** | Platform-native or third-party integrations exposed by the ChatGPT product surface | OpenAI / third parties / workspace admins | User or workspace connection |

Some Builder states may require choosing between custom Actions and platform Apps/connectors. Treat this as a **current-platform constraint to verify**, not a timeless law.

## When to use Actions

Use Actions when:

- You own or can govern the API.
- You need deterministic operation IDs.
- You need precise request/response shape control.
- You can maintain the OpenAPI schema.
- You need custom business workflow execution not covered by platform-native Apps/connectors.
- You can support authentication, error handling, privacy policy, and operational monitoring.

## When to use Apps/connectors

Use Apps/connectors when:

- A prebuilt integration covers the need.
- The organization already governs the target system through workspace controls.
- The user benefits from familiar OAuth or workspace connection flows.
- You do not want to maintain a custom API or OpenAPI schema.
- Enterprise governance matters more than custom operation design.

## OpenAPI schema requirements for Actions

Actions use OpenAPI specs, commonly 3.0 or 3.1. The model reads the schema to decide which operation fits the user's request. Write endpoint and parameter descriptions for the model, not for humans.

Before publishing hard limits, verify current documentation for:

- Endpoint description length.
- Parameter description length.
- Request and response payload size.
- Supported authentication modes.
- Supported OpenAPI version.
- Timeout behavior.
- Builder validation behavior.

### Minimal pattern

```yaml
openapi: 3.1.0
info:
  title: Example Review API
  version: 1.0.0
servers:
  - url: https://api.example.com
paths:
  /items/{itemId}:
    get:
      operationId: getItem
      summary: Retrieve an item for review.
      description: Use when the user provides an item ID and asks for item details.
      parameters:
        - in: path
          name: itemId
          required: true
          schema:
            type: string
          description: The unique item identifier.
      responses:
        "200":
          description: Item data returned successfully.
```

## Consequential actions

For operations with real-world side effects, use the platform’s current consequential-action mechanism if available. Historically, GPT Actions have used `x-openai-isConsequential`; verify the current syntax before relying on it.

Design rule:

- Read-only operations should be safe to call without user confirmation.
- Mutating operations should require explicit user confirmation.
- Do not let a GPT silently create, update, delete, purchase, send, publish, or commit anything consequential.

## Production constraints to design for

Even when exact limits change, the engineering posture is stable:

| Constraint Area | Design Principle |
|---|---|
| Transport | Use HTTPS/TLS on standard secure ports. |
| Timeout | Respond quickly; design for failure before platform timeout. |
| Rate limits | Return clear 429s and retry guidance. |
| Payload size | Keep responses compact and purpose-built. |
| Auth | Prefer least privilege. |
| Logging | Avoid logging secrets or unnecessary user data. |
| Errors | Return model-readable error messages. |

## Authentication setup

### No auth

Use only for public, non-sensitive APIs.

### API key

Use when the GPT acts through a service account or protected backend. Treat keys as secrets. Rotate if exposed. Do not put secrets in instructions, knowledge files, examples, or repo commits.

### OAuth

Use when the action must operate on behalf of an end user. Verify:

- Client ID and client secret handling.
- Authorization URL.
- Token URL.
- Scopes.
- Redirect URL.
- State parameter behavior.
- Refresh token behavior.
- Fresh-account onboarding.

OAuth is often the highest-friction part of GPT Action deployment.

## Privacy policy and publishing

Public GPTs or widely shared GPTs that call external APIs commonly require a publicly accessible Privacy Policy URL. Verify current publishing requirements before release.

A credible privacy policy should explain:

- What data is sent to the external service.
- Why the data is sent.
- Whether the data is stored.
- Who operates the API.
- How users can request deletion or support.
- What third parties receive the data.

## Tool policy text for GPT instructions

Use a compact rule block like this:

```markdown
# Tool Policy
Use Actions only when the user asks for [specific workflow] and provides [required inputs].
Before any operation that changes external data, summarize the intended action and ask for confirmation.
If the action fails, report the failure and do not fabricate results.
If current platform support for the required integration is unclear, state that it must be verified in GPT Builder before release.
```

## Failure modes to catch

- Assuming current platform constraints are permanent.
- Combining Apps and Actions without verifying support.
- Mutating data without confirmation.
- Vague operation IDs such as `doTask` or `submit`.
- Endpoint descriptions written like marketing copy.
- OAuth configured only for the builder’s own account.
- API returns giant payloads that swamp context.
- Errors are human-readable but not model-readable.
- Public GPT with external API but no privacy policy.
- Secrets stored in repo, instructions, or uploaded files.
