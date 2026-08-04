// @vitest-environment happy-dom
// Tests the PnsBadge component with real PNS_TRANSITIONS data — no mocks.
// Focus: RACI and SIPOC skills both read PNS.md [modeled] (before: "modeled",
// after: null). Confirms the badge renders the "modeled" status text and does
// NOT render a "sets" arrow for these two read-only governance skills.
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { PnsBadge } from '@/components/skills/PnsBadge';

const RACI_ID  = 'okhp3-raci-governance-matrix';
const SIPOC_ID = 'okhp3-sipoc-generation';

describe('PnsBadge — RACI governance skill (before: "modeled", after: null)', () => {
  it('compact mode renders the "modeled" before-status text', () => {
    const { getByText } = render(<PnsBadge skillId={RACI_ID} />);
    expect(getByText('modeled')).not.toBeNull();
  });

  it('compact mode does not render a "↓ sets" arrow (after is null)', () => {
    const { queryByText } = render(<PnsBadge skillId={RACI_ID} />);
    expect(queryByText(/↓ sets/)).toBeNull();
  });

  it('verbose mode renders the "modeled" before-status text', () => {
    const { getByText } = render(<PnsBadge skillId={RACI_ID} verbose />);
    expect(getByText('modeled')).not.toBeNull();
  });

  it('verbose mode renders the "reads" label (not "starts") because before is non-null', () => {
    const { getByText } = render(<PnsBadge skillId={RACI_ID} verbose />);
    expect(getByText('reads')).not.toBeNull();
  });

  it('verbose mode does not render a "sets" row (after is null)', () => {
    const { queryByText } = render(<PnsBadge skillId={RACI_ID} verbose />);
    expect(queryByText('sets')).toBeNull();
  });
});

describe('PnsBadge — SIPOC generation skill (before: "modeled", after: null)', () => {
  it('compact mode renders the "modeled" before-status text', () => {
    const { getByText } = render(<PnsBadge skillId={SIPOC_ID} />);
    expect(getByText('modeled')).not.toBeNull();
  });

  it('compact mode does not render a "↓ sets" arrow (after is null)', () => {
    const { queryByText } = render(<PnsBadge skillId={SIPOC_ID} />);
    expect(queryByText(/↓ sets/)).toBeNull();
  });

  it('verbose mode renders the "modeled" before-status text', () => {
    const { getByText } = render(<PnsBadge skillId={SIPOC_ID} verbose />);
    expect(getByText('modeled')).not.toBeNull();
  });

  it('verbose mode renders the "reads" label (not "starts") because before is non-null', () => {
    const { getByText } = render(<PnsBadge skillId={SIPOC_ID} verbose />);
    expect(getByText('reads')).not.toBeNull();
  });

  it('verbose mode does not render a "sets" row (after is null)', () => {
    const { queryByText } = render(<PnsBadge skillId={SIPOC_ID} verbose />);
    expect(queryByText('sets')).toBeNull();
  });
});
