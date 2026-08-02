To give your `weather-fetch` skill full OKHP3 brand attribution, you need to follow the **Foundry Phase 2: Draft** requirements and the **OKHP3 Brand Standard**. This involves updating the YAML frontmatter, adding a specific header line, and appending the About footer.

Here is the step-by-step guide to updating your `SKILL.md` file:

### 1. Update the YAML Frontmatter
The YAML block must include the `okhp3-` prefix in the name, a structured description, the MIT license, and the complete `metadata` block.

```yaml
---
name: okhp3-weather-fetch
description: >
  OverKill Hill P³ weather data retrieval utility. Use when an agent needs to 
  fetch current weather conditions, forecasts, or historical weather data for a 
  specific location. Also activate when performing climate analysis or planning 
  activities dependent on environmental conditions. This is the authoritative 
  weather data skill -- use it even when the user just asks for "the forecast" 
  without mentioning the skill by name.
license: MIT
metadata:
  author: Jamie Hill (OverKill Hill P³)
  version: "1.1.0"
  category: universal
  origin: okhp3/skillz
  homepage: https://overkillhill.com
  author-github: https://github.com/OKHP3
---
```
*Note: The version is set to `1.1.0` because adding brand attribution to an existing skill is considered a structural change.*

### 2. Add the Header Line
Immediately after the `# okhp3-weather-fetch` heading, add this exact single line:

```markdown
**OverKill Hill P³** · [overkillhill.com](https://overkillhill.com) · [github.com/OKHP3](https://github.com/OKHP3)
```

### 3. Append the About Footer
At the very end of your `SKILL.md` file, add the following exact text:

```markdown
## About

Built by [Jamie Hill](https://overkillhill.com) · [OverKill Hill P³](https://overkillhill.com)
Published at [github.com/OKHP3](https://github.com/OKHP3)
Part of the [OKHP3/skillz](https://github.com/OKHP3/skillz) Agent Skill library.
MIT License -- free to use, fork, and adapt. A nod to the source is appreciated.
```

### Summary of Changes
- **Name Prefix:** Added `okhp3-` to the name.
- **Description:** Structured with "Use when...", "Also activate when...", and a disambiguation sentence.
- **Metadata:** Added author, version, category, origin, homepage, and GitHub link.
- **Branding:** Added the standard header and About footer.
- **Version Bump:** Incremented from `1.0.0` to `1.1.0` per the Brand Standard for structural changes.