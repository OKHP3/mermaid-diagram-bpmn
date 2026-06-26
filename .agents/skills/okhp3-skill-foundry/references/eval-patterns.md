# Eval Patterns -- Evidence Anchoring and Expectation Design

**Authority:** This document defines what a good Foundry eval expectation looks like.
Derived from 30 live executor runs across five ARE skills.

---

## The 4-expectation rule

Each eval test case gets exactly 4 binary expectations.

**Why 4?**
- Fewer than 4: a lucky response can pass by covering only the most obvious content.
- More than 4: a single run's noise (executor taking one path vs another) dominates the pass_rate.
- 4 is the minimum set that requires specific, distinct knowledge to pass all of them.

---

## Evidence anchoring

An expectation is evidence-anchored if it can only be graded by finding something specific in the response -- not by inference, paraphrase, or general correctness.

The grader must be able to write: "PASS -- response contains `<exact string or function name>`" or "FAIL -- response does not contain `<exact string>`, instead says `<what it said>`."

### The anchoring hierarchy (strongest to weakest)

1. **Exact string** -- an attribution phrase, an error message, a configuration string. The strongest anchor. Grading is trivial.
   - Example: `"Response specifies the exact attribution text: 'Description via Wikipedia (CC BY-SA 3.0)'"`

2. **Function or class name** -- a specific identifier the skill defines. Grading is unambiguous.
   - Example: `"Response references the isLdsBibleRef function"`

3. **API endpoint** -- a specific URL or URL pattern.
   - Example: `"Response provides GET https://scriptures.nephi.org/verses/{reference}"`

4. **Data structure** -- a specific field name, array name, or type.
   - Example: `"Response mentions the MERCURY_RETROGRADE array"`

5. **Return shape** -- a specific TypeScript type with named fields.
   - Example: `"Response shows { retrograde: boolean, endDate: string | null } return shape"`

6. **Numeric fact** -- a count, a percentage, a version number the skill specifies.
   - Example: `"Response gives the book count range: 76-78 books"`

Avoid anchoring on concepts, approaches, or styles -- these are too weak and the without-skill baseline will pass them.

---

## Good vs bad expectations -- ARE examples

### celestial-data eval-2 (Mercury retrograde)

BAD: "Response correctly explains Mercury retrograde for a wellness tracker."
-- Passes from general knowledge. No discrimination.

GOOD: "Response mentions the hardcoded MERCURY_RETROGRADE array with ephemeris sources."
-- The array name is skill-specific. Without-skill: 0/4 (failed all four).

GOOD: "Response shows the { retrograde: boolean, endDate: string | null } return shape."
-- The field names endDate and the nullable string type are skill-specific.

---

### tradition-observance-calendar eval-3 (Wikipedia attribution)

BAD: "Response includes appropriate Wikipedia attribution."
-- Any response crediting Wikipedia passes this. No discrimination.

GOOD: "Response specifies the exact attribution text: 'Description via Wikipedia (CC BY-SA 3.0)'"
-- Without-skill said "From Wikipedia, the free encyclopedia" -- different string, failed.

---

### cross-tradition-compare eval-2 (proportional representation rule)

BAD: "Response explains the representation rule for traditions."
-- Without-skill invented an "equitable distribution" rule and would have passed this.

GOOD: "Response cites US population shares from Pew Research Center."
-- Without-skill had no Pew citation. The specific attribution is skill-only.

---

## The discrimination test

Before finalizing expectations, run this mental test for each one:

> "Could a capable LLM answer this correctly from training data alone, without reading the skill?"

If yes: the expectation is not anchored enough. Tighten it.

The target: without-skill should pass 0-1 of 4 expectations on most evals. If without-skill passes 2+ consistently, the evals are measuring the LLM, not the skill.

---

## Eval prompt design

Eval prompts should be:

- **Realistic** -- the kind of thing a developer actually types, not an abstract capability test.
- **Concrete** -- reference a specific use case, not a general domain.
- **Narrow** -- test one capability, not everything the skill knows.
- **Developer-voiced** -- "How do I fetch John 3:16 from bible-api.com?" not "Demonstrate fetching a Bible verse."

### Examples from the ARE eval set

GOOD: "A user typed 'D&C 76:22' into my verse lookup. My app supports LDS denomination. Walk me through how the routing works -- does it go to bible-api.com or somewhere else?"
-- Concrete, developer-voiced, tests a specific routing path.

GOOD: "My user clicked on Rosh Hashanah in the calendar. I need to show them a description from Wikipedia. How do I fetch it and what attribution do I need to display?"
-- Tests the Wikipedia endpoint AND the exact attribution string. Two anchors in one prompt.

BAD: "Explain the verse lookup API for all traditions."
-- Too broad. No discriminating anchor. Any response might pass.

---

## Eval ID naming convention

```
evals/evals.json      -- all 3 prompts + expectations
eval-1/               -- "moon-phase-widget" or similar descriptive name
eval-2/
eval-3/
```

Use a human-readable name in the directory, not just "eval-1". The workspace is easier to navigate and the benchmark notes are more legible.

---

## The evals.json schema

```json
{
  "skill_name": "okhp3-<name>",
  "skill_version": "1.0.0",
  "evals": [
    {
      "id": 1,
      "name": "descriptive-name-here",
      "prompt": "The developer's question",
      "expectations": [
        { "id": 1, "text": "Expectation text" },
        { "id": 2, "text": "Expectation text" },
        { "id": 3, "text": "Expectation text" },
        { "id": 4, "text": "Expectation text" }
      ]
    }
  ]
}
```
