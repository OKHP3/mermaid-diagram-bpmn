---
name: foundry-architecture
description: Foundry Phase 1 intent, scope boundary, and brand decision for okhp3-replit-repl-janitor.
---

# Foundry architecture

## Intent

Enable an agent to audit and tidy one Replit workspace's Git checkout safely,
distinguishing hosted PR evidence from local Git facts and requiring exact
owner approval before destructive cleanup.

## Scope boundary

**In scope:** one-time branch/PR classification for one checkout, Replit branch
pattern recognition as a hint, naming and detritus audits, explicit cleanup
plans, and verified execution of approved lines.

**Out of scope:** scheduled maintenance, multi-clone reconciliation, repository
re-architecture, autonomous destructive actions, history rewriting, and
external publication.

## Brand decision

This is an OKHP3-attributed skill. It uses the full YAML metadata block, exact
brand header, exact About footer, and MIT license required by the OKHP3 Foundry.

## Rename decision

`okhp3-replit-repl-janitor` replaces `okhp3-repl-repo-janitor`. The new name
aligns with the `okhp3-replit-*` family while preserving the narrow promise:
janitor work for one Repl, not a general repository organizer or recurring
garden.