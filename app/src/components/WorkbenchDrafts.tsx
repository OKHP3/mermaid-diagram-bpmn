import type { DraftSaveState, WorkbenchDraft } from "@/hooks/useWorkbenchDrafts";

export function WorkbenchDrafts({ drafts, saveState, onRestore, onForget }: {
  drafts: WorkbenchDraft[];
  saveState: DraftSaveState;
  onRestore: (draft: WorkbenchDraft) => void;
  onForget: (draft: WorkbenchDraft) => void;
}) {
  return <div className="workbench-drafts">
    <p role="status" aria-live="polite" data-testid="draft-save-status">
      {saveState === "saved" ? "Draft saved in this browser. Download source for a durable backup."
        : saveState === "removed" ? "This draft's saved copy changed in another tab. Download source or edit to save a new copy."
          : saveState === "unavailable" ? "Browser storage is unavailable. Download source before leaving."
          : saveState === "too-large" ? "This draft is too large for browser recovery. Download source before leaving."
            : "Edits are saved in this browser only. Download source to keep a backup."}
    </p>
    {drafts.length > 0 && <details className="workbench-recovery" data-testid="draft-recovery">
      <summary>Recover saved work ({drafts.length})</summary>
      <p className="text-sm text-muted-foreground py-2">Each editing session keeps a separate draft. Restoring opens a copy; other tabs keep their work.</p>
      <ul>
        {drafts.map(draft => <li key={draft.id}>
          <span><strong>{draft.source.match(/^accTitle:\s*(.+)$/m)?.[1] || "Untitled process"}</strong><br />
            <time dateTime={new Date(draft.savedAt).toISOString()}>{new Date(draft.savedAt).toLocaleString()}</time></span>
          <div>
            <button type="button" className="workbench-action" onClick={() => onRestore(draft)}>Restore draft</button>
            <button type="button" className="workbench-action" onClick={() => {
              if (window.confirm("Remove this saved draft from this browser? Download its source first if you need to keep it.")) onForget(draft);
            }}>Remove draft</button>
          </div>
        </li>)}
      </ul>
    </details>}
  </div>;
}
