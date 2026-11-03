// A daily maintenance run must not create a candidate for a date-only change.
export function retainUnchangedManifestDate(next, previous) {
  if (!previous?.generatedDate) return next;
  const { generatedDate: nextDate, ...nextContent } = next;
  const { generatedDate: previousDate, ...previousContent } = previous;
  return JSON.stringify(nextContent) === JSON.stringify(previousContent)
    ? { ...next, generatedDate: previousDate }
    : next;
}
