import { useCallback, useEffect, useRef, useState } from "react";

export const DRAFT_PREFIX = "bpmn-workbench:draft:v1:";
export const MAX_DRAFT_LENGTH = 500_000;
export interface WorkbenchDraft {
  version: 1;
  id: string;
  source: string;
  savedAt: number;
}
export type DraftSaveState = "idle" | "saved" | "unavailable" | "too-large" | "removed";

function readDrafts(): WorkbenchDraft[] {
  const drafts: WorkbenchDraft[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (!key?.startsWith(DRAFT_PREFIX)) continue;
    try {
      const value: unknown = JSON.parse(localStorage.getItem(key) ?? "null");
      if (!value || typeof value !== "object") continue;
      const draft = value as Partial<WorkbenchDraft>;
      if (draft.version === 1 && typeof draft.id === "string" && key === DRAFT_PREFIX + draft.id
        && typeof draft.source === "string" && draft.source.length <= MAX_DRAFT_LENGTH
        && typeof draft.savedAt === "number" && draft.savedAt >= 0 && draft.savedAt <= 8.64e15) {
        drafts.push(draft as WorkbenchDraft);
      }
    } catch { /* Ignore malformed records without changing retained content. */ }
  }
  return drafts.sort((a, b) => b.savedAt - a.savedAt);
}

/** Each mounted editor owns its key, including duplicated tabs. Shared drafts
 * are recovery inputs only; another tab can never silently replace this source. */
export function useWorkbenchDrafts() {
  const id = useRef<string | null>(null);
  const [drafts, setDrafts] = useState<WorkbenchDraft[]>([]);
  const [saveState, setSaveState] = useState<DraftSaveState>("idle");
  const unsaved = useRef(false);

  const refresh = useCallback(() => {
    try { setDrafts(readDrafts().filter(draft => draft.id !== id.current)); }
    catch { setSaveState("unavailable"); }
  }, []);

  useEffect(() => {
    refresh();
    const onStorage = (event: StorageEvent) => {
      if (id.current && (event.key === null || event.key === DRAFT_PREFIX + id.current)) {
        id.current = null;
        unsaved.current = true;
        setSaveState("removed");
      }
      if (event.key === null || event.key.startsWith(DRAFT_PREFIX)) refresh();
    };
    const onUnload = (event: BeforeUnloadEvent) => {
      if (!unsaved.current) return;
      event.preventDefault();
      event.returnValue = "";
    };
    const onNavigate = (event: MouseEvent) => {
      if (!unsaved.current || event.defaultPrevented || event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
      const anchor = (event.target as Element | null)?.closest?.("a");
      if (!anchor || anchor.hasAttribute("download") || (anchor.target && anchor.target !== "_self")) return;
      const target = new URL(anchor.href, window.location.href);
      if (target.origin !== window.location.origin || (target.pathname === window.location.pathname && target.search === window.location.search)) return;
      if (!window.confirm("This draft could not be saved in this browser. Leave without downloading its source?")) {
        event.preventDefault();
        event.stopPropagation();
      }
    };
    window.addEventListener("storage", onStorage);
    window.addEventListener("beforeunload", onUnload);
    document.addEventListener("click", onNavigate, true);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("beforeunload", onUnload);
      document.removeEventListener("click", onNavigate, true);
    };
  }, [refresh]);

  const save = useCallback((source: string) => {
    unsaved.current = true;
    if (source.length > MAX_DRAFT_LENGTH) { setSaveState("too-large"); return false; }
    try {
      id.current ??= crypto.randomUUID();
      const draft: WorkbenchDraft = { version: 1, id: id.current, source, savedAt: Date.now() };
      localStorage.setItem(DRAFT_PREFIX + id.current, JSON.stringify(draft));
      unsaved.current = false;
      setSaveState("saved");
      return true;
    } catch {
      setSaveState("unavailable");
      return false;
    }
  }, []);

  const start = useCallback(() => {
    id.current = null;
    unsaved.current = false;
    setSaveState("idle");
    refresh();
  }, [refresh]);

  const forget = useCallback((draft: WorkbenchDraft) => {
    try { localStorage.removeItem(DRAFT_PREFIX + draft.id); refresh(); }
    catch { setSaveState("unavailable"); }
  }, [refresh]);

  return { drafts, saveState, save, start, forget };
}
